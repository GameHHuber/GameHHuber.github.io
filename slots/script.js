// Initial balance, used if no saved balance exists
const initialBalance = 1000;
const slotIcons = ["🍒", "🍋", "🍉", "🍇", "⭐"];

// Load balance from localStorage, or set to initial balance if none exists
let balance = localStorage.getItem("balance") ? parseInt(localStorage.getItem("balance")) : initialBalance;

// Update balance display and save to localStorage
function updateBalance() {
  document.getElementById("balance").innerText = balance;
  localStorage.setItem("balance", balance); // Save to localStorage
}

// Display message with fade-in effect
function showMessage(message) {
  const messageElement = document.getElementById("message");
  messageElement.classList.remove("fade-in"); // Reset animation
  void messageElement.offsetWidth; // Trigger reflow
  messageElement.innerText = message;
  messageElement.classList.add("fade-in"); // Apply animation
}

// Animate slots and determine result
function spinSlots() {
  // Check if balance is sufficient
  if (balance < 50) {
    showMessage("Not enough balance to spin!");
    return;
  }

  // Deduct bet
  balance -= 50;
  updateBalance();

  // Animate slots
  const slotElements = [document.getElementById("slot1"), document.getElementById("slot2"), document.getElementById("slot3")];
  slotElements.forEach(slot => slot.classList.add("spinning"));

  // Generate random icons for slots after animation delay
  setTimeout(() => {
    const results = slotElements.map(() => slotIcons[Math.floor(Math.random() * slotIcons.length)]);
    results.forEach((icon, i) => {
      slotElements[i].innerText = icon;
      slotElements[i].classList.remove("spinning");
    });

    // Determine win or loss
    if (results[0] === results[1] && results[1] === results[2]) {
      const winAmount = 500;
      balance += winAmount;
      showMessage(`Jackpot! You win ${winAmount} FC!`);
    } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
      const winAmount = 100;
      balance += winAmount;
      showMessage(`Nice! You win ${winAmount} FC!`);
    } else {
      showMessage("Sorry, you lose!");
    }

    updateBalance(); // Update balance display and save to localStorage
  }, 1000); // Animation duration
}

// Event listener for spin button
document.getElementById("spin").addEventListener("click", spinSlots);

// Initial balance display
updateBalance();
