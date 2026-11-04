let initialIncome = 0;
let remainingBalance = 0;

// Add event listener to the form
document.getElementById('budget-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent form submission
  
    // Get income and expenses values
    const income = parseFloat(document.getElementById('income').value);
    const expenses = parseFloat(document.getElementById('expenses').value);
  
    // Get result and character image elements
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
    if (expenses <= remainingBalance) {
        remainingBalance -= expenses;

        // Update the remaining balance display
        document.getElementById('remaining-balance').textContent = remainingBalance.toFixed(2);

        result.textContent = `You spent $${expenses.toFixed(2)}. Remaining balance: $${remainingBalance.toFixed(2)}.`;
        characterImg.src = 'assets/remie_proud.webp'; // Happy character
    } else {
        result.textContent = `Oh no! You don't have enough funds. You're short by $${(expenses - remainingBalance).toFixed(2)}.`;
        characterImg.src = 'assets/remie_work.gif'; // Sad character
    }
});

// Add event listener to the Clear button
document.getElementById('Clear-button').addEventListener('click', function() {
    // Reset variables
    initialIncome = 0;
    remainingBalance = 0;

    // Clear input fields
    document.getElementById('income').value = '';
    document.getElementById('expenses').value = '';

    // Reset displayed values
    document.getElementById('initial-income').textContent = '0.00';
    document.getElementById('remaining-balance').textContent = '0.00';
    document.getElementById('result').textContent = '';
    document.getElementById('character-img').src = 'assets/remie_awe.gif'; // Default character image
});