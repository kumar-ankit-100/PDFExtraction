"""
PDF text extraction service using pypdf library.
Extracts text content from PDF documents for further processing.
"""

import pypdf
from typing import Optional

from app.utils.logger import get_logger

logger = get_logger(__name__)


class PDFExtractor:
    """Extract text content from PDF files using pypdf."""
    
    def __init__(self):
        """Initialize PDF extractor."""
        self.extracted_text = ""
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract all text content from a PDF file.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted text as a single string
        """
        logger.info(f"Starting PDF text extraction | File: {pdf_path}")
        
        try:
            with open(pdf_path, 'rb') as file:
                pdf = pypdf.PdfReader(file)
                pages_count = len(pdf.pages)
                
                logger.info(f"PDF loaded successfully | Pages: {pages_count}")
                
                for page_num, page in enumerate(pdf.pages, 1):
                    logger.debug(f"Extracting text from page {page_num}/{pages_count}")
                    text = page.extract_text()
                    
                    if text:
                        self.extracted_text += text + "\n\n"
                        logger.debug(f"Page {page_num} extracted | Characters: {len(text):,}")
                    else:
                        logger.warning(f"Page {page_num} contained no extractable text")
            
            # Final cleanup
            self.extracted_text = self._clean_text(self.extracted_text)
            
            logger.info(f"Text extraction completed successfully | Total characters: {len(self.extracted_text):,}")
            logger.debug(f"Preview (first 200 chars): {self.extracted_text[:200]}...")
            
            return self.extracted_text
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {str(e)}", exc_info=True)
            raise
    
    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text by removing extra whitespace.
        
        Args:
            text: Raw extracted text
            
        Returns:
            Cleaned text
        """
        # Remove multiple consecutive newlines
        text = '\n'.join(line for line in text.split('\n') if line.strip())
        
        # Remove excessive whitespace
        text = ' '.join(text.split())
        
        return text.strip()
    
    def get_text_preview(self, max_chars: int = 500) -> str:
        """
        Get a preview of the extracted text.
        
        Args:
            max_chars: Maximum characters to return
            
        Returns:
            Preview of extracted text
        """
        if not self.extracted_text:
            logger.warning("No text available for preview")
            return ""
        
        preview = self.extracted_text[:max_chars]
        if len(self.extracted_text) > max_chars:
            preview += "..."
        
        return preview
