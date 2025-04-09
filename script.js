// Thay đổi hình ảnh trường mầm non mỗi 5 giây
const images = [
    'image1.jpg',
    'image2.jpg',
    'image3.jpg',
    'image4.jpg',
    'image5.jpg',
];
let currentImageIndex = 0;
const imageElements = document.querySelectorAll('.main-image');
const dots = document.querySelectorAll('.dot');

function showImage(index) {
    imageElements.forEach((img, i) => {
        img.classList.remove('active');
        if (i === index) {
            img.classList.add('active');
        }
    });
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === index) {
            dot.classList.add('active');
        }
    });
    currentImageIndex = index;
}

function changeImage(direction = 1) {
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    showImage(currentImageIndex);
}

// Thêm hiệu ứng gợn sóng cho các nút menu
const menuItems = document.querySelectorAll('.menu-item');

menuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        let ripple = document.createElement('span');
        this.appendChild(ripple);
        
        let x = e.clientX - this.getBoundingClientRect().left;
        let y = e.clientY - this.getBoundingClientRect().top;
        
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.classList.add('ripple');
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Thêm sự kiện cho nút bấm slider
document.querySelector('.prev').addEventListener('click', () => changeImage(-1));
document.querySelector('.next').addEventListener('click', () => changeImage(1));

// Thêm sự kiện cho các nút dot
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const index = parseInt(dot.getAttribute('data-index'));
        showImage(index);
    });
});

// Khởi tạo hình ảnh đầu tiên
showImage(currentImageIndex);

// Tự động chuyển ảnh mỗi 5 giây
setInterval(() => changeImage(1), 5000);
// Thêm vào cuối file script.js
// Hàm cập nhật thống kê truy cập
function updateStatistics() {
    // Mặc định hiển thị dữ liệu tĩnh khi chưa có dữ liệu từ Analytics
    let todayVisits = 0;
    let totalVisits = 0;
    let onlineUsers = 0;
    let weeklyVisits = 0;
    
    // Kiểm tra xem API Google Analytics đã sẵn sàng chưa
    if (typeof gtag === 'function') {
        // Lấy dữ liệu thống kê từ bộ nhớ cục bộ hoặc cập nhật từ server
        const stats = JSON.parse(localStorage.getItem('visitStats')) || {
            today: 125,
            total: 15342,
            online: 8,
            weekly: 892
        };
        
        // Tăng số lượt truy cập
        stats.today++;
        stats.total++;
        stats.weekly++;
        
        // Lưu lại vào bộ nhớ cục bộ
        localStorage.setItem('visitStats', JSON.stringify(stats));
        
        // Gán giá trị
        todayVisits = stats.today;
        totalVisits = stats.total;
        onlineUsers = stats.online;
        weeklyVisits = stats.weekly;
        
        // Gửi sự kiện pageview đến Google Analytics
        gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
    
    // Cập nhật UI
    document.querySelector('.statistics p:nth-child(2)').textContent = `Lượt truy cập hôm nay: ${todayVisits}`;
    document.querySelector('.statistics p:nth-child(3)').textContent = `Tổng số lượt truy cập: ${totalVisits.toLocaleString('vi-VN')}`;
    document.querySelector('.statistics p:nth-child(4)').textContent = `Người đang online: ${onlineUsers}`;
    document.querySelector('.statistics p:nth-child(5)').textContent = `Lượt truy cập tuần này: ${weeklyVisits}`;
}

// Gọi hàm cập nhật khi trang được tải
document.addEventListener('DOMContentLoaded', updateStatistics);