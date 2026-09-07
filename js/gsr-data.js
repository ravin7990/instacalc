/**
 * GSR (Goa Schedule of Rates) Data Loader
 * Supports multiple GSR datasets with switching.
 *
 * Available GSR sources:
 *   - Building GSR 2023    → docs/gsrjson/gsr2023building.json
 *   - Roads GSR 2023       → docs/gsrjson/gsr2023roads.json
 *   - Electrical GSR 2023  → docs/gsrjson/gsr2023electrical.json
 */

const GSR_SOURCES = [
    {
        id: 'building',
        label: 'Building GSR 2023',
        shortLabel: 'Building',
        icon: 'fa-building',
        file: 'docs/gsrjson/gsr2023building.json',
        color: '#0077B6',
        downloadFile: 'docs/building_gsr_2023.docx'
    },
    {
        id: 'roads',
        label: 'Roads GSR 2023',
        shortLabel: 'Roads',
        icon: 'fa-road',
        file: 'docs/gsrjson/gsr2023roads.json',
        color: '#E67E22',
        downloadFile: 'docs/roads_gsr_2023.docx'
    },
    {
        id: 'electrical',
        label: 'Electrical GSR 2023',
        shortLabel: 'Electrical',
        icon: 'fa-bolt',
        file: 'docs/gsrjson/gsr2023electrical.json',
        color: '#27AE60',
        downloadFile: 'docs/electrical_gsr_2023.docx'
    }
];

// Chapter color palette for visual distinction
const GSR_CHAPTER_COLORS = {
    // Building chapters
    'LABOUR': '#6B5B3E',
    'EARTHWORKS': '#8B6914',
    'PRECAST MASONARY WORKS': '#7B5EA7',
    'BRICK MASONARY WORKS': '#B84A3C',
    'LATERITE MASONARY WORKS': '#A0522D',
    'PLAIN CONCRETE WORKS': '#4A6FA5',
    'REINFORCED CEMENT CONCRETE WORKS': '#2E5090',
    'WOOD WORK': '#8B5E3C',
    'STEEL AND ALUMINIUM WORK': '#5A5A5A',
    'FLOORING AND FLOOR FINISHES': '#7B5EA7',
    'ROOFING & CEILING WORKS': '#4E7A4E',
    'PLASTERING AND FINISHING WORKS': '#6B8E6B',
    'DISMANTLING DEMOLISHING & REPAIRS WORK': '#8B0000',
    'LANDSCAPING & HORTICULTURE WORK': '#228B22',
    'WATER SUPPLY SEWERAGE, PLUMBING & SANITATION WORK': '#2E8B8B',
    'MISCELLANEOUS WORK': '#6B6B6B',
    // Roads chapters
    'CARRIAGE OF MATERIALS': '#C47A2B',
    'SITE CLEARANCE': '#9B4DCA',
    'SUB-BASES, BASES (NON-BITUMINOUS) AND SHOULDERS': '#3498DB',
    'BASES AND SURFACE COURSES (BITUMINOUS)': '#2C3E50',
    'GEOSYNTHETICS AND REINFORCED EARTH': '#1ABC9C',
    'TRAFFIC SIGNS, MARKINGS & OTHER ROAD APPURTENANCES': '#E74C3C',
    'PIPE CULVERTS': '#8E44AD',
    'MAINTENANCE OF ROADS': '#D35400',
    'HORTICULTURE': '#27AE60',
    'FOUNDATIONS': '#2980B9',
    'SUB-STRUCTURE': '#7F8C8D',
    'SUPER-STRUCTURE': '#34495E',
    'RIVER TRAINING AND PROTECTION WORKS': '#16A085',
    'REPAIR AND REHABILITATION': '#F39C12',
    'MISCELENIOUS ITEMS': '#95A5A6',
    'CEMENT CONCRETE PAVEMENTS': '#3A539B',
    'Laterite Masonary Work': '#A0522D',
    'PRECAST CEMENT CONCRETE WORKS': '#6C3483',
    'ROAD WORKS': '#E67E22',
    'LANDSCAPING & HORTICULTURE WORK': '#228B22',
    // Electrical chapters
    'BASIC RATES OF MATERIAL': '#2ECC71',
    'INTERNAL ELECTRIFICATION': '#F1C40F',
    'EXTERNAL ELECTRIFICATION': '#D4AC0D',
    'PANEL BOARDS': '#E74C3C',
    'ELECTRICAL APPLIANCES': '#3498DB',
    'STREET LIGHTING': '#F39C12',
    'WIREMAN ITEMS': '#8E44AD',
    'FIRE ALARM SYSTEM': '#C0392B',
    'TELEPHONE & DATA': '#1ABC9C',
    'CCTV SYSTEM': '#34495E',
    'PUBLIC ADDRESS SYSTEM': '#7F8C8D',
    'EARTHING': '#D35400',
    'LIGHTNING PROTECTION': '#2C3E50',
    'UPS SYSTEM': '#16A085',
    'DG SET': '#7D3C98',
    'SOLAR ENERGY': '#F5B041',
    'LT CABLE': '#566573',
    'HT CABLE': '#273746',
};

