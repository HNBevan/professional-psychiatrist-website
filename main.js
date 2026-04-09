const navSlide = () => {
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links li');

    burger.addEventListener('click', () => {
        // Toggle Nav
        nav.classList.toggle('nav-active');

        // Animate Links
        navLinks.forEach((link, index) => {
            if (link.style.animation) {
                link.style.animation = '';
            } else {
                link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            }
        });

        // Burger Animation
        burger.classList.toggle('toggle');
    });
}

navSlide();

const scrollReveal = () => {
    const cards = Array.from(document.querySelectorAll('.service-card'));
    if (!cards.length) return;

    // Group cards by row based on their vertical position.
    const rows = cards.reduce((acc, card) => {
        const top = card.offsetTop;
        if (!acc[top]) {
            acc[top] = [];
        }
        acc[top].push(card);
        return acc;
    }, {});

    // Add animation classes based on row index (odd/even).
    Object.values(rows).forEach((row, index) => {
        const direction = index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right';
        row.forEach(card => card.classList.add(direction));
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, 800);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(card => observer.observe(card));
}

scrollReveal();

const revealOnScroll = () => {
    const elementsToReveal = document.querySelectorAll('.service-detail-grid');
    if (!elementsToReveal.length) return;

    // Add alternating left/right animation classes
    elementsToReveal.forEach((el, index) => {
        const direction = index % 2 === 0 ? 'reveal-from-left' : 'reveal-from-right';
        el.classList.add(direction);
    });

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    elementsToReveal.forEach(el => observer.observe(el));
}

revealOnScroll();