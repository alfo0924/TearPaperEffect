const tearableArea = document.querySelector('.tearable-area');
let isTearing = false;

tearableArea.addEventListener('mousedown', (e) => {
    isTearing = true;
    tearableArea.style.cursor = 'grabbing';
});

tearableArea.addEventListener('mouseup', () => {
    isTearing = false;
    tearableArea.style.cursor = 'crosshair';
});

tearableArea.addEventListener('mousemove', (e) => {
    if (!isTearing) return;

    const tearSize = 20;
    const x = e.clientX - tearableArea.offsetLeft;
    const y = e.clientY - tearableArea.offsetTop;

    tear(x, y, tearSize);
});

function tear(x, y, size) {
    const canvas = document.createElement('canvas');
    canvas.width = tearableArea.offsetWidth;
    canvas.height = tearableArea.offsetHeight;
    const ctx = canvas.getContext('2d');

    ctx.globalCompositeOperation = 'destination-out';
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    const imgData = canvas.toDataURL();
    tearableArea.style.backgroundImage = `url(${imgData}), linear-gradient(to bottom, #4CAF50, #8BC34A)`;
}
