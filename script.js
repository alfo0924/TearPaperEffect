class PaperTearEffect {
    constructor() {
        this.canvas = document.getElementById('tearCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.topLayer = document.getElementById('topLayer');
        this.bottomLayer = document.getElementById('bottomLayer');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoTearBtn = document.getElementById('autoTearBtn');

        this.isDrawing = false;
        this.lastPos = null;
        this.tearWidth = 30; // 增加撕裂寬度以確保效果明顯

        this.init();
        this.bindEvents();
    }

    init() {
        this.resizeCanvas();
        this.setupCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        const rect = this.topLayer.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'destination-out'; // 確保Canvas透明區域顯示下層
    }

    bindEvents() {
        // 滑鼠事件
        this.topLayer.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.startTear(e);
        });
        this.topLayer.addEventListener('mousemove', (e) => {
            e.preventDefault();
            this.continueTear(e);
        });
        this.topLayer.addEventListener('mouseup', (e) => {
            e.preventDefault();
            this.endTear();
        });
        this.topLayer.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            this.endTear();
        });

        // 滑鼠懸停效果
        this.topLayer.addEventListener('mouseenter', () => {
            this.topLayer.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.2)';
            this.topLayer.style.transform = 'scale(1.02)';
        });
        this.topLayer.addEventListener('mouseleave', () => {
            this.topLayer.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.9)';
            this.topLayer.style.transform = 'scale(1)';
        });

        // 觸控事件
        this.topLayer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startTear(e.touches[0]);
        });
        this.topLayer.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.continueTear(e.touches[0]);
        });
        this.topLayer.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endTear();
        });

        // 按鈕事件
        this.resetBtn.addEventListener('click', () => this.reset());
        this.autoTearBtn.addEventListener('click', () => this.autoTear());
    }

    getEventPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startTear(e) {
        this.isDrawing = true;
        const pos = this.getEventPosition(e);
        this.lastPos = pos;
        // 初始化Canvas繪圖
        this.ctx.beginPath();
        this.ctx.moveTo(pos.x, pos.y);
        // 視覺反饋
        this.topLayer.style.transform = 'scale(0.98)';
    }

    continueTear(e) {
        if (!this.isDrawing || !this.lastPos) return;

        const pos = this.getEventPosition(e);
        // 繪製撕裂線條
        this.ctx.lineTo(pos.x, pos.y);
        this.ctx.lineWidth = this.tearWidth;
        this.ctx.stroke();
        this.lastPos = pos;
        // 檢查撕裂程度
        this.checkTearCompletion();
    }

    endTear() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        this.lastPos = null;
        this.topLayer.style.transform = 'scale(1.02)';
        this.checkTearCompletion();
    }

    checkTearCompletion() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] < 255) transparentPixels++; // 檢查透明度
        }

        const tearPercentage = transparentPixels / (this.canvas.width * this.canvas.height);
        if (tearPercentage > 0.05) { // 降低閾值，確保更容易觸發
            this.revealBottomLayer();
        }
    }

    revealBottomLayer() {
        this.bottomLayer.style.transform = 'translateZ(0) rotateX(0deg)';
        this.bottomLayer.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        this.createParticleEffect();
    }

    createParticleEffect() {
        const numParticles = 20;
        for (let i = 0; i < numParticles; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: #ffffff;
                border-radius: 50%;
                pointer-events: none;
                z-index: 20;
                left: ${Math.random() * this.canvas.width}px;
                top: ${Math.random() * this.canvas.height}px;
                animation: particleFall 2s ease-out forwards;
            `;
            this.topLayer.appendChild(particle);
            setTimeout(() => particle.remove(), 2000);
        }
        if (!document.getElementById('particleStyle')) {
            const style = document.createElement('style');
            style.id = 'particleStyle';
            style.textContent = `
                @keyframes particleFall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    autoTear() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const steps = 30;
        let currentStep = 0;

        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);

        const animate = () => {
            if (currentStep >= steps) {
                this.revealBottomLayer();
                return;
            }
            const progress = currentStep / steps;
            const angle = progress * Math.PI * 2 * 2;
            const radius = progress * Math.min(this.canvas.width, this.canvas.height) * 0.4;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            this.ctx.lineTo(x, y);
            this.ctx.lineWidth = this.tearWidth;
            this.ctx.stroke();

            currentStep++;
            setTimeout(animate, 30);
        };
        animate();
    }

    reset() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.lastPos = null;
        this.topLayer.style.transform = 'scale(1)';
        this.bottomLayer.style.transform = 'translateZ(-10px) rotateX(2deg)';
        this.bottomLayer.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
        const particles = this.topLayer.querySelectorAll('div[style*="particleFall"]');
        particles.forEach(particle => particle.remove());
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new PaperTearEffect();
});

// 背景動畫
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.container');
    for (let i = 0; i < 5; i++) {
        const floatingElement = document.createElement('div');
        floatingElement.style.cssText = `
            position: absolute;
            width: ${Math.random() * 100 + 50}px;
            height: ${Math.random() * 100 + 50}px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: backgroundFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
        `;
        container.appendChild(floatingElement);
    }
    const backgroundStyle = document.createElement('style');
    backgroundStyle.textContent = `
        @keyframes backgroundFloat {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.1; }
            50% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(180deg); opacity: 0.3; }
        }
    `;
    document.head.appendChild(backgroundStyle);
});
