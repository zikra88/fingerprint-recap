let daftarKaryawan = [];
let storedData = {};

document.addEventListener('DOMContentLoaded', function() {
    loadKaryawan();
    loadStoredData();
    renderKaryawan();
    updateTotalKaryawan();
    updateBulanNavigation();
    const currentBulan = document.getElementById('bulan').value;
    if (storedData[currentBulan]) {
        tampilkanRekap(storedData[currentBulan].data, storedData[currentBulan].tanggalList, currentBulan);
    }
});

function loadKaryawan() {
    const saved = localStorage.getItem('daftarKaryawan');
    if (saved) {
        daftarKaryawan = JSON.parse(saved);
    } else {
        daftarKaryawan = [
        ];
        saveKaryawan();
    }
}

function loadStoredData() {
    const saved = localStorage.getItem('fingerprintData');
    if (saved) {
        storedData = JSON.parse(saved);
    } else {
        storedData = {};
    }
}

function saveStoredData() {
    localStorage.setItem('fingerprintData', JSON.stringify(storedData));
    updateBulanNavigation();
}

function saveKaryawan() {
    localStorage.setItem('daftarKaryawan', JSON.stringify(daftarKaryawan));
    updateTotalKaryawan();
}

function updateTotalKaryawan() {
    document.getElementById('totalKaryawan').textContent = daftarKaryawan.length;
}

