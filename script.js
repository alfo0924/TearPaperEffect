class PaperTearEffect {
    constructor() {
        this.canvas = document.getElementById('tearCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.topLayer = document.getElementById('topLayer');
        this.bottomLayer = document.getElementById('bottomLayer');
        this.resetBtn = document.getElementById('resetBtn');
        this.autoTearBtn = document.getElementById('autoTearBtn');

        this.isDrawing = false;
        this.tearPaths = [];
        this.currentPath = [];
        this.tearWidth = 20;

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
        this.redrawTears();
    }

    setupCanvas() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.globalCompositeOperation = 'destination-out';
    }

    bindEvents() {
        // 滑鼠事件 - 確保事件觸發
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

        // 新增滑鼠懸停效果
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
        // 修正座標計算，確保精確度
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    startTear(e) {
        this.isDrawing = true;
        const pos = this.getEventPosition(e);
        this.currentPath = [pos];

        // 添加撕裂音效（視覺反饋）
        this.topLayer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.topLayer.style.transform = 'scale(1.02)';
        }, 100);
    }

    continueTear(e) {
        if (!this.isDrawing) return;

        const pos = this.getEventPosition(e);
        this.currentPath.push(pos);

        // 繪製撕裂效果
        this.drawTearLine(this.currentPath[this.currentPath.length - 2], pos);

        // 創建不規則撕裂邊緣
        this.createJaggedTear(pos);
    }

    drawTearLine(from, to) {
        if (!from || !to) return;

        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.lineWidth = this.tearWidth + Math.random() * 10;
        this.ctx.stroke();
    }

    createJaggedTear(pos) {
        // 創建不規則的撕裂邊緣
        const jaggedPoints = [];
        const numPoints = 8;
        const radius = this.tearWidth / 2;

        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const variance = Math.random() * radius * 0.5;
            const x = pos.x + Math.cos(angle) * (radius + variance);
            const y = pos.y + Math.sin(angle) * (radius + variance);
            jaggedPoints.push({x, y});
        }

        this.ctx.beginPath();
        this.ctx.moveTo(jaggedPoints[0].x, jaggedPoints[0].y);

        for (let i = 1; i < jaggedPoints.length; i++) {
            this.ctx.lineTo(jaggedPoints[i].x, jaggedPoints[i].y);
        }

        this.ctx.closePath();
        this.ctx.fill();
    }

    endTear() {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        if (this.currentPath.length > 0) {
            this.tearPaths.push([...this.currentPath]);
            this.currentPath = [];
        }

        // 檢查是否撕裂足夠大
        this.checkTearCompletion();
        // 重置懸停效果
        this.topLayer.style.transform = 'scale(1)';
    }

    checkTearCompletion() {
        // 計算撕裂面積
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) transparentPixels++;
        }

        const tearPercentage = transparentPixels / (this.canvas.width * this.canvas.height);

        if (tearPercentage > 0.1) { // 如果撕裂超過10%
            this.revealBottomLayer();
        }
    }

    revealBottomLayer() {
        this.bottomLayer.style.transform = 'translateZ(0) rotateX(0deg)';
        this.bottomLayer.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';

        // 添加粒子效果
        this.createParticleEffect();
    }

    createParticleEffect() {
        const particles = [];
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

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2000);
        }

        // 添加粒子動畫CSS
        if (!document.getElementById('particleStyle')) {
            const style = document.createElement('style');
            style.id = 'particleStyle';
            style.textContent = `
                @keyframes particleFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(200px) rotate(360deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    autoTear() {
        // 自動撕裂動畫
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const steps = 50;
        let currentStep = 0;

        const animate = () => {
            if (currentStep >= steps) return;

            const progress = currentStep / steps;
            const angle = progress * Math.PI * 2 * 3; // 3圈螺旋
            const radius = progress * Math.min(this.canvas.width, this.canvas.height) * 0.3;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            // 創建撕裂點
            this.ctx.beginPath();
            this.ctx.arc(x, y, this.tearWidth * (1 + Math.random()), 0, Math.PI * 2);
            this.ctx.fill();

            currentStep++;
            setTimeout(animate, 50);
        };

        animate();

        setTimeout(() => {
            this.revealBottomLayer();
        }, steps * 50 + 500);
    }

    reset() {
        // 重置畫布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.tearPaths = [];
        this.currentPath = [];

        // 重置圖層
        this.topLayer.style.transform = 'scale(1)';
        this.bottomLayer.style.transform = 'translateZ(-10px) rotateX(2deg)';
        this.bottomLayer.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';

        // 移除所有粒子
        const particles = this.topLayer.querySelectorAll('div[style*="particleFall"]');
        particles.forEach(particle => particle.remove());
    }

    redrawTears() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.tearPaths.forEach(path => {
            if (path.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(path[0].x, path[0].y);

            for (let i = 1; i < path.length; i++) {
                this.ctx.lineTo(path[i].x, path[i].y);
            }

            this.ctx.lineWidth = this.tearWidth;
            this.ctx.stroke();
        });
    }
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', () => {
    new PaperTearEffect();
});

// 添加一些額外的視覺效果
document.addEventListener('DOMContentLoaded', () => {
    // 背景動畫
    const container = document.querySelector('.container');

    // 創建浮動元素
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

    // 添加背景動畫CSS
    const backgroundStyle = document.createElement('style');
    backgroundStyle.textContent = `
        @keyframes backgroundFloat {
            0%, 100% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 0.1;
            }
            50% {
                transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) rotate(180deg);
                opacity: 0.3;
            }
        }
    `;
    document.head.appendChild(backgroundStyle);
});
