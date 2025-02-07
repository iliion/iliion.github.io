console.clear();

const COLS = 25;
const ROTATIONS = [0, 90, 180, 270];

document.addEventListener('DOMContentLoaded', () => {
    const truchetEl = document.getElementById('truchet');
    if (truchetEl) {
        truchetEl.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
        generateTiles(truchetEl);

        window.addEventListener('resize', () => generateTiles(truchetEl));
    } else {
        console.error('Element with ID "truchet" not found.');
    }
});

// generate spans and fill the wrapper
function generateTiles(truchetEl) {
    truchetEl.innerHTML = '';
  
    // Calculate the number of rows based on the parent height and width
    const tileWidth = truchetEl.clientWidth / COLS;
    const numRows = Math.ceil(truchetEl.clientHeight / tileWidth);
    const numRotations = ROTATIONS.length;
  
    // Limit the number of tiles to prevent memory issues
    const maxTiles = COLS * numRows;
    const maxAllowedTiles = 300; // Adjust this limit as needed

    for (let i = 0; i < Math.min(maxTiles, maxAllowedTiles); i++) {
        const span = document.createElement('span');
        const randomRotation = ROTATIONS[Math.floor(Math.random() * numRotations)];
        span.style.transform = `rotate(${randomRotation}deg)`;
        
        // rotate the span clockwise on mouseover
        span.addEventListener('pointerover', () => {
            const currentRotation = parseInt(span.style.transform.replace(/[^0-9]/g, ''));
            const nextRotation = ROTATIONS[(ROTATIONS.indexOf(currentRotation) + 1) % ROTATIONS.length];
            span.style.transform = `rotate(${nextRotation}deg)`;
        });
        truchetEl.appendChild(span);
    }
}
