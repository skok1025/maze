import * as THREE from 'three';

// Simple pseudo-random noise helper
const noise = (x, y) => {
    return Math.sin(x * 12.9898 + y * 78.233) * 43758.5453 % 1;
};

// Gradient helper
const getGradient = (ctx, x, y, width, height, c1, c2) => {
    const grd = ctx.createLinearGradient(x, y, x, y + height);
    grd.addColorStop(0, c1);
    grd.addColorStop(1, c2);
    return grd;
};

export const generateTexture = (type, colorBase, colorDetail) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fill background with base color
    ctx.fillStyle = colorBase;
    ctx.fillRect(0, 0, 512, 512);

    // Apply specific texture logic
    switch (type) {
        case 'brick':
            drawHighQualityBrick(ctx, colorBase, colorDetail);
            break;
        case 'stone':
            drawHighQualityStone(ctx, colorBase, colorDetail);
            break;
        case 'wood':
            drawHighQualityWood(ctx, colorBase, colorDetail);
            break;
        case 'tech':
            drawHighQualityTech(ctx, colorBase, colorDetail);
            break;
        case 'noise':
            drawHighQualityNoise(ctx, colorBase, colorDetail);
            break;
        case 'ice':
            drawHighQualityIce(ctx, colorBase, colorDetail);
            break;
        default:
            break;
    }

    // Add a global vignette/dirt pass for realism
    addVignette(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
};

const addVignette = (ctx) => {
    const grd = ctx.createRadialGradient(256, 256, 128, 256, 256, 360);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.3)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 512, 512);
};

const drawHighQualityBrick = (ctx, base, detail) => {
    const brickH = 64;
    const brickW = 128;

    // Grout color (darker version of base)
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, 512, 512);

    for (let y = 0; y < 512; y += brickH) {
        const offset = (y / brickH) % 2 === 0 ? 0 : brickW / 2;
        for (let x = -brickW; x < 512; x += brickW) {
            // Random variation
            const randomGray = (Math.random() - 0.5) * 20;
            // Parse detail color and adjust (very naive color manipulation approx)
            ctx.fillStyle = detail; // Base brick color

            // Draw Brick
            const pad = 4;
            const bx = x + offset + pad;
            const by = y + pad;
            const bw = brickW - pad * 2;
            const bh = brickH - pad * 2;

            // Gradient for 3D effect
            const grd = ctx.createLinearGradient(bx, by, bx, by + bh);
            grd.addColorStop(0, adjustColorBrightness(detail, 20 + randomGray));
            grd.addColorStop(1, adjustColorBrightness(detail, -20 + randomGray));
            ctx.fillStyle = grd;

            ctx.fillRect(bx, by, bw, bh);

            // Highlight top edge
            ctx.fillStyle = "rgba(255,255,255,0.2)";
            ctx.fillRect(bx, by, bw, 4);

            // Texturize brick
            for (let i = 0; i < 20; i++) {
                ctx.fillStyle = "rgba(0,0,0,0.1)";
                ctx.fillRect(bx + Math.random() * bw, by + Math.random() * bh, 2, 2);
            }
        }
    }
};

const drawHighQualityStone = (ctx, base, detail) => {
    // Cobblestone / Organic look
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 80; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = 30 + Math.random() * 40;

        ctx.beginPath();
        // Irregular circle
        for (let a = 0; a < Math.PI * 2; a += 0.5) {
            const r = size + (Math.random() - 0.5) * 10;
            ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
        }
        ctx.closePath();

        const grd = ctx.createRadialGradient(x - 10, y - 10, 2, x, y, size);
        grd.addColorStop(0, adjustColorBrightness(detail, 30));
        grd.addColorStop(1, adjustColorBrightness(detail, -30));
        ctx.fillStyle = grd;
        ctx.fill();

        // Outline/Shadow
        ctx.strokeStyle = "rgba(0,0,0,0.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
};

