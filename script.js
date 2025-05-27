const canvas = document.getElementById('paperCanvas');
const ctx = canvas.getContext('2d');
let isTearing = false;
let startX = 0;
let startY = 0;
let tearPath = [];

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;
    drawInitialPaper();
}

// Draw initial paper background
function drawInitialPaper() {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Draw torn effect
function drawTear() {
    ctx.beginPath();
    ctx.moveTo(tearPath[0].x, tearPath[0].y);
    for (let i = 1; i < tearPath.length; i++) {
        ctx.lineTo(tearPath[i].x, tearPath[i].y);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Simulate jagged edge by adding small random deviations
    ctx.strokeStyle = '#c0c0c0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(tearPath[0].x + Math.random() * 2, tearPath[0].y + Math.random() * 2);
    for (let i = 1; i < tearPath.length; i++) {
        ctx.lineTo(tearPath[i].x + Math.random() * 2 - 1, tearPath[i].y + Math.random() * 2 - 1);
    }
    ctx.stroke();
}

// Mouse down event
canvas.addEventListener('mousedown', (e) => {
    isTearing = true;
    canvas.classList.add('tearing');
    startX = e.clientX - canvas.offsetLeft;
    startY = e.clientY - canvas.offsetTop;
    tearPath = [{ x: startX, y: startY }];
});

// Mouse move event
canvas.addEventListener('mousemove', (e) => {
    if (isTearing) {
        const x = e.clientX - canvas.offsetLeft;
        const y = e.clientY - canvas.offsetTop;
        tearPath.push({ x, y });
        drawInitialPaper();
        drawTear();
    }
});

// Mouse up event
canvas.addEventListener('mouseup', () => {
    isTearing = false;
    canvas.classList.remove('tearing');
});

// Mouse leave event
canvas.addEventListener('mouseleave', () => {
    isTearing = false;
    canvas.classList.remove('tearing');
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initialize canvas
resizeCanvas();
