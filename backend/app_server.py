"""
Main FastAPI application for PDF data extraction.
Provides RESTful API endpoints for financial document processing.
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, Query
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional
import os
from datetime import datetime
import shutil
from pathlib import Path
import time
import uuid

from app.settings import settings
from app.services.document_parser import PDFExtractor
from app.services.ai_processor import GeminiExtractor
from app.services.spreadsheet_creator import ExcelGenerator
from app.database import init_db, get_db
from app.database.operations import (
    UploadedFileService,
    ExtractionResultService,
    ExtractionLogService,
    JobStatusService
)
from app.database.schemas import JobStatusEnum, LogLevelEnum
from app.utils.logger import get_logger

# Initialize logger
logger = get_logger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Fund Report PDF Extractor",
    description="Extract structured data from fund report PDFs using AI",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure directories exist
Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
Path(settings.OUTPUT_DIR).mkdir(exist_ok=True)


@app.on_event("startup")
async def startup_event():
    """Initialize application on startup."""
    logger.info("="*80)
    logger.info("FINANCIAL DOCUMENT EXTRACTION SERVICE - STARTING")
    logger.info("="*80)
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug Mode: {settings.DEBUG}")
    logger.info(f"CORS Origins: {settings.CORS_ORIGINS}")
    
    # Initialize database
    init_db()
    logger.info("Application initialized successfully")
    logger.info("="*80)


@app.get("/")
async def root():
    """Root endpoint - Health check."""
    logger.debug("Health check requested")
    return {
        "message": "Financial Document Extraction API",
        "version": "2.0.0",
        "status": "operational",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint with database connectivity verification.
    
    Returns:
        dict: Health status and system information
    """
    logger.debug("Performing health check with database verification")
    
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "connected"
        logger.debug("Database connection verified successfully")
    except Exception as e:
        db_status = "disconnected"
        logger.error(f"Database health check failed: {str(e)}", exc_info=True)
        
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }


