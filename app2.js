// ═══════════════════════════════════════════════════════════
//  app2.js — Módulos: Almacén, Crafts, Tesorería, Préstamos, Eventos
// ═══════════════════════════════════════════════════════════
import { searchItems, CATEGORY_LABELS } from "./items-db.js";
import { getRecipeFor, isNonCraftable, evaluateCraftTree } from "./crafts-recipes.js";


// ── WAREHOUSE ────────────────────────────────────────────
const WH_CATS = ["weapon", "armor", "jewelry", "material", "consumable", "recipe", "recipe_weapon", "recipe_armor", "recipe_jewelry", "scroll", "special", "other"];
const WH_GRADES = ["NG", "D", "C", "B", "A", "S"];
const WH_STATUS_MAP = {
  available: "<span class='badge badge-green'>Disponible</span>",
  lent: "<span class='badge badge-gold'>Prestado</span>",
  reserved: "<span class='badge badge-blue'>Reservado</span>"
};

window.warehouse = function () {
  const q = (document.getElementById("wh-q")?.value || "").toLowerCase();
  const fc = document.getElementById("wh-cat")?.value || "";
  const fg = document.getElementById("wh-grade")?.value || "";
  const fo = document.getElementById("wh-owner")?.value || "";
  const list = window.STATE.warehouse.filter(i => {
    if (q && !i.name.toLowerCase().includes(q)) return false;
    if (fc && i.category !== fc) return false;
    if (fg && i.grade !== fg) return false;
    if (fo && i.ownerId !== fo) return false;
    return true;
  });
  const rows = list.map(i => `
    <tr>
      <td><b>${i.name}</b></td>
      <td><span class="grade-${i.grade || 'NG'}">${i.grade || "NG"}</span></td>
      <td style="color:var(--text2)">${CATEGORY_LABELS[i.category] || i.category || "—"}</td>
      <td><b style="color:var(--gold)">${i.quantity || 1}</b></td>
      <td>${i.ownerId === "clan" || !i.ownerId ? "<span class='badge badge-purple'>Clan</span>" : window.memberName(i.ownerId)}</td>
      <td>${WH_STATUS_MAP[i.status] || i.status || ""}</td>
      <td>
      <td>
        ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editWH('${i.id}')"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delWH('${i.id}')"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </td>
      </td>
    </tr>`).join("") || `<tr><td colspan="7"><div class="empty-state"><i class="ri-archive-2-line"></i><p>Almacén vacío</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <input class="search-input" id="wh-q" placeholder="🔍 Buscar item..." oninput="warehouse()" value="${q}">
      <select class="filter-sel" id="wh-cat" onchange="warehouse()">
        <option value="">Todas las categorías</option>
        ${WH_CATS.map(c => `<option value="${c}" ${c === fc ? "selected" : ""}>${CATEGORY_LABELS[c] || c}</option>`).join("")}
      </select>
      <select class="filter-sel" id="wh-grade" onchange="warehouse()">
        <option value="">Todos los grados</option>
        ${WH_GRADES.map(g => `<option value="${g}" ${g === fg ? "selected" : ""}>${g}</option>`).join("")}
      </select>
      <select class="filter-sel" id="wh-owner" onchange="warehouse()">
        <option value="">Todos los dueños</option><option value="clan">Clan</option>
        ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === fo ? "selected" : ""}>${m.nickname}</option>`).join("")}
      </select>
      <span style="margin-left:auto;color:var(--text3);font-size:.8rem">${list.length} item(s)</span>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Item</th><th>Grado</th><th>Categoría</th><th>Cantidad</th><th>Dueño</th><th>Estado</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

