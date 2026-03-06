// ═══════════════════════════════════════════════════════════
// app3.js — Gestor Maestro L2 BD (Firebase)
// ═══════════════════════════════════════════════════════════
import { searchItems, L2_ITEMS as BD_ITEMS, GRADE_COLORS, CATEGORY_LABELS } from "./items-db.js";
import { CRAFT_RECIPES } from "./crafts-recipes.js";

// Herramientas Globales provenientes de app.js
const { STATE, saveFireDoc, delFireDoc, openModal, closeModal, toast } = window;

// ── VISTA PRINCIPAL (GESTIÓN DB) ──────────────────────────
window.dbmanager = function (isRender = true) {
  const q = (document.getElementById("db-search")?.value || "").toLowerCase();
  const fCat = document.getElementById("db-cat")?.value || "";
  const fGrade = document.getElementById("db-grade")?.value || "";

  // Filtrar de STATE.globalItems
  const list = STATE.globalItems.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (fCat && i.category !== fCat) return false;
    if (fGrade && i.grade !== fGrade) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const rows = list.map(i => {
    const isCraft = i.materials && i.materials.length > 0;
    const catLabel = CATEGORY_LABELS[i.category] || i.category;
    let badge = "";
    if (isCraft) badge = '<span class="badge badge-gold" title="Crafteable/Recipe"><i class="ri-magic-line"></i></span>';

    return `<tr>
      <td><span class="grade-${i.grade || 'NG'}" style="font-size:0.7rem">[${i.grade || 'NG'}]</span> <b>${i.name}</b> ${badge}</td>
      <td style="color:var(--text2)">${catLabel} / ${i.type || 'N/A'}</td>
      <td style="width:100px;text-align:right">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editGlobalItem('${i.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delGlobalItem('${i.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="3"><div class="empty-state"><i class="ri-database-2-line"></i><p>No se encontraron ítems</p></div></td></tr>`;

  // Si es primer render, crear la interfaz completa
  if (isRender || !document.getElementById("db-table-body")) {
    document.getElementById("content").innerHTML = `
        <div class="filters">
          <input class="search-input" id="db-search" placeholder="🔍 Buscar item..." oninput="dbmanager(false)" value="${q}">
          <select class="filter-sel" id="db-cat" onchange="dbmanager(false)">
            <option value="">Todas las Categorías</option>
            <option value="weapon">Armas</option>
            <option value="armor">Armaduras</option>
            <option value="jewelry">Joyería</option>
            <option value="material">Materiales</option>
            <option value="recipe">Recetas</option>
            <option value="consumable">Consumibles</option>
          </select>
          <select class="filter-sel" id="db-grade" onchange="dbmanager(false)">
            <option value="">Todos los Grados</option>
            <option value="NG">NG</option>
            <option value="D">D</option>
            <option value="C">C</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="S">S</option>
            <option value="S80">S80</option>
            <option value="S84">S84</option>
          </select>
          <span id="db-count" style="margin-left:auto;color:var(--text3);font-size:.8rem">${list.length} registros</span>
        </div>
    
        ${STATE.globalItems.length === 0 ? `
        <div class="alert-card alert-warn" style="margin-bottom:15px;cursor:pointer" onclick="seedDatabase()">
          <i class="ri-upload-cloud-2-line"></i> 
          <div><b>Atención: Base de Datos Firebase Vacía.</b><br>
          Haz click aquí para subir (Seed) toda la base de datos fija local (items+crafteos) a Firebase por primera vez. Esto transfiere todos los ítems para que todos los usuarios los consuman desde la nube.</div>
        </div>` : ''}
    
        <div class="table-wrap">
          <table>
            <thead><tr><th>Item</th><th>Categoría / Tipo</th><th></th></tr></thead>
            <tbody id="db-table-body">${rows}</tbody>
          </table>
        </div>
      `;
  } else {
    // Solo actualizar la tabla y el contador para no perder el foco del input
    document.getElementById("db-table-body").innerHTML = rows;
    document.getElementById("db-count").textContent = `${list.length} registros`;
  }
}

// ── CRUD ITEMS ────────────────────────────────────────────
window.addGlobalItem = () => editGlobalItem(null);

window.editGlobalItem = (id) => {
  const isNew = !id;
  const item = isNew ? {} : STATE.globalItems.find(i => i.id === id);
  if (!item && !isNew) return;

  // Variables para recetario local en el editor
  window._dbItemMats = item.materials ? JSON.parse(JSON.stringify(item.materials)) : [];

  const html = `
    <div class="form-row">
      <label>Nombre del Item / Receta</label>
      <input id="f-gname" type="text" value="${item.name || ''}" placeholder="Ej: Vesper Noodle" autofocus>
    </div>
    <div style="display:flex; gap:12px; margin-bottom:14px">
      <div class="form-row" style="flex:1; margin-bottom:0">
        <label>Categoría</label>
        <select id="f-gcat">
          <option value="weapon" ${item.category === 'weapon' ? 'selected' : ''}>Arma</option>
          <option value="armor" ${item.category === 'armor' ? 'selected' : ''}>Armadura</option>
          <option value="jewelry" ${item.category === 'jewelry' ? 'selected' : ''}>Joyería</option>
          <option value="material" ${item.category === 'material' ? 'selected' : ''}>Material Base</option>
          <option value="recipe" ${item.category === 'recipe' ? 'selected' : ''}>Receta</option>
          <option value="consumable" ${item.category === 'consumable' ? 'selected' : ''}>Consumible</option>
        </select>
      </div>
      <div class="form-row" style="flex:1; margin-bottom:0">
        <label>Grado</label>
        <select id="f-ggrade">
          <option value="" ${!item.grade ? 'selected' : ''}>NG (Ninguno)</option>
          <option value="D" ${item.grade === 'D' ? 'selected' : ''}>D</option>
          <option value="C" ${item.grade === 'C' ? 'selected' : ''}>C</option>
          <option value="B" ${item.grade === 'B' ? 'selected' : ''}>B</option>
          <option value="A" ${item.grade === 'A' ? 'selected' : ''}>A</option>
          <option value="S" ${item.grade === 'S' ? 'selected' : ''}>S</option>
          <option value="S80" ${item.grade === 'S80' ? 'selected' : ''}>S80</option>
          <option value="S84" ${item.grade === 'S84' ? 'selected' : ''}>S84</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <label>Sub-tipo (opcional, ej: espada, light, escudo)</label>
      <input id="f-gtype" type="text" value="${item.type || ''}" placeholder="Ej: sword">
    </div>

    <div style="border-top:1px solid var(--border); margin:16px 0; padding-top:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px">
        <label style="margin:0"><i class="ri-hammer-line"></i> Requerimientos de Crafteo</label>
        <button class="btn btn-ghost btn-sm" onclick="dbAddMatRow()"><i class="ri-add-line"></i> Mat</button>
      </div>
      <p style="font-size:0.75rem; color:var(--text3); margin-bottom:12px">Si agregas materiales aquí, este ítem se autocompletará en los Crafteos de los usuarios automáticamente.</p>
      
      <div id="db-mats-container" style="display:flex; flex-direction:column; gap:8px"></div>
    </div>
  `;

  openModal(
    `<i class='ri-database-2-line'></i> ${isNew ? 'Nuevo Item L2' : 'Editar Item'}`,
    html,
    async () => {
      const name = document.getElementById("f-gname").value.trim();
      if (!name) return toast("Agrega un nombre al ítem", "error"), false;

      // Recoger mats
      const updatedMats = [];
      document.querySelectorAll(".db-mat-row").forEach((row) => {
        const matName = row.querySelector(".db-mat-name").value.trim();
        const matQty = row.querySelector(".db-mat-qty").value;
        if (matName && matQty > 0) {
          updatedMats.push({ name: matName, needed: Number(matQty), collected: 0 }); // collected 0 base format
        }
      });

      const data = {
        name,
        category: document.getElementById("f-gcat").value,
        grade: document.getElementById("f-ggrade").value,
        type: document.getElementById("f-gtype").value,
        materials: updatedMats
      };

      try {
        const docId = await saveFireDoc("global_items", isNew ? null : id, data);
        if (isNew) {
          data.id = docId;
          STATE.globalItems.push(data);
        } else {
          Object.assign(item, data);
        }
        toast(isNew ? "Item Registrado" : "Item Actualizado", "success");
        window.dbmanager();
      } catch (e) {
        toast("Fallo al guardar en BD global: " + e.message, "error");
        return false;
      }
    }
  );

  setTimeout(renderDbMats, 50);
};

window.delGlobalItem = (id) => {
  const item = STATE.globalItems.find(i => i.id === id);
  if (!item || !confirm(`¿Estás 100% seguro de borrar para SIEMPRE el item "${item.name}" de la Base de Datos Global?`)) return;
  delFireDoc("global_items", id).then(() => {
    STATE.globalItems = STATE.globalItems.filter(i => i.id !== id);
    toast("Item eliminado de L2 DB", "success");
    window.dbmanager();
  });
};

// ── EDITOR DE MATERIALES (Modal) ──────────────────────────
window._dbItemMats = [];
window.dbAddMatRow = () => {
  window._dbItemMats.push({ name: "", needed: 1 });
  renderDbMats();
};
window.dbRmMatRow = (idx) => {
  window._dbItemMats.splice(idx, 1);
  renderDbMats();
};
window.dbUpdateMatStr = (idx, val) => { window._dbItemMats[idx].name = val; };
window.dbUpdateMatNum = (idx, val) => { window._dbItemMats[idx].needed = val; };

function renderDbMats() {
  const container = document.getElementById("db-mats-container");
  if (!container) return;
  container.innerHTML = window._dbItemMats.map((m, i) => `
    <div class="form-row col2 db-mat-row" style="margin-bottom:0">
      <div class="autocomplete-wrap">
        <input type="text" class="db-mat-name" id="db-mat-inp-${i}" value="${m.name}" placeholder="Material (ej: Iron Ore)" oninput="dbUpdateMatStr(${i}, this.value); acSearchDB(this.value, 'db-mat-inp-${i}', 'db-ac-list-${i}')" autocomplete="off">
        <div class="autocomplete-list" id="db-ac-list-${i}"></div>
      </div>
      <div style="display:flex; gap:6px">
        <input type="number" class="db-mat-qty" value="${m.needed}" min="1" placeholder="Cant." style="width:80px" oninput="dbUpdateMatNum(${i}, this.value)">
        <button class="btn btn-danger btn-icon" tabindex="-1" onclick="dbRmMatRow(${i})"><i class="ri-close-line"></i></button>
      </div>
    </div>
  `).join("");
}

// ── AUTOCOMPLETADO INTERNO PARA DB MANAGER ──────────────
window.acSearchDB = (q, inputId, listId) => {
  const list = document.getElementById(listId); if (!list) return;
  if (q.length < 2) { list.classList.remove("show"); return; }

  // Buscar en globalItems
  const results = window.STATE.globalItems.filter(item => item.name.toLowerCase().includes(q.toLowerCase())).slice(0, 15);

  let html = results.map(r =>
    `<div class="ac-item" onclick="acSelectDB('${inputId}','${listId}',\`${r.name.replace(/`/g, "'")}\`)">
      <span class="grade-${r.grade || 'NG'}" style="font-size:.7rem">[${r.grade || "NG"}]</span>
      ${r.name}
      <span style="color:var(--text3);font-size:.7rem;margin-left:auto">${window.CATEGORY_LABELS ? window.CATEGORY_LABELS[r.category] : r.category}</span>
    </div>`
  ).join("");

  // Botón "Crear nuevo si no existe"
  html += `
    <div class="ac-item" style="border-top:1px solid var(--border); background:rgba(212, 160, 23, .05); color:var(--gold-light)" onclick="openNewMatMiniModal('${inputId}','${listId}','${q}')">
      <i class="ri-add-circle-line"></i> ¿No existe? Crear "${q}"
    </div>
  `;

  list.innerHTML = html;
  list.classList.add("show");
};

