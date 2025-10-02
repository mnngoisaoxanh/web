// Thêm vào đầu file script.js
document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menu-toggle');
    const mainMenu = document.getElementById('main-menu');
    const overlay = document.getElementById('overlay');

    if (menuToggle && mainMenu && overlay) {
        // Sự kiện khi bấm vào nút hamburger
        menuToggle.addEventListener('click', () => {
            mainMenu.classList.toggle('is-open');
            overlay.classList.toggle('is-open');
            menuToggle.classList.toggle('active');
        });

        // Sự kiện khi bấm vào lớp phủ (để đóng menu)
        overlay.addEventListener('click', () => {
            mainMenu.classList.remove('is-open');
            overlay.classList.remove('is-open');
            menuToggle.classList.remove('active');
        });

        // Đóng menu khi bấm vào menu item (trên mobile)
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    mainMenu.classList.remove('is-open');
                    overlay.classList.remove('is-open');
                    menuToggle.classList.remove('active');
                }
            });
        });
    }
});

// --- PHẦN CODE CŨ VẪN GIỮ NGUYÊN ---

// ===== FIREBASE SLIDER SYSTEM =====
let sliderImages = [];
let currentImageIndex = 0;
let sliderInterval = 5000; // Default 5 seconds
let currentTransition = 'fade';
let autoSlideTimer = null;

// Transition effects
const transitionEffects = ['fade', 'slide', 'zoom', 'flip'];

function initializeFirebaseSlider() {
    // Load slider data from Firebase
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        db.collection('site_content').doc('slider_images')
            .onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    sliderImages = data.images || [];
                    sliderInterval = (data.interval || 5) * 1000;
                    currentTransition = data.transition || 'fade';
                    
                    if (sliderImages.length > 0) {
                        setupSliderFromFirebase();
                    } else {
                        // Fallback to static images if no Firebase images
                        setupStaticSlider();
                    }
                } else {
                    // No Firebase data, use static images
                    setupStaticSlider();
                }
            }, error => {
                console.error('Error loading slider images:', error);
                setupStaticSlider();
            });
    } else {
        // Firebase not available, use static images
        setupStaticSlider();
    }
}

function setupSliderFromFirebase() {
    const sliderContainer = document.querySelector('.image-slider');
    if (!sliderContainer) return;
    
    // Clear existing content
    sliderContainer.innerHTML = `
        <button class="slider-button prev">&lt;</button>
        <button class="slider-button next">&gt;</button>
        <div class="slider-dots"></div>
    `;
    
    // Create image elements
    sliderImages.forEach((imgData, index) => {
        const img = document.createElement('img');
        img.src = imgData.url || imgData.data; // Support both new (url) and old (data) format
        img.alt = imgData.alt || 'Hình ảnh trường mầm non';
        img.className = `main-image ${index === 0 ? 'active' : ''}`;
        img.loading = 'lazy';
        sliderContainer.insertBefore(img, sliderContainer.querySelector('.slider-button.next'));
    });
    
    // Create dots
    const dotsContainer = sliderContainer.querySelector('.slider-dots');
    sliderImages.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = `dot ${index === 0 ? 'active' : ''}`;
        dot.setAttribute('data-index', index);
        dot.addEventListener('click', () => showImage(index));
        dotsContainer.appendChild(dot);
    });
    
    // Setup navigation
    setupSliderNavigation();
    
    // Start auto-slide
    startAutoSlide();
}

function setupStaticSlider() {
    // Fallback to original static images
    sliderImages = [
        { data: 'image1.jpg', alt: 'Hình ảnh trường mầm non' },
        { data: 'image2.jpg', alt: 'Hình ảnh trường mầm non' },
        { data: 'image3.jpg', alt: 'Hình ảnh trường mầm non' },
        { data: 'image4.jpg', alt: 'Hình ảnh trường mầm non' },
        { data: 'image5.jpg', alt: 'Hình ảnh trường mầm non' }
    ];
    
    // Update existing images with proper src
    const imageElements = document.querySelectorAll('.main-image');
    imageElements.forEach((img, index) => {
        if (sliderImages[index]) {
            img.src = sliderImages[index].data;
            img.alt = sliderImages[index].alt;
        }
    });
    
    setupSliderNavigation();
    startAutoSlide();
}

function setupSliderNavigation() {
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => changeImage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeImage(1));
    
    // Setup dots if they exist
    const dots = document.querySelectorAll('.dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.getAttribute('data-index'));
            showImage(index);
        });
    });
}

function showImage(index, effect = null) {
    if (sliderImages.length === 0) return;
    
    const imageElements = document.querySelectorAll('.main-image');
    const dots = document.querySelectorAll('.dot');
    
    if (imageElements.length === 0) return;
    
    // Determine transition effect
    let transitionToUse = effect || currentTransition;
    if (transitionToUse === 'random') {
        transitionToUse = transitionEffects[Math.floor(Math.random() * transitionEffects.length)];
    }
    
    // Remove all active classes and transition classes
    imageElements.forEach((img, i) => {
        img.classList.remove('active', 'fade-in', 'fade-out', 'slide-in', 'slide-out', 'zoom-in', 'zoom-out', 'flip-in', 'flip-out');
        
        if (i === currentImageIndex) {
            // Current image - apply exit effect
            switch (transitionToUse) {
                case 'fade':
                    img.classList.add('fade-out');
                    break;
                case 'slide':
                    img.classList.add('slide-out');
                    break;
                case 'zoom':
                    img.classList.add('zoom-out');
                    break;
                case 'flip':
                    img.classList.add('flip-out');
                    break;
            }
        }
    });
    
    // Update current index
    currentImageIndex = index;
    
    // After a short delay, show new image with enter effect
    setTimeout(() => {
        imageElements.forEach((img, i) => {
            img.classList.remove('active', 'fade-in', 'fade-out', 'slide-in', 'slide-out', 'zoom-in', 'zoom-out', 'flip-in', 'flip-out');
            
            if (i === index) {
                img.classList.add('active');
                switch (transitionToUse) {
                    case 'fade':
                        img.classList.add('fade-in');
                        break;
                    case 'slide':
                        img.classList.add('slide-in');
                        break;
                    case 'zoom':
                        img.classList.add('zoom-in');
                        break;
                    case 'flip':
                        img.classList.add('flip-in');
                        break;
                }
            }
        });
    }, 100);
    
    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.remove('active');
        if (i === index) {
            dot.classList.add('active');
        }
    });
}

function changeImage(direction = 1) {
    if (sliderImages.length === 0) return;
    
    currentImageIndex = (currentImageIndex + direction + sliderImages.length) % sliderImages.length;
    showImage(currentImageIndex);
    
    // Reset auto-slide timer
    resetAutoSlide();
}

function startAutoSlide() {
    if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
    }
    
    if (sliderImages.length > 1) {
        autoSlideTimer = setInterval(() => {
            changeImage(1);
        }, sliderInterval);
    }
}

function resetAutoSlide() {
    if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        startAutoSlide();
    }
}

// Initialize slider when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to initialize
    setTimeout(initializeFirebaseSlider, 1000);
});

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

// Note: Slider navigation is now handled by setupSliderNavigation() function above

// Hàm cập nhật thống kê truy cập - đã được tối ưu hóa
function updateStatistics() {
    // Kiểm tra xem analytics dashboard đã được khởi tạo chưa
    if (typeof AnalyticsDashboard !== 'undefined') {
        // Analytics dashboard sẽ tự động xử lý việc cập nhật
        return;
    }
    
    // Fallback cho trường hợp analytics dashboard không hoạt động
    const statsElements = document.querySelectorAll('.statistics p');
    if (statsElements.length >= 4) {
        // Lấy dữ liệu từ localStorage hoặc sử dụng giá trị mặc định
        const stats = JSON.parse(localStorage.getItem('visitStats')) || {
            today: Math.floor(Math.random() * 50) + 100,
            total: Math.floor(Math.random() * 1000) + 15000,
            online: Math.floor(Math.random() * 10) + 5,
            weekly: Math.floor(Math.random() * 200) + 800
        };
        
        // Cập nhật UI
        statsElements[0].textContent = `Lượt truy cập hôm nay: ${stats.today}`;
        statsElements[1].textContent = `Tổng số lượt truy cập: ${stats.total.toLocaleString('vi-VN')}`;
        statsElements[2].textContent = `Người đang online: ${stats.online}`;
        statsElements[3].textContent = `Lượt truy cập tuần này: ${stats.weekly}`;
        
        // Gửi sự kiện đến Google Analytics nếu có
        if (typeof gtag === 'function') {
            gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname
            });
        }
    }
}

// Xử lý resize window để đảm bảo menu hoạt động đúng
window.addEventListener('resize', () => {
    const mainMenu = document.getElementById('main-menu');
    const overlay = document.getElementById('overlay');
    const menuToggle = document.getElementById('menu-toggle');
    
    if (window.innerWidth > 768) {
        // Trở về desktop, đóng menu mobile nếu đang mở
        if (mainMenu) mainMenu.classList.remove('is-open');
        if (overlay) overlay.classList.remove('is-open');
        if (menuToggle) menuToggle.classList.remove('active');
    }
});

// Ngăn cuộn trang khi menu mobile đang mở
document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const overlay = document.getElementById('overlay');
                if (overlay && overlay.classList.contains('is-open')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        });
    });

    const overlay = document.getElementById('overlay');
    if (overlay) {
        observer.observe(overlay, { attributes: true });
    }
});

// Gọi hàm cập nhật khi trang được tải
document.addEventListener('DOMContentLoaded', updateStatistics);