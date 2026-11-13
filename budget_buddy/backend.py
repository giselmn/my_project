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
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload

from pydantic import BaseModel

# Mock user database
fake_users_db = {
    "testuser": {"username": "testuser", "password": "testpassword"}
}

class LoginRequest(BaseModel):
    username: str
    password: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@app.post("/create-user")
def create_user(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Directly store the plain-text password (no hashing)
    print(f"Password length: {len(password)}")
    
    # Create the user
    user = User(username=username, password=password)  # Store plain-text password
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User created successfully", "user": {"id": user.id, "username": user.username}}

@app.post("/token")
def login(username: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    # Check the actual database for the user
    user = db.query(User).filter(User.username == username).first()

    if user:
        # Compare plain-text passwords directly (no hashing for now)
        if user.password != password: # type: ignore
            raise HTTPException(status_code=400, detail="Invalid username or password")
    else:
        # Check the fake database if the user is not in the actual database
        user = fake_users_db.get(username)
        if not user or user["password"] != password:
            raise HTTPException(status_code=400, detail="Invalid username or password")
    
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

@app.post("/add-expense")
async def add_expense(request: ExpenseRequest):
    global remaining_balance
    if request.expense <= remaining_balance:
        remaining_balance -= request.expense
        expenses.append({"amount": request.expense, "category": request.category})
        return {
            "message": "Expense added successfully",
            "remainingBalance": remaining_balance,
            "expenses": expenses,
        }
    raise HTTPException(
        status_code=400,
        detail=f"Insufficient funds. Remaining balance: {remaining_balance}",
    )

@app.get("/balance")
async def get_balance():
    return {
        "initialIncome": initial_income,
        "remainingBalance": remaining_balance,
    }

@app.get("/expenses")
async def get_expenses():
    return {"expenses": expenses}

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