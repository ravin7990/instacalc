/**
 * BOQ Viewer JS - Card Layout Edition (Matching GSR Viewer)
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Helper: Escape HTML to prevent XSS ──
    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ── Helper: Format Indian Currency ──
    function formatTotalValue(amount) {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(2)} Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(2)} L`;
        }
        return `₹${Math.round(amount).toLocaleString('en-IN')}`;
    }

    // ── Elements ──
    const fileInput = document.getElementById('boqFileInput');
    const uploadArea = document.getElementById('uploadArea');
    const boqDashboard = document.getElementById('boqDashboard');
    const activeElements = document.querySelectorAll('.boq-viewer-active');
    const guidanceSection = document.getElementById('guidanceSection');
    const searchInput = document.getElementById('boqSearchInput');
    const clearSearchBtn = document.getElementById('boqClearSearch');
    const sectionFilter = document.getElementById('boqSectionFilter');
    const columnFilter = document.getElementById('boqGridColumns');
    const sortSelect = document.getElementById('boqSortBy');
    const sheetSelect = document.getElementById('boqSheetSelect');
    const grid = document.getElementById('boqGrid');
    const noResults = document.getElementById('boqNoResults');
    const resultCount = document.getElementById('boqResultCount');
    const statsEl = document.getElementById('boqSummaryStats');
    const modal = document.getElementById('boqModal');
    const modalClose = document.getElementById('boqModalClose');
    const modalCloseBtn = document.getElementById('boqModalCloseBtn');
    const downloadExcelBtn = document.getElementById('boqDownloadExcelBtn');
    const downloadPdfBtn = document.getElementById('boqDownloadPdfBtn');
    const resetBtn = document.getElementById('resetBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.getElementById('primary-navigation');
    const currentYearEl = document.getElementById('currentYear');

    // ── Column Mapper Elements ──
    const toggleColMapperBtn = document.getElementById('toggleColMapperBtn');
    const colMapperPanel = document.getElementById('colMapperPanel');
    const mapColNo = document.getElementById('mapColNo');
    const mapColDesc = document.getElementById('mapColDesc');
    const mapColUnit = document.getElementById('mapColUnit');
    const mapColQty = document.getElementById('mapColQty');
    const mapColRate = document.getElementById('mapColRate');
    const mapColAmount = document.getElementById('mapColAmount');
    const applyColMapBtn = document.getElementById('applyColMapBtn');
    const cancelColMapBtn = document.getElementById('cancelColMapBtn');

    // ── Header & Footer Setup ──
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isActive = primaryNav.classList.toggle('nav-active');
            navToggle.setAttribute('aria-expanded', isActive);
        });
    }

    // ── State ──
    let currentWorkbook = null;
    let currentRawRows = [];
    let currentIndices = null;
    let currentHeaderRowIndex = 0;
    let BOQ_DATA = [];
    let BOQ_SECTIONS = [];
    let fileName = '';
    const ITEMS_PER_PAGE = 60;
    let currentPage = 1;
    let currentModalItem = null;
    let searchDebounceTimer = null;

    // ── Color Generators ──
    const SECTION_COLORS = ['#0077B6', '#E67E22', '#27AE60', '#8E44AD', '#F39C12', '#C0392B', '#16A085', '#2C3E50'];

    // ── File Events ──
    uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.classList.add('dragover'); });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => { e.preventDefault(); uploadArea.classList.remove('dragover'); handleFileSelection(e.dataTransfer.files[0]); });
    fileInput.addEventListener('change', (e) => handleFileSelection(e.target.files[0]));
    resetBtn.addEventListener('click', () => location.reload()); // Simplest way to reset everything

    function handleFileSelection(file) {
        if (!file) return;
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            alert('Please upload a valid Excel/CSV file (.xlsx, .xls, .csv).');
            return;
        }
        fileName = file.name;
        document.getElementById('fileInfo').innerHTML = `File: <strong>${escapeHTML(fileName)}</strong>`;

        if (window.trackEvent) {
            window.trackEvent('boq_file_upload', {
                file_name: file.name,
                file_size: file.size,
                file_type: (file.name.split('.').pop() || '').toLowerCase()
            });
        }

        readExcel(file);
    }

    function readExcel(file) {
        loadingOverlay.style.display = 'flex';
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                currentWorkbook = XLSX.read(data, { type: 'array', cellStyles: false });

                if (!currentWorkbook.SheetNames || currentWorkbook.SheetNames.length === 0) {
                    alert('The uploaded Excel file has no sheets.');
                    loadingOverlay.style.display = 'none';
                    return;
                }

                // Smart Sheet Detection: Scan all sheets to auto-select the main BOQ/Tender sheet
                const bestSheetName = findBestBOQSheet(currentWorkbook);

                // Populate sheet selector if multiple sheets exist
                if (sheetSelect) {
                    if (currentWorkbook.SheetNames.length > 1) {
                        sheetSelect.innerHTML = currentWorkbook.SheetNames.map(name => {
                            const ws = currentWorkbook.Sheets[name];
                            let rowCount = 0;
                            if (ws && ws['!ref']) {
                                const range = XLSX.utils.decode_range(ws['!ref']);
                                rowCount = range.e.r - range.s.r + 1;
                            }
                            const isSelected = (name === bestSheetName) ? 'selected' : '';
                            const countText = rowCount > 0 ? ` (${rowCount} rows)` : '';
                            return `<option value="${escapeHTML(name)}" ${isSelected}>Sheet: ${escapeHTML(name)}${countText}</option>`;
                        }).join('');
                        sheetSelect.value = bestSheetName;
                        sheetSelect.style.display = 'inline-block';
                    } else {
                        sheetSelect.style.display = 'none';
                    }
                }

                loadSheet(bestSheetName);
            } catch (err) {
                console.error("Excel Read Error:", err);
                if (window.trackEvent) {
                    window.trackEvent('boq_parse_error', {
                        file_name: fileName || '',
                        error_message: err.message
                    });
                }
                alert('Failed to parse file: ' + err.message);
                loadingOverlay.style.display = 'none';
            }
        };
        reader.onerror = (err) => {
            console.error("FileReader Error:", err);
            if (window.trackEvent) {
                window.trackEvent('boq_parse_error', {
                    file_name: fileName || '',
                    error_message: 'FileReader Error'
                });
            }
            alert('Error reading file.');
            loadingOverlay.style.display = 'none';
        };
        reader.readAsArrayBuffer(file);
    }

    // ── Smart Sheet Detection ──
    // Evaluates all sheets to pick the one containing actual BOQ data rather than warning / macro / instruction sheets
    function findBestBOQSheet(workbook) {
        if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) return null;
        if (workbook.SheetNames.length === 1) return workbook.SheetNames[0];

        const IGNORED_NAMES = ['warning', 'instructions', 'instruction', 'readme', 'read me', 'macro', 'macros', 'notice', 'disclaimer', 'cover', 'help', 'blank'];
        const HIGH_PRIORITY_NAMES = ['boq', 'schedule', 'volume', 'bill of quantities', 'tender', 'price', 'estimate', 'work', 'civil', 'items', 'item rate', 'sor', 'rates'];

        let bestSheet = workbook.SheetNames[0];
        let bestScore = -99999;

        workbook.SheetNames.forEach(sheetName => {
            const lowerName = sheetName.toLowerCase().trim();
            let score = 0;

            if (IGNORED_NAMES.some(ign => lowerName.includes(ign))) {
                score -= 500;
            }
            if (HIGH_PRIORITY_NAMES.some(pri => lowerName.includes(pri))) {
                score += 200;
            }

            const ws = workbook.Sheets[sheetName];
            if (!ws) return;

            let rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
            if (!rows || rows.length === 0) {
                score -= 1000;
            } else {
                score += Math.min(rows.length * 2, 400);

                // Check for detected BOQ columns
                const detected = findColumns(rows);
                let colMatches = 0;
                if (detected.indices.description !== -1) colMatches += 3;
                if (detected.indices.rate !== -1) colMatches += 2;
                if (detected.indices.qty !== -1) colMatches += 2;
                if (detected.indices.amount !== -1) colMatches += 2;
                if (detected.indices.no !== -1) colMatches += 1;
                if (detected.indices.unit !== -1) colMatches += 1;

                score += colMatches * 25;
            }

            if (score > bestScore) {
                bestScore = score;
                bestSheet = sheetName;
            }
        });

        return bestSheet;
    }

    // Switch sheet listener
    if (sheetSelect) {
        sheetSelect.addEventListener('change', (e) => {
            if (currentWorkbook) {
                loadingOverlay.style.display = 'flex';
                setTimeout(() => {
                    loadSheet(e.target.value);
                }, 50);
            }
        });
    }

    function loadSheet(sheetName) {
        if (!currentWorkbook || !currentWorkbook.Sheets[sheetName]) {
            loadingOverlay.style.display = 'none';
            return;
        }

        if (sheetSelect && sheetSelect.value !== sheetName) {
            sheetSelect.value = sheetName;
        }

        if (window.trackEvent) {
            window.trackEvent('boq_sheet_select', {
                sheet_name: sheetName
            });
        }

        const worksheet = currentWorkbook.Sheets[sheetName];

        // Try sheet_to_json first
        let jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
            blankrows: false
        });

        // Fallback for complex merged-cell headers
        if (jsonData.length <= 5 && worksheet['!ref']) {
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            jsonData = [];

            for (let r = range.s.r; r <= range.e.r; r++) {
                const row = [];
                let hasData = false;
                for (let c = range.s.c; c <= range.e.c; c++) {
                    const cellAddr = XLSX.utils.encode_cell({ r: r, c: c });
                    const cell = worksheet[cellAddr];
                    const val = cell ? (cell.w || cell.v || '') : '';
                    row.push(val);
                    if (val !== '') hasData = true;
                }
                if (hasData) jsonData.push(row);
            }
        }

        if (jsonData.length === 0) {
            alert(`Sheet "${sheetName}" is empty.`);
            loadingOverlay.style.display = 'none';
            return;
        }

        currentRawRows = jsonData;
        processBOQRows(jsonData);
    }

    // ── Recognized Civil / Departmental Construction Units ──
    const KNOWN_UNITS = new Set([
        'cum', 'sqm', 'm3', 'm2', 'm', 'rm', 'rmt', 'r.m.', 'mtr', 'meter', 'metre', 'meters', 'metres',
        'nos', 'no', 'nos.', 'no.', 'number', 'numbers', 'each', 'set', 'sets', 'pair', 'pairs',
        'kg', 'kgs', 'quintal', 'qtl', 'tonne', 'ton', 'tons', 'tonnes', 'metric tonne', 'mt',
        'litre', 'litres', 'liter', 'liters', 'ltr', 'bag', 'bags',
        'ls', 'l.s.', 'job', 'point', 'pt', 'shift', 'day', 'month', 'hour', 'trip',
        'sqft', 'cft', 'sq.m', 'sq.mt', 'cu.m', 'cu.mt'
    ]);

    function findColumns(rows) {
        const keywords = {
            no: [
                'item no', 'sl no', 'sr no', 'item code', 'sr.no', 'sl.no', 'sr.', 'sl.', 'no.', 
                'item #', 'sl', 'sr', 'item', 's.no', 's.no.', 'line no', 'sr no.', 'sl no.', 
                'schedule item no', 'tender item no', 'index', 'ref no', 'item number', 'line #'
            ],
            description: [
                'description', 'particulars', 'item of work', 'specification', 'nomenclature', 
                'scope of work', 'name of work', 'item description', 'description of item', 
                'description of work', 'items of work', 'work description', 'item particulars', 
                'activity description', 'details', 'item specification', 'description & specification'
            ],
            unit: [
                'unit', 'units', 'uom', 'per', 'deno', 'denomination', 'unit of measurement', 
                'basis', 'measuring unit', 'unit / rate'
            ],
            qty: [
                'qty', 'quantity', 'quantities', 'boq qty', 'tender qty', 'estimated qty', 
                'approx qty', 'quantity in figures', 'total qty', 'scope qty', 'qty.', 'nos'
            ],
            rate: [
                'rate', 'basic rate', 'quoted rate', 'unit price', 'unit rate', 'rates in figures', 
                'price', 'estimated rate', 'item rate', 'rate in figures', 'rate (rs.)', 
                'rate(rs.)', 'unit rate in rs', 'schedule rate', 'rate / unit', 'tender rate',
                'rate (in figures)'
            ],
            amount: [
                'amount', 'total', 'total amount', 'value', 'amount(rs', 'amount (rs', 
                'total cost', 'estimated amount', 'total value', 'item amount', 'cost', 
                'net amount', 'gross amount', 'total (rs.)', 'amount in rs.', 'tender amount',
                'total amount in figures', 'total amount without taxes', 'total amount with taxes'
            ]
        };

        let bestMatches = -1;
        let indices = { no: -1, description: -1, unit: -1, qty: -1, rate: -1, amount: -1 };
        let headerRowIndex = -1;

        // Scan first 40 rows for single-row or two-tier (combined) headers
        const maxScanRows = Math.min(rows.length, 40);

        for (let i = 0; i < maxScanRows; i++) {
            const singleRow = rows[i].map(c => (c !== null && c !== undefined ? c.toString().toLowerCase().trim() : ''));
            const nextRow = (i + 1 < rows.length) 
                ? rows[i + 1].map(c => (c !== null && c !== undefined ? c.toString().toLowerCase().trim() : ''))
                : [];

            // Test both single row and combined two-tier row
            const candidates = [
                { row: singleRow, isCombined: false },
                { 
                    row: singleRow.map((c, colIdx) => (c + ' ' + (nextRow[colIdx] || '')).trim()), 
                    isCombined: true 
                }
            ];

            candidates.forEach(({ row, isCombined }) => {
                let matches = 0;
                const temp = { no: -1, description: -1, unit: -1, qty: -1, rate: -1, amount: -1 };

                for (const [key, aliases] of Object.entries(keywords)) {
                    const idx = row.findIndex(cell => {
                        if (!cell || cell.length < 2) return false;

                        // 1. Exact match takes top priority
                        if (aliases.includes(cell)) return true;

                        // 2. Substring match with safety exclusions
                        return aliases.some(alias => {
                            if (cell.includes(alias)) {
                                if (key === 'no' && (cell.includes('description') || cell.includes('particulars') || cell.includes('text') || cell.includes('code and description'))) return false;
                                if (key === 'unit' && (cell.includes('price') || cell.includes('rate') || cell.includes('amount') || cell.includes('cost'))) return false;
                                if (key === 'qty' && cell.includes('rate')) return false;
                                return true;
                            }
                            return false;
                        });
                    });

                    if (idx !== -1) {
                        temp[key] = idx;
                        matches++;
                    }
                }

                if (matches > bestMatches && matches >= 2) {
                    bestMatches = matches;
                    headerRowIndex = isCombined ? i + 1 : i;
                    indices = temp;
                }
            });
        }

        // ── Data-Driven Heuristic Fallback (If headers are ambiguous or missing) ──
        if (bestMatches < 3 && rows.length > 5) {
            console.log("Header detection low confidence. Running data-driven analysis...");
            const sampleRows = rows.slice(Math.max(headerRowIndex + 1, 2), Math.min(rows.length, 35));
            const maxCols = Math.max(...sampleRows.map(r => r.length));

            // Find description column (column with longest average text length)
            if (indices.description === -1) {
                let maxAvgLen = 0;
                let bestDescCol = 1;
                for (let c = 0; c < maxCols; c++) {
                    const lengths = sampleRows.map(r => (r[c] || '').toString().trim().length).filter(l => l > 0);
                    if (lengths.length > 0) {
                        const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
                        if (avgLen > maxAvgLen && avgLen > 15) {
                            maxAvgLen = avgLen;
                            bestDescCol = c;
                        }
                    }
                }
                indices.description = bestDescCol;
            }

            // Find unit column (column containing known construction units)
            if (indices.unit === -1) {
                for (let c = 0; c < maxCols; c++) {
                    if (c === indices.description) continue;
                    let unitMatches = 0;
                    sampleRows.forEach(r => {
                        const val = (r[c] || '').toString().toLowerCase().trim();
                        if (KNOWN_UNITS.has(val)) unitMatches++;
                    });
                    if (unitMatches >= Math.max(2, sampleRows.length * 0.2)) {
                        indices.unit = c;
                        break;
                    }
                }
            }

            // Find Qty, Rate, Amount via numeric relationships: Qty * Rate ≈ Amount
            const numericCols = [];
            for (let c = 0; c < maxCols; c++) {
                if (c === indices.description || c === indices.unit) continue;
                let numCount = 0;
                sampleRows.forEach(r => {
                    const clean = (r[c] || '').toString().replace(/[^\d.-]/g, '');
                    if (clean && !isNaN(parseFloat(clean))) numCount++;
                });
                if (numCount >= sampleRows.length * 0.4) {
                    numericCols.push(c);
                }
            }

            // Test if any 3 columns satisfy colA * colB ≈ colC
            if (numericCols.length >= 3 && (indices.qty === -1 || indices.rate === -1 || indices.amount === -1)) {
                let bestMathMatch = 0;
                let bestMathTrio = null;

                for (let i = 0; i < numericCols.length; i++) {
                    for (let j = 0; j < numericCols.length; j++) {
                        if (i === j) continue;
                        for (let k = 0; k < numericCols.length; k++) {
                            if (k === i || k === j) continue;
                            const colQ = numericCols[i];
                            const colR = numericCols[j];
                            const colA = numericCols[k];

                            let mathHits = 0;
                            sampleRows.forEach(r => {
                                const q = parseFloat((r[colQ] || '').toString().replace(/[^\d.-]/g, ''));
                                const r_val = parseFloat((r[colR] || '').toString().replace(/[^\d.-]/g, ''));
                                const a = parseFloat((r[colA] || '').toString().replace(/[^\d.-]/g, ''));
                                if (!isNaN(q) && !isNaN(r_val) && !isNaN(a) && q > 0 && r_val > 0) {
                                    if (Math.abs((q * r_val) - a) <= Math.max(1, a * 0.02)) {
                                        mathHits++;
                                    }
                                }
                            });

                            if (mathHits > bestMathMatch && mathHits >= 2) {
                                bestMathMatch = mathHits;
                                bestMathTrio = { qty: colQ, rate: colR, amount: colA };
                            }
                        }
                    }
                }

                if (bestMathTrio) {
                    if (indices.qty === -1) indices.qty = bestMathTrio.qty;
                    if (indices.rate === -1) indices.rate = bestMathTrio.rate;
                    if (indices.amount === -1) indices.amount = bestMathTrio.amount;
                }
            }
        }

        // Final fallback to defaults if still -1
        if (indices.no === -1) indices.no = 0;
        if (indices.description === -1) indices.description = 1;
        if (indices.unit === -1) indices.unit = 2;
        if (indices.qty === -1) indices.qty = 3;
        if (indices.rate === -1) indices.rate = 4;
        if (indices.amount === -1) indices.amount = 5;

        if (headerRowIndex === -1) {
            headerRowIndex = 0;
        }

        console.log("Detected Header Row:", headerRowIndex, "Indices:", indices);
        return { headerRowIndex, indices };
    }

    function updateColMapperUI(rows, indices, headerRowIndex) {
        if (!rows || rows.length === 0) return;
        const maxCols = Math.max(...rows.slice(0, 15).map(r => r.length));
        const headerRow = rows[headerRowIndex] || rows[0] || [];

        function buildOptions(selectedIndex) {
            let html = '<option value="-1">None / Skip</option>';
            for (let c = 0; c < maxCols; c++) {
                const colLetter = String.fromCharCode(65 + c);
                const cellText = (headerRow[c] || '').toString().trim() || 
                               (rows[headerRowIndex + 1] ? (rows[headerRowIndex + 1][c] || '').toString().trim() : '') ||
                               `Column ${colLetter}`;
                const label = `Col ${colLetter}: ${cellText.length > 22 ? cellText.substring(0, 22) + '...' : cellText}`;
                const selected = (c === selectedIndex) ? 'selected' : '';
                html += `<option value="${c}" ${selected}>${escapeHTML(label)}</option>`;
            }
            return html;
        }

        if (mapColNo) mapColNo.innerHTML = buildOptions(indices.no);
        if (mapColDesc) mapColDesc.innerHTML = buildOptions(indices.description);
        if (mapColUnit) mapColUnit.innerHTML = buildOptions(indices.unit);
        if (mapColQty) mapColQty.innerHTML = buildOptions(indices.qty);
        if (mapColRate) mapColRate.innerHTML = buildOptions(indices.rate);
        if (mapColAmount) mapColAmount.innerHTML = buildOptions(indices.amount);
    }

    function processBOQRows(rows, manualIndices) {
        let headerRowIndex = 0;
        let indices;

        if (manualIndices) {
            indices = manualIndices;
            headerRowIndex = currentHeaderRowIndex || 0;
        } else {
            const detected = findColumns(rows);
            headerRowIndex = detected.headerRowIndex;
            indices = detected.indices;
        }

        currentIndices = indices;
        currentHeaderRowIndex = headerRowIndex;
        updateColMapperUI(rows, indices, headerRowIndex);

        const startRow = headerRowIndex === 0 ? 0 : headerRowIndex + 1;
        const dataRows = rows.slice(startRow);

        BOQ_DATA = [];
        BOQ_SECTIONS = [];
        let currentSection = 'General Work';
        let currentParent = null;

        dataRows.forEach((row, idx) => {
            if (!row || row.length === 0) return;
            const hasAnyData = row.some(c => c !== null && c !== undefined && c.toString().trim() !== '');
            if (!hasAnyData) return;

            const desc = (indices.description >= 0 ? row[indices.description] : '')?.toString().trim() || '';
            const itemNo = (indices.no >= 0 ? row[indices.no] : '')?.toString().trim() || '';
            const qtyStr = (indices.qty >= 0 ? row[indices.qty] : '')?.toString().trim() || '';

            // Clean numbers before parsing
            const cleanQty = qtyStr.replace(/[^\d.-]/g, '');
            const cleanRate = (indices.rate >= 0 ? (row[indices.rate]?.toString() || '') : '').replace(/[^\d.-]/g, '');
            const cleanAmount = (indices.amount >= 0 ? (row[indices.amount]?.toString() || '') : '').replace(/[^\d.-]/g, '');

            const qtyValue = parseFloat(cleanQty);
            const rateValue = parseFloat(cleanRate) || 0;
            const amountValue = parseFloat(cleanAmount) || (qtyValue * rateValue) || 0;

            const isNumericQty = !isNaN(qtyValue) && cleanQty !== '';

            // 1. Skip summary, subtotals, grand totals, and tax rows
            const descLower = desc.toLowerCase();
            const isSummaryRow = /^(sub\s*total|total\s+of|grand\s*total|gross\s*total|net\s*total|carried\s+(over|forward)|brought\s+forward|add\s+(gst|vat|cess|service)|less\s+|say\s+total|round\s*off|total\s+in\s+words)/i.test(desc) ||
                                 descLower.includes('sub total') || descLower.includes('sub-total') || descLower.includes('grand total') ||
                                 /^(sub\s*total|total|grand\s*total)/i.test(itemNo);
            if (isSummaryRow && (rateValue === 0 || !isNumericQty)) {
                return;
            }

            const isBulletOrDash = /^[\u2022\u00B7\u25CF\u25CB\-\*\.\(\)]/.test(desc.trim());

            // 2. Intelligent Section Header Detection
            if (desc && !isNumericQty && rateValue === 0 && amountValue === 0 && !isBulletOrDash) {
                const isRoundLetter = itemNo && /^[A-Z]$/i.test(itemNo) && desc.length < 80;
                const isSectionKeyword = /^(section|part|sub-head|subhead|bill\s+no|chapter|schedule)/i.test(desc) ||
                                         /(section|part|bill|sub-head|trade|schedule|head)\s+[A-Z0-9]/i.test(desc);
                const isShortAllCaps = desc.length <= 80 && desc.length >= 3 && desc === desc.toUpperCase() && !desc.endsWith('.') && !desc.includes(':') && !desc.includes('/');

                const isLikelySection = (isRoundLetter || isSectionKeyword || isShortAllCaps) &&
                                        !descLower.startsWith('providing') && 
                                        !descLower.startsWith('supplying') && 
                                        !descLower.startsWith('supply of') && 
                                        !descLower.startsWith('extra for');

                if (isLikelySection) {
                    currentSection = desc;
                    currentParent = null;
                    if (!BOQ_SECTIONS.includes(currentSection)) {
                        BOQ_SECTIONS.push(currentSection);
                    }
                    return;
                }
            }

            // 3. Parent Specification Item (e.g. L24 with no rate/qty that introduces sub-items a, b, c)
            const isSubItem = /^[a-z]\)$|^\([a-z]\)$|^\([0-9]+\)$|^[ivx]+\)$/i.test(itemNo);
            if (!isNumericQty && rateValue === 0 && amountValue === 0 && itemNo && !isSubItem) {
                currentParent = { itemNo, desc };
                return;
            }

            // 4. Continuation Row Merging (Handles multi-line descriptions from CPWD / PWD sheets)
            const isContinuation = !itemNo && !isNumericQty && rateValue === 0 && amountValue === 0 && BOQ_DATA.length > 0;
            if (isContinuation && desc) {
                const prev = BOQ_DATA[BOQ_DATA.length - 1];
                prev.description += " " + desc;
                prev.shortDescription = prev.description.length > 180 ? prev.description.substring(0, 180) + '...' : prev.description;
                return;
            }

            // Include row if description exists
            if (!desc) return;

            let displayItemNo = itemNo;
            let displayDesc = desc;

            if (isSubItem && currentParent) {
                displayItemNo = currentParent.itemNo + ' ' + itemNo;
                displayDesc = currentParent.desc + ' ' + desc;
            } else if (rateValue > 0 || isNumericQty) {
                currentParent = null;
            }

            const unitVal = (indices.unit >= 0 ? row[indices.unit] : '')?.toString().trim() || '-';

            BOQ_DATA.push({
                idx: idx,
                id: idx,
                itemNo: displayItemNo,
                description: displayDesc,
                shortDescription: displayDesc.length > 180 ? displayDesc.substring(0, 180) + '...' : displayDesc,
                unit: unitVal || '-',
                qty: isNaN(qtyValue) ? '' : qtyValue,
                rate: rateValue,
                amount: amountValue,
                section: currentSection,
                color: SECTION_COLORS[BOQ_SECTIONS.indexOf(currentSection) % SECTION_COLORS.length] || SECTION_COLORS[0]
            });
        });

        if (BOQ_SECTIONS.length === 0) BOQ_SECTIONS.push('Standard Items');

        loadingOverlay.style.display = 'none';
        showDashboard();
    }

    function showDashboard() {
        uploadArea.style.display = 'none';
        guidanceSection.style.display = 'none';
        activeElements.forEach(el => el.style.display = 'flex');
        boqDashboard.style.display = 'block';

        // Filter population
        sectionFilter.innerHTML = '<option value="">All Sections</option>' +
            BOQ_SECTIONS.map(s => `<option value="${s}">${s}</option>`).join('');

        renderStats();
        updateGridLayout();
        update();

        if (window.trackEvent) {
            const totalAmount = BOQ_DATA.reduce((sum, item) => sum + (item.amount || 0), 0);
            window.trackEvent('boq_parse_success', {
                file_name: fileName || '',
                item_count: BOQ_DATA.length,
                total_amount: Math.round(totalAmount),
                sections_count: BOQ_SECTIONS.length
            });
        }
    }

    function renderStats() {
        const totalAmount = BOQ_DATA.reduce((sum, item) => sum + item.amount, 0);
        const uniqueSections = BOQ_SECTIONS.length;

        statsEl.innerHTML = `
            <div class="gsr-stat">
                <i class="fas fa-list-ol"></i>
                <div><strong>${BOQ_DATA.length.toLocaleString('en-IN')}</strong><span>Total Items</span></div>
            </div>
            <div class="gsr-stat">
                <i class="fas fa-layer-group"></i>
                <div><strong>${uniqueSections}</strong><span>Estimated Sections</span></div>
            </div>
            <div class="gsr-stat">
                <i class="fas fa-rupee-sign" style="color: #2ECC71;"></i>
                <div><strong style="color: #2ECC71;">${formatTotalValue(totalAmount)}</strong><span>Total Value</span></div>
            </div>
        `;
    }

    function update() {
        currentPage = 1;
        const items = getFilteredItems();
        renderGrid(items);
        clearSearchBtn.style.display = searchInput.value ? 'flex' : 'none';
    }

    function getFilteredItems() {
        const search = searchInput.value.toLowerCase().trim();
        const section = sectionFilter.value;
        const sortBy = sortSelect.value;

        let filtered = BOQ_DATA.filter(item => {
            const matchesSection = !section || item.section === section;
            if (!matchesSection) return false;

            const matchesSearch = !search ||
                item.description.toLowerCase().includes(search) ||
                item.itemNo.toString().toLowerCase().includes(search);

            return matchesSearch;
        });

        if (sortBy === 'rate-asc') filtered.sort((a, b) => a.rate - b.rate);
        else if (sortBy === 'rate-desc') filtered.sort((a, b) => b.rate - a.rate);
        else if (sortBy === 'amount-desc') filtered.sort((a, b) => b.amount - a.amount);

        return filtered;
    }

    function renderGrid(allItems) {
        grid.innerHTML = '';
        if (allItems.length === 0) {
            noResults.style.display = 'flex';
            resultCount.textContent = '0';
            return;
        }
        noResults.style.display = 'none';
        resultCount.textContent = allItems.length.toLocaleString('en-IN');

        const itemsToShow = allItems.slice(0, currentPage * ITEMS_PER_PAGE);

        itemsToShow.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'gsr-card';
            if (index >= (currentPage - 1) * ITEMS_PER_PAGE) {
                card.style.animationDelay = `${(index % ITEMS_PER_PAGE) * 0.03}s`;
            } else {
                card.style.opacity = '1';
            }

            const chColor = item.color || '#666';
            const displaySection = item.section.length > 25 ? item.section.substring(0, 25) + '...' : item.section;
            const displayItemNo = (item.itemNo && item.itemNo.length <= 15) ? item.itemNo : (item.idx + 1);
            const hasQty = item.qty !== '' && item.qty !== null && !isNaN(item.qty);
            const displayQty = hasQty ? (typeof item.qty === 'number' ? item.qty.toLocaleString('en-IN') : item.qty) : '';

            // Escaped attributes & content to eliminate XSS risks
            card.innerHTML = `
                <div class="gsr-card-top" style="border-left: 4px solid ${escapeHTML(chColor)};">
                    <span class="gsr-card-badge" style="background-color: ${escapeHTML(chColor)};" title="${escapeHTML(item.section)}">${escapeHTML(displaySection.toUpperCase())}</span>
                    <span class="gsr-card-code">${escapeHTML(displayItemNo)}</span>
                </div>
                <p class="gsr-card-desc">${escapeHTML(item.shortDescription)}</p>
                <div class="gsr-card-bottom" style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <div class="gsr-card-rate">
                            <span class="gsr-rate-value">₹${Math.round(item.rate).toLocaleString('en-IN')}</span>
                            <span class="gsr-rate-unit">${escapeHTML(item.unit || '-')}</span>
                        </div>
                        <div class="gsr-card-rate" style="padding-left: 15px; border-left: 1px solid #eee; ${hasQty ? '' : 'display:none;'}">
                            <span class="gsr-rate-value" style="color: #666; font-size: 1.1em;">${escapeHTML(displayQty)}</span>
                            <span class="gsr-rate-unit">Qty</span>
                        </div>
                        <div class="gsr-card-rate" style="padding-left: 15px; border-left: 1px solid #eee; ${item.amount > 0 ? '' : 'display:none;'}">
                            <span class="gsr-rate-value" style="color: #27ae60; font-size: 1.1em;">₹${Math.round(item.amount).toLocaleString('en-IN')}</span>
                            <span class="gsr-rate-unit">Total</span>
                        </div>
                    </div>
                    <span class="gsr-source-tag" style="background-color: rgba(0, 119, 182, 0.08); color: #0077B6; border: 1px solid rgba(0, 119, 182, 0.2); white-space: nowrap; margin-left: 10px;">
                        <i class="fas fa-file-excel"></i> BOQ
                    </span>
                </div>
            `;

            card.addEventListener('click', () => openModal(item));
            grid.appendChild(card);
        });

        // Load More button logic same as GSR
        if (itemsToShow.length < allItems.length) {
            const btWrapper = document.createElement('div');
            btWrapper.className = 'gsr-load-more-wrapper';
            btWrapper.innerHTML = `<button class="gsr-load-more-btn"><i class="fas fa-chevron-down"></i> Load More</button>`;
            btWrapper.querySelector('button').addEventListener('click', () => {
                currentPage++;
                renderGrid(allItems);
            });
            grid.appendChild(btWrapper);
        }
    }

    function openModal(item) {
        currentModalItem = item;
        document.getElementById('boqModalBadge').textContent = item.section;
        document.getElementById('boqModalBadge').style.backgroundColor = item.color;
        document.getElementById('boqModalCode').textContent = `Item No: ${item.itemNo || (item.idx + 1)}`;
        document.getElementById('boqModalTitle').textContent = `Specification Detail`;
        document.getElementById('boqModalDescription').textContent = item.description;
        document.getElementById('boqModalRate').textContent = `₹${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
        document.getElementById('boqModalUnit').textContent = item.unit || '-';
        
        const hasQty = item.qty !== '' && item.qty !== null && !isNaN(item.qty);
        document.getElementById('boqModalQty').textContent = hasQty 
            ? (typeof item.qty === 'number' ? item.qty.toLocaleString('en-IN') : item.qty) 
            : '-';
            
        document.getElementById('boqModalAmount').textContent = `₹${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

        modal.classList.add('active');
        modal.querySelector('.gsr-modal').scrollTop = 0;
        document.body.style.overflow = 'hidden';

        if (window.trackEvent) {
            window.trackEvent('boq_item_preview', {
                item_code: String(item.itemNo || (item.idx + 1)),
                section: item.section || '',
                rate: item.rate,
                amount: item.amount
            });
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ── Export Item as Excel (.xlsx) ──
    function downloadItemExcel(item) {
        if (!item) return;
        try {
            const wb = XLSX.utils.book_new();
            const itemCode = item.itemNo || (item.idx + 1);
            const qtyVal = (item.qty !== '' && item.qty !== null && !isNaN(item.qty)) ? item.qty : '-';

            const rows = [
                ["Construction Hub - BOQ Item Specification"],
                ["Source File", fileName || "BOQ Project"],
                ["Generated Date", new Date().toLocaleString('en-IN')],
                [],
                ["Field", "Value"],
                ["Item No", itemCode],
                ["Section", item.section],
                ["Description", item.description],
                ["Unit", item.unit || '-'],
                ["Quantity", qtyVal],
                ["Rate (Rs.)", item.rate],
                ["Total Amount (Rs.)", item.amount]
            ];

            const ws = XLSX.utils.aoa_to_sheet(rows);
            ws['!cols'] = [{ wch: 22 }, { wch: 75 }];
            XLSX.utils.book_append_sheet(wb, ws, "BOQ Item");

            const safeCode = String(itemCode).replace(/[^a-zA-Z0-9_-]/g, '_');
            XLSX.writeFile(wb, `BOQ_Item_${safeCode}.xlsx`);

            if (window.trackEvent) {
                window.trackEvent('boq_item_download', {
                    format: 'excel',
                    item_code: String(itemCode),
                    rate: item.rate
                });
            }
        } catch (err) {
            console.error("Excel download error:", err);
            alert("Could not export Excel file: " + err.message);
        }
    }

    // ── Export Item as PDF (.pdf) ──
    function downloadItemPdf(item) {
        if (!item) return;
        try {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert("PDF library is loading. Please try again in a moment.");
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const itemCode = item.itemNo || (item.idx + 1);
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 16;
            let y = 18;

            // Header Banner
            doc.setFillColor(42, 77, 59); // Theme green
            doc.rect(margin, y, pageWidth - (margin * 2), 22, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            doc.text("CONSTRUCTION HUB - BOQ ITEM SPECIFICATION", margin + 6, y + 9);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            doc.text(`File: ${fileName || 'BOQ Document'}   |   Exported: ${new Date().toLocaleDateString('en-IN')}`, margin + 6, y + 16);

            y += 30;

            // Section & Code Bar
            doc.setTextColor(50, 50, 50);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.text(`Item No: ${itemCode}`, margin, y);

            const displaySec = item.section.length > 40 ? item.section.substring(0, 40) + '...' : item.section;
            doc.text(`Section: ${displaySec}`, pageWidth - margin, y, { align: 'right' });

            y += 4;
            doc.setDrawColor(210, 215, 220);
            doc.line(margin, y, pageWidth - margin, y);
            y += 8;

            // Description Heading
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(30, 30, 30);
            doc.text("Specification / Item Details:", margin, y);
            y += 6;

            // Description Body
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(60, 60, 60);
            const maxDescWidth = pageWidth - (margin * 2);
            const splitDesc = doc.splitTextToSize(item.description, maxDescWidth);
            doc.text(splitDesc, margin, y);
            y += (splitDesc.length * 4.8) + 8;

            // Details Table Box
            doc.setFillColor(248, 250, 252);
            doc.setDrawColor(220, 225, 230);
            doc.roundedRect(margin, y, pageWidth - (margin * 2), 34, 3, 3, 'FD');

            const colWidth = (pageWidth - (margin * 2)) / 4;
            const boxY = y + 9;

            // 1. Unit
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            doc.text("UNIT", margin + 6, boxY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(40, 40, 40);
            doc.text(String(item.unit || '-'), margin + 6, boxY + 7);

            // 2. Quantity
            const qtyText = (item.qty !== '' && item.qty !== null && !isNaN(item.qty))
                ? (typeof item.qty === 'number' ? item.qty.toLocaleString('en-IN') : String(item.qty))
                : '-';
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            doc.text("QUANTITY", margin + colWidth + 4, boxY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(40, 40, 40);
            doc.text(qtyText, margin + colWidth + 4, boxY + 7);

            // 3. Rate
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(110, 110, 110);
            doc.text("RATE", margin + (colWidth * 2) + 4, boxY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10.5);
            doc.setTextColor(40, 40, 40);
            doc.text(`Rs. ${item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + (colWidth * 2) + 4, boxY + 7);

            // 4. Total Amount
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            doc.setTextColor(39, 174, 96);
            doc.text("TOTAL AMOUNT", margin + (colWidth * 3) + 4, boxY);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(39, 174, 96);
            doc.text(`Rs. ${item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, margin + (colWidth * 3) + 4, boxY + 7);

            // Footer note
            doc.setDrawColor(230, 230, 230);
            doc.line(margin, 280, pageWidth - margin, 280);
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(8);
            doc.setTextColor(140, 140, 140);
            doc.text("Generated via Construction Hub BOQ Viewer. Extract for reference purposes.", margin, 285);

            const safeCode = String(itemCode).replace(/[^a-zA-Z0-9_-]/g, '_');
            doc.save(`BOQ_Item_${safeCode}.pdf`);

            if (window.trackEvent) {
                window.trackEvent('boq_item_download', {
                    format: 'pdf',
                    item_code: String(itemCode),
                    rate: item.rate
                });
            }
        } catch (err) {
            console.error("PDF download error:", err);
            alert("Could not export PDF: " + err.message);
        }
    }

    // Modal Buttons Listeners
    modalClose.addEventListener('click', closeModal);
    modalCloseBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    if (downloadExcelBtn) {
        downloadExcelBtn.addEventListener('click', () => {
            if (currentModalItem) downloadItemExcel(currentModalItem);
        });
    }

    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', () => {
            if (currentModalItem) downloadItemPdf(currentModalItem);
        });
    }

    // Keyboard accessibility: Escape to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Clear search button handler
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            update();
            searchInput.focus();
        });
    }

    let boqSearchAnalyticsTimer;
    // Debounced search for smooth typing with large BOQ sheets
    searchInput.addEventListener('input', () => {
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
            update();
        }, 150);

        clearTimeout(boqSearchAnalyticsTimer);
        boqSearchAnalyticsTimer = setTimeout(() => {
            const term = searchInput.value.trim();
            if (term && window.trackEvent) {
                window.trackEvent('boq_search', {
                    search_term: term
                });
            }
        }, 800);
    });

    sectionFilter.addEventListener('change', () => {
        update();
        if (sectionFilter.value && window.trackEvent) {
            window.trackEvent('boq_section_filter', {
                section_name: sectionFilter.value
            });
        }
    });

    columnFilter.addEventListener('change', updateGridLayout);
    sortSelect.addEventListener('change', update);

    function updateGridLayout() {
        const val = columnFilter.value;
        // Clear previous classes first
        grid.classList.remove('grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6');

        if (val !== 'auto') {
            grid.classList.add(`grid-cols-${val}`);
        }
    }

    // ── Column Mapper Listeners ──
    if (toggleColMapperBtn && colMapperPanel) {
        toggleColMapperBtn.addEventListener('click', () => {
            const isHidden = colMapperPanel.style.display === 'none' || !colMapperPanel.style.display;
            colMapperPanel.style.display = isHidden ? 'block' : 'none';
            if (isHidden && window.trackEvent) {
                window.trackEvent('boq_column_mapper', { action: 'opened' });
            }
        });
    }

    if (cancelColMapBtn && colMapperPanel) {
        cancelColMapBtn.addEventListener('click', () => {
            colMapperPanel.style.display = 'none';
        });
    }

    if (applyColMapBtn && colMapperPanel) {
        applyColMapBtn.addEventListener('click', () => {
            if (!currentRawRows || currentRawRows.length === 0) {
                alert("No BOQ data loaded.");
                return;
            }
            const manualIndices = {
                no: parseInt(mapColNo.value, 10),
                description: parseInt(mapColDesc.value, 10),
                unit: parseInt(mapColUnit.value, 10),
                qty: parseInt(mapColQty.value, 10),
                rate: parseInt(mapColRate.value, 10),
                amount: parseInt(mapColAmount.value, 10)
            };

            if (manualIndices.description === -1) {
                alert("Please select at least a Description column.");
                return;
            }

            if (window.trackEvent) {
                window.trackEvent('boq_column_mapper', { action: 'applied' });
            }

            loadingOverlay.style.display = 'flex';
            setTimeout(() => {
                processBOQRows(currentRawRows, manualIndices);
                colMapperPanel.style.display = 'none';
            }, 50);
        });
    }
});