window.acSelectDB = (inputId, listId, name) => {
  document.getElementById(inputId).value = name;
  document.getElementById(listId).classList.remove("show");
  // Reflejarlo en el array en memoria para este idx
  const idx = parseInt(inputId.split("-").pop());
  window._dbItemMats[idx].name = name;
};

// ── MINI MODAL PARA CREAR MATERIAL RAPIDO ───────────────
window.openNewMatMiniModal = (inputId, listId, tempName) => {
  document.getElementById(listId).classList.remove("show");

  // Reusaremos un confirm con promts simples o un HTML temporal para no pisar el Modal GIGANTE si se puede.
  // Pero como nuestro Modal no soporta anidación fluida, lo simularemos guardando el form actual o inyectando a la BD.
  // Dada la arquitectura, haremos un "Guardado Rápido a Firebase" pidiendo los datos por prompt, ya que el DB Manager está atrás.

  const isRecipe = confirm(`¿Quieres registrar "${tempName}" como un Ítem nuevo en Firebase de forma rápida?`);
  if (!isRecipe) return;

  const inputGrade = prompt(`Escribe el Grado para "${tempName}"\n(Opciones: NG, D, C, B, A, S, S80, S84)`, "NG") || "NG";
  const cat = prompt(`Escribe la categoría para "${tempName}"\n1=Material, 2=Receta, 3=Armadura, 4=Arma`, "1");

  const mapCat = { "1": "material", "2": "recipe", "3": "armor", "4": "weapon" };
  const finalCat = mapCat[cat] || "material";

  const data = {
    name: tempName,
    category: finalCat,
    grade: inputGrade.toUpperCase(),
    type: "base",
    materials: []
  };

  window.toast("Creando y guardando...", "info");
  window.saveFireDoc("global_items", null, data).then(docId => {
    data.id = docId;
    window.STATE.globalItems.push(data);
    window.acSelectDB(inputId, listId, tempName);
    window.toast(`"${tempName}" creado con éxito.`, "success");
  }).catch(e => window.toast("Error: " + e.message, "error"));
};

