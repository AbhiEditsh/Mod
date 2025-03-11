console.log('main.js loaded');

// Function to get file size from URL
async function getFileSizeFromUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (!response.ok) throw new Error('Failed to fetch file size');

        const size = response.headers.get('content-length');
        return size ? parseInt(size, 10) : null;
    } catch (error) {
        console.error('Error getting file size:', error);
        return null;
    }
}

// Function to update mod file size
async function updateModFileSize(modId, newSize) {
    try {
        const response = await fetch(`/api/mods/${modId}/size`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fileSize: newSize })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to update file size');
        }

        const data = await response.json();

        // Update UI elements
        const sizeSpans = document.querySelectorAll(`[data-mod-id="${modId}"] .size-display`);
        sizeSpans.forEach(span => {
            span.textContent = data.formattedSize;
        });

        return data;
    } catch (error) {
        console.error('Error updating file size:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');

    // Handle download URL changes
    const downloadLinks = document.querySelectorAll('a[href*="download"]');
    downloadLinks.forEach(link => {
        const modId = link.closest('[data-mod-id]')?.dataset.modId;
        if (!modId) return;

        const observer = new MutationObserver(async (mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'href') {
                    const newUrl = link.getAttribute('href');
                    const fileSize = await getFileSizeFromUrl(newUrl);
                    if (fileSize) {
                        try {
                            await updateModFileSize(modId, fileSize);
                        } catch (error) {
                            console.error('Failed to update file size:', error);
                        }
                    }
                }
            }
        });

        observer.observe(link, { attributes: true });
    });

    // Handle all mod card clicks (both regular and related)
    document.querySelectorAll('.mod-card, .related-mod-card').forEach(card => {
        card.addEventListener('click', (e) => {
            e.preventDefault();
            const href = card.getAttribute('href');
            // Add a small delay for hover effect to complete
            setTimeout(() => {
                window.location.href = href;
            }, 150);
        });

        // Add hover sound effect (optional)
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
            card.querySelector('img').style.transform = 'scale(1.05)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.querySelector('img').style.transform = 'scale(1)';
        });
    });

    // Handle pagination
    const paginationBtns = document.querySelectorAll('.pagination-btn');

    paginationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('disabled')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // Logo link handler
    const logoLink = document.querySelector('.logo-link');
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/';
        });
    }

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
    }

    // Handle menu item clicks on mobile
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.mobile-menu-btn') &&
            !e.target.closest('.nav-links') &&
            navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
        }
    });

    // Like button functionality
    document.querySelectorAll('.like-button').forEach(button => {
        const modId = button.dataset.modId;
        const likeCount = button.querySelector('.like-count');
        const svg = button.querySelector('svg');

        // Set initial state based on server-side isLiked value
        if (button.classList.contains('liked')) {
            svg.setAttribute('fill', 'currentColor');
        }

        button.addEventListener('click', async () => {
            if (button.disabled) return;

            // Temporarily disable the button
            button.disabled = true;

            try {
                const response = await fetch(`/api/mods/${modId}/like`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Update like count
                    likeCount.textContent = data.likes;

                    // Toggle liked state based on server response
                    if (data.isLiked) {
                        button.classList.add('liked');
                        svg.setAttribute('fill', 'currentColor');
                    } else {
                        button.classList.remove('liked');
                        svg.setAttribute('fill', 'none');
                    }

                    // Add animation class
                    svg.classList.add('heart-pulse');
                    setTimeout(() => {
                        svg.classList.remove('heart-pulse');
                    }, 500);
                } else {
                    const errorData = await response.json();
                    console.error('Server error:', errorData.error);
                }
            } catch (error) {
                console.error('Error toggling mod like:', error);
            } finally {
                // Re-enable the button
                button.disabled = false;
            }
        });
    });
}); 