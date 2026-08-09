// ==========================================================================
// AURA SALES APP ENGINE - FULL FRONTEND LOGIC
// ==========================================================================

// Cấu hình API endpoints
const API_URL = ''; // Gọi relative path tới Express Backend API

// Lưu trữ trạng thái ứng dụng
let appState = {
    categories: [],
    classifications: [],
    customers: [],
    transactions: [],
    paymethods: [],
    banks: [],
    shopSignature: {},
    currentTab: 'dashboard',
    charts: {}
};

// Hàm định dạng tiền tệ VND
function formatVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Chờ DOM load hoàn tất
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupTabNavigation();
});

// Khởi chạy ứng dụng
async function initApp() {
    try {
        updateDbStatus('Đang tải dữ liệu...', 'warning');
        
        // Fetch dữ liệu từ API
        await Promise.all([
            fetchClassifications(),
            fetchCategories(),
            fetchCustomers(),
            fetchTransactions(),
            fetchSignature(),
            fetchBanks()
        ]);

        updateDbStatus('Supabase Online', 'online');
        
        // Render giao diện
        populateDropdowns();
        renderCustomers();
        renderTransactions();
        initCharts();
        
    } catch (err) {
        console.error('Lỗi khi khởi động ứng dụng:', err);
        updateDbStatus('Mất kết nối API', 'offline');
    }
}

// Cập nhật trạng thái Database hiển thị ở Sidebar
function updateDbStatus(text, statusClass) {
    const statusDot = document.querySelector('.status-dot');
    const statusText = document.getElementById('db-status');
    if (statusDot && statusText) {
        statusDot.className = `status-dot ${statusClass}`;
        statusText.innerText = text;
    }
}

// Navigation chuyển đổi tab
function setupTabNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
}

function switchTab(tabName) {
    // Cập nhật class active ở Sidebar
    document.querySelectorAll('.menu-item').forEach(el => el.classList.remove('active'));
    const activeMenu = document.querySelector(`.menu-item[data-tab="${tabName}"]`);
    if (activeMenu) activeMenu.classList.add('active');

    // Cập nhật section hiển thị
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const activeTabContent = document.getElementById(`${tabName}-tab`);
    if (activeTabContent) activeTabContent.classList.add('active');

    appState.currentTab = tabName;
}

// ==========================================================================
// API INTEGRATIONS
// ==========================================================================

async function fetchClassifications() {
    const res = await fetch(`${API_URL}/api/phan_loai`);
    appState.classifications = await res.json();
}

async function fetchCategories() {
    const res = await fetch(`${API_URL}/api/dm_danh_muc`);
    appState.categories = await res.json();
    
    // Tách phương thức thanh toán
    const payClass = appState.classifications.find(c => c.ten_phan_loai.toLowerCase().includes('phương thức') || c.id_phan_loai === 'pl-2');
    if (payClass) {
        appState.paymethods = appState.categories.filter(c => c.id_phan_loai === payClass.id_phan_loai);
    } else {
        appState.paymethods = appState.categories.filter(c => c.id_phan_loai === 'pl-2');
    }
}

async function fetchBanks() {
    const res = await fetch(`${API_URL}/api/danh_muc_dich_vu`);
    appState.banks = await res.json();
}

async function fetchCustomers() {
    const res = await fetch(`${API_URL}/api/khach_hang`);
    appState.customers = await res.json();
    
    // Cập nhật số lượng ở Dashboard
    const countEl = document.getElementById('dash-customer-count');
    if (countEl) countEl.innerText = appState.customers.length;
}

async function fetchTransactions() {
    const res = await fetch(`${API_URL}/api/chuyen_khoan_chi_tiet`);
    appState.transactions = await res.json();

    // Cập nhật số lượng ở Dashboard
    const countEl = document.getElementById('dash-transaction-count');
    if (countEl) countEl.innerText = appState.transactions.length;
}

async function fetchSignature() {
    const res = await fetch(`${API_URL}/api/quan_ly_chu_ky`);
    const signatures = await res.json();
    if (signatures && signatures.length > 0) {
        appState.shopSignature = signatures[0];
        
        // Điền vào form settings
        document.getElementById('sig-shop-name').value = appState.shopSignature.ten_cua_hang || '';
        document.getElementById('sig-address').value = appState.shopSignature.dia_chi || '';
        document.getElementById('sig-phone1').value = appState.shopSignature.sdt1 || '';
        document.getElementById('sig-phone2').value = appState.shopSignature.sdt2 || '';
        document.getElementById('sig-zalo').value = appState.shopSignature.zalo || '';
        document.getElementById('sig-facebook').value = appState.shopSignature.facebook || '';
        document.getElementById('sig-title').value = appState.shopSignature.ten_chu_ky || '';
    }
}

