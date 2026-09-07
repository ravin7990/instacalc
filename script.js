// Sample data - replace with your actual documents
const documents = [
    { year: '2023', category: 'civil', title: 'Goa SOR Civil Works 2023', type: 'PDF', size: '4.2 MB', link: 'docs/2023_civil.pdf' },
    { year: '2023', category: 'electrical', title: 'Goa SOR Electrical Works 2023', type: 'PDF', size: '3.8 MB', link: 'docs/2023_electrical.pdf' },
    { year: '2023', category: 'sewage', title: 'Goa SOR Sewage Works 2023', type: 'PDF', size: '2.9 MB', link: 'docs/2023_sewage.pdf' },
    { year: '2022', category: 'civil', title: 'Goa SOR Civil Works 2022', type: 'PDF', size: '4.0 MB', link: 'docs/2022_civil.pdf' },
    { year: '2022', category: 'electrical', title: 'Goa SOR Electrical Works 2022', type: 'PDF', size: '3.6 MB', link: 'docs/2022_electrical.pdf' },
    { year: '2021', category: 'civil', title: 'Goa SOR Civil Works 2021', type: 'PDF', size: '3.9 MB', link: 'docs/2021_civil.pdf' },
    { year: '2025', category: 'civil', title: 'Goa SOR Civil Works 2025', type: 'PDF', size: '3.9 MB', link: '' },
    { year: '2014', category: 'civil', title: 'Goa SOR Civil Works 2014', type: 'xls', size: '3.9 MB', link: 'docs/gsr_2014_road_gst.xls' },
    { year: '2015', category: 'civil', title: 'Goa SOR Civil Works 2015', type: 'docx', size: '3.9 MB', link: 'docs/gsr_2015_building.docx' },
    { year: '2015', category: 'civil', title: 'Goa SOR Civil Works Detail 2015', type: 'rar', size: '3.9 MB', link: 'docs/gsr_2015_building_detail.rar' },
     { year: '2025', category: 'civil', title: 'Goa SOR Civil Works Detail 2025', type: 'txt', size: '3.9 MB', link: 'docs/gsr_2025_update.txt' },
     { year: '2016', category: 'Fire', title: 'Part 4 Fire And Safety', type: 'PDF', size: '88 MB', link: 'https://mptownplan.gov.in/act%20&%20Rules/NationalBuilding%20Code%20Part-IV%20(Fire%20Safety).pdf' }
];

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    const yearSelect = document.getElementById('year-select');
    const categorySelect = document.getElementById('category-select');
    const resetBtn = document.getElementById('reset-btn');
    const resultsTable = document.getElementById('results-table');
    const resultCount = document.getElementById('result-count');

    // Initial load - show all documents
    filterAndDisplayDocuments();

    // Event listeners for filtering
    searchInput.addEventListener('input', filterAndDisplayDocuments);
    yearSelect.addEventListener('change', filterAndDisplayDocuments);
    categorySelect.addEventListener('change', filterAndDisplayDocuments);
    resetBtn.addEventListener('click', resetFilters);

    function filterAndDisplayDocuments() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedYear = yearSelect.value;
        const selectedCategory = categorySelect.value;

        const filteredDocs = documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm) || 
                                doc.category.toLowerCase().includes(searchTerm) ||
                                doc.year.includes(searchTerm);
            const matchesYear = selectedYear === 'all' || doc.year === selectedYear;
            const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
            
            return matchesSearch && matchesYear && matchesCategory;
        });

        displayDocuments(filteredDocs, searchTerm);
    }

    function displayDocuments(docs, searchTerm = '') {
        resultsTable.innerHTML = '';
        
        if (docs.length === 0) {
            resultsTable.innerHTML = '<tr><td colspan="6" class="text-center">No documents found matching your criteria.</td></tr>';
            resultCount.textContent = '0';
            return;
        }

        docs.forEach(doc => {
            const row = document.createElement('tr');
            
            // Highlight search term in title
            let displayTitle = doc.title;
            if (searchTerm) {
                const regex = new RegExp(searchTerm, 'gi');
                displayTitle = doc.title.replace(regex, match => 
                    `<span class="highlight">${match}</span>`);
            }
            
            row.innerHTML = `
                <td>${doc.year}</td>
                <td>${doc.category.charAt(0).toUpperCase() + doc.category.slice(1)}</td>
                <td>${displayTitle}</td>
                <td>${doc.type}</td>
                <td>${doc.size}</td>
                <td><a href="${doc.link}" class="download-btn" download>Download</a></td>
            `;
            
            resultsTable.appendChild(row);
        });

        resultCount.textContent = docs.length;
    }

    function resetFilters() {
        searchInput.value = '';
        yearSelect.value = 'all';
        categorySelect.value = 'all';
        filterAndDisplayDocuments();
    }

});