@app.post("/api/extract")
async def extract_data(
    file: UploadFile = File(...),
    template_id: str = Form(default="fund_report_v1"),
    db: Session = Depends(get_db)
):
    """
    Extract structured data from uploaded PDF financial document.
    
    Args:
        file: Uploaded PDF file
        template_id: Template ID for extraction format
        db: Database session
        
    Returns:
        Job ID and extraction results with metadata
    """
    start_time = time.time()
    job_id = str(uuid.uuid4())
    
    logger.info("="*100)
    logger.info(f"NEW EXTRACTION REQUEST | Job ID: {job_id}")
    logger.info(f"File: {file.filename} | Template: {template_id}")
    logger.info("="*100)
    
    # Validate file
    if not file.filename.endswith('.pdf'):
        logger.warning(f"[{job_id}] Invalid file type rejected: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Check API key
    if not settings.GEMINI_API_KEY:
        logger.critical("[{job_id}] Gemini API key not configured")
        raise HTTPException(
            status_code=500,
            detail="Gemini API key not configured. Please set GEMINI_API_KEY in .env file"
        )
    
    # Generate unique filenames
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    safe_filename = file.filename.replace(" ", "_").replace(".pdf", "")
    pdf_filename = f"{safe_filename}_{timestamp}.pdf"
    pdf_path = os.path.join(settings.UPLOAD_DIR, pdf_filename)
    excel_filename = f"{safe_filename}_extracted_{timestamp}.xlsx"
    excel_path = os.path.join(settings.OUTPUT_DIR, excel_filename)
    
    # Get file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Seek back to start
    
    db_file = None
    db_job = None
    
    try:
        # Save uploaded file first
        logger.info(f"[{job_id}] PHASE 1: File Upload - Saving to disk")
        logger.debug(f"[{job_id}] Destination: {pdf_path} | Size: {file_size / 1024:.2f} KB")
        
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        logger.info(f"[{job_id}] File saved successfully")
        
        # Create uploaded file record in database
        logger.debug(f"[{job_id}] Creating database record for uploaded file")
        db_file = UploadedFileService.create(
            db=db,
            filename=pdf_filename,
            original_filename=file.filename,
            file_path=pdf_path,
            file_size=file_size
        )
        
        # Now we can create logs with the proper file_id
        ExtractionLogService.create(
            db, db_file.id, f"Starting extraction for {file.filename}", 
            LogLevelEnum.INFO, "initialization"
        )
        
        # Create job status record
        db_job = JobStatusService.create(db=db, file_id=db_file.id, job_id=job_id)
        
        ExtractionLogService.create(
            db, db_file.id, f"File uploaded successfully: {pdf_filename}", 
            LogLevelEnum.INFO, "upload"
        )
        
        # Update job status: Processing
        JobStatusService.update_status(
            db, job_id, JobStatusEnum.PROCESSING, 
            "extracting_text", 20
        )
        
        # Step 1: Extract text from PDF
        logger.info(f"[{job_id}] PHASE 2: Text Extraction - Processing PDF")
        step_start = time.time()
        
        pdf_extractor = PDFExtractor()
        extracted_text = pdf_extractor.extract_text_from_pdf(pdf_path)
        
        step_duration = int((time.time() - step_start) * 1000)
        logger.info(f"[{job_id}] Text extraction completed | Characters: {len(extracted_text):,} | Duration: {step_duration}ms")
        ExtractionLogService.create(
            db, db_file.id, 
            f"Extracted {len(extracted_text)} characters from PDF",
            LogLevelEnum.INFO, "text_extraction", step_duration
        )
        
        # Update job status
        JobStatusService.update_status(
            db, job_id, JobStatusEnum.PROCESSING, 
            "processing_with_ai", 40
        )
        
        # Step 2: Send to Gemini for data extraction
        logger.info(f"[{job_id}] PHASE 3: AI Processing - Extracting structured data with Gemini")
        logger.debug(f"[{job_id}] Model: {settings.GEMINI_MODEL}")
        step_start = time.time()
        
        gemini_extractor = GeminiExtractor()
        structured_data = gemini_extractor.extract_with_retry(extracted_text, max_retries=2)
        
        step_duration = int((time.time() - step_start) * 1000)
        logger.info(f"[{job_id}] AI processing completed | Duration: {step_duration}ms")
        ExtractionLogService.create(
            db, db_file.id, 
            f"AI extraction completed using {settings.GEMINI_MODEL}",
            LogLevelEnum.INFO, "ai_processing", step_duration
        )
        
        # Update job status
        JobStatusService.update_status(
            db, job_id, JobStatusEnum.PROCESSING, 
            "generating_excel", 70
        )
        
        # Step 3: Generate Excel file
        logger.info(f"[{job_id}] PHASE 4: Excel Generation - Creating spreadsheet")
        step_start = time.time()
        
        excel_generator = ExcelGenerator()
        output_path = excel_generator.generate_excel(structured_data, excel_path)
        
        step_duration = int((time.time() - step_start) * 1000)
        logger.info(f"[{job_id}] Excel generation completed | File: {excel_filename} | Duration: {step_duration}ms")
        ExtractionLogService.create(
            db, db_file.id, 
            f"Excel file generated: {excel_filename}",
            LogLevelEnum.INFO, "excel_generation", step_duration
        )
        
        # Calculate processing time
        total_processing_time = time.time() - start_time
        
        # Count sheets if structured_data is available
        total_sheets = 0
        if isinstance(structured_data, dict):
            total_sheets = len(structured_data.get("sheets", []))
        
        # Create extraction result record
        db_result = ExtractionResultService.create(
            db=db,
            file_id=db_file.id,
            excel_filename=excel_filename,
            excel_path=excel_path,
            extracted_data=structured_data if isinstance(structured_data, dict) else None,
            processing_time=total_processing_time,
            total_characters_extracted=len(extracted_text),
            total_sheets_generated=total_sheets,
            gemini_model_used=settings.GEMINI_MODEL
        )
        
        # Update job status: Completed
        JobStatusService.update_status(
            db, job_id, JobStatusEnum.COMPLETED, 
            "completed", 100
        )
        
        ExtractionLogService.create(
            db, db_file.id, 
            f"Extraction completed successfully in {total_processing_time:.2f}s",
            LogLevelEnum.INFO, "completion"
        )
        
        logger.info("="*100)
        logger.info(f"EXTRACTION COMPLETED SUCCESSFULLY | Job ID: {job_id}")
        logger.info(f"Total Time: {total_processing_time:.2f}s | Sheets: {total_sheets} | Characters: {len(extracted_text):,}")
        logger.info("="*100)
        
        return {
            "success": True,
            "message": "Data extracted successfully",
            "job_id": job_id,
            "file_id": db_file.id,
            "output_file": excel_filename,
            "download_url": f"/api/download/{excel_filename}",
            "processing_time": f"{total_processing_time:.2f}s",
            "characters_extracted": len(extracted_text),
            "sheets_generated": total_sheets
        }
        
    except Exception as e:
        logger.error("="*100)
        logger.error(f"EXTRACTION FAILED | Job ID: {job_id}")
        logger.error(f"Error: {str(e)}")
        logger.error("="*100, exc_info=True)
        
        # Log error to database if file record exists
        if db_file:
            ExtractionLogService.create(
                db, db_file.id, 
                f"Extraction failed: {str(e)}",
                LogLevelEnum.ERROR, "error"
            )
            
            # Update job status to failed
            if db_job:
                JobStatusService.update_status(
                    db, job_id, JobStatusEnum.FAILED,
                    error_message=str(e)
                )
        
        # Clean up files on error
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
        if os.path.exists(excel_path):
            os.remove(excel_path)
        
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.get("/api/download/{filename}")
async def download_file(filename: str):
    """
    Download generated Excel file.
    
    Args:
        filename: Name of the file to download
        
    Returns:
        Excel file for download
    """
    file_path = os.path.join(settings.OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security check - ensure filename doesn't contain path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    return FileResponse(
        path=file_path,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )


@app.get("/api/preview/{filename}")
async def preview_file(filename: str):
    """
    Get Excel file for preview (returns file content for browser parsing).
    
    Args:
        filename: Name of the file to preview
        
    Returns:
        Excel file content
    """
    file_path = os.path.join(settings.OUTPUT_DIR, filename)
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Security check - ensure filename doesn't contain path traversal
    if ".." in filename or "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    return FileResponse(
        path=file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "no-cache"
        }
    )