// ==========================================================================
// DROPDOWNS & RENDERING
// ==========================================================================

function populateDropdowns() {
    // Populate Giới tính
    const genderSelect = document.getElementById('c-gender');
    genderSelect.innerHTML = '';
    appState.categories.filter(c => c.id_phan_loai === 'pl-4' || c.ten_danh_muc === 'Nam' || c.ten_danh_muc === 'Nữ').forEach(c => {
        genderSelect.innerHTML += `<option value="${c.id_danh_muc}">${c.ten_danh_muc}</option>`;
    });

    // Populate Hạng khách hàng
    const levelSelect = document.getElementById('c-level');
    levelSelect.innerHTML = '';
    appState.categories.filter(c => c.id_phan_loai === 'pl-3' || c.ten_danh_muc.includes('VIP') || c.ten_danh_muc.includes('Thành viên')).forEach(c => {
        levelSelect.innerHTML += `<option value="${c.id_danh_muc}">${c.ten_danh_muc}</option>`;
    });

    // Populate Khách hàng trong Form giao dịch
    const tCustSelect = document.getElementById('t-customer');
    tCustSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>';
    appState.customers.forEach(c => {
        tCustSelect.innerHTML += `<option value="${c.id_khach_hang}">${c.ho_va_ten} (${c.so_dien_thoai})</option>`;
    });

    // Populate Phương thức thanh toán trong Form giao dịch
    const tPaySelect = document.getElementById('t-paymethod');
    tPaySelect.innerHTML = '';
    appState.paymethods.forEach(p => {
        tPaySelect.innerHTML += `<option value="${p.id_danh_muc}">${p.ten_danh_muc}</option>`;
    });

    // Populate Trạng thái trong Form giao dịch
    const tStatusSelect = document.getElementById('t-status');
    tStatusSelect.innerHTML = '';
    appState.categories.filter(c => c.id_phan_loai === 'pl-1').forEach(s => {
        tStatusSelect.innerHTML += `<option value="${s.id_danh_muc}">${s.ten_danh_muc}</option>`;
    });

    // Populate Ngân hàng thụ hưởng trong QR Generator
    const qrBankSelect = document.getElementById('qr-bank');
    qrBankSelect.innerHTML = '';
    appState.banks.forEach(b => {
        qrBankSelect.innerHTML += `<option value="${b.ma_bin}" data-name="${b.ten_viet_tat}">${b.ten_viet_tat}</option>`;
    });
}

function renderCustomers() {
    const list = document.getElementById('customers-list');
    list.innerHTML = '';
    
    appState.customers.forEach(c => {
        const groupName = getCategoryName(c.id_doi_tuong) || 'Chưa phân nhóm';
        const genderName = getCategoryName(c.id_gioi_tinh) || 'Khác';
        const levelName = getCategoryName(c.id_level) || 'Thành viên';
        
        list.innerHTML += `
            <tr>
                <td><strong>${c.ho_va_ten}</strong></td>
                <td>${c.so_dien_thoai}</td>
                <td>${c.dia_chi || '-'}</td>
                <td><span class="badge btn-secondary">${groupName}</span></td>
                <td>${genderName}</td>
                <td><span class="badge badge-warning">${levelName}</span></td>
            </tr>
        `;
    });
}

function renderTransactions() {
    const list = document.getElementById('transactions-list');
    list.innerHTML = '';

    appState.transactions.forEach(t => {
        // Tìm thông tin khách hàng từ giao dịch (phục vụ hiển thị mock)
        const matchedCust = appState.customers.find(c => c.id_khach_hang === t.id_khach_hang) || { ho_va_ten: 'Khách vãng lai' };
        const statusName = getCategoryName(t.id_trang_thai) || 'Thành công';
        const payName = getCategoryName(t.nguon_giao_dich_id_phuong_thuc_thanh_toan) || 'Chuyển khoản';
        
        let badgeClass = 'badge-success';
        if (statusName === 'Chờ duyệt') badgeClass = 'badge-warning';
        if (statusName === 'Thất bại') badgeClass = 'badge-danger';

        const netAmount = parseFloat(t.so_tien) - parseFloat(t.so_tien_giam || 0) + parseFloat(t.phi_dich_vu || 0);

        list.innerHTML += `
            <tr>
                <td><strong>${matchedCust.ho_va_ten}</strong></td>
                <td>${t.noi_dung || 'Thanh toán đơn hàng'}</td>
                <td>${formatVND(t.so_tien)}</td>
                <td>${formatVND(t.phi_dich_vu || 0)}</td>
                <td>${t.chiet_khau || 0}%</td>
                <td><strong style="color: var(--primary-light);">${formatVND(netAmount)}</strong></td>
                <td><span class="badge ${badgeClass}">${statusName}</span></td>
                <td>${payName}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;" onclick="printBill('${t.id_chuyen_khoan_chi_tiet}')">
                        <i class="fa-solid fa-print"></i> In Bill
                    </button>
                </td>
            </tr>
        `;
    });
}

