from fastapi import Depends,FastAPI, HTTPException, status, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import List
from security import create_access_token, verify_access_token
from functools import wraps
from sqlalchemy.orm import Session
from database import SessionLocal
from models import User, Expense
from passlib.context import CryptContext

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or specify your Live Server URL, e.g., "http://127.0.0.1:5500")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

#Depedency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Dependency to get the current user
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    username = payload.get("sub")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"id": user.id, "username": user.username}

from pydantic import BaseModel

# Mock user database
fake_users_db = {
    "testuser": {"username": "testuser", "password": "testpassword"}
}

class LoginRequest(BaseModel):
    username: str
    password: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/create-user", summary="Create a new user")
def create_user(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Check if the user already exists
    existing_user = db.query(User).filter(User.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists"
        )
    
    # Hash the password
    hashed_password = pwd_context.hash(password)
    
    # Create the user
    user = User(username=username, password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully", "user": {"id": user.id, "username": user.username}}

@app.post("/token", summary="Login and get access token")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Check the actual database for the user
    user = db.query(User).filter(User.username == username).first()

    # Check if the user exists and verify the password (using passlib for hashing)
    if not user or not pwd_context.verify(password, user.password): #type: ignore
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid username or password"
        )
        
    # Create JWT token
    access_token = create_access_token(data={"sub": username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected-route")
def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": f"Hello, {current_user['sub']}!"}

# In-memory storage for practice
initial_income = 0
remaining_balance = 0

# Define request models
class IncomeRequest(BaseModel):
    income: float

class ExpenseRequest(BaseModel):
    expense: float
    category: str

expenses = []

@app.post("/set-income")
async def set_income(request: IncomeRequest, current_user: dict = Depends(get_current_user)):
    global initial_income, remaining_balance
    if initial_income == 0:
        initial_income = request.income
        remaining_balance = initial_income
        return {
            "message": "Income set successfully",
            "initialIncome": initial_income,
            "remainingBalance": remaining_balance,
        }

@app.post("/add-expense", summary="Add a new expense")
async def add_expense(request: ExpenseRequest, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    # Create a new expense
    expense = Expense(amount=request.expense, category=request.category, user_id=current_user["id"])
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return {
        "message": "Expense added successfully",
        "expense": {"id": expense.id, "amount": expense.amount, "category": expense.category},
    }

@app.get("/balance")
async def get_balance(current_user: dict = Depends(get_current_user)):
    return {
        "initialIncome": initial_income,
        "remainingBalance": remaining_balance,
    }

@app.get("/expenses", summary="Get all expenses")
async def get_expenses(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Query the database for the user's expenses
    user_expenses = db.query(Expense).filter(Expense.user_id == current_user.id).all()
    return {"expenses": [{"id": e.id, "amount": e.amount, "category": e.category} for e in user_expenses]}

@app.get("/exepnses-summary")
async def expense_summary():
    category_totals = {}
    for expense in expenses:
        category_totals[expense["category"]] = category_totals.get(expense["category"], 0) + expense["amount"]
    return {"categoryTotals": category_totals}

@app.post("/reset")
async def reset_income():
    global initial_income, remaining_balance, expenses
    initial_income = 0
    remaining_balance = 0
    expenses = []
    return {"message": "Income and expenses have been reset"}