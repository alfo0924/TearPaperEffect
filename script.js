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
        this.fragments = []; // 用於儲存分解的碎片

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
        // 滑鼠事件 - 更新以確保互動有效
        this.topLayer.addEventListener('mousedown', (e) => this.startTear(e));
        document.addEventListener('mousemove', (e) => this.continueTear(e)); // 改為在整個document上監聽mousemove
        document.addEventListener('mouseup', (e) => this.endTear(e)); // 改為在document上監聽mouseup

        // 觸控事件
        this.topLayer.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startTear(e.touches[0]);
        });
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length > 0) {
                this.continueTear(e.touches[0]);
            }
        });
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.endTear(e);
        });

        // 按鈕事件
        this.resetBtn.addEventListener('click', () => this.reset());
        this.autoTearBtn.addEventListener('click', () => this.autoTear());
    }

    getEventPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
            y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
        };
    }

    startTear(e) {
        this.isDrawing = true;
        const pos = this.getEventPosition(e);
        this.currentPath = [pos];

        // 添加撕裂音效（視覺反饋）
        this.topLayer.style.transform = 'scale(0.98)';
        setTimeout(() => {
            this.topLayer.style.transform = 'scale(1)';
        }, 100);
    }

    continueTear(e) {
        if (!this.isDrawing) return;

        const pos = this.getEventPosition(e);
        this.currentPath.push(pos);

        // 繪製撕裂效果
        if (this.currentPath.length > 1) {
            this.drawTearLine(this.currentPath[this.currentPath.length - 2], pos);
        }

        // 創建不規則撕裂邊緣
        this.createJaggedTear(pos);

        // 創建跟隨滑鼠的碎片
        this.createFragment(pos, e.clientX, e.clientY);
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

    createFragment(pos, clientX, clientY) {
        // 創建跟隨滑鼠的碎片
        const fragment = document.createElement('div');
        const size = Math.random() * 20 + 10;
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;

        fragment.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: #ffffff;
            border-radius: ${Math.random() * 10 + 5}px;
            box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
            pointer-events: none;
            z-index: 20;
            left: ${clientX + offsetX}px;
            top: ${clientY + offsetY}px;
            transform: rotate(${Math.random() * 360}deg);
            transition: all 0.3s ease;
        `;

        document.body.appendChild(fragment);
        this.fragments.push({
            element: fragment,
            targetX: clientX + offsetX,
            targetY: clientY + offsetY
        });
    }

    endTear(e) {
        if (!this.isDrawing) return;

        this.isDrawing = false;
        if (this.currentPath.length > 0) {
            this.tearPaths.push([...this.currentPath]);
            this.currentPath = [];
        }

        // 將碎片移動到滑鼠最後的位置
        if (e) {
            const lastPos = { clientX: e.clientX, clientY: e.clientY };
            this.fragments.forEach(fragment => {
                const offsetX = (Math.random() - 0.5) * 50;
                const offsetY = (Math.random() - 0.5) * 50;
                fragment.element.style.left = `${lastPos.clientX + offsetX}px`;
                fragment.element.style.top = `${lastPos.clientY + offsetY}px`;
                fragment.element.style.opacity = '0.8';
                fragment.element.style.animation = 'fragmentFall 2s ease-out forwards';
            });
        }

        // 檢查是否撕裂足夠大
        this.checkTearCompletion();
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
                @keyframes fragmentFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 0.8;
                    }
                    100% {
                        transform: translateY(${Math.random() * 100 + 50}px) rotate(${Math.random() * 360}deg);
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

        // 移除所有粒子和碎片
        const particles = this.topLayer.querySelectorAll('div[style*="particleFall"]');
        particles.forEach(particle => particle.remove());

        this.fragments.forEach(fragment => {
            if (fragment.element.parentNode) {
                fragment.element.parentNode.removeChild(fragment.element);
            }
        });
        this.fragments = [];
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
