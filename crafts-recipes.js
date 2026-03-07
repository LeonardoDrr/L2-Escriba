// ============================================================
//  crafts-recipes.js — Recetas de crafteo de Lineage 2 Reborn
//  Cada receta incluye el nombre del item y sus materiales.
//  Fuentes: L2 Wiki / L2 Reborn oficial
// ============================================================

export const CRAFT_RECIPES = {

    // ──────────────────────────────────────────────────────────
    //  MATERIALES BÁSICOS
    // ──────────────────────────────────────────────────────────
    "Coarse Bone Powder": [
        { name: "Animal Bone", needed: 10, collected: 0 }
    ],
    "Braided Hemp": [
        { name: "Stem", needed: 5, collected: 0 }
    ],
    "Cokes": [
        { name: "Coal", needed: 3, collected: 0 },
        { name: "Charcoal", needed: 3, collected: 0 }
    ],
    "Steel": [
        { name: "Varnish", needed: 5, collected: 0 },
        { name: "Iron Ore", needed: 5, collected: 0 }
    ],
    "Leather": [
        { name: "Animal Skin", needed: 6, collected: 0 }
    ],
    "Silver Mold": [
        { name: "Silver Nugget", needed: 10, collected: 0 },
        { name: "Braided Hemp", needed: 5, collected: 0 },
        { name: "Cokes", needed: 5, collected: 0 }
    ],
    "Blacksmith's Frame": [
        { name: "Silver Mold", needed: 1, collected: 0 },
        { name: "Varnish of Purity", needed: 5, collected: 0 },
        { name: "Mithril Ore", needed: 10, collected: 0 }
    ],
    "High Grade Suede": [
        { name: "Coarse Bone Powder", needed: 1, collected: 0 },
        { name: "Suede", needed: 3, collected: 0 }
    ],
    "Varnish of Purity": [
        { name: "Stone of Purity", needed: 1, collected: 0 },
        { name: "Coarse Bone Powder", needed: 1, collected: 0 },
        { name: "Varnish", needed: 3, collected: 0 }
    ],
    "Synthetic Cokes": [
        { name: "Oriharukon Ore", needed: 1, collected: 0 },
        { name: "Cokes", needed: 3, collected: 0 }
    ],
    "Artisan's Frame": [
        { name: "Steel Mold", needed: 1, collected: 0 },
        { name: "Varnish of Purity", needed: 5, collected: 0 },
        { name: "Mithril Ore", needed: 10, collected: 0 }
    ],
    "Steel Mold": [
        { name: "Braided Hemp", needed: 5, collected: 0 },
        { name: "Iron Ore", needed: 5, collected: 0 },
        { name: "Coal", needed: 5, collected: 0 }
    ],
    "Mithril Alloy": [
        { name: "Mithril Ore", needed: 1, collected: 0 },
        { name: "Varnish of Purity", needed: 1, collected: 0 },
        { name: "Steel", needed: 2, collected: 0 }
    ],
    "Oriharukon": [
        { name: "Synthetic Cokes", needed: 1, collected: 0 },
        { name: "Oriharukon Ore", needed: 1, collected: 0 },
        { name: "Silver Branch", needed: 4, collected: 0 } // Reborn uses exact L2 specs but we'll adapt Silver Branch or Silver Nugget depending on db
    ],
    "Metallic Fiber": [
        { name: "Silver Nugget", needed: 15, collected: 0 },
        { name: "Thread", needed: 20, collected: 0 }
    ],
    "Metallic Thread": [
        { name: "Iron Ore", needed: 5, collected: 0 },
        { name: "Thread", needed: 10, collected: 0 }
    ],
    "Enria": [
        // Rare material, not strictly craftable via standard materials but leaving here if user wants a specific craft or buys it
    ],
    "Asofe": [],
    "Thons": [],

    // ──────────────────────────────────────────────────────────
    //  ARMAS GRADO S
    // ──────────────────────────────────────────────────────────
    "Forgotten Blade": [
        { name: "Forgotten Blade Edge", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Heaven's Divider": [
        { name: "Heaven's Divider Edge", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Arcana Mace": [
        { name: "Arcana Mace Head", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Draconic Bow": [
        { name: "Draconic Bow Shaft", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Angel Slayer": [
        { name: "Angel Slayer Blade", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Icarus Hammer": [
        { name: "Icarus Hammer Head", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Icarus Spitter": [
        { name: "Icarus Spitter Shaft", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],
    "Icarus Trident": [
        { name: "Icarus Trident Head", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  ARMADURAS GRADO S
    // ──────────────────────────────────────────────────────────
    "Imperial Crusader Breastplate": [
        { name: "Imperial Crusader Breastplate Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Imperial Crusader Gaiters": [
        { name: "Imperial Crusader Gaiters Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 20, collected: 0 },
    ],
    "Imperial Crusader Helmet": [
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone S", needed: 15, collected: 0 },
    ],
    "Imperial Crusader Gauntlets": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],
    "Imperial Crusader Boots": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],
    "Imperial Crusader Shield": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],
    "Draconic Leather Armor": [
        { name: "Draconic Leather Armor Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Draconic Leather Breastplate": [
        { name: "Draconic Leather Armor Part", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 18, collected: 0 },
    ],
    "Draconic Leather Gaiters": [
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 14, collected: 0 },
    ],
    "Draconic Leather Helmet": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Draconic Leather Gloves": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],
    "Draconic Leather Boots": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],
    "Arcana Robe": [
        { name: "Arcana Robe Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Arcana Circlet": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Arcana Gloves": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],
    "Arcana Boots": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  ARMADURAS GRADO A
    // ──────────────────────────────────────────────────────────
    "Tallum Plate Armor": [
        { name: "Crystal A-Grade", needed: 137, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Steel", needed: 60, collected: 0 },
        { name: "Enria", needed: 7, collected: 0 },
    ],
    "Tallum Plate Breastplate": [
        { name: "Crystal A-Grade", needed: 96, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 14, collected: 0 },
        { name: "Steel", needed: 42, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Tallum Plate Gaiters": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Steel", needed: 35, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Tallum Plate Helmet": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Steel", needed: 26, collected: 0 },
    ],
    "Tallum Plate Gloves": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Tallum Plate Boots": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Tallum Plate Shield": [
        { name: "Crystal A-Grade", needed: 40, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Steel", needed: 18, collected: 0 },
    ],
    "Dark Crystal Armor": [
        { name: "Crystal A-Grade", needed: 137, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Oriharukon Ore", needed: 30, collected: 0 },
        { name: "Enria", needed: 7, collected: 0 },
    ],
    "Dark Crystal Breastplate": [
        { name: "Crystal A-Grade", needed: 96, collected: 0 },
        { name: "Gemstone A", needed: 14, collected: 0 },
        { name: "Oriharukon Ore", needed: 21, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Dark Crystal Gaiters": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Oriharukon Ore", needed: 17, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Dark Crystal Helmet": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Oriharukon Ore", needed: 13, collected: 0 },
    ],
    "Dark Crystal Gloves": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dark Crystal Boots": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dark Crystal Shield": [
        { name: "Crystal A-Grade", needed: 40, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Oriharukon Ore", needed: 9, collected: 0 },
    ],
    "Dark Crystal Leather Armor": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Leather", needed: 50, collected: 0 },
        { name: "Enria", needed: 6, collected: 0 },
    ],
    "Dark Crystal Leather Breastplate": [
        { name: "Crystal A-Grade", needed: 84, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Leather", needed: 35, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Dark Crystal Leather Gaiters": [
        { name: "Crystal A-Grade", needed: 70, collected: 0 },
        { name: "Gemstone A", needed: 10, collected: 0 },
        { name: "Leather", needed: 29, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Dark Crystal Leather Helmet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Leather", needed: 21, collected: 0 },
    ],
    "Dark Crystal Leather Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dark Crystal Leather Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dark Crystal Robe": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Cloth Piece", needed: 25, collected: 0 },
        { name: "Enria", needed: 7, collected: 0 },
    ],
    "Dark Crystal Circlet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Cloth Piece", needed: 10, collected: 0 },
    ],
    "Majestic Plate Armor": [
        { name: "Crystal A-Grade", needed: 137, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Steel", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Thons", needed: 7, collected: 0 },
    ],
    "Majestic Plate Breastplate": [
        { name: "Crystal A-Grade", needed: 96, collected: 0 },
        { name: "Steel", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 14, collected: 0 },
        { name: "Thons", needed: 5, collected: 0 },
    ],
    "Majestic Plate Gaiters": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Steel", needed: 35, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Thons", needed: 4, collected: 0 },
    ],
    "Majestic Plate Helmet": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Steel", needed: 26, collected: 0 },
    ],
    "Majestic Shield": [
        { name: "Crystal A-Grade", needed: 40, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Steel", needed: 18, collected: 0 },
    ],
    "Majestic Gauntlets": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
    ],
    "Majestic Boots": [
        { name: "Crystal A-Grade", needed: 48, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
    ],
    "Majestic Leather Armor": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Leather", needed: 50, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Thons", needed: 6, collected: 0 },
    ],
    "Majestic Robe": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Cloth Piece", needed: 25, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Thons", needed: 7, collected: 0 },
    ],
    "Majestic Circlet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Cloth Piece", needed: 10, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  GRADO B — Sets Blue Wolf y Doom
    // ──────────────────────────────────────────────────────────
    "Blue Wolf Breastplate": [
        { name: "Crystal B-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Steel", needed: 45, collected: 0 },
        { name: "Gemstone B", needed: 14, collected: 0 },
        { name: "Asofe", needed: 5, collected: 0 },
    ],
    "Blue Wolf Gaiters": [
        { name: "Crystal B-Grade", needed: 93, collected: 0 },
        { name: "Steel", needed: 35, collected: 0 },
        { name: "Gemstone B", needed: 11, collected: 0 },
        { name: "Asofe", needed: 4, collected: 0 },
    ],
    "Blue Wolf Helmet": [
        { name: "Crystal B-Grade", needed: 70, collected: 0 },
        { name: "Steel", needed: 26, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
    ],
    "Blue Wolf Gloves": [
        { name: "Crystal B-Grade", needed: 55, collected: 0 },
        { name: "Gemstone B", needed: 7, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Blue Wolf Boots": [
        { name: "Crystal B-Grade", needed: 55, collected: 0 },
        { name: "Gemstone B", needed: 7, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Blue Wolf Robe": [
        { name: "Crystal B-Grade", needed: 104, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Cloth Piece", needed: 20, collected: 0 },
        { name: "Gemstone B", needed: 12, collected: 0 },
        { name: "Asofe", needed: 5, collected: 0 },
    ],
    "Doom Plate Armor": [
        { name: "Crystal B-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Steel", needed: 45, collected: 0 },
        { name: "Gemstone B", needed: 14, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Doom Breastplate": [
        { name: "Crystal B-Grade", needed: 84, collected: 0 },
        { name: "Steel", needed: 31, collected: 0 },
        { name: "Gemstone B", needed: 10, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Doom Gaiters": [
        { name: "Crystal B-Grade", needed: 70, collected: 0 },
        { name: "Steel", needed: 26, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Doom Helmet": [
        { name: "Crystal B-Grade", needed: 52, collected: 0 },
        { name: "Steel", needed: 19, collected: 0 },
        { name: "Gemstone B", needed: 6, collected: 0 },
    ],
    "Doom Gloves": [
        { name: "Crystal B-Grade", needed: 42, collected: 0 },
        { name: "Gemstone B", needed: 5, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Doom Boots": [
        { name: "Crystal B-Grade", needed: 42, collected: 0 },
        { name: "Gemstone B", needed: 5, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Doom Leather Armor": [
        { name: "Crystal B-Grade", needed: 104, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Leather", needed: 40, collected: 0 },
        { name: "Gemstone B", needed: 12, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Doom Robe": [
        { name: "Crystal B-Grade", needed: 104, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Cloth Piece", needed: 20, collected: 0 },
        { name: "Gemstone B", needed: 12, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Zubei's Armor": [
        { name: "Crystal B-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Steel", needed: 45, collected: 0 },
        { name: "Gemstone B", needed: 14, collected: 0 },
        { name: "Thons", needed: 5, collected: 0 },
    ],
    "Zubei's Breastplate": [
        { name: "Crystal B-Grade", needed: 84, collected: 0 },
        { name: "Steel", needed: 31, collected: 0 },
        { name: "Gemstone B", needed: 10, collected: 0 },
        { name: "Thons", needed: 4, collected: 0 },
    ],
    "Zubei's Gaiters": [
        { name: "Crystal B-Grade", needed: 70, collected: 0 },
        { name: "Steel", needed: 26, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
    ],
    "Zubei's Helmet": [
        { name: "Crystal B-Grade", needed: 52, collected: 0 },
        { name: "Steel", needed: 19, collected: 0 },
        { name: "Gemstone B", needed: 6, collected: 0 },
    ],
    "Zubei's Gauntlets": [
        { name: "Crystal B-Grade", needed: 42, collected: 0 },
        { name: "Gemstone B", needed: 5, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],
    "Zubei's Boots": [
        { name: "Crystal B-Grade", needed: 42, collected: 0 },
        { name: "Gemstone B", needed: 5, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],
    "Zubei's Shield": [
        { name: "Crystal B-Grade", needed: 34, collected: 0 },
        { name: "Steel", needed: 13, collected: 0 },
        { name: "Gemstone B", needed: 4, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  ARMAS GRADO A
    // ──────────────────────────────────────────────────────────
    "Majestic Sword": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Steel", needed: 64, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Basalt Battlehammer": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Mithril Ore", needed: 50, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Soul Separator": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Steel", needed: 64, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Shining Bow": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Stem", needed: 100, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  JOYAS (Crafteables)
    // ──────────────────────────────────────────────────────────
    "Majestic Necklace": [
        { name: "Crystal A-Grade", needed: 100, collected: 0 },
        { name: "Gemstone A", needed: 15, collected: 0 },
        { name: "Silver Nugget", needed: 50, collected: 0 },
        { name: "Thons", needed: 4, collected: 0 },
    ],
    "Majestic Earrings": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Silver Nugget", needed: 40, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
    ],
    "Majestic Ring": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
        { name: "Silver Nugget", needed: 30, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],
    "Blue Wolf Necklace": [
        { name: "Crystal B-Grade", needed: 80, collected: 0 },
        { name: "Gemstone B", needed: 10, collected: 0 },
        { name: "Silver Nugget", needed: 30, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Blue Wolf Earrings": [
        { name: "Crystal B-Grade", needed: 60, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
        { name: "Silver Nugget", needed: 24, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Blue Wolf Ring": [
        { name: "Crystal B-Grade", needed: 40, collected: 0 },
        { name: "Gemstone B", needed: 6, collected: 0 },
        { name: "Silver Nugget", needed: 16, collected: 0 },
        { name: "Asofe", needed: 2, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  GRADO S80 — Vesper (materiales aproximados)
    // ──────────────────────────────────────────────────────────
    "Vesper Noble Sword": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 60, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
        { name: "Mold Hardener", needed: 2, collected: 0 },
    ],
    "Vesper Armor": [
        { name: "Vesper Breastplate Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 180, collected: 0 },
        { name: "Gemstone S", needed: 50, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
        { name: "Mold Hardener", needed: 2, collected: 0 },
    ],
    "Vesper Leather Armor": [
        { name: "Vesper Leather Armor Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 160, collected: 0 },
        { name: "Gemstone S", needed: 45, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vesper Robe": [
        { name: "Vesper Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 160, collected: 0 },
        { name: "Gemstone S", needed: 45, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Cloth Piece", needed: 60, collected: 0 },
    ],

    // ──────────────────────────────────────────────────────────
    //  GRADO S84 — Vorpal (materiales aproximados)
    // ──────────────────────────────────────────────────────────
    "Vorpal Sword": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 3, collected: 0 },
        { name: "Mold Hardener", needed: 3, collected: 0 },
    ],
    "Vorpal Armor": [
        { name: "Vorpal Breastplate Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 220, collected: 0 },
        { name: "Gemstone S", needed: 65, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 3, collected: 0 },
        { name: "Mold Hardener", needed: 3, collected: 0 },
    ],
    "Vorpal Leather Armor": [
        { name: "Vorpal Leather Armor Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 58, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 3, collected: 0 },
    ],
    "Vorpal Robe": [
        { name: "Vorpal Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 58, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Cloth Piece", needed: 80, collected: 0 },
    ],
    "Vorpal Bow": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Stem", needed: 200, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],

    // ── ARMAS GRADO A — Completas ─────────────────────────────
    "Tallum Blade": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Oriharukon Ore", needed: 50, collected: 0 },
        { name: "Enria", needed: 8, collected: 0 },
    ],
    "Sword of Ipos": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Steel", needed: 64, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Cursed Maingauche": [
        { name: "Crystal A-Grade", needed: 136, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Mithril Ore", needed: 45, collected: 0 },
        { name: "Enria", needed: 7, collected: 0 },
    ],
    "Deadly Dagger": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Mithril Ore", needed: 40, collected: 0 },
        { name: "Enria", needed: 6, collected: 0 },
    ],
    "Demon Splinter": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Adamantite Nugget", needed: 50, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Meteor Shower": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Cloth Piece", needed: 60, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Dual Majestic Sword": [
        { name: "Crystal A-Grade", needed: 250, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
        { name: "Gemstone A", needed: 40, collected: 0 },
        { name: "Steel", needed: 110, collected: 0 },
        { name: "Thons", needed: 14, collected: 0 },
    ],
    "Samurai Long Sword": [
        { name: "Crystal A-Grade", needed: 136, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Oriharukon Ore", needed: 46, collected: 0 },
        { name: "Thons", needed: 7, collected: 0 },
    ],
    "Crystal Bow": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Stem", needed: 90, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Requiem": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Cloth Piece", needed: 65, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Revolver of Dawn": [
        { name: "Crystal A-Grade", needed: 144, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Cloth Piece", needed: 65, collected: 0 },
        { name: "Enria", needed: 8, collected: 0 },
    ],

    // ── DYNASTY (A-grade) — Armas ─────────────────────────────
    "Dynasty Sword": [
        { name: "Crystal A-Grade", needed: 150, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Steel", needed: 68, collected: 0 },
        { name: "Thons", needed: 9, collected: 0 },
    ],
    "Dynasty Blade": [
        { name: "Crystal A-Grade", needed: 150, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Oriharukon Ore", needed: 55, collected: 0 },
        { name: "Enria", needed: 9, collected: 0 },
    ],
    "Dynasty Crusher": [
        { name: "Crystal A-Grade", needed: 150, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Mithril Ore", needed: 55, collected: 0 },
        { name: "Thons", needed: 9, collected: 0 },
    ],
    "Dynasty Bow": [
        { name: "Crystal A-Grade", needed: 150, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Stem", needed: 110, collected: 0 },
        { name: "Thons", needed: 9, collected: 0 },
    ],
    "Dynasty Staff": [
        { name: "Crystal A-Grade", needed: 150, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Cloth Piece", needed: 70, collected: 0 },
        { name: "Thons", needed: 9, collected: 0 },
    ],
    "Dynasty Two-Handed Sword": [
        { name: "Crystal A-Grade", needed: 160, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Gemstone A", needed: 26, collected: 0 },
        { name: "Steel", needed: 74, collected: 0 },
        { name: "Thons", needed: 10, collected: 0 },
    ],
    "Dynasty Spear": [
        { name: "Crystal A-Grade", needed: 155, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 24, collected: 0 },
        { name: "Steel", needed: 68, collected: 0 },
        { name: "Thons", needed: 9, collected: 0 },
    ],

    // ── DYNASTY (A-grade) — Armaduras ────────────────────────
    "Dynasty Plate Armor": [
        { name: "Crystal A-Grade", needed: 145, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Steel", needed: 64, collected: 0 },
        { name: "Gemstone A", needed: 22, collected: 0 },
        { name: "Enria", needed: 8, collected: 0 },
    ],
    "Dynasty Breastplate": [
        { name: "Crystal A-Grade", needed: 100, collected: 0 },
        { name: "Steel", needed: 45, collected: 0 },
        { name: "Gemstone A", needed: 15, collected: 0 },
        { name: "Enria", needed: 6, collected: 0 },
    ],
    "Dynasty Gaiters": [
        { name: "Crystal A-Grade", needed: 84, collected: 0 },
        { name: "Steel", needed: 37, collected: 0 },
        { name: "Gemstone A", needed: 13, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Dynasty Helmet": [
        { name: "Crystal A-Grade", needed: 64, collected: 0 },
        { name: "Steel", needed: 28, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
    ],
    "Dynasty Shield": [
        { name: "Crystal A-Grade", needed: 44, collected: 0 },
        { name: "Steel", needed: 19, collected: 0 },
        { name: "Gemstone A", needed: 7, collected: 0 },
    ],
    "Dynasty Gloves": [
        { name: "Crystal A-Grade", needed: 50, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dynasty Boots": [
        { name: "Crystal A-Grade", needed: 50, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dynasty Leather Armor": [
        { name: "Crystal A-Grade", needed: 128, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Leather", needed: 54, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Thons", needed: 7, collected: 0 },
    ],
    "Dynasty Robe": [
        { name: "Crystal A-Grade", needed: 128, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Cloth Piece", needed: 28, collected: 0 },
        { name: "Gemstone A", needed: 20, collected: 0 },
        { name: "Thons", needed: 8, collected: 0 },
    ],
    "Dynasty Circlet": [
        { name: "Crystal A-Grade", needed: 55, collected: 0 },
        { name: "Cloth Piece", needed: 12, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
    ],

    // ── JOYAS GRADO A — Tallum / Dark Crystal / Dynasty ──────
    "Tallum Necklace": [
        { name: "Crystal A-Grade", needed: 100, collected: 0 },
        { name: "Gemstone A", needed: 15, collected: 0 },
        { name: "Silver Nugget", needed: 50, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Tallum Earrings": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Silver Nugget", needed: 40, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Tallum Ring": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
        { name: "Silver Nugget", needed: 30, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dark Crystal Necklace": [
        { name: "Crystal A-Grade", needed: 100, collected: 0 },
        { name: "Gemstone A", needed: 15, collected: 0 },
        { name: "Silver Nugget", needed: 48, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Dark Crystal Earrings": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Silver Nugget", needed: 38, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dark Crystal Ring": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
        { name: "Silver Nugget", needed: 28, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dynasty Necklace": [
        { name: "Crystal A-Grade", needed: 110, collected: 0 },
        { name: "Gemstone A", needed: 16, collected: 0 },
        { name: "Silver Nugget", needed: 55, collected: 0 },
        { name: "Thons", needed: 5, collected: 0 },
    ],
    "Dynasty Earrings": [
        { name: "Crystal A-Grade", needed: 88, collected: 0 },
        { name: "Gemstone A", needed: 13, collected: 0 },
        { name: "Silver Nugget", needed: 44, collected: 0 },
        { name: "Thons", needed: 4, collected: 0 },
    ],
    "Dynasty Ring": [
        { name: "Crystal A-Grade", needed: 66, collected: 0 },
        { name: "Gemstone A", needed: 10, collected: 0 },
        { name: "Silver Nugget", needed: 33, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
    ],

    // ── VESPER — Piezas individuales (S80) ───────────────────
    "Vesper Breastplate": [
        { name: "Vesper Breastplate Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 32, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
    ],
    "Vesper Gaiters": [
        { name: "Crystal S80", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 26, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
    "Vesper Helmet": [
        { name: "Crystal S80", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 18, collected: 0 },
    ],
    "Vesper Gauntlets": [
        { name: "Crystal S80", needed: 65, collected: 0 },
        { name: "Gemstone S", needed: 14, collected: 0 },
    ],
    "Vesper Boots": [
        { name: "Crystal S80", needed: 65, collected: 0 },
        { name: "Gemstone S", needed: 14, collected: 0 },
    ],
    "Vesper Shield": [
        { name: "Crystal S80", needed: 65, collected: 0 },
        { name: "Gemstone S", needed: 14, collected: 0 },
    ],
    "Vesper Leather Breastplate": [
        { name: "Vesper Leather Armor Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 105, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
    "Vesper Leather Gaiters": [
        { name: "Crystal S80", needed: 88, collected: 0 },
        { name: "Gemstone S", needed: 22, collected: 0 },
    ],
    "Vesper Leather Helmet": [
        { name: "Crystal S80", needed: 70, collected: 0 },
        { name: "Gemstone S", needed: 16, collected: 0 },
    ],
    "Vesper Leather Gloves": [
        { name: "Crystal S80", needed: 55, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Vesper Leather Boots": [
        { name: "Crystal S80", needed: 55, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Vesper Circlet": [
        { name: "Vesper Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 18, collected: 0 },
        { name: "Cloth Piece", needed: 40, collected: 0 },
    ],
    "Vesper Gloves": [
        { name: "Crystal S80", needed: 55, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
        { name: "Cloth Piece", needed: 28, collected: 0 },
    ],
    "Vesper Necklace": [
        { name: "Crystal S80", needed: 130, collected: 0 },
        { name: "Gemstone S", needed: 35, collected: 0 },
        { name: "Silver Nugget", needed: 80, collected: 0 },
    ],
    "Vesper Earrings": [
        { name: "Crystal S80", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
        { name: "Silver Nugget", needed: 60, collected: 0 },
    ],
    "Vesper Ring": [
        { name: "Crystal S80", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 22, collected: 0 },
        { name: "Silver Nugget", needed: 45, collected: 0 },
    ],

    // ── VESPER — Armas adicionales (S80) ─────────────────────
    "Vesper Retributer": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 60, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vesper Bow": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 60, collected: 0 },
        { name: "Stem", needed: 160, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Shaper": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 190, collected: 0 },
        { name: "Gemstone S", needed: 56, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Caster": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 190, collected: 0 },
        { name: "Gemstone S", needed: 56, collected: 0 },
        { name: "Cloth Piece", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Singer": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 190, collected: 0 },
        { name: "Gemstone S", needed: 56, collected: 0 },
        { name: "Cloth Piece", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Avenger": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 210, collected: 0 },
        { name: "Gemstone S", needed: 64, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vesper Master": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 60, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Stormer": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 200, collected: 0 },
        { name: "Gemstone S", needed: 60, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Fighter": [
        { name: "Vesper Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 190, collected: 0 },
        { name: "Gemstone S", needed: 56, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],

    // ── VORPAL — Piezas individuales (S84) ───────────────────
    "Vorpal Breastplate": [
        { name: "Vorpal Breastplate Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 42, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vorpal Gaiters": [
        { name: "Crystal S84", needed: 125, collected: 0 },
        { name: "Gemstone S", needed: 34, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vorpal Helmet": [
        { name: "Crystal S84", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 26, collected: 0 },
    ],
    "Vorpal Gauntlets": [
        { name: "Crystal S84", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 20, collected: 0 },
    ],
    "Vorpal Boots": [
        { name: "Crystal S84", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 20, collected: 0 },
    ],
    "Vorpal Shield": [
        { name: "Crystal S84", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 20, collected: 0 },
    ],
    "Vorpal Leather Breastplate": [
        { name: "Vorpal Leather Armor Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 130, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vorpal Leather Gaiters": [
        { name: "Crystal S84", needed: 108, collected: 0 },
        { name: "Gemstone S", needed: 30, collected: 0 },
    ],
    "Vorpal Leather Helmet": [
        { name: "Crystal S84", needed: 86, collected: 0 },
        { name: "Gemstone S", needed: 22, collected: 0 },
    ],
    "Vorpal Leather Gloves": [
        { name: "Crystal S84", needed: 68, collected: 0 },
        { name: "Gemstone S", needed: 17, collected: 0 },
    ],
    "Vorpal Leather Boots": [
        { name: "Crystal S84", needed: 68, collected: 0 },
        { name: "Gemstone S", needed: 17, collected: 0 },
    ],
    "Vorpal Circlet": [
        { name: "Vorpal Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 26, collected: 0 },
        { name: "Cloth Piece", needed: 55, collected: 0 },
    ],
    "Vorpal Robe Gloves": [
        { name: "Crystal S84", needed: 68, collected: 0 },
        { name: "Gemstone S", needed: 17, collected: 0 },
        { name: "Cloth Piece", needed: 35, collected: 0 },
    ],
    "Vorpal Robe Boots": [
        { name: "Crystal S84", needed: 68, collected: 0 },
        { name: "Gemstone S", needed: 17, collected: 0 },
        { name: "Cloth Piece", needed: 35, collected: 0 },
    ],
    "Vorpal Necklace": [
        { name: "Crystal S84", needed: 160, collected: 0 },
        { name: "Gemstone S", needed: 45, collected: 0 },
        { name: "Silver Nugget", needed: 100, collected: 0 },
    ],
    "Vorpal Earrings": [
        { name: "Crystal S84", needed: 130, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Silver Nugget", needed: 80, collected: 0 },
    ],
    "Vorpal Ring": [
        { name: "Crystal S84", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
        { name: "Silver Nugget", needed: 60, collected: 0 },
    ],

    // ── VORPAL — Armas adicionales (S84) ─────────────────────
    "Vorpal Blader": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 240, collected: 0 },
        { name: "Gemstone S", needed: 76, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],
    "Vorpal Retributer": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vorpal Caster": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 240, collected: 0 },
        { name: "Gemstone S", needed: 76, collected: 0 },
        { name: "Cloth Piece", needed: 100, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],
    "Vorpal Edge": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vorpal Slasher": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 260, collected: 0 },
        { name: "Gemstone S", needed: 84, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
    ],
    "Vorpal Splitter": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],
    "Vorpal Spear": [
        { name: "Vorpal Sword Piece", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 250, collected: 0 },
        { name: "Gemstone S", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],
    "Vorpal Dual Blades": [
        { name: "Vorpal Sword Piece", needed: 2, collected: 0 },
        { name: "Crystal S84", needed: 460, collected: 0 },
        { name: "Gemstone S", needed: 140, collected: 0 },
        { name: "Mold Glue", needed: 5, collected: 0 },
    ],

    // ── ICARUS — Armas S completas ────────────────────────────
    "Icarus Sawsword": [
        { name: "Icarus Sawsword Blade", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 160, collected: 0 },
        { name: "Gemstone S", needed: 40, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
    ],
    "Icarus Wingblade": [
        { name: "Icarus Wingblade Piece", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
    "Icarus Dagger": [
        { name: "Icarus Dagger Blade", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 145, collected: 0 },
        { name: "Gemstone S", needed: 34, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
    "Icarus Hall": [
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Cloth Piece", needed: 70, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
    "Icarus Disperser": [
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Stem", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
    ],
};

// ── ITEMS NO CRAFTEABLES (solo drop/quest/boss) ─────────────────
// Aparecerán en ROJO en el autocompletado de Crafts
export const NON_CRAFTABLE = new Set([
    // Boss drops — Joyas épicas
    "Baium's Ring",
    "Antharas' Earring",
    "Valakas' Necklace",
    "Zaken's Earring",
    "Queen Ant's Ring",
    "Orfen's Earring",
    "Core's Ring",
    "Frintezza's Necklace",
    "Earring of Beleth",
    "Ring of Beleth",
    "Necklace of Beleth",
    "Ring of Freya",
    "Earring of Freya",
    "Necklace of Freya",
    "Lindvior's Earring",
    "Istina's Necklace",
    "Octavis' Ring",
    // Armas malditas (solo drop de raid)
    "Zariche",
    "Akamanah",
    // Boss drops — Talismanes
    "Talisman of Baium",
    "Talisman of Antharas",
    "Talisman of Eva",
    "Talisman of Aden",
    "Sealed Talisman of Baium",
    // Items especiales no crafteables
    "Dragon Heart",
    "Olympiad Bracelet (Hero)",
    "Hero Weapon Exchange Coupon",
    "Hero Coin",
    // Drops de raid boss (armas)
    "Raphael's Roar",
    "Dual Forgotten Blade",
    "Dual Angel Slayer",
    "Dual Demon Dagger",
    "Heaven's Divider (Dual)",
    // Drops específicos de raid (joyería adicional)
    "Frintezza's Trophy",
    "Cabrio's Hand",
    "Hallate's Medallion",
    "Kernon's Molar",
    "Golkonda's Spinal Cord",
    "Antharas Scale",
    "Valakas Scale",
    "Lindvior Scale",
    "Ekimus Skull",
]);

// ── RECETAS ADICIONALES — Items de items-db.js que faltaban ──

// (estas se añaden directamente al objeto CRAFT_RECIPES)
Object.assign(CRAFT_RECIPES, {

    // ── IMPERIAL CRUSADER — Full set (one-piece) ─────────────
    "Imperial Crusader Armor": [
        { name: "Imperial Crusader Breastplate Part", needed: 1, collected: 0 },
        { name: "Imperial Crusader Gaiters Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
        { name: "Mold Hardener", needed: 2, collected: 0 },
        { name: "Crystal S-Grade", needed: 240, collected: 0 },
        { name: "Gemstone S", needed: 50, collected: 0 },
    ],
    "Sealed Imperial Crusader Armor": [
        { name: "Imperial Crusader Breastplate Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
        { name: "Mold Lubricant", needed: 2, collected: 0 },
        { name: "Mold Hardener", needed: 2, collected: 0 },
        { name: "Crystal S-Grade", needed: 220, collected: 0 },
        { name: "Gemstone S", needed: 46, collected: 0 },
    ],
    "Sealed Imperial Crusader Breastplate": [
        { name: "Imperial Crusader Breastplate Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Sealed Imperial Crusader Gaiters": [
        { name: "Imperial Crusader Gaiters Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 20, collected: 0 },
    ],
    "Sealed Imperial Crusader Helmet": [
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone S", needed: 15, collected: 0 },
    ],
    "Sealed Imperial Crusader Gauntlets": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],
    "Sealed Imperial Crusader Boots": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],
    "Sealed Imperial Crusader Shield": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
    ],

    // ── SEALED DRACONIC LEATHER ──────────────────────────────
    "Sealed Draconic Leather Armor": [
        { name: "Draconic Leather Armor Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Sealed Draconic Leather Breastplate": [
        { name: "Draconic Leather Armor Part", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 18, collected: 0 },
    ],
    "Sealed Draconic Leather Gaiters": [
        { name: "Crystal S-Grade", needed: 80, collected: 0 },
        { name: "Gemstone S", needed: 14, collected: 0 },
    ],
    "Sealed Draconic Leather Helmet": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Sealed Draconic Leather Gloves": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],
    "Sealed Draconic Leather Boots": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],

    // ── SEALED ARCANA (robe S) ───────────────────────────────
    "Sealed Arcana Robe": [
        { name: "Arcana Robe Part", needed: 1, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
        { name: "Crystal S-Grade", needed: 120, collected: 0 },
        { name: "Gemstone S", needed: 28, collected: 0 },
    ],
    "Sealed Arcana Circlet": [
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
    ],
    "Sealed Arcana Gloves": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],
    "Sealed Arcana Boots": [
        { name: "Crystal S-Grade", needed: 50, collected: 0 },
        { name: "Gemstone S", needed: 8, collected: 0 },
    ],

    // ── TALLUM LEATHER — Piezas individuales (A) ─────────────
    "Tallum Leather Armor": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Leather", needed: 50, collected: 0 },
        { name: "Enria", needed: 6, collected: 0 },
    ],
    "Tallum Leather Breastplate": [
        { name: "Crystal A-Grade", needed: 84, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Leather", needed: 35, collected: 0 },
        { name: "Enria", needed: 5, collected: 0 },
    ],
    "Tallum Leather Gaiters": [
        { name: "Crystal A-Grade", needed: 70, collected: 0 },
        { name: "Gemstone A", needed: 10, collected: 0 },
        { name: "Leather", needed: 29, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Tallum Leather Helmet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Leather", needed: 21, collected: 0 },
    ],
    "Tallum Leather Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Tallum Leather Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],

    // ── TALLUM ROBE — Piezas individuales (A) ────────────────
    "Tallum Robe": [
        { name: "Crystal A-Grade", needed: 120, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Gemstone A", needed: 18, collected: 0 },
        { name: "Cloth Piece", needed: 25, collected: 0 },
        { name: "Enria", needed: 7, collected: 0 },
    ],
    "Tallum Circlet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Cloth Piece", needed: 10, collected: 0 },
    ],
    "Tallum Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Tallum Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],

    // ── MAJESTIC LEATHER — Piezas individuales (A) ───────────
    "Majestic Leather Breastplate": [
        { name: "Crystal A-Grade", needed: 84, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Leather", needed: 35, collected: 0 },
        { name: "Thons", needed: 5, collected: 0 },
    ],
    "Majestic Leather Gaiters": [
        { name: "Crystal A-Grade", needed: 70, collected: 0 },
        { name: "Gemstone A", needed: 10, collected: 0 },
        { name: "Leather", needed: 29, collected: 0 },
        { name: "Thons", needed: 4, collected: 0 },
    ],
    "Majestic Leather Helmet": [
        { name: "Crystal A-Grade", needed: 52, collected: 0 },
        { name: "Gemstone A", needed: 8, collected: 0 },
        { name: "Leather", needed: 21, collected: 0 },
    ],
    "Majestic Leather Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],
    "Majestic Leather Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],

    // ── MAJESTIC ROBE — Piezas individuales (A) ──────────────
    "Majestic Robe Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],
    "Majestic Robe Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
    ],

    // ── DARK CRYSTAL — Accesorios adicionales (A) ────────────
    "Dark Crystal Leather Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dark Crystal Leather Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    "Dark Crystal Robe Gloves": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Cloth Piece", needed: 8, collected: 0 },
    ],
    "Dark Crystal Robe Boots": [
        { name: "Crystal A-Grade", needed: 42, collected: 0 },
        { name: "Gemstone A", needed: 6, collected: 0 },
        { name: "Cloth Piece", needed: 8, collected: 0 },
    ],

    // ── VESPER ROBE — Set completo individual ─────────────────
    "Vesper Robe Tunic": [
        { name: "Vesper Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S80", needed: 140, collected: 0 },
        { name: "Gemstone S", needed: 38, collected: 0 },
        { name: "Cloth Piece", needed: 70, collected: 0 },
        { name: "Mold Glue", needed: 2, collected: 0 },
    ],
    "Vesper Stockings": [
        { name: "Crystal S80", needed: 100, collected: 0 },
        { name: "Gemstone S", needed: 26, collected: 0 },
        { name: "Cloth Piece", needed: 50, collected: 0 },
    ],

    // ── VORPAL ROBE — Set completo individual ─────────────────
    "Vorpal Robe Tunic": [
        { name: "Vorpal Robe Part", needed: 1, collected: 0 },
        { name: "Crystal S84", needed: 175, collected: 0 },
        { name: "Gemstone S", needed: 50, collected: 0 },
        { name: "Cloth Piece", needed: 90, collected: 0 },
        { name: "Mold Glue", needed: 3, collected: 0 },
    ],
    "Vorpal Stockings": [
        { name: "Crystal S84", needed: 125, collected: 0 },
        { name: "Gemstone S", needed: 34, collected: 0 },
        { name: "Cloth Piece", needed: 65, collected: 0 },
    ],

    // ── DEMON DAGGER S ────────────────────────────────────────
    "Demon Dagger": [
        { name: "Crystal S-Grade", needed: 150, collected: 0 },
        { name: "Gemstone S", needed: 36, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
        { name: "Mold Hardener", needed: 1, collected: 0 },
    ],
    "Sirra's Blade (S)": [
        { name: "Crystal S-Grade", needed: 145, collected: 0 },
        { name: "Gemstone S", needed: 34, collected: 0 },
        { name: "Mold Glue", needed: 1, collected: 0 },
        { name: "Mold Lubricant", needed: 1, collected: 0 },
    ],
});

// ── RECETAS JOYAS ADICIONALES ─────────────────────────────────
Object.assign(CRAFT_RECIPES, {
    // Sealed Tateossian (S-grade, oficial High Five)
    "Sealed Tateossian Necklace": [
        { name: "Recipe: Sealed Tateossian Necklace (70%)", needed: 1, collected: 0 },
        { name: "Sealed Tateossian Necklace Chain", needed: 22, collected: 0 },
        { name: "Oriharukon", needed: 7, collected: 0 },
        { name: "Braided Hemp", needed: 7, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
        { name: "Thons", needed: 3, collected: 0 },
        { name: "Gemstone S", needed: 17, collected: 0 },
        { name: "Crystal S-Grade", needed: 90, collected: 0 },
    ],
    "Sealed Tateossian Earring": [
        { name: "Recipe: Sealed Tateossian Earring (70%)", needed: 1, collected: 0 },
        { name: "Sealed Tateossian Earring Part", needed: 17, collected: 0 },
        { name: "Oriharukon", needed: 5, collected: 0 },
        { name: "Braided Hemp", needed: 5, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
        { name: "Gemstone S", needed: 12, collected: 0 },
        { name: "Crystal S-Grade", needed: 60, collected: 0 },
    ],
    "Sealed Tateossian Ring": [
        { name: "Recipe: Sealed Tateossian Ring (70%)", needed: 1, collected: 0 },
        { name: "Sealed Tateossian Ring Gem", needed: 13, collected: 0 },
        { name: "Oriharukon", needed: 4, collected: 0 },
        { name: "Braided Hemp", needed: 4, collected: 0 },
        { name: "Asofe", needed: 2, collected: 0 },
        { name: "Thons", needed: 2, collected: 0 },
        { name: "Gemstone S", needed: 10, collected: 0 },
        { name: "Crystal S-Grade", needed: 45, collected: 0 },
    ],
    // Moonstone (B-grade)
    "Moonstone Necklace": [
        { name: "Moonstone Shard", needed: 1, collected: 0 },
        { name: "Crystal B-Grade", needed: 80, collected: 0 },
        { name: "Gemstone B", needed: 10, collected: 0 },
        { name: "Silver Nugget", needed: 32, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Moonstone Earring": [
        { name: "Moonstone Shard", needed: 1, collected: 0 },
        { name: "Crystal B-Grade", needed: 60, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
        { name: "Silver Nugget", needed: 24, collected: 0 },
        { name: "Asofe", needed: 3, collected: 0 },
    ],
    "Moonstone Ring": [
        { name: "Moonstone Shard", needed: 1, collected: 0 },
        { name: "Crystal B-Grade", needed: 40, collected: 0 },
        { name: "Gemstone B", needed: 6, collected: 0 },
        { name: "Silver Nugget", needed: 16, collected: 0 },
        { name: "Asofe", needed: 2, collected: 0 },
    ],
    // Doom Jewelry (B-grade)
    "Doom Necklace": [
        { name: "Crystal B-Grade", needed: 80, collected: 0 },
        { name: "Gemstone B", needed: 10, collected: 0 },
        { name: "Silver Nugget", needed: 30, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Doom Earrings": [
        { name: "Crystal B-Grade", needed: 60, collected: 0 },
        { name: "Gemstone B", needed: 8, collected: 0 },
        { name: "Silver Nugget", needed: 24, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Doom Ring": [
        { name: "Crystal B-Grade", needed: 40, collected: 0 },
        { name: "Gemstone B", needed: 6, collected: 0 },
        { name: "Silver Nugget", needed: 16, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
    // Dark Crystal Jewelry (A-grade)
    "Dark Crystal Necklace": [
        { name: "Crystal A-Grade", needed: 100, collected: 0 },
        { name: "Gemstone A", needed: 15, collected: 0 },
        { name: "Silver Nugget", needed: 48, collected: 0 },
        { name: "Enria", needed: 4, collected: 0 },
    ],
    "Dark Crystal Earrings": [
        { name: "Crystal A-Grade", needed: 80, collected: 0 },
        { name: "Gemstone A", needed: 12, collected: 0 },
        { name: "Silver Nugget", needed: 38, collected: 0 },
        { name: "Enria", needed: 3, collected: 0 },
    ],
    "Dark Crystal Ring": [
        { name: "Crystal A-Grade", needed: 60, collected: 0 },
        { name: "Gemstone A", needed: 9, collected: 0 },
        { name: "Silver Nugget", needed: 28, collected: 0 },
        { name: "Enria", needed: 2, collected: 0 },
    ],
});

// Helper: buscar receta por nombre de item (búsqueda exacta o parcial)
export function getRecipeFor(itemName) {
    if (window.STATE && window.STATE.globalItems && window.STATE.globalItems.length > 0) {
        const fi = window.STATE.globalItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (fi && fi.materials && fi.materials.length > 0) return fi.materials.map(m => ({ ...m }));
    }
    // Búsqueda exacta primero
    if (CRAFT_RECIPES[itemName]) return CRAFT_RECIPES[itemName].map(m => ({ ...m }));
    // Búsqueda parcial
    const key = Object.keys(CRAFT_RECIPES).find(k => k.toLowerCase() === itemName.toLowerCase());
    return key ? CRAFT_RECIPES[key].map(m => ({ ...m })) : null;
}

// Helper: ¿Tiene receta este item?
export function isCraftable(itemName) {
    return !!CRAFT_RECIPES[itemName];
}



// ──────────────────────────────────────────────────────────
// RECURSIVE CRAFT TREE EVALUATOR
// ──────────────────────────────────────────────────────────

/**
 * Evaluates recursively if an item can be crafted using the available Warehouse inventory.
 * 
 * @param {string} itemName - The item we are trying to craft/collect
 * @param {number} qtyNeeded - How many of this item is required by the parent
 * @param {Array} whItems - The current unified Warehouse inventory array built outside.
 * @returns {Object} { status: 'ready'|'craftable_base'|'missing_base', missingMaterials: [{name, qty}], availableMaterials: [{name, qty}] }
 */
export function evaluateCraftTree(itemName, qtyNeeded, whItems) {
    const whEntries = whItems.filter(i => i.name.toLowerCase() === itemName.toLowerCase());
    const whQty = whEntries.reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    // If we have exactly what we need, it's 'ready' and no further checking is needed.
    if (whQty >= qtyNeeded) {
        return { status: 'ready', missingMaterials: [], availableMaterials: [{ name: itemName, qty: qtyNeeded }] };
    }

    const deficit = qtyNeeded - whQty;

    // We physically have whQty of this item, so we track what we are using directly
    let availableMaterialsToReturn = [];
    if (whQty > 0) {
        availableMaterialsToReturn.push({ name: itemName, qty: whQty });
    }

    // 2. If it's a raw uncraftable material (e.g. Animal Bone) and we are short, it's missing.
    if (isNonCraftable(itemName)) {
        return {
            status: 'missing_base',
            missingMaterials: [{ name: itemName, qty: deficit }],
            availableMaterials: availableMaterialsToReturn
        };
    }

    // 3. It is craftable! We must recursively check its sub-components to see if we can cover the deficit.
    const recipe = getRecipeFor(itemName);

    // Safety check just in case getRecipeFor returns null (e.g. database item with no materials)
    if (!recipe || recipe.length === 0) {
        return {
            status: 'missing_base',
            missingMaterials: [{ name: itemName, qty: deficit }],
            availableMaterials: availableMaterialsToReturn
        };
    }

    let allMissing = [];
    let allAvailable = [...availableMaterialsToReturn];

    for (const subMat of recipe) {
        // We need (subMat.needed * deficit) amount of this sub-material to cover the parent deficit
        const totalSubNeeded = subMat.needed * deficit;

        const subEval = evaluateCraftTree(subMat.name, totalSubNeeded, whItems);

        // Aggregate missing materials
        if (subEval.missingMaterials.length > 0) {
            for (const missing of subEval.missingMaterials) {
                const existing = allMissing.find(m => m.name === missing.name);
                if (existing) {
                    existing.qty += missing.qty;
                } else {
                    allMissing.push({ name: missing.name, qty: missing.qty });
                }
            }
        }

        // Aggregate available materials used
        if (subEval.availableMaterials.length > 0) {
            for (const avail of subEval.availableMaterials) {
                const existing = allAvailable.find(m => m.name === avail.name);
                if (existing) {
                    existing.qty += avail.qty;
                } else {
                    allAvailable.push({ name: avail.name, qty: avail.qty });
                }
            }
        }
    }

    if (allMissing.length === 0) {
        // We lack the direct item, but we have 100% of the base materials across all sub-trees!
        return { status: 'craftable_base', missingMaterials: [], availableMaterials: allAvailable };
    } else {
        // We lack base materials somewhere down the tree.
        return { status: 'missing_base', missingMaterials: allMissing, availableMaterials: allAvailable };
    }
}

// Helper: ¿Es exclusivamente drop (no crafteable)?
export function isNonCraftable(itemName) {
    if (window.STATE && window.STATE.globalItems && window.STATE.globalItems.length > 0) {
        const fi = window.STATE.globalItems.find(i => i.name.toLowerCase() === itemName.toLowerCase());
        if (fi && fi.materials) return fi.materials.length === 0; // Si el editor le quitó o no le puso mats, es no-crafteable
    }
    return NON_CRAFTABLE.has(itemName);
}

// Helper: lista de todos los items con receta
export function getItemsWithRecipes() {
    return Object.keys(CRAFT_RECIPES);
}
