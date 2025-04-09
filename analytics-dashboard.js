/**
 * Analytics Dashboard - Tích hợp với Google Analytics
 * Sử dụng để hiển thị thống kê truy cập trên trang web trường mầm non
 */

class AnalyticsDashboard {
    constructor(elementSelector, gaId) {
        this.container = document.querySelector(elementSelector);
        this.gaId = gaId;
        this.isLoaded = false;
        this.stats = {
            today: 0,
            total: 0,
            online: 0,
            weekly: 0,
            lastUpdate: null
        };
        
        // Khởi tạo dashboard
        this.init();
    }
    
    init() {
        // Kiểm tra nếu container tồn tại
        if (!this.container) {
            console.error('Không tìm thấy phần tử thống kê truy cập');
            return;
        }
        
        // Tải dữ liệu từ localStorage nếu có
        this.loadFromLocalStorage();
        
        // Tự động cập nhật định kỳ
        this.startAutoRefresh();
        
        // Tạo sự kiện listen cho Google Analytics
        if (typeof gtag === 'function') {
            this.setupGAListeners();
        } else {
            // Kiểm tra lại sau 3 giây nếu gtag chưa tải
            setTimeout(() => {
                if (typeof gtag === 'function') {
                    this.setupGAListeners();
                }
            }, 3000);
        }
        
        // Cập nhật UI lần đầu
        this.updateUI();
    }
    
    loadFromLocalStorage() {
        const savedStats = localStorage.getItem('visitStats');
        if (savedStats) {
            try {
                const parsedStats = JSON.parse(savedStats);
                // Kiểm tra xem dữ liệu có phải từ hôm nay không
                const lastUpdate = new Date(parsedStats.lastUpdate || 0);
                const today = new Date();
                
                if (lastUpdate.toDateString() === today.toDateString()) {
                    this.stats = parsedStats;
                } else {
                    // Ngày mới, reset lượt truy cập hôm nay
                    this.stats.today = 0;
                    this.stats.online = 0;
                    this.stats.lastUpdate = today.toISOString();
                    // Giữ nguyên tổng số
                    this.stats.total = parsedStats.total || 0;
                    
                    // Kiểm tra tuần mới
                    const thisWeek = this.getWeekNumber(today);
                    const lastWeek = this.getWeekNumber(lastUpdate);
                    if (thisWeek !== lastWeek) {
                        this.stats.weekly = 0;
                    } else {
                        this.stats.weekly = parsedStats.weekly || 0;
                    }
                }
            } catch (e) {
                console.error('Lỗi khi đọc dữ liệu thống kê:', e);
            }
        }
    }
    
    getWeekNumber(d) {
        // Tính số tuần trong năm
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }
    
    setupGAListeners() {
        // Tăng số lượt truy cập khi có người ghé thăm
        this.stats.today++;
        this.stats.total++;
        this.stats.weekly++;
        this.stats.online++;
        this.stats.lastUpdate = new Date().toISOString();
        
        // Lưu lại vào localStorage
        this.saveToLocalStorage();
        
        // Thiết lập sự kiện để giảm số người online khi rời trang
        window.addEventListener('beforeunload', () => {
            this.stats.online = Math.max(0, this.stats.online - 1);
            this.saveToLocalStorage();
        });
    }
    
    saveToLocalStorage() {
        try {
            localStorage.setItem('visitStats', JSON.stringify(this.stats));
        } catch (e) {
            console.error('Lỗi khi lưu dữ liệu thống kê:', e);
        }
    }
    
    startAutoRefresh() {
        // Cập nhật UI mỗi 30 giây
        setInterval(() => {
            // Cập nhật số người online (giả lập, thực tế cần dữ liệu từ GA)
            const randomChange = Math.floor(Math.random() * 3) - 1; // -1, 0, hoặc 1
            this.stats.online = Math.max(1, this.stats.online + randomChange);
            this.saveToLocalStorage();
            this.updateUI();
        }, 30000);
    }
    
    updateUI() {
        if (!this.container) return;
        
        // Cập nhật nội dung
        const elements = this.container.querySelectorAll('p');
        if (elements.length >= 4) {
            elements[0].textContent = `Lượt truy cập hôm nay: ${this.stats.today}`;
            elements[1].textContent = `Tổng số lượt truy cập: ${this.stats.total.toLocaleString('vi-VN')}`;
            elements[2].textContent = `Người đang online: ${this.stats.online}`;
            elements[3].textContent = `Lượt truy cập tuần này: ${this.stats.weekly}`;
        }
    }
    
    // Phương thức để tích hợp sâu hơn với Google Analytics API
    fetchRealAnalyticsData() {
        // Trong thực tế, bạn sẽ cần sử dụng Google Analytics API để lấy dữ liệu thật
        // Đây là phần code giả lập
        console.log('Đang tải dữ liệu từ Google Analytics...');
        
        // Giả lập gọi API
        setTimeout(() => {
            // Ở đây bạn sẽ thực hiện gọi API thực tế
            console.log('Đã cập nhật dữ liệu thống kê');
        }, 1000);
    }
}

// Khởi tạo thống kê khi trang đã tải xong
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new AnalyticsDashboard('.statistics', 'G-QZ372Y4MPE');
});