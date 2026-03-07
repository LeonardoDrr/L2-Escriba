// ═══════════════════════════════════════════════════════════
// app3.js — Gestor Maestro L2 BD (Firebase)
// ═══════════════════════════════════════════════════════════
import { searchItems, L2_ITEMS as BD_ITEMS, GRADE_COLORS, CATEGORY_LABELS } from "./items-db.js";
import { CRAFT_RECIPES } from "./crafts-recipes.js";

// Herramientas Globales provenientes de app.js
const { STATE, saveFireDoc, delFireDoc, openModal, closeModal, toast } = window;

// ── VISTA PRINCIPAL (GESTIÓN DB) ──────────────────────────
window.dbmanager = function (isRender = true) {
  window._dbSelected = window._dbSelected || [];
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
    const isCraft = (i.materials && i.materials.length > 0) || (i.category && i.category.startsWith('recipe'));
    const catLabel = CATEGORY_LABELS[i.category] || i.category;
    let badge = "";
    if (isCraft) badge = '<span class="badge badge-gold" title="Crafteable/Recipe/Mat. Crafteable"><i class="ri-magic-line"></i></span>';
    const isChecked = window._dbSelected.includes(i.id) ? 'checked' : '';

    return `<tr>
      <td style="width:40px;text-align:center">
        <input type="checkbox" ${isChecked} onchange="window.dbToggleSelect('${i.id}')" style="cursor:pointer" title="Seleccionar">
      </td>
      <td><span class="grade-${i.grade || 'NG'}" style="font-size:0.7rem">[${i.grade || 'NG'}]</span> <b>${i.name}</b> ${badge}</td>
      <td style="color:var(--text2)">${catLabel} / ${i.type || 'N/A'}</td>
      <td style="width:100px;text-align:right">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="window.editGlobalItem('${i.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="window.delGlobalItem('${i.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="4"><div class="empty-state"><i class="ri-database-2-line"></i><p>No se encontraron ítems</p></div></td></tr>`;

  const allSelected = list.length > 0 && list.every(i => window._dbSelected.includes(i.id));

  // Si es primer render, crear la interfaz completa
  if (isRender || !document.getElementById("db-table-body")) {
    document.getElementById("content").innerHTML = `
        <div class="filters">
          <input class="search-input" id="db-search" placeholder="🔍 Buscar item..." oninput="window.dbmanager(false)" value="${q}">
          <select class="filter-sel" id="db-cat" onchange="window.dbmanager(false)">
            <option value="">Todas las Categorías</option>
            <option value="weapon">Armas</option>
            <option value="armor">Armaduras</option>
            <option value="jewelry">Joyería</option>
            <option value="material">Materiales</option>
            <option value="recipe">Recetas Genéricas</option>
            <option value="recipe_weapon">Receta/Arma</option>
            <option value="recipe_armor">Receta/Armadura</option>
            <option value="recipe_jewelry">Receta/Joyería</option>
            <option value="consumable">Consumibles</option>
          </select>
          <select class="filter-sel" id="db-grade" onchange="window.dbmanager(false)">
            <option value="">Todos los Grados</option>
            <option value="NG">NG</option>
            <option value="D">D</option>
            <option value="C">C</option>
            <option value="B">B</option>
            <option value="A">A</option>
            <option value="S">S</option>
            <option value="S">S</option>
          </select>
          <span id="db-count" style="margin-left:auto;color:var(--text3);font-size:.8rem">${list.length} registros</span>
          <button id="btn-db-del-sel" class="btn btn-danger btn-sm" style="display:${window._dbSelected.length > 0 ? 'flex' : 'none'};gap:5px;margin-left:10px" onclick="window.dbDeleteSelected()"><i class="ri-delete-bin-fill"></i> Borrar (${window._dbSelected.length})</button>
        </div>
    
        ${STATE.globalItems.length === 0 ? `
        <div class="alert-card alert-warn" style="margin-bottom:15px;cursor:pointer" onclick="window.seedDatabase()">
          <i class="ri-upload-cloud-2-line"></i> 
          <div><b>Atención: Base de Datos Firebase Vacía.</b><br>
          Haz click aquí para subir (Seed) toda la base de datos fija local (items+crafteos) a Firebase por primera vez. Esto transfiere todos los ítems para que todos los usuarios los consuman desde la nube.</div>
        </div>` : ''}
    
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th style="width:40px;text-align:center">
                <input type="checkbox" id="db-select-all" ${allSelected ? 'checked' : ''} onchange="window.dbToggleSelectAll()" style="cursor:pointer" title="Seleccionar/Deseleccionar todos">
              </th>
              <th>Item</th><th>Categoría / Tipo</th><th></th>
            </tr></thead>
            <tbody id="db-table-body">${rows}</tbody>
          </table>
        </div>
      `;
  } else {
    // Solo actualizar la tabla y el contador para no perder el foco del input
    document.getElementById("db-table-body").innerHTML = rows;
    document.getElementById("db-count").textContent = `${list.length} registros`;

    const btnDel = document.getElementById("btn-db-del-sel");
    if (btnDel) {
      if (window._dbSelected.length > 0) {
        btnDel.style.display = 'flex';
        btnDel.innerHTML = `<i class="ri-delete-bin-fill"></i> Borrar (${window._dbSelected.length})`;
      } else {
        btnDel.style.display = 'none';
      }
    }
    const selectAllChx = document.getElementById("db-select-all");
    if (selectAllChx) selectAllChx.checked = allSelected;
  }
}

