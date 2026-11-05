const API_URL = "http://127.0.0.1:8000"; // FastAPI backend URL

// Add event listener to the form
document.getElementById("budget-form").addEventListener("submit", async function (e) {
    e.preventDefault(); // Prevent form submission

    const income = parseFloat(document.getElementById("income").value);
    const expenseAmount = parseFloat(document.getElementById("expenses").value);
    const expenseCategory = document.getElementById("expense-category").value;

    const result = document.getElementById("result");
    const characterImg = document.getElementById("character-img");

    // Set income only once
    if (income > 0) {
        try {
            console.log("Sending income to backend:", { income });
            const response = await fetch(`${API_URL}/set-income`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ income }),
            });
            const data = await response.json();
            console.log("Response from backend:", data);

            if (response.ok) {
                document.getElementById("initial-income").textContent = data.initialIncome.toFixed(2);
                document.getElementById("remaining-balance").textContent = data.remainingBalance.toFixed(2);
            } else {
                alert(data.detail || "Failed to set income");
            }
        } catch (error) {
            console.error("Error setting income:", error);
        }
    }

    // Add expense
    if (expenseAmount && expenseCategory) {
        try {
            const response = await fetch(`${API_URL}/add-expense`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ expense: expenseAmount, category: expenseCategory }),
            });
            const data = await response.json();
            if (response.ok) {
                document.getElementById("remaining-balance").textContent = data.remainingBalance.toFixed(2);
                result.textContent = `You spent $${expenseAmount.toFixed(2)} on ${expenseCategory}. Remaining balance: $${data.remainingBalance.toFixed(2)}.`;
                characterImg.src = "assets/remie_proud.webp"; // Happy character
                updateExpenseReport(data.expenses);
            } else {
                alert(data.detail || "Failed to add expense");
                characterImg.src = "assets/remie_work.gif"; // Sad character
            }
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    }
});

// Function to update the expense report
function updateExpenseReport(expenses) {
    const reportDiv = document.getElementById("expense-report");
    reportDiv.innerHTML = ""; // Clear the report

    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach((expense) => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    // Display the report
    for (const [category, total] of Object.entries(categoryTotals)) {
        const reportItem = document.createElement("p");
        reportItem.textContent = `${category}: $${total.toFixed(2)}`;
        reportDiv.appendChild(reportItem);
    }
}

// Fetch and display the current balance and expenses on page load
async function fetchInitialData() {
    try {
        const balanceResponse = await fetch(`${API_URL}/balance`);
        const balanceData = await balanceResponse.json();
        document.getElementById("initial-income").textContent = balanceData.initialIncome.toFixed(2);
        document.getElementById("remaining-balance").textContent = balanceData.remainingBalance.toFixed(2);

        const expensesResponse = await fetch(`${API_URL}/expenses`);
        const expensesData = await expensesResponse.json();
        updateExpenseReport(expensesData.expenses);
    } catch (error) {
        console.error("Error fetching initial data:", error);
    }
}

// Fetch initial data when the page loads
fetchInitialData();