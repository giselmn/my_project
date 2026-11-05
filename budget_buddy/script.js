let initialIncome = 0;
let remainingBalance = 0;
let monthlyBudget = 0;
let expenses = []; // Array to store all expenses

// Add event listener to the form
document.getElementById('budget-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent form submission

    // Get income and expenses values
    const income = parseFloat(document.getElementById('income').value);
    const expenseAmount = parseFloat(document.getElementById('expenses').value);
    const expenseCategory = document.getElementById('expense-category').value; // New category input

    const result = document.getElementById('result');
    const characterImg = document.getElementById('character-img');

    // Set initial income only once
    if (initialIncome === 0) {
        initialIncome = income;
        remainingBalance = initialIncome;

        // Update the initial income display
        document.getElementById('initial-income').textContent = initialIncome.toFixed(2);
    }

    // Subtract expenses from remaining balance
    if (expenseAmount <= remainingBalance) {
        remainingBalance -= expenseAmount;

        // Add the expense to the list
        expenses.push({ amount: expenseAmount, category: expenseCategory });

        // Update the remaining balance display
        document.getElementById('remaining-balance').textContent = remainingBalance.toFixed(2);

        result.textContent = `You spent $${expenseAmount.toFixed(2)} on ${expenseCategory}. Remaining balance: $${remainingBalance.toFixed(2)}.`;
        characterImg.src = 'assets/remie_proud.webp'; // Happy character
    } else {
        result.textContent = `Oh no! You don't have enough funds. You're short by $${(expenseAmount - remainingBalance).toFixed(2)}.`;
        characterImg.src = 'assets/remie_work.gif'; // Sad character
    }

    // Update the expense report
    updateExpenseReport();
});

// Add event listener to the Clear button
document.getElementById('Clear-button').addEventListener('click', function () {
    // Reset variables
    initialIncome = 0;
    remainingBalance = 0;
    expenses = [];

    // Clear input fields
    document.getElementById('income').value = '';
    document.getElementById('expenses').value = '';
    document.getElementById('expense-category').value = '';

    // Reset displayed values
    document.getElementById('initial-income').textContent = '0.00';
    document.getElementById('remaining-balance').textContent = '0.00';
    document.getElementById('result').textContent = '';
    document.getElementById('character-img').src = 'assets/remie_awe.gif'; // Default character image

    // Clear the expense report
    document.getElementById('expense-report').innerHTML = '';
});

// Function to update the expense report
function updateExpenseReport() {
    const reportDiv = document.getElementById('expense-report');
    reportDiv.innerHTML = ''; // Clear the report

    // Group expenses by category
    const categoryTotals = {};
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });

    // Display the report
    for (const [category, total] of Object.entries(categoryTotals)) {
        const reportItem = document.createElement('p');
        reportItem.textContent = `${category}: $${total.toFixed(2)}`;
        reportDiv.appendChild(reportItem);
    }

    const ctx = document.getElementById("expense-chart").getContext("2d");
    const expenseChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: [], // Categories (e.g., Food, Rent)
            datasets: [
                {
                    label: "Expenses",
                    data: [], // Amounts corresponding to categories
                    backgroundColor: [
                        "#FF6384", // Colors for each category
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                    ],
                    hoverOffset: 4,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });

    // Add event listener to the form
    document.getElementById("budget-form").addEventListener("submit", function (e) {
    e.preventDefault();

    const expenseAmount = parseFloat(document.getElementById("expenses").value);
    const expenseCategory = document.getElementById("expense-category").value;

    if (expenseAmount && expenseCategory) {
        const categoryIndex = expenseChart.data.labels.indexOf(expenseCategory);

        if (categoryIndex === -1) {
            expenseChart.data.labels.push(expenseCategory);
            expenseChart.data.datasets[0].data.push(expenseAmount);
        } else {
            expenseChart.data.datasets[0].data[categoryIndex] += expenseAmount;
        }

        expenseChart.update();
    }

    document.getElementById("expenses").value = "";
    document.getElementById("expense-category").value = "";
});
}