// app.js (module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import {
  getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs,
  onSnapshot, updateDoc, deleteDoc, query, orderBy, where, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// -------- your firebase config (you already gave this) --------
const firebaseConfig = {
  apiKey: "AIzaSyC0b2AmHbs28hg4WqYdk0Bug6Z5-H32Z3M",
  authDomain: "e-utang-system.firebaseapp.com",
  projectId: "e-utang-system",
  storageBucket: "e-utang-system.firebasestorage.app",
  messagingSenderId: "78200110049",
  appId: "1:78200110049:web:1532666cc02036b53bb0a0",
  measurementId: "G-28PCC6CM6X"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// -------- admin password (client-side) --------
const ADMIN_PASSWORD = "utang1234";

// -------- UI refs --------
const loginScreen = document.getElementById("loginScreen");
const adminPassInput = document.getElementById("adminPass");
const loginBtn = document.getElementById("loginBtn");
const mainApp = document.getElementById("mainApp");
const logoutBtn = document.getElementById("logoutBtn");

const addDebtorBtn = document.getElementById("addDebtorBtn");
const debtorsList = document.getElementById("debtorsList");
const totalDebtors = document.getElementById("totalDebtors");

const emptyDetail = document.getElementById("emptyDetail");
const debtorDetail = document.getElementById("debtorDetail");
const debtorNameEl = document.getElementById("debtorName");
const dateAddedEl = document.getElementById("dateAdded");
const dateEditedEl = document.getElementById("dateEdited");
const itemsListEl = document.getElementById("itemsList");
const totalOwedEl = document.getElementById("totalOwed");

const addItemBtn = document.getElementById("addItemBtn");
const itemNameInput = document.getElementById("itemName");
const itemPriceInput = document.getElementById("itemPrice");

const editDebtorBtn = document.getElementById("editDebtorBtn");
const paidAllBtn = document.getElementById("paidAllBtn");
const deleteDebtorBtn = document.getElementById("deleteDebtorBtn");

const modalOverlay = document.getElementById("modalOverlay");
const modal = document.getElementById("modal");

// state
let currentDebtorId = null;

// -------- helpers --------
function formatTS(ts){
  if(!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString();
}
function currency(n){
  return "₱" + Number(n || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2});
}
function showModal(html){
  modal.innerHTML = html;
  modalOverlay.classList.remove("hidden");
}
function closeModal(){ modalOverlay.classList.add("hidden"); modal.innerHTML = ""; }

// -------- login logic (very simple client-side password) --------
function showMain(){ loginScreen.classList.add("hidden"); mainApp.classList.remove("hidden"); startRealtime(); }
function showLogin(){ mainApp.classList.add("hidden"); loginScreen.classList.remove("hidden"); }

loginBtn.addEventListener("click", ()=>{
  const v = adminPassInput.value.trim();
  if(v === ADMIN_PASSWORD){
    showMain();
    adminPassInput.value = "";
  } else {
    alert("Wrong password!");
  }
});
logoutBtn.addEventListener("click", ()=>{
  if(confirm("Logout?")) showLogin();
});

// -------- debitor CRUD and realtime --------
const debtorsCol = collection(db, "debtors");

function renderDebtorItem(id, data){
  const el = document.createElement("div");
  el.className = "itemCard";
  el.dataset.id = id;
  el.innerHTML = `
    <div class="meta">
      <div class="itemName">${escapeHtml(data.name)}</div>
      <div class="itemSmall muted">Added: ${data.dateAdded ? formatTS(data.dateAdded) : "—"}</div>
    </div>
    <div style="text-align:right;">
      <div class="badge">${currency(data.totalOwed || 0)}</div>
    </div>
  `;
  el.addEventListener("click", ()=> openDebtorDetail(id));
  return el;
}

let unsubDebtors = null;
function startRealtime(){
  // listen to debtors collection (ordered newest first by timestamp)
  const q = query(debtorsCol, orderBy("dateAdded", "desc"));
  if(unsubDebtors) unsubDebtors();
  unsubDebtors = onSnapshot(q, (snap)=>{
    debtorsList.innerHTML = "";
    let count = 0;
    snap.forEach(docSnap=>{
      count++;
      const data = docSnap.data();
      debtorsList.appendChild(renderDebtorItem(docSnap.id, data));
    });
    totalDebtors.textContent = `${count} total`;
  }, (err)=> console.error(err));
}

// Add debtor
addDebtorBtn.addEventListener("click", ()=>{
  showModal(`
    <h3>Add Debtor</h3>
    <div class="formRow"><label>Name</label><input id="m_name" /></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <button id="m_cancel" class="btn ghost">Cancel</button>
      <button id="m_save" class="btn primary">Save</button>
    </div>
  `);
  document.getElementById("m_cancel").onclick = closeModal;
  document.getElementById("m_save").onclick = async ()=>{
    const name = document.getElementById("m_name").value.trim();
    if(!name){ alert("Enter name"); return; }
    await addDoc(debtorsCol, {
      name,
      dateAdded: serverTimestamp(),
      dateEdited: serverTimestamp(),
      totalOwed: 0
    });
    closeModal();
  };
});

// open debtor detail (load items subcollection and listen realtime)
async function openDebtorDetail(id){
  currentDebtorId = id;
  emptyDetail.classList.add("hidden");
  debtorDetail.classList.remove("hidden");
  // get debtor doc to show names/dates
  const dRef = doc(db, "debtors", id);
  const dSnap = await getDoc(dRef);
  if(dSnap.exists()){
    const d = dSnap.data();
    debtorNameEl.textContent = d.name;
    dateAddedEl.textContent = formatTS(d.dateAdded);
    dateEditedEl.textContent = formatTS(d.dateEdited);
  }

  // items (subcollection)
  const itemsCol = collection(dRef, "items");
  // realtime items
  if(currentDebtorId) {
    // remove previous items listener if exists by using a closure
  }
  // create query by added time
  const q = query(itemsCol, orderBy("dateAdded", "desc"));
  // unsubscribe previous if stored
  if(window._itemsUnsub) window._itemsUnsub();
  window._itemsUnsub = onSnapshot(q, async snap=>{
    itemsListEl.innerHTML = "";
    let total = 0;
    snap.forEach(itemDoc=>{
      const it = itemDoc.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(it.name)}</td>
        <td>${currency(it.price)}</td>
        <td>${it.paid ? `<span class="badge">Paid (${formatTS(it.datePaid)})</span>` : `<span class="badge">Unpaid</span>`}</td>
        <td class="actions">
          ${it.paid ? `<button class="btn ghost" data-action="del" data-id="${itemDoc.id}">Delete</button>` : `<button class="btn" data-action="pay" data-id="${itemDoc.id}">Paid</button>`}
          <button class="btn ghost" data-action="edit" data-id="${itemDoc.id}">Edit</button>
        </td>
      `;
      itemsListEl.appendChild(tr);
      if(!it.paid) total += Number(it.price || 0);
    });
    totalOwedEl.textContent = currency(total);

    // attach actions after rendering
    itemsListEl.querySelectorAll("button").forEach(b=>{
      b.addEventListener("click", async (ev)=>{
        const act = b.dataset.action;
        const itemId = b.dataset.id;
        if(act === "pay"){
          const itemRef = doc(dRef, "items", itemId);
          await updateDoc(itemRef, { paid: true, datePaid: serverTimestamp() });
          // update totalOwed on parent debtor
          await recalcTotal(dRef);
        } else if(act === "del"){
          if(confirm("Delete this item?")) {
            await deleteDoc(doc(dRef, "items", itemId));
            await recalcTotal(dRef);
          }
        } else if(act === "edit"){
          const itemDoc = await getDoc(doc(dRef, "items", itemId));
          const it = itemDoc.data();
          showModal(`
            <h3>Edit Item</h3>
            <div class="formRow"><label>Item</label><input id="m_iname" value="${escapeAttr(it.name)}" /></div>
            <div class="formRow"><label>Price</label><input id="m_iprice" type="number" value="${it.price}" /></div>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button id="m_cancel2" class="btn ghost">Cancel</button>
              <button id="m_save2" class="btn primary">Save</button>
            </div>
          `);
          document.getElementById("m_cancel2").onclick = closeModal;
          document.getElementById("m_save2").onclick = async ()=>{
            const iname = document.getElementById("m_iname").value.trim();
            const iprice = Number(document.getElementById("m_iprice").value || 0);
            if(!iname){ alert("Item name required"); return; }
            await updateDoc(doc(dRef, "items", itemId), {
              name: iname, price: iprice
            });
            await updateDoc(dRef, { dateEdited: serverTimestamp() });
            await recalcTotal(dRef);
            closeModal();
          };
        }
      });
    });

    // reflect total on parent doc as well
    await updateDoc(dRef, { totalOwed: total, dateEdited: serverTimestamp() }).catch(()=>{});
  }, err => console.error(err));
}

// add item button
addItemBtn.addEventListener("click", async ()=>{
  if(!currentDebtorId){ alert("Select a debtor first"); return; }
  const name = itemNameInput.value.trim(); const price = Number(itemPriceInput.value || 0);
  if(!name){ alert("Enter item name"); return; }
  const dRef = doc(db, "debtors", currentDebtorId);
  await addDoc(collection(dRef, "items"), {
    name, price, paid: false, dateAdded: serverTimestamp()
  });
  await updateDoc(dRef, { dateEdited: serverTimestamp() });
  itemNameInput.value = ""; itemPriceInput.value = "";
  await recalcTotal(dRef);
});

// recalc parent total from items
async function recalcTotal(dRef){
  const itemsSnap = await getDocs(collection(dRef, "items"));
  let total = 0;
  itemsSnap.forEach(it => {
    const data = it.data();
    if(!data.paid) total += Number(data.price || 0);
  });
  await updateDoc(dRef, { totalOwed: total }).catch(()=>{});
}

// edit debtor
editDebtorBtn.addEventListener("click", async ()=>{
  if(!currentDebtorId) return;
  const dRef = doc(db, "debtors", currentDebtorId);
  const dSnap = await getDoc(dRef);
  const d = dSnap.data();
  showModal(`
    <h3>Edit Debtor</h3>
    <div class="formRow"><label>Name</label><input id="m_name_edit" value="${escapeAttr(d.name)}" /></div>
    <div style="display:flex;justify-content:flex-end;gap:8px;">
      <button id="m_cancel" class="btn ghost">Cancel</button>
      <button id="m_save" class="btn primary">Save</button>
    </div>
  `);
  document.getElementById("m_cancel").onclick = closeModal;
  document.getElementById("m_save").onclick = async ()=>{
    const newName = document.getElementById("m_name_edit").value.trim();
    if(!newName){ alert("Enter name"); return; }
    await updateDoc(dRef, { name: newName, dateEdited: serverTimestamp() });
    closeModal();
  };
});

// paid all
paidAllBtn.addEventListener("click", async ()=>{
  if(!currentDebtorId) return;
  if(!confirm("Mark all items as paid?")) return;
  const dRef = doc(db, "debtors", currentDebtorId);
  const itemsSnap = await getDocs(collection(dRef, "items"));
  const promises = [];
  itemsSnap.forEach(it => {
    if(!it.data().paid){
      promises.push(updateDoc(doc(dRef, "items", it.id), { paid: true, datePaid: serverTimestamp() }));
    }
  });
  await Promise.all(promises);
  await recalcTotal(dRef);
  await updateDoc(dRef, { dateEdited: serverTimestamp() });
});

// delete debtor (and all items)
deleteDebtorBtn.addEventListener("click", async ()=>{
  if(!currentDebtorId) return;
  if(!confirm("Delete debtor and all its items?")) return;
  const dRef = doc(db, "debtors", currentDebtorId);
  // delete items first
  const itemsSnap = await getDocs(collection(dRef, "items"));
  const delPromises = [];
  itemsSnap.forEach(it => delPromises.push(deleteDoc(doc(dRef, "items", it.id))));
  await Promise.all(delPromises);
  await deleteDoc(dRef);
  // close detail view
  currentDebtorId = null;
  debtorDetail.classList.add("hidden");
  emptyDetail.classList.remove("hidden");
});

// click outside modal to close
modalOverlay.addEventListener("click", (ev)=>{ if(ev.target === modalOverlay) closeModal(); });

// helper: escape HTML
function escapeHtml(str){ return String(str || "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;"); }
function escapeAttr(str){ return String(str || "").replaceAll('"','&quot;').replaceAll("'", "&#39;"); }

// initial page state
showLogin();