const drawHighQualityWood = (ctx, base, detail) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    // Wood Grain
    for (let x = 0; x < 512; x++) {
        let n = 0;
        // Simple 1D noise approximation by layering sines
        n += Math.sin(x * 0.05) * 10;
        n += Math.sin(x * 0.1) * 5;
        n += (Math.random() - 0.5) * 5;

        const alpha = Math.max(0, Math.min(1, (n + 20) / 40));
        ctx.fillStyle = `rgba(0,0,0,${alpha * 0.3})`;
        ctx.fillRect(x, 0, 1, 512);
    }

    // Knots
    for (let i = 0; i < 5; i++) {
        const kx = Math.random() * 512;
        const ky = Math.random() * 512;
        const size = 10 + Math.random() * 20;

        ctx.beginPath();
        ctx.ellipse(kx, ky, size, size * 3, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(50,30,10,0.4)";
        ctx.fill();

        // Swirls around knot
        ctx.strokeStyle = "rgba(60,40,20,0.2)";
        ctx.lineWidth = 2;
        for (let r = size; r < size + 30; r += 5) {
            ctx.beginPath();
            ctx.ellipse(kx, ky, r, r * 3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
};

const drawHighQualityTech = (ctx, base, detail) => {
    // Dark metallic background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, 512, 512);

    // Grid lines
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    for (let i = 0; i < 512; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
    }

    // Glowing circuits
    ctx.strokeStyle = detail;
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = detail;
    ctx.lineCap = 'round';

    for (let i = 0; i < 15; i++) {
        const startX = Math.floor(Math.random() * 8) * 64 + 32;
        const startY = Math.floor(Math.random() * 8) * 64 + 32;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        let cx = startX, cy = startY;

        // Draw path
        for (let j = 0; j < 4; j++) {
            const dir = Math.floor(Math.random() * 4);
            const dist = 64;
            if (dir === 0) cx += dist; // R
            else if (dir === 1) cx -= dist; // L
            else if (dir === 2) cy += dist; // D
            else if (dir === 3) cy -= dist; // U
            ctx.lineTo(cx, cy);
        }
        ctx.stroke();

        // Node
        ctx.fillStyle = detail;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.shadowBlur = 0;
};

const drawHighQualityNoise = (ctx, base, detail) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);

    // Speckles
    for (let i = 0; i < 50000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const shade = Math.random() < 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
        ctx.fillStyle = shade;
        ctx.fillRect(x, y, 2, 2);
    }

    // Clumps (e.g. grass patches or sand dunes)
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const r = 20 + Math.random() * 30;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, detail);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
};

const drawHighQualityIce = (ctx, base, detail) => {
    const grd = ctx.createLinearGradient(0, 0, 512, 512);
    grd.addColorStop(0, "#CCFFFF");
    grd.addColorStop(1, base);
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 512, 512);

    // Deep Cracks
    ctx.strokeStyle = "rgba(255,255,255, 0.8)";
    ctx.lineWidth = 1;
    ctx.shadowColor = "white";
    ctx.shadowBlur = 5;

    for (let i = 0; i < 15; i++) {
        let x = Math.random() * 512;
        let y = Math.random() * 512;
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let j = 0; j < 8; j++) {
            x += (Math.random() - 0.5) * 150;
            y += (Math.random() - 0.5) * 150;
            ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    ctx.shadowBlur = 0;

    // Frosted noise
    ctx.fillStyle = "white";
    for (let i = 0; i < 1000; i++) {
        ctx.globalAlpha = Math.random() * 0.3;
        ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }
    ctx.globalAlpha = 1.0;
};

// Helper for rough color brightness adjustment
function adjustColorBrightness(hex, percent) {
    if (!hex || typeof hex !== 'string') return '#888888';

    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle 3-char hex
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Validate 6-char hex
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) return '#888888';

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.max(0, r + percent));
    g = Math.min(255, Math.max(0, g + percent));
    b = Math.min(255, Math.max(0, b + percent));

    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');

    return "#" + rr + gg + bb;
}