function renderKaryawan() {
    const grid = document.getElementById('karyawanList');
    grid.innerHTML = '';
    
    daftarKaryawan.sort((a, b) => a.kode - b.kode);
    
    daftarKaryawan.forEach(karyawan => {
        const card = document.createElement('div');
        card.className = 'karyawan-card';
        card.innerHTML = `
            <div class="karyawan-avatar">${karyawan.kode}</div>
            <div class="karyawan-info">
                <div class="karyawan-nama">${karyawan.nama}</div>
                <div class="karyawan-kode"><i class="fas fa-id-card"></i> ${karyawan.kode}</div>
            </div>
            <button class="btn-hapus" onclick="hapusKaryawan(${karyawan.kode})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        grid.appendChild(card);
    });
}

function tambahKaryawan() {
    document.getElementById('modalKaryawan').style.display = 'flex';
    document.getElementById('kodeKaryawan').value = '';
    document.getElementById('namaKaryawan').value = '';
}

function tutupModal() {
    document.getElementById('modalKaryawan').style.display = 'none';
}

function simpanKaryawan() {
    const kode = parseInt(document.getElementById('kodeKaryawan').value);
    const nama = document.getElementById('namaKaryawan').value.trim();
    
    if (!kode || !nama) {
        alert('Kode dan nama harus diisi!');
        return;
    }
    
    if (daftarKaryawan.some(k => k.kode === kode)) {
        alert(`Kode ${kode} sudah digunakan!`);
        return;
    }
    
    daftarKaryawan.push({ kode, nama });
    saveKaryawan();
    renderKaryawan();
    tutupModal();
}

function hapusKaryawan(kode) {
    if (confirm('Yakin ingin menghapus karyawan ini?')) {
        daftarKaryawan = daftarKaryawan.filter(k => k.kode !== kode);
        saveKaryawan();
        renderKaryawan();
    }
}

function updateBulanNavigation() {
    const navContainer = document.getElementById('bulanNavigation');
    if (!navContainer) return;
    
    const bulanList = Object.keys(storedData).sort();
    const currentBulan = document.getElementById('bulan').value;
    
    let navHTML = '<div class="nav-controls">';
    
    const prevBulan = getPrevBulan(currentBulan, bulanList);
    navHTML += `<button class="nav-bulan-btn" onclick="navigateToBulan('${prevBulan}')" ${!prevBulan ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i> Sebelumnya
    </button>`;
    
    navHTML += `<div class="bulan-indicator">
        <i class="fas fa-calendar-alt"></i> ${formatBulan(currentBulan)}
    </div>`;
    
    const nextBulan = getNextBulan(currentBulan, bulanList);
    navHTML += `<button class="nav-bulan-btn" onclick="navigateToBulan('${nextBulan}')" ${!nextBulan ? 'disabled' : ''}>
        Berikutnya <i class="fas fa-chevron-right"></i>
    </button>`;
    
    navHTML += '</div>';
    
    if (bulanList.length > 0) {
        navHTML += '<div class="bulan-chip-container">';
        bulanList.forEach(bulan => {
            const isActive = (bulan === currentBulan);
            navHTML += `
                <div class="bulan-chip ${isActive ? 'active' : ''}" onclick="navigateToBulan('${bulan}')">
                    <i class="fas fa-calendar-${isActive ? 'check' : 'day'}"></i>
                    ${formatBulan(bulan)}
                    <button class="btn-hapus-bulan" onclick="event.stopPropagation(); hapusDataBulan('${bulan}')" title="Hapus data bulan ini">
                        <i class="fas fa-times-circle"></i>
                    </button>
                </div>
            `;
        });
        navHTML += '</div>';
    } else {
        navHTML += '<div class="bulan-chip-container">';
        navHTML += '<div style="color: #999; padding: 10px;">Belum ada data tersimpan</div>';
        navHTML += '</div>';
    }
    
    navHTML += `
        <div class="storage-info">
            <i class="fas fa-database"></i>
            <span>Data tersimpan: ${bulanList.length} bulan</span>
            <button class="btn-clear-all" onclick="clearAllData()">
                <i class="fas fa-trash"></i> Hapus Semua Data
            </button>
        </div>
    `;
    
    navContainer.innerHTML = navHTML;
}

function getPrevBulan(currentBulan, bulanList) {
    if (bulanList.length === 0) return null;
    
    const currentIndex = bulanList.indexOf(currentBulan);
    if (currentIndex > 0) {
        return bulanList[currentIndex - 1];
    }
    return null;
}

function getNextBulan(currentBulan, bulanList) {
    if (bulanList.length === 0) return null;
    
    const currentIndex = bulanList.indexOf(currentBulan);
    if (currentIndex >= 0 && currentIndex < bulanList.length - 1) {
        return bulanList[currentIndex + 1];
    }
    return null;
}

function navigateToBulan(targetBulan) {
    if (!targetBulan) return;
    
    console.log('Navigasi ke:', targetBulan);
    
    document.getElementById('bulan').value = targetBulan;
    
    if (storedData[targetBulan]) {
        tampilkanRekap(storedData[targetBulan].data, storedData[targetBulan].tanggalList, targetBulan);
    } else {
        document.getElementById('rekapContainer').innerHTML = '';
        document.getElementById('totalRecord').textContent = '0';
        
        const container = document.getElementById('rekapContainer');
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Tidak ada data fingerprint untuk bulan ${formatBulan(targetBulan)}</h3>
                <p>Upload file .dat yang berisi data bulan ${formatBulan(targetBulan)}</p>
            </div>
        `;
        document.getElementById('resultSection').style.display = 'block';
    }
    
    updateBulanNavigation();
}
function hapusDataBulan(bulan) {
    if (confirm(`Yakin ingin menghapus data fingerprint bulan ${formatBulan(bulan)}?`)) {
        delete storedData[bulan];
        saveStoredData();        
        const currentBulan = document.getElementById('bulan').value;        
        if (currentBulan === bulan) {
            document.getElementById('rekapContainer').innerHTML = '';
            document.getElementById('totalRecord').textContent = '0';            
            const container = document.getElementById('rekapContainer');
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <h3>Data bulan ${formatBulan(bulan)} telah dihapus</h3>
                    <p>Upload file .dat jika ingin menambahkan kembali</p>
                </div>
            `;
        }
        
        updateBulanNavigation();        
        alert(`Data bulan ${formatBulan(bulan)} berhasil dihapus!`);
    }
}

function clearAllData() {
    if (confirm('PERHATIAN: Yakin ingin menghapus SEMUA data fingerprint dari semua bulan?')) {
        storedData = {};
        localStorage.removeItem('fingerprintData');
        document.getElementById('rekapContainer').innerHTML = '';
        document.getElementById('totalRecord').textContent = '0';
        document.getElementById('resultSection').style.display = 'none';
        updateBulanNavigation();
        
        alert('Semua data berhasil dihapus!');
    }
}

function processFile() {
    const fileInput = document.getElementById('fileDat');
    const bulan = document.getElementById('bulan').value;
    
    if (!fileInput.files[0]) {
        alert('Pilih file terlebih dahulu!');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const content = e.target.result;
        prosesData(content, bulan);
    };
    
    reader.readAsText(file);
}

function prosesData(content, bulan) {
    const lines = content.split('\n');
    const dataPerKaryawan = {};
    const semuaTanggal = new Set();
    
    lines.forEach(line => {
        line = line.trim();
        if (!line) return;
        
        const parts = line.split(/\s+/);
        if (parts.length >= 3) {
            const kode = parseInt(parts[0]);
            const tanggal = parts[1];
            const jam = parts[2];
            
            if (tanggal.startsWith(bulan)) {
                if (!dataPerKaryawan[kode]) {
                    dataPerKaryawan[kode] = {};
                }
                if (!dataPerKaryawan[kode][tanggal]) {
                    dataPerKaryawan[kode][tanggal] = [];
                }
                dataPerKaryawan[kode][tanggal].push(jam);
                semuaTanggal.add(tanggal);
            }
        }
    });
    
    const tanggalList = Array.from(semuaTanggal).sort();
        storedData[bulan] = {
        data: dataPerKaryawan,
        tanggalList: tanggalList,
        timestamp: new Date().toISOString()
    };
    saveStoredData();
    
    let totalRecord = 0;
    for (let kode in dataPerKaryawan) {
        for (let tgl in dataPerKaryawan[kode]) {
            totalRecord += dataPerKaryawan[kode][tgl].length;
        }
    }
    document.getElementById('totalRecord').textContent = totalRecord;
    
    tampilkanRekap(dataPerKaryawan, tanggalList, bulan);
}

function tampilkanRekap(dataPerKaryawan, tanggalList, bulan) {
    const container = document.getElementById('rekapContainer');
    container.innerHTML = '';
    
    document.getElementById('resultSection').style.display = 'block';
    
    if (Object.keys(dataPerKaryawan).length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>Tidak ada data fingerprint untuk bulan ${formatBulan(bulan)}</h3>
                <p>Upload file .dat yang berisi data bulan ${formatBulan(bulan)}</p>
            </div>
        `;
        return;
    }
    
    const kodeList = Object.keys(dataPerKaryawan).map(Number).sort((a, b) => a - b);
    
    kodeList.forEach(kode => {
        const karyawan = daftarKaryawan.find(k => k.kode === kode) || { nama: 'Unknown' };
        const dataUser = dataPerKaryawan[kode];
        
        let maxRecord = 0;
        for (let tgl in dataUser) {
            maxRecord = Math.max(maxRecord, dataUser[tgl].length);
        }
        
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.id = `user-${kode}`;
        
        const userHeader = document.createElement('div');
        userHeader.className = 'user-header';
        userHeader.onclick = () => toggleUser(kode);
        userHeader.innerHTML = `
            <i class="fas fa-user-circle"></i>
            <div class="user-info">
                <h4>${karyawan.nama}</h4>
                <span><i class="fas fa-id-card"></i> KODE: ${kode}</span>
            </div>
            <div class="record-badge">
                <i class="fas fa-layer-group"></i> ${maxRecord} RECORD
            </div>
        `;
        
        const tableBody = document.createElement('div');
        tableBody.className = 'table-container';
        tableBody.id = `table-${kode}`;
        
        let tableHTML = '<table class="data-table"><thead><tr><th>Record</th>';
        
        tanggalList.forEach(tgl => {
            const hari = getHariIndo(tgl);
            const tglNum = tgl.split('-')[2];
            const isWeekend = (hari === 'SAB' || hari === 'MIN');
            tableHTML += `<th class="${isWeekend ? 'weekend-header' : ''}">${tglNum}<br><small>${hari}</small></th>`;
        });
        tableHTML += '</tr></thead><tbody>';
        
        for (let i = 0; i < maxRecord; i++) {
            const recordNum = i + 1;
            tableHTML += '<tr>';
            tableHTML += `<td><strong>#${recordNum}</strong></td>`;
            
            tanggalList.forEach(tgl => {
                const hari = getHariIndo(tgl);
                const isWeekend = (hari === 'SAB' || hari === 'MIN');
                
                if (dataUser[tgl] && dataUser[tgl][i]) {
                    const jam = dataUser[tgl][i].substring(0, 5);
                    tableHTML += `<td class="${isWeekend ? 'weekend' : ''}">
                        <span class="jam-badge record-${recordNum}">${jam}</span>
                    </td>`;
                } else {
                    tableHTML += `<td class="${isWeekend ? 'weekend' : ''}">
                        <span class="kosong-badge">—</span>
                    </td>`;
                }
            });
            
            tableHTML += '</tr>';
        }
        
        
        tableHTML += '</tbody></table>';
        tableBody.innerHTML = tableHTML;
        
        userCard.appendChild(userHeader);
        userCard.appendChild(tableBody);
        container.appendChild(userCard);
    });
}

function getHariIndo(tanggal) {
    const hari = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
    const d = new Date(tanggal + 'T00:00:00');
    return hari[d.getDay()];
}

function formatBulan(bulan) {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const [tahun, bulanNum] = bulan.split('-');
    return `${months[parseInt(bulanNum)-1]} ${tahun}`;
}

function toggleUser(kode) {
    const table = document.getElementById(`table-${kode}`);
    if (table) {
        table.style.display = table.style.display === 'none' ? 'block' : 'none';
    }
}

function expandAll() {
    const tables = document.querySelectorAll('[id^="table-"]');
    tables.forEach(table => {
        table.style.display = 'block';
    });
}

window.onclick = function(event) {
    const modal = document.getElementById('modalKaryawan');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}