function whFormHTML(i = {}) {
  return `<div class="form-grid">
    <div class="form-row col2"><label>Nombre del Item</label>
      <div class="autocomplete-wrap">
        <input id="f-iname" placeholder="Ej: Draconic Bow..." value="${i.name || ""}" oninput="acSearch(this.value,'f-iname','ac-iname')" autocomplete="off">
        <div class="autocomplete-list" id="ac-iname"></div>
      </div>
    </div>
    <div class="form-row"><label>Categoría</label>
      <select id="f-icat">${WH_CATS.map(c => `<option value="${c}" ${c === i.category ? "selected" : ""}>${CATEGORY_LABELS[c] || c}</option>`).join("")}</select>
    </div>
    <div class="form-row"><label>Grado</label>
      <select id="f-igrade">${WH_GRADES.map(g => `<option value="${g}" ${g === i.grade ? "selected" : ""}>${g}</option>`).join("")}</select>
    </div>
    <div class="form-row"><label>Cantidad</label><input id="f-iqty" type="number" min="1" value="${i.quantity || 1}"></div>
    <div class="form-row"><label>Estado</label>
      <select id="f-istat">
        <option value="available" ${i.status === "available" ? "selected" : ""}>Disponible</option>
        <option value="lent" ${i.status === "lent" ? "selected" : ""}>Prestado</option>
        <option value="reserved" ${i.status === "reserved" ? "selected" : ""}>Reservado</option>
      </select>
    </div>
    <div class="form-row"><label>Dueño</label>
      <select id="f-iowner">
        <option value="clan" ${!i.ownerId || i.ownerId === "clan" ? "selected" : ""}>Del Clan</option>
        ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === i.ownerId ? "selected" : ""}>${m.nickname}</option>`).join("")}
      </select>
    </div>
    <div class="form-row col2"><label>Notas</label><textarea id="f-inotes">${i.notes || ""}</textarea></div>
  </div>`;
}

window.addWarehouseItem = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  window.openModal("<i class='ri-archive-2-line'></i> Nuevo Item al Almacén", whFormHTML(), async () => {
    const name = document.getElementById("f-iname").value.trim();
    if (!name) { window.toast("El nombre es obligatorio", "error"); return false; }
    const data = {
      name, category: document.getElementById("f-icat").value,
      grade: document.getElementById("f-igrade").value, quantity: +document.getElementById("f-iqty").value,
      status: document.getElementById("f-istat").value, ownerId: document.getElementById("f-iowner").value,
      notes: document.getElementById("f-inotes").value, addedAt: new Date().toISOString()
    };
    const existingItem = window.STATE.warehouse.find(i =>
      i.name.toLowerCase() === data.name.toLowerCase() &&
      i.category === data.category &&
      i.grade === data.grade &&
      i.status === data.status &&
      i.ownerId === data.ownerId
    );

    if (existingItem) {
      existingItem.quantity += data.quantity;
      if (data.notes) {
        existingItem.notes = existingItem.notes ? existingItem.notes + " | " + data.notes : data.notes;
      }
      await window.saveFireDoc(`clans/${window.CLAN_ID}/warehouse`, existingItem.id, existingItem);
      window.toast("Cantidad sumada al ítem existente", "success");
    } else {
      const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/warehouse`, null, data);
      window.STATE.warehouse.push({ id, ...data });
      window.toast("Item agregado", "success");
    }
    window.warehouse();
  });
};
window.editWH = (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const i = window.STATE.warehouse.find(x => x.id === id); if (!i) return;
  window.openModal("<i class='ri-edit-2-line'></i> Editar Item", whFormHTML(i), async () => {
    const name = document.getElementById("f-iname").value.trim();
    if (!name) { window.toast("El nombre es obligatorio", "error"); return false; }
    const data = {
      name, category: document.getElementById("f-icat").value,
      grade: document.getElementById("f-igrade").value, quantity: +document.getElementById("f-iqty").value,
      status: document.getElementById("f-istat").value, ownerId: document.getElementById("f-iowner").value,
      notes: document.getElementById("f-inotes").value
    };
    await window.saveFireDoc(`clans/${window.CLAN_ID}/warehouse`, id, data);
    Object.assign(i, data); window.toast("Actualizado", "success"); window.warehouse();
  });
};
window.delWH = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este item?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/warehouse`, id);
  window.STATE.warehouse = window.STATE.warehouse.filter(x => x.id !== id);
  window.toast("Item eliminado", "info"); window.warehouse();
};

// ── AUTOCOMPLETE ─────────────────────────────────────────
window.acSearch = (q, inputId, listId) => {
  const list = document.getElementById(listId); if (!list) return;
  if (q.length < 2) { list.classList.remove("show"); return; }

  // Buscar en globalItems
  const results = window.STATE.globalItems
    ? window.STATE.globalItems.filter(item => item.name.toLowerCase().includes(q.toLowerCase())).slice(0, 15)
    : searchItems(q);

  if (!results.length && !window.openNewMatMiniModal) { list.classList.remove("show"); return; }

  let html = results.map(r => {
    const isRecipe = r.category && r.category.startsWith('recipe');
    const badge = isRecipe ? ' <i class="ri-magic-line" style="color:var(--gold); font-size:12px; margin-left:4px" title="Receta"></i>' : '';
    return `<div class="ac-item" onclick="acSelect('${inputId}','${listId}',\`${r.name.replace(/`/g, "'")}\`)">
      <span class="grade-${r.grade || 'NG'}" style="font-size:.7rem">[${r.grade || "NG"}]</span>
      ${r.name}${badge}
      <span style="color:var(--text3);font-size:.7rem;margin-left:auto">${window.CATEGORY_LABELS ? window.CATEGORY_LABELS[r.category] : r.category}</span>
    </div>`;
  }).join("");

  // Si window.openNewMatMiniModal existe (cargado desde app3.js), mostramos botón de crear
  if (window.openNewMatMiniModal) {
    const safeQ = q.replace(/'/g, "\\'").replace(/"/g, '&quot;');
    html += `
      <div class="ac-item" style="border-top:1px solid var(--border); background:rgba(212, 160, 23, .05); color:var(--gold-light)" onclick="openNewMatMiniModal('${inputId}','${listId}','${safeQ}', 'acSelect')">
        <i class="ri-add-circle-line"></i> ¿No existe? Crear "${q.replace(/"/g, '&quot;')}"
      </div>
    `;
  }

  list.innerHTML = html;
  list.classList.add("show");
};
window.acSelect = (inputId, listId, name) => {
  document.getElementById(inputId).value = name;
  document.getElementById(listId).classList.remove("show");

  // Auto-completar Categoría y Grado si existen los selects (para Almacén)
  let itemData = null;
  if (window.STATE && window.STATE.globalItems) {
    itemData = window.STATE.globalItems.find(i => i.name.toLowerCase() === name.toLowerCase());
  }
  if (!itemData && typeof searchItems === "function") {
    const res = searchItems(name);
    if (res && res.length) itemData = res.find(i => i.name.toLowerCase() === name.toLowerCase());
  }

  if (itemData) {
    const catEl = document.getElementById("f-icat");
    const gradeEl = document.getElementById("f-igrade");

    if (catEl && itemData.category) {
      let catVal = itemData.category;
      // Reverse lookup if the category is saved as a display label instead of key
      if (window.CATEGORY_LABELS) {
        const key = Object.keys(window.CATEGORY_LABELS).find(k => window.CATEGORY_LABELS[k] === itemData.category);
        if (key) catVal = key;
      }
      // Backward-compat aliases for labels that were renamed between sessions
      const legacyAliases = {
        "Receta": "recipe",
        "Recetas Genéricas": "recipe",
        "Arma": "weapon",
        "Armadura": "armor",
        "Joya": "jewelry",
        "Material": "material",
        "Consumible": "consumable",
        "Especial": "special",
        "Otros": "other",
      };
      if (legacyAliases[catVal]) catVal = legacyAliases[catVal];
      catEl.value = catVal;
    }

    if (gradeEl) {
      // Fall back to "NG" if grade is empty/undefined so the select always shows a valid option
      gradeEl.value = itemData.grade || "NG";
    }
  }
};

// Autocomplete especial para Crafts — auto-rellena materiales si hay receta
window.acSearchCraft = (q, inputId, listId) => {
  const list = document.getElementById(listId); if (!list) return;
  if (q.length < 2) { list.classList.remove("show"); return; }
  const results = searchItems(q);
  if (!results.length) { list.classList.remove("show"); return; }
  list.innerHTML = results.map(r => {
    const grade = r.grade || 'NG';
    const gradeOrder = { NG: 0, D: 1, C: 2, B: 3, A: 4, S: 5, S80: 6, S84: 7 };
    // Solo mostrar indicadores especiales para A, S, S80, S84
    const isHighGrade = (gradeOrder[grade] || 0) >= 4;
    const noCraft = isHighGrade && isNonCraftable(r.name);
    const hasRecipe = isHighGrade && !!getRecipeFor(r.name);
    let indicator = '';
    let rowStyle = '';
    if (noCraft) {
      indicator = `<span style="color:#e03535;font-size:.7rem;margin-left:6px;font-weight:600"><i class="ri-forbid-line"></i> Solo Drop</span>`;
      rowStyle = 'border-left:3px solid #e03535;';
    } else if (hasRecipe) {
      indicator = `<span style="color:var(--gold);font-size:.7rem;margin-left:6px"><i class="ri-magic-line"></i> receta</span>`;
    }
    return `<div class="ac-item" style="${rowStyle}" onclick="acSelectCraft('${inputId}','${listId}',\`${r.name.replace(/`/g, "'")}\`,${noCraft})">
      <span class="grade-${grade}" style="font-size:.7rem">[${grade}]</span>
      <span style="${noCraft ? 'color:#e03535;' : ''}">${r.name}</span>
      ${indicator}
      <span style="color:var(--text3);font-size:.7rem;margin-left:auto">${CATEGORY_LABELS[r.category] || ""}</span>
    </div>`;
  }).join("");
  list.classList.add("show");
};
window.acSelectCraft = (inputId, listId, name, nonCraftable) => {
  document.getElementById(inputId).value = name;
  document.getElementById(listId).classList.remove("show");
  const hint = document.getElementById("recipe-hint");
  if (nonCraftable) {
    // Item solo drop — limpiar materiales y advertir
    matIdx2 = 0;
    document.getElementById("mats-list2").innerHTML = matRow2({}, 0);
    if (hint) {
      hint.style.display = "flex";
      hint.style.background = "rgba(224,53,53,.12)";
      hint.style.borderColor = "#e03535";
      hint.style.color = "#e03535";
      hint.querySelector("span").textContent = `Este item es Solo Drop (Boss/Raid). No tiene receta de crafteo.`;
      hint.querySelector("i").className = "ri-forbid-line";
    }
    return;
  }
  // Auto-rellenar materiales si existe receta
  const recipe = getRecipeFor(name);
  if (recipe) {
    matIdx2 = recipe.length;
    document.getElementById("mats-list2").innerHTML = recipe.map((m, i) => matRow2(m, i)).join("");
    if (hint) {
      hint.style.display = "flex";
      hint.style.background = "rgba(212,160,23,.12)";
      hint.style.borderColor = "var(--gold)";
      hint.style.color = "var(--gold)";
      hint.querySelector("span").textContent = `Receta cargada: ${recipe.length} materiales automáticamente`;
      hint.querySelector("i").className = "ri-magic-line";
    }
  } else {
    if (hint) hint.style.display = "none";
  }
};
document.addEventListener("click", e => {
  if (!e.target.closest?.(".autocomplete-wrap"))
    document.querySelectorAll(".autocomplete-list").forEach(l => l.classList.remove("show"));
});

// ── CRAFTS ──────────────────────────────────────────────
window.crafts = function () {
  const q = (document.getElementById("cr-q")?.value || "").toLowerCase();
  const fs = document.getElementById("cr-status")?.value || "";
  const list = window.STATE.crafts.filter(c => {
    if (q && !(c.targetItem || "").toLowerCase().includes(q)) return false;
    if (fs && c.status !== fs) return false;
    return true;
  });

  const stBadge = {
    active: "<span class='badge badge-blue'>En Progreso</span>",
    completed: "<span class='badge badge-green'>Completado</span>",
    cancelled: "<span class='badge badge-red'>Cancelado</span>"
  };

  const cards = list.map(c => {
    const mats = c.materials || [];
    const needed = mats.reduce((s, m) => s + +m.needed, 0);
    const collected = mats.reduce((s, m) => s + +m.collected, 0);
    const pct = needed ? Math.min(100, Math.round(collected / needed * 100)) : 0;
    return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="flex:1"><b style="color:var(--gold-light)">${c.targetItem}</b>
          <span style="color:var(--text3);font-size:.75rem;margin-left:8px">Crafter: ${window.memberName(c.crafterId) || "N/A"}</span>
        </div>
        ${stBadge[c.status] || c.status}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editCraft('${c.id}')"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delCraft('${c.id}')"><i class="ri-delete-bin-line"></i></button>
      </div>
      <div class="progress-bar" style="margin-bottom:6px"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">${pct}% — ${collected}/${needed} unidades</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px">
        ${mats.map((m, idx) => {
      const missing = (m.needed || 0) - (m.collected || 0);
      let evaluationHTML = "";

      if (missing > 0 && c.status === "active") {
        const evalResult = evaluateCraftTree(m.name, missing, window.STATE.warehouse || []);

        if (evalResult.status === 'ready') {
          // 1. Ready in Warehouse
          evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--green);display:flex;align-items:center;gap:4px">
                  <i class="ri-checkbox-circle-fill"></i> Disponible en Almacén
                </div>
                <button onclick="autoFillCraft('${c.id}', ${idx}, '${m.name}', ${missing}, false)" 
                        style="margin-top:6px;width:100%;font-size:0.7rem;padding:4px;background:var(--green);color:#fff;border:none;border-radius:4px;cursor:pointer">
                  <i class="ri-download-line"></i> Extraer del Almacén
                </button>
              `;
        } else if (evalResult.status === 'craftable_base') {
          // 2. Craftable from Base
          evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--gold-light);display:flex;align-items:center;gap:4px">
                  <i class="ri-hammer-fill"></i> Crafteable desde base
                </div>
                <button onclick="autoFillCraft('${c.id}', ${idx}, '${m.name}', ${missing}, true)" 
                        style="margin-top:6px;width:100%;font-size:0.7rem;padding:4px;background:var(--gold);color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:600">
                  <i class="ri-hammer-line"></i> Craftear y Llenar
                </button>
              `;
        } else {
          // 3. Missing Base Materials
          const missingList = evalResult.missingMaterials.map(mat => `• Falta ${mat.qty}x ${mat.name}`).join("<br>");
          evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--red);display:flex;flex-direction:column;gap:4px">
                  <div style="display:flex;align-items:center;gap:4px"><i class="ri-close-circle-fill"></i> Toca Recolectar:</div>
                  <div style="padding-left:14px;opacity:0.9">${missingList}</div>
                </div>
              `;
        }
      } else if (missing <= 0) {
        evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--text3);display:flex;align-items:center;gap:4px">
                  <i class="ri-check-double-line"></i> Completo
                </div>
              `;
      }

      return `
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:9px 12px;font-size:.78rem;display:flex;flex-direction:column">
            <div style="font-weight:600">${m.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
              <input type="number" min="0" max="${m.needed}" value="${m.collected}" style="width:55px;padding:3px 5px;font-size:.75rem;border-radius:4px;border:1px solid var(--border);background:var(--bg2);color:var(--text)"
                onchange="updateCraftMat('${c.id}',${idx},this.value)">
              <span style="color:var(--text3)">/ ${m.needed}</span>
              <div class="progress-bar" style="flex:1;height:5px">
                <div class="progress-fill" style="width:${m.needed ? Math.min(100, Math.round(+m.collected / +m.needed * 100)) : 0}%"></div>
              </div>
            </div>
            ${evaluationHTML}
          </div>`;
    }).join("")}
      </div>
      ${c.deadline ? `<div style="font-size:.72rem;color:var(--text3);margin-top:8px">📅 ${c.deadline}</div>` : ""}
    </div>`;
  }).join("") || `<div class="empty-state"><i class="ri-hammer-line"></i><p>No hay crafts registrados</p></div>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <input class="search-input" id="cr-q" placeholder="🔍 Buscar craft..." oninput="crafts()" value="${q}">
      <select class="filter-sel" id="cr-status" onchange="crafts()">
        <option value="">Todos</option><option value="active">En Progreso</option>
        <option value="completed">Completado</option><option value="cancelled">Cancelado</option>
      </select>
    </div>${cards}`;
};

