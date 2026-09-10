import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ReLoop Backend"
    DATABASE_URL: str = "postgresql+psycopg2://user:password@localhost:5432/reloop"
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # WhatsApp Configuration
    WHATSAPP_ENABLED: bool = False
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_BUSINESS_ACCOUNT_ID: Optional[str] = None
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_VERIFY_TOKEN: Optional[str] = None
    WHATSAPP_APP_SECRET: Optional[str] = None
    WHATSAPP_API_VERSION: str = "v20.0"

    # Vision Verification Configuration
    GEMINI_API_KEY: Optional[str] = None
    VISION_VERIFICATION_ENABLED: bool = True
    GEMINI_VISION_MODEL: str = "gemini-1.5-flash"
    VISION_ACCEPT_THRESHOLD: float = 0.80
    VISION_REJECT_THRESHOLD: float = 0.80
    VISION_TIMEOUT_SECONDS: int = 20
    
    class Config:
        # Build path relative to the file location to handle different working directories
        # backend/app/core/config.py -> ../../../.env (which is backend/.env)
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
        extra = "ignore"

settings = Settings()
