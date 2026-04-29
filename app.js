// ═══════════════════════════════════════════════════════════
//  app.js — Gestor de Escriba | Lineage 2 Reborn
// ═══════════════════════════════════════════════════════════
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, addDoc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { searchItems, GRADE_COLORS, CATEGORY_LABELS } from "./items-db.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6xShtl4OpVtoFjUsGMB9jMAKqNxLSjrU",
  authDomain: "l2-escriba.firebaseapp.com",
  projectId: "l2-escriba",
  storageBucket: "l2-escriba.firebasestorage.app",
  messagingSenderId: "747384166402",
  appId: "1:747384166402:web:7c64d9a1fa6d98fd98ef1b"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── STATE ────────────────────────────────────────────────
const CLAN_ID = "main-clan";
let STATE = {
  page: "dashboard",
  clanName: localStorage.getItem("clanName") || "Mi Clan",
  members: [],
  warehouse: [],
  crafts: [],
  treasury: [],
  loans: [],
  desired: [],
  equipment: [],
  events: [],
  weeklyMissions: [],
  globalItems: [],
  isAdmin: localStorage.getItem("adminAuth") === "true"
};
let modalCallback = null;

// ── BOOT ────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  updateSyncStatus("connecting");
  document.getElementById("clan-name-text").textContent = STATE.clanName;
  setupNav();
  await loadAll();
  updateSyncStatus("online");
  navigate("dashboard");
});

// ── SYNC STATUS ──────────────────────────────────────────
function updateSyncStatus(s) {
  const btn = document.getElementById("sync-status");
  const txt = document.getElementById("sync-text");
  if (s === "online") { btn.style.color = "#2ecc71"; txt.textContent = "En línea"; }
  else if (s === "offline") { btn.style.color = "#e03535"; txt.textContent = "Sin conexión"; }
  else { btn.style.color = "#d4a017"; txt.textContent = "Conectando..."; }
}

// ── LOAD ALL ────────────────────────────────────────────
async function loadAll() {
  try {
    // 🎨 ESCUCHA EN VIVO: Miembros
    onSnapshot(collection(db, `clans/${CLAN_ID}/members`), (snap) => {
      STATE.members = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.nickname || "").localeCompare(b.nickname || ""));
      // Si estamos en la página de miembros, repintar
      if (STATE.page === "members") window.members();
      if (STATE.page === "member-details") window.showMemberDetails();
    });

    // 🎨 ESCUCHA EN VIVO: Préstamos
    onSnapshot(collection(db, `clans/${CLAN_ID}/loans`), (snap) => {
      STATE.loans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      updateLoansBadge();
      if (STATE.page === "loans") window.loans();
      if (STATE.page === "member-details") window.showMemberDetails();
    });

    // 🎨 ESCUCHA EN VIVO: Equipamiento
    onSnapshot(collection(db, `clans/${CLAN_ID}/equipment`), (snap) => {
      STATE.equipment = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (STATE.page === "equipment") window.equipment();
      if (STATE.page === "member-details") window.showMemberDetails();
    });

    // 🎨 ESCUCHA EN VIVO: Deseado
    onSnapshot(collection(db, `clans/${CLAN_ID}/desired`), (snap) => {
      STATE.desired = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      updateDesiredBadge();
      if (STATE.page === "desired") window.desired();
      if (STATE.page === "member-details") window.showMemberDetails();
    });

    // 🎨 ESCUCHA EN VIVO: Misión Semanal
    onSnapshot(collection(db, `clans/${CLAN_ID}/weeklyMissions`), (snap) => {
      STATE.weeklyMissions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      if (STATE.page === "weeklyMissions") window.weeklyMissions();
    });

    const [w, c, t, e, gi] = await Promise.all([
      getDocs(collection(db, `clans/${CLAN_ID}/warehouse`)),
      getDocs(collection(db, `clans/${CLAN_ID}/crafts`)),
      getDocs(collection(db, `clans/${CLAN_ID}/treasury`)),
      getDocs(collection(db, `clans/${CLAN_ID}/events`)),
      getDocs(collection(db, `global_items`)),
    ]);
    STATE.warehouse = w.docs.map(d => ({ id: d.id, ...d.data() }));
    STATE.crafts = c.docs.map(d => ({ id: d.id, ...d.data() }));
    STATE.treasury = t.docs.map(d => ({ id: d.id, ...d.data() }));
    STATE.events = e.docs.map(d => ({ id: d.id, ...d.data() }));
    STATE.globalItems = gi.docs.map(d => ({ id: d.id, ...d.data() }));

    if (!STATE.globalItems.length && window.BD_ITEMS) {
      STATE.globalItems = window.BD_ITEMS;
    }
  } catch (err) {
    updateSyncStatus("offline");
    toast("Error al cargar datos: " + err.message, "error");
  }
}

async function saveDoc(colPath, id, data) {
  if (id) { await updateDoc(doc(db, colPath, id), data); }
  else { const ref = await addDoc(collection(db, colPath), data); return ref.id; }
}
async function delDoc(colPath, id) { await deleteDoc(doc(db, colPath, id)); }

// ── GLOBAL EXPORTS (consumed by app2.js) ─────────────────
window.STATE = STATE;
window.CLAN_ID = CLAN_ID;
window.fmt = fmt;
window.fmtDate = fmtDate;
window.memberName = memberName;
window.memberOptions = memberOptions;
window.updateLoansBadge = updateLoansBadge;
window.updateDesiredBadge = updateDesiredBadge;
window.saveFireDoc = saveDoc;
window.delFireDoc = delDoc;
window.openModal = openModal;
window.members = members;   // ← exponer al scope global para que funcione onchange="members()"

