from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from app.db.session import Base

class Account(Base):
    __tablename__ = "accounts"

    id = Column(String, primary_key=True, index=True)
    code = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    category = Column(String, nullable=False)
    balance = Column(Float, default=0.0)

class FinancialEvent(Base):
    __tablename__ = "financial_events"

    id = Column(String, primary_key=True, index=True)
    at = Column(DateTime, default=datetime.utcnow)
    request_id = Column(String, nullable=True)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    direction = Column(String, nullable=False)
    account = Column(String, nullable=False)
    journal_ref = Column(String, nullable=False)
    status = Column(String, default="posted")