// Fallback colors for any chapters not listed above
const FALLBACK_COLORS = [
    '#C47A2B', '#D4543A', '#3A7CA5', '#9B59B6',
    '#E67E22', '#1ABC9C', '#E74C3C', '#2980B9',
    '#F39C12', '#27AE60', '#8E44AD', '#2C3E50'
];

/**
 * Fetches GSR data from the given source.
 * @param {string} sourceId - One of the GSR_SOURCES ids ('building' or 'roads')
 * @returns {Promise<{items: Array, chapters: Array, source: Object}>}
 */
async function loadGSRData(sourceId) {
    const source = GSR_SOURCES.find(s => s.id === sourceId) || GSR_SOURCES[0];

    try {
        const response = await fetch(source.file);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const rawData = await response.json();

        // Build chapter list with colors
        const chapterNames = [...new Set(rawData.map(item => item.chapter))];
        const chapters = chapterNames.map((name, index) => ({
            id: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            name: name,
            color: GSR_CHAPTER_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]
        }));

        // Map items to viewer format
        const items = rawData.map((item, index) => ({
            id: index + 1,
            sourceId: source.id,
            sourceLabel: source.label,
            chapter: item.chapter,
            chapterId: item.chapter.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
            itemCode: item.sr_no,
            shortDescription: item.description,
            fullDescription: item.description,
            unit: item.unit,
            rate: typeof item.rate === 'number' ? item.rate : parseFloat(item.rate) || 0,
            year: parseInt(item.year) || 2023,
            tags: generateTags(item),
            downloadFile: source.downloadFile
        }));

        return { items, chapters, source };
    } catch (error) {
        console.error('Error loading GSR data:', error);
        return { items: [], chapters: [], source };
    }
}

/**
 * Auto-generates searchable tags from item data
 */
function generateTags(item) {
    const tags = [];
    const desc = (item.description || '').toLowerCase();

    tags.push(item.chapter.toLowerCase());

    const keywords = [
        'concrete', 'cement', 'brick', 'laterite', 'stone', 'steel', 'wood',
        'timber', 'plaster', 'paint', 'tile', 'pipe', 'wire', 'cable',
        'earthwork', 'excavation', 'foundation', 'roofing', 'flooring',
        'plumbing', 'sanitary', 'electrical', 'masonry', 'mortar',
        'waterproofing', 'dismantling', 'demolition', 'glass', 'aluminium',
        'door', 'window', 'railing', 'grille', 'gutter', 'drain',
        'bituminous', 'asphalt', 'macadam', 'aggregate', 'road',
        'bridge', 'culvert', 'pavement', 'kerb', 'shoulder'
    ];

    keywords.forEach(kw => {
        if (desc.includes(kw)) tags.push(kw);
    });

    return [...new Set(tags)].slice(0, 5);
}