// ── NAV ──────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: "Dashboard", members: "Miembros del Clan", warehouse: "Almacén del Clan",
  crafts: "Crafts & Materiales", treasury: "Tesorería", loans: "Préstamos & Deudas", desired: "Items Deseados", equipment: "Equipamiento de Miembros", events: "Eventos",
  weeklyMissions: "Misión Semanal",
  dbmanager: "Gestor L2 DB Master", "member-details": "Perfil del Miembro"
};
const ADD_LABELS = {
  dashboard: "", members: "Nuevo Miembro", warehouse: "Nuevo Item", crafts: "Nuevo Craft",
  treasury: "Nueva Transacción", loans: "Nuevo Préstamo", desired: "Nuevo Deseo", equipment: "Añadir Equipamiento", events: "Nuevo Evento",
  weeklyMissions: "Nueva Semana",
  dbmanager: "Nuevo Item L2"
};

function setupNav() {
  document.querySelectorAll(".nav-item").forEach(el => {
    el.addEventListener("click", () => navigate(el.dataset.page));
  });
}

function navigate(page) {
  const adminOnlyPages = ["dbmanager", "warehouse", "treasury", "loans", "equipment"];
  if (adminOnlyPages.includes(page) && !STATE.isAdmin) return toast("Acceso denegado", "error");
  STATE.page = page;
  document.querySelectorAll(".nav-item").forEach(el =>
    el.classList.toggle("active", el.dataset.page === page)
  );
  document.getElementById("page-title").textContent = PAGE_TITLES[page] || page;
  const lbl = ADD_LABELS[page];
  const btn = document.getElementById("btn-add");
  // Ocultar botón "Nuevo" si no es admin, salvo que lo queramos permitir (en este requerimiento SOLO el admin tiene poder)
  btn.style.display = (lbl && STATE.isAdmin) ? "flex" : "none";
  document.getElementById("btn-add-label").textContent = lbl;

  const btnLogin = document.getElementById("btn-login");
  const btnLoginTxt = document.getElementById("btn-login-text");
  if (STATE.isAdmin) {
    btnLogin.style.color = "var(--red)";
    btnLogin.querySelector("i").className = "ri-logout-box-r-line";
    btnLoginTxt.textContent = "Salir";
  } else {
    btnLogin.style.color = "var(--text2)";
    btnLogin.querySelector("i").className = "ri-shield-user-line";
    btnLoginTxt.textContent = "Login Admin";
  }

  const adminSections = document.querySelectorAll(".admin-section");
  adminSections.forEach(el => el.style.display = STATE.isAdmin ? "block" : "none");

  const adminItems = document.querySelectorAll(".admin-item");
  adminItems.forEach(el => el.style.display = STATE.isAdmin ? "flex" : "none");

  const renders = {
    dashboard, members,
    warehouse: window.warehouse,
    crafts: window.crafts,
    treasury: window.treasury,
    loans: window.loans,
    desired: window.desired,
    equipment: window.equipment,
    events: window.events,
    weeklyMissions: window.weeklyMissions,
    dbmanager: window.dbmanager,
    'member-details': window.showMemberDetails
  };
  (renders[page] || (() => { }))();
}
window.navigate = navigate;

window.handleAddClick = () => {
  const fns = {
    members: addMember,
    warehouse: window.addWarehouseItem,
    crafts: window.addCraft,
    treasury: window.addTransaction,
    loans: window.addLoan,
    desired: window.addDesired,
    equipment: window.addEquipment,
    events: window.addEvent,
    weeklyMissions: window.addWeeklyMission,
    dbmanager: window.addGlobalItem
  };
  (fns[STATE.page] || (() => { }))();
};

window.toggleLogin = () => {
  if (STATE.isAdmin) {
    if (confirm("¿Cerrar sesión de administrador?")) {
      localStorage.removeItem("adminAuth");
      STATE.isAdmin = false;
      toast("Sesión cerrada", "info");
      navigate(STATE.page);
    }
  } else {
    openModal("<i class='ri-shield-keyhole-line'></i> Acceso de Administrador",
      `<div class="form-grid cols-1">
         <div class="form-row"><label>Usuario</label><input type="text" id="l-user" placeholder="Ingresa tu usuario" autocomplete="off"></div>
         <div class="form-row"><label>Contraseña</label><input type="password" id="l-pass" placeholder="Ingresa tu contraseña"></div>
       </div>`,
      () => {
        const u = document.getElementById("l-user").value.trim();
        const p = document.getElementById("l-pass").value;
        const validAdmins = [
          { u: "Leocraft", p: "Leodan3010" },
          { u: "Trickster", p: "Trickster123" },
          { u: "Selvis", p: "Selvis123" }
        ];

        const match = validAdmins.find(x => x.u === u && x.p === p);
        if (match) {
          localStorage.setItem("adminAuth", "true");
          STATE.isAdmin = true;
          toast(`Bienvenido, ${match.u}`, "success");
          navigate(STATE.page);
          return true; // cierra modal
        } else {
          toast("Credenciales incorrectas", "error");
          return false; // no cierra el modal
        }
      }, "Ingresar"
    );
  }
};

window.db = db; // Expose DB for Seed Script in app3
window.collection = collection;
window.setDoc = setDoc;
window.doc = doc;

