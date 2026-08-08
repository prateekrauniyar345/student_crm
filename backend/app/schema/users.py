from sqlalchemy import Column, Integer, String, DateTime
from app.db.base import Base


class User(Base):
    # defne the table name
    __tablename__ = "users"
    # define the schema name
    __table_args__ = {"schema": "test"}


    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, nullable=False)