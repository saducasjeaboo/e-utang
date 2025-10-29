import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const adminPassword = "1234"; // change this anytime

// Sections
const loginSection = document.getElementById("login-section");
const mainSection = document.getElementById("main-section");
const addDebtorSection = document.getElementById("addDebtorSection");
const debtorDetailsSection = document.getElementById("debtorDetailsSection");

// Buttons
document.getElementById("loginBtn").addEventListener("click", () => {
  const entered = document.getElementById("adminPassword").value;
  if (entered === adminPassword) {
    loginSection.style.display = "none";
    mainSection.style.display = "block";
  } else {
    alert("Wrong password!");
  }
});

// Add debtor
document.getElementById("addDebtorBtn").addEventListener("click", () => {
  mainSection.style.display = "none";
  addDebtorSection.style.display = "block";
});

document.getElementById("backBtn").addEventListener("click", () => {
  addDebtorSection.style.display = "none";
  mainSection.style.display = "block";
});

// Save new debtor
document.getElementById("saveDebtorBtn").addEventListener("click", async () => {
  const name = document.getElementById("debtorName").value.trim();
  if (!name) return alert("Enter a name!");

  await addDoc(collection(db, "debtors"), {
    name,
    products: [],
    total: 0,
    paid: false
  });
  document.getElementById("debtorName").value = "";
  alert("Debtor added!");
  addDebtorSection.style.display = "none";
  mainSection.style.display = "block";
});

// Real-time listener for debtors
const debtorsList = document.getElementById("debtorsList");
onSnapshot(collection(db, "debtors"), (snapshot) => {
  debtorsList.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const d = docSnap.data();
    const div = document.createElement("div");
    div.classList.add("debtor-card");
    div.innerHTML = `
      <b>${d.name}</b><br>
      Total: ₱${d.total}<br>
      Status: ${d.paid ? "<span style='color:green;'>Paid</span>" : "<span style='color:red;'>Unpaid</span>"}<br>
      <button data-id="${docSnap.id}" class="viewBtn">View</button>
    `;
    debtorsList.appendChild(div);
  });

  document.querySelectorAll(".viewBtn").forEach((btn) => {
    btn.addEventListener("click", () => openDebtor(btn.dataset.id));
  });
});

// View debtor details
const debtorTitle = document.getElementById("debtorTitle");
const productList = document.getElementById("productList");
const totalDebt = document.getElementById("totalDebt");
let currentDebtorId = "";

async function openDebtor(id) {
  mainSection.style.display = "none";
  debtorDetailsSection.style.display = "block";
  currentDebtorId = id;

  const snapshot = await getDocs(collection(db, "debtors"));
  snapshot.forEach((docSnap) => {
    if (docSnap.id === id) {
      const d = docSnap.data();
      debtorTitle.textContent = d.name;
      renderProducts(d);
    }
  });
}

function renderProducts(d) {
  productList.innerHTML = "";
  d.products.forEach((p, index) => {
    const item = document.createElement("div");
    item.innerHTML = `${p.name} - ₱${p.price}`;
    productList.appendChild(item);
  });
  totalDebt.textContent = `Total Debt: ₱${d.total}`;
}

document.getElementById("addProductBtn").addEventListener("click", async () => {
  const name = document.getElementById("productName").value.trim();
  const price = parseFloat(document.getElementById("productPrice").value);
  if (!name || isNaN(price)) return alert("Enter product and price");

  const debtorRef = doc(db, "debtors", currentDebtorId);
  const snapshot = await getDocs(collection(db, "debtors"));
  snapshot.forEach(async (docSnap) => {
    if (docSnap.id === currentDebtorId) {
      const d = docSnap.data();
      d.products.push({ name, price });
      d.total += price;
      d.paid = false;
      await updateDoc(debtorRef, d);
      renderProducts(d);
    }
  });
  document.getElementById("productName").value = "";
  document.getElementById("productPrice").value = "";
});

document.getElementById("payBtn").addEventListener("click", async () => {
  const amount = parseFloat(document.getElementById("paymentAmount").value);
  if (isNaN(amount) || amount <= 0) return alert("Enter valid payment");
  const debtorRef = doc(db, "debtors", currentDebtorId);
  const snapshot = await getDocs(collection(db, "debtors"));
  snapshot.forEach(async (docSnap) => {
    if (docSnap.id === currentDebtorId) {
      const d = docSnap.data();
      d.total -= amount;
      if (d.total <= 0) {
        d.total = 0;
        d.paid = true;
      }
      await updateDoc(debtorRef, d);
      renderProducts(d);
    }
  });
  document.getElementById("paymentAmount").value = "";
});

document.getElementById("deleteDebtorBtn").addEventListener("click", async () => {
  if (confirm("Are you sure to delete this debtor?")) {
    await deleteDoc(doc(db, "debtors", currentDebtorId));
    debtorDetailsSection.style.display = "none";
    mainSection.style.display = "block";
  }
});

document.getElementById("backToListBtn").addEventListener("click", () => {
  debtorDetailsSection.style.display = "none";
  mainSection.style.display = "block";
});