// ── TOAST ──────────────────────────────────────────────
window.toast = function (msg, type = "info") {
  const wrap = document.getElementById("toast");
  const el = document.createElement("div");
  el.className = `toast-item toast-${type}`;
  const icons = { success: "ri-check-circle-line", error: "ri-error-warning-line", info: "ri-information-line" };
  el.innerHTML = `<i class="${icons[type] || icons.info}"></i>${msg}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 3000);
};

// ── MODAL ─────────────────────────────────────────────
function openModal(title, bodyHTML, onConfirm, confirmLabel = "Guardar") {
  document.getElementById("modal-title").innerHTML = title;
  document.getElementById("modal-body").innerHTML = bodyHTML;
  document.getElementById("modal-confirm").textContent = confirmLabel;
  document.getElementById("modal-overlay").classList.add("show");
  modalCallback = onConfirm;

  setTimeout(() => {
    if (window.flatpickr) {
      flatpickr('input[type="date"]', {
        locale: "es",
        dateFormat: "Y-m-d"
      });
    }
  }, 10);
}
window.cancelModalClick = () => {
  if (modalCallback && !confirm("¿Estás seguro que deseas cerrar la ventana? Perderás los datos que no hayas guardado.")) {
    return;
  }
  document.getElementById("modal-overlay").classList.remove("show");
  modalCallback = null;
};
window.closeModal = (e) => {
  if (e && e.target !== document.getElementById("modal-overlay")) return;
  window.cancelModalClick();
};
window.modalConfirm = async () => {
  if (modalCallback) {
    const ok = await modalCallback();
    if (ok !== false) document.getElementById("modal-overlay").classList.remove("show");
  }
};

// ── CLAN RENAME ───────────────────────────────────────
window.renameClan = () => {
  if (!STATE.isAdmin) return toast("Sin usuario solo puedes visualizar", "error");
  openModal("<i class='ri-edit-2-line'></i> Renombrar Clan",
    `<div class="form-row"><label>Nombre del Clan</label><input id="clan-input" value="${STATE.clanName}"></div>`,
    () => {
      const v = document.getElementById("clan-input").value.trim();
      if (!v) return false;
      STATE.clanName = v;
      localStorage.setItem("clanName", v);
      document.getElementById("clan-name-text").textContent = v;
      toast("Clan renombrado", "success");
    }
  );
};

// ── UTIL ──────────────────────────────────────────────
function fmt(n) { return Number(n).toLocaleString("es-ES"); }
function fmtDate(ts) {
  if (!ts) return "—";
  let d;
  if (ts.toDate) {
    d = ts.toDate();
  } else if (typeof ts === "string" && /^\d{4}-\d{2}-\d{2}$/.test(ts)) {
    d = new Date(ts + "T12:00:00");
  } else {
    d = new Date(ts);
  }
  return d.toLocaleDateString("es-ES");
}
function memberName(id) {
  const m = STATE.members.find(m => m.id === id);
  return m ? m.nickname : id || "—";
}
function memberOptions(selected = "") {
  return STATE.members.map(m =>
    `<option value="${m.id}" ${m.id === selected ? "selected" : ""}>${m.nickname}</option>`
  ).join("");
}
function updateLoansBadge() {
  const overdue = STATE.loans.filter(l => l.status === "active" || l.status === "overdue").length;
  const b = document.getElementById("loans-badge");
  if (b) { b.textContent = overdue; b.style.display = overdue ? "" : "none"; }
}
function updateDesiredBadge() {
  const active = STATE.desired.filter(d => d.status === "active").length;
  const b = document.getElementById("desired-badge");
  if (b) { b.textContent = active; b.style.display = active ? "" : "none"; }
}

// ── DASHBOARD ────────────────────────────────────────
function dashboard() {
  const activeMembers = STATE.members.filter(m => m.status === "active").length;
  const totalItems = STATE.warehouse.length;
  const activeLoans = STATE.loans.filter(l => l.status === "active" || l.status === "overdue").length;
  const balance = STATE.treasury.reduce((a, t) => a + (t.type === "income" ? +t.amount : -+t.amount), 0);
  const activeCrafts = STATE.crafts.filter(c => c.status === "active").length;
  const totalEvents = STATE.events.length;

  const overdue = STATE.loans.filter(l => {
    if (!l.dueDate || l.status !== "active") return false;
    return new Date(l.dueDate) < new Date();
  });
  const alerts = overdue.map(l =>
    `<div class="alert-card" style="margin-bottom:8px">
      <i class="ri-alarm-warning-line"></i>
      Préstamo vencido: <b>${memberName(l.fromId)} → ${memberName(l.toId)}</b>
      — ${l.itemName || fmt(l.amount) + " Adena"}
    </div>`
  ).join("");

  // Leaderboard de puntos
  const lbData = STATE.members.map(m => {
    const pts = STATE.events.reduce((sum, ev) => {
      const p = (ev.participants || []).find(p => p.memberId === m.id);
      return sum + (p ? +p.points : 0);
    }, 0);
    return { name: m.nickname, pts };
  }).sort((a, b) => b.pts - a.pts).slice(0, 5);

  const lb = lbData.length ? lbData.map((x, i) =>
    `<div class="leaderboard-item">
      <div class="lb-rank ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}">${i === 0 ? '<i class="ri-medal-fill" style="color:#d4af37"></i>' : i === 1 ? '<i class="ri-medal-fill" style="color:#c0c0c0"></i>' : i === 2 ? '<i class="ri-medal-fill" style="color:#cd7f32"></i>' : i + 1}</div>
      <div class="lb-name">${x.name}</div>
      <div class="lb-points">${fmt(x.pts)} <small style="color:var(--text3);font-size:.7rem">pts</small></div>
    </div>`
  ).join("") : `<div class="empty-state"><i class="ri-trophy-line"></i><p>Sin datos de eventos aún</p></div>`;

  document.getElementById("content").innerHTML = `
    <div class="stats-grid">
      <div class="stat-card" onclick="window.navigate('members')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-group-line"></i></div><div class="stat-label">Miembros Activos</div>
        <div class="stat-value">${activeMembers}</div><div class="stat-sub">${STATE.members.length} total</div>
      </div>
      ${STATE.isAdmin ? `
      <div class="stat-card" onclick="window.navigate('warehouse')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-archive-2-line"></i></div><div class="stat-label">Items en Almacén</div>
        <div class="stat-value">${totalItems}</div>
      </div>
      <div class="stat-card" onclick="window.navigate('loans')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-hand-coin-line"></i></div><div class="stat-label">Préstamos Activos</div>
        <div class="stat-value" style="${activeLoans > 0 ? 'color:var(--red)' : ''}">${activeLoans}</div>
      </div>
      <div class="stat-card" onclick="window.navigate('treasury')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-coins-line"></i></div><div class="stat-label">Balance Tesorería</div>
        <div class="stat-value" style="font-size:1.1rem;${balance < 0 ? 'color:var(--red)' : ''}">${fmt(balance)}</div>
        <div class="stat-sub">Adena</div>
      </div>
      ` : ''}
      <div class="stat-card" onclick="window.navigate('crafts')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-hammer-line"></i></div><div class="stat-label">Crafts en Progreso</div>
        <div class="stat-value">${activeCrafts}</div>
      </div>
      <div class="stat-card" onclick="window.navigate('events')" style="cursor:pointer">
        <div class="stat-icon"><i class="ri-calendar-event-line"></i></div><div class="stat-label">Eventos</div>
        <div class="stat-value">${totalEvents}</div>
      </div>
      ${STATE.isAdmin ? `
      <div class="stat-card" onclick="window.navigate('equipment')" style="cursor:pointer; display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:80px">
        <div class="stat-icon" style="margin-bottom:8px"><i class="ri-shield-user-line" style="font-size:2rem"></i></div>
        <div class="stat-label" style="font-size:1.1rem; font-weight:600; text-align:center">Equipamiento</div>
      </div>
      ` : ''}
    </div>
    ${alerts ? `<div style="margin-bottom:16px">${alerts}</div>` : ""}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card" onclick="window.navigate('events'); setTimeout(()=>window.showRanking && window.showRanking(), 50)" style="cursor:pointer" title="Ver tabla de puntos">
        <div class="card-title"><i class="ri-trophy-line"></i> ${STATE.isAdmin ? 'Top Miembros por Puntos' : 'Clasificación de Participación'} <i class="ri-arrow-right-s-line" style="margin-left:auto;opacity:.5"></i></div>
        ${lb}
      </div>
      <div class="card" onclick="window.navigate('loans')" style="cursor:pointer" title="Ver actividad">
        <div class="card-title"><i class="ri-history-line"></i> Actividad Reciente <i class="ri-arrow-right-s-line" style="margin-left:auto;opacity:.5"></i></div>
        ${recentActivity()}
      </div>
    </div>`;
}

function recentActivity() {
  const items = [];
  STATE.loans.slice(-3).reverse().forEach(l =>
    items.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:.8rem">
      <i class="ri-hand-coin-line" style="color:var(--text3)"></i> Préstamo: <b>${memberName(l.fromId)} → ${memberName(l.toId)}</b><br>
      <span style="color:var(--text3)">${l.itemName || fmt(l.amount) + " Adena"}</span>
    </div>`)
  );
  STATE.events.slice(-2).reverse().forEach(e => {
    // Para no-admin: ocultar eventos que no sean de Clan Principal
    if (!STATE.isAdmin && (e.category && e.category !== "main")) return;
    items.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border);font-size:.8rem">
      <i class="ri-calendar-event-line" style="color:var(--text3)"></i> Evento: <b>${e.name}</b><br>
      <span style="color:var(--text3)">${(e.participants || []).length} participantes</span>
    </div>`);
  });
  return items.length ? items.join("") :
    `<div class="empty-state"><i class="ri-history-line"></i><p>Sin actividad reciente</p></div>`;
}

// ── MEMBERS ───────────────────────────────────────────
const RACE_LIST = [
  { id: "human", name: "Humano", icon: "<i class='ri-user-line'></i>" },
  { id: "elf", name: "Elfo", icon: "<i class='ri-leaf-line'></i>" },
  { id: "darkelf", name: "Elfo Oscuro", icon: "<i class='ri-moon-line'></i>" },
  { id: "orc", name: "Orco", icon: "<i class='ri-fire-line'></i>" },
  { id: "dwarf", name: "Enano", icon: "<i class='ri-hammer-line'></i>" },
  { id: "kamael", name: "Kamael", icon: "<i class='ri-sword-line'></i>" }
];

// Árbol de clases completo — Lineage 2 High Five
const CLASS_DATA = {
  starter: [
    "Dark Elf Fighter", "Dark Elf Mystic",
    "Dwarven Fighter",
    "Elven Fighter", "Elven Mystic",
    "Human Fighter", "Human Mystic",
    "Kamael Soldier",
    "Orc Fighter", "Orc Mystic",
  ],
  first: [
    "Arbalester",    // Kamael ♀
    "Artisan",       // Enano
    "Assassin",      // Elfo Oscuro
    "Cleric",        // Humano
    "Dark Wizard",   // Elfo Oscuro Místico
    "Elven Knight",  // Elfo
    "Elven Scout",   // Elfo
    "Elven Wizard",  // Elfo Místico
    "Knight",        // Humano
    "Monk",          // Orco
    "Orc Raider",    // Orco
    "Palus Knight",  // Elfo Oscuro
    "Rogue",         // Humano
    "Scavenger",     // Enano
    "Shaman",        // Orco Místico
    "Trooper",       // Kamael ♂
    "Warder",        // Kamael
    "Warrior",       // Humano
    "Wizard",        // Humano
  ],
  second: [
    "Abyss Walker",    // Elfo Oscuro
    "Berserker",       // Kamael
    "Bishop",          // Humano
    "Bladedancer",     // Elfo Oscuro
    "Bounty Hunter",   // Enano
    "Dark Avenger",    // Humano
    "Destroyer",       // Orco
    "Elven Elder",     // Elfo
    "Gladiator",       // Humano
    "Hawkeye",         // Humano
    "Necromancer",     // Humano
    "Overlord",        // Orco
    "Paladin",         // Humano
    "Phantom Ranger",  // Elfo Oscuro
    "Plains Walker",   // Elfo
    "Prophet",         // Humano
    "Shillien Elder",  // Elfo Oscuro
    "Shillien Knight", // Elfo Oscuro
    "Silver Ranger",   // Elfo
    "Sorcerer",        // Humano
    "Soul Breaker",    // Kamael
    "Spellhowler",     // Elfo Oscuro
    "Spellsinger",     // Elfo
    "Swordsinger",     // Elfo
    "Temple Knight",   // Elfo
    "Treasure Hunter", // Humano
    "Tyrant",          // Orco
    "Warcryer",        // Orco
    "Warlock",         // Humano
    "Warlord",         // Humano
    "Warsmith",        // Enano
  ],
  third: [
    "Adventurer",         // Humano (Treasure Hunter)
    "Arcana Lord",        // Humano (Warlock)
    "Archmage",           // Humano (Sorcerer)
    "Cardinal",           // Humano (Bishop)
    "Dominator",          // Orco (Overlord)
    "Doomcryer",          // Orco (Warcryer)
    "Dreadnought",        // Humano (Warlord)
    "Duelist",            // Humano (Gladiator)
    "Elemental Master",   // Elfo (Elven Elder)
    "Eva's Templar",      // Elfo (Temple Knight)
    "Fortune Seeker",     // Enano (Bounty Hunter)
    "Ghost Hunter",       // Elfo Oscuro (Abyss Walker)
    "Ghost Sentinel",     // Elfo Oscuro (Phantom Ranger)
    "Grand Khavatari",    // Orco (Tyrant)
    "Hell Knight",        // Humano (Dark Avenger)
    "Hierophant",         // Humano (Prophet)
    "Inspector",          // Kamael
    "Judicator",          // Kamael ♀
    "Maestro",            // Enano (Warsmith)
    "Moonlight Sentinel", // Elfo (Silver Ranger)
    "Mystic Muse",        // Elfo (Spellsinger)
    "Phoenix Knight",     // Humano (Paladin)
    "Sagittarius",        // Humano (Hawkeye)
    "Shillien Saint",     // Elfo Oscuro (Shillien Elder)
    "Shillien Templar",   // Elfo Oscuro (Shillien Knight)
    "Soul Hound",         // Kamael ♂
    "Soultaker",          // Humano (Necromancer)
    "Spectral Dancer",    // Elfo Oscuro (Bladedancer)
    "Storm Screamer",     // Elfo Oscuro (Spellhowler)
    "Sword Muse",         // Elfo (Swordsinger)
    "Titan",              // Orco (Destroyer)
    "Wind Rider",         // Elfo (Plains Walker)
  ],
};
const TIER_LABELS = {
  starter: "<i class='ri-star-line' style='color:var(--text3)'></i> Clase Base",
  first: "<i class='ri-sword-line' style='color:var(--text3)'></i> 1ra Clase",
  second: "<i class='ri-star-fill' style='color:var(--gold)'></i> 2da Clase",
  third: "<i class='ri-vip-crown-line' style='color:var(--purple)'></i> 3ra Clase",
};
// Mapa inverso clase → tier
const CLASS_TIER_MAP = {};
Object.entries(CLASS_DATA).forEach(([tier, arr]) => arr.forEach(c => { CLASS_TIER_MAP[c] = tier; }));
// Lista plana ordenada A-Z
const ALL_CLASSES_AZ = [...new Set(Object.values(CLASS_DATA).flat())].sort((a, b) => a.localeCompare("es"));

// Filtra el <select id="f-class"> según el tier elegido
window.filterClasses = () => {
  const tier = document.getElementById("f-tier")?.value || "";
  const sel = document.getElementById("f-class"); if (!sel) return;
  const current = sel.value;
  const list = tier ? [...CLASS_DATA[tier]].sort((a, b) => a.localeCompare("es")) : ALL_CLASSES_AZ;
  sel.innerHTML = list.map(c => `<option value="${c}" ${c === current ? "selected" : ""}>${c}</option>`).join("");
};

function members() {
  // ⬇ Capturar valores ANTES de destruir el DOM
  const q = (document.getElementById("mem-search")?.value || "").toLowerCase().trim();
  const fs = document.getElementById("mem-status")?.value || "";
  const fr = document.getElementById("mem-role")?.value || "";

  // 1. Filtrar
  let list = STATE.members.filter(m => {
    if (q && !m.nickname.toLowerCase().includes(q)) return false;
    if (fs && m.status !== fs) return false;
    if (fr && m.clanRole !== fr) return false;
    return true;
  });

  // 2. Ordenar alfabéticamente
  list.sort((a, b) => (a.nickname || "").localeCompare(b.nickname || ""));

  const statusBadge = s => ({
    active: "<span class='badge badge-green'>Activo</span>",
    inactive: "<span class='badge badge-gray'>Inactivo</span>",
    absent: "<span class='badge badge-gold'>Ausente</span>",
  }[s] || s);
  const roleBadge = r => ({
    leader: "<span class='badge badge-purple'>Líder</span>",
    guardian: "<span class='badge badge-blue'>Guardián</span>",
    escriba: "<span class='badge badge-cyan'>Escriba</span>",
    member: "<span class='badge badge-gray'>Miembro</span>",
  }[r] || r);

  const tierIcon = {
    starter: "<i class='ri-star-line' style='color:var(--text3)'></i>",
    first: "<i class='ri-sword-line' style='color:var(--text3)'></i>",
    second: "<i class='ri-star-fill' style='color:var(--gold)'></i>",
    third: "<i class='ri-vip-crown-line' style='color:var(--purple)'></i>"
  };
  const raceIcon = rId => RACE_LIST.find(r => r.id === rId)?.icon || "";

  const rows = list.map(m => {
    const raceDisplay = m.race ? `<span title="${RACE_LIST.find(r => r.id === m.race)?.name || m.race}">${raceIcon(m.race)}</span>` : "";
    const nobleBadge = m.isNoble
      ? `<span class="badge badge-gold" style="font-size:.65rem;padding:2px 6px"><i class="ri-vip-diamond-fill"></i> Noble</span>`
      : `<span class="badge" style="background:transparent;border:1px solid var(--border);color:var(--text3);font-size:.65rem;padding:2px 6px"><i class="ri-user-line"></i> No Noble</span>`;

    let subsHtml = "";
    if (m.subclasses && m.subclasses.length > 0) {
      const activeSubs = m.subclasses.filter(s => s.class && s.level);
      if (activeSubs.length > 0) {
        subsHtml = `<div style="display:flex;flex-direction:column;gap:2px;margin-top:4px">` +
          activeSubs.map(s => `<span style="font-size:0.7rem;color:var(--text3);background:var(--bg3);padding:1px 4px;border-radius:4px;white-space:nowrap">↪ ${s.class} <b style="color:var(--gold-light)">(${s.level})</b></span>`).join("") +
          `</div>`;
      }
    }

    return `
    <tr>
      <td>
        <div style="margin-bottom:6px;font-size:1.05rem"><b>${raceDisplay} ${m.nickname}</b></div>
        ${nobleBadge}
      </td>
      <td style="color:var(--text2)">
        <div>${tierIcon[m.classTier || CLASS_TIER_MAP[m.class]] || ""} ${m.class || "—"}</div>
        ${subsHtml}
      </td>
      <td style="vertical-align:top;padding-top:14px"><b style="color:var(--gold)">${m.level || "—"}</b></td>
      <td style="vertical-align:top;padding-top:14px">${roleBadge(m.clanRole)}</td>
      <td style="vertical-align:top;padding-top:14px">${statusBadge(m.status)}</td>
      <td style="vertical-align:top;padding-top:14px">${fmtDate(m.joinDate)}</td>
      <td style="vertical-align:top;padding-top:10px">
        ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editMember('${m.id}')" title="Editar Miembro"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delMember('${m.id}')" title="Eliminar Miembro"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="showMemberDetails('${m.id}')" title="Más Información del Miembro"><i class="ri-article-line"></i></button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="7"><div class="empty-state"><i class="ri-group-line"></i><p>No hay miembros registrados</p></div></td></tr>`;

  // 3. Renderizar
  document.getElementById("content").innerHTML = `
    <div class="filters">
      <input class="search-input" id="mem-search" placeholder="🔍 Buscar miembro..." oninput="members()" value="">
      <select class="filter-sel" id="mem-status" onchange="members()">
        <option value="">Todos los estados</option>
        <option value="active">Activo</option>
        <option value="inactive">Inactivo</option>
        <option value="absent">Ausente</option>
      </select>
      <select class="filter-sel" id="mem-role" onchange="members()">
        <option value="">Todos los roles</option>
        <option value="leader">Líder</option>
        <option value="guardian">Guardián</option>
        <option value="escriba">Escriba</option>
        <option value="member">Miembro</option>
      </select>
      <span style="margin-left:auto;color:var(--text3);font-size:.8rem">${list.length} miembro(s)</span>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Personaje</th><th>Clase</th><th>Nivel</th><th>Rol</th><th>Estado</th><th>Ingreso</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;

  // 4. ⬅ RESTAURAR valores de filtros DESPUÉS del render (esto es lo que faltaba)
  document.getElementById("mem-search").value = q;
  document.getElementById("mem-status").value = fs;
  document.getElementById("mem-role").value = fr;
}

