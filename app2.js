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

  // Si es un ítem de equipamiento (multi-add), actualizamos _equipmentItems
  if (inputId.startsWith('eq-it-')) {
    const idx = parseInt(inputId.replace('eq-it-', ''));
    if (!isNaN(idx) && window.updEquipmentItemName) {
      window.updEquipmentItemName(idx, name);
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
    let totalNeeded = 0, totalCollected = 0;
    mats.forEach(m => {
      const whAmt = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === m.name.toLowerCase()).reduce((s, i) => s + Number(i.quantity || 0), 0);
      totalNeeded += Number(m.needed || 0);
      totalCollected += Math.min(Number(m.needed || 0), whAmt);
    });
    const pct = totalNeeded ? Math.min(100, Math.round(totalCollected / totalNeeded * 100)) : 0;
    const pctColor = pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';

    return `<div class="card" style="margin-bottom:12px;cursor:pointer;transition:border-color .2s,transform .15s;"
        onmouseenter="this.style.borderColor='var(--gold-dark)';this.style.transform='translateY(-1px)'"
        onmouseleave="this.style.borderColor='';this.style.transform=''"
        onclick="viewCraftDetail('${c.id}', 1)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:8px">
            <i class="ri-hammer-line" style="color:var(--gold-dark)"></i>
            <b style="color:var(--gold-light);font-size:.95rem">${c.targetItem}</b>
          </div>
          <div style="color:var(--text3);font-size:.73rem;margin-top:3px">
            <i class="ri-user-line"></i> Crafter: ${window.memberName(c.crafterId) || "Sin asignar"}
            &nbsp;·&nbsp;
            <i class="ri-list-check-2"></i> ${mats.length} material(es)
            ${c.deadline ? `&nbsp;·&nbsp; 📅 ${c.deadline}` : ""}
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:6px">
          ${stBadge[c.status] || c.status}
          <div style="font-size:.72rem;font-weight:700;color:${pctColor}">${pct}%</div>
        </div>
        <div onclick="event.stopPropagation()" style="display:flex;gap:4px">
          ${window.STATE.isAdmin ? `
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editCraft('${c.id}')" title="Editar"><i class="ri-edit-line"></i></button>
          <button class="btn btn-danger btn-icon btn-sm" onclick="delCraft('${c.id}')" title="Eliminar"><i class="ri-delete-bin-line"></i></button>` : ''}
        </div>
      </div>
      <div class="progress-bar" style="margin-bottom:5px"><div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div></div>
      <div style="font-size:.7rem;color:var(--text3)">${totalCollected}/${totalNeeded} unidades reunidas · Haz clic para ver el árbol de crafteo detallado</div>
    </div>`;
  }).join("") || `<div class="empty-state"><i class="ri-hammer-line"></i><p>No hay crafts registrados. Crea uno con el botón + Nuevo.</p></div>`;

  document.getElementById("content").innerHTML = `
    <div class="filters">
      <input class="search-input" id="cr-q" placeholder="🔍 Buscar craft..." oninput="crafts()" value="${q}">
      <select class="filter-sel" id="cr-status" onchange="crafts()">
        <option value="">Todos</option><option value="active">En Progreso</option>
        <option value="completed">Completado</option><option value="cancelled">Cancelado</option>
      </select>
      <span style="margin-left:auto;color:var(--text3);font-size:.8rem">${list.length} craft(s)</span>
    </div>
    <div style="margin-bottom:12px;font-size:.78rem;color:var(--text3);display:flex;align-items:center;gap:6px">
      <i class="ri-information-line" style="color:var(--gold-dark)"></i>
      Haz clic en una tarjeta para ver el árbol de crafteo detallado con explicaciones y multiplicadores.
    </div>
    ${cards}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// CRAFT DETAIL — Vista completa con árbol, multiplicador y notas
// ─────────────────────────────────────────────────────────────────────────────

function buildCraftTreeNode(itemName, qty, absoluteQty, path, depth, whPool) {
  const recipe = getRecipeFor(itemName);
  const itemNameLower = itemName.toLowerCase();

  let whAmtAvailable = 0;
  let usedFromPool = 0;
  if (whPool) {
    whAmtAvailable = whPool[itemNameLower] || 0;
    usedFromPool = Math.min(qty, whAmtAvailable);
    whPool[itemNameLower] -= usedFromPool;
  }
  
  const craftQty = qty - usedFromPool;

  const fullWhAmt = (window.STATE.warehouse || [])
    .filter(i => i.name.toLowerCase() === itemNameLower)
    .reduce((s, i) => s + Number(i.quantity || 0), 0);

  const isNonCraft = isNonCraftable(itemName);
  const isBase = !recipe || recipe.length === 0;

  const node = {
    name: itemName,
    qty,
    absoluteQty,
    whAmt: fullWhAmt,
    allocatedFromPool: usedFromPool,
    craftQty,
    path: [...path],
    depth,
    isBase: isBase || isNonCraft,
    isNonCraft,
    children: []
  };

  if (!isBase && !isNonCraft && depth < 8) {
    for (const mat of recipe) {
      node.children.push(buildCraftTreeNode(mat.name, mat.needed * craftQty, mat.needed * absoluteQty, [...path, itemName], depth + 1, whPool));
    }
  }
  return node;
}

function collectBaseLeaves(node, acc) {
  if (!acc) acc = {};
  if (node.children.length === 0) {
    const key = node.name;
    if (!acc[key]) acc[key] = { name: node.name, qty: 0, isNonCraft: node.isNonCraft };
    acc[key].qty += node.qty;
  } else {
    for (const child of node.children) collectBaseLeaves(child, acc);
  }
  return acc;
}

let _ctNodeCounter = 0;
function renderCraftNode(node, isRoot) {
  const nodeId = 'ctn-' + (++_ctNodeCounter);
  const hasChildren = node.children.length > 0;
  const whOk = node.whAmt >= node.qty;
  const whColor = whOk ? 'var(--green)' : node.whAmt > 0 ? 'var(--gold)' : 'var(--red)';

  // Breadcrumb path: shows WHY this material is in the chain
  let pathHTML = '';
  if (node.path && node.path.length > 0) {
    const crumbs = node.path.map((seg, i) =>
      `${i > 0 ? '<span class="ct-path-arrow">▶</span>' : ''}<span>${seg}</span>`
    ).join('') + `<span class="ct-path-arrow">▶</span><span style="color:var(--text)">${node.name}</span>`;
    pathHTML = `<div class="ct-path" title="Esta es la razón por la que se necesita este material">${crumbs}</div>`;
  }

  let typeBadge = '';
  if (node.isNonCraft) {
    typeBadge = `<span class="source-badge source-drop" title="Solo se obtiene por drop/boss/quest">Drop/Boss</span>`;
  } else if (hasChildren) {
    typeBadge = `<span class="source-badge source-craft" title="Este ítem también tiene receta propia — expandible">Crafteable</span>`;
  } else {
    typeBadge = `<span class="source-badge source-shop" title="Material base — farmeable, spoileable o comprable">Mat. Base</span>`;
  }

  const headerClass = [
    'ct-node-header',
    isRoot ? 'root-node' : (hasChildren ? 'sub-node' : (node.isNonCraft ? 'missing-node' : 'base-node')),
    hasChildren ? 'has-children' : ''
  ].join(' ');

  const toggleIcon = hasChildren
    ? `<i class="ct-toggle-icon ri-arrow-right-s-line" id="ti-${nodeId}"></i>`
    : `<i class="ct-toggle-icon ri-corner-down-right-line" style="opacity:.3"></i>`;

  const childrenHTML = hasChildren ? `
    <div class="ct-children" id="${nodeId}">
      ${node.children.map(child => `<div class="ct-child-wrap">${renderCraftNode(child, false)}</div>`).join('')}
    </div>` : '';

  const opacity = node.qty === 0 ? '0.45' : '1';

  let detailsHTML = `<div style="display:flex;flex-direction:column;align-items:flex-end;gap:3px;font-size:.75rem;margin-top:2px;">`;

  if (node.absoluteQty !== node.qty) {
    detailsHTML += `<div style="color:var(--text3); font-size:.65rem;" title="Total absoluto si no tuvieras nada en almacén">Total Neto de Receta: <b>${node.absoluteQty}</b></div>`;
  }
  
  detailsHTML += `<div style="font-size:.85rem; font-weight:bold; color:var(--text);" title="Lo que realmente pide el crafteo superior tras usar el almacén">Requerido: <b>×${node.qty}</b></div>`;

  if (node.whAmt > 0) {
    const allocColor = node.allocatedFromPool > 0 ? 'var(--green)' : 'var(--text3)';
    detailsHTML += `<div style="color:${allocColor}">📦 Almacén usado: <b>${node.allocatedFromPool}</b> <span style="font-size:.65rem">(de ${node.whAmt} total)</span></div>`;
  } else {
    detailsHTML += `<div style="color:var(--text3);font-size:.7rem">📦 Almacén: 0</div>`;
  }

  if (node.craftQty > 0) {
    const actionColor = node.isNonCraft ? 'var(--red)' : 'var(--gold-light)';
    const actionText = node.isNonCraft ? '🩸 A Farmear (Faltan)' : '🔨 A Craftear';
    detailsHTML += `<div style="color:${actionColor}; font-weight:bold; background:rgba(0,0,0,0.2); padding:2px 6px; border-radius:4px;">${actionText}: ${node.craftQty}</div>`;
  } else if (node.qty > 0) {
    detailsHTML += `<div style="color:var(--green); font-weight:bold; background:rgba(46,204,113,0.1); padding:2px 6px; border-radius:4px;">✅ Completado por Almacén</div>`;
  } else {
    detailsHTML += `<div style="color:var(--text3); font-weight:bold; background:rgba(255,255,255,0.05); padding:2px 6px; border-radius:4px;">No requerido</div>`;
  }

  detailsHTML += `</div>`;

  return `<div class="ct-node" style="opacity:${opacity}">
      ${pathHTML}
      <div class="${headerClass}" ${hasChildren ? `onclick="ctToggle('${nodeId}')"` : ''}>
        ${toggleIcon}
        <span class="ct-item-name">${node.name}</span>
        ${typeBadge}
        ${detailsHTML}
      </div>
      ${childrenHTML}
    </div>`;
}

window.ctToggle = function(nodeId) {
  const el = document.getElementById(nodeId);
  const icon = document.getElementById('ti-' + nodeId);
  if (!el) return;
  const open = el.classList.toggle('open');
  if (icon) icon.classList.toggle('open', open);
};

window.viewCraftDetail = function(craftId, mult) {
  const c = window.STATE.crafts.find(x => x.id === craftId);
  if (!c) return;
  const multiplier = Math.max(1, parseInt(mult) || 1);

  const stBadge = {
    active: "<span class='badge badge-blue'>En Progreso</span>",
    completed: "<span class='badge badge-green'>Completado</span>",
    cancelled: "<span class='badge badge-red'>Cancelado</span>"
  };

  const mats = c.materials || [];
  let totalNeeded = 0, totalCollected = 0;
  mats.forEach(m => {
    const whAmt = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === m.name.toLowerCase()).reduce((s, i) => s + Number(i.quantity || 0), 0);
    totalNeeded += Number(m.needed || 0) * multiplier;
    totalCollected += Math.min(Number(m.needed || 0) * multiplier, whAmt);
  });
  const pct = totalNeeded ? Math.min(100, Math.round(totalCollected / totalNeeded * 100)) : 0;
  const pctColor = pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)';

  // Build tree nodes for each material
  _ctNodeCounter = 0;
  
  const whPoolTree = {};
  (window.STATE.warehouse || []).forEach(i => {
     const name = i.name.toLowerCase();
     whPoolTree[name] = (whPoolTree[name] || 0) + Number(i.quantity || 0);
  });

  const treeNodes = mats.map(m => {
    const qty = Number(m.needed || 1) * multiplier;
    return buildCraftTreeNode(m.name, qty, qty, [c.targetItem], 1, whPoolTree);
  });

  const treeRootsHTML = treeNodes.length > 0 ? treeNodes.map(node => {
    return renderCraftNode(node, true);
  }).join('<div style="margin:12px 0;border-top:1px dashed var(--border)"></div>') :
    `<div class="empty-state" style="padding:30px"><i class="ri-list-check-2"></i><p>No hay materiales configurados en este craft.</p></div>`;

  // Flat base materials summary based on ACTUAL missing materials
  const baseSummary = {};
  treeNodes.forEach(node => collectBaseLeaves(node, baseSummary));
  
  // Calculate absolute base cost for maxCraftsPossible
  const absoluteBaseCost = {};
  mats.forEach(m => {
    const qty = Number(m.needed || 1);
    const node = buildCraftTreeNode(m.name, qty, qty, [], 0);
    collectBaseLeaves(node, absoluteBaseCost);
  });
  
  let maxCraftsPossible = Infinity;
  Object.values(absoluteBaseCost).forEach(mat => {
    const whAmt = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === mat.name.toLowerCase()).reduce((s, i) => s + Number(i.quantity || 0), 0);
    const craftableWithThis = Math.floor(whAmt / mat.qty);
    if (craftableWithThis < maxCraftsPossible) {
      maxCraftsPossible = craftableWithThis;
    }
  });
  if (Object.keys(absoluteBaseCost).length === 0) maxCraftsPossible = 0;

  const activeBaseSummary = Object.values(baseSummary).filter(x => x.qty > 0).sort((a, b) => b.qty - a.qty);

  const baseSummaryRows = activeBaseSummary.map(mat => {
    const whAmt = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === mat.name.toLowerCase()).reduce((s, i) => s + Number(i.quantity || 0), 0);
    const totalAbsoluteNeeded = absoluteBaseCost[mat.name] ? absoluteBaseCost[mat.name].qty * multiplier : mat.qty;
    
    const missing = mat.qty;
    const baseCostPerItem = absoluteBaseCost[mat.name] ? absoluteBaseCost[mat.name].qty : 1;
    const craftableWithThis = Math.floor(whAmt / baseCostPerItem);

    const badge = mat.isNonCraft
      ? `<span class="source-badge source-drop">Drop</span>`
      : `<span class="source-badge source-craft">Craft</span>`;

    const statusText = `<span style="color:var(--red)">Faltan ${missing}</span>`;

    return `<div class="summary-row" style="padding: 8px; margin-bottom: 6px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg3);">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <div>
          <span class="summary-mat-name" style="font-weight:600">${mat.name}</span>
          ${badge}
        </div>
        <span style="font-size:.8rem; font-weight:700">Inventario: ${whAmt} / Necesario: ${totalAbsoluteNeeded}</span>
      </div>
      <div style="display:flex; justify-content:space-between; font-size:.75rem;">
        ${statusText}
        <span style="color:var(--text3)">(Alcanza para <b style="color:var(--gold-light)">${craftableWithThis}</b> crafts)</span>
      </div>
    </div>`;
  }).join('');

  // Per-material progress cards
  const matCardsHTML = mats.map(m => {
    const qtyNeeded = Number(m.needed || 1) * multiplier;
    const neededPerTarget = Number(m.needed || 1);
    const whAmt = (window.STATE.warehouse || []).filter(i => i.name.toLowerCase() === m.name.toLowerCase()).reduce((s, i) => s + Number(i.quantity || 0), 0);
    const matPct = qtyNeeded ? Math.min(100, Math.round(whAmt / qtyNeeded * 100)) : 0;
    const ok = whAmt >= qtyNeeded;
    const missing = Math.max(0, qtyNeeded - whAmt);
    const craftableWithThis = neededPerTarget > 0 ? Math.floor(whAmt / neededPerTarget) : 0;

    const recipe = getRecipeFor(m.name);
    const hasSubTree = recipe && recipe.length > 0;
    const subInfo = hasSubTree
      ? `<div style="font-size:.68rem;color:var(--gold);margin-top:4px"><i class="ri-hammer-line"></i> Se craftea con ${recipe.length} componente(s) — ver árbol abajo</div>`
      : isNonCraftable(m.name)
        ? `<div style="font-size:.68rem;color:var(--red);margin-top:4px"><i class="ri-forbid-line"></i> Solo Drop / Boss — no se craftea</div>`
        : `<div style="font-size:.68rem;color:var(--green);margin-top:4px"><i class="ri-leaf-line"></i> Material Base — farmeable o comprable</div>`;
    return `<div style="background:var(--bg3);border:1px solid ${ok ? 'rgba(46,204,113,.35)' : 'var(--border)'};border-radius:8px;padding:10px 13px">
      <div style="font-weight:600;font-size:.84rem">${m.name}</div>
      ${subInfo}
      <div style="display:flex;align-items:center;gap:8px;margin-top:8px;margin-bottom:6px">
        <span style="font-size:.9rem;font-weight:700;color:${ok ? 'var(--green)' : 'var(--text)'}">${whAmt}</span>
        <span style="color:var(--text3)">/ ${qtyNeeded}</span>
        <div class="progress-bar" style="flex:1;height:5px">
          <div class="progress-fill" style="width:${matPct}%;background:${ok ? 'var(--green)' : 'var(--gold-dark)'}"></div>
        </div>
        <span style="font-size:.72rem;color:var(--text3)">${matPct}%</span>
      </div>
      <div style="font-size:.72rem; color:var(--text2); background:var(--bg2); padding:4px 6px; border-radius:4px; display:flex; justify-content:space-between;">
        <div>${ok ? `<span style="color:var(--green)">✓ Sobran ${whAmt - qtyNeeded}</span>` : `<span style="color:var(--red)">Faltan ${missing}</span>`}</div>
        <div>Alcanza para: <b style="color:var(--gold-light)">${craftableWithThis}</b></div>
      </div>
    </div>`;
  }).join('');

  const multButtons = [1, 5, 10, 20, 30, 50].map(n =>
    `<button class="mult-btn${multiplier === n ? ' active' : ''}" onclick="viewCraftDetail('${c.id}', ${n})">×${n}</button>`
  ).join('');

  document.getElementById("content").innerHTML = `
    <div class="craft-back-row">
      <button class="btn btn-ghost btn-sm" onclick="crafts()"><i class="ri-arrow-left-line"></i> Volver a Crafts</button>
      ${window.STATE.isAdmin ? `
        <button class="btn btn-ghost btn-sm" onclick="editCraft('${c.id}')"><i class="ri-edit-line"></i> Editar</button>
        <button class="btn btn-danger btn-sm" onclick="delCraft('${c.id}')"><i class="ri-delete-bin-line"></i> Eliminar</button>
      ` : ''}
    </div>

    <div class="craft-detail-header">
      <div style="display:flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,var(--gold-dark),var(--gold));font-size:1.5rem;flex-shrink:0">⚒️</div>
      <div style="flex:1">
        <div class="craft-detail-title">${c.targetItem}</div>
        <div class="craft-detail-subtitle">
          Crafter: ${window.memberName(c.crafterId) || "Sin asignar"} &nbsp;·&nbsp; ${stBadge[c.status] || c.status}
          ${c.createdAt ? `&nbsp;·&nbsp; Creado: ${new Date(c.createdAt).toLocaleDateString('es-ES')}` : ''}
        </div>
      </div>
      <div class="mult-bar">
        <label><i class="ri-calculator-line"></i> Cantidad</label>
        ${multButtons}
        <input class="mult-input" type="number" min="1" value="${multiplier}" id="custom-mult-input"
          title="Ingresa una cantidad personalizada y presiona Enter"
          onchange="viewCraftDetail('${c.id}', this.value)"
          onkeydown="if(event.key==='Enter') viewCraftDetail('${c.id}', this.value)">
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <span style="font-size:.82rem;color:var(--text2)"><i class="ri-bar-chart-box-line"></i> Progreso Global — ${c.targetItem} ×${multiplier}</span>
        <span style="font-weight:700;font-size:1rem;color:${pctColor}">${pct}%</span>
      </div>
      <div class="progress-bar" style="height:10px;margin-bottom:6px">
        <div class="progress-fill" style="width:${pct}%;background:${pctColor}"></div>
      </div>
      <div style="font-size:.72rem;color:var(--text3);margin-bottom:12px">${totalCollected} / ${totalNeeded} unidades totales en almacén considerando el multiplicador ×${multiplier}</div>
      
      <div style="background: rgba(212, 160, 23, 0.08); border: 1px solid rgba(212, 160, 23, 0.2); border-radius: 6px; padding: 10px; display: flex; align-items: center; gap: 10px;">
        <i class="ri-information-line" style="color:var(--gold); font-size:1.4rem"></i>
        <div>
          <div style="font-size:.78rem; color:var(--gold-light); font-weight:600; margin-bottom:2px">Capacidad de Crafteo</div>
          <div style="font-size:.75rem; color:var(--text2);">Con tu inventario actual, tienes materiales base para craftear un máximo de <b style="color:var(--green); font-size:.85rem">${maxCraftsPossible === Infinity ? 0 : maxCraftsPossible}</b> <b>${c.targetItem}</b>.</div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:16px">
      <div class="craft-tree-title"><i class="ri-stack-line"></i> Materiales Directos del Crafteo (×${multiplier})</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:8px">
        ${matCardsHTML || '<div style="color:var(--text3);font-size:.82rem">Sin materiales registrados.</div>'}
      </div>
    </div>

    <div class="craft-sections-grid">
      <div class="craft-tree-wrap">
        <div class="craft-tree-title"><i class="ri-node-tree"></i> Árbol de Crafteo — Por qué se necesita cada material</div>
        <div style="font-size:.73rem;color:var(--text3);margin-bottom:14px;padding:8px 10px;background:var(--bg2);border-radius:6px;border:1px solid var(--border)">
          <i class="ri-information-line" style="color:var(--gold-dark)"></i>
          La <b>ruta gris</b> sobre cada elemento muestra de dónde viene: qué ítem padre lo necesita y por qué forma parte de la cadena.
          Haz clic en los nodos <span style="color:var(--blue)">azules (Crafteable)</span> para expandir sus sub-componentes.
          <span style="color:var(--green)">Verde</span> = material base · <span style="color:var(--red)">Rojo</span> = solo drop/boss.
        </div>
        ${treeRootsHTML}
      </div>

      <div class="craft-summary-panel">
        <div class="summary-card">
          <div class="summary-card-title"><i class="ri-list-check-3"></i> Materiales Base Totales (×${multiplier})</div>
          <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">
            Todos los componentes finales una vez desenrollado el árbol completo. Lo que realmente necesitas juntar.
          </div>
          ${activeBaseSummary.length > 0 ? baseSummaryRows :
            '<div style="font-size:.8rem;color:var(--green);padding:10px;background:rgba(46,204,113,.1);border-radius:6px"><i class="ri-check-double-line"></i> ¡Todos los materiales base necesarios ya están cubiertos por tu inventario o componentes pre-crafteados!</div>'}
        </div>

        <div class="summary-card">
          <div class="summary-card-title"><i class="ri-sticky-note-line"></i> Notas / Guía del Crafteo</div>
          <div style="font-size:.72rem;color:var(--text3);margin-bottom:8px">
            Documenta cómo conseguir los materiales, dónde farmear, el orden recomendado, costos estimados, etapas, etc.
          </div>
          <textarea class="notes-area" id="craft-notes-area"
            placeholder="Ej: Para hacer este collar primero necesitamos farmear Crystal S bla bla bla los amo <3"
          >${c.notes || ''}</textarea>
          ${window.STATE.isAdmin ? `
          <button class="btn btn-primary btn-sm" style="margin-top:8px;width:100%" onclick="saveCraftNotes('${c.id}')">
            <i class="ri-save-line"></i> Guardar Notas
          </button>` : ''}
        </div>

        <div class="summary-card">
          <div class="summary-card-title"><i class="ri-calculator-line"></i> Calculadora de Escala</div>
          <div style="font-size:.72rem;color:var(--text3);margin-bottom:10px">
            ¿Cuántos materiales base necesitarías para diferentes cantidades?
          </div>
          ${[1, 5, 10, 20, 30].map(n => {
            const scaledBase = {};
            const localPool = {};
            (window.STATE.warehouse || []).forEach(i => {
               const name = i.name.toLowerCase();
               localPool[name] = (localPool[name] || 0) + Number(i.quantity || 0);
            });
            mats.forEach(m => {
              const qty = Number(m.needed || 1) * n;
              const node = buildCraftTreeNode(m.name, qty, qty, [], 0, localPool);
              collectBaseLeaves(node, scaledBase);
            });
            const totalPieces = Object.values(scaledBase).filter(x => x.qty > 0).reduce((s, x) => s + x.qty, 0);
            const isActive = n === multiplier;
            return `<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 8px;margin-bottom:3px;border-radius:5px;background:${isActive ? 'rgba(212,160,23,.1)' : 'transparent'};border:1px solid ${isActive ? 'var(--gold-dark)' : 'transparent'};font-size:.78rem">
              <span style="color:${isActive ? 'var(--gold)' : 'var(--text2)'}">×${n} ${c.targetItem}</span>
              <span style="color:${isActive ? 'var(--gold-light)' : 'var(--text3)'};font-weight:${isActive ? '700' : '400'}">${totalPieces.toLocaleString()} piezas base</span>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
};

window.setCraftMult = function(craftId, m) {
  window.viewCraftDetail(craftId, m);
};

window.saveCraftNotes = async function(craftId) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const notes = document.getElementById("craft-notes-area")?.value || "";
  const c = window.STATE.crafts.find(x => x.id === craftId);
  if (!c) return;
  c.notes = notes;
  await window.saveFireDoc(`clans/${window.CLAN_ID}/crafts`, craftId, { notes });
  window.toast("Notas guardadas ✓", "success");
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
  }).sort((a, b) => {
    const nameA = window.memberName(a.memberId).toLowerCase();
    const nameB = window.memberName(b.memberId).toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
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

// ── MULTI-ITEM EQUIPMENT ADD ─────────────────────────────
window._equipmentItems = [];
window.addEquipmentItemRow = () => { window._equipmentItems.push({ name: "" }); renderEquipmentItemRows(); };
window.rmEquipmentItemRow = (idx) => { window._equipmentItems.splice(idx, 1); renderEquipmentItemRows(); };
window.updEquipmentItemName = (idx, val) => { if (window._equipmentItems[idx] !== undefined) window._equipmentItems[idx].name = val; };

function renderEquipmentItemRows() {
  const c = document.getElementById("equipment-items-container");
  if (!c) return;
  c.innerHTML = window._equipmentItems.map((m, i) => `
    <div class="ev-member-row" id="eq-item-row-${i}" style="display:flex;gap:6px;align-items:center;margin-bottom:6px">
      <div class="autocomplete-wrap" style="flex:1">
        <input type="text" id="eq-it-${i}" value="${m.name}" placeholder="Buscar item L2..."
          oninput="updEquipmentItemName(${i}, this.value); acSearch(this.value, 'eq-it-${i}', 'ac-eq-it-${i}')" autocomplete="off">
        <div class="autocomplete-list" id="ac-eq-it-${i}"></div>
      </div>
      <button class="btn btn-danger btn-icon btn-sm" tabindex="-1" onclick="rmEquipmentItemRow(${i})"><i class="ri-close-line"></i></button>
    </div>`).join("");
}

function equipmentAddFormHTML() {
  const dt = new Date().toISOString().split("T")[0];
  return `
    <div class="form-grid">
      <div class="form-row"><label>Miembro</label>
        <select id="f-eq-member">
          <option value="">Seleccionar...</option>
          ${window.STATE.members.map(m => `<option value="${m.id}">${m.nickname}</option>`).join("")}
        </select>
      </div>
      <div class="form-row"><label>Estado</label>
        <select id="f-eq-status">
          <option value="propio">Propio</option>
          <option value="prestamo">Préstamo</option>
        </select>
      </div>
      <div class="form-row col2">
        <label>Items Equipados <button class="btn btn-ghost btn-sm" style="float:right;padding:2px 6px" onclick="addEquipmentItemRow()">+ Añadir Ítem</button></label>
        <div id="equipment-items-container"></div>
      </div>
      <div class="form-row col2"><label>Fecha de Registro</label>
        <input type="date" id="f-eq-date" value="${dt}">
      </div>
      <div class="form-row col2"><label>Notas / Condiciones</label>
        <textarea id="f-eq-notes" rows="2" placeholder="Opcional..."></textarea>
      </div>
    </div>
  `;
}

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

function gatherEquipmentBaseData() {
  const memberId = document.getElementById("f-eq-member").value;
  const status = document.getElementById("f-eq-status").value;
  const date = document.getElementById("f-eq-date").value;
  const notes = document.getElementById("f-eq-notes").value.trim();
  if (!memberId) { window.toast("Selecciona un miembro", "error"); return null; }
  return { memberId, status, date, notes };
}

window.addEquipment = function () {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  if (!window.STATE.members.length) { window.toast("Agrega miembros primero", "error"); return; }
  window._equipmentItems = [{ name: "" }];
  window.openModal("<i class='ri-shield-user-line'></i> Otorgar Equipamiento", equipmentAddFormHTML(), async () => {
    const base = gatherEquipmentBaseData(); if (!base) return false;
    const itemNames = window._equipmentItems.map(it => it.name.trim()).filter(n => n);
    if (!itemNames.length) { window.toast("Agrega al menos un ítem", "error"); return false; }
    for (const itemName of itemNames) {
      await window.saveFireDoc(`clans/${window.CLAN_ID}/equipment`, null, { ...base, itemName });
    }
    window.toast(`${itemNames.length} item(s) de equipamiento registrado(s)`, "success");
  });
  setTimeout(renderEquipmentItemRows, 50);
};

window.editEquipment = function (id) {
  if (!window.STATE.isAdmin) return window.toast("Sin usuario solo puedes visualizar", "error");
  const e = window.STATE.equipment.find(x => x.id === id); if (!e) return;
  window.openModal(`<i class='ri-edit-2-line'></i> Editar Equipamiento`, equipmentFormHTML(e), async () => {
    const base = gatherEquipmentBaseData(); if (!base) return false;
    const itemEl = document.getElementById("f-eq-item");
    const itemName = itemEl ? itemEl.value.trim() : "";
    if (!itemName) { window.toast("Escribe el nombre del item", "error"); return false; }
    await window.saveFireDoc(`clans/${window.CLAN_ID}/equipment`, id, { ...base, itemName });
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

// ── MISIÓN SEMANAL ───────────────────────────────────────
window.weeklyMissions = function () {
  const missions = window.STATE.weeklyMissions; // ya ordenadas por fecha asc
  const members  = window.STATE.members;

  const styles = `
    <style>
      .wm-wrap { overflow-x: auto; }
      .wm-table { border-collapse: separate; border-spacing: 0; width: 100%; min-width: max-content; }
      .wm-table thead th {
        position: sticky; top: 0; z-index: 10;
        background: var(--bg3); color: var(--text2);
        font-weight: 600; font-size: 0.72rem; text-transform: uppercase;
        letter-spacing: 0.5px; padding: 10px 12px;
        border-bottom: 2px solid var(--border);
        white-space: nowrap;
      }
      .wm-table thead th.th-member { text-align: center; min-width: 110px; }
      .wm-table tbody td { padding: 6px 10px; border-bottom: 1px solid rgba(42,38,80,.45); }
      .wm-table tbody tr:hover td { background: rgba(255,255,255,.025); }
      .wm-date-col { white-space: nowrap; font-weight: 600; color: var(--gold-light); font-size: 0.85rem; }
      .wm-sel {
        appearance: none; -webkit-appearance: none;
        border: 1px solid var(--border); background: var(--bg3);
        font-family: 'Inter', sans-serif;
        font-size: 0.78rem; font-weight: 600;
        cursor: pointer; width: 100%; text-align: center;
        padding: 5px 8px; border-radius: 6px; outline: none;
        transition: background .15s, border-color .15s;
      }
      .wm-sel.entregado    { color: #2ecc71; background: rgba(46,204,113,.15); border-color: rgba(46,204,113,.35); }
      .wm-sel.no_entregado { color: #e03535; background: rgba(224,53,53,.12);  border-color: rgba(224,53,53,.3); }
      .wm-sel.pending      { color: var(--text3); }
      .wm-sel:focus { box-shadow: 0 0 0 2px rgba(212,160,23,.35); }
      .wm-del-btn { opacity: 0; transition: opacity .2s; }
      .wm-table tbody tr:hover .wm-del-btn { opacity: 1; }
    </style>
  `;

  const memberHeaders = members.map(m =>
    `<th class="th-member" title="${m.class || ''}">${m.nickname}</th>`
  ).join('');

  const rows = missions.map(ms => {
    const deliveries = ms.deliveries || {};
    const dateLabel = ms.date
      ? new Date(ms.date + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
      : ms.date;

    const participants = ms.participants || members.map(m => m.id);
    const delivered = participants.filter(id => deliveries[id] === 'entregado').length;
    const total = participants.length;
    const pct = total ? Math.round(delivered / total * 100) : 0;
    const pctColor = pct === 100 ? '#2ecc71' : pct >= 50 ? 'var(--gold)' : '#e03535';


    const cells = members.map(m => {
      const isParticipant = participants.includes(m.id);
      if (!isParticipant) {
        return `<td style="text-align:center"><span style="color:var(--text3);font-size:.8rem;opacity:.4">N/A</span></td>`;
      }
      const val = deliveries[m.id] || '';
      const cls = val === 'entregado' ? 'entregado' : val === 'no_entregado' ? 'no_entregado' : 'pending';

      if (window.STATE.isAdmin) {
        return `
          <td style="text-align:center">
            <select class="wm-sel ${cls}"
              onchange="toggleDelivery('${ms.id}','${m.id}',this.value); this.className='wm-sel '+(this.value==='entregado'?'entregado':this.value==='no_entregado'?'no_entregado':'pending')">
              <option value="" ${val === '' ? 'selected' : ''}>— Pendiente</option>
              <option value="entregado" ${val === 'entregado' ? 'selected' : ''}>✅ Entregado</option>
              <option value="no_entregado" ${val === 'no_entregado' ? 'selected' : ''}>❌ No entregado</option>
            </select>
          </td>`;
      } else {
        const badge = val === 'entregado'
          ? `<span style="color:#2ecc71;font-size:1.1rem">✅</span>`
          : val === 'no_entregado'
            ? `<span style="color:#e03535;font-size:1.1rem">❌</span>`
            : `<span style="color:var(--text3);font-size:.85rem">—</span>`;
        return `<td style="text-align:center">${badge}</td>`;
      }
    }).join('');

    const delBtn = window.STATE.isAdmin
      ? `<button class="btn btn-danger btn-icon btn-sm wm-del-btn"
           onclick="delWeeklyMission('${ms.id}')" title="Eliminar semana">
           <i class="ri-delete-bin-line"></i>
         </button>`
      : '';

    return `
      <tr>
        <td class="wm-date-col">
          <div style="display:flex;align-items:center;gap:8px">
            <i class="ri-calendar-event-line" style="color:var(--gold);font-size:1rem"></i>
            ${dateLabel}
          </div>
        </td>
        ${cells}
        <td style="text-align:center;white-space:nowrap;padding:6px 12px">
          <b style="font-size:.8rem;color:${pctColor}">${delivered}/${total}</b>
          <div style="height:4px;background:var(--bg3);border-radius:2px;margin-top:3px;min-width:50px">
            <div style="height:100%;border-radius:2px;background:${pctColor};width:${pct}%;transition:width .3s"></div>
          </div>
        </td>
        <td style="width:40px;text-align:center">${delBtn}</td>
      </tr>`;
  }).join('') || `
    <tr>
      <td colspan="${members.length + 3}">
        <div class="empty-state">
          <i class="ri-calendar-check-line"></i>
          <p>No hay semanas registradas aún</p>
          ${window.STATE.isAdmin ? '<p style="font-size:.75rem;margin-top:4px;color:var(--text3)">Usa &quot;+ Nueva Semana&quot; para comenzar</p>' : ''}
        </div>
      </td>
    </tr>`;

  // Fila de totales por miembro
  const totalRow = missions.length ? (() => {
    const totals = members.map(m => {
      // Solo contar misiones donde el miembro participó
      const myMissions = missions.filter(ms => (ms.participants || members.map(x => x.id)).includes(m.id));
      const cnt = myMissions.filter(ms => (ms.deliveries || {})[m.id] === 'entregado').length;
      const pct = myMissions.length ? Math.round(cnt / myMissions.length * 100) : 0;
      const col = myMissions.length === 0 ? 'var(--text3)' : pct === 100 ? '#2ecc71' : pct >= 50 ? 'var(--gold)' : '#e03535';
      return `<td style="text-align:center;padding:8px 10px;border-top:2px solid var(--border)">
        ${myMissions.length ? `<b style="color:${col};font-size:.85rem">${cnt}/${myMissions.length}</b><div style="font-size:.65rem;color:var(--text3);margin-top:2px">${pct}%</div>` : `<span style="color:var(--text3);font-size:.8rem">N/A</span>`}
      </td>`;
    }).join('');  
    return `
      <tfoot>
        <tr style="background:rgba(212,160,23,.04)">
          <td style="font-weight:700;color:var(--text2);font-size:.8rem;border-top:2px solid var(--border);padding:8px 12px;white-space:nowrap">
            <i class="ri-bar-chart-line" style="color:var(--gold)"></i> TOTAL ENTREGAS
          </td>
          ${totals}
          <td colspan="2" style="border-top:2px solid var(--border)"></td>
        </tr>
      </tfoot>`;
  })() : '';

  document.getElementById('content').innerHTML = `
    ${styles}
    <div class="card" style="padding:0; overflow:hidden;">
      <div style="padding:14px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <i class="ri-calendar-check-line" style="color:var(--gold);font-size:1.25rem"></i>
        <b style="color:var(--gold-light);font-size:1rem;font-family:'Cinzel',serif">Registro de Misiones Semanales</b>
        <span class="badge badge-gray" style="margin-left:auto">${missions.length} semana(s)</span>
        <span class="badge badge-blue">${members.length} miembro(s)</span>
      </div>
      <div class="wm-wrap">
        <table class="wm-table">
          <thead>
            <tr>
              <th style="min-width:160px; text-align:left">Fecha de Entrega</th>
              ${memberHeaders}
              <th style="text-align:center; min-width:80px">Progreso</th>
              <th style="width:40px"></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          ${totalRow}
        </table>
      </div>
    </div>`;
};

// ── NUEVA SEMANA (modal) ─────────────────────────────────
// Helper: toggle todos los checkboxes de participantes
window._wmToggleAll = function () {
  const boxes = document.querySelectorAll('.wm-chk');
  const allChecked = [...boxes].every(b => b.checked);
  boxes.forEach(b => b.checked = !allChecked);
  const btn = document.getElementById('wm-toggle-all-btn');
  if (btn) btn.textContent = allChecked ? 'Seleccionar todos' : 'Quitar todos';
};

window.addWeeklyMission = function () {
  if (!window.STATE.isAdmin) return window.toast('Sin usuario solo puedes visualizar', 'error');
  if (!window.STATE.members.length) return window.toast('Agrega miembros primero', 'error');

  const today = new Date().toISOString().split('T')[0];
  const memberRows = window.STATE.members.map(m => `
    <label style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:6px;
      background:var(--bg3);border:1px solid var(--border);cursor:pointer;transition:background .15s"
      onmouseover="this.style.background='var(--card-hover)'" onmouseout="this.style.background='var(--bg3)'">
      <input type="checkbox" class="wm-chk" id="wm-chk-${m.id}" value="${m.id}" checked
        style="width:18px;height:18px;accent-color:var(--gold);cursor:pointer;flex-shrink:0">
      <span style="font-size:.88rem;font-weight:600;color:var(--text)">${m.nickname}</span>
      ${m.class ? `<span style="font-size:.72rem;color:var(--text3);margin-left:auto">${m.class}</span>` : ''}
    </label>`
  ).join('');

  window.openModal(
    `<i class='ri-calendar-check-line'></i> Nueva Semana de Misión`,
    `<div class="form-grid cols-1">
       <div class="form-row">
         <label>Fecha de Entrega</label>
         <input type="date" id="f-wm-date" value="${today}">
       </div>
       <div class="form-row" style="gap:8px">
         <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
           <label style="color:var(--text2)!important;font-size:.78rem;text-transform:uppercase;letter-spacing:.5px">
             <i class="ri-group-line" style="color:var(--gold)"></i> Participantes
           </label>
           <button id="wm-toggle-all-btn" type="button"
             onclick="window._wmToggleAll()"
             style="font-size:.72rem;padding:3px 10px;border-radius:5px;border:1px solid var(--border);
                    background:var(--bg3);color:var(--text2);cursor:pointer;font-family:'Inter',sans-serif;
                    transition:all .15s"
             onmouseover="this.style.borderColor='var(--gold)';this.style.color='var(--gold)'"
             onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">
             Quitar todos
           </button>
         </div>
         <div style="display:flex;flex-direction:column;gap:6px;max-height:220px;overflow-y:auto;padding-right:4px">
           ${memberRows}
         </div>
       </div>
     </div>`,
    async () => {
      const date = document.getElementById('f-wm-date').value;
      if (!date) { window.toast('Selecciona una fecha', 'error'); return false; }
      const dup = window.STATE.weeklyMissions.find(m => m.date === date);
      if (dup) { window.toast('Ya existe una semana con esa fecha', 'error'); return false; }
      const participants = [...document.querySelectorAll('.wm-chk:checked')].map(b => b.value);
      if (!participants.length) { window.toast('Selecciona al menos un participante', 'error'); return false; }
      await window.saveFireDoc(`clans/${window.CLAN_ID}/weeklyMissions`, null, {
        date,
        participants,
        deliveries: {}
      });
      window.toast(`Semana registrada con ${participants.length} participante(s) ✅`, 'success');
    }
  );
};

// ── TOGGLE ENTREGA ───────────────────────────────────────
window.toggleDelivery = async function (missionId, memberId, val) {
  if (!window.STATE.isAdmin) return window.toast('Sin permiso', 'error');
  try {
    // Dot-notation para actualizar solo ese campo del mapa
    await window.saveFireDoc(
      `clans/${window.CLAN_ID}/weeklyMissions`,
      missionId,
      { [`deliveries.${memberId}`]: val }
    );
    const ms = window.STATE.weeklyMissions.find(m => m.id === missionId);
    if (ms) {
      if (!ms.deliveries) ms.deliveries = {};
      ms.deliveries[memberId] = val;
    }
  } catch (err) {
    window.toast('Error al guardar: ' + err.message, 'error');
    console.error(err);
  }
};

// ── ELIMINAR SEMANA ──────────────────────────────────────
window.delWeeklyMission = async function (id) {
  if (!window.STATE.isAdmin) return window.toast('Sin permiso', 'error');
  if (!confirm('¿Eliminar esta semana y todos sus registros de entrega?')) return;
  try {
    await window.delFireDoc(`clans/${window.CLAN_ID}/weeklyMissions`, id);
    window.toast('Semana eliminada', 'info');
  } catch (err) {
    window.toast('Error al eliminar: ' + err.message, 'error');
    console.error(err);
  }
};
