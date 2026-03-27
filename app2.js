import { searchItems, CATEGORY_LABELS } from "./items-db.js?v=6";
import { getRecipeFor, isNonCraftable, evaluateCraftTree } from "./crafts-recipes.js?v=6";



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

  // Si es un préstamo, actualizamos el array de items de préstamo para que guarde la palabra completa
  if (inputId.startsWith('ln-it-')) {
    const idx = parseInt(inputId.replace('ln-it-', ''));
    if (!isNaN(idx) && window.updLoanItemName) {
      window.updLoanItemName(idx, name);
    }
  }

  // Si es un ítem deseado, actualizamos el array _desiredItems para que guarde el nombre completo
  if (inputId.startsWith('ds-it-')) {
    const idx = parseInt(inputId.replace('ds-it-', ''));
    if (!isNaN(idx) && window.updDesiredItemName) {
      window.updDesiredItemName(idx, name);
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

    let totalNeeded = 0;
    let totalCollected = 0;

    // We pre-calculate totals based on real warehouse stocks, bounded to what is needed per material.
    mats.forEach(m => {
      const whEntries = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === m.name.toLowerCase());
      const whAmt = whEntries.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
      totalNeeded += Number(m.needed || 0);
      totalCollected += Math.min(Number(m.needed || 0), whAmt);
    });

    const pct = totalNeeded ? Math.min(100, Math.round(totalCollected / totalNeeded * 100)) : 0;

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
      <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">${pct}% — ${totalCollected}/${totalNeeded} unidades en Almacén</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:6px">
        ${mats.map((m, idx) => {
      const whEntries = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === m.name.toLowerCase());
      const totalWHAmt = whEntries.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
      const isComplete = totalWHAmt >= m.needed;
      const missing = Math.max(0, m.needed - totalWHAmt);

      let evaluationHTML = "";

      if (missing > 0 && c.status === "active") {
        // Evaluate based on FULL needed amount to properly calculate deficits across the entire item
        const evalResult = evaluateCraftTree(m.name, m.needed, window.STATE.warehouse || []);

        if (evalResult.status === 'ready') {
          // Fallback just in case
        } else if (evalResult.status === 'craftable_base') {
          const baseList = evalResult.availableMaterials.map(mat => {
            // Find total existing in warehouse for this specific base material to show "Total/Needed"
            const whEntriesReq = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === mat.name.toLowerCase());
            const whTotalReq = whEntriesReq.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
            return `• ${mat.name} x${whTotalReq} / ${mat.qty}`;
          }).join("<br>");

          evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--gold-light);display:flex;flex-direction:column;gap:4px">
                  <div style="display:flex;align-items:center;gap:4px"><i class="ri-hammer-fill"></i> Crafteable con materiales base:</div>
                  <div style="padding-left:14px;opacity:0.9;color:var(--text3)">${baseList}</div>
                </div>
              `;
        } else {
          // Missing Base Materials
          const missingList = evalResult.missingMaterials.map(mat => `• Falta ${mat.qty}x ${mat.name}`).join("<br>");
          evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--red);display:flex;flex-direction:column;gap:4px">
                  <div style="display:flex;align-items:center;gap:4px"><i class="ri-error-warning-line"></i> Faltan Materiales Base:</div>
                  <div style="padding-left:14px;opacity:0.9">${missingList}</div>
                </div>
              `;
        }
      } else if (isComplete) {
        evaluationHTML = `
                <div style="margin-top:8px;font-size:0.7rem;color:var(--green);display:flex;align-items:center;gap:4px">
                  <i class="ri-checkbox-circle-fill"></i> Listo en Almacén
                </div>
              `;
      }

      return `
          <div style="background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:9px 12px;font-size:.78rem;display:flex;flex-direction:column">
            <div style="font-weight:600">${m.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
              <div style="font-size:.85rem; font-weight:bold; color: ${isComplete ? 'var(--green)' : 'var(--text)'};">${totalWHAmt}</div>
              <span style="color:var(--text3)">/ ${m.needed}</span>
              <div class="progress-bar" style="flex:1;height:5px">
                <div class="progress-fill" style="width:${m.needed ? Math.min(100, Math.round(totalWHAmt / m.needed * 100)) : 0}%; background: ${isComplete ? 'var(--green)' : 'var(--primary)'}"></div>
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
  const whEntries = whItems.filter(i => i.name.toLowerCase() === itemName.toLowerCase());
  const whQty = whEntries.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

  // If we have direct materials available (whQty > 0), deduct them first
  let remainingDirectNeeded = Math.min(whQty, qtyNeeded);

  if (remainingDirectNeeded > 0) {
    for (const entry of whEntries) {
      if (remainingDirectNeeded <= 0) break;
      const availableInEntry = Number(entry.quantity || 0);
      if (availableInEntry <= 0) continue;

      const deductAmount = Math.min(availableInEntry, remainingDirectNeeded);
      entry.quantity = availableInEntry - deductAmount;
      pendingUpdates.push({ id: entry.id, data: { quantity: entry.quantity } });
      remainingDirectNeeded -= deductAmount;
    }
  }

  // If we couldn't fulfill directly, but we reached here, it means we are in 'craftable_base' mode
  // We must recursively deduct the remaining deficit from base mats
  const deficit = qtyNeeded - whQty;
  if (deficit > 0) {
    const recipe = getRecipeFor(itemName);
    if (!recipe) throw new Error("Receta no encontrada para " + itemName);
    for (const subMat of recipe) {
      deductFromWarehouseTree(subMat.name, subMat.needed * deficit, whItems, pendingUpdates);
    }
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
      const entries = whItems.filter(i => i.name.toLowerCase() === itemName.toLowerCase());
      const totalAvailable = entries.reduce((sum, i) => sum + Number(i.quantity || 0), 0);
      if (totalAvailable < missingQty) throw new Error("Inventario desincronizado.");

      let needed = missingQty;
      for (const entry of entries) {
        if (needed <= 0) break;
        const availableInEntry = Number(entry.quantity || 0);
        if (availableInEntry <= 0) continue;

        const deductAmount = Math.min(availableInEntry, needed);
        entry.quantity = availableInEntry - deductAmount;
        pendingUpdates.push({ id: entry.id, data: { quantity: entry.quantity } });
        needed -= deductAmount;
      }
    } else {
      // 2. RECURSIVE CRAFT DEDUCTION
      // Simulate breaking down the item into base materials
      deductFromWarehouseTree(itemName, missingQty, whItems, pendingUpdates);
    }

    // Process all warehouse deductions in Firebase
    window.toast("Actualizando Almacén...", "info");
    for (const update of pendingUpdates) {
      if (update.data.quantity <= 0) {
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

window.treasury = function () {
  const q = (document.getElementById("tr-q")?.value || "").toLowerCase();
  const ft = document.getElementById("tr-type")?.value || "";

  const list = window.STATE.treasury.filter(t => {
    if (q && !(t.description || "").toLowerCase().includes(q) && !(t.itemName || "").toLowerCase().includes(q)) return false;
    
    // Backwards compatibility mapping for filtering
    const effectiveType = (t.type === 'income' || t.type === 'expense') ? 'adena' : (t.type || 'adena');
    if (ft && effectiveType !== ft && t.type !== ft) return false;
    return true;
  });
  
  const rows = list.slice().reverse().map(t => {
    const isItem = t.type === 'item' || t.itemName;
    const itemBadge = t.itemName ? `<div style="margin-top:4px"><span style="font-size:0.8rem;color:var(--gold-light);background:var(--bg3);padding:2px 6px;border-radius:4px;border:1px solid var(--border);"><i class="ri-shield-user-line"></i> <b>${t.itemName}</b></span></div>` : "";
    
    const typeLabel = isItem ? "<span class='badge badge-gold'>Item L2</span>" : "<span class='badge badge-blue'>Adena</span>";
    const amountHtml = isItem ? "—" : `<span style="font-weight:600;color:var(--gold-light)">${window.fmt(t.amount)} ₳</span>`;
    
    return `
    <tr>
      <td>${window.fmtDate(t.date)}</td>
      <td>${typeLabel}</td>
      <td>${t.description || "—"}${itemBadge}</td>
      <td style="color:var(--text2)">Adquirido del Clan Principal</td>
      <td>${amountHtml}</td>
      <td style="display:flex;gap:4px">
        ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editTx('${t.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delTx('${t.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </td>
    </tr>`
  }).join("") || `<tr><td colspan="6"><div class="empty-state"><i class="ri-treasure-map-line"></i><p>Sin adquisiciones registradas</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-icon">📜</div><div class="stat-label">Total Adquisiciones Registradas</div><div class="stat-value" style="color:var(--gold-light);font-size:1.1rem">${window.STATE.treasury.length}</div></div>
    </div>
    <div class="filters">
      <input class="search-input" id="tr-q" placeholder="🔍 Buscar..." oninput="treasury()" value="${q}">
      <select class="filter-sel" id="tr-type" onchange="treasury()">
        <option value="">Todos los Tipos</option>
        <option value="adena">Adena</option>
        <option value="item">Items</option>
      </select>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción / Item</th><th>Origen</th><th>Monto</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

window.toggleTxFields = function() {
  const t = document.getElementById("f-txtype")?.value;
  const wAmt = document.getElementById("wrap-txamt");
  const wItm = document.getElementById("wrap-txitem");
  if (wAmt && wItm) {
    if (t === 'adena') { wAmt.style.display = 'block'; wItm.style.display = 'none'; }
    else { wAmt.style.display = 'none'; wItm.style.display = 'block'; }
  }
};

function treasuryFormHTML(t = {}) {
  let type = t.type || "adena";
  if (type === "income" || type === "expense") type = "adena";
  if (t.itemName && !t.type) type = "item";

  const amount = t.amount || "";
  const desc = t.description || "";
  const date = t.date || new Date().toLocaleDateString('en-CA');
  const itemName = t.itemName || "";

  return `
    <div class="form-grid">
      <div class="form-row"><label>Tipo de Adquisición</label>
        <select id="f-txtype" onchange="window.toggleTxFields()">
          <option value="adena" ${type === "adena" ? "selected" : ""}>Adena</option>
          <option value="item" ${type === "item" ? "selected" : ""}>Items L2</option>
        </select>
      </div>
      <div class="form-row" id="wrap-txamt" style="display: ${type === 'adena' ? 'block' : 'none'};"><label>Monto (Adena)</label><input id="f-txamt" type="number" min="0" placeholder="0" value="${amount}"></div>
      <div class="form-row col2" id="wrap-txitem" style="display: ${type === 'item' ? 'block' : 'none'};"><label>Item Adquirido / Importante</label>
        <div class="autocomplete-wrap">
          <input type="text" id="f-txitem" value="${itemName}" placeholder="Buscar item L2..." autocomplete="off" oninput="acSearch(this.value, 'f-txitem', 'ac-tx-item')">
          <div class="autocomplete-list" id="ac-tx-item"></div>
        </div>
      </div>
      <div class="form-row col2"><label>Descripción / Concepto (Opcional)</label><input id="f-txdesc" value="${desc}" placeholder="Ej: Drop de Boss, Venta grupal..."></div>
      <div class="form-row col2"><label>Fecha</label><input id="f-txdate" type="date" value="${date}"></div>
    </div>`;
}

function gatherTreasuryData() {
  const type = document.getElementById("f-txtype").value;
  const amt = type === 'adena' ? +document.getElementById("f-txamt").value : 0;
  const itemName = type === 'item' ? document.getElementById("f-txitem").value.trim() : "";
  const desc = document.getElementById("f-txdesc").value.trim();
  
  if (type === 'adena' && !amt) {
     window.toast("Ingresa un monto de Adena válido", "error"); return null;
  }
  if (type === 'item' && !itemName) {
     window.toast("Busca y selecciona un Item L2", "error"); return null;
  }
  
  return {
    type: type, amount: amt, description: desc,
    itemName: itemName,
    memberId: "clan", // Fixed to always be Clan instead of a member
    date: document.getElementById("f-txdate").value
  };
}

window.addTransaction = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  window.openModal("<i class='ri-coins-line'></i> Nueva Transacción",
    treasuryFormHTML(),
    async () => {
      const data = gatherTreasuryData(); if (!data) return false;
      const id = await window.saveFireDoc(`clans/${window.CLAN_ID}/treasury`, null, data);
      window.STATE.treasury.push({ id, ...data });
      window.toast("Guardado", "success"); window.treasury();
    }
  );
};

window.editTx = function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const t = window.STATE.treasury.find(x => x.id === id); if (!t) return;
  window.openModal(`<i class='ri-edit-2-line'></i> Editar Transacción`, treasuryFormHTML(t), async () => {
    const data = gatherTreasuryData(); if (!data) return false;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/treasury`, id, data);
    Object.assign(t, data);
    window.toast("Transacción actualizada", "success"); window.treasury();
  });
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
      <div class="form-row"><label>Fecha Préstamo</label><input id="f-ldate" type="date" value="${new Date().toLocaleDateString('en-CA')}"></div>
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

      await window.saveFireDoc(`clans/${window.CLAN_ID}/loans`, null, data);
      window.toast("Préstamo registrado", "success");
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
      window.toast("Préstamo actualizado", "success");
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
    window.toast("Préstamo devuelto y verificado", "success");
  }, "Confirmar Devolución");
};
window.delLoan = async (id) => {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/loans`, id);
  window.toast("Eliminado", "info");
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
    pointsMap[m.id] = { id: m.id, name: m.nickname, ant: 0, zaken: 0, frintezza: 0, baium: 0, orfen: 0, core: 0, asedio: 0, antharas: 0, valakas: 0, total: 0 };
  });

  window.STATE.events.forEach(ev => {
    const cat = ev.category || "ant"; // retrocompatibilidad
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

  // Totales globales por boss
  const globalTotals = { ant: 0, zaken: 0, frintezza: 0, baium: 0, orfen: 0, core: 0, asedio: 0, antharas: 0, valakas: 0, total: 0 };
  allMembers.forEach(m => {
    globalTotals.ant += m.ant;
    globalTotals.zaken += m.zaken;
    globalTotals.frintezza += m.frintezza;
    globalTotals.baium += m.baium;
    globalTotals.orfen += m.orfen;
    globalTotals.core += m.core;
    globalTotals.asedio += m.asedio;
    globalTotals.antharas += m.antharas;
    globalTotals.valakas += m.valakas;
    globalTotals.total += m.total;
  });

  const catBadge = {
    ant:       "<span class='badge badge-purple'  style='margin-right:8px'><i class='ri-skull-line'></i> Q. Ant</span>",
    zaken:     "<span class='badge badge-blue'    style='margin-right:8px'><i class='ri-skull-line'></i> Zaken</span>",
    frintezza: "<span class='badge badge-gold'    style='margin-right:8px'><i class='ri-skull-line'></i> Frintezza</span>",
    baium:     "<span class='badge badge-green'   style='margin-right:8px'><i class='ri-skull-line'></i> Baium</span>",
    orfen:     "<span class='badge badge-purple'  style='margin-right:8px'><i class='ri-skull-line'></i> Orfen</span>",
    core:      "<span class='badge badge-blue'    style='margin-right:8px'><i class='ri-skull-line'></i> Core</span>",
    asedio:    "<span class='badge badge-gold'    style='margin-right:8px'><i class='ri-flag-fill'></i> Asedio</span>",
    antharas:  "<span class='badge badge-green'   style='margin-right:8px'><i class='ri-skull-2-line'></i> Antharas</span>",
    valakas:   "<span class='badge badge-red'     style='margin-right:8px'><i class='ri-fire-fill'></i> Valakas</span>",
    // retrocompatibilidad
    main:      "<span class='badge badge-purple'  style='margin-right:8px'><i class='ri-sword-fill'></i> Clan Principal</span>",
    farm:      "<span class='badge badge-green'   style='margin-right:8px'><i class='ri-hammer-line'></i> Materiales</span>",
    quest:     "<span class='badge badge-gold'    style='margin-right:8px'><i class='ri-scroll-line'></i> Quests</span>",
    daily:     "<span class='badge badge-blue'    style='margin-right:8px'><i class='ri-calendar-todo-line'></i> Diarias</span>"
  };

  if (window._evView === "ranking") {
    // ── VISTA RANKING (Tabla de Puntos Separados) ────────────────────────
    const BOSS_COLS = [
      { key: 'ant',       label: 'Q. Ant' },
      { key: 'zaken',     label: 'Zaken' },
      { key: 'frintezza', label: 'Frintezza' },
      { key: 'baium',     label: 'Baium' },
      { key: 'orfen',     label: 'Orfen' },
      { key: 'core',      label: 'Core' },
      { key: 'asedio',    label: 'Asedio' },
      { key: 'antharas',  label: 'Antharas' },
      { key: 'valakas',   label: 'Valakas' },
    ];
    let adminHeaders = BOSS_COLS.map(b => `<th style="text-align:center">${b.label}</th>`).join("");
    let adminFooters = BOSS_COLS.map(b => `<td style="text-align:center;font-weight:bold">${window.fmt(globalTotals[b.key])}</td>`).join("");

    const tableRows = allMembers.map((m, i) => {
      const adminCells = BOSS_COLS.map(b =>
        `<td style="text-align:center;color:${m[b.key] > 0 ? 'var(--gold-light)' : 'var(--text3)'}">` +
        `${m[b.key] > 0 ? window.fmt(m[b.key]) : "—"}</td>`
      ).join("");
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
                <th style="text-align:center;background:rgba(155,89,182,0.1);color:var(--purple-light)">Total</th>
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
  } else if (window._evView === "bossDetail") {
    // ── VISTA EVENTOS DETALLE JEFE (Matriz vieja) ─────────────────────────
    const list = window.STATE.events.filter(e => {
      const boss = (window._selectedBossForDetail || "").toLowerCase();
      // Filtrar por el boss seleccionado
      const eName = (e.name || "").toLowerCase();
      const eCat = (e.category || "").toLowerCase();
      if (boss && !eName.includes(boss) && !eCat.includes(boss)) return false;
      if (q && !eName.includes(q)) return false;
      return true;
    });

    const eventsDesc = list.slice().reverse();

    const memberCols = window.STATE.members.map(m => `<th style="text-align:center; min-width:40px; font-size:0.65rem;" title="${m.class || ''}">${m.nickname.substring(0,6)}...</th>`).join("");

    const tableRows = eventsDesc.map(e => {
      const pts = (e.participants || []).reduce((s, p) => s + +p.points, 0);
      const catHTML = catBadge[e.category] || catBadge["ant"];
      
      const memberCells = window.STATE.members.map(m => {
        const p = (e.participants || []).find(x => x.memberId === m.id);
        if (!p) return `<td style="text-align:center; color:var(--text3); font-size:0.75rem;">-</td>`;
        
        const ann = p.anno || {};
        let annos = [];
        if (ann.L) annos.push("L");
        if (ann.D) annos.push("D");
        if (ann.P) annos.push("P");
        const annoStr = annos.length > 0 ? `<span style="color:var(--text3);font-size:0.6rem;margin-left:2px;letter-spacing:-0.5px">(${annos.join(",")})</span>` : "";
        
        return `<td style="text-align:center; font-weight:600; color:var(--gold-light); font-size:0.75rem;">${window.fmt(p.points)}${annoStr}</td>`;
      }).join("");

      const BOSS_NAMES = { ant:"Q. Ant", zaken:"Zaken", frintezza:"Frintezza", baium:"Baium", orfen:"Orfen", core:"Core", asedio:"Asedio", antharas:"Antharas", valakas:"Valakas" };
      const displayName = BOSS_NAMES[e.category] || BOSS_NAMES[e.category?.toLowerCase()] || e.name.replace(/\s*\(\d{1,2}\/\d{1,2}\/\d{4}\)\s*$/, "");
      return `<tr>
        <td style="white-space:nowrap; color:var(--text2); font-size:0.75rem">${e.date ? window.fmtDate(e.date) : ""}</td>
        <td style="min-width:140px;">
          <div style="display:flex;align-items:center;gap:6px">
            <div>
              <b style="color:var(--text);font-size:0.85rem;">${displayName}</b>
              <div style="margin-top:2px; transform: scale(0.85); transform-origin: left; white-space:nowrap">${catHTML}</div>
            </div>
          </div>
        </td>
        ${memberCells}
        <td style="text-align:center; font-weight:bold; color:var(--purple); background:rgba(155,89,182,0.1); font-size:0.8rem">${window.fmt(pts)}</td>
        ${window.STATE.isAdmin ? `
        <td style="text-align:right; white-space:nowrap; padding: 2px 4px;">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editEvent('${e.id}')" style="padding:2px 4px"><i class="ri-edit-line"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="delEvent('${e.id}')" style="padding:2px 4px"><i class="ri-delete-bin-line"></i></button>
        </td>` : ''}
      </tr>`;
    }).join("") || `<tr><td colspan="${window.STATE.members.length + 4}"><div class="empty-state"><i class="ri-file-list-3-line"></i><p>No hay eventos registrados</p></div></td></tr>`;

    document.getElementById("content").innerHTML = `
      <style>
        .matrix-table { width: 100%; min-width: max-content; border-collapse: separate; border-spacing: 0; }
        .matrix-table th { position: sticky; top: 0; z-index: 10; background: var(--bg3); border-bottom: 1px solid var(--border); padding: 6px 4px !important; }
        .matrix-table td { padding: 4px 6px !important; border-bottom: 1px solid rgba(42,38,80,.5); }
        .matrix-table tbody tr:hover td { background: rgba(255,255,255,.03); }
      </style>
      <div class="filters">
        <button class="btn btn-ghost btn-sm" onclick="window._evView='events'; window.events();" style="gap:6px"><i class="ri-arrow-left-line"></i> Volver a Matriz General</button>
        <input class="search-input" id="ev-q" placeholder="🔍 Buscar..." oninput="events()" value="">
      </div>
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="padding:12px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px">
          <i class="ri-file-list-3-line" style="color:var(--gold);font-size:1.1rem"></i>
          <b style="color:var(--gold-light);font-size:0.95rem">Participaciones: ${window._selectedBossForDetail}</b>
          <span class="badge badge-gray" style="margin-left:auto">${eventsDesc.length} participaciones</span>
        </div>
        <div class="table-wrap" style="box-shadow:none; max-height: 65vh; overflow:auto;">
          <table class="matrix-table">
            <thead>
              <tr>
                <th style="min-width:70px">Fecha</th>
                <th>Boss / Evento</th>
                ${memberCols}
                <th style="text-align:center; min-width:60px">Total</th>
                ${window.STATE.isAdmin ? `<th style="width:50px"></th>` : ''}
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
    
    document.getElementById("ev-q").value = q;
  } else {
    // ── VISTA EVENTOS (Matriz Moderna Dark Theme) ─────────────────────────
    const list = window.STATE.events.filter(e => {
      if (q && !(e.name || "").toLowerCase().includes(q)) return false;
      return true;
    });

    const BOSS_NAMES = { ant:"Q. Ant", zaken:"Zaken", frintezza:"Frintezza", baium:"Baium", orfen:"Orfen", core:"Core", asedio:"Asedio", antharas:"Antharas", valakas:"Valakas" };
    const getDisplayName = (e) => BOSS_NAMES[e.category] || BOSS_NAMES[e.category?.toLowerCase()] || (e.name ? e.name.replace(/\s*\(\d{1,2}\/\d{1,2}\/\d{4}\)\s*$/, "") : "Evento");
    
    const bossMap = {};
    for (const e of list) {
      const bName = getDisplayName(e);
      if (!bossMap[bName]) {
        bossMap[bName] = { 
          displayName: bName, 
          latestDate: e.date, 
          participationsMap: {}
        };
      }
      const bObj = bossMap[bName];
      // Actualizar a la fecha más reciente si corresponde
      if (e.date && (!bObj.latestDate || new Date(e.date) > new Date(bObj.latestDate))) {
          bObj.latestDate = e.date;
      }
      // Sumar los puntos de cada participante
      for (const p of (e.participants || [])) {
          bObj.participationsMap[p.memberId] = (bObj.participationsMap[p.memberId] || 0) + Number(p.points);
      }
    }
    
    // Convertir a array y ordenar desde la actividad más vieja a la más nueva (o por su fecha más reciente)
    const bossList = Object.values(bossMap).sort((a,b) => new Date(a.latestDate) - new Date(b.latestDate));

    const memberCols = window.STATE.members.map(m => `<th style="text-align:center; font-weight:600;">${m.nickname}</th>`).join("");

    let currentAcumula = 0;
    const tableRows = bossList.map(b => {
      let bPts = 0;
      
      const memberCells = window.STATE.members.map(m => {
        const pts = b.participationsMap[m.id] || 0;
        bPts += pts;
        
        if (pts === 0) return `<td style="text-align:center; color:var(--text3); font-size:0.85rem;">-</td>`;
        return `<td style="text-align:center; font-weight:600; color:var(--gold-light); font-size:0.9rem;">${pts}</td>`;
      }).join("");

      currentAcumula += bPts;

      let dateFormatted = b.latestDate ? new Date(b.latestDate + "T12:00:00").toLocaleDateString('es-ES', {day:'numeric', month:'short'}) : "";

      return `<tr>
        <td style="white-space:nowrap; text-align:center; color:var(--text2); font-size:0.8rem;">${dateFormatted}</td>
        <td style="font-weight:600; color:var(--text); cursor:pointer; font-size:0.85rem; border-right:1px solid rgba(255,255,255,0.05);" onclick="window._evView='bossDetail'; window._selectedBossForDetail='${b.displayName}'; window.events();" title="Clic para ver detalle">
          <span style="border-bottom:1px dashed var(--gold);">${b.displayName}</span>
        </td>
        ${memberCells}
        <td style="text-align:center; font-weight:700; color:var(--purple); background:rgba(155,89,182,0.1); font-size:0.9rem;">${bPts}</td>
        <td style="text-align:center; font-weight:700; color:var(--gold-light); background:rgba(212,175,55,0.1); font-size:0.9rem;">${currentAcumula}</td>
      </tr>`;
    }).join("") || `<tr><td colspan="${window.STATE.members.length + 4}"><div class="empty-state"><p>No hay eventos registrados</p></div></td></tr>`;

    document.getElementById("content").innerHTML = `
      <style>
        .dense-matrix { width: 100%; min-width: max-content; border-collapse: collapse; }
        .dense-matrix th, .dense-matrix td { padding: 8px 10px !important; border-bottom: 1px solid rgba(42,38,80,.5); }
        .dense-matrix thead th { background: var(--bg3); color: var(--text2); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; position: sticky; top: 0; z-index: 10; border-bottom: 2px solid var(--border); }
        .dense-matrix tbody tr:hover td { background: rgba(255,255,255,0.03); }
        .dense-matrix tbody td { border-right: 1px solid rgba(255,255,255,0.02); }
        .dense-matrix tbody td:last-child { border-right: none; }
      </style>
      <div class="filters">
        <input class="search-input" id="ev-q" placeholder="🔍 Buscar boss/evento..." oninput="events()" value="">
        <button class="btn btn-ghost btn-sm" onclick="showRanking()" style="gap:6px;white-space:nowrap;background:rgba(155,89,182,0.1);color:var(--purple-light);border:1px solid var(--purple)">
          <i class="ri-bar-chart-2-line"></i> ${window.STATE.isAdmin ? 'Ver Puntos Separados' : 'Estadísticas Generales'}
        </button>
      </div>
      <div class="card" style="padding:0; overflow:hidden;">
        <div style="padding:12px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px">
          <i class="ri-table-2" style="color:var(--gold);font-size:1.1rem"></i>
          <b style="color:var(--gold-light);font-size:0.95rem">Registro de Eventos Global</b>
          <span class="badge badge-gray" style="margin-left:auto">${bossList.length} jefes registrados</span>
        </div>
        <div class="table-wrap" style="box-shadow:none; max-height: 75vh; overflow:auto;">
          <table class="dense-matrix">
            <thead>
              <tr>
                <th rowspan="2" style="min-width:60px; text-align:center; border-right:1px solid var(--border)">Fecha</th>
                <th rowspan="2" style="min-width:80px; text-align:left; border-right:1px solid var(--border)">Boss</th>
                <th colspan="${window.STATE.members.length}" style="text-align:center; border-right:1px solid var(--border); border-bottom:1px solid var(--border)">Miembros de la CP</th>
                <th rowspan="2" style="min-width:60px; text-align:center; background:rgba(155,89,182,0.1); color:var(--purple-light); border-right:1px solid var(--border)">CP suma</th>
                <th rowspan="2" style="min-width:70px; text-align:center; background:rgba(212,175,55,0.1); color:var(--gold-light)">CP Acumula</th>
              </tr>
              <tr>
                ${memberCols}
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
    
    document.getElementById("ev-q").value = q;
  }
};

function eventFormHTML2(e = {}) {
  const cat = e.category || "main";
  return `<div class="form-grid">
    <div class="form-row col2"><label>Nombre del Evento / Sesión</label>
      <input id="f-ename" value="${e.name || ""}" placeholder="Ej: Siege de Rune, Raid Antharas, Farmeo Varka...">
    </div>
    <div class="form-row"><label>Fecha</label><input id="f-edate" type="date" value="${e.date || new Date().toLocaleDateString('en-CA')}"></div>
  <div class="form-row">
      <label>Puntos Máximos (Límite)</label>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <input id="f-edefpts" type="number" min="0" value="${e.defaultPoints || 1}" oninput="if(document.getElementById('f-eauto')?.checked) { document.querySelectorAll('.ev-check:checked').forEach(c => c.parentElement.querySelector('input[type=number]').value = this.value); }">
        <label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin:0;font-size:0.85rem;background:var(--bg3);padding:8px 10px;border-radius:6px;border:1px solid var(--border);">
          <input type="checkbox" id="f-eauto" checked style="width:auto;margin:0"> Auto-asignar a seleccionados
        </label>
      </div>
    </div>
    <div class="form-row"><label>Boss / Jefe</label>
      <select id="f-ecat">
        <option value="ant"       ${cat === "ant"       ? "selected" : ""}> Q. Ant</option>
        <option value="zaken"     ${cat === "zaken"     ? "selected" : ""}> Zaken</option>
        <option value="frintezza" ${cat === "frintezza" ? "selected" : ""}> Frintezza</option>
        <option value="baium"     ${cat === "baium"     ? "selected" : ""}> Baium</option>
        <option value="orfen"     ${cat === "orfen"     ? "selected" : ""}> Orfen</option>
        <option value="core"      ${cat === "core"      ? "selected" : ""}> Core</option>
        <option value="asedio"    ${cat === "asedio"    ? "selected" : ""}> Asedio</option>
        <option value="antharas"  ${cat === "antharas"  ? "selected" : ""}> Antharas</option>
        <option value="valakas"   ${cat === "valakas"   ? "selected" : ""}> Valakas</option>
      </select>
    </div>
    <div class="form-row" id="ev-quest-wrap" style="display:none">
       <label>Detalle adicional</label>
       <input id="f-equest" value="${e.questDetail || ""}" placeholder="Notas adicionales...">
    </div>
    
    <div class="form-row col2"><label>Descripción / Notas extra</label><textarea id="f-edesc">${e.description || ""}</textarea></div>
    <div class="form-row col2">
      <label>Seleccionar Participantes y Asignar Puntos</label>
      <div id="ev-participants">
        ${window.STATE.members.map(m => {
    const p = (e.participants || []).find(p => p.memberId === m.id);
    const ann = p?.anno || {};
    return `<div class="ev-member-row" style="flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px">
              <input type="checkbox" class="ev-check" id="ev-chk-${m.id}" ${p ? "checked" : ""} onchange="if(this.checked && document.getElementById('f-eauto')?.checked) { document.getElementById('ev-pts-${m.id}').value = document.getElementById('f-edefpts').value; }">
              <label class="ev-name" for="ev-chk-${m.id}">${m.nickname} <span style="color:var(--text3);font-size:.7rem">(${m.class || ""})</span></label>
            </div>
            <div style="display:flex;align-items:center;gap:8px">
              <label style="font-size:.75rem;display:flex;align-items:center;gap:3px;cursor:pointer" title="Líder (L)"><input type="checkbox" id="ev-anno-L-${m.id}" ${ann.L ? "checked" : ""}>L</label>
              <label style="font-size:.75rem;display:flex;align-items:center;gap:3px;cursor:pointer" title="Inquisidor/Driver (D)"><input type="checkbox" id="ev-anno-D-${m.id}" ${ann.D ? "checked" : ""}>D</label>
              <label style="font-size:.75rem;display:flex;align-items:center;gap:3px;cursor:pointer" title="Sin Líder Propio (P)"><input type="checkbox" id="ev-anno-P-${m.id}" ${ann.P ? "checked" : ""}>P</label>
              <input type="number" min="0" value="${p ? p.points : 0}" style="width:70px;margin-left:8px" id="ev-pts-${m.id}" oninput="let mx=+document.getElementById('f-edefpts').value; if(+this.value > mx) this.value = mx;">
              <span style="font-size:.7rem;color:var(--text3)">pts</span>
            </div>
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
    // Si no hay nombre, generar uno genérico basado en el boss
    const catNames = {
      ant:       "Q. Ant",
      zaken:     "Zaken",
      frintezza: "Frintezza",
      baium:     "Baium",
      orfen:     "Orfen",
      core:      "Core",
      asedio:    "Asedio",
      antharas:  "Antharas",
      valakas:   "Valakas"
    };
    name = catNames[category] || "Jefe";
  }

  const participants = window.STATE.members
    // Corrección crítica: sin espacios en los ID del template literal
    .filter(m => document.getElementById(`ev-chk-${m.id}`)?.checked)
    .map(m => ({
      memberId: m.id, 
      points: +(document.getElementById(`ev-pts-${m.id}`)?.value) || 0,
      anno: {
        L: document.getElementById(`ev-anno-L-${m.id}`)?.checked || false,
        D: document.getElementById(`ev-anno-D-${m.id}`)?.checked || false,
        P: document.getElementById(`ev-anno-P-${m.id}`)?.checked || false,
      }
    }));

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

// ── EQUIPMENT ───────────────────────────────────────────
window.equipment = function () {
  const q = (document.getElementById("eq-q")?.value || "").toLowerCase();
  const fs = document.getElementById("eq-status")?.value || "";
  const fm = document.getElementById("eq-member")?.value || "";

  const list = window.STATE.equipment.filter(e => {
    const matchesQuery = !q ||
      window.memberName(e.memberId).toLowerCase().includes(q) ||
      (e.itemName && e.itemName.toLowerCase().includes(q));

    if (!matchesQuery) return false;
    if (fs && e.status !== fs) return false;
    if (fm && e.memberId !== fm) return false;
    return true;
  });

  const stBadge = s => ({
    propio: "<span class='badge badge-green'>Propio</span>",
    prestamo: "<span class='badge badge-blue'>Préstamo</span>",
  }[s] || s);

  const rows = list.map(e => `
    <tr>
      <td><b>${window.memberName(e.memberId)}</b></td>
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:0.85rem;color:var(--gold-light);background:var(--bg3);padding:3px 8px;border-radius:5px;border:1px solid var(--border);">
            <b>${e.itemName}</b>
          </span>
        </div>
      </td>
      <td>${stBadge(e.status)}</td>
      <td>${window.fmtDate(e.date)}</td>
      <td style="font-size:0.8rem;color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${e.notes || ''}">${e.notes || '-'}</td>
      <td style="display:flex;gap:4px">
        ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editEquipment('${e.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delEquipment('${e.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </td>
    </tr>
  `).join("") || `<tr><td colspan="6"><div class="empty-state"><i class="ri-shield-user-line"></i><p>No hay equipamiento registrado</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <select class="filter-sel" id="eq-member" onchange="equipment()">
        <option value="" ${fm === "" ? "selected" : ""}>Todos los Miembros</option>
        ${window.STATE.members.map(m => `<option value="${m.id}" ${fm === m.id ? "selected" : ""}>${m.nickname}</option>`).join("")}
      </select>
      <select class="filter-sel" id="eq-status" onchange="equipment()">
        <option value="" ${fs === "" ? "selected" : ""}>Todos los Estados</option>
        <option value="propio" ${fs === "propio" ? "selected" : ""}>Propio</option>
        <option value="prestamo" ${fs === "prestamo" ? "selected" : ""}>Préstamo</option>
      </select>
      <input class="search-input" id="eq-q" placeholder="🔍 Buscar item..." oninput="equipment()" value="${q}">
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Miembro</th><th>Item</th><th>Estado</th><th>Fecha</th><th>Notas</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

function equipmentFormHTML(e = {}) {
  const mId = e.memberId || "";
  const iName = e.itemName || "";
  const st = e.status || "propio";
  const dt = e.date || new Date().toISOString().split("T")[0];
  const nt = e.notes || "";

  return `
    <div class="form-grid">
      <div class="form-row"><label>Miembro</label>
        <select id="f-eq-member">
          <option value="">Seleccionar...</option>
          ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === mId ? "selected" : ""}>${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Estado</label>
        <select id="f-eq-status">
          <option value="propio" ${st === "propio" ? "selected" : ""}>Propio</option>
          <option value="prestamo" ${st === "prestamo" ? "selected" : ""}>Préstamo</option>
        </select>
      </div>
      <div class="form-row col2"><label>Item Equipado</label>
        <div class="autocomplete-wrap">
          <input type="text" id="f-eq-item" value="${iName}" placeholder="Buscar item L2..." autocomplete="off" oninput="acSearch(this.value, 'f-eq-item', 'ac-eq-item')">
          <div class="autocomplete-list" id="ac-eq-item"></div>
        </div>
      </div>
      <div class="form-row col2"><label>Fecha de Registro</label>
        <input type="date" id="f-eq-date" value="${dt}">
      </div>
      <div class="form-row col2"><label>Notas / Condiciones</label>
        <textarea id="f-eq-notes" rows="2" placeholder="Opcional...">${nt}</textarea>
      </div>
    </div>
  `;
}
 
function gatherEquipmentData() {
  const memberId = document.getElementById("f-eq-member").value;
  const status = document.getElementById("f-eq-status").value;
  // Make sure not to crash via uninitialized DOM
  const itemEl = document.getElementById("f-eq-item");
  const itemName = itemEl ? itemEl.value.trim() : "";
  const date = document.getElementById("f-eq-date").value;
  const notes = document.getElementById("f-eq-notes").value.trim();

  if (!memberId) { window.toast("Selecciona un miembro", "error"); return null; }
  if (!itemName) { window.toast("Escribe el nombre del item", "error"); return null; }

  return { memberId, status, itemName, date, notes };
}

window.addEquipment = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!window.STATE.members.length) { window.toast("Agrega miembros primero", "error"); return; }
  window.openModal("<i class='ri-shield-user-line'></i> Otorgar Equipamiento", equipmentFormHTML(), async () => {
    const data = gatherEquipmentData(); if (!data) return false;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/equipment`, null, data);
    window.toast("Equipamiento registrado", "success");
  });
};

window.editEquipment = function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const e = window.STATE.equipment.find(x => x.id === id); if (!e) return;
  window.openModal(`<i class='ri-edit-2-line'></i> Editar Equipamiento`, equipmentFormHTML(e), async () => {
    const data = gatherEquipmentData(); if (!data) return false;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/equipment`, id, data);
    window.toast("Equipamiento actualizado", "success");
  });
};

window.delEquipment = async function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este registro de equipamiento?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/equipment`, id);
  window.toast("Eliminado", "info");
};

// ── DESEADO ─────────────────────────────────────────────
window.desired = function () {
  const q = (document.getElementById("ds-q")?.value || "").toLowerCase();
  const fm = document.getElementById("ds-member")?.value || "";
  const fs = document.getElementById("ds-status")?.value || "";

  const list = window.STATE.desired.filter(d => {
    if (fm && d.memberId !== fm) return false;
    if (fs && d.status !== fs) return false;
    // Check inside items
    if (q) {
      const mn = window.memberName(d.memberId).toLowerCase();
      const hasItem = (d.items || []).some(it => it.name.toLowerCase().includes(q));
      if (!mn.includes(q) && !hasItem) return false;
    }
    return true;
  });

  const stBadge = s => ({
    active: "<span class='badge badge-blue'>Activo</span>",
    fulfilled: "<span class='badge badge-green'>Cumplido</span>"
  }[s] || s);

  const rows = list.map(d => {
    const itemsHtml = `<div style="display:flex;flex-direction:column;gap:3px">` +
        (d.items || []).map(it => `<div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:0.75rem;color:var(--text);background:var(--bg3);padding:3px 8px;border-radius:5px;border:1px solid var(--border);">
            <b>${it.name}</b>
          </span>
          <span style="color:var(--gold-light);font-size:0.75rem;font-weight:600;">x${it.qty}</span>
        </div>`).join("") + `</div>`;

    return `
    <tr>
      <td><b>${window.memberName(d.memberId)}</b></td>
      <td>${itemsHtml}</td>
      <td>${stBadge(d.status)}</td>
      <td>${window.fmtDate(d.dateAdded)}</td>
      <td style="font-size:0.8rem;color:var(--text2);max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${d.notes || ''}">${d.notes || '-'}</td>
      <td style="display:flex;gap:4px">
        ${window.STATE.isAdmin ? `
        ${d.status === "active" ? `<button class="btn btn-ghost btn-sm" onclick="fulfillDesired('${d.id}')" title="Marcar como Cumplido">✓</button>` : ""}
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editDesired('${d.id}')" title="Editar"><i class="ri-edit-line"></i></button>
        <button class="btn btn-danger btn-icon btn-sm" onclick="delDesired('${d.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>
        ` : ''}
      </td>
    </tr>
    `;
  }).join("") || `<tr><td colspan="6"><div class="empty-state"><i class="ri-heart-add-line"></i><p>No hay ítems deseados registrados</p></div></td></tr>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <select class="filter-sel" id="ds-member" onchange="desired()">
        <option value="" ${fm === "" ? "selected" : ""}>Todos los Miembros</option>
        ${window.STATE.members.map(m => `<option value="${m.id}" ${fm === m.id ? "selected" : ""}>${m.nickname}</option>`).join("")}
      </select>
      <select class="filter-sel" id="ds-status" onchange="desired()">
        <option value="" ${fs === "" ? "selected" : ""}>Todos los Estados</option>
        <option value="active" ${fs === "active" ? "selected" : ""}>Activo</option>
        <option value="fulfilled" ${fs === "fulfilled" ? "selected" : ""}>Cumplido</option>
      </select>
      <input class="search-input" id="ds-q" placeholder="🔍 Buscar miembro o ítem..." oninput="desired()" value="${q}">
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Miembro</th><th>Ítems Deseados</th><th>Estado</th><th>Fecha Registro</th><th>Notas</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
};

// MULTI-ITEM LOGIC FOR DESIRED
window._desiredItems = [];
window.addDesiredItemRow = () => { window._desiredItems.push({ name: "", qty: 1 }); renderDesiredItemRows(); };
window.rmDesiredItemRow = (idx) => { window._desiredItems.splice(idx, 1); renderDesiredItemRows(); };
window.updDesiredItemName = (idx, val) => { window._desiredItems[idx].name = val; };
window.updDesiredItemQty = (idx, val) => { window._desiredItems[idx].qty = val; };

function renderDesiredItemRows() {
  const c = document.getElementById("desired-items-container");
  if (!c) return;
  c.innerHTML = window._desiredItems.map((m, i) => `
    <div class="form-grid" style="margin-bottom:8px">
      <div class="form-row col2">
        <div class="autocomplete-wrap">
          <input type="text" id="ds-it-${i}" value="${m.name}" placeholder="Buscar item L2..." oninput="updDesiredItemName(${i}, this.value); acSearch(this.value, 'ds-it-${i}', 'ac-ds-it-${i}')" autocomplete="off">
          <div class="autocomplete-list" id="ac-ds-it-${i}"></div>
        </div>
      </div>
      <div class="form-row" style="display:flex;gap:4px">
        <input type="number" value="${m.qty}" min="1" style="width:70px" oninput="updDesiredItemQty(${i}, this.value)">
        <button class="btn btn-danger btn-icon" tabindex="-1" onclick="rmDesiredItemRow(${i})">X</button>
      </div>
    </div>
  `).join("");
}

function desiredFormHTML(d = {}) {
  const mId = d.memberId || "";
  const dt = d.dateAdded || new Date().toISOString().split("T")[0];
  const nt = d.notes || "";
  return `
    <div class="form-grid">
      <div class="form-row col2"><label>Miembro</label>
        <select id="f-ds-member">
          <option value="">Seleccionar...</option>
          ${window.STATE.members.map(m => `<option value="${m.id}" ${m.id === mId ? "selected" : ""}>${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row col2">
        <label>Items Deseados <button class="btn btn-ghost btn-sm" style="float:right;padding:2px 6px" onclick="addDesiredItemRow()">+ Añadir Ítem</button></label>
        <div id="desired-items-container"></div>
      </div>
      <div class="form-row col2"><label>Fecha de Registro</label>
        <input type="date" id="f-ds-date" value="${dt}">
      </div>
      <div class="form-row col2"><label>Notas (Opcional)</label>
        <textarea id="f-ds-notes" rows="2" placeholder="Opcional...">${nt}</textarea>
      </div>
    </div>
  `;
}

function gatherDesiredData() {
  const memberId = document.getElementById("f-ds-member").value;
  const dateAdded = document.getElementById("f-ds-date").value;
  const notes = document.getElementById("f-ds-notes").value.trim();

  if (!memberId) { window.toast("Selecciona un miembro", "error"); return null; }
  
  const finalItems = [];
  for (const it of window._desiredItems) {
    if (it.name.trim()) finalItems.push({ name: it.name.trim(), qty: parseInt(it.qty) || 1 });
  }
  if (finalItems.length === 0) {
    window.toast("Debes agregar al menos un ítem deseado", "error"); return null;
  }

  return { memberId, items: finalItems, dateAdded, notes, status: "active" };
}

window.addDesired = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  window._desiredItems = [{ name: "", qty: 1 }];
  window.openModal("<i class='ri-heart-add-line'></i> Registrar Ítem Deseado", desiredFormHTML(), async () => {
    const data = gatherDesiredData(); if (!data) return false;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/desired`, null, data);
    window.toast("Ítem deseado registrado", "success");
  });
  setTimeout(renderDesiredItemRows, 50);
};

window.editDesired = function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const d = window.STATE.desired.find(x => x.id === id); if (!d) return;
  window._desiredItems = (d.items && d.items.length) ? [...d.items] : [{ name: "", qty: 1 }];
  window.openModal(`<i class='ri-edit-2-line'></i> Editar Ítem Deseado`, desiredFormHTML(d), async () => {
    const data = gatherDesiredData(); if (!data) return false;
    // preserve status if it was fulfilled
    data.status = d.status;
    await window.saveFireDoc(`clans/${window.CLAN_ID}/desired`, id, data);
    window.toast("Actualizado", "success");
  });
  setTimeout(renderDesiredItemRows, 50);
};

window.delDesired = async function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Eliminar este registro?")) return;
  await window.delFireDoc(`clans/${window.CLAN_ID}/desired`, id);
  window.toast("Eliminado", "info");
};

window.fulfillDesired = async function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!confirm("¿Marcar todos los ítems de esta lista como cumplidos/obtenidos?")) return;
  await window.saveFireDoc(`clans/${window.CLAN_ID}/desired`, id, { status: "fulfilled" });
  window.toast("Ítems marcados como cumplidos", "success");
};
