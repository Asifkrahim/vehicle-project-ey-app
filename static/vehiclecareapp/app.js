document.addEventListener('DOMContentLoaded', function () {
    const cars = document.querySelectorAll('.car-container');
    cars.forEach(car => {
        let pos = 0;
        setInterval(() => {
            pos += 1;
            if (pos > window.innerWidth) pos = -200;
            car.style.transform = `translateX(${pos}px)`;
        }, 20);
    });

    const headlights = document.querySelectorAll('.headlight');
    setInterval(() => {
        headlights.forEach(h => h.classList.toggle('headlight-on'));
    }, 1000);

    // Smooth scroll for bottom nav
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('data-target'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(() => console.log('Service Worker registered'))
            .catch(() => console.log('Service Worker registration failed'));
    }
});
