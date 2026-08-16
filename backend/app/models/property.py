from sqlalchemy import Column, String, Integer, Float
from app.db.session import Base

class Block(Base):
    __tablename__ = "blocks"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    roads_count = Column(Integer, default=5)
    properties_count = Column(Integer, default=120)
    residents_count = Column(Integer, default=450)
    gate = Column(String, default="Gate 1")
    status = Column(String, default="active")

class Building(Base):
    __tablename__ = "buildings"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    block = Column(String, nullable=False)
    road = Column(String, nullable=False)
    floors = Column(Integer, default=10)
    total_flats = Column(Integer, default=40)
    manager_name = Column(String, nullable=True)

class Flat(Base):
    __tablename__ = "flats"

    id = Column(String, primary_key=True, index=True)
    flat_number = Column(String, nullable=False)
    building_id = Column(String, nullable=False)
    building_name = Column(String, nullable=False)
    floor = Column(String, nullable=False)
    status = Column(String, default="occupied")
    owner_name = Column(String, nullable=True)
    tenant_name = Column(String, nullable=True)
