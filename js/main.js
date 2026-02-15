/**
 * Train Simulator Mod Archive - Main JavaScript
 * Last updated: December 14, 2025
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
    const desktopSearch = document.getElementById('searchInput');
    const mobileSearch = document.getElementById('mobileSearchInput');
    
    if (desktopSearch) {
        desktopSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const query = encodeURIComponent(this.value.trim());
                // Strip hash and query params from pathname
                const currentPath = window.location.pathname.split('#')[0].split('?')[0];
                
                // Get the filename from the path
                const fileName = currentPath.split('/').pop();
                
                // Check if we're in a subdirectory by checking if the path contains a folder before the file
                // For file:///C:/Websites/trainsimulatormodarchive/trurail-simulations/file.html
                // the pathname will include the folder before the .html file
                const pathWithoutFile = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const folderName = pathWithoutFile.split('/').pop();
                
                // If the folder name exists and isn't the root, we're in a subdirectory
                const isInSubdirectory = folderName && folderName !== 'trainsimulatormodarchive';
                
                // Determine correct path to search.html
                const searchPath = isInSubdirectory ? '../search.html' : 'search.html';
                
                window.location.href = `${searchPath}?q=${query}`;
            }
        });
    }
    
    if (mobileSearch) {
        mobileSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const query = encodeURIComponent(this.value.trim());
                // Strip hash and query params from pathname
                const currentPath = window.location.pathname.split('#')[0].split('?')[0];
                
                // Get the filename from the path
                const fileName = currentPath.split('/').pop();
                
                // Check if we're in a subdirectory by checking if the path contains a folder before the file
                const pathWithoutFile = currentPath.substring(0, currentPath.lastIndexOf('/'));
                const folderName = pathWithoutFile.split('/').pop();
                
                // If the folder name exists and isn't the root, we're in a subdirectory
                const isInSubdirectory = folderName && folderName !== 'trainsimulatormodarchive';
                
                // Determine correct path to search.html
                const searchPath = isInSubdirectory ? '../search.html' : 'search.html';
                
                window.location.href = `${searchPath}?q=${query}`;
            }
        });
    }
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
                    top: targetElement.offsetTop - 120, // Offset for fixed header (navbar + padding)
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
    
    // Show cookie banner if needed
    const consent = getCookieConsent();
    if (consent === null) {
        showCookieBanner();
    }
    
    // Initialize search
    try {
        initSearch();
    } catch (error) {
        console.error('Error in initSearch():', error);
    }
    
    // Initialize scroll buttons and sidebar navigation
    initScrollButtons();
    initSidebarNavigation();
    initMobileSidebarToggle();
    
    // Generate dynamic footer
    generateFooter();
    
    // Trigger initial scroll check for buttons
    setTimeout(() => {
        window.dispatchEvent(new Event('scroll'));
    }, 100);
    
    // Page-specific loading: Only load what's relevant for the current page
    
    // Detect which page we're on by checking for page-specific containers
    const isHomepage = document.getElementById('randomModsContainer') !== null;
    const isSearchPage = document.getElementById('searchResults') !== null;
    const isCategoryPage = document.querySelectorAll('.file-details-box[data-name]').length > 0; // Trurail, ClearTracks, UTS, etc.
    
    // HOMEPAGE: Load critical elements first
    if (isHomepage) {
        // 1. Random mods (main content area, visible first)
        loadRandomMods();
        // 2. Top downloads sidebar (visible after mods)
        loadTopDownloadsSidebar();
        // 3. Archive statistics (least critical, slight delay to prioritize above)
        setTimeout(() => loadArchiveStats(), 100);
    }
    
    // SEARCH PAGE: Only load mods API if search results container exists
    if (isSearchPage) {
        // Search functionality is handled in search page JavaScript
        // No API loading needed on search page
    }
    
    // CATEGORY PAGES: File details are handled by api-client.js 
    if (isCategoryPage) {
        // api-client.js automatically handles:
        // - Loading file info (download count, size, upload date)
        // - Tracking downloads
        // - No need to load homepage data (top downloads, random mods, archive stats)
    }
    
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
    
    if (!dotsContainer || !galleryImages.length) {
        return;
    }
    
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
            updateActiveDot(currentCycleIndex);
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
    // Always stop auto-play on manual interaction
    if (!autoPlayStopped) {
        stopMainGalleryAutoCycle();
        autoPlayStopped = true;
    }
    
    currentCycleIndex += direction;
    
    // Loop around
    if (currentCycleIndex >= galleryImages.length) {
        currentCycleIndex = 0;
    } else if (currentCycleIndex < 0) {
        currentCycleIndex = galleryImages.length - 1;
    }
    
    updateMainGalleryImage(currentCycleIndex);
    updateActiveDot(currentCycleIndex);
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
    
    // Add active class to current thumbnail
    const thumbs = document.querySelectorAll('.gallery-thumb');
    if (thumbs[index]) {
        thumbs[index].classList.add('active');
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
    
    // Fade out current image first
    img.style.opacity = '0';
    
    // Wait for fade out before showing loader
    setTimeout(() => {
        loader.style.display = 'flex';
        // Fade in loader
        requestAnimationFrame(() => {
            loader.style.opacity = '1';
        });
        
        // Create new image to preload
        const newImg = new Image();
        newImg.onload = function() {
            // Wait a moment to ensure smooth transition
            setTimeout(() => {
                img.src = galleryImages[index];
                counter.textContent = `${index + 1} / ${galleryImages.length}`;
                
                // Fade out loader
                loader.style.opacity = '0';
                
                // Once loader is faded out, hide it and fade in image
                setTimeout(() => {
                    loader.style.display = 'none';
                    requestAnimationFrame(() => {
                        img.style.opacity = '1';
                        isLoading = false;
                    });
                }, 200);
            }, 100);
        };
        newImg.src = galleryImages[index];
    }, 200);
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
    autoPlayStopped = true;
    
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
            
            // Don't restart auto-cycle - user manually interacted
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

// Set a universal fixed height for all gallery carousels
function setGalleryFixedHeight() {
    const galleryMain = document.querySelector('.mod-gallery-main');
    if (!galleryMain) return;
    
    // Set a fixed height for all galleries (16:9 aspect ratio based on container width)
    const containerWidth = galleryMain.offsetWidth;
    const fixedHeight = containerWidth * 0.5625; // 16:9 aspect ratio (9/16 = 0.5625)
    
    galleryMain.style.height = fixedHeight + 'px';
    galleryMain.style.minHeight = fixedHeight + 'px';
    galleryMain.style.maxHeight = fixedHeight + 'px';
}

// Maintain aspect ratio for gallery main image
function maintainGalleryAspectRatio() {
    const mainImg = document.getElementById('mainDisplayImage');
    const galleryMain = document.querySelector('.mod-gallery-main');
    
    if (!mainImg || !galleryMain) return;
    
    // Ensure the image fills the container while maintaining ratio
    mainImg.style.width = '100%';
    mainImg.style.height = '100%';
    mainImg.style.objectFit = 'contain';
}

// Initialize gallery system
function initGallerySystem() {
    // Build gallery array and setup fade-in
    galleryImages = buildGalleryArray();
    
    if (galleryImages.length === 0) {
        return;
    }
    
    // Hide both main image and thumbnails initially
    const mainImg = document.getElementById('mainDisplayImage');
    const galleryThumbs = document.querySelectorAll('.gallery-thumb img');
    
    if (mainImg) {
        mainImg.style.opacity = '0';
    }
    galleryThumbs.forEach(thumb => {
        thumb.style.opacity = '0';
    });
    
    // Preload main image first, then thumbnails
    const mainImage = new Image();
    mainImage.onload = function() {
        // Main image loaded - show it first
        if (mainImg) {
            mainImg.src = galleryImages[0];
            mainImg.classList.add('loaded');
            
            // Maintain aspect ratio on load
            mainImg.addEventListener('load', function() {
                maintainGalleryAspectRatio();
            });
            
            // Fade in main image immediately
            requestAnimationFrame(() => {
                mainImg.style.transition = 'opacity 0.4s ease';
                mainImg.style.opacity = '1';
            });
            
            // After main image is visible, preload and show thumbnails
            setTimeout(() => {
                preloadThumbnails(galleryThumbs);
            }, 200);
        }
        
        // Calculate and set fixed height based on tallest image
        setGalleryFixedHeight();
        
        // Generate gallery dots
        generateGalleryDots();
        
        // Set first thumbnail as active on page load
        updateActiveThumbnail(0);
        
        // Only start auto-cycling if there's more than one image
        if (galleryImages.length > 1) {
            setTimeout(() => {
                startMainGalleryAutoCycle();
            }, 500);
        }
    };
    
    mainImage.onerror = function() {
        // If main image fails, still show thumbnails
        if (mainImg) {
            mainImg.style.opacity = '1';
        }
        preloadThumbnails(galleryThumbs);
    };
    
    // Start loading main image
    mainImage.src = galleryImages[0];
    
    // Helper function to preload and show thumbnails
    function preloadThumbnails(thumbs) {
        let loadedCount = 0;
        const totalThumbs = Math.min(galleryImages.length, thumbs.length);
        
        galleryImages.forEach((imageSrc, index) => {
            if (index >= thumbs.length) return;
            
            const img = new Image();
            img.onload = img.onerror = function() {
                loadedCount++;
                
                // When all thumbnails are loaded, fade them all in at once
                if (loadedCount === totalThumbs) {
                    thumbs.forEach((thumb) => {
                        if (thumb) {
                            thumb.style.transition = 'opacity 0.3s ease';
                            thumb.style.opacity = '1';
                            thumb.classList.add('loaded');
                        }
                    });
                }
            };
            img.src = imageSrc;
        });
    }
    
    // Add resize listener to recalculate fixed height
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            setGalleryFixedHeight();
            maintainGalleryAspectRatio();
        }, 100);
    });
    
    setupImageFadeIn();
    
    // Add click handler to main gallery image
    const mainGalleryDiv = document.querySelector('.mod-gallery-main');
    if (mainGalleryDiv) {
        mainGalleryDiv.addEventListener('click', function(e) {
            // Don't open lightbox if clicking on navigation buttons or dots
            if (!e.target.closest('.gallery-nav-btn') && !e.target.closest('.gallery-dot')) {
                openLightbox(currentCycleIndex);
            }
        });
        
        // Add touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;
        
        mainGalleryDiv.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });
        
        mainGalleryDiv.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
        
        function handleSwipe() {
            const swipeThreshold = 50; // minimum distance for swipe
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swiped left - go to next
                    manualNavigateGallery(1);
                } else {
                    // Swiped right - go to previous
                    manualNavigateGallery(-1);
                }
            }
        }
    }
    
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

// Cookie consent management
function getCookieConsent() {
    // Check actual browser cookie first
    const cookieConsent = document.cookie.split('; ').find(row => row.startsWith('cookieConsent='));
    if (cookieConsent) {
        const value = cookieConsent.split('=')[1];
        return value;
    }
    
    // Check sessionStorage
    const sessionConsent = sessionStorage.getItem('cookieConsent');
    if (sessionConsent) {
        return sessionConsent;
    }
    
    // Then check localStorage
    const consent = localStorage.getItem('cookieConsent');
    const consentDate = localStorage.getItem('cookieConsentDate');
    
    if (!consent || !consentDate) return null;
    
    // Check if consent is older than 90 days
    const daysSinceConsent = (Date.now() - parseInt(consentDate)) / (1000 * 60 * 60 * 24);
    if (daysSinceConsent > 90) {
        localStorage.removeItem('cookieConsent');
        localStorage.removeItem('cookieConsentDate');
        document.cookie = 'cookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        return null;
    }
    
    // Store in session for this browsing session
    sessionStorage.setItem('cookieConsent', consent);
    return consent;
}

function setCookieConsent(accepted) {
    const consentValue = accepted ? 'accepted' : 'denied';
    const dateValue = Date.now().toString();
    
    // Set actual browser cookie (expires in 90 days)
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 1000));
    document.cookie = `cookieConsent=${consentValue}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    // Store in localStorage
    try {
        localStorage.setItem('cookieConsent', consentValue);
        localStorage.setItem('cookieConsentDate', dateValue);
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
    
    // Always save to sessionStorage as fallback
    sessionStorage.setItem('cookieConsent', consentValue);
    sessionStorage.setItem('cookieConsentDate', dateValue);
}

function showCookieBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.innerHTML = `
        <div style="position: fixed; bottom: 20px; right: 20px; max-width: 420px; background: #1e1e1e; border: 1px solid #333; border-radius: 8px; padding: 24px; z-index: 10000; box-shadow: 0 8px 32px rgba(0,0,0,0.6); font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                <h3 style="color: #fff; margin: 0; font-size: 18px; font-weight: 600;">Cookie Notice</h3>
                <button id="closeBanner" style="background: transparent; color: #888; border: none; padding: 0; cursor: pointer; font-size: 24px; line-height: 1; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; transition: color 0.2s;">
                    ×
                </button>
            </div>
            <p style="color: #aaa; margin: 0 0 20px 0; font-size: 14px; line-height: 1.6;">
                This site uses cookies and local storage for essential functions needed for a smooth experience. 
                <span style="color: #888; display: block; margin-top: 8px; font-size: 13px;">
                    Denying may cause user features to not work properly which may ruin your experience.
                </span>
            </p>
            <div style="display: flex; gap: 10px;">
                <button id="acceptCookies" style="flex: 1; background: #2a2a2a; color: #fff; border: 1px solid #444; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s;">
                    Accept
                </button>
                <button id="denyCookies" style="flex: 1; background: #2a2a2a; color: #ccc; border: 1px solid #444; padding: 12px 20px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s;">
                    Deny
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(banner);
    
    // Add hover effects
    const acceptBtn = document.getElementById('acceptCookies');
    const denyBtn = document.getElementById('denyCookies');
    const closeBtn = document.getElementById('closeBanner');
    
    acceptBtn.addEventListener('mouseenter', () => {
        acceptBtn.style.background = '#333';
        acceptBtn.style.borderColor = '#555';
    });
    acceptBtn.addEventListener('mouseleave', () => {
        acceptBtn.style.background = '#2a2a2a';
        acceptBtn.style.borderColor = '#444';
    });
    
    denyBtn.addEventListener('mouseenter', () => {
        denyBtn.style.background = '#333';
        denyBtn.style.borderColor = '#555';
    });
    denyBtn.addEventListener('mouseleave', () => {
        denyBtn.style.background = '#2a2a2a';
        denyBtn.style.borderColor = '#444';
    });
    
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = '#fff');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = '#888');
    
    acceptBtn.addEventListener('click', () => {
        setCookieConsent(true);
        banner.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => banner.remove(), 300);
    });
    
    denyBtn.addEventListener('click', () => {
        setCookieConsent(false);
        banner.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => banner.remove(), 300);
    });
    
    closeBtn.addEventListener('click', () => {
        banner.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => banner.remove(), 300);
    });
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateY(100px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateY(0); opacity: 1; }
            to { transform: translateY(100px); opacity: 0; }
        }
        #cookieBanner > div {
            animation: slideIn 0.4s ease-out;
        }
    `;
    document.head.appendChild(style);
}

// Homepage: Load random featured mods
async function loadRandomMods() {
    const container = document.getElementById('randomModsContainer');
    
    if (!container) {
        return;
    }
    
    // Check cookie consent for localStorage usage
    const consent = getCookieConsent();
    const canUseStorage = consent === 'accepted' || consent === null;
    
    try {
        const response = await fetch('https://api.trainsimarchive.org/api/random-mods?count=10');
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        let mods = data.mods || data;
        
        // Limit to 4 mods
        mods = mods.slice(0, 4);
        
        // Get previously shown mods (only if consent given)
        if (canUseStorage) {
            const lastShown = JSON.parse(sessionStorage.getItem('lastShownMods') || '[]');
            
            // Filter out previously shown mods if possible
            const newMods = mods.filter(mod => !lastShown.includes(mod.id || mod.title));
            
            // If we have enough new mods, use them; otherwise use all mods
            if (newMods.length >= 4) {
                mods = newMods;
            }
            
            // Save current mods to session storage
            sessionStorage.setItem('lastShownMods', JSON.stringify(mods.map(m => m.id || m.title)));
        }
        
        // Map creator slugs to display names and vice versa
        const creatorNames = {
            'trurail': 'TruRail Simulations',
            'cleartracks': 'ClearTracks',
            'uts-creations': 'UTS Creations',
            'east-coast-simulations': 'East Coast Simulations',
            'virtual-rail-creations': 'Virtual Rail Creations'
        };
        
        // Reverse mapping for display names to URLs
        const creatorUrlMap = {
            'TruRail Simulations': 'trurail-simulations',
            'ClearTracks': 'cleartracks',
            'UTS Creations': 'uts-creations',
            'East Coast Simulations': 'east-coast-simulations',
            'Virtual Rail Creations': 'virtual-rail-creations',
            'trurail': 'trurail-simulations',
            'cleartracks': 'cleartracks',
            'uts-creations': 'uts-creations',
            'east-coast-simulations': 'east-coast-simulations'
        };
        
        container.innerHTML = mods.map(mod => {
            const creatorDisplay = creatorNames[mod.creator] || mod.creator;
            const creatorUrl = creatorUrlMap[mod.creator] || creatorUrlMap[creatorDisplay] || mod.creator.toLowerCase().replace(/\s+/g, '-');
            const creatorLink = `${creatorUrl}.html`;
            return `
            <div class="card">
                <img src="${mod.image || 'https://files.trainsimarchive.org/media/tsma-logo.png'}" 
                     alt="${mod.title}" 
                     class="thumbnail" 
                     onclick="window.location='${mod.url}'">
                <div class="mt-2 text-base title clickable">
                    <a href="${mod.url}" class="text-white hover:underline">${mod.title}</a>
                </div>
                <div class="text-gray-400 author clickable">
                    <a href="${creatorLink}" class="hover:underline">${creatorDisplay}</a>
                </div>
            </div>
        `;
        }).join('');
        
        // Fade in the container
        setTimeout(() => {
            container.style.opacity = '1';
        }, 100);
    } catch (error) {
        console.error('Error loading random mods:', error);
        container.innerHTML = '<p class="text-gray-400">Unable to load random mods. Please refresh the page.</p>';
        container.style.opacity = '1';
    }
}

// Shared cache for mods-with-downloads API (eliminates duplicate requests)
let sharedModsCache = null;
let sharedModsFetchPromise = null;

async function fetchModsWithDownloads() {
    // Return cached result if available
    if (sharedModsCache) {
        return sharedModsCache;
    }
    
    // Return existing promise to avoid duplicate requests
    if (sharedModsFetchPromise) {
        return sharedModsFetchPromise;
    }
    
    const cacheKey = 'modsWithDownloads_v1';
    
    // Check session storage first
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && Date.now() - parsed.ts < 1000 * 60 * 60) {
                sharedModsCache = parsed.mods;
                return sharedModsCache;
            }
        }
    } catch (_) {}
    
    // Fetch from API with timeout
    sharedModsFetchPromise = Promise.race([
        fetch('https://api.trainsimarchive.org/api/mods-with-downloads').then(resp => {
            if (!resp.ok) throw new Error('API request failed');
            return resp.json();
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('API timeout')), 5000))
    ]).then(data => {
        const mods = Array.isArray(data.mods) ? data.mods : [];
        
        // Save to session storage
        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), mods }));
        } catch (_) {}
        
        sharedModsCache = mods;
        sharedModsFetchPromise = null;
        return mods;
    }).catch(err => {
        sharedModsFetchPromise = null;
        console.error('Mods API error:', err);
        return [];
    });
    
    return sharedModsFetchPromise;
}

// Homepage: Load top 5 most downloaded mods with clickable links
async function loadTopMods() {
    const container = document.getElementById('topModsContainer');
    if (!container) return;

    try {
        const mods = await fetchModsWithDownloads();
        const topMods = Array.isArray(mods) ? mods.slice(0, 5) : [];
        renderTopMods(topMods, container);
    } catch (err) {
        console.error('Top mods error:', err);
        container.innerHTML =
            '<p class="text-gray-400">Unable to load top mods.</p>';
        container.style.opacity = '1';
    }
}

function renderTopMods(mods, container) {
    if (!Array.isArray(mods) || mods.length === 0) {
        container.innerHTML =
            '<p class="text-gray-400">No mod data available.</p>';
        container.style.opacity = '1';
        return;
    }
    
    // Render ordered list of top mods
    container.innerHTML = `
        <ol class="space-y-2" style="list-style:none;padding-left:0;margin:0;">
            ${mods
                .map((mod, index) => {
                    return `
                <li style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;padding:0.5rem 0;border-bottom:1px solid #333;">
                    <div style="display:flex;align-items:center;gap:0.5rem;flex:1;min-width:0;">
                        <span style="color:#888;font-weight:600;min-width:1.5rem;">${index + 1}.</span>
                        <a href="${mod.pageUrl}" target="_blank" class="text-white hover:underline" style="text-decoration:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${mod.modName}</a>
                    </div>
                    <span class="text-gray-400" style="flex:0 0 auto;text-align:right;min-width:4rem;">${Number(mod.downloadCount || 0).toLocaleString()} DLs</span>
                </li>
            `;
                })
                .join('')}
        </ol>
    `;
    
    container.style.opacity = '1';
}

// Sidebar: Load top 5 most downloaded mods
async function loadTopDownloadsSidebar() {
    const container = document.getElementById('topDownloadsSlidebarContainer');
    if (!container) return;

    try {
        const mods = await fetchModsWithDownloads();
        const topMods = Array.isArray(mods) ? mods.slice(0, 5) : [];
        renderTopDownloadsSidebar(topMods, container);
    } catch (err) {
        console.error('Top downloads sidebar error:', err);
        container.innerHTML =
            '<p class="text-gray-400" style="font-size:0.9rem;">Unable to load top downloads.</p>';
        container.style.opacity = '1';
    }
}

function renderTopDownloadsSidebar(mods, container) {
    if (!Array.isArray(mods) || mods.length === 0) {
        container.innerHTML =
            '<li class="text-gray-400" style="font-size:0.9rem;">No mod data available.</li>';
        container.style.opacity = '1';
        return;
    }
    
    // Render list matching Categories styling with aligned columns
    container.innerHTML = mods
        .map((mod, index) => {
            return `
            <li style="display: flex; gap: 0.5rem; align-items: center;">
                <span style="color: #888; font-weight: 600; min-width: 1.5rem; text-align: right;">${index + 1}.</span>
                <a href="${mod.pageUrl}" target="_blank" class="hover:underline" style="color: #e0e0e0; text-decoration: none; flex: 1; display: flex; justify-content: space-between; align-items: center; gap: 0.5rem;">
                    <span style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${mod.modName}</span>
                    <span style="color: #888; font-size: 0.9rem; flex-shrink: 0; white-space: nowrap;">${Number(mod.downloadCount || 0).toLocaleString()} Downloads</span>
                </a>
            </li>
        `;
        })
        .join('');
    
    container.style.opacity = '1';
}

// Homepage: Load top 5 most downloaded files
async function loadTopDownloads() {
    const container = document.getElementById('topDownloadsContainer');
    if (!container) return;

    const cacheKey = 'topDownloads_v3';

    // Try cache first (1 hour)
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (
                parsed &&
                Array.isArray(parsed.items) &&
                parsed.items.length > 0 &&
                Date.now() - parsed.ts < 1000 * 60 * 60
            ) {
                renderTopDownloads(
                    parsed.items,
                    container,
                    parsed.totalDownloads
                );
                return;
            }
            sessionStorage.removeItem(cacheKey);
        }
    } catch (_) {}

    try {
        const resp = await fetch(
            'https://api.trainsimarchive.org/api/stats/top-downloads'
        );
        if (!resp.ok) throw new Error('API request failed');

        const data = await resp.json();

        // 🔑 Normalize API response (handles all known shapes)
        const totalDownloads = Number(
            data.totalDownloads ??
            data.total_downloads ??
            data.total ??
            0
        );

        const rawList =
            data.top ??
            data.topDownloads ??
            data.downloads ??
            data.data ??
            [];

        const items = Array.isArray(rawList)
            ? rawList.slice(0, 5).map(entry => ({
                filename: entry.filename || entry.file || 'Unknown file',
                downloads: Number(
                    entry.downloads ??
                    entry.count ??
                    entry.download_count ??
                    0
                )
            }))
            : [];

        // Save cache
        try {
            sessionStorage.setItem(
                cacheKey,
                JSON.stringify({
                    ts: Date.now(),
                    totalDownloads,
                    items
                })
            );
        } catch (_) {}

        renderTopDownloads(items, container, totalDownloads);
    } catch (err) {
        console.error('Top downloads error:', err);
        container.innerHTML =
            '<p class="muted">Unable to load download statistics.</p>';
    }
}

function renderTopDownloads(items, container, totalDownloads) {
    if (!Array.isArray(items) || items.length === 0) {
        container.innerHTML =
            '<p class="muted">No download data available.</p>';
        return;
    }
    // Render total downloads and an ordered list styled to match the sidebar
    container.innerHTML = `
        <div class="mb-2" style="color:#9ca3af;font-size:0.95rem;">
            Total downloads: <strong>${Number(totalDownloads || 0).toLocaleString()}</strong>
        </div>
        <ul class="space-y-2" style="list-style:none;padding-left:0;margin:0;">
            ${items
                .slice(0, 5)
                .map((item, index) => {
                    const link = 'files.html?file=' + encodeURIComponent(item.filename);
                    return `
                <li style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;">
                    <a href="${link}" class="text-white" style="text-decoration:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">${index + 1}. ${item.filename}</a>
                    <span class="text-gray-400" style="flex:0 0 auto;">${Number(item.downloads || 0).toLocaleString()}</span>
                </li>
            `;
                })
                .join('')}
        </ul>
    `;
}

// Load archive statistics
async function loadArchiveStats() {
    const statsEl = document.getElementById('archiveStats');
    if (!statsEl) return;
    
    try {
        const response = await fetch('https://api.trainsimarchive.org/api/random-mods?count=1');
        
        if (!response.ok) {
            throw new Error(`Stats API returned ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.total) {
            // Get server date from response headers or use current date
            const lastRefreshResponse = await fetch('https://api.trainsimarchive.org/api/the/the/the/refresh-history');
            const refreshData = await lastRefreshResponse.json();
            
            let dateStr = new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
            
            if (refreshData.logs && refreshData.logs.length > 0) {
                const lastRefresh = new Date(refreshData.logs[0].timestamp);
                dateStr = lastRefresh.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
            }
            
            statsEl.textContent = `We have archived ${data.total} Mods as of ${dateStr}`;
        } else {
            statsEl.textContent = 'We have archived 172 Mods as of 6/15/25';
        }
        
        // Fade in the stats
        setTimeout(() => {
            statsEl.style.opacity = '1';
        }, 100);
    } catch (error) {
        console.error('Error loading archive stats:', error);
        statsEl.textContent = 'We have archived 172 Mods as of 6/15/25';
        statsEl.style.opacity = '1';
    }
}

// ============================================
// SCROLL BUTTONS & SIDEBAR NAVIGATION
// ============================================

// Initialize scroll buttons (back to top / scroll to bottom)
function initScrollButtons() {
    // Check if button already exists
    let backToTopBtn = document.getElementById('backToTop');
    
    // Create back to top button if it doesn't exist
    if (!backToTopBtn) {
        backToTopBtn = document.createElement('button');
        backToTopBtn.id = 'backToTop';
        backToTopBtn.className = 'back-to-top';
        backToTopBtn.setAttribute('aria-label', 'Back to top');
        backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(backToTopBtn);
    }
    
    function handleScroll() {
        const scrollTop = window.scrollY;
        
        // Show back to top when scrolled down past 300px
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }
    
    window.addEventListener('scroll', handleScroll);
    
    // Trigger initial check
    handleScroll();
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Initialize sticky sidebar navigation
function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar-nav-link');
    const sections = document.querySelectorAll('.category-section');
    
    if (sidebarLinks.length === 0 || sections.length === 0) return;
    
    function highlightCurrentSection() {
        let current = '';
        const scrollPos = window.scrollY + 150;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-target') === current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', highlightCurrentSection);
    highlightCurrentSection(); // Run on load
}

// Initialize mobile sidebar toggle button
function initMobileSidebarToggle() {
    const sidebar = document.querySelector('.sticky-sidebar-nav');
    
    if (!sidebar) {
        return;
    }
    
    // Create toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'mobileSidebarToggle';
    toggleBtn.className = 'mobile-sidebar-toggle';
    toggleBtn.setAttribute('aria-label', 'Toggle navigation menu');
    toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
    document.body.appendChild(toggleBtn);
    console.log('Toggle button created and appended');
    
    // Toggle sidebar visibility
    toggleBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-visible');
        this.classList.toggle('active');
        console.log('Toggle clicked, sidebar visible:', sidebar.classList.contains('mobile-visible'));
    });
    
    // Close sidebar when clicking a link
    const sidebarLinks = sidebar.querySelectorAll('.sidebar-nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            sidebar.classList.remove('mobile-visible');
            toggleBtn.classList.remove('active');
            toggleBtn.querySelector('i').className = 'fas fa-bars';
        });
    });
    
    // Close sidebar when clicking outside
    document.addEventListener('click', function(e) {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains('mobile-visible')) {
            sidebar.classList.remove('mobile-visible');
            toggleBtn.classList.remove('active');
        }
    });
}

// Generate dynamic footer
function generateFooter() {
    const footerContainer = document.getElementById('dynamicFooter');
    
    if (!footerContainer) {
        return;
    }
    
    // Check if footer already has content (for static footers)
    const existingContent = footerContainer.querySelector('.footer-content');
    if (existingContent) {
        // Footer already has static content, show immediately
        footerContainer.style.opacity = '1';
        footerContainer.style.transform = 'translateY(0)';
        // Update year for static footers as well
        updateFooterYear(existingContent);
        return;
    }
    
    // Determine if we're in a subdirectory to set correct paths
    const currentPath = window.location.pathname.split('#')[0].split('?')[0];
    const pathWithoutFile = currentPath.substring(0, currentPath.lastIndexOf('/'));
    const folderName = pathWithoutFile.split('/').pop();
    const isInSubdirectory = folderName && folderName !== 'trainsimulatormodarchive';
    
    // Set correct paths based on location
    const termsPath = isInSubdirectory ? '../terms.html' : 'terms.html';
    const privacyPath = isInSubdirectory ? '../privacy.html' : 'privacy.html';
    const supportPath = isInSubdirectory ? '../support.html' : 'support.html';
    
    const footerHTML = `
        <div class="footer-content">
            <div class="footer-nav">
                <a href="${termsPath}">Terms of Use</a>
                <span class="separator">•</span>
                <a href="${privacyPath}">Privacy Policy</a>
                <span class="separator">•</span>
                <a href="${supportPath}">Support Us</a>
                <span class="separator">•</span>
                <a href="https://www.facebook.com/groups/trainsimulatormodarchive" target="_blank" title="Facebook Group">
                    <i class="fab fa-facebook"></i>
                </a>
            </div>
            <p id="footerCopyright" class="footer-copyright">&copy; 2023 - 2026 Train Simulator Mod Archive</p>
        </div>
    `;
    
    footerContainer.innerHTML = footerHTML;
    
    // Show footer immediately
    footerContainer.style.opacity = '1';
    footerContainer.style.transform = 'translateY(0)';

    // Update year based on server date (Cloudflare) with client fallback
    updateFooterYear(footerContainer);
}

// Fetch server Date header (HEAD request) and update footer year text
function updateFooterYear(containerElement) {
    const copyrightEl = containerElement.querySelector('#footerCopyright') || containerElement.querySelector('.footer-copyright');
    if (!copyrightEl) return;

    const baseYear = 2023;

    function applyYear(year) {
        if (!year || isNaN(year)) year = new Date().getFullYear();
        year = Number(year);
        if (year <= baseYear) {
            copyrightEl.textContent = `© ${baseYear} Train Simulator Mod Archive`;
        } else {
            copyrightEl.textContent = `© ${baseYear} - ${year} Train Simulator Mod Archive`;
        }
    }

    // Try to get server time via HEAD request to current origin
    fetch(window.location.href, { method: 'HEAD', cache: 'no-store' })
        .then(response => {
            const dateHeader = response.headers.get('date');
            if (dateHeader) {
                const serverYear = new Date(dateHeader).getFullYear();
                applyYear(serverYear);
            } else {
                applyYear(new Date().getFullYear());
            }
        })
        .catch(() => {
            // Fallback to client time if fetch fails
            applyYear(new Date().getFullYear());
        });
}

