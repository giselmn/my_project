from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (or specify your Live Server URL, e.g., "http://127.0.0.1:5500")
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
async def set_income(request: IncomeRequest):
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