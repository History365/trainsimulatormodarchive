/**
 * Train Simulator Mod Archive - Main JavaScript
 * Modern interactivity for the archive website
 * Last updated: October 24, 2025
 */

// Archive Statistics Counter Animation
function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range));
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = current.toLocaleString();
        if (current === end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// Search functionality
function initSearch() {
    const searchInput = document.querySelector('.search-input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(function(e) {
        // TODO: Implement search functionality
        console.log('Search query:', e.target.value);
    }, 300));
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and popovers
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(popoverTriggerEl => new bootstrap.Popover(popoverTriggerEl));
    
    // Animate statistics on scroll
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statElements = statsSection.querySelectorAll('.stats-number');
                    statElements.forEach(el => {
                        const target = parseInt(el.getAttribute('data-target'), 10);
                        animateValue(el, 0, target, 2000);
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(statsSection);
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Creator card animations
    const creatorCards = document.querySelectorAll('.creator-card');
    creatorCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Featured content carousel initialization
    const featuredCarousel = document.getElementById('featuredCarousel');
    if (featuredCarousel) {
        new bootstrap.Carousel(featuredCarousel, {
            interval: 5000,
            pause: 'hover'
        });
    }
    
    // Initialize search
    initSearch();
    
    // Fade-in animation for content sections
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
        fadeObserver.observe(el);
    });
    
    // Active navigation highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    function highlightNavOnScroll() {
        const scrollY = window.pageYOffset;
        
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 100;
            const sectionId = current.getAttribute('id');
            
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', debounce(highlightNavOnScroll, 100));
    
    // Category card interactions
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('category-card-hover');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('category-card-hover');
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    
    if (menuToggle && navbarCollapse) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('is-active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            const isNavbarClick = navbarCollapse.contains(event.target) || 
                                menuToggle.contains(event.target);
            
            if (!isNavbarClick && navbarCollapse.classList.contains('show')) {
                menuToggle.click();
            }
        });
    }
    
    // Initialize lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => lazyImageObserver.observe(img));
    }
    
    // Gallery System - Auto-detect images from HTML
    if (document.querySelector('.mod-gallery')) {
        createLightboxHTML();
        initGallerySystem();
    }
});

// ============================================
// GALLERY SYSTEM
// ============================================