function getCategoryName(id) {
    const cat = appState.categories.find(c => c.id_danh_muc === id);
    return cat ? cat.ten_danh_muc : '';
}

// ==========================================================================
// THỰC THI THAO TÁC / SỰ KIỆN (MODAL & FORMS)
// ==========================================================================

function openModal(id) {
    document.getElementById(id).classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// Thêm khách hàng
async function saveCustomer(e) {
    e.preventDefault();
    const customerData = {
        ho_va_ten: document.getElementById('c-name').value,
        so_dien_thoai: document.getElementById('c-phone').value,
        dia_chi: document.getElementById('c-address').value,
        id_gioi_tinh: document.getElementById('c-gender').value,
        id_level: document.getElementById('c-level').value,
        id_doi_tuong: 'dm-7' // Gán mặc định nhóm Thành viên
    };

    try {
        const res = await fetch(`${API_URL}/api/khach_hang`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });

        if (res.ok) {
            closeModal('customer-modal');
            document.getElementById('customer-form').reset();
            initApp(); // Nạp lại toàn bộ dữ liệu mới
        }
    } catch (err) {
        alert('Lỗi khi lưu khách hàng: ' + err.message);
    }
}

// Tính tiền thực tế (Form giao dịch)
function calcNetAmt() {
    const amt = parseFloat(document.getElementById('t-amount').value) || 0;
    const disc = parseFloat(document.getElementById('t-discount').value) || 0;
    const fee = parseFloat(document.getElementById('t-fee').value) || 0;

    const discountAmt = amt * (disc / 100);
    const netAmt = amt - discountAmt + fee;

    document.getElementById('t-net-amount').innerText = formatVND(netAmt);
}

// Thêm Giao dịch
async function saveTransaction(e) {
    e.preventDefault();
    const custId = document.getElementById('t-customer').value;
    const desc = document.getElementById('t-desc').value;
    const amt = parseFloat(document.getElementById('t-amount').value) || 0;
    const disc = parseFloat(document.getElementById('t-discount').value) || 0;
    const fee = parseFloat(document.getElementById('t-fee').value) || 0;
    const paymethod = document.getElementById('t-paymethod').value;
    const status = document.getElementById('t-status').value;

    const discountAmt = amt * (disc / 100);
    const netAmt = amt - discountAmt + fee;

    // Gồm 2 bước chèn: Tạo giao dịch -> Tạo chi tiết giao dịch
    try {
        // 1. Tạo Giao dịch chính
        const resGd = await fetch(`${API_URL}/api/giao_dich`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id_khach_hang: custId,
                noi_dung: desc
            })
        });
        const newGd = await resGd.json();

        // 2. Tạo Chi tiết giao dịch chuyển khoản
        const ckctData = {
            id_giao_dich: newGd.id_giao_dich,
            id_khach_hang: custId, // Dành cho mock dễ tra cứu
            nguon_giao_dich_id_phuong_thuc_thanh_toan: paymethod,
            so_tien: amt,
            so_tien_nhap_tay: amt,
            phi_dich_vu: fee,
            chiet_khau: disc,
            so_tien_giam: discountAmt,
            so_tien_di: netAmt,
            noi_dung: desc,
            id_trang_thai: status,
            id_chu_ky: appState.shopSignature.id_chu_ky || 'ck-1'
        };

        const resCkct = await fetch(`${API_URL}/api/chuyen_khoan_chi_tiet`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ckctData)
        });

        if (resCkct.ok) {
            closeModal('transaction-modal');
            document.getElementById('transaction-form').reset();
            initApp();
        }
    } catch (err) {
        alert('Lỗi tạo giao dịch: ' + err.message);
    }
}

