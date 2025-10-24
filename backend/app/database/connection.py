"""
Database connection and session management.
Handles database engine creation, session management, and initialization.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator

from app.settings import settings
from app.utils.logger import get_logger
from .schemas import Base

logger = get_logger(__name__)

# Create database engine
# For Neon PostgreSQL, use the connection string from settings
if settings.DATABASE_URL:
    # Handle both postgresql:// and postgres:// schemes
    database_url = settings.DATABASE_URL
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    logger.info("Initializing database engine with PostgreSQL")
    logger.debug(f"Database URL: {database_url.split('@')[1] if '@' in database_url else 'configured'}")
    
    engine = create_engine(
        database_url,
        pool_pre_ping=True,  # Verify connections before using them
        pool_size=10,  # Connection pool size
        max_overflow=20,  # Additional connections that can be created
        echo=settings.DEBUG,  # Log SQL statements in debug mode
    )
    logger.info("PostgreSQL database engine created successfully")
else:
    # Fallback to SQLite for local development if no DATABASE_URL
    logger.warning("DATABASE_URL not configured - Using SQLite for development")
    logger.warning("SQLite is not recommended for production use")
    
    engine = create_engine(
        "sqlite:///./pdf_extraction.db",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
        echo=settings.DEBUG,
    )
    logger.info("SQLite database engine created")

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Yields:
        Database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database - create all tables.
    
    This should be called on application startup.
    Creates all tables defined in Base metadata if they don't exist.
    """
    try:
        logger.info("="*80)
        logger.info("DATABASE INITIALIZATION - Starting")
        logger.info("="*80)
        
        Base.metadata.create_all(bind=engine)
        
        # Get table count
        table_count = len(Base.metadata.tables)
        logger.info(f"Database schema verified | Tables: {table_count}")
        logger.info(f"Tables: {', '.join(Base.metadata.tables.keys())}")
        logger.info("Database initialization completed successfully")
        logger.info("="*80)
    except Exception as e:
        logger.error("="*80)
        logger.error("DATABASE INITIALIZATION FAILED")
        logger.error(f"Error: {str(e)}")
        logger.error("="*80, exc_info=True)
        raise


def drop_all_tables() -> None:
    """
    Drop all tables from database.
    
    WARNING: This will delete all data. Use only for development/testing.
    """
    logger.warning("="*80)
    logger.warning("DROPPING ALL TABLES - THIS WILL DELETE ALL DATA")
    logger.warning("="*80)
    
    Base.metadata.drop_all(bind=engine)
    
    logger.info("All tables dropped successfully")


def reset_db() -> None:
    """
    Reset database by dropping and recreating all tables.
    
    WARNING: This will delete all data. Use only for development/testing.
    """
    logger.warning("DATABASE RESET INITIATED - ALL DATA WILL BE LOST")
    
    drop_all_tables()
    init_db()
    
    logger.info("Database reset completed successfully")
