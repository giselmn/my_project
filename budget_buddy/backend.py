from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

# In-memory storage for practice
initial_income = 0
remaining_balance = 0

# Define request models
class IncomeRequest(BaseModel):
    income: float

class ExpenseRequest(BaseModel):
    expense: float

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
    raise HTTPException(status_code=400, detail="Income already set")

@app.post("/add-expense")
async def add_expense(request: ExpenseRequest):
    global remaining_balance
    if request.expense <= remaining_balance:
        remaining_balance -= request.expense
        return {
            "message": "Expense added successfully",
            "remainingBalance": remaining_balance,
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