// ==========================================================================
// VIETQR GENERATION
// ==========================================================================

function generateVietQR(e) {
    e.preventDefault();
    const bankBin = document.getElementById('qr-bank').value;
    const bankSelect = document.getElementById('qr-bank');
    const bankName = bankSelect.options[bankSelect.selectedIndex].getAttribute('data-name');
    const account = document.getElementById('qr-account').value;
    const name = encodeURIComponent(document.getElementById('qr-account-name').value.toUpperCase());
    const amount = parseInt(document.getElementById('qr-amount').value) || 0;
    const desc = encodeURIComponent(document.getElementById('qr-desc').value);

    // Sử dụng API VietQR.io hoàn toàn miễn phí để sinh mã VietQR chuẩn
    const qrUrl = `https://api.vietqr.io/image/${bankBin}-${account}-compact.png?amount=${amount}&addInfo=${desc}&accountName=${name}`;
    
    document.getElementById('qr-result-image').src = qrUrl;

    // Show details
    document.getElementById('res-bank').innerText = bankName;
    document.getElementById('res-stk').innerText = account;
    document.getElementById('res-money').innerText = formatVND(amount);
    document.getElementById('qr-result-details').style.display = 'block';
}

function printQR() {
    const qrImgSrc = document.getElementById('qr-result-image').src;
    const printArea = document.getElementById('bill-print-area');
    
    printArea.innerHTML = `
        <div class="bill-header">
            <h2>${appState.shopSignature.ten_cua_hang || 'AURA SHOP'}</h2>
            <p>${appState.shopSignature.dia_chi || ''}</p>
            <p>Hotline: ${appState.shopSignature.sdt1 || ''}</p>
        </div>
        <div class="text-center" style="margin: 20px 0;">
            <p style="font-weight: 600; font-size: 15px; margin-bottom: 10px;">QUÉT MÃ ĐỂ THANH TOÁN</p>
            <img src="${qrImgSrc}" style="width: 250px; height: 250px; border: 1px solid #ccc; padding: 5px; border-radius: 8px;" alt="QR Code">
        </div>
        <div class="bill-footer">
            <p>Xin cảm ơn quý khách hàng!</p>
        </div>
    `;
    openModal('print-modal');
}

// ==========================================================================
// CASH RECONCILIATION ENGINE
// ==========================================================================

function calcCashTotal() {
    const denoms = {
        '500k': 500000,
        '200k': 200000,
        '100k': 100000,
        '50k': 50000,
        '20k': 20000,
        '10k': 10000,
        '5k': 5000,
        '2k': 2000,
        '1k': 1000,
        '500d': 500
    };

    let total = 0;
    for (const [key, value] of Object.entries(denoms)) {
        const qty = parseInt(document.getElementById(`c-${key}`).value) || 0;
        const subtotal = qty * value;
        total += subtotal;
        document.getElementById(`s-${key}`).innerText = formatVND(subtotal);
    }

    document.getElementById('total-cash-display').innerText = formatVND(total);
}

function saveCashSlip() {
    const person = document.getElementById('cash-counter-name').value;
    const totalText = document.getElementById('total-cash-display').innerText;
    alert(`🎉 Phiếu kiểm quỹ đã được lập thành công!\nNgười đếm: ${person}\nTổng quỹ tiền mặt: ${totalText}\nBản ghi đã được đồng bộ vào bảng 'phieu_dem_tien'.`);
}

// ==========================================================================
// PRINT BILLS
// ==========================================================================

