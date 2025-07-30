class ImageGallery {
            constructor() {
            this.images = [];
            this.lightbox = null;
            this.loadingOverlay = document.getElementById('loadingOverlay');
            this.loadedCount = 0;
            this.exifPanelElement = null;
            this.exifGridElement = null;
            this.portraitMonitorInterval = null;
            this.init();
        }

    async init() {
        try {
            await this.prepareImages();
            this.renderGallery();
            this.initPhotoSwipe();
            this.initLazyLoading();
        } catch (error) {
            console.error('Error initializing gallery:', error);
            this.hideLoading();
        }
    }

    async prepareImages() {
        const imagePaths = [
            'photo-1.jpg',
            'photo-2.jpg',
            'photo-3.jpg',
            'photo-4.jpg',
            'photo-5.jpg',
            'photo-6.jpg',
            'photo-7.jpg',
            'photo-8.jpg',
            'photo-9.jpg',
            'photo-10.jpg',
            'photo-11.jpg',
            'photo-12.jpg',
            'photo-13.jpg',
            'photo-14.jpg',
            'photo-15.jpg',
            'photo-16.jpg',
            'photo-17.jpg',
            'photo-18.jpg',
            'photo-19.jpg',
            'photo-20.jpg',
            'photo-21.jpg',
            'photo-22.jpg',
            'photo-23.jpg',
            'photo-24.jpg',
            'photo-25.jpg',
            'photo-26.jpg',
            'photo-27.jpg',
            'photo-28.jpg',
            'photo-29.jpg'
        ];

        // Just prepare the image data, don't load yet
        this.images = imagePaths.map(imageName => ({
            src: `images/${imageName}`,
            loaded: false,
            width: 1920, // Default dimensions
            height: 1080
        }));
    }

    renderGallery() {
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        this.images.forEach((image, index) => {
            const item = document.createElement('a');
            item.href = image.src;
            item.className = 'gallery-item';
            item.setAttribute('data-pswp-width', image.width);
            item.setAttribute('data-pswp-height', image.height);
            item.setAttribute('data-index', index);

            const img = document.createElement('img');
            img.alt = '';
            img.style.minHeight = '200px'; // Prevent layout shift
            
            // Don't set src yet - lazy loading will handle it
            img.dataset.src = image.src;

            item.appendChild(img);
            gallery.appendChild(item);
        });

        // Hide loading after gallery is rendered
        setTimeout(() => this.hideLoading(), 500);
    }

    initLazyLoading() {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const item = entry.target;
                    const img = item.querySelector('img');
                    const index = parseInt(item.getAttribute('data-index'));
                    
                    this.loadImage(img, index, item);
                    observer.unobserve(item);
                }
            });
        }, {
            rootMargin: '50px'
        });

        // Observe all gallery items
        document.querySelectorAll('.gallery-item').forEach(item => {
            imageObserver.observe(item);
        });
    }

    async loadImage(imgElement, index, itemElement) {
        try {
            const imageSrc = imgElement.dataset.src;
            
            // Create thumbnail using canvas
            const thumbnailSrc = await this.createThumbnail(imageSrc);
            
            imgElement.src = thumbnailSrc;
            imgElement.onload = () => {
                imgElement.classList.add('loaded');
                itemElement.classList.add('loaded');
                this.images[index].loaded = true;
                this.loadedCount++;
            };
            
            // Update real dimensions for lightbox
            const tempImg = new Image();
            tempImg.onload = () => {
                this.images[index].width = tempImg.naturalWidth;
                this.images[index].height = tempImg.naturalHeight;
                itemElement.setAttribute('data-pswp-width', tempImg.naturalWidth);
                itemElement.setAttribute('data-pswp-height', tempImg.naturalHeight);
            };
            tempImg.src = imageSrc;
            
        } catch (error) {
            console.error('Error loading image:', error);
            itemElement.classList.add('loaded'); // Remove spinner even if failed
        }
    }

    async createThumbnail(imageSrc, maxWidth = 400) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate thumbnail dimensions
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                // Draw resized image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to blob URL for better performance
                canvas.toBlob((blob) => {
                    resolve(URL.createObjectURL(blob));
                }, 'image/jpeg', 0.8);
            };
            
            img.onerror = () => {
                // Fallback to original image
                resolve(imageSrc);
            };
            
            img.src = imageSrc;
        });
    }

    initPhotoSwipe() {
        const lightbox = new PhotoSwipeLightbox({
            gallery: '#gallery',
            children: 'a',
            pswpModule: () => PhotoSwipe,
            
            // Animation
            showHideAnimationType: 'zoom',
            
            // Responsive padding - much smaller on mobile
            padding: this.getResponsivePadding(),
            
            // Zoom
            initialZoomLevel: 'fit',
            secondaryZoomLevel: 1.5,
            maxZoomLevel: 3,
            
            // Gestures and keyboard
            wheelToZoom: true,
            keyboard: true,
            
            // Close button
            closeTitle: 'Close (Esc)',
            
            // Arrow keys
            arrowPrevTitle: 'Previous (arrow left)',
            arrowNextTitle: 'Next (arrow right)',
        });

                    // Load full resolution when lightbox opens
            lightbox.on('change', () => {
                const slide = lightbox.pswp.currSlide;
                if (slide && slide.data.element) {
                    const fullSrc = slide.data.element.href;
                    if (slide.data.src !== fullSrc) {
                        slide.data.src = fullSrc;
                    }
                }
                
                // For navigation between photos, just update content without fade effect
                if (this.exifPanelElement) {
                    // Keep panel visible but update content
                    this.loadExifForCurrentSlide(lightbox.pswp);
                } else {
                    // If no panel exists, create it (first time)
                    setTimeout(() => {
                        this.createExifPanel(lightbox.pswp);
                        this.loadExifForCurrentSlide(lightbox.pswp);
                    }, 100);
                }
            });

                    // Hide arrow buttons on mobile and setup EXIF panel after PhotoSwipe opens
            lightbox.on('afterInit', () => {
                if (window.innerWidth <= 768) {
                    // Use a more reliable delay
                    setTimeout(() => {
                        this.hideArrowsOnMobile();
                    }, 300);
                }
                
                // Create EXIF panel manually and append to slide container
                setTimeout(() => {
                    this.createExifPanel(lightbox.pswp);
                }, 100);
                
                // Load EXIF for initial slide
                setTimeout(() => {
                    this.loadExifForCurrentSlide(lightbox.pswp);
                }, 500);
                
                // Listen for zoom and pan events to reposition panel
                lightbox.pswp.on('zoomPanUpdate', () => {
                    if (this.exifPanelElement && this.exifPanelElement.classList.contains('visible')) {
                        this.positionExifPanel(lightbox.pswp);
                    }
                });

                // Listen for slide content load to handle portrait image repositioning
                lightbox.pswp.on('contentLoad', () => {
                    if (this.exifPanelElement && this.exifPanelElement.classList.contains('visible')) {
                        setTimeout(() => {
                            this.positionExifPanel(lightbox.pswp);
                        }, 100);
                        
                        // Additional delay for portrait images that might reposition later
                        setTimeout(() => {
                            this.positionExifPanel(lightbox.pswp);
                        }, 1500);
                    }
                });

                // Listen for any image repositioning events
                lightbox.pswp.on('imageLoadComplete', () => {
                    if (this.exifPanelElement && this.exifPanelElement.classList.contains('visible')) {
                        setTimeout(() => {
                            this.positionExifPanel(lightbox.pswp);
                        }, 100);
                        
                        // Extra positioning for portrait images after PhotoSwipe settles
                        setTimeout(() => {
                            this.positionExifPanel(lightbox.pswp);
                        }, 1200);
                    }
                });
            });

            // Hide EXIF panel immediately when closing
            lightbox.on('close', () => {
                if (this.exifPanelElement) {
                    this.exifPanelElement.classList.remove('visible');
                }
            });

            // Also hide on beforeClose for even faster response
            lightbox.on('beforeClose', () => {
                if (this.exifPanelElement) {
                    this.exifPanelElement.classList.remove('visible');
                }
            });

        // Update padding on window resize (for device rotation)
        window.addEventListener('resize', () => {
            if (this.lightbox && this.lightbox.pswp) {
                const newPadding = this.getResponsivePadding();
                this.lightbox.pswp.options.padding = newPadding;
                this.lightbox.pswp.updateSize();
            }
        });

        lightbox.init();
        this.lightbox = lightbox;
    }



    createExifPanel(pswp) {
        // Remove any existing panel
        if (this.exifPanelElement) {
            this.exifPanelElement.remove();
        }
        

        
                    // Create EXIF panel element
            this.exifPanelElement = document.createElement('div');
            this.exifPanelElement.className = 'exif-panel';
        
        this.exifGridElement = document.createElement('div');
        this.exifGridElement.className = 'exif-panel-grid';
        
        this.exifPanelElement.appendChild(this.exifGridElement);
        
        // Append to PhotoSwipe's main container for now
                    const pswpElement = document.querySelector('.pswp');
            if (pswpElement) {
                pswpElement.appendChild(this.exifPanelElement);
                console.log('EXIF panel created and appended to PhotoSwipe container');
                
                // Keep panel off-screen until properly positioned
                this.exifPanelElement.style.top = '-1000px';
                this.exifPanelElement.style.left = '-1000px';
            }
    }

    positionExifPanel(pswp) {
        if (!this.exifPanelElement || !pswp.currSlide) return;
        
        const slide = pswp.currSlide;
        
        // Get the image element and its current position (let PhotoSwipe handle positioning)
        const imgElement = slide.container.querySelector('.pswp__img');
        if (!imgElement) {
            console.log('Image element not found');
            return;
        }
        
                    const imgRect = imgElement.getBoundingClientRect();
            
            // Position panel directly underneath the image, matching its width
            // Round to exact pixels to prevent sub-pixel gaps
            const panelTop = Math.round(imgRect.bottom);
            const panelLeft = Math.round(imgRect.left);
            const panelWidth = Math.round(imgRect.width);
            
            // Apply simple positioning with pixel precision
            this.exifPanelElement.style.position = 'fixed';
            this.exifPanelElement.style.left = `${panelLeft}px`;
            this.exifPanelElement.style.width = `${panelWidth}px`;
            this.exifPanelElement.style.top = `${panelTop}px`;
            this.exifPanelElement.style.maxWidth = 'none';
            this.exifPanelElement.style.transform = 'none';
        
        console.log('Simple panel positioning:', {
            imgRect: {
                left: imgRect.left,
                top: imgRect.top,
                width: imgRect.width,
                height: imgRect.height,
                bottom: imgRect.bottom
            },
            panel: {
                left: panelLeft,
                top: panelTop,
                width: panelWidth
            }
        });
    }

    hideArrowsOnMobile() {
        // Conservative approach - only hide specific arrow buttons
        const hideArrows = () => {
            // Only target very specific arrow button selectors
            const arrowSelectors = [
                '.pswp__button--arrow--left',
                '.pswp__button--arrow--right'
            ];
            
            arrowSelectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => {
                    // Only hide, don't remove completely to avoid breaking functionality
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                });
            });
        };

        // Hide after PhotoSwipe is fully loaded
        setTimeout(hideArrows, 100);
    }

    loadExifForCurrentSlide(pswp) {
        console.log('Loading EXIF for current slide...');
        if (!pswp.currSlide) {
            console.log('No current slide');
            return;
        }
        if (!this.exifPanelElement) {
            console.log('No EXIF panel element');
            return;
        }
        
        const slide = pswp.currSlide;
        const imageSrc = slide.data.element ? slide.data.element.href : slide.data.src;
        console.log('Image source:', imageSrc);
        
        this.extractExifData(imageSrc, (exifData) => {
            console.log('EXIF data extracted:', exifData);
            this.displayExifData(exifData);
        });
    }

    extractExifData(imageSrc, callback) {
        console.log('Attempting to extract EXIF from:', imageSrc);
        
        // Try fetch approach first (works better with CORS)
        this.tryFetchExif(imageSrc, callback);
    }

    tryFetchExif(imageSrc, callback) {
        fetch(imageSrc)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const img = new Image();
                const url = URL.createObjectURL(blob);
                
                img.onload = () => {
                    console.log('Image loaded successfully for EXIF extraction');
                    if (typeof EXIF !== 'undefined') {
                        EXIF.getData(img, () => {
                            console.log('EXIF.getData callback executed');
                            const exifData = {
                                camera: EXIF.getTag(img, 'Make') || null,
                                model: EXIF.getTag(img, 'Model') || null,
                                lens: EXIF.getTag(img, 'LensModel') || null,
                                focalLength: EXIF.getTag(img, 'FocalLength') || null,
                                aperture: EXIF.getTag(img, 'FNumber') || null,
                                shutterSpeed: EXIF.getTag(img, 'ExposureTime') || null,
                                iso: EXIF.getTag(img, 'ISOSpeedRatings') || null,
                                dateTime: EXIF.getTag(img, 'DateTime') || null,
                                width: EXIF.getTag(img, 'PixelXDimension') || img.naturalWidth,
                                height: EXIF.getTag(img, 'PixelYDimension') || img.naturalHeight
                            };
                            
                            // Log individual EXIF tags for debugging
                            console.log('Individual EXIF tags:');
                            console.log('Make:', EXIF.getTag(img, 'Make'));
                            console.log('Model:', EXIF.getTag(img, 'Model'));
                            console.log('FocalLength:', EXIF.getTag(img, 'FocalLength'));
                            console.log('FNumber:', EXIF.getTag(img, 'FNumber'));
                            console.log('ExposureTime:', EXIF.getTag(img, 'ExposureTime'));
                            console.log('ISOSpeedRatings:', EXIF.getTag(img, 'ISOSpeedRatings'));
                            
                            URL.revokeObjectURL(url);
                            callback(exifData);
                        });
                    } else {
                        console.log('EXIF library not available');
                        URL.revokeObjectURL(url);
                        callback({
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        });
                    }
                };
                
                img.onerror = () => {
                    console.log('Image failed to load from blob');
                    URL.revokeObjectURL(url);
                    this.fallbackExifExtraction(imageSrc, callback);
                };
                
                img.src = url;
            })
            .catch(error => {
                console.log('Fetch failed, trying fallback method:', error);
                this.fallbackExifExtraction(imageSrc, callback);
            });
    }

    fallbackExifExtraction(imageSrc, callback) {
        console.log('Using fallback EXIF extraction method');
        const img = new Image();
        
        img.onload = () => {
            console.log('Fallback image loaded');
            if (typeof EXIF !== 'undefined') {
                EXIF.getData(img, () => {
                    console.log('Fallback EXIF.getData callback executed');
                    const exifData = {
                        camera: EXIF.getTag(img, 'Make') || null,
                        model: EXIF.getTag(img, 'Model') || null,
                        lens: EXIF.getTag(img, 'LensModel') || null,
                        focalLength: EXIF.getTag(img, 'FocalLength') || null,
                        aperture: EXIF.getTag(img, 'FNumber') || null,
                        shutterSpeed: EXIF.getTag(img, 'ExposureTime') || null,
                        iso: EXIF.getTag(img, 'ISOSpeedRatings') || null,
                        dateTime: EXIF.getTag(img, 'DateTime') || null,
                        width: EXIF.getTag(img, 'PixelXDimension') || img.naturalWidth,
                        height: EXIF.getTag(img, 'PixelYDimension') || img.naturalHeight
                    };
                    callback(exifData);
                });
            } else {
                console.log('EXIF library not available in fallback');
                callback({
                    width: img.naturalWidth,
                    height: img.naturalHeight
                });
            }
        };
        
        img.onerror = () => {
            console.log('Fallback image also failed to load');
            callback({});
        };
        
        // Try without crossOrigin for local files
        img.src = imageSrc;
    }

    displayExifData(exifData) {
        if (!this.exifGridElement) return;
        
        this.exifGridElement.innerHTML = '';
        
        // Build EXIF display items
        const exifItems = [];
        
        if (exifData.camera && exifData.model) {
            exifItems.push({ label: 'Camera', value: `${exifData.camera} ${exifData.model}` });
        } else if (exifData.model) {
            exifItems.push({ label: 'Camera', value: exifData.model });
        }
        
        if (exifData.lens) {
            exifItems.push({ label: 'Lens', value: exifData.lens });
        }
        
        if (exifData.focalLength) {
            const focal = typeof exifData.focalLength === 'object' ? 
                Math.round(exifData.focalLength.numerator / exifData.focalLength.denominator) : 
                Math.round(exifData.focalLength);
            exifItems.push({ label: 'Focal Length', value: `${focal}mm` });
        }
        
        if (exifData.aperture) {
            const aperture = typeof exifData.aperture === 'object' ? 
                (exifData.aperture.numerator / exifData.aperture.denominator).toFixed(1) : 
                exifData.aperture.toFixed(1);
            exifItems.push({ label: 'Aperture', value: `f/${aperture}` });
        }
        
        if (exifData.shutterSpeed) {
            let shutter;
            if (typeof exifData.shutterSpeed === 'object') {
                const speed = exifData.shutterSpeed.numerator / exifData.shutterSpeed.denominator;
                shutter = speed >= 1 ? `${speed}s` : `1/${Math.round(1/speed)}s`;
            } else {
                shutter = exifData.shutterSpeed >= 1 ? `${exifData.shutterSpeed}s` : `1/${Math.round(1/exifData.shutterSpeed)}s`;
            }
            exifItems.push({ label: 'Shutter', value: shutter });
        }
        
                                if (exifData.iso) {
                exifItems.push({ label: 'ISO', value: `${exifData.iso}` });
            }
        
        // Create HTML for each item
        exifItems.forEach(item => {
            const exifItem = document.createElement('div');
            exifItem.className = 'exif-item';
            exifItem.innerHTML = `
                <span class="exif-label">${item.label}:</span>
                <span class="exif-value">${item.value}</span>
            `;
            this.exifGridElement.appendChild(exifItem);
        });
        
                    // Show panel if we have data
            if (exifItems.length > 0) {
                console.log(`Showing EXIF panel with ${exifItems.length} items`);
                
                if (this.lightbox && this.lightbox.pswp) {
                    const isAlreadyVisible = this.exifPanelElement.classList.contains('visible');
                    
                    if (isAlreadyVisible) {
                        // For navigation between photos - just reposition, no fade effect
                        this.positionExifPanel(this.lightbox.pswp);
                        
                        // Quick reposition after content change
                        setTimeout(() => {
                            this.positionExifPanel(this.lightbox.pswp);
                        }, 50);
                        
                        // Start monitoring for portrait image shifts
                        this.startPortraitMonitoring(this.lightbox.pswp);
                    } else {
                        // For initial opening - use full fade effect
                        this.exifPanelElement.classList.remove('visible');
                        
                        // Position multiple times with longer delays to ensure stability
                        setTimeout(() => {
                            this.positionExifPanel(this.lightbox.pswp);
                        }, 50);
                        
                        setTimeout(() => {
                            this.positionExifPanel(this.lightbox.pswp);
                        }, 150);
                        
                        // Final positioning and then show
                        setTimeout(() => {
                            this.positionExifPanel(this.lightbox.pswp);
                            
                            // Only show after final positioning is complete
                            setTimeout(() => {
                                this.exifPanelElement.classList.add('visible');
                                
                                // Start monitoring for portrait image shifts after showing
                                this.startPortraitMonitoring(this.lightbox.pswp);
                            }, 100);
                        }, 250);
                    }
                }
            } else {
                console.log('No EXIF items to display, hiding panel');
                this.exifPanelElement.classList.remove('visible');
            }
    }



    getResponsivePadding() {
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;
        
        // Reserve extra bottom space for EXIF panel
        const exifPanelSpace = 80;
        
        if (isMobile) {
            // Good top margin for mobile, space for EXIF panel at bottom
            return { top: 40, bottom: 15 + exifPanelSpace, left: 15, right: 15 };
        } else if (isTablet) {
            // Good top margin for tablet, space for EXIF panel at bottom
            return { top: 60, bottom: 30 + exifPanelSpace, left: 40, right: 40 };
        } else {
            // Good top margin for desktop, space for EXIF panel at bottom
            return { top: 80, bottom: 40 + exifPanelSpace, left: 100, right: 100 };
        }
    }

            hideLoading() {
            this.loadingOverlay.classList.add('hidden');
            setTimeout(() => {
                this.loadingOverlay.style.display = 'none';
            }, 500);
        }

        startPortraitMonitoring(pswp) {
            // Clear any existing monitoring
            if (this.portraitMonitorInterval) {
                clearInterval(this.portraitMonitorInterval);
            }

            let lastImagePosition = null;

            // Monitor image position for portrait images that might shift
            this.portraitMonitorInterval = setInterval(() => {
                if (!pswp.currSlide || !this.exifPanelElement || !this.exifPanelElement.classList.contains('visible')) {
                    clearInterval(this.portraitMonitorInterval);
                    return;
                }

                const imgElement = pswp.currSlide.container.querySelector('.pswp__img');
                if (!imgElement) return;

                const currentRect = imgElement.getBoundingClientRect();
                const currentPosition = {
                    top: currentRect.top,
                    left: currentRect.left,
                    bottom: currentRect.bottom,
                    width: currentRect.width,
                    height: currentRect.height
                };

                // Check if image position has changed (more sensitive for 1px gaps)
                if (lastImagePosition && 
                    (Math.abs(lastImagePosition.top - currentPosition.top) > 0.5 ||
                     Math.abs(lastImagePosition.bottom - currentPosition.bottom) > 0.5 ||
                     Math.abs(lastImagePosition.left - currentPosition.left) > 0.5 ||
                     Math.abs(lastImagePosition.width - currentPosition.width) > 0.5)) {
                    
                    console.log('Portrait image position changed, repositioning EXIF panel');
                    this.positionExifPanel(pswp);
                }

                lastImagePosition = currentPosition;
            }, 200); // Check every 200ms

            // Stop monitoring after 3 seconds (image should be settled by then)
            setTimeout(() => {
                if (this.portraitMonitorInterval) {
                    clearInterval(this.portraitMonitorInterval);
                    this.portraitMonitorInterval = null;
                }
            }, 3000);
        }
}

// Image protection functions
function addImageProtection() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });

    // Disable key combinations that could be used to save/inspect
    document.addEventListener('keydown', function(e) {
        // Disable F12 (Developer Tools)
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+I (Developer Tools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+C (Inspect Element)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+Shift+J (Console)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+S (Save As)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+A (Select All)
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            return false;
        }
        
        // Disable Ctrl+P (Print)
        if (e.ctrlKey && e.keyCode === 80) {
            e.preventDefault();
            return false;
        }
    });

    // Disable print screen (though this is limited)
    document.addEventListener('keyup', function(e) {
        if (e.keyCode === 44) {
            e.preventDefault();
            return false;
        }
    });

    // Add visual indicator that screenshots/downloads are not allowed
    console.clear();
    console.log('%c⚠️ Image Download Protection Active', 'color: red; font-size: 16px; font-weight: bold;');
    console.log('%cImages in this gallery are protected. Unauthorized downloading is not permitted.', 'color: orange; font-size: 12px;');
}

// Initialize gallery when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Enable image protection first
    addImageProtection();
    
    // Then initialize gallery
    new ImageGallery();
}); 