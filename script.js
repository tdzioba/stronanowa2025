document.addEventListener('DOMContentLoaded', () => {
    const heroSection = document.querySelector('.hero-section');
    const floatingElements = document.querySelectorAll('.floating-element');

    // Funkcja obsługująca efekt paralaksy (ruchu elementów za myszką)
    heroSection.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;

        floatingElements.forEach(el => {
            // Pobieramy prędkość z atrybutu data-speed w HTML
            const speed = el.getAttribute('data-speed');
            
            // Obliczamy przesunięcie
            const moveX = (window.innerWidth / 2 - e.clientX) * (speed / 100);
            const moveY = (window.innerHeight / 2 - e.clientY) * (speed / 100);

            // Aplikujemy transformację
            el.style.transform = `translate(${moveX}px, ${moveY}px)`;
            
            // Zachowujemy rotację dla lewej karty jeśli istnieje
            if (el.classList.contains('card-left')) {
                el.style.transform += ' rotate(-5deg)';
            }
        });
    });

    // Płynne przewijanie do sekcji (gdybyśmy dodali kotwice)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});