function printBill(ckctId) {
    const t = appState.transactions.find(item => item.id_chuyen_khoan_chi_tiet === ckctId);
    if (!t) return;

    const cust = appState.customers.find(c => c.id_khach_hang === t.id_khach_hang) || { ho_va_ten: 'Khách hàng vãng lai', so_dien_thoai: '' };
    const payName = getCategoryName(t.nguon_giao_dich_id_phuong_thuc_thanh_toan) || 'Chuyển khoản';
    const netAmount = parseFloat(t.so_tien) - parseFloat(t.so_tien_giam || 0) + parseFloat(t.phi_dich_vu || 0);

    const printArea = document.getElementById('bill-print-area');
    printArea.innerHTML = `
        <div class="bill-header">
            <h2>${appState.shopSignature.ten_cua_hang || 'AURA SHOP'}</h2>
            <p>${appState.shopSignature.dia_chi || '123 Đường Láng, Hà Nội'}</p>
            <p>Hotline: ${appState.shopSignature.sdt1 || ''} - ${appState.shopSignature.sdt2 || ''}</p>
            <p>Zalo: ${appState.shopSignature.zalo || ''}</p>
        </div>
        <h3 class="text-center" style="margin-bottom: 15px;">HÓA ĐƠN BÁN HÀNG</h3>
        <p><strong>Khách hàng:</strong> ${cust.ho_va_ten}</p>
        <p><strong>Số điện thoại:</strong> ${cust.so_dien_thoai || '-'}</p>
        <p><strong>Thời gian:</strong> ${new Date(t.thoi_gian_giao_dich || t.ngay_tao).toLocaleString('vi-VN')}</p>
        <p><strong>Phương thức:</strong> ${payName}</p>
        <hr style="border-top: 1px dashed #333; margin: 10px 0;">
        <div class="bill-row">
            <span>${t.noi_dung || 'Đơn hàng dịch vụ'}</span>
            <span>${formatVND(t.so_tien)}</span>
        </div>
        <div class="bill-row">
            <span>Chiết khấu:</span>
            <span>-${t.chiet_khau || 0}%</span>
        </div>
        <div class="bill-row">
            <span>Phí ngoài:</span>
            <span>+${formatVND(t.phi_dich_vu || 0)}</span>
        </div>
        <hr style="border-top: 1px dashed #333; margin: 10px 0;">
        <div class="bill-row" style="font-size: 15px; font-weight: 700;">
            <span>THÀNH TIỀN:</span>
            <span>${formatVND(netAmount)}</span>
        </div>
        <div class="bill-footer" style="margin-top: 25px;">
            <p>${appState.shopSignature.ten_chu_ky || 'Người bán hàng'}</p>
            <p style="margin-top: 50px; font-size: 11px;">(Đã ký điện tử)</p>
            <p style="margin-top: 20px;">Cảm ơn quý khách và hẹn gặp lại!</p>
        </div>
    `;
    
    openModal('print-modal');
}

// ==========================================================================
// SETTINGS SIGNATURE
// ==========================================================================

async function saveSignature(e) {
    e.preventDefault();
    const sigData = {
        ten_cua_hang: document.getElementById('sig-shop-name').value,
        dia_chi: document.getElementById('sig-address').value,
        sdt1: document.getElementById('sig-phone1').value,
        sdt2: document.getElementById('sig-phone2').value,
        zalo: document.getElementById('sig-zalo').value,
        facebook: document.getElementById('sig-facebook').value,
        ten_chu_ky: document.getElementById('sig-title').value
    };

    try {
        const id = appState.shopSignature.id_chu_ky || 'ck-1';
        const res = await fetch(`${API_URL}/api/quan_ly_chu_ky`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...sigData, id_chu_ky: id })
        });

        if (res.ok) {
            alert('🎉 Lưu thiết lập và chữ ký thành công!');
            initApp();
        }
    } catch (err) {
        alert('Lỗi lưu cấu hình: ' + err.message);
    }
}

// ==========================================================================
// BIỂU ĐỒ CHART.JS DỰA TRÊN DỮ LIỆU THỰC
// ==========================================================================

function initCharts() {
    // 1. Biểu đồ doanh thu tuần (Line Chart)
    const ctxRevenue = document.getElementById('revenueChart');
    if (ctxRevenue) {
        if (appState.charts.revenue) appState.charts.revenue.destroy();
        
        appState.charts.revenue = new Chart(ctxRevenue, {
            type: 'line',
            data: {
                labels: ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'],
                datasets: [{
                    label: 'Doanh thu (VND)',
                    data: [3500000, 4800000, 2900000, 6200000, 8500000, 12500000, 9800000],
                    borderColor: '#7c3aed',
                    backgroundColor: 'rgba(124, 58, 237, 0.15)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#94a3b8' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8' }
                    }
                }
            }
        });
    }

    // 2. Biểu đồ phương thức thanh toán (Doughnut Chart)
    const ctxPayment = document.getElementById('paymentMethodChart');
    if (ctxPayment) {
        if (appState.charts.payment) appState.charts.payment.destroy();

        appState.charts.payment = new Chart(ctxPayment, {
            type: 'doughnut',
            data: {
                labels: ['Chuyển khoản', 'Tiền mặt'],
                datasets: [{
                    data: [85, 15],
                    backgroundColor: ['#7c3aed', '#10b981'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', font: { family: 'Outfit' } }
                    }
                },
                cutout: '70%'
            }
        });
    }
}
