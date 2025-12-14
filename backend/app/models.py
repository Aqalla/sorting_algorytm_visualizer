import sqlalchemy as sa 

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import (
    Mapped, 
    mapped_column, 
    relationship,
)
from sqlalchemy.sql import func

from app.database import Base, engine


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        server_default=func.now()
    )

    settings: Mapped[Optional["UserArrayConfiguration"]] = relationship(
        back_populates="user",
        uselist=False, 
        cascade="all, delete-orphan", lazy="subquery"
    )


class UserArrayConfiguration(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(primary_key=True)

    array_size: Mapped[int] = mapped_column(default=100)
    speed: Mapped[int] = mapped_column(default=1)
    updated_at: Mapped[datetime] = mapped_column(
        server_default=func.now(),
        onupdate=func.now()
    )   
    user_id: Mapped[int] = mapped_column(
        sa.ForeignKey("users.id"), 
        unique=True,
        nullable=False
    )

    user: Mapped["User"] = relationship(back_populates="settings", lazy="subquery")