// ── SEED SCRIPT (UNICA VEZ) ─────────────────────────────
window.seedDatabase = async () => {
  if (!confirm("Esto subirá TODOS los ítems de items-db.js (" + BD_ITEMS.length + " en total) al Firebase. ¿Estás seguro?")) return;

  toast("Subiendo items a Firebase. ¡No cierres la pestaña!...", "info");
  let uploaded = 0;

  // Array conjunto para mandar a firebase
  const docsToUpload = [];

  for (const item of BD_ITEMS) {
    const data = { ...item };
    delete data.id; // Quitar el id local 1,2,3 para que firebase auto-asigne

    // Anexar receta si existe
    if (CRAFT_RECIPES[item.name]) {
      // Clona la receta y asegura campos
      data.materials = CRAFT_RECIPES[item.name].map(mat => ({
        name: mat.name,
        needed: Number(mat.needed),
        collected: 0 // Estado inicial standard para crafteos
      }));
    } else {
      data.materials = [];
    }

    docsToUpload.push(data);
  }

  // Iterar en chunks para no bloquear todo (Firebase Batch también se puede usar, pero lo haremos via Promises secuenciales o paralelas chicas)
  const batchSize = 25;
  try {
    for (let i = 0; i < docsToUpload.length; i += batchSize) {
      const chunk = docsToUpload.slice(i, i + batchSize);
      await Promise.all(chunk.map(d => window.saveFireDoc("global_items", null, d)));
      uploaded += chunk.length;
      document.getElementById("toast").innerHTML = `<div class="toast-item toast-info"><i class="ri-loader-4-line"></i> Subidos ${uploaded} / ${docsToUpload.length}</div>`;
    }

    toast("Seed completado. ¡" + uploaded + " ítems en Firebase!", "success");
    // Reload state de firebase
    setTimeout(() => location.reload(), 2000);

  } catch (error) {
    console.error(error);
    toast("Error en Seed (Revisar consola): " + error.message, "error");
  }
};
