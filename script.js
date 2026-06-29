const canvas = document.getElementById("animation-canvas");
const context = canvas.getContext("2d");

const frameCount = 135;
const images = [];
const imageFolder = "./ezgif-283ce4741ba567b9-jpg";

const preloader = document.getElementById("preloader");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");


const scrollIndicator = document.querySelector(".scroll-indicator");
const heroOverlay = document.getElementById("hero-overlay");

// Format the file path for each frame
const currentFrame = index => `${imageFolder}/ezgif-frame-${index.toString().padStart(3, '0')}.jpg`;

// Preload images
let loadedImagesCount = 0;

function preloadImages() {
    return new Promise((resolve) => {
        for (let i = 1; i <= frameCount; i++) {
            const img = new Image();
            img.onload = () => {
                loadedImagesCount++;
                const percentage = Math.round((loadedImagesCount / frameCount) * 100);
                progressBar.style.width = `${percentage}%`;
                progressText.innerText = `${percentage}%`;

                if (loadedImagesCount === frameCount) {
                    setTimeout(() => {
                        preloader.classList.add("fade-out");
                        resolve();
                    }, 500); // Small delay for smooth transition
                }
            };
            img.onerror = () => {
                console.error(`Failed to load image at: ${currentFrame(i)}`);
                // Proceed anyway so application doesn't freeze
                loadedImagesCount++;
                if (loadedImagesCount === frameCount) {
                    preloader.classList.add("fade-out");
                    resolve();
                }
            };
            img.src = currentFrame(i);
            images.push(img);
        }
    });
}

// Fit image into canvas maintaining aspect ratio (similar to CSS background-size: cover)
function drawImageProp(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) {
    if (arguments.length < 2) return;

    // Default values
    x = x || 0;
    y = y || 0;
    w = w || ctx.canvas.width;
    h = h || ctx.canvas.height;

    // Keep aspect ratio
    let nw = img.naturalWidth;
    let nh = img.naturalHeight;
    let ar = nw / nh;
    let cx, cy, cw, ch;

    // Decide which side is the limiting factor
    if (w / h < ar) {
        cw = h * ar;
        ch = h;
        cx = (w - cw) * offsetX;
        cy = 0;
    } else {
        cw = w;
        ch = w / ar;
        cx = 0;
        cy = (h - ch) * offsetY;
    }

    ctx.drawImage(img, cx, cy, cw, ch);
}

// Render frame on canvas
function renderFrame(index) {
    if (images[index]) {
        // Clear canvas
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw centered covered image
        drawImageProp(context, images[index], 0, 0, canvas.width, canvas.height);


    }
}

// Adjust canvas resolution for high DPI (Retina) screens
function resizeCanvas() {
    const scale = window.devicePixelRatio || 1;
    canvas.width = canvas.clientWidth * scale;
    canvas.height = canvas.clientHeight * scale;
    
    // Draw current frame after resize
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );
    renderFrame(frameIndex);
    updateScrollUI(scrollFraction);
}



function updateScrollUI(scrollFraction) {
    // Hide scroll indicator when scrolled down
    if (scrollFraction > 0.05) {
        scrollIndicator.classList.add("hide");
    } else {
        scrollIndicator.classList.remove("hide");
    }

    // Fade out hero overlay up to 30% scroll
    if (heroOverlay) {
        if (scrollFraction >= 0.3) {
            heroOverlay.style.opacity = "0";
            heroOverlay.style.visibility = "hidden";
        } else {
            const opacity = 1 - (scrollFraction / 0.3);
            heroOverlay.style.opacity = opacity.toString();
            heroOverlay.style.visibility = "visible";
        }
    }
}

// Throttle scroll updates with requestAnimationFrame
let lastScrollTop = -1;

function handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop === lastScrollTop) return;
    lastScrollTop = scrollTop;

    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
    
    // Calculate which frame to draw
    const frameIndex = Math.min(
        frameCount - 1,
        Math.floor(scrollFraction * frameCount)
    );

    requestAnimationFrame(() => {
        renderFrame(frameIndex);
        updateScrollUI(scrollFraction);
    });
}

// Initialize application
async function init() {
    // Preload all 135 images first
    await preloadImages();
    
    // Setup initial canvas size
    resizeCanvas();
    
    // Listen for window resize
    window.addEventListener("resize", resizeCanvas);
    
    // Listen for scroll events
    window.addEventListener("scroll", handleScroll, { passive: true });
}

// Kick off
init();
