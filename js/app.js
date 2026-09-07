document.addEventListener('DOMContentLoaded', function() {
    // --- DATA: Documents ---
    // IMPORTANT:
    // - Replace placeholder data with your actual document details.
    // - Ensure 'filename' points to the correct path within your 'docs/' folder.
    // - Use 'null' for 'year' if not applicable.
    const documentData = [
        // Goa SOR Examples
        { id: 1, title: 'Goa PWD GSR - Civil Works 2023', year: 2023, category: 'Civil', documentType: 'GSR', filename: 'docs/building_gsr_2023.docx', keywords: 'goa schedule rates building, gsr 2023, gsr , 2023', description: 'Comprehensive schedule for civil engineering projects, PWD Goa.' },
        { id: 2, title: 'Goa PWD GSR - Electrical Works 2023', year: 2023, category: 'Electrical', documentType: 'GSR', filename: 'docs/electrical_gsr_2023.docx', keywords: 'pwd schedule rates electrical, , gsr 2023 electrical , gsr , 2023', description: 'Detailed rates for electrical installations and maintenance.' },
        { id: 3, title: 'Goa PWD GSR - Rods and Bridge 2023', year: 2023, category: 'Roads & Bridge', documentType: 'GSR', filename: 'docs/roads_bridgs_part_1_part_11_2023.docx', keywords: 'pwd schedule rates Roads & Bridge, , gsr 2023 Roads , gsr roads 2023 , 2023', description: 'Detailed rates for Roads Part-i and Bridges Part 1.' },
        { id: 4, title: 'Goa PWD GSR - PHE Works 2023', year: 2023, category: 'Plumbing', documentType: 'GSR', filename: 'docs/phe_gsr_2023.docx', keywords: 'pwd schedule rates PHE works, , gsr 2023 Roads , gsr PHE 2023 , 2023', description: 'Detailed rates for PHE Works.' },

        // rules    https://drive.google.com/file/d/1JzMcCSNa_QfoAbnVYLFrolbJXNpVWthg/view?usp=sharing
        { id: 5, title: 'National Building Code 2016', year: 2016, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'https://drive.google.com/file/d/1MfcPoA1ZNN9DXTJxjMPPxblVILH1KRYp/view?usp=sharing', keywords: 'NBC, National building code, national building code 2016,NBC 2025,national building code 2025, ', description: 'National building code 2016 Part - 1.' },
        { id: 6, title: 'Plinth Area Rates 2023', year: 2023, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'https://drive.google.com/file/d/1i_95bCGfaycAtGSYaf2_9cSGqgXrkSjb/view?usp=sharing', keywords: 'Plinth Area Rates 2023, Plinth Area Rates 2025, ', description: 'Plinth Area Rates 2023.' },
        { id: 7, title: 'Goa Building Regulations 2018', year: 2023, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'docs/goa-building-construction-regulations-2010.pdf', keywords: 'Plinth Area Rates 2023, Plinth Area Rates 2025, ', description: 'The Goa Building Construction Regulations Amendments up to 2018.' },
        { id: 8, title: 'IS 456 Plain and Reinforced Concrete', year: 2023, category: 'IS Codes', documentType: 'IS Codes', filename: 'https://drive.google.com/file/d/1xVWhEFk9I5gficTdbBYWRq-er7qlRXUF/view?usp=sharing', keywords: 'Is 456 plain and reinforced concrete pdf,Is 456 plain and reinforced concrete code, ', description: 'Is 456 plain and reinforced concrete code.' },
        { id: 9, title: 'CPWD Works Manual 2024', year: 2024, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'https://drive.google.com/file/d/1JzMcCSNa_QfoAbnVYLFrolbJXNpVWthg/view?usp=sharing', keywords: 'Cpwd works manual 2024 pdf  ', description: 'Cpwd works manual 2024 pdf free download.' },
        { id: 10, title: 'Rate Analysis CPWD vol 1', year: 2021, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'https://drive.google.com/file/d/10JBa99Pf1gtD8EUDXZe56O9OYYB2Bys_/view?usp=sharing', keywords: 'Rate Analysis cpwd vol 1', description: 'Rate Analysis cpwd vol 1.' },
        { id: 11, title: 'Rate Analysis CPWD vol 2', year: 2021, category: 'Rules & Regulations', documentType: 'Rules & Regulations', filename: 'https://drive.google.com/file/d/1DKd6K7G3fTEQKIw_3iu-yrbzO7BW3t8p/view?usp=sharing', keywords: 'Rate Analysis cpwd vol 2', description: 'Rate Analysis cpwd vol 2.' },
        
        
        //gsr 

        { id: 12, title: 'Goa PWD GSR - Civil Works 2014', year: 2014, category: 'Civil', documentType: 'GSR', filename: 'docs/gsr_2014_road_gst.xls', keywords: 'gsr 2014', description: 'Comprehensive schedule for civil engineering projects, PWD Goa.' },

          { id: 13, title: 'Goa PWD GSR - Civil Works 2015', year: 2015, category: 'Civil', documentType: 'GSR', filename: 'docs/gsr_2015_building.docx', keywords: 'gsr 2015', description: 'Comprehensive schedule for civil engineering projects, PWD Goa.' },
          { id: 14, title: 'Goa PWD GSR - Civil Works 2015', year: 2015, category: 'Civil', documentType: 'GSR', filename: 'docs/gsr_2015_building_detail.rar', keywords: 'gsr 2015', description: 'Detail Rate Analysis for GSR 2015, PWD Goa.' },
        
        { id: 15, title: 'Goa PWD GSR - Civil Works 2025', year: 2025, category: 'Civil', documentType: 'GSR', filename: 'docs/gsr_2025_update.txt', keywords: 'gsr 2025', description: 'Detail Rate Analysis for GSR 2025, PWD Goa.' }

      /*  // Goa Building Rules Examples   roads_bridgs_part_1_part_11_2023  phe_gsr_2023   

       
*/
    ];

    const documentTableEl = document.getElementById('documentTable');
    const searchInputEl = document.getElementById('searchInput');
    const docTypeFilterEl = document.getElementById('docTypeFilter');
    const yearFilterEl = document.getElementById('yearFilter');
    const categoryFilterEl = document.getElementById('categoryFilter');
    const noResultsMessageEl = document.querySelector('.no-results');
    const currentYearSpanEl = document.getElementById('currentYear');

    // --- Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const primaryNav = document.getElementById('primary-navigation');

    if (navToggle && primaryNav) {
        navToggle.addEventListener('click', () => {
            const isNavActive = primaryNav.classList.toggle('nav-active');
            navToggle.setAttribute('aria-expanded', isNavActive);
        });
    }

    // --- Footer Year & Initializations for Homepage ---
    if (currentYearSpanEl) {
        currentYearSpanEl.textContent = new Date().getFullYear();
    }

    function populateFilter(filterElement, dataKey, allText) {
        if (!filterElement) return;

        const uniqueValues = [...new Set(
            documentData
                .map(item => item[dataKey])
                .filter(value => value != null && value !== '') // Filter out null, undefined, or empty strings
        )].sort((a, b) => {
            // Sort years numerically in descending order, others alphabetically
            if (dataKey === 'year') return b - a;
            return String(a).localeCompare(String(b));
        });

        const defaultOptionText = filterElement.options[0] ? filterElement.options[0].textContent : `All ${allText}`;
        filterElement.innerHTML = `<option value="">${defaultOptionText}</option>`; // Reset with default

        uniqueValues.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            filterElement.appendChild(option);
        });
    }

    function displayDocuments(itemsToDisplay) {
        if (!documentTableEl) return;

        documentTableEl.innerHTML = ''; // Clear existing items
        if (noResultsMessageEl) noResultsMessageEl.style.display = 'none';

        if (itemsToDisplay.length === 0) {
            if (noResultsMessageEl) {
                noResultsMessageEl.style.display = 'block';
                // Trigger reflow for animation restart
                noResultsMessageEl.style.animation = 'none';
                noResultsMessageEl.offsetHeight; /* trigger reflow */
                noResultsMessageEl.style.animation = null;
            }
            return;
        }

        itemsToDisplay.forEach((item) => {
            const docItemDiv = document.createElement('div');
            // Use a consistent class name for styling the items, e.g., 'document-item'
            // This class is already defined in the CSS.
            docItemDiv.classList.add('document-item');

            docItemDiv.innerHTML = `
                <div class="document-item-info">
                    <h3>${item.title}</h3>
                    <p class="document-item-meta">
                        ${item.year ? `<span><i class="fas fa-calendar-alt"></i><strong>Year:</strong> ${item.year}</span>` : ''}
                        <span><i class="fas fa-folder-open"></i><strong>Type:</strong> ${item.documentType}</span>
                        <span><i class="fas fa-tags"></i><strong>Category:</strong> ${item.category}</span>
                    </p>
                    ${item.description ? `<p class="document-item-description">${item.description}</p>` : ''}
                </div>
                <a href="${item.filename}" class="download-button" download>
                    <i class="fas fa-download"></i> Download
                </a>
            `;

            // Track document download click
            const downloadLink = docItemDiv.querySelector('.download-button');
            if (downloadLink) {
                downloadLink.addEventListener('click', () => {
                    if (window.trackEvent) {
                        window.trackEvent('home_doc_download', {
                            doc_title: item.title,
                            doc_year: item.year || 'N/A',
                            doc_type: item.documentType,
                            doc_category: item.category,
                            filename: item.filename
                        });
                    }
                });
            }

            documentTableEl.appendChild(docItemDiv);
            // Trigger reflow for animation restart on each item
            docItemDiv.style.animation = 'none';
            docItemDiv.offsetHeight; /* trigger reflow */
            docItemDiv.style.animation = null;
        });
    }

    let searchAnalyticsTimer = null;

    function filterAndSearchDocuments() {
        if (!documentTableEl) return; // Only run if on homepage

        const searchTerm = searchInputEl.value.toLowerCase().trim();
        const selectedDocType = docTypeFilterEl.value;
        const selectedYear = yearFilterEl.value;
        const selectedCategory = categoryFilterEl.value;

        const filteredDocs = documentData.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(searchTerm);
            const keywordMatch = item.keywords && item.keywords.toLowerCase().includes(searchTerm);
            const descriptionMatch = item.description && item.description.toLowerCase().includes(searchTerm);
            const yearSearchMatch = item.year && item.year.toString().includes(searchTerm);
            const docTypeSearchMatch = item.documentType.toLowerCase().includes(searchTerm);
            const categorySearchMatch = item.category.toLowerCase().includes(searchTerm);


            const matchesSearch = searchTerm === '' || titleMatch || keywordMatch || descriptionMatch || yearSearchMatch || docTypeSearchMatch || categorySearchMatch;
            const matchesDocType = selectedDocType === '' || item.documentType === selectedDocType;
            const matchesYear = selectedYear === '' || (item.year && item.year.toString() === selectedYear);
            const matchesCategory = selectedCategory === '' || item.category === selectedCategory;

            return matchesSearch && matchesDocType && matchesYear && matchesCategory;
        });

        displayDocuments(filteredDocs);
    }

    // --- Event Listeners & Initial Load for Homepage Functionality ---
    if (document.getElementById('documentTable')) { // Check if we are on a page with the document table
        if (searchInputEl) {
            searchInputEl.addEventListener('input', () => {
                filterAndSearchDocuments();
                // Debounce search event tracking
                clearTimeout(searchAnalyticsTimer);
                searchAnalyticsTimer = setTimeout(() => {
                    const term = searchInputEl.value.trim();
                    if (term && window.trackEvent) {
                        window.trackEvent('home_doc_search', {
                            search_term: term
                        });
                    }
                }, 600);
            });
        }

        if (docTypeFilterEl) {
            docTypeFilterEl.addEventListener('change', () => {
                filterAndSearchDocuments();
                if (docTypeFilterEl.value && window.trackEvent) {
                    window.trackEvent('home_doc_filter', {
                        filter_type: 'documentType',
                        filter_value: docTypeFilterEl.value
                    });
                }
            });
        }

        if (yearFilterEl) {
            yearFilterEl.addEventListener('change', () => {
                filterAndSearchDocuments();
                if (yearFilterEl.value && window.trackEvent) {
                    window.trackEvent('home_doc_filter', {
                        filter_type: 'year',
                        filter_value: yearFilterEl.value
                    });
                }
            });
        }

        if (categoryFilterEl) {
            categoryFilterEl.addEventListener('change', () => {
                filterAndSearchDocuments();
                if (categoryFilterEl.value && window.trackEvent) {
                    window.trackEvent('home_doc_filter', {
                        filter_type: 'category',
                        filter_value: categoryFilterEl.value
                    });
                }
            });
        }

        populateFilter(docTypeFilterEl, 'documentType', 'Types');
        populateFilter(yearFilterEl, 'year', 'Years');
        displayDocuments(documentData); // Display all documents initially
    }
});