function memberFormHTML(m = {}) {
  const detectedTier = CLASS_TIER_MAP[m.class] || m.classTier || "";
  const classesForTier = detectedTier
    ? [...CLASS_DATA[detectedTier]].sort((a, b) => a.localeCompare("es"))
    : ALL_CLASSES_AZ;

  const subs = m.subclasses || [{}, {}, {}];
  const allSubClassesHtml = ALL_CLASSES_AZ.map(c => `<option value="${c}">${c}</option>`).join("");

  // Helper macro para subclase row
  const subRow = (idx) => `
    <div style="display:grid;grid-template-columns:1fr 80px;gap:8px;margin-bottom:8px">
      <div>
        <select id="f-subclass${idx}">
          <option value="">-- Seleccionar Subclase ${idx} --</option>
          ${ALL_CLASSES_AZ.map(c => `<option value="${c}" ${c === subs[idx - 1]?.class ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div>
        <input id="f-sublevel${idx}" type="number" min="40" max="85" value="${subs[idx - 1]?.level || ""}" placeholder="Lvl">
      </div>
    </div>
  `;

  return `<div class="form-grid">
    <div class="form-row col2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
      <div><label>Nombre (Nick)</label><input id="f-nick" value="${m.nickname || ""}" required></div>
      <div><label>Raza</label>
        <select id="f-race">
          <option value="">— Seleccionar Raza —</option>
          ${RACE_LIST.map(r => `<option value="${r.id}" ${r.id === m.race ? "selected" : ""}>${r.icon} ${r.name}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="form-row"><label>Rol en el Clan</label>
      <select id="f-role">
        <option value="member" ${m.clanRole === "member" ? "selected" : ""}>Miembro</option>
        <option value="escriba" ${m.clanRole === "escriba" ? "selected" : ""}>Escriba</option>
        <option value="guardian" ${m.clanRole === "guardian" ? "selected" : ""}>Guardián</option>
        <option value="leader" ${m.clanRole === "leader" ? "selected" : ""}>Líder</option>
      </select>
    </div>
    <div class="form-row"><label>🎭 Transferencia de Clase</label>
      <select id="f-tier" onchange="filterClasses()">
        <option value="">— Todas las clases (A→Z) —</option>
        ${Object.entries(TIER_LABELS).map(([k, v]) =>
    `<option value="${k}" ${k === detectedTier ? "selected" : ""}>${v}</option>`
  ).join("")}
      </select>
    </div>
    <div class="form-row"><label>Clase</label>
      <select id="f-class">
        ${classesForTier.map(c => `<option value="${c}" ${c === m.class ? "selected" : ""}>${c}</option>`).join("")}
      </select>
    </div>
    <div class="form-row"><label>Nivel</label><input id="f-level" type="number" min="1" max="85" value="${m.level || 1}"></div>
    <div class="form-row"><label>Nobleza</label>
      <select id="f-noble">
        <option value="false" ${!m.isNoble ? "selected" : ""}>No es Noble</option>
        <option value="true" ${m.isNoble ? "selected" : "color:var(--gold)"}><i class="ri-vip-diamond-line"></i> Sí, es Noble</option>
      </select>
    </div>
    <div class="form-row col2" style="margin-top:8px;padding:12px;background:var(--bg3);border-radius:8px;border:1px solid var(--border)">
      <label style="margin-bottom:10px;color:var(--text) !important"><i class="ri-git-branch-line"></i> Subclases</label>
      ${subRow(1)}
      ${subRow(2)}
      ${subRow(3)}
      ${subRow(4)}
      ${subRow(5)}
      ${subRow(6)}
      ${subRow(7)}
    </div>
    <div class="form-row"><label>Estado</label>
      <select id="f-status">
        <option value="active" ${m.status === "active" ? "selected" : ""}>Activo</option>
        <option value="inactive" ${m.status === "inactive" ? "selected" : ""}>Inactivo</option>
        <option value="absent" ${m.status === "absent" ? "selected" : ""}>Ausente</option>
      </select>
    </div>
    <div class="form-row"><label>Fecha de Ingreso</label><input id="f-join" type="date" value="${m.joinDate || new Date().toLocaleDateString('en-CA')}"></div>
    <div class="form-row col2"><label>Notas</label><textarea id="f-notes" rows="2">${m.notes || ""}</textarea></div>
  </div>`;
}

function gatherMemberData() {
  const nick = document.getElementById("f-nick").value.trim();
  if (!nick) { toast("El nombre es obligatorio", "error"); return null; }
  const cls = document.getElementById("f-class").value;

  const subclasses = [];
  for (let i = 1; i <= 7; i++) {
    const scClass = document.getElementById(`f-subclass${i}`)?.value;
    const scLvl = document.getElementById(`f-sublevel${i}`)?.value;
    if (scClass) {
      subclasses.push({ class: scClass, level: scLvl ? +scLvl : null });
    }
  }

  return {
    nickname: nick,
    race: document.getElementById("f-race").value,
    class: cls,
    classTier: CLASS_TIER_MAP[cls] || document.getElementById("f-tier")?.value || "",
    level: +document.getElementById("f-level").value,
    isNoble: document.getElementById("f-noble").value === "true",
    subclasses,
    clanRole: document.getElementById("f-role").value,
    status: document.getElementById("f-status").value,
    joinDate: document.getElementById("f-join").value,
    notes: document.getElementById("f-notes").value
  };
}
function addMember() {
  if (!window.STATE.isAdmin) return toast("Sin usuario solo puedes visualizar", "error");
  openModal("<i class='ri-user-add-line'></i> Nuevo Miembro", memberFormHTML(), async () => {
    const data = gatherMemberData(); if (!data) return false;
    await saveDoc(`clans/${CLAN_ID}/members`, null, data);
    toast("Miembro agregado", "success");
  });
}

window.editMember = (id) => {
  if (!window.STATE.isAdmin) return toast("Sin usuario solo puedes visualizar", "error");
  const m = STATE.members.find(x => x.id === id);
  if (!m) return;
  openModal("<i class='ri-edit-2-line'></i> Editar Miembro", memberFormHTML(m), async () => {
    const data = gatherMemberData(); if (!data) return false;
    await saveDoc(`clans/${CLAN_ID}/members`, id, data);
    toast("Miembro actualizado", "success");
  });
};

window.delMember = async (id) => {
  if (!window.STATE.isAdmin) return toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este miembro?")) return;
  await delDoc(`clans/${CLAN_ID}/members`, id);
  toast("Miembro eliminado", "info");
};

// ── MEMBER DETAILS DASHBOARD ─────────────────────────────
window._currentMemberDetailsId = null;

window.showMemberDetails = function (id) {
  if (id) window._currentMemberDetailsId = id;
  else id = window._currentMemberDetailsId;
  
  if (!id) {
    window.navigate('members');
    return;
  }
  
  window.STATE.page = "member-details";
  const btn = document.getElementById("btn-add");
  if (btn) btn.style.display = "none"; // Hide general add button
  
  const m = window.STATE.members.find(x => x.id === id);
  if (!m) {
    window.navigate('members');
    return;
  }

  // Calculos
  // 1. Equipamiento
  const eq = window.STATE.equipment.filter(e => e.memberId === id);
  // 2. Deseados
  const ds = window.STATE.desired.filter(d => d.memberId === id);
  // 3. Eventos y Puntos
  const evs = window.STATE.events.filter(e => (e.participants || []).some(p => p.memberId === id));
  const totalPts = evs.reduce((sum, e) => {
    const p = e.participants.find(x => x.memberId === id);
    return sum + (p ? +p.points : 0);
  }, 0);
  // 4. Préstamos (donde sea destino o origen)
  const ln = window.STATE.loans.filter(l => l.fromId === id || l.toId === id);

  const nobleBadge = m.isNoble ? `<span class="badge badge-gold"><i class="ri-vip-diamond-fill"></i> Noble</span>` : "";
  const roleBadge = m.clanRole === "leader" ? "Líder" : m.clanRole === "guardian" ? "Guardián" : m.clanRole === "escriba" ? "Escriba" : "Miembro";
  
  const subsHtml = (m.subclasses || []).filter(s => s.class && s.level).map(s => 
    `<span style="margin-right:6px;font-size:0.8rem;color:var(--text3);background:var(--bg3);padding:2px 6px;border-radius:4px;white-space:nowrap;display:inline-block;margin-top:4px;">↪ ${s.class} <b style="color:var(--gold-light)">(${s.level})</b></span>`
  ).join("");

  document.getElementById("content").innerHTML = `
    <div style="margin-bottom:16px;">
      <button class="btn btn-ghost btn-sm" onclick="window.navigate('members')" style="gap:6px"><i class="ri-arrow-left-line"></i> Volver a Miembros</button>
    </div>
    
    <div class="card" style="margin-bottom:20px; display:flex; align-items:center; gap:20px;">
      <div style="font-size:3rem; color:var(--text3);"><i class="ri-user-smile-line"></i></div>
      <div style="flex:1">
        <h2 style="margin:0; margin-bottom:4px; display:flex; align-items:center; gap:10px;">
          ${m.nickname} 
          <span class="badge badge-gray" style="font-size:0.75rem">Lv. ${m.level}</span>
          ${m.status === 'active' ? `<span class="badge badge-green">Activo</span>` : m.status === 'inactive' ? `<span class="badge badge-gray">Inactivo</span>` : `<span class="badge badge-gold">Ausente</span>`}
          ${nobleBadge}
        </h2>
        <div style="color:var(--text2); font-size:0.95rem;">
          <span style="color:var(--gold)">${m.class}</span> — ${roleBadge}
        </div>
        <div>${subsHtml}</div>
      </div>
    </div>
    
    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
      
      <!-- EQUIPAMIENTO -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
          <b style="color:var(--gold-light)"><i class="ri-shield-user-line"></i> Equipamiento</b>
          ${window.STATE.isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="addEquipmentFor('${m.id}')" title="Añadir Equipamiento" style="padding:2px 8px; border:1px solid var(--border)">+</button>` : ''}
        </div>
        ${eq.length ? eq.map(e => `
          <div style="padding:6px 0; border-bottom:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span>${e.itemName}</span>
            <span class="badge ${e.status === 'propio' ? 'badge-green' : 'badge-blue'}" style="font-size:0.7rem">${e.status === 'propio' ? 'Propio' : 'Préstamo'}</span>
          </div>
        `).join("") : `<div class="empty-state" style="padding:20px 0"><p>Sin equipamiento</p></div>`}
      </div>

      <!-- DESEADOS -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
          <b style="color:var(--gold-light)"><i class="ri-heart-add-line"></i> Ítems Deseados</b>
          ${window.STATE.isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="addDesiredFor('${m.id}')" title="Añadir Ítem Deseado" style="padding:2px 8px; border:1px solid var(--border)">+</button>` : ''}
        </div>
        ${ds.length ? ds.map(d => `
          <div style="padding:6px 0; border-bottom:1px dashed var(--border);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="color:${d.status === 'fulfilled' ? 'var(--green)' : 'var(--text)'}">${(d.items || []).map(i=>i.name).join(", ")}</span>
              <span class="badge ${d.status === 'fulfilled' ? 'badge-green' : 'badge-blue'}" style="font-size:0.7rem">${d.status === 'fulfilled' ? 'Cumplido' : 'Pendiente'}</span>
            </div>
          </div>
        `).join("") : `<div class="empty-state" style="padding:20px 0"><p>Sin ítems deseados</p></div>`}
      </div>

      <!-- EVENTOS -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
          <b style="color:var(--gold-light)"><i class="ri-calendar-event-line"></i> Eventos Recientes</b>
          <span class="badge badge-purple" style="font-size:0.85rem">Total: ${window.fmt(totalPts)} <small>pts</small></span>
        </div>
        ${evs.length ? evs.slice(-5).reverse().map(e => {
          const pt = e.participants.find(x => x.memberId === m.id).points;
          return `<div style="padding:6px 0; border-bottom:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span style="color:var(--text2); font-size:0.85rem">${e.date ? window.fmtDate(e.date) : ''}</span>
            <span style="flex:1; margin-left:10px">${e.name}</span>
            <b style="color:var(--gold-light)">+${pt}</b>
          </div>`;
        }).join("") : `<div class="empty-state" style="padding:20px 0"><p>Sin asistencia a eventos</p></div>`}
      </div>

      <!-- PRESTAMOS / DEUDAS -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border); padding-bottom:10px; margin-bottom:10px;">
          <b style="color:var(--gold-light)"><i class="ri-hand-coin-line"></i> Préstamos y Deudas</b>
          ${window.STATE.isAdmin ? `<button class="btn btn-ghost btn-sm" onclick="addLoanFor('${m.id}')" title="Nuevo Préstamo a este miembro" style="padding:2px 8px; border:1px solid var(--border)">+</button>` : ''}
        </div>
        ${ln.length ? ln.map(l => {
          const isDebtor = l.toId === m.id;
          const other = isDebtor ? window.memberName(l.fromId) : window.memberName(l.toId);
          const verb = isDebtor ? "Recibió de" : "Prestó a";
          const color = l.status === 'active' || l.status === 'overdue' ? (isDebtor ? 'var(--red)' : 'var(--green)') : 'var(--text3)';
          const label = l.itemName ? l.itemName : (l.amount + " Adena");
          return `<div style="padding:6px 0; border-bottom:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.9rem">${verb} <b>${other}</b></span>
            <div style="text-align:right">
               <div style="color:${color}; font-weight:bold; font-size:0.9rem">${label}</div>
               <div style="font-size:0.7rem; color:var(--text3); text-transform:uppercase">${l.status}</div>
            </div>
          </div>`;
        }).join("") : `<div class="empty-state" style="padding:20px 0"><p>Sin préstamos ni deudas</p></div>`}
      </div>

    </div>
  `;
};

window.addEquipmentFor = (id) => {
  if(window.addEquipment) window.addEquipment();
  setTimeout(() => {
    const s = document.getElementById("f-eq-member");
    if(s) { s.value = id; s.disabled = true; }
  }, 50);
};

window.addDesiredFor = (id) => {
  if(window.addDesired) window.addDesired();
  setTimeout(() => {
    const s = document.getElementById("f-ds-member");
    if(s) { s.value = id; s.disabled = true; }
  }, 50);
};

window.addLoanFor = (id) => {
  if(window.addLoan) window.addLoan();
  setTimeout(() => {
    const s = document.getElementById("f-lto");
    if(s) { s.value = id; s.disabled = true; }
  }, 50);
};

// ── IMPORT ADDITIONAL MODULES ────────────────────────────
import("./app2.js?v=16");