@app.get("/api/templates")
async def list_templates():
    """List available extraction templates."""
    return {
        "templates": [
            {
                "id": "fund_report_v1",
                "name": "Fund Report - Standard Template",
                "description": "9-sheet template for private equity/venture capital fund reports",
                "sheets": [
                    "Portfolio Summary",
                    "Schedule of Investments",
                    "Statement of Operations",
                    "Statement of Cashflows",
                    "PCAP Statement",
                    "Portfolio Company Profile",
                    "Portfolio Company Financials",
                    "Footnotes",
                    "Reference Values"
                ]
            }
        ]
    }


# ==================== Database Query Endpoints ====================

@app.get("/api/files")
async def list_files(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    List all uploaded files with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of uploaded files
    """
    files = UploadedFileService.get_all(db, skip=skip, limit=limit)
    return {
        "total": len(files),
        "skip": skip,
        "limit": limit,
        "files": [
            {
                "id": f.id,
                "filename": f.filename,
                "original_filename": f.original_filename,
                "file_size": f.file_size,
                "upload_timestamp": f.upload_timestamp.isoformat(),
                "has_result": f.extraction_result is not None
            }
            for f in files
        ]
    }


@app.get("/api/files/{file_id}")
async def get_file_details(
    file_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific file.
    
    Args:
        file_id: File ID
        db: Database session
        
    Returns:
        File details with extraction result and job status
    """
    db_file = UploadedFileService.get_by_id(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    result = {
        "id": db_file.id,
        "filename": db_file.filename,
        "original_filename": db_file.original_filename,
        "file_path": db_file.file_path,
        "file_size": db_file.file_size,
        "mime_type": db_file.mime_type,
        "upload_timestamp": db_file.upload_timestamp.isoformat(),
    }
    
    # Add extraction result if available
    if db_file.extraction_result:
        er = db_file.extraction_result
        result["extraction_result"] = {
            "id": er.id,
            "excel_filename": er.excel_filename,
            "excel_path": er.excel_path,
            "extraction_timestamp": er.extraction_timestamp.isoformat(),
            "processing_time": er.processing_time,
            "total_characters_extracted": er.total_characters_extracted,
            "total_sheets_generated": er.total_sheets_generated,
            "gemini_model_used": er.gemini_model_used
        }
    
    # Add job status if available
    if db_file.job_status:
        js = db_file.job_status
        result["job_status"] = {
            "job_id": js.job_id,
            "status": js.status.value,
            "current_step": js.current_step,
            "progress_percentage": js.progress_percentage,
            "created_at": js.created_at.isoformat(),
            "started_at": js.started_at.isoformat() if js.started_at else None,
            "completed_at": js.completed_at.isoformat() if js.completed_at else None,
            "error_message": js.error_message,
            "retry_count": js.retry_count
        }
    
    return result


@app.get("/api/jobs/{job_id}")
async def get_job_status(
    job_id: str,
    db: Session = Depends(get_db)
):
    """
    Get job status by job ID.
    
    Args:
        job_id: Job UUID
        db: Database session
        
    Returns:
        Job status details
    """
    db_job = JobStatusService.get_by_job_id(db, job_id)
    if not db_job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": db_job.job_id,
        "file_id": db_job.file_id,
        "status": db_job.status.value,
        "current_step": db_job.current_step,
        "progress_percentage": db_job.progress_percentage,
        "created_at": db_job.created_at.isoformat(),
        "started_at": db_job.started_at.isoformat() if db_job.started_at else None,
        "completed_at": db_job.completed_at.isoformat() if db_job.completed_at else None,
        "error_message": db_job.error_message,
        "retry_count": db_job.retry_count
    }


@app.get("/api/jobs")
async def list_jobs(
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    List all jobs with optional status filtering.
    
    Args:
        status: Filter by job status (pending, processing, completed, failed, cancelled)
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of jobs
    """
    status_enum = None
    if status:
        try:
            status_enum = JobStatusEnum(status.lower())
        except ValueError:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid status. Must be one of: {[s.value for s in JobStatusEnum]}"
            )
    
    jobs = JobStatusService.get_all(db, status=status_enum, skip=skip, limit=limit)
    
    return {
        "total": len(jobs),
        "skip": skip,
        "limit": limit,
        "filter": {"status": status} if status else None,
        "jobs": [
            {
                "job_id": j.job_id,
                "file_id": j.file_id,
                "status": j.status.value,
                "current_step": j.current_step,
                "progress_percentage": j.progress_percentage,
                "created_at": j.created_at.isoformat(),
                "completed_at": j.completed_at.isoformat() if j.completed_at else None,
                "error_message": j.error_message
            }
            for j in jobs
        ]
    }


@app.get("/api/logs/{file_id}")
async def get_file_logs(
    file_id: int,
    log_level: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    Get extraction logs for a specific file.
    
    Args:
        file_id: File ID
        log_level: Filter by log level (debug, info, warning, error, critical)
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of logs for the file
    """
    # Check if file exists
    db_file = UploadedFileService.get_by_id(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    level_enum = None
    if log_level:
        try:
            level_enum = LogLevelEnum(log_level.lower())
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid log level. Must be one of: {[l.value for l in LogLevelEnum]}"
            )
    
    logs = ExtractionLogService.get_by_file_id(
        db, file_id, log_level=level_enum, skip=skip, limit=limit
    )
    
    return {
        "file_id": file_id,
        "total": len(logs),
        "skip": skip,
        "limit": limit,
        "filter": {"log_level": log_level} if log_level else None,
        "logs": [
            {
                "id": log.id,
                "log_level": log.log_level.value,
                "message": log.message,
                "step": log.step,
                "timestamp": log.timestamp.isoformat(),
                "duration_ms": log.duration_ms,
                "extra_data": log.extra_data
            }
            for log in logs
        ]
    }


@app.get("/api/results")
async def list_results(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """
    List all extraction results with pagination.
    
    Args:
        skip: Number of records to skip
        limit: Maximum number of records to return
        db: Database session
        
    Returns:
        List of extraction results
    """
    results = ExtractionResultService.get_all(db, skip=skip, limit=limit)
    
    return {
        "total": len(results),
        "skip": skip,
        "limit": limit,
        "results": [
            {
                "id": r.id,
                "file_id": r.file_id,
                "excel_filename": r.excel_filename,
                "extraction_timestamp": r.extraction_timestamp.isoformat(),
                "processing_time": r.processing_time,
                "total_characters_extracted": r.total_characters_extracted,
                "total_sheets_generated": r.total_sheets_generated,
                "gemini_model_used": r.gemini_model_used,
                "original_filename": r.uploaded_file.original_filename if r.uploaded_file else None
            }
            for r in results
        ]
    }


@app.get("/api/results/{result_id}")
async def get_result_details(
    result_id: int,
    include_data: bool = Query(False),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific extraction result.
    
    Args:
        result_id: Result ID
        include_data: Whether to include the full extracted JSON data
        db: Database session
        
    Returns:
        Extraction result details
    """
    db_result = ExtractionResultService.get_by_id(db, result_id)
    if not db_result:
        raise HTTPException(status_code=404, detail="Result not found")
    
    result = {
        "id": db_result.id,
        "file_id": db_result.file_id,
        "excel_filename": db_result.excel_filename,
        "excel_path": db_result.excel_path,
        "extraction_timestamp": db_result.extraction_timestamp.isoformat(),
        "processing_time": db_result.processing_time,
        "total_characters_extracted": db_result.total_characters_extracted,
        "total_sheets_generated": db_result.total_sheets_generated,
        "gemini_model_used": db_result.gemini_model_used
    }
    
    if include_data and db_result.extracted_data:
        result["extracted_data"] = db_result.extracted_data
    
    return result


@app.delete("/api/files/{file_id}")
async def delete_file(
    file_id: int,
    delete_physical_files: bool = Query(True),
    db: Session = Depends(get_db)
):
    """
    Delete a file and all associated records.
    
    Args:
        file_id: File ID to delete
        delete_physical_files: Whether to also delete physical files from disk
        db: Database session
        
    Returns:
        Deletion status
    """
    db_file = UploadedFileService.get_by_id(db, file_id)
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Store paths before deletion
    pdf_path = db_file.file_path
    excel_path = None
    if db_file.extraction_result:
        excel_path = db_file.extraction_result.excel_path
    
    # Delete from database (cascade will handle related records)
    success = UploadedFileService.delete(db, file_id)
    
    # Delete physical files if requested
    files_deleted = []
    if delete_physical_files:
        if os.path.exists(pdf_path):
            os.remove(pdf_path)
            files_deleted.append(pdf_path)
        if excel_path and os.path.exists(excel_path):
            os.remove(excel_path)
            files_deleted.append(excel_path)
    
    return {
        "success": success,
        "message": f"File {file_id} and all associated records deleted",
        "physical_files_deleted": files_deleted if delete_physical_files else []
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
