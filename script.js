// Budget Buddy
// Every income and expense is saved as an entry, so totals can be rebuilt
// from the list each time. Entries are kept in localStorage, so they are
// still there after a refresh.
const STORAGE_KEY = "budgetBuddyEntries";
// Page elements
const incomeInput = document.getElementById("income-input");
const incomeCategory = document.getElementById("income-category");
const addIncomeButton = document.getElementById("add-income");
const incomeError = document.getElementById("income-error");
const incomeList = document.getElementById("income-list");
const totalIncomeDisplay = document.getElementById("total-income");
const expenseInput = document.getElementById("expense-input");
const expenseCategory = document.getElementById("expense-category");
const addExpenseButton = document.getElementById("add-expense");
const expenseError = document.getElementById("expense-error");
const expenseList = document.getElementById("expense-list");
const totalExpensesDisplay = document.getElementById("total-expenses");
const totalBalanceDisplay = document.getElementById("total-balance");
// Saving and loading
function loadEntries() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return [];
  }
}
function saveEntries() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    // Saving can fail in private windows. The app still works for this visit.
  }
}
let entries = loadEntries();
// Helpers
function formatMoney(amount) {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}
function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short"
  });
}
function sumOf(type) {
  const cents = entries
    .filter(function (entry) { return entry.type === type; })
    .reduce(function (sum, entry) { return sum + Math.round(entry.amount * 100); }, 0);
  return cents / 100;
}
// Adding entries
function addEntry(type, input, categorySelect, errorElement) {
  const amount = Number(input.value);
  if (!(amount > 0)) {
    errorElement.textContent = "Please enter an amount greater than zero.";
    input.focus();
    return;
  }
  errorElement.textContent = "";
  entries.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    type: type,
    amount: Math.round(amount * 100) / 100,
    category: categorySelect.value,
    date: new Date().toISOString()
  });
  input.value = "";
  saveEntries();
  render();
  input.focus();
}
addIncomeButton.addEventListener("click", function () {
  addEntry("income", incomeInput, incomeCategory, incomeError);
});
addExpenseButton.addEventListener("click", function () {
  addEntry("expense", expenseInput, expenseCategory, expenseError);
});
// Pressing Enter in an amount box works like clicking the button
incomeInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addIncomeButton.click();
});
expenseInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") addExpenseButton.click();
});
// Removing entries
function removeEntry(id) {
  entries = entries.filter(function (entry) { return entry.id !== id; });
  saveEntries();
  render();
}
incomeList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-id]");
  if (button) removeEntry(button.dataset.id);
});
expenseList.addEventListener("click", function (event) {
  const button = event.target.closest("[data-id]");
  if (button) removeEntry(button.dataset.id);
});
// Drawing the page
function renderList(listElement, type) {
  listElement.textContent = "";
  const items = entries
    .filter(function (entry) { return entry.type === type; })
    .slice()
    .reverse(); // newest first
  items.forEach(function (entry) {
    const li = document.createElement("li");
    const info = document.createElement("span");
    info.className = "info";
    info.textContent = entry.category;
    const date = document.createElement("span");
    date.className = "date";
    date.textContent = formatDate(entry.date);
    info.appendChild(date);
    const amount = document.createElement("span");
    amount.className = "amount";
    amount.textContent = formatMoney(entry.amount);
    const remove = document.createElement("button");
    remove.className = "remove";
    remove.type = "button";
    remove.dataset.id = entry.id;
    remove.setAttribute("aria-label", "Remove " + entry.category + " " + formatMoney(entry.amount));
    remove.textContent = "×";
    li.append(info, amount, remove);
    listElement.appendChild(li);
  });
}
function updateBalance() {
  const income = sumOf("income");
  const expenses = sumOf("expense");
  const balance = Math.round((income - expenses) * 100) / 100;
  totalIncomeDisplay.textContent = formatMoney(income);
  totalExpensesDisplay.textContent = formatMoney(expenses);
  totalBalanceDisplay.textContent = formatMoney(balance);
  totalBalanceDisplay.classList.toggle("negative", balance < 0);
}
function render() {
  renderList(incomeList, "income");
  renderList(expenseList, "expense");
  updateBalance();
}
render();
