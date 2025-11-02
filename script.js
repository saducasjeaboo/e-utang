const password = "utang1234";
let currentDebtor = null;
const debtors = JSON.parse(localStorage.getItem("debtors")) || {};

function saveData() {
  localStorage.setItem("debtors", JSON.stringify(debtors));
}

function toggleTheme() {
  document.body.classList.toggle("dark");
}

function login() {
  const input = document.getElementById("adminPass").value;
  if (input === password) {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("mainPage").classList.remove("hidden");
    renderDebtors();
  } else alert("Incorrect password!");
}

function addDebtor() {
  const name = document.getElementById("debtorName").value.trim();
  if (!name) return alert("Enter a name");
  if (debtors[name]) return alert("Already exists");
  debtors[name] = { items: [], dateAdded: new Date().toLocaleString() };
  saveData();
  renderDebtors();
  document.getElementById("debtorName").value = "";
}

function deleteDebtor(name) {
  if (confirm(`Delete ${name}?`)) {
    delete debtors[name];
    saveData();
    renderDebtors();
  }
}

function openDebtor(name) {
  currentDebtor = name;
  document.getElementById("mainPage").classList.add("hidden");
  document.getElementById("detailsPage").classList.remove("hidden");
  document.getElementById("debtorTitle").textContent = name;
  renderItems();
}

function goBack() {
  document.getElementById("detailsPage").classList.add("hidden");
  document.getElementById("mainPage").classList.remove("hidden");
  renderDebtors();
}

function renderDebtors() {
  const list = document.getElementById("debtorList");
  list.innerHTML = "";
  for (let name in debtors) {
    const d = debtors[name];
    const total = d.items.reduce((s, i) => s + (!i.paid ? i.price : 0), 0);
    const status = total === 0 ? "Paid" : "Unpaid";
    const div = document.createElement("div");
    div.className = "debtor";
    div.innerHTML = `
      <div class="debtor-header">
        <span style="cursor:pointer;font-weight:bold;" onclick="openDebtor('${name}')">${name}</span>
        <button class="small-btn btn-danger" onclick="deleteDebtor('${name}')">Delete</button>
      </div>
      <div class="debtor-info">
        Date added: ${d.dateAdded}<br>
        Total: ₱${total.toFixed(2)}<br>
        Status: <span class="${status === "Paid" ? "status-paid" : "status-unpaid"}">${status}</span>
      </div>`;
    list.appendChild(div);
  }
}

function renderItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";
  let total = 0;
  debtors[currentDebtor].items.forEach((item, i) => {
    if (!item.paid) total += item.price;
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <span class="${item.paid ? "paid-item" : ""}">${item.name} - ₱${item.price}</span>
      <div>
        <button class="small-btn btn-success" onclick="markPaid(${i})">Paid</button>
        <button class="small-btn btn-danger" onclick="deleteItem(${i})">Delete</button>
      </div>`;
    list.appendChild(div);
  });
  document.getElementById("totalDebt").textContent = total.toFixed(2);
}

function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const price = parseFloat(document.getElementById("itemPrice").value);
  if (!name || isNaN(price)) return alert("Enter valid item and price");
  debtors[currentDebtor].items.push({ name, price, paid: false });
  saveData();
  renderItems();
  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
}

function deleteItem(i) {
  if (confirm("Delete this item?")) {
    debtors[currentDebtor].items.splice(i, 1);
    saveData();
    renderItems();
  }
}

function markPaid(i) {
  debtors[currentDebtor].items[i].paid = true;
  saveData();
  renderItems();
}

function markAllPaid() {
  debtors[currentDebtor].items.forEach((it) => (it.paid = true));
  saveData();
  renderItems();
}
