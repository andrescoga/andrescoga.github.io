/**
 * Interactive photo grid effect for information page
 * Splits the image into chunks that rearrange based on cursor position
 */
document.addEventListener('DOMContentLoaded', () => {
    const photoContainer = document.getElementById('interactive-photo');
    const photoGrid = photoContainer.querySelector('.photo-grid');
    
    // Configuration
    const GRID_SIZE = 4; // 4x4 grid for 16 chunks
    const IMAGE_PATH = 'images/andres-portrait-large.jpeg'; // Update to your actual image path
    const MAX_DISPLACEMENT = 15; // Maximum pixel displacement on hover
    const TRANSITION_DURATION = 2; // Duration of transition in seconds
    
    // Initialize the photo grid
    function initPhotoGrid() {
        // Clear any existing content
        photoGrid.innerHTML = '';
        
        // Create the grid of photo chunks
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                // Create chunk container
                const chunkDiv = document.createElement('div');
                chunkDiv.className = 'photo-chunk';
                
                // Create image element
                const img = document.createElement('img');
                img.src = IMAGE_PATH;
                img.alt = "Andrés Escobar portrait chunk";
                
                // Position the image to show the correct portion in this grid cell
                // Without scaling it up - use percentage positioning instead
                const xPos = -col * (100);
                const yPos = -row * (100);
                img.style.transform = `translate(${xPos}%, ${yPos}%)`;
                img.style.width = `${GRID_SIZE * 100}%`;
                img.style.height = `${GRID_SIZE * 100}%`;
                img.style.objectFit = 'cover';
                img.style.objectPosition = '0 0';
                // Set transition duration from configuration
                chunkDiv.style.transitionDuration = `${TRANSITION_DURATION}s`;
                
                // Add image to chunk and chunk to grid
                chunkDiv.appendChild(img);
                photoGrid.appendChild(chunkDiv);
                
                // Store grid position data
                chunkDiv.dataset.row = row;
                chunkDiv.dataset.col = col;
            }
        }
    }
    
    // Add interactive hover effect
    function addHoverEffect() {
        // Store all chunks for quick access
        const chunks = photoGrid.querySelectorAll('.photo-chunk');
        
        // Track mouse position relative to container
        photoContainer.addEventListener('mousemove', (e) => {
            const rect = photoContainer.getBoundingClientRect();
            const mouseX = (e.clientX - rect.left) / rect.width;
            const mouseY = (e.clientY - rect.top) / rect.height;
            
            // Apply transforms to each chunk based on its position and mouse location
            chunks.forEach(chunk => {
                const row = parseInt(chunk.dataset.row);
                const col = parseInt(chunk.dataset.col);
                
                // Calculate distance from center of this chunk to mouse position
                const chunkCenterX = (col + 0.5) / GRID_SIZE;
                const chunkCenterY = (row + 0.5) / GRID_SIZE;
                
                // Distance vector from mouse to chunk center (normalized to 0-1 space)
                const vectorX = chunkCenterX - mouseX;
                const vectorY = chunkCenterY - mouseY;
                
                // Magnitude of displacement based on distance (closer = more movement)
                const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);
                const strength = Math.max(0, 1 - distance * 2); // Fade effect beyond certain distance
                
                // Calculate displacement in pixels, scaled by MAX_DISPLACEMENT
                const moveX = vectorX * strength * MAX_DISPLACEMENT;
                const moveY = vectorY * strength * MAX_DISPLACEMENT;
                
                // Apply transform - push chunks away from cursor with smooth transition
                chunk.style.transform = `translate(${moveX}px, ${moveY}px)`;
            });
        });
        
        // Reset positions when mouse leaves
        photoContainer.addEventListener('mouseleave', () => {
            chunks.forEach(chunk => {
                chunk.style.transform = 'translate(0, 0)';
            });
        });
        
        // Additional effect on click - shuffle the chunks temporarily
        photoContainer.addEventListener('click', () => {
            const positions = [];
            
            // Create array of positions to shuffle
            chunks.forEach((chunk, index) => {
                positions.push(index);
            });
            
            // Shuffle positions array
            for (let i = positions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [positions[i], positions[j]] = [positions[j], positions[i]];
            }
            
            // Apply scrambled positions
            chunks.forEach((chunk, index) => {
                const newPos = positions[index];
                const newRow = Math.floor(newPos / GRID_SIZE);
                const newCol = newPos % GRID_SIZE;
                
                // Move chunk to new scrambled position
                const offsetX = (newCol - parseInt(chunk.dataset.col)) * (100 / GRID_SIZE);
                const offsetY = (newRow - parseInt(chunk.dataset.row)) * (100 / GRID_SIZE);
                
                chunk.style.transform = `translate(${offsetX}%, ${offsetY}%)`;
            });
            
            // Restore original positions after delay
            setTimeout(() => {
                chunks.forEach(chunk => {
                    chunk.style.transform = 'translate(0, 0)';
                });
            }, TRANSITION_DURATION * 1000); // Convert seconds to milliseconds
        });
    }
    
    // Check if the interactive photo container exists before initializing
    if (photoContainer) {
        initPhotoGrid();
        addHoverEffect();
        
        // Support for page transitions and window resize
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // Reset positions when returning to page
                const chunks = photoGrid.querySelectorAll('.photo-chunk');
                chunks.forEach(chunk => {
                    chunk.style.transform = 'translate(0, 0)';
                });
            }
        });
        
        // Re-initialize on window resize for better responsiveness
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                initPhotoGrid();
                addHoverEffect();
            }, 250);
        });
    }
});