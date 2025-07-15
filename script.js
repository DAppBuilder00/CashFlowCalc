const incomeInput = document.getElementById("income");
const expenseTable = document.getElementById("expense-table");
const resultDiv = document.getElementById("result");
const ctx = document.getElementById("cashflowChart").getContext("2d");
const themeToggle = document.getElementById("themeToggle");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const historyTable = document.getElementById("history-table");
let chart;

(() => {
  const currentYear = new Date().getFullYear();
  for (let i = currentYear; i >= currentYear - 10; i--) {
    const option = document.createElement("option");
    option.textContent = i;
    yearSelect.appendChild(option);
  }
})();

function addExpense() {
  const row = expenseTable.insertRow();
  const cell1 = row.insertCell(0);
  const cell2 = row.insertCell(1);
  cell1.contentEditable = "true";
  cell1.className = "expense-name";
  cell1.textContent = "New Expense";
  cell2.contentEditable = "true";
  cell2.className = "expense-amount";
  cell2.textContent = "0";
}

function removeExpense() {
  const rows = expenseTable.rows;
  if (rows.length > 2) expenseTable.deleteRow(rows.length - 1);
}

function calculateCashFlow() {
  const income = parseFloat(incomeInput.value) || 0;
  const names = document.querySelectorAll(".expense-name");
  const amounts = document.querySelectorAll(".expense-amount");
  let total = 0;
  amounts.forEach((el) => total += parseFloat(el.textContent) || 0);
  const net = income - total;
  resultDiv.textContent = `Net Cash Flow: ₱ ${net.toFixed(2)}`;
  drawChart(income, total);
}

function drawChart(income, expenses) {
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses"],
      datasets: [{
        label: "Amount (₱)",
        data: [income, expenses],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}

function saveToHistory() {
  const month = monthSelect.value;
  const year = yearSelect.value;
  const income = parseFloat(incomeInput.value) || 0;
  const amounts = document.querySelectorAll(".expense-amount");
  if (!month || !year) return alert("Select month and year.");
  let totalExpenses = 0;
  amounts.forEach(el => totalExpenses += parseFloat(el.textContent) || 0);
  const net = income - totalExpenses;
  const history = JSON.parse(localStorage.getItem("cashflow-history") || "[]");
  history.push({ month, year, income, expenses: totalExpenses, net });
  localStorage.setItem("cashflow-history", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const history = JSON.parse(localStorage.getItem("cashflow-history") || "[]");
  historyTable.querySelectorAll("tr").forEach((row, i) => { if (i > 0) row.remove(); });
  history.forEach(h => {
    const row = historyTable.insertRow();
    row.insertCell(0).textContent = h.month;
    row.insertCell(1).textContent = h.year;
    row.insertCell(2).textContent = `₱ ${h.income.toFixed(2)}`;
    row.insertCell(3).textContent = `₱ ${h.expenses.toFixed(2)}`;
    row.insertCell(4).textContent = `₱ ${h.net.toFixed(2)}`;
  });
}

function exportToCSV() {
  const history = JSON.parse(localStorage.getItem("cashflow-history") || "[]");
  let csv = "Month,Year,Income,Expenses,Net\n";
  history.forEach(h => csv += `${h.month},${h.year},${h.income},${h.expenses},${h.net}\n`);
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "cashflow-history.csv";
  a.click();
}

themeToggle.addEventListener("change", () => {
  document.body.classList.toggle("dark", themeToggle.checked);
  localStorage.setItem("darkMode", themeToggle.checked);
});

window.onload = () => {
  if (JSON.parse(localStorage.getItem("darkMode"))) {
    document.body.classList.add("dark");
    themeToggle.checked = true;
  }
  loadHistory();
};