// Create lightbox HTML dynamically
function createLightboxHTML() {
    const lightboxHTML = `
        <div id="galleryLightbox" class="gallery-lightbox">
            <button class="lightbox-close" onclick="closeLightbox()" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            
            <button class="lightbox-arrow lightbox-arrow-left" onclick="navigateLightbox(-1)" aria-label="Previous">
                <i class="fas fa-chevron-left"></i>
            </button>
            
            <div class="lightbox-image-container">
                <div class="lightbox-loader" id="lightboxLoader">
                    <div class="loader-spinner"></div>
                </div>
                <img id="lightboxImage" src="" alt="Gallery Image">
            </div>
            
            <button class="lightbox-arrow lightbox-arrow-right" onclick="navigateLightbox(1)" aria-label="Next">
                <i class="fas fa-chevron-right"></i>
            </button>
            
            <div class="lightbox-info">
                <span class="lightbox-counter" id="lightboxCounter">1 / 1</span>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);
}

let galleryImages = [];
let currentIndex = 0;
let isLoading = false;
let autoPlayInterval = null;
let userInteracted = false;
let mainGalleryInterval = null;
let currentCycleIndex = 0;
let autoPlayStopped = false;

// Build gallery array from HTML
function buildGalleryArray() {
    const images = [];
    
    // Get ONLY thumbnail images (not the main image)
    const thumbs = document.querySelectorAll('.gallery-thumb img');
    thumbs.forEach(thumb => {
        images.push(thumb.src);
    });
    
    return images;
}

// Update main gallery image with professional crossfade and progressive blur loading
function updateMainGalleryImage(index) {
    const mainImg = document.getElementById('mainDisplayImage');
    if (!mainImg || !galleryImages[index]) return;
    
    // Prevent rapid transitions
    if (mainImg.dataset.transitioning === 'true') return;
    mainImg.dataset.transitioning = 'true';
    
    // Fade out current image
    mainImg.style.opacity = '0';
    
    // Wait for fade out, swap image, then fade in with blur effect
    setTimeout(() => {
        // Apply blur immediately
        mainImg.classList.add('loading');
        mainImg.src = galleryImages[index];
        
        // Fade in blurred image
        requestAnimationFrame(() => {
            mainImg.style.opacity = '1';
        });
        
        // Preload high quality version
        const preloadImg = new Image();
        preloadImg.onload = () => {
            // Remove blur once fully loaded
            requestAnimationFrame(() => {
                mainImg.classList.remove('loading');
                mainImg.dataset.transitioning = 'false';
            });
        };
        preloadImg.src = galleryImages[index];
    }, 500); // Match CSS transition
    
    // Update UI elements
    updateActiveThumbnail(index);
    updateActiveDot(index);
}

// Generate gallery dots
function generateGalleryDots() {
    const dotsContainer = document.getElementById('galleryDots');
    if (!dotsContainer || !galleryImages.length) return;
    
    dotsContainer.innerHTML = '';
    galleryImages.forEach((img, index) => {
        const dot = document.createElement('span');
        dot.className = 'gallery-dot';
        if (index === 0) dot.classList.add('active');
        dot.onclick = (e) => {
            e.stopPropagation();
            // Navigate directly to the clicked index
            stopMainGalleryAutoCycle();
            autoPlayStopped = true;
            currentCycleIndex = index;
            updateMainGalleryImage(currentCycleIndex);
        };
        dotsContainer.appendChild(dot);
    });
}

// Update active dot
function updateActiveDot(index) {
    const dots = document.querySelectorAll('.gallery-dot');
    dots.forEach((dot, i) => {
        if (i === index) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Manual navigation (stops auto-play)
function manualNavigateGallery(direction) {
    if (autoPlayStopped) {
        // Just navigate if already stopped
        currentCycleIndex += direction;
    } else {
        // Stop auto-play on first manual interaction
        stopMainGalleryAutoCycle();
        autoPlayStopped = true;
        currentCycleIndex += direction;
    }
    
    // Loop around
    if (currentCycleIndex >= galleryImages.length) {
        currentCycleIndex = 0;
    } else if (currentCycleIndex < 0) {
        currentCycleIndex = galleryImages.length - 1;
    }
    
    updateMainGalleryImage(currentCycleIndex);
}

// Start main gallery auto-cycle
function startMainGalleryAutoCycle() {
    // Don't start if user stopped it manually
    if (autoPlayStopped) return;
    
    // Make sure we have images
    if (!galleryImages || galleryImages.length === 0) {
        return;
    }
    
    // Only reset to 0 if we haven't started yet (no interval exists)
    // Otherwise, keep the current index
    if (!mainGalleryInterval && currentCycleIndex === 0) {
        // First time initialization - this is fine
    }
    
    // Preload all images before starting auto-cycle
    let loadedCount = 0;
    const totalImages = galleryImages.length;
    
    galleryImages.forEach((imgSrc) => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages && !mainGalleryInterval) {
                // All images loaded, start the auto-cycle
                mainGalleryInterval = setInterval(() => {
                    if (autoPlayStopped) {
                        stopMainGalleryAutoCycle();
                        return;
                    }
                    currentCycleIndex = (currentCycleIndex + 1) % galleryImages.length;
                    updateMainGalleryImage(currentCycleIndex);
                }, 5000); // Change every 5 seconds
            }
        };
        img.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages && !mainGalleryInterval) {
                // Start even if some images failed
                mainGalleryInterval = setInterval(() => {
                    if (autoPlayStopped) {
                        stopMainGalleryAutoCycle();
                        return;
                    }
                    currentCycleIndex = (currentCycleIndex + 1) % galleryImages.length;
                    updateMainGalleryImage(currentCycleIndex);
                }, 5000);
            }
        };
        img.src = imgSrc;
    });
}

// Stop main gallery auto-cycle
function stopMainGalleryAutoCycle() {
    if (mainGalleryInterval) {
        clearInterval(mainGalleryInterval);
        mainGalleryInterval = null;
    }
}

// Update active thumbnail highlight
function updateActiveThumbnail(index) {
    // Remove active class from all thumbnails
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Add active class to current thumbnail (index - 1 because first image is main)
    if (index > 0) {
        const thumbs = document.querySelectorAll('.gallery-thumb');
        if (thumbs[index - 1]) {
            thumbs[index - 1].classList.add('active');
        }
    }
}

// Start auto-play (removed - not used in lightbox anymore)
function startAutoPlay() {
    // Not used
}

// Stop auto-play (removed - not used in lightbox anymore)
function stopAutoPlay() {
    // Not used
}

// Add fade-in effect when images load
function setupImageFadeIn() {
    // Main display image
    const mainImg = document.getElementById('mainDisplayImage');
    if (mainImg) {
        if (mainImg.complete) {
            mainImg.classList.add('loaded');
        } else {
            mainImg.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    }
    
    // Thumbnail images
    const thumbs = document.querySelectorAll('.gallery-thumb img');
    thumbs.forEach(thumb => {
        if (thumb.complete) {
            thumb.classList.add('loaded');
        } else {
            thumb.addEventListener('load', function() {
                this.classList.add('loaded');
            });
        }
    });
}

// Load image with smooth transition
function loadLightboxImage(index) {
    if (isLoading) return;
    isLoading = true;
    
    const img = document.getElementById('lightboxImage');
    const loader = document.getElementById('lightboxLoader');
    const counter = document.getElementById('lightboxCounter');
    
    // Update active thumbnail
    updateActiveThumbnail(index);
    
    // Show loader and fade out current image
    loader.style.display = 'flex';
    img.style.opacity = '0';
    
    // Create new image to preload
    const newImg = new Image();
    newImg.onload = function() {
        // Wait a bit for smooth transition
        setTimeout(() => {
            img.src = galleryImages[index];
            counter.textContent = `${index + 1} / ${galleryImages.length}`;
            
            // Hide loader and fade in new image
            setTimeout(() => {
                loader.style.display = 'none';
                img.style.opacity = '1';
                isLoading = false;
            }, 100);
        }, 200);
    };
    newImg.src = galleryImages[index];
}

// Open lightbox
function openLightbox(index) {
    // Ensure index is valid
    if (index < 0 || index >= galleryImages.length) {
        index = 0;
    }
    
    currentIndex = index;
    userInteracted = false;
    const lightbox = document.getElementById('galleryLightbox');
    const img = document.getElementById('lightboxImage');
    const loader = document.getElementById('lightboxLoader');
    const counter = document.getElementById('lightboxCounter');
    
    if (!lightbox || !img || !loader || !counter) return;
    
    // Stop main gallery auto-cycle when lightbox opens
    stopMainGalleryAutoCycle();
    
    // Update active thumbnail
    updateActiveThumbnail(currentIndex);
    
    // Update counter immediately with correct index
    counter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
    
    // Clear previous image and reset opacity
    img.src = '';
    img.style.opacity = '0';
    
    // Show lightbox and loader
    lightbox.style.display = 'flex';
    loader.style.display = 'flex';
    
    // Add active class for animation
    requestAnimationFrame(() => {
        lightbox.classList.add('active');
    });
    
    // Preload the image at the specified index
    const newImg = new Image();
    newImg.onload = function() {
        // Set the loaded image
        img.src = galleryImages[currentIndex];
        // Hide loader
        loader.style.display = 'none';
        // Fade in after a small delay to ensure smooth transition
        requestAnimationFrame(() => {
            setTimeout(() => {
                img.style.opacity = '1';
            }, 50);
        });
    };
    
    // Start loading the image at currentIndex
    newImg.src = galleryImages[currentIndex];
    
    document.body.style.overflow = 'hidden';
}

// Close lightbox
function closeLightbox() {
    const lightbox = document.getElementById('galleryLightbox');
    const img = document.getElementById('lightboxImage');
    const controls = lightbox.querySelectorAll('.lightbox-close, .lightbox-arrow, .lightbox-info');
    
    userInteracted = false;
    
    // Remove active class from all thumbnails
    document.querySelectorAll('.gallery-thumb').forEach(thumb => {
        thumb.classList.remove('active');
    });
    
    // Fade out image and all controls together
    img.style.opacity = '0';
    controls.forEach(control => {
        control.style.opacity = '0';
    });
    
    // Then fade out background
    setTimeout(() => {
        lightbox.classList.remove('active');
        setTimeout(() => {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
            // Reset opacity for next open
            img.style.opacity = '0';
            controls.forEach(control => {
                control.style.opacity = '1';
            });
            
            // Restart main gallery auto-cycle when lightbox closes
            startMainGalleryAutoCycle();
        }, 300);
    }, 150);
}

// Navigate lightbox
function navigateLightbox(direction) {
    if (isLoading) return;
    
    currentIndex += direction;
    
    // Loop around
    if (currentIndex >= galleryImages.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = galleryImages.length - 1;
    }
    
    loadLightboxImage(currentIndex);
}

// Initialize gallery system
function initGallerySystem() {
    // Build gallery array and setup fade-in
    galleryImages = buildGalleryArray();
    
    // Set main display image to first thumbnail image
    const mainImg = document.getElementById('mainDisplayImage');
    if (mainImg && galleryImages.length > 0) {
        mainImg.src = galleryImages[0];
    }
    
    setupImageFadeIn();
    
    // Generate gallery dots
    generateGalleryDots();
    
    // Add click handler to main gallery image
    const mainGalleryDiv = document.querySelector('.mod-gallery-main');
    if (mainGalleryDiv) {
        mainGalleryDiv.addEventListener('click', function(e) {
            // Don't open lightbox if clicking on navigation buttons or dots
            if (!e.target.closest('.gallery-nav-btn') && !e.target.closest('.gallery-dot')) {
                openLightbox(currentCycleIndex);
            }
        });
    }
    
    // Start auto-cycling the main gallery after a short delay
    setTimeout(() => {
        startMainGalleryAutoCycle();
    }, 1000);
    
    // Keyboard controls
    document.addEventListener('keydown', function(e) {
        const lightbox = document.getElementById('galleryLightbox');
        if (lightbox && lightbox.classList.contains('active')) {
            if (e.key === 'Escape') {
                closeLightbox();
            } else if (e.key === 'ArrowLeft') {
                navigateLightbox(-1);
            } else if (e.key === 'ArrowRight') {
                navigateLightbox(1);
            }
        }
    });
    
    // Click outside to close
    const lightbox = document.getElementById('galleryLightbox');
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === this) {
                closeLightbox();
            }
        });
    }
}

// Dropdown toggle function
function toggleDropdown(id) {
    const element = document.getElementById(id);
    const icon = document.getElementById(id + '-icon');
    
    if (element && icon) {
        if (element.classList.contains('hidden')) {
            element.classList.remove('hidden');
            icon.textContent = '▾';
        } else {
            element.classList.add('hidden');
            icon.textContent = '▸';
        }
    }
}

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');
if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        mobileNav.classList.toggle('active');
    });
}

// Download System
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('download-trigger') || e.target.closest('.download-trigger')) {
        e.preventDefault();
        const btn = e.target.classList.contains('download-trigger') ? e.target : e.target.closest('.download-trigger');
        const fileUrl = btn.dataset.url;
        
        // Check if it's a direct download link (ends with file extension) or external site
        const isDirectDownload = /\.(zip|rar|7z|exe|pdf|png|jpg|jpeg|gif|bmp|webp)$/i.test(fileUrl);
        
        if (isDirectDownload) {
            // Use the existing modal for all downloads
            const fileInfo = {
                name: btn.dataset.name || fileUrl.split('/').pop(),
                version: btn.dataset.version || '1.0',
                size: btn.dataset.size || 'Unknown',
                date: btn.dataset.date || 'Unknown',
                author: btn.dataset.author || 'Unknown'
            };
            
            // Open modal and start download
            openDownloadModal(fileUrl, fileInfo, true); // Pass true for direct download
        } else {
            // External site (Google Drive, etc.)
            const fileInfo = {
                name: btn.dataset.name || 'Unknown',
                version: btn.dataset.version || '1.0',
                size: btn.dataset.size || 'Unknown',
                date: btn.dataset.date || 'Unknown',
                author: btn.dataset.author || 'Unknown'
            };
            
            openDownloadModal(fileUrl, fileInfo, false);
        }
    }
});

function showDownloadNotification(message) {
    // Remove existing notification if present
    const existing = document.getElementById('downloadNotification');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.id = 'downloadNotification';
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #1a1a1a;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border: 1px solid #2a2a2a;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        z-index: 10000;
        font-family: Inter, sans-serif;
        font-size: 0.9rem;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    if (!document.getElementById('notificationStyles')) {
        style.id = 'notificationStyles';
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function openDownloadModal(fileUrl, fileInfo, isDirectDownload = false) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('downloadModalOverlay');
    if (!modal) {
        modal = createDownloadModal();
        document.body.appendChild(modal);
    }
    
    // Set manual download button URL
    const manualBtn = document.getElementById('modalManualDownloadBtn');
    manualBtn.href = fileUrl;
    
    // For direct downloads, remove target="_blank" so it stays in same tab
    if (isDirectDownload) {
        manualBtn.removeAttribute('target');
        manualBtn.setAttribute('download', fileInfo.name);
    } else {
        manualBtn.setAttribute('target', '_blank');
        manualBtn.removeAttribute('download');
    }
    
    // Show modal with initial text
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Start download immediately and update popup
    if (isDirectDownload) {
        // Update text immediately
        document.getElementById('downloadStatusTitle').textContent = 'Download Started!';
        document.getElementById('downloadStatusText').textContent = 'Your download has started. Check your downloads folder. If the download didn\'t start, click the button below.';
        
        // Direct download - simple approach without fetch
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileInfo.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        // External link - open in new tab after delay
        setTimeout(() => {
            window.open(fileUrl, '_blank');
            document.getElementById('downloadStatusTitle').textContent = 'Download Started!';
            document.getElementById('downloadStatusText').textContent = 'Check your downloads folder. If the download didn\'t start, use the button below.';
        }, 1500);
    }
}

function closeDownloadModal() {
    const modal = document.getElementById('downloadModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            // Reset text
            document.getElementById('downloadStatusTitle').textContent = 'Download Starting...';
            document.getElementById('downloadStatusText').textContent = 'Your download should begin automatically. If it doesn\'t, click the button below.';
        }, 300);
    }
}

function createDownloadModal() {
    const overlay = document.createElement('div');
    overlay.id = 'downloadModalOverlay';
    overlay.className = 'download-modal-overlay';
    
    overlay.innerHTML = `
        <div class="download-modal">
            <button class="download-modal-close" onclick="closeDownloadModal()" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="download-modal-content">
                <div class="download-status-card">
                    <div class="download-status-icon">
                        <i class="fas fa-download"></i>
                    </div>
                    <h2 class="download-status-title" id="downloadStatusTitle">Download Starting...</h2>
                    <p class="download-status-text" id="downloadStatusText">Your download should begin automatically. If it doesn't, click the button below.</p>
                    <a href="#" class="download-manual-button" id="modalManualDownloadBtn" target="_blank">
                        <i class="fas fa-download"></i> Manual Download
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Close on outside click
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeDownloadModal();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeDownloadModal();
        }
    });
    
    return overlay;
}

// Collapsible section toggle function
function toggleSection(sectionId) {
    const content = document.getElementById(sectionId + '-content');
    const icon = document.getElementById(sectionId + '-icon');
    
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'none';
        icon.style.transform = 'rotate(-90deg)';
    }
}