window.updateCraftMat = async (craftId, idx, val) => {
  const c = window.STATE.crafts.find(x => x.id === craftId); if (!c) return;
  c.materials[idx].collected = +val;
  await window.saveFireDoc(`clans/${window.CLAN_ID}/crafts`, craftId, { materials: c.materials });
  window.toast("Actualizado", "success");
  window.crafts(); // re-render to update dynamic evaluations
};

// ── SMART CRAFT AUTO-FILL ENGINE ─────────────────
/**
 * Recursively deducts items from the warehouse based on the craft tree.
 */
function deductFromWarehouseTree(itemName, qtyNeeded, whItems, pendingUpdates) {
  const whEntry = whItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
  const whQty = whEntry ? Number(whEntry.qty || 0) : 0;

  if (whQty >= qtyNeeded) {
    // We have it directly. Queue deduction.
    const newQty = whQty - qtyNeeded;
    whEntry.qty = newQty;
    pendingUpdates.push({ id: whEntry.id, data: { qty: newQty } });
    return;
  }

  // If we don't have enough directly but we reached here, it means we are in 'craftable_base' mode
  // and we verified beforehand that base materials DO exist.
  const deficit = qtyNeeded - whQty;

  // Deduct whatever we DO have directly first (if any)
  if (whEntry && whQty > 0) {
    whEntry.qty = 0;
    pendingUpdates.push({ id: whEntry.id, data: { qty: 0 } });
  }

  // Then recursively deduct components for the deficit
  const recipe = getRecipeFor(itemName);
  for (const subMat of recipe) {
    deductFromWarehouseTree(subMat.name, subMat.needed * deficit, whItems, pendingUpdates);
  }
}

window.autoFillCraft = async (craftId, matIdx, itemName, missingQty, isCraftAction) => {
  if (!confirm(`¿Confirmas extraer materiales del almacén para llenar ${missingQty}x ${itemName}?`)) return;

  const craft = window.STATE.crafts.find(x => x.id === craftId);
  if (!craft) return;

  const whItems = window.STATE.warehouse;
  const pendingUpdates = [];

  try {
    if (!isCraftAction) {
      // 1. DIRECT DEDUCTION
      const entry = whItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      if (!entry || entry.qty < missingQty) throw new Error("Inventario desincronizado.");

      const newQty = Number(entry.qty) - missingQty;
      entry.qty = newQty;
      pendingUpdates.push({ id: entry.id, data: { qty: newQty } });
    } else {
      // 2. RECURSIVE CRAFT DEDUCTION
      // Simulate breaking down the item into base materials
      deductFromWarehouseTree(itemName, missingQty, whItems, pendingUpdates);
    }

    // Process all warehouse deductions in Firebase
    window.toast("Actualizando Almacén...", "info");
    for (const update of pendingUpdates) {
      if (update.data.qty <= 0) {
        await window.delFireDoc(`clans/${window.CLAN_ID}/warehouse`, update.id);
        // Remove from local array
        const idx = window.STATE.warehouse.findIndex(x => x.id === update.id);
        if (idx > -1) window.STATE.warehouse.splice(idx, 1);
      } else {
        await window.saveFireDoc(`clans/${window.CLAN_ID}/warehouse`, update.id, update.data);
      }
    }

    // Update the craft material collected amount
    craft.materials[matIdx].collected += missingQty;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/crafts`, craftId, { materials: craft.materials });

    window.toast(`Auto-Llenado de ${itemName} completado!`, "success");
    window.crafts();

  } catch (error) {
    console.error(error);
    window.toast(`Error en la transacción: ${error.message}`, "error");
    // Reload state on failure to prevent desync
    setTimeout(() => location.reload(), 2000);
  }
};



let matIdx2 = 0;
function matRow2(m = {}, i = 0) {
  return `<div class="ev-member-row" id="mat2-${i}">
    <div class="autocomplete-wrap" style="flex:1">
      <input placeholder="Material..." value="${m.name || ""}" id="mat2-name-${i}"
        oninput="acSearch(this.value,'mat2-name-${i}','ac2-mat-${i}')" autocomplete="off">
      <div class="autocomplete-list" id="ac2-mat-${i}"></div>
    </div>
    <input type="number" min="0" placeholder="Necesario" value="${m.needed || 0}" style="width:80px" id="mat2-needed-${i}">
    <input type="number" min="0" placeholder="Recolectado" value="${m.collected || 0}" style="width:90px" id="mat2-coll-${i}">
    <button class="btn btn-danger btn-icon btn-sm" onclick="this.parentElement.remove()"><i class="ri-close-line"></i></button>
  </div>`;
}
window.addMatRow2 = () => {
  matIdx2++;
  document.getElementById("mats-list2").insertAdjacentHTML("beforeend", matRow2({}, matIdx2));
};
function collectMats2() {
  return Array.from(document.querySelectorAll("[id^='mat2-name-']"))
    .map(inp => {
      const i = inp.id.replace("mat2-name-", "");
      return {
        name: inp.value.trim(), needed: +document.getElementById(`mat2-needed-${i}`)?.value || 0,
        collected: +document.getElementById(`mat2-coll-${i}`)?.value || 0
      };
    })
    .filter(m => m.name);
}

// Intenta rellenar receta por nombre (llamado desde onblur o selección manual)
window.tryFillRecipe = (name) => {
  if (!name || name.length < 2) return;
  const hint = document.getElementById("recipe-hint");
  const matsList = document.getElementById("mats-list2");
  if (!matsList) return;
  const nonCraft = isNonCraftable(name);
  if (nonCraft) {
    matIdx2 = 0;
    matsList.innerHTML = matRow2({}, 0);
    if (hint) {
      hint.style.display = "flex";
      hint.style.background = "rgba(224,53,53,.12)";
      hint.style.borderColor = "#e03535";
      hint.style.color = "#e03535";
      hint.querySelector("span").textContent = `Este item es Solo Drop (Boss/Raid). No tiene receta de crafteo.`;
      hint.querySelector("i").className = "ri-forbid-line";
    }
    return;
  }
  const recipe = getRecipeFor(name);
  if (recipe) {
    matIdx2 = recipe.length;
    matsList.innerHTML = recipe.map((m, i) => matRow2(m, i)).join("");
    if (hint) {
      hint.style.display = "flex";
      hint.style.background = "rgba(212,160,23,.12)";
      hint.style.borderColor = "var(--gold)";
      hint.style.color = "var(--gold)";
      hint.querySelector("span").textContent = `Receta cargada: ${recipe.length} materiales automáticamente`;
      hint.querySelector("i").className = "ri-magic-line";
    }
  } else {
    if (hint) hint.style.display = "none";
  }
};

function craftFormHTML2(c = {}) {
  const mats = c.materials || [{ name: "", needed: 1, collected: 0 }];
  matIdx2 = mats.length; // sync counter
  return `<div class="form-grid">
    <div class="form-row col2"><label>Item a Craftear</label>
      <div class="autocomplete-wrap">
        <input id="f-citem" value="${c.targetItem || ""}" placeholder="Ej: Draconic Bow..."
          oninput="acSearchCraft(this.value,'f-citem','ac-citem')"
          onblur="setTimeout(()=>tryFillRecipe(document.getElementById('f-citem')?.value),200)"
          autocomplete="off">
        <div class="autocomplete-list" id="ac-citem"></div>
      </div>
    </div>
    <div id="recipe-hint" style="grid-column:span 2;display:none;align-items:center;gap:8px;
      background:rgba(212,160,23,.12);border:1px solid var(--gold);border-radius:6px;
      padding:8px 12px;font-size:.8rem;color:var(--gold)">
      <i class="ri-magic-line"></i><span></span>
    </div>
    <div class="form-row"><label>Crafter</label>
      <select id="f-ccrafter"><option value="">Sin asignar</option>
        ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === c.crafterId ? "selected" : ""}>${m.nickname}</option>`).join("")}
      </select>
    </div>
    <div class="form-row"><label>Estado</label>
      <select id="f-cstatus">
        <option value="active" ${c.status === "active" ? "selected" : ""}>En Progreso</option>
        <option value="completed" ${c.status === "completed" ? "selected" : ""}>Completado</option>
        <option value="cancelled" ${c.status === "cancelled" ? "selected" : ""}>Cancelado</option>
      </select>
    </div>
    <div class="form-row col2"><label>Materiales</label>
      <div id="mats-list2">${mats.map((m, i) => matRow2(m, i)).join("")}</div>
      <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="addMatRow2()"><i class="ri-add-line"></i> Agregar Material</button>
    </div>
  </div>`;
}

window.addCraft = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  matIdx2 = 0;
  window.openModal("<i class='ri-hammer-line'></i> Nuevo Craft", craftFormHTML2(), async () => {
    const item = document.getElementById("f-citem").value.trim();
    if (!item) { window.toast("El item es obligatorio", "error"); return false; }
    const data = {
      targetItem: item, crafterId: document.getElementById("f-ccrafter").value,
      status: document.getElementById("f-cstatus").value, materials: collectMats2(), createdAt: new Date().toISOString()
    };
    const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/crafts`, null, data);
    window.STATE.crafts.push({ id, ...data });
    window.toast("Craft creado", "success"); window.crafts();
  });
};
window.editCraft = (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const c = window.STATE.crafts.find(x => x.id === id); if (!c) return;
  matIdx2 = (c.materials || []).length;
  window.openModal("<i class='ri-edit-2-line'></i> Editar Craft", craftFormHTML2(c), async () => {
    const item = document.getElementById("f-citem").value.trim();
    if (!item) { window.toast("El item es obligatorio", "error"); return false; }
    const data = {
      targetItem: item, crafterId: document.getElementById("f-ccrafter").value,
      status: document.getElementById("f-cstatus").value, materials: collectMats2()
    };
    await window.saveFireDoc(`clans/${window.CLAN_ID}/crafts`, id, data);
    Object.assign(c, data); window.toast("Actualizado", "success"); window.crafts();
  });
};
window.delCraft = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este craft?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/crafts`, id);
  window.STATE.crafts = window.STATE.crafts.filter(x => x.id !== id);
  window.toast("Eliminado", "info"); window.crafts();
};

// ── TREASURY ────────────────────────────────────────────
window.treasury = function () {
  const q = (document.getElementById("tr-q")?.value || "").toLowerCase();
  const ft = document.getElementById("tr-type")?.value || "";
  const list = window.STATE.treasury.filter(t => {
    if (q && !(t.description || "").toLowerCase().includes(q)) return false;
    if (ft && t.type !== ft) return false;
    return true;
  });
  const income = window.STATE.treasury.filter(t => t.type === "income").reduce((s, t) => s + +t.amount, 0);
  const expense = window.STATE.treasury.filter(t => t.type === "expense").reduce((s, t) => s + +t.amount, 0);
  const balance = income - expense;
  const rows = list.slice().reverse().map(t => `
    <tr>
      <td>${window.fmtDate(t.date)}</td>
      <td>${t.type === "income" ? "<span class='badge badge-green'>Ingreso</span>" : "<span class='badge badge-red'>Gasto</span>"}</td>
      <td>${t.description || "—"}</td>
      <td>${window.memberName(t.memberId)}</td>
      <td style="font-weight:600;color:${t.type === 'income' ? 'var(--green)' : 'var(--red)'}">
        ${t.type === "income" ? "+" : "−"}${window.fmt(t.amount)} ₳</td>
      <td>${window.STATE.isAdmin ? `<button class="btn btn-danger btn-icon btn-sm" onclick="delTx('${t.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}</td>
    </tr>`).join("") || `<tr><td colspan="6"><div class="empty-state"><i class="ri-coin-line"></i><p>Sin transacciones</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-label">Ingresos</div><div class="stat-value" style="color:var(--green);font-size:1.1rem">${window.fmt(income)} ₳</div></div>
      <div class="stat-card"><div class="stat-icon">📉</div><div class="stat-label">Gastos</div><div class="stat-value" style="color:var(--red);font-size:1.1rem">${window.fmt(expense)} ₳</div></div>
      <div class="stat-card"><div class="stat-icon">⚖️</div><div class="stat-label">Balance</div><div class="stat-value" style="font-size:1.1rem;color:${balance < 0 ? 'var(--red)' : 'var(--gold-light)'}">${window.fmt(balance)} ₳</div></div>
    </div>
    <div class="filters">
      <input class="search-input" id="tr-q" placeholder="🔍 Buscar..." oninput="treasury()" value="${q}">
      <select class="filter-sel" id="tr-type" onchange="treasury()">
        <option value="">Todas</option><option value="income">Ingresos</option><option value="expense">Gastos</option>
      </select>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Miembro</th><th>Monto</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

window.addTransaction = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  window.openModal("<i class='ri-coins-line'></i> Nueva Transacción",
    `<div class="form-grid">
      <div class="form-row"><label>Tipo</label>
        <select id="f-txtype"><option value="income">Ingreso</option><option value="expense">Gasto</option></select>
      </div>
      <div class="form-row"><label>Monto (Adena)</label><input id="f-txamt" type="number" min="0" placeholder="0"></div>
      <div class="form-row col2"><label>Descripción</label><input id="f-txdesc" placeholder="Ej: Donación, Compra de item..."></div>
      <div class="form-row"><label>Miembro</label>
        <select id="f-txmem"><option value="">Sin asignar</option>
          ${window.STATE.members.map(m => `<option value="${m.id}">${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Fecha</label><input id="f-txdate" type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
    </div>`,
    async () => {
      const amt = +document.getElementById("f-txamt").value;
      const desc = document.getElementById("f-txdesc").value.trim();
      if (!amt || !desc) { window.toast("Monto y descripción son obligatorios", "error"); return false; }
      const data = {
        type: document.getElementById("f-txtype").value, amount: amt, description: desc,
        memberId: document.getElementById("f-txmem").value, date: document.getElementById("f-txdate").value
      };
      const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/treasury`, null, data);
      window.STATE.treasury.push({ id, ...data });
      window.toast("Guardado", "success"); window.treasury();
    }
  );
};
window.delTx = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/treasury`, id);
  window.STATE.treasury = window.STATE.treasury.filter(t => t.id !== id);
  window.toast("Eliminada", "info"); window.treasury();
};

// ── LOANS ───────────────────────────────────────────────
window.loans = function () {
  const q = (document.getElementById("ln-q")?.value || "").toLowerCase();
  const fs = document.getElementById("ln-status")?.value || "";
  const ft = document.getElementById("ln-type")?.value || "";
  const now = new Date();
  const list = window.STATE.loans.filter(l => {
    // Buscar en texto (nombres, ítems, etc)
    const matchesQuery = !q ||
      window.memberName(l.fromId).toLowerCase().includes(q) ||
      window.memberName(l.toId).toLowerCase().includes(q) ||
      (l.items && l.items.some(it => it.name.toLowerCase().includes(q))) ||
      (l.itemName && l.itemName.toLowerCase().includes(q));

    if (!matchesQuery) return false;
    if (fs && l.status !== fs) return false;
    if (ft && l.loanType !== ft) return false;
    return true;
  });

  const stBadge = s => ({
    active: "<span class='badge badge-blue'>Activo</span>",
    returned: "<span class='badge badge-green'>Devuelto</span>",
    overdue: "<span class='badge badge-red'>Vencido</span>",
    cancelled: "<span class='badge badge-gray'>Cancelado</span>",
  }[s] || s);

  const rows = list.map(l => {
    const over = l.status === "active" && l.dueDate && new Date(l.dueDate) < now;

    let valLabel = "";
    if (l.loanType === "adena") {
      valLabel = `<b style="color:var(--gold)">${window.fmt(l.amount)} ₳</b>`;
    } else {
      const itArr = l.items && l.items.length > 0 ? l.items : (l.itemName ? [{ name: l.itemName, qty: l.quantity || 1 }] : []);
      valLabel = `<div style="display:flex;flex-direction:column;gap:3px">` +
        itArr.map(it => `<div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:0.72rem;color:var(--text2);background:var(--bg3);padding:3px 8px;border-radius:5px;border:1px solid var(--border);line-height:1.2;word-break:break-word;flex:1">
            <span style="color:var(--text3);margin-right:4px">↪</span><b>${it.name}</b>
          </span>
          <span style="color:var(--gold-light);font-size:0.75rem;font-weight:600;white-space:nowrap">x${it.qty}</span>
        </div>`).join("") + `</div>`;
    }

    if (l.isInstallment || l.loanType === "installment") {
      const paid = l.paidAmount || 0;
      valLabel += `<div style="margin-top:4px"><span style="font-size:0.8rem;color:var(--text2)">Pagado:</span> <b style="color:var(--green)">${window.fmt(paid)}</b> / <b style="color:var(--gold)">${window.fmt(l.amount)} ₳</b></div>`;
    }

    let ic = "<i class='ri-gift-line'></i>";
    if (l.loanType === 'adena') ic = "<i class='ri-copper-coin-line' style='color:var(--gold)'></i>";
    if (l.loanType === 'weapon') ic = "<i class='ri-sword-line' style='color:var(--red-light)'></i>";
    if (l.loanType === 'armor' || l.loanType === 'set') ic = "<i class='ri-shirt-line' style='color:var(--blue-light)'></i>";
    if (l.loanType === 'jewelry') ic = "<i class='ri-vip-diamond-line' style='color:var(--purple-light)'></i>";

    return `<tr style="${over ? 'background:rgba(224,53,53,.05)' : ''}">
      <td title="${l.loanType}">${ic}</td>
      <td><b>${window.memberName(l.fromId)}</b></td>
      <td style="color:var(--gold)">→</td>
      <td><b>${window.memberName(l.toId)}</b></td>
      <td>${valLabel}</td>
      <td>${window.fmtDate(l.loanDate)}</td>
      <td style="${over ? 'color:var(--red)' : ''}">${l.dueDate ? window.fmtDate(l.dueDate) : "Indefinido"}</td>
      <td>${stBadge(over ? "overdue" : l.status)}</td>
      <td style="display:flex;gap:4px">
        ${window.STATE.isAdmin ? `
        ${(l.status === "active" && (l.isInstallment || l.loanType === "installment")) ? `<button class="btn btn-ghost btn-sm" onclick="payInstallment('${l.id}')" title="Abonar Pago"><i class="ri-add-line"></i></button>` : ""}
        ${l.status === "active" ? `<button class="btn btn-ghost btn-sm" onclick="returnLoan('${l.id}')" title="Marcar Devuelto">✓</button>` : ""}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editLoan('${l.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delLoan('${l.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </td>
    </tr>`;
  }).join("") || `<tr><td colspan="9"><div class="empty-state"><i class="ri-hand-coin-line"></i><p>No hay préstamos</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <input class="search-input" id="ln-q" placeholder="🔍 Buscar..." oninput="loans()" value="${q}">
      <select class="filter-sel" id="ln-type" onchange="loans()">
        <option value="" ${ft === "" ? "selected" : ""}>Todos los Tipos</option>
        <option value="item" ${ft === "item" ? "selected" : ""}>Items/Materiales</option>
        <option value="weapon" ${ft === "weapon" ? "selected" : ""}>Armas</option>
        <option value="armor" ${ft === "armor" ? "selected" : ""}>Armaduras</option>
        <option value="set" ${ft === "set" ? "selected" : ""}>Sets</option>
        <option value="jewelry" ${ft === "jewelry" ? "selected" : ""}>Joyas</option>
        <option value="adena" ${ft === "adena" ? "selected" : ""}>Adena</option>
      </select>
      <select class="filter-sel" id="ln-status" onchange="loans()">
        <option value="" ${fs === "" ? "selected" : ""}>Todos los estados</option>
        <option value="active" ${fs === "active" ? "selected" : ""}>Activo</option>
        <option value="returned" ${fs === "returned" ? "selected" : ""}>Devuelto</option>
        <option value="overdue" ${fs === "overdue" ? "selected" : ""}>Vencido</option>
        <option value="cancelled" ${fs === "cancelled" ? "selected" : ""}>Cancelado</option>
      </select>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Tipo</th><th>De</th><th></th><th>Para</th><th>Item / Monto</th><th>Préstamo</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

window.addLoan = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  window._loanItems = [{ name: "", qty: 1 }]; // Para multi-items
  window.openModal("<i class='ri-hand-coin-line'></i> Nuevo Préstamo / Deuda",
    `<div class="form-grid">
      <div class="form-row col2"><label>Tipo de Operación</label>
        <select id="f-ltype" onchange="toggleLoanType()">
          <option value="item">Préstamos de Item(s) o Materiales</option>
          <option value="weapon">Préstamos de Armas</option>
          <option value="armor">Préstamos de Armaduras</option>
          <option value="set">Préstamos de Sets completos</option>
          <option value="jewelry">Préstamos de Joyas</option>
          <option value="adena">Préstamo de Adena (Completo)</option>
        </select>
      </div>
      <div class="form-row"><label>De (quien presta)</label>
        <select id="f-lfrom"><option value="clan">Clan</option>
          ${window.STATE.members.map(m => `<option value="${m.id}">${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Para (quien recibe)</label>
        <select id="f-lto"><option value="">Seleccionar...</option>
          ${window.STATE.members.map(m => `<option value="${m.id}">${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div id="item-fields" style="grid-column:span 2">
        <label>Items a Prestar <button class="btn btn-ghost btn-sm" style="float:right;padding:2px 6px" onclick="addLoanItemRow()">+ Añadir Fila</button></label>
        <div id="loan-items-container"></div>
        <div style="margin-top:10px; background:var(--bg3); padding:8px 12px; border-radius:6px; border:1px solid var(--border)">
           <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:0">
              <input type="checkbox" id="f-is-installment" onchange="toggleLoanType()" style="width:auto;margin:0"> 
              Permitir Pago en Partes (Asignar precio a los items y recibir abonos en Adena)
           </label>
        </div>
      </div>
      <div id="adena-fields" class="form-row col2" style="display:none"><label id="lbl-adena-amt">Monto Total (Admite k/m, ej: 10k, 1.5m)</label>
        <input id="f-lamt" type="text" placeholder="Ej: 50000 o 50k o 2.5m">
      </div>
      <div class="form-row"><label>Fecha Préstamo</label><input id="f-ldate" type="date" value="${new Date().toISOString().slice(0, 10)}"></div>
      <div class="form-row"><label>Fecha Devolución (Vacio = Indefinido)</label><input id="f-ldue" type="date"></div>
      <div class="form-row col2"><label>Notas / Condiciones</label><textarea id="f-lnotes"></textarea></div>
    </div>`,
    async () => {
      const ltypeOrigin = document.getElementById("f-ltype").value;
      const isInst = ltypeOrigin !== "adena" && document.getElementById("f-is-installment").checked;

      const toId = document.getElementById("f-lto").value;
      if (!toId) { window.toast("Selecciona el receptor", "error"); return false; }

      let amountParsed = 0;
      if (ltypeOrigin === "adena" || isInst) {
        amountParsed = window.parseKM(document.getElementById("f-lamt").value);
        if (!amountParsed || amountParsed <= 0) {
          window.toast("Monto inválido para el préstamo", "error"); return false;
        }
      }

      // Validar multi-items
      const finalItems = [];
      if (ltypeOrigin !== "adena") {
        for (const it of window._loanItems) {
          if (it.name.trim()) finalItems.push({ name: it.name.trim(), qty: parseInt(it.qty) || 1 });
        }
        if (finalItems.length === 0) {
          window.toast("Debes agregar al menos un ítem válido", "error"); return false;
        }
      }

      const data = {
        loanType: ltypeOrigin, fromId: document.getElementById("f-lfrom").value, toId,
        loanDate: document.getElementById("f-ldate").value, dueDate: document.getElementById("f-ldue").value,
        notes: document.getElementById("f-lnotes").value, status: "active",
        amount: amountParsed,
        isInstallment: isInst, // flag nuevo
        paidAmount: isInst ? 0 : null,
        items: ltypeOrigin !== "adena" ? finalItems : []
      };

      const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/loans`, null, data);
      window.STATE.loans.push({ id, ...data });
      window.updateLoansBadge();
      window.toast("Préstamo registrado", "success"); window.loans();
    }
  );
  setTimeout(renderLoanItemRows, 50);
};

window.editLoan = (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const l = window.STATE.loans.find(x => x.id === id); if (!l) return;
  window._loanItems = (l.items && l.items.length) ? [...l.items] : (l.itemName ? [{ name: l.itemName, qty: l.quantity || 1 }] : [{ name: "", qty: 1 }]);

  window.openModal(`<i class='ri-edit-line'></i> Editar Préstamo`,
    `<div class="form-grid">
      <div class="form-row col2"><label>Tipo de Operación</label>
        <select id="f-ltype" onchange="toggleLoanType()">
          <option value="item" ${l.loanType !== 'adena' ? 'selected' : ''}>Préstamos de Item(s) o Materiales</option>
          <option value="weapon" ${l.loanType === 'weapon' ? 'selected' : ''}>Préstamos de Armas</option>
          <option value="armor" ${l.loanType === 'armor' ? 'selected' : ''}>Préstamos de Armaduras</option>
          <option value="set" ${l.loanType === 'set' ? 'selected' : ''}>Préstamos de Sets completos</option>
          <option value="jewelry" ${l.loanType === 'jewelry' ? 'selected' : ''}>Préstamos de Joyas</option>
          <option value="adena" ${l.loanType === 'adena' ? 'selected' : ''}>Préstamo de Adena (Completo)</option>
        </select>
      </div>
      <div class="form-row"><label>De (quien presta)</label>
        <select id="f-lfrom">
          <option value="clan" ${l.fromId === 'clan' ? 'selected' : ''}>Clan</option>
          ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === l.fromId ? "selected" : ""}>${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Para (quien recibe)</label>
        <select id="f-lto">
          ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === l.toId ? "selected" : ""}>${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div id="item-fields" style="display:${l.loanType === 'adena' ? 'none' : 'block'}; grid-column:span 2">
        <label>Items a Prestar <button class="btn btn-ghost btn-sm" style="float:right;padding:2px 6px" onclick="addLoanItemRow()">+ Añadir Fila</button></label>
        <div id="loan-items-container"></div>
        <div style="margin-top:10px; background:var(--bg3); padding:8px 12px; border-radius:6px; border:1px solid var(--border)">
           <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:0">
              <input type="checkbox" id="f-is-installment" onchange="toggleLoanType()" ${l.isInstallment ? 'checked' : ''} style="width:auto;margin:0"> 
              Permitir Pago en Partes (Asignar precio a los items y recibir abonos en Adena)
           </label>
        </div>
      </div>
      <div id="adena-fields" class="form-row col2" style="display:${(l.loanType === 'adena' || l.isInstallment) ? 'block' : 'none'}">
        <label id="lbl-adena-amt">Monto Total (Admite k/m)</label>
        <input id="f-lamt" type="text" value="${l.amount || ''}" placeholder="Ej: 50k">
      </div>
      <div class="form-row"><label>Fecha Préstamo</label><input id="f-ldate" type="date" value="${l.loanDate}"></div>
      <div class="form-row"><label>Fecha Devolución</label><input id="f-ldue" type="date" value="${l.dueDate || ''}"></div>
      <div class="form-row col2"><label>Notas / Condiciones</label><textarea id="f-lnotes">${l.notes || ""}</textarea></div>
    </div>`,
    async () => {
      const ltypeOrigin = document.getElementById("f-ltype").value;
      const isInst = ltypeOrigin !== "adena" && document.getElementById("f-is-installment").checked;
      const toId = document.getElementById("f-lto").value;

      let amountParsed = 0;
      if (ltypeOrigin === "adena" || isInst) {
        amountParsed = window.parseKM(document.getElementById("f-lamt").value);
      }

      const finalItems = [];
      if (ltypeOrigin !== "adena") {
        for (const it of window._loanItems) {
          if (it.name.trim()) finalItems.push({ name: it.name.trim(), qty: parseInt(it.qty) || 1 });
        }
      }

      const updateData = {
        loanType: ltypeOrigin, fromId: document.getElementById("f-lfrom").value, toId,
        loanDate: document.getElementById("f-ldate").value, dueDate: document.getElementById("f-ldue").value,
        notes: document.getElementById("f-lnotes").value,
        amount: amountParsed, isInstallment: isInst,
        items: ltypeOrigin !== "adena" ? finalItems : []
      };

      await window.saveFireDoc(`clans/${window.CLAN_ID}/loans`, id, updateData);
      Object.assign(l, updateData);
      window.toast("Préstamo actualizado", "success"); window.loans();
    }
  );
  setTimeout(renderLoanItemRows, 50);
};

window.toggleLoanType = () => {
  const t = document.getElementById("f-ltype").value;
  const isInst = document.getElementById("f-is-installment")?.checked;

  if (t === "adena") {
    document.getElementById("item-fields").style.display = "none";
    document.getElementById("adena-fields").style.display = "";
    document.getElementById("lbl-adena-amt").textContent = "Monto de Adena (Admite k/m)";
  } else {
    document.getElementById("item-fields").style.display = "block";
    document.getElementById("adena-fields").style.display = isInst ? "" : "none";
    const lbl = document.getElementById("lbl-adena-amt");
    if (lbl) lbl.textContent = "Deuda Total por los Items (Admite k/m)";
  }
};

// MULTI-ITEM LOGIC FOR LOANS
window._loanItems = [];
window.addLoanItemRow = () => { window._loanItems.push({ name: "", qty: 1 }); renderLoanItemRows(); };
window.rmLoanItemRow = (idx) => { window._loanItems.splice(idx, 1); renderLoanItemRows(); };
window.updLoanItemName = (idx, val) => { window._loanItems[idx].name = val; };
window.updLoanItemQty = (idx, val) => { window._loanItems[idx].qty = val; };

function renderLoanItemRows() {
  const c = document.getElementById("loan-items-container");
  if (!c) return;
  c.innerHTML = window._loanItems.map((m, i) => `
    <div class="form-grid" style="margin-bottom:8px">
      <div class="form-row col2">
        <div class="autocomplete-wrap">
          <input type="text" id="ln-it-${i}" value="${m.name}" placeholder="Buscar item L2..." oninput="updLoanItemName(${i}, this.value); acSearch(this.value, 'ln-it-${i}', 'ac-ln-it-${i}')" autocomplete="off">
          <div class="autocomplete-list" id="ac-ln-it-${i}"></div>
        </div>
      </div>
      <div class="form-row" style="display:flex;gap:4px">
        <input type="number" value="${m.qty}" min="1" style="width:70px" oninput="updLoanItemQty(${i}, this.value)">
        <button class="btn btn-danger btn-icon" tabindex="-1" onclick="rmLoanItemRow(${i})">X</button>
      </div>
    </div>
  `).join("");
}

// NUMBER PARSER (k/m)
window.parseKM = (str) => {
  if (!str) return 0;
  const s = str.toString().trim().toLowerCase();
  if (s.endsWith('k')) return parseFloat(s) * 1000;
  if (s.endsWith('m')) return parseFloat(s) * 1000000;
  return parseFloat(s) || 0;
};

// PAY INSTALLMENT
window.payInstallment = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const l = window.STATE.loans.find(x => x.id === id); if (!l) return;
  const abonoStr = prompt(`¿Cuánto Adena vas a ABONAR a la deuda actual?\nDeuda Total: ${window.fmt(l.amount)}\nPagado hasta ahora: ${window.fmt(l.paidAmount || 0)}\n\n(Puedes usar K o M, ej: 500k)`);
  if (!abonoStr) return;
  const abonoParsed = window.parseKM(abonoStr);
  if (!abonoParsed || abonoParsed <= 0) return window.toast("Monto inválido", "error");

  let nwPaid = (l.paidAmount || 0) + abonoParsed;
  let newStatus = l.status;
  if (nwPaid >= l.amount) {
    nwPaid = l.amount;
    newStatus = "returned";
    window.toast("¡Deuda saldada por completo!", "success");
  } else {
    window.toast(`Abono de ${window.fmt(abonoParsed)} guardado.`, "success");
  }

  await window.saveFireDoc(`clans/${window.CLAN_ID}/loans`, id, { paidAmount: nwPaid, status: newStatus });
  l.paidAmount = nwPaid;
  l.status = newStatus;
  window.updateLoansBadge(); window.loans();
};
window.returnLoan = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const l = window.STATE.loans.find(x => x.id === id); if (!l) return;

  let itemsHtml = "";
  if (l.loanType === "adena") {
    itemsHtml = `<div style="text-align:center; padding:10px; background:var(--bg3); border-radius:8px; border:1px solid var(--border); margin-bottom:15px">
      <b style="color:var(--gold); font-size:1.2rem">${window.fmt(l.amount)} ₳</b><br>
      <span style="font-size:0.8rem; color:var(--text3)">Monto total de Adena</span>
    </div>`;
  } else {
    const itArr = l.items && l.items.length > 0 ? l.items : (l.itemName ? [{ name: l.itemName, qty: l.quantity || 1 }] : []);
    itemsHtml = `<div style="display:flex; flex-direction:column; gap:8px; margin-bottom:15px">` +
      itArr.map(it => `
        <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg3); padding:8px 12px; border-radius:6px; border:1px solid var(--border)">
          <span style="color:var(--text2)"><b>${it.name}</b></span>
          <span style="color:var(--gold-light); font-weight:600">x${it.qty}</span>
        </div>
      `).join("") + `</div>`;
  }

  const body = `
    <div style="text-align:center; margin-bottom:20px">
      <i class="ri-checkbox-circle-line" style="font-size:3rem; color:var(--green)"></i>
      <h3>¿Confirmar Devolución?</h3>
      <p style="color:var(--text3); font-size:0.9rem">Estás a punto de marcar los siguientes ítems como <b>devueltos satisfactoriamente</b>:</p>
    </div>
    ${itemsHtml}
    <div style="background:rgba(212,160,23,0.1); padding:10px; border-radius:6px; border:1px solid rgba(212,160,23,0.3); font-size:0.85rem; color:var(--gold-light)">
      <i class="ri-information-line"></i> Esta acción actualizará el estado del préstamo a "Devuelto" y los ítems dejarán de aparecer como deudos.
    </div>
  `;

  window.openModal("<i class='ri-check-double-line'></i> Verificar Devolución", body, async () => {
    await window.saveFireDoc(`clans/${window.CLAN_ID}/loans`, id, { status: "returned" });
    l.status = "returned";
    window.updateLoansBadge();
    window.toast("Préstamo devuelto y verificado", "success");
    window.loans();
  }, "Confirmar Devolución");
};
window.delLoan = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/loans`, id);
  window.STATE.loans = window.STATE.loans.filter(x => x.id !== id);
  window.updateLoansBadge(); window.toast("Eliminado", "info"); window.loans();
};

// Estado de la vista de eventos (alterna entre 'events' y 'ranking')
window._evView = window._evView || "events";

window.showRanking = function () { window._evView = "ranking"; window.events(); };
window.showEvents = function () { window._evView = "events"; window.events(); };

window.events = function () {
  const q = (document.getElementById("ev-q")?.value || "").toLowerCase();

  // ── Calcular puntos separados por categoría para cada miembro ──
  const pointsMap = {};
  window.STATE.members.forEach(m => {
    pointsMap[m.id] = { id: m.id, name: m.nickname, main: 0, farm: 0, quest: 0, daily: 0, total: 0 };
  });

  window.STATE.events.forEach(ev => {
    // Si no es admin y el evento tiene categoría y no es 'main', lo saltamos (Camuflaje total)
    if (!window.STATE.isAdmin && (ev.category && ev.category !== "main")) return;

    const cat = ev.category || "main"; // retrocompatibilidad
    (ev.participants || []).forEach(p => {
      if (pointsMap[p.memberId]) {
        if (pointsMap[p.memberId][cat] !== undefined) {
          pointsMap[p.memberId][cat] += +p.points;
        }
        pointsMap[p.memberId].total += +p.points;
      }
    });
  });

  const allMembers = Object.values(pointsMap).sort((a, b) => b.total - a.total);

  // Totales globales por categoría
  const globalTotals = { main: 0, farm: 0, quest: 0, daily: 0, total: 0 };
  allMembers.forEach(m => {
    globalTotals.main += m.main;
    globalTotals.farm += m.farm;
    globalTotals.quest += m.quest;
    globalTotals.daily += m.daily;
    globalTotals.total += m.total;
  });

  const catBadge = {
    main: "<span class='badge badge-purple' style='margin-right:8px'><i class='ri-sword-fill'></i> Clan Principal</span>",
    farm: "<span class='badge badge-green' style='margin-right:8px'><i class='ri-hammer-line'></i> Materiales</span>",
    quest: "<span class='badge badge-gold' style='margin-right:8px'><i class='ri-scroll-line'></i> Ayuda Quests</span>",
    daily: "<span class='badge badge-blue' style='margin-right:8px'><i class='ri-calendar-todo-line'></i> Diarias</span>"
  };

  if (window._evView === "ranking") {
    // ── VISTA RANKING (Tabla de Puntos Separados) ────────────────────────
    let adminHeaders = "";
    let adminFooters = "";
    if (window.STATE.isAdmin) {
      adminHeaders = `
        <th style="text-align:center"> Clan Principal</th>
        <th style="text-align:center"> Materiales</th>
        <th style="text-align:center"> Quests / EXP</th>
        <th style="text-align:center"> Diarias</th>
      `;
      adminFooters = `
        <td style="text-align:center;font-weight:bold">${window.fmt(globalTotals.main)}</td>
        <td style="text-align:center;font-weight:bold">${window.fmt(globalTotals.farm)}</td>
        <td style="text-align:center;font-weight:bold">${window.fmt(globalTotals.quest)}</td>
        <td style="text-align:center;font-weight:bold">${window.fmt(globalTotals.daily)}</td>
      `;
    }

    const tableRows = allMembers.map((m, i) => {
      let adminCells = "";
      if (window.STATE.isAdmin) {
        adminCells = `
          <td style="text-align:center;color:${m.main > 0 ? 'var(--gold-light)' : 'var(--text3)'}">${m.main > 0 ? window.fmt(m.main) : "—"}</td>
          <td style="text-align:center;color:${m.farm > 0 ? '#2ecc71' : 'var(--text3)'}">${m.farm > 0 ? window.fmt(m.farm) : "—"}</td>
          <td style="text-align:center;color:${m.quest > 0 ? 'var(--gold)' : 'var(--text3)'}">${m.quest > 0 ? window.fmt(m.quest) : "—"}</td>
          <td style="text-align:center;color:${m.daily > 0 ? '#3498db' : 'var(--text3)'}">${m.daily > 0 ? window.fmt(m.daily) : "—"}</td>
        `;
      }
      return `
      <tr>
        <td style="font-weight:600;color:var(--text);font-size:1.05rem">
          <span style="color:var(--text3);margin-right:6px;font-size:0.9rem;font-weight:normal">${i + 1}.</span>${m.name}
        </td>
        ${adminCells}
        <td style="text-align:center;font-weight:700;color:var(--purple);background:rgba(155,89,182,0.1)">${m.total > 0 ? window.fmt(m.total) : "0"}</td>
      </tr>`;
    }).join("");

    document.getElementById("content").innerHTML = `
      <div class="filters" style="justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="showEvents()" style="gap:6px">
          <i class="ri-calendar-event-line"></i> ${window.STATE.isAdmin ? 'Ver Eventos Individuales' : 'Volver a Eventos'}
        </button>
      </div>
      <div class="card" style="padding:0">
        <div style="padding:16px 20px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <i class="ri-bar-chart-2-fill" style="color:var(--gold);font-size:1.3rem"></i>
          <b style="color:var(--gold-light);font-size:1.1rem">${window.STATE.isAdmin ? 'Registro Detallado de Participación' : 'Tabla de Puntos de Participación'}</b>
          <span class="badge badge-gray" style="margin-left:auto">${allMembers.length} miembros</span>
        </div>
        <div class="table-wrap" style="box-shadow:none">
          <table>
            <thead>
              <tr>
                <th>Miembro</th>
                ${adminHeaders}
                <th style="text-align:center;background:rgba(155,89,182,0.1);color:var(--purple-light)">${window.STATE.isAdmin ? 'Puntos Totales' : 'Puntos Del Clan'}</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
            <tfoot>
              <tr>
                <td style="font-weight:bold;color:var(--text);text-align:right">TOTAL CLAN:</td>
                ${adminFooters}
                <td style="text-align:center;font-weight:bold;color:var(--purple);background:rgba(155,89,182,0.1)">${window.fmt(globalTotals.total)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>`;
  } else {
    // ── VISTA EVENTOS (Tarjetas) ───────────────────────────────────────
    const list = window.STATE.events.filter(e => {
      if (q && !(e.name || "").toLowerCase().includes(q)) return false;
      if (!window.STATE.isAdmin && (e.category && e.category !== "main")) return false;
      return true;
    });
    const cards = list.slice().reverse().map(e => {
      const pts = (e.participants || []).reduce((s, p) => s + +p.points, 0);
      const catHTML = catBadge[e.category] || catBadge["main"];
      const questDetailsHTML = (e.category === "quest" && e.questDetail)
        ? `<div style="font-size:.8rem;color:var(--gold);margin-bottom:8px;background:rgba(212,160,23,0.1);padding:4px 8px;border-radius:4px;display:inline-block"><i class="ri-question-answer-line"></i> ${e.questDetail}</div><br>`
        : "";

      return `<div class="card" style="margin-bottom:12px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1">
          ${catHTML}
          <b style="color:var(--text);font-size:1.05rem">${e.name}</b>
          ${e.date ? `<span style="color:var(--text3);font-size:.78rem;margin-left:8px"><i class="ri-calendar-line"></i> ${window.fmtDate(e.date)}</span>` : ""}
        </div>
        <span class="badge badge-gold">${(e.participants || []).length} participantes</span>
        <span class="badge badge-purple">${window.fmt(pts)} pts entregados</span>
        ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editEvent('${e.id}')"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delEvent('${e.id}')"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </div>
        ${questDetailsHTML}
        ${e.description ? `<div style="font-size:.8rem;color:var(--text2);margin-bottom:10px">${e.description}</div>` : ""}
      <div style="display:flex;flex-wrap:wrap;gap:6px">
      ${(e.participants || []).map(p =>
        `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-size:.8rem;display:flex;align-items:center;gap:8px">
              <span style="color:var(--text2)">${window.memberName(p.memberId)}</span>
              <span style="font-weight:bold;color:var(--gold-light)">${window.fmt(p.points)} pts</span>
            </div>`
      ).join("")}
        </div>
      </div>`;
    }).join("") || `<div class="empty-state"><i class="ri-sword-line"></i><p>No hay eventos registrados</p></div>`;

    document.getElementById("content").innerHTML = `
      <div class="filters">
        <input class="search-input" id="ev-q" placeholder="🔍 Buscar evento por nombre..." oninput="events()" value="">
        <button class="btn btn-ghost btn-sm" onclick="showRanking()" style="gap:6px;white-space:nowrap;background:rgba(155,89,182,0.1);color:var(--purple-light);border:1px solid var(--purple)">
          <i class="ri-bar-chart-2-line"></i> ${window.STATE.isAdmin ? 'Ver Puntos Separados' : 'Estadísticas Generales'}
        </button>
      </div>
      ${cards}`;

    document.getElementById("ev-q").value = q;
  }
};

function eventFormHTML2(e = {}) {
  const cat = e.category || "main";
  return `<div class="form-grid">
    <div class="form-row col2"><label>Nombre del Evento / Sesión</label>
      <input id="f-ename" value="${e.name || ""}" placeholder="Ej: Siege de Rune, Raid Antharas, Farmeo Varka...">
    </div>
    <div class="form-row"><label>Fecha</label><input id="f-edate" type="date" value="${e.date || new Date().toISOString().slice(0, 10)}"></div>
    <div class="form-row">
      <label>Puntos Máximos (Límite)</label>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <input id="f-edefpts" type="number" min="0" value="${e.defaultPoints || 100}" oninput="if(document.getElementById('f-eauto')?.checked) { document.querySelectorAll('.ev-check:checked').forEach(c => c.parentElement.querySelector('input[type=number]').value = this.value); }">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin:0;font-size:0.85rem;background:var(--bg3);padding:8px 10px;border-radius:6px;border:1px solid var(--border);">
          <input type="checkbox" id="f-eauto" checked style="width:auto;margin:0"> Auto-asignar a seleccionados
        </label>
      </div>
    </div>
    <div class="form-row"><label>Categoría</label>
      <select id="f-ecat" onchange="document.getElementById('ev-quest-wrap').style.display = this.value === 'quest' ? 'block' : 'none'">
        <option value="main" ${cat === "main" ? "selected" : ""}>⚔️ Participación al Clan Principal</option>
        <option value="farm" ${cat === "farm" ? "selected" : ""}>🪓 Materiales (Farmeo)</option>
        <option value="quest" ${cat === "quest" ? "selected" : ""}>📜 Ayuda Quests / EXP</option>
        <option value="daily" ${cat === "daily" ? "selected" : ""}>📅 Ayuda Diarias</option>
      </select>
    </div>
    <div class="form-row" id="ev-quest-wrap" style="display:${cat === 'quest' ? 'block' : 'none'}">
       <label>¿Qué quest o ayuda se realizó?</label>
       <input id="f-equest" value="${e.questDetail || ""}" placeholder="Ej: Tercera clase de Noxhell...">
    </div>
    
    <div class="form-row col2"><label>Descripción / Notas extra</label><textarea id="f-edesc">${e.description || ""}</textarea></div>
    <div class="form-row col2">
      <label>Seleccionar Participantes y Asignar Puntos</label>
      <div id="ev-participants">
        ${window.STATE.members.map(m => {
    const p = (e.participants || []).find(p => p.memberId === m.id);
    return `<div class="ev-member-row">
            <input type="checkbox" class="ev-check" id="ev-chk-${m.id}" ${p ? "checked" : ""} onchange="if(this.checked && document.getElementById('f-eauto')?.checked) { document.getElementById('ev-pts-${m.id}').value = document.getElementById('f-edefpts').value; }">
            <label class="ev-name" for="ev-chk-${m.id}">${m.nickname} <span style="color:var(--text3);font-size:.7rem">(${m.class || ""})</span></label>
            <input type="number" min="0" value="${p ? p.points : 0}" style="width:70px" id="ev-pts-${m.id}" oninput="let mx=+document.getElementById('f-edefpts').value; if(+this.value > mx) this.value = mx;">
            <span style="font-size:.7rem;color:var(--text3)">pts</span>
          </div>`;
  }).join("")}
      </div>
    </div>
  </div>`;
}

function gatherEventData() {
  let name = document.getElementById("f-ename").value.trim();
  const category = document.getElementById("f-ecat").value;
  const dateStr = document.getElementById("f-edate").value;

  if (!name) {
    // Si no hay nombre, generar uno genérico basado en la categoría
    const catNames = {
      main: "Participación",
      farm: "Día de Materiales",
      quest: "Apoyo en Quests",
      daily: "Apoyo en Diarias"
    };
    name = `${catNames[category] || "Evento"} (${window.fmtDate(dateStr)})`;
  }

  const participants = window.STATE.members
    // Corrección crítica: sin espacios en los ID del template literal
    .filter(m => document.getElementById(`ev-chk-${m.id}`)?.checked)
    .map(m => ({ memberId: m.id, points: +(document.getElementById(`ev-pts-${m.id}`)?.value) || 0 }));

  return {
    name,
    date: dateStr,
    category,
    questDetail: document.getElementById("f-equest")?.value || "",
    description: document.getElementById("f-edesc").value,
    defaultPoints: +document.getElementById("f-edefpts").value,
    participants
  };
}

window.addEvent = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!window.STATE.members.length) { window.toast("Agrega miembros primero", "error"); return; }
  window.openModal("<i class='ri-calendar-event-line'></i> Nuevo Evento", eventFormHTML2(), async () => {
    const data = gatherEventData(); if (!data) return false;
    data.createdAt = new Date().toISOString();
    const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/events`, null, data);
    window.STATE.events.push({ id, ...data });
    window.toast("Evento creado", "success"); window.events();
  });
};

window.editEvent = (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const e = window.STATE.events.find(x => x.id === id); if (!e) return;
  window.openModal(`<i class='ri-edit-2-line'></i> ${e.name}`, eventFormHTML2(e), async () => {
    const data = gatherEventData(); if (!data) return false;
    try {
      await window.saveFireDoc(`clans/${window.CLAN_ID}/events`, id, data);
      Object.assign(e, data);
      window.toast("Evento actualizado", "success"); window.events();
    } catch (err) {
      window.toast("Error al actualizar evento", "error");
      console.error(err);
    }
  });
};

window.delEvent = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este evento?")) return;
  try {
    await window.delFireDoc(`clans/${window.CLAN_ID}/events`, id);
    window.STATE.events = window.STATE.events.filter(x => x.id !== id);
    window.toast("Eliminado", "info"); window.events();
  } catch (err) {
    window.toast("Error al eliminar evento", "error");
    console.error(err);
  }
};
