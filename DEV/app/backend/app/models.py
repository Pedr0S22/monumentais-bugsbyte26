from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from .db import Base


class Meal(Base):
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=True)
    logged_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    source = Column(String, default="text", nullable=False)
    note = Column(String, nullable=True)

    items = relationship("MealItem", back_populates="meal", cascade="all, delete-orphan")
    score = relationship("Score", back_populates="meal", uselist=False, cascade="all, delete-orphan")


class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    quantity = Column(Float, default=0.0, nullable=False)
    unit = Column(String, default="g", nullable=False)
    calories = Column(Float, default=0.0, nullable=False)
    protein = Column(Float, default=0.0, nullable=False)
    carbs = Column(Float, default=0.0, nullable=False)
    fats = Column(Float, default=0.0, nullable=False)
    fiber = Column(Float, default=0.0, nullable=False)
    glycemic_load = Column(Float, default=0.0, nullable=False)

    meal = relationship("Meal", back_populates="items")


class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    meal_id = Column(Integer, ForeignKey("meals.id", ondelete="CASCADE"), nullable=False, unique=True)
    stability = Column(Float, nullable=False)
    satiety = Column(Float, nullable=False)
    balance = Column(Float, nullable=False)
    total_score = Column(Float, nullable=False)
    computed_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    meal = relationship("Meal", back_populates="score")
