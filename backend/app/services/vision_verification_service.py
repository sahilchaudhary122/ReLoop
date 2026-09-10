import abc
import json
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.batch import Item

logger = logging.getLogger(__name__)

class VerificationResult(BaseModel):
    is_ewaste: bool
    confidence: float
    category: Optional[str]
    decision: str
    provider: str
    reason: Optional[str]

class VisionVerificationProvider(abc.ABC):
    @abc.abstractmethod
    def verify_image(self, image_path: str) -> VerificationResult:
        pass

class GeminiVisionProvider(VisionVerificationProvider):
    def verify_image(self, image_path: str) -> VerificationResult:
        # Mock Gemini structured JSON request/response
        # Production would use httpx and Gemini API
        logger.info(f"Sending image to Gemini: {image_path}")
        
        # Simulate structured JSON parsing
        return VerificationResult(
            is_ewaste=True,
            confidence=0.91,
            category="mobile_phone",
            decision="ACCEPT",
            provider="gemini",
            reason="Electronic device consistent with a mobile phone"
        )

class LocalFallbackProvider(VisionVerificationProvider):
    def verify_image(self, image_path: str) -> VerificationResult:
        logger.info("Using local fallback verification")
        return VerificationResult(
            is_ewaste=False,
            confidence=0.0,
            category=None,
            decision="MANUAL_REVIEW",
            provider="manual",
            reason="No automated verification available"
        )

class VisionVerificationService:
    def __init__(self):
        self.gemini_provider = GeminiVisionProvider()
        self.fallback_provider = LocalFallbackProvider()

    def verify_item_photo(self, db: Session, item_id: int) -> Item:
        item = db.query(Item).filter(Item.id == item_id).first()
        if not item or not item.photo_url:
            raise ValueError("Item or photo not found")

        try:
            # Try Gemini if enabled
            if settings.VISION_VERIFICATION_ENABLED:
                result = self.gemini_provider.verify_image(item.photo_url)
                
                # Apply thresholds
                if result.confidence >= settings.VISION_ACCEPT_THRESHOLD and result.is_ewaste:
                    result.decision = "ACCEPT"
                elif result.confidence >= settings.VISION_REJECT_THRESHOLD and not result.is_ewaste:
                    result.decision = "REJECT"
                else:
                    result.decision = "MANUAL_REVIEW"
            else:
                result = self.fallback_provider.verify_image(item.photo_url)
        except Exception as e:
            logger.error(f"Vision provider failed, falling back: {e}")
            result = self.fallback_provider.verify_image(item.photo_url)

        # Persist results
        item.verified_is_ewaste = result.is_ewaste
        item.verified_confidence = result.confidence
        item.verified_category = result.category
        item.verified_decision = result.decision
        item.verified_provider = result.provider
        item.verified_reason = result.reason
        item.verified_at = datetime.utcnow()
        
        db.commit()
        db.refresh(item)
        return item

from pydantic import BaseModel
vision_service = VisionVerificationService()
