from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.engine import URL
from dotenv import load_dotenv
import os

load_dotenv()

sql_username = os.getenv("SQL_USERNAME")
sql_password = os.getenv("SQL_PASSWORD")

engine = create_engine(
    URL.create(
        drivername="mysql+pymysql",
        username=sql_username,
        password=sql_password,
        host="localhost",
        port=3306,
        database="grade_system",
    )
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()