// ── LÓGICA DE SELECCIÓN DB MANAGER ────────────────────────
window.dbToggleSelect = (id) => {
  window._dbSelected = window._dbSelected || [];
  if (window._dbSelected.includes(id)) {
    window._dbSelected = window._dbSelected.filter(x => x !== id);
  } else {
    window._dbSelected.push(id);
  }
  window.dbmanager(false);
};

window.dbToggleSelectAll = () => {
  window._dbSelected = window._dbSelected || [];
  const q = (document.getElementById("db-search")?.value || "").toLowerCase();
  const fCat = document.getElementById("db-cat")?.value || "";
  const fGrade = document.getElementById("db-grade")?.value || "";

  const list = window.STATE.globalItems.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (fCat && i.category !== fCat) return false;
    if (fGrade && i.grade !== fGrade) return false;
    return true;
  });

  const visibleIds = list.map(i => i.id);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => window._dbSelected.includes(id));

  if (allSelected) {
    // Deselect all visible
    window._dbSelected = window._dbSelected.filter(id => !visibleIds.includes(id));
  } else {
    // Select all visible
    visibleIds.forEach(id => {
      if (!window._dbSelected.includes(id)) window._dbSelected.push(id);
    });
  }
  window.dbmanager(false);
};

window.dbDeleteSelected = async () => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!window._dbSelected || window._dbSelected.length === 0) return;
  if (!confirm(`¿Estás 100% seguro de borrar ${window._dbSelected.length} ítems para SIEMPRE de la Base de Datos Global?`)) return;

  const toDelete = [...window._dbSelected];
  window.toast(`Borrando ${toDelete.length} ítems...`, "info");

  try {
    const promises = toDelete.map(id => window.delFireDoc("global_items", id));
    await Promise.all(promises);
    window.STATE.globalItems = window.STATE.globalItems.filter(i => !toDelete.includes(i.id));
    window._dbSelected = [];
    window.toast(`${toDelete.length} ítems eliminados correctamente`, "success");
    window.dbmanager();
  } catch (e) {
    window.toast("Error borrando ítems: " + e.message, "error");
  }
};

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
          <option value="recipe" ${item.category === 'recipe' ? 'selected' : ''}>Receta Genérica</option>
          <option value="recipe_weapon" ${item.category === 'recipe_weapon' ? 'selected' : ''}>Receta/Arma</option>
          <option value="recipe_armor" ${item.category === 'recipe_armor' ? 'selected' : ''}>Receta/Armadura</option>
          <option value="recipe_jewelry" ${item.category === 'recipe_jewelry' ? 'selected' : ''}>Receta/Joyería</option>
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
          <option value="S" ${item.grade === 'S' ? 'selected' : ''}>S</option>
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

  let html = results.map(r => {
    const isRecipe = r.category && r.category.startsWith('recipe');
    const badge = isRecipe ? ' <i class="ri-magic-line" style="color:var(--gold); font-size:12px; margin-left:4px" title="Receta"></i>' : '';
    return `<div class="ac-item" onclick="acSelectDB('${inputId}','${listId}',\`${r.name.replace(/`/g, "'")}\`)">
      <span class="grade-${r.grade || 'NG'}" style="font-size:.7rem">[${r.grade || "NG"}]</span>
      ${r.name}${badge}
      <span style="color:var(--text3);font-size:.7rem;margin-left:auto">${window.CATEGORY_LABELS ? window.CATEGORY_LABELS[r.category] : r.category}</span>
    </div>`;
  }).join("");

  // Botón "Crear nuevo si no existe"
  const safeQ = q.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  html += `
    <div class="ac-item" style="border-top:1px solid var(--border); background:rgba(212, 160, 23, .05); color:var(--gold-light)" onclick="openNewMatMiniModal('${inputId}','${listId}','${safeQ}', 'acSelectDB')">
      <i class="ri-add-circle-line"></i> ¿No existe? Crear "${q.replace(/"/g, '&quot;')}"
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
window.openNewMatMiniModal = (inputId, listId, tempName, callbackFn = 'acSelectDB') => {
  document.getElementById(listId).classList.remove("show");

  // Reusaremos un confirm con promts simples o un HTML temporal para no pisar el Modal GIGANTE si se puede.
  // Pero como nuestro Modal no soporta anidación fluida, lo simularemos guardando el form actual o inyectando a la BD.
  // Dada la arquitectura, haremos un "Guardado Rápido a Firebase" pidiendo los datos por prompt, ya que el DB Manager está atrás.

  const isRecipe = confirm(`¿Quieres registrar "${tempName}" como un Ítem nuevo en Firebase de forma rápida?`);
  if (!isRecipe) return;

  const inputGrade = prompt(`Escribe el Grado para "${tempName}"\n(Opciones: NG, D, C, B, A, S)`, "NG") || "NG";
  const cat = prompt(`Escribe la categoría para "${tempName}"\n1=Material, 2=Receta G., 3=Armadura, 4=Arma, 5=Joya, 6=Consumible, 7=Scroll, 8=Especial, 9=Otros`, "1");

  const mapCat = {
    "1": "material",
    "2": "recipe",
    "3": "armor",
    "4": "weapon",
    "5": "jewelry",
    "6": "consumable",
    "7": "scroll",
    "8": "special",
    "9": "other"
  };
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
    if (window[callbackFn]) window[callbackFn](inputId, listId, tempName);
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
