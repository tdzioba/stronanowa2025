// wyniki.js

// 1. Dane Przykładowe (Sample Data) - używane gdy nie ma nic w pamięci
const sampleData = [
    { miejsce: 1, nr: 104, imie: "Adam Kowalski", kategoria: "M-Student", uczelnia: "Politechnika", czas: "16:45" },
    { miejsce: 2, nr: 22, imie: "Anna Nowak", kategoria: "K-Student", uczelnia: "Uniwersytet", czas: "17:10" },
    { miejsce: 3, nr: 305, imie: "Piotr Wiśniewski", kategoria: "M-Kadra", uczelnia: "AWF", czas: "17:30" },
    { miejsce: 4, nr: 11, imie: "Katarzyna Wójcik", kategoria: "K-Student", uczelnia: "Politechnika", czas: "18:05" },
    { miejsce: 5, nr: 56, imie: "Michał Lewandowski", kategoria: "M-Student", uczelnia: "Medyczny", czas: "18:45" },
];

// Klucz do LocalStorage
const STORAGE_KEY = 'studentRun_results_v1';

let currentData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
});

function loadData() {
    // Sprawdź czy mamy coś w pamięci przeglądarki
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        currentData = JSON.parse(stored);
        console.log("Załadowano dane z pamięci lokalnej");
    } else {
        currentData = [...sampleData]; // Kopia sample data
        console.log("Załadowano dane przykładowe");
    }

    renderTable(currentData);
    updateStats(currentData);
}

function renderTable(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = ''; // Wyczyść tabelę

    if(data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Brak wyników do wyświetlenia</td></tr>';
        return;
    }

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        // Logika dla medali (1, 2, 3 miejsce)
        let rankHtml = row.miejsce;
        if(row.miejsce == 1) rankHtml = `<span class="rank-badge rank-1">1</span>`;
        if(row.miejsce == 2) rankHtml = `<span class="rank-badge rank-2">2</span>`;
        if(row.miejsce == 3) rankHtml = `<span class="rank-badge rank-3">3</span>`;

        tr.innerHTML = `
            <td>${rankHtml}</td>
            <td>#${row.nr}</td>
            <td style="font-weight:600;">${row.imie || row.Imie || 'Brak danych'}</td>
            <td><span style="background:#eff6ff; color:#2563eb; padding:4px 8px; border-radius:10px; font-size:0.8rem;">${row.kategoria}</span></td>
            <td>${row.uczelnia || '-'}</td>
            <td class="time-cell">${row.czas}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats(data) {
    const totalEl = document.getElementById('totalRunners');
    const bestEl = document.getElementById('bestTime');
    const avgEl = document.getElementById('avgTime');

    totalEl.innerText = data.length;

    if(data.length > 0) {
        // Zakładamy, że dane są posortowane po miejscu, więc pierwszy to najlepszy
        // Sortowanie dla pewności
        const sorted = [...data].sort((a, b) => a.miejsce - b.miejsce);
        bestEl.innerText = sorted[0].czas;
        
        // Tu można by dodać logikę obliczania średniej, jeśli format czasu jest spójny
        // Dla uproszczenia wstawiamy statyczny tekst lub prostą logikę
        avgEl.innerText = "~ 22:00"; 
    } else {
        bestEl.innerText = "--:--";
    }
}

function setupEventListeners() {
    // Import Excela
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileUpload);

    // Wyszukiwarka
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = currentData.filter(row => 
            (row.imie && row.imie.toLowerCase().includes(term)) ||
            (row.nr && row.nr.toString().includes(term)) ||
            (row.uczelnia && row.uczelnia.toLowerCase().includes(term))
        );
        renderTable(filtered);
    });
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        // Pobieramy pierwszy arkusz
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Konwersja do JSON
        // Oczekujemy nagłówków w Excelu (np. "miejsce", "imie", "czas" - case insensitive w kodzie poniżej)
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Mapowanie kluczy (Excel może mieć "Miejsce", "NR", "Czas" z dużej litery)
        // Normalizujemy dane do naszej struktury
        const normalizedData = jsonData.map((row, index) => ({
            miejsce: row['Miejsce'] || row['miejsce'] || index + 1,
            nr: row['Nr'] || row['NR'] || row['nr'] || 0,
            imie: row['Imie'] || row['Imie i Nazwisko'] || row['imie'] || 'Nieznany',
            kategoria: row['Kategoria'] || row['kat'] || 'Open',
            uczelnia: row['Uczelnia'] || row['Klub'] || '-',
            czas: row['Czas'] || row['Wynik'] || 'DNF'
        }));

        currentData = normalizedData;
        
        // Zapisz do LocalStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentData));
        
        renderTable(currentData);
        updateStats(currentData);
        alert('Zaimportowano pomyślnie! Dane zapisane w przeglądarce.');
    };

    reader.readAsArrayBuffer(file);
}

// Funkcja resetująca do sample data
window.resetData = function() {
    if(confirm("Czy na pewno chcesz przywrócić dane przykładowe?")) {
        localStorage.removeItem(STORAGE_KEY);
        currentData = [...sampleData];
        renderTable(currentData);
        updateStats(currentData);
        document.getElementById('fileInput').value = ''; // Reset inputa
    }
}