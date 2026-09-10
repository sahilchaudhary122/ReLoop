from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.batch import Batch, Item
from app.models.event import EventType
from app.services.workflow_service import workflow_service
from app.models.user import User

class DownstreamService:
    @staticmethod
    def aggregator_receive(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        # Current state is defined by the status of the related pickup or the items.
        # For simplicity in this vertical slice, we'll assume the batch state follows its items/pickup.
        # However, GEMINI.md says "AGGREGATOR_RECEIVED" is a lifecycle state.
        # We need a status field on Batch as well for clarity, but for now we'll use pickup status as proxy if items are not individually stateful.
        # Wait, GEMINI.md says: REQUESTED -> ASSIGNED -> COLLECTED -> AGGREGATOR_RECEIVED
        # This implies the state lives on the logical collection unit.
        
        workflow_service.validate_transition(batch.pickup_request.status, "AGGREGATOR_RECEIVED")
        
        try:
            batch.pickup_request.status = "AGGREGATOR_RECEIVED"
            workflow_service.log_event(
                db, batch.id, EventType.AGGREGATOR_RECEIVED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def aggregator_verify_weight(db: Session, batch_id: int, items_weights: list[dict], actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "WEIGHT_VERIFIED")

        try:
            for iw in items_weights:
                item = db.query(Item).filter(Item.id == iw["item_id"], Item.batch_id == batch.id).first()
                if item:
                    item.verified_weight = iw["verified_weight"]
            
            batch.pickup_request.status = "WEIGHT_VERIFIED"
            workflow_service.log_event(
                db, batch.id, EventType.WEIGHT_VERIFIED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def aggregator_sort(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "SORTED")

        try:
            batch.pickup_request.status = "SORTED"
            workflow_service.log_event(
                db, batch.id, EventType.SORTED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def recycler_receive(db: Session, batch_id: int, items_weights: list[dict], actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "RECYCLER_RECEIVED")

        try:
            for iw in items_weights:
                item = db.query(Item).filter(Item.id == iw["item_id"], Item.batch_id == batch.id).first()
                if item:
                    item.received_weight = iw["received_weight"]
            
            batch.pickup_request.status = "RECYCLER_RECEIVED"
            workflow_service.log_event(
                db, batch.id, EventType.RECYCLER_RECEIVED, actor.id, actor.role.value, lat, lon
            )
            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

    @staticmethod
    def recycler_process(db: Session, batch_id: int, actor: User, lat: float = None, lon: float = None) -> Batch:
        batch = db.query(Batch).filter(Batch.id == batch_id).first()
        if not batch:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Batch not found")

        workflow_service.validate_transition(batch.pickup_request.status, "PROCESSED")

        try:
            batch.pickup_request.status = "PROCESSED"
            workflow_service.log_event(
                db, batch.id, EventType.PROCESSING_CONFIRMED, actor.id, actor.role.value, lat, lon
            )
            
            # EPR Gating Logic: Trigger Eligibility and Credit if chain is complete
            # Chain: Collector -> Aggregator -> Recycler -> Processing
            workflow_service.log_event(
                db, batch.id, EventType.EPR_ELIGIBILITY_CREATED, actor.id, actor.role.value, lat, lon
            )
            batch.pickup_request.status = "EPR_ELIGIBLE"
            
            workflow_service.log_event(
                db, batch.id, EventType.EPR_CREDIT_CREATED, actor.id, actor.role.value, lat, lon
            )
            batch.pickup_request.status = "EPR_CREDIT"

            db.commit()
            db.refresh(batch)
            return batch
        except Exception as e:
            db.rollback()
            raise e

downstream_service = DownstreamService()
