let initialIncome = 0;
let remainingBalance = 0;
let monthlyBudget = 0;
let expenses = []; // Array to store all expenses


// Create the pie chart ONCE
const ctx = document.getElementById("expense-chart").getContext("2d");

const expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
        labels: [],
        datasets: [{
            label: "Expenses",
            data: [],
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
                "#FF9F40",
            ],
            hoverOffset: 4,
        }],
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
        characterImg.src = 'budget_buddy/assets/remie_proud.webp'; // Happy character
    } else {
        result.textContent = `Oh no! You don't have enough funds. You're short by $${(expenseAmount - remainingBalance).toFixed(2)}.`;
        characterImg.src = 'budget_buddy/assets/remie_work.gif'; // Sad character
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
    document.getElementById('character-img').src = 'budget_buddy/assets/remie_awe.gif'; // Default character image

    // Clear the expense report
    document.getElementById('expense-report').innerHTML = '';

    // Clear pie chart
    expenseChart.data.labels = [];
    expenseChart.data.datasets[0].data = [];
    expenseChart.update();
});

// Function to update the expense report
function updateExpenseReport() {
    const reportDiv = document.getElementById("expense-report");
    reportDiv.innerHTML = "";

    // Group expenses by category
    const categoryTotals = {};

    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }

        categoryTotals[expense.category] += expense.amount;
    });

    // Display expense totals
    for (const [category, total] of Object.entries(categoryTotals)) {
        const reportItem = document.createElement("p");

        reportItem.textContent = `${category}: $${total.toFixed(2)}`;

        reportDiv.appendChild(reportItem);
    }

    // Update existing pie chart
    expenseChart.data.labels = Object.keys(categoryTotals);

    expenseChart.data.datasets[0].data =
        Object.values(categoryTotals);

    expenseChart.update();
}