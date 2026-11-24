const canvas = document.getElementById('bgCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;
let currentScene = 1;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

function goToScene(num) {
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));
  document.getElementById('scene' + num).classList.add('active');
  currentScene = num;
}

// 1. ESTRELLAS COLORIDAS HACIA EL CENTRO (Vórtice / Túnel)
const tunnelColors = ['#00e5ff', '#ff00cc', '#ffea00', '#ffffff', '#7ef9ff', '#ff66b2'];

class TunnelStar {
  constructor() {
    this.reset();
  }
  reset() {
    this.angle = Math.random() * Math.PI * 2;
    this.dist = Math.random() * Math.max(width, height) * 0.75 + 80;
    this.speed = Math.random() * 2.5 + 1.2;
    this.size = Math.random() * 3.5 + 1.5;
    this.color = tunnelColors[Math.floor(Math.random() * tunnelColors.length)];
  }
  update() {
    if (currentScene === 1) {
      this.dist -= this.speed * 1.6;
      if (this.dist <= 15) this.reset();
    } else {
      this.dist -= this.speed * 0.3;
      if (this.dist <= 10) this.reset();
    }
  }
  draw() {
    const x = width / 2 + Math.cos(this.angle) * this.dist;
    const y = height / 2 + Math.sin(this.angle) * this.dist;
    ctx.beginPath();
    ctx.arc(x, y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

// 2. GLOBOS FLOTANTES (Presentes en TODAS las escenas)
const balloonColors = [
  'rgba(255, 64, 129, 0.75)',
  'rgba(0, 229, 255, 0.75)',
  'rgba(255, 215, 64, 0.75)',
  'rgba(179, 136, 255, 0.75)',
  'rgba(255, 110, 199, 0.75)'
];

class Balloon {
  constructor() {
    this.reset(true);
  }
  reset(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + 60;
    this.radiusX = Math.random() * 14 + 14;
    this.radiusY = this.radiusX * 1.25;
    this.speedY = Math.random() * 1.1 + 0.6;
    this.sway = Math.random() * 2;
    this.swaySpeed = Math.random() * 0.02 + 0.01;
    this.color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
  }
  update() {
    this.y -= this.speedY;
    this.sway += this.swaySpeed;
    this.x += Math.sin(this.sway) * 0.6;
    if (this.y < -80) this.reset();
  }
  draw() {
    ctx.save();
    // Cuerda del globo
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + this.radiusY);
    ctx.quadraticCurveTo(this.x + 6, this.y + this.radiusY + 20, this.x - 2, this.y + this.radiusY + 42);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cuerpo del globo
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fill();

    // Brillo del globo
    ctx.beginPath();
    ctx.ellipse(this.x - this.radiusX * 0.3, this.y - this.radiusY * 0.3, this.radiusX * 0.2, this.radiusY * 0.3, -0.4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
    ctx.restore();
  }
}

// 3. ESTRELLAS FUGACES
class ShootingStar {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height * 0.4;
    this.len = Math.random() * 90 + 50;
    this.speed = Math.random() * 8 + 6;
    this.active = false;
  }
  update() {
    if (!this.active) {
      if (Math.random() < (currentScene >= 3 ? 0.025 : 0.008)) this.active = true;
      return;
    }
    this.x += this.speed;
    this.y += this.speed * 0.55;
    if (this.x > width + 100 || this.y > height + 100) this.reset();
  }
  draw() {
    if (!this.active) return;
    const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.len, this.y - this.len * 0.55);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, '#7ef9ff');
    grad.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.len, this.y - this.len * 0.55);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }
}

// 4. FUEGOS ARTIFICIALES EN MOVIMIENTO
let fireworks = [];

class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 5 + 1.5;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.alpha = 1;
    this.decay = Math.random() * 0.018 + 0.012;
    this.color = color;
  }
  update() {
    this.vx *= 0.97;
    this.vy *= 0.97;
    this.vy += 0.05;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= this.decay;
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = Math.max(this.alpha, 0);
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

function spawnFirework() {
  const x = Math.random() * (width * 0.8) + width * 0.1;
  const y = Math.random() * (height * 0.45) + height * 0.1;
  const color = tunnelColors[Math.floor(Math.random() * tunnelColors.length)];
  for (let i = 0; i < 45; i++) {
    fireworks.push(new Particle(x, y, color));
  }
}

// 5. CORAZONES FLOTANTES (Especialmente en Escena 5)
const heartColors = ['#ff1744', '#ff4081', '#ff80ab', '#f50057', '#ff66b2'];

class FloatingHeart {
  constructor() {
    this.reset(true);
  }
  reset(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + 40;
    this.size = Math.random() * 14 + 10;
    this.speedY = Math.random() * 1.4 + 0.8;
    this.sway = Math.random() * Math.PI * 2;
    this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
  }
  update() {
    this.y -= this.speedY;
    this.sway += 0.03;
    this.x += Math.sin(this.sway) * 0.9;
    if (this.y < -50) this.reset();
  }
  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    const s = this.size / 15;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.bezierCurveTo(-12, -7, -22, 6, 0, 22);
    ctx.bezierCurveTo(22, 6, 12, -7, 0, 5);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fill();
    ctx.restore();
  }
}

// Inicializar elementos
const tunnelStars = Array.from({ length: 140 }, () => new TunnelStar());
const balloons = Array.from({ length: 16 }, () => new Balloon());
const shootingStars = Array.from({ length: 4 }, () => new ShootingStar());
const hearts = Array.from({ length: 24 }, () => new FloatingHeart());

function animate() {
  ctx.fillStyle = 'rgba(5, 5, 12, 0.25)';
  ctx.fillRect(0, 0, width, height);

  tunnelStars.forEach(s => { s.update(); s.draw(); });
  shootingStars.forEach(ss => { ss.update(); ss.draw(); });

  const fwChance = currentScene === 2 ? 0.06 : (currentScene === 3 ? 0.035 : (currentScene === 4 ? 0.02 : 0.02));
  if (Math.random() < fwChance) spawnFirework();

  fireworks = fireworks.filter(p => p.alpha > 0);
  fireworks.forEach(p => { p.update(); p.draw(); });

  balloons.forEach(b => { b.update(); b.draw(); });

  if (currentScene === 5) {
    hearts.forEach(h => { h.update(); h.draw(); });
  }

  requestAnimationFrame(animate);
}

animate();