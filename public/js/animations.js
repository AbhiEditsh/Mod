document.addEventListener('DOMContentLoaded', () => {
    // 3D Tilt Effect
    document.querySelectorAll('.mod-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.querySelector('.mod-card-content').style.transform =
                `translateZ(30px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.querySelector('.mod-card-content').style.transform =
                'translateZ(0) rotateX(0) rotateY(0)';
        });
    });

    // Parallax Effect for Header Background
    const header = document.querySelector('.mod-header');
    if (header) {
        const firstImage = document.querySelector('.slide img');
        if (firstImage) {
            const parallaxBg = document.createElement('div');
            parallaxBg.className = 'parallax-bg';
            parallaxBg.style.backgroundImage = `url(${firstImage.src})`;
            header.insertBefore(parallaxBg, header.firstChild);
        }
    }

    // Interactive Download Button
    const downloadBtn = document.querySelector('.btn-primary');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const href = downloadBtn.getAttribute('href');

            // Add progress bar
            const progress = document.createElement('div');
            progress.className = 'download-progress';
            downloadBtn.appendChild(progress);

            // Simulate download progress
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        window.location.href = href;
                    }, 200);
                } else {
                    width += 2;
                    progress.style.width = width + '%';
                }
            }, 20);
        });
    }

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}); 