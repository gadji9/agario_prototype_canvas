const canvas = document.querySelector(`canvas`);
const ctx = canvas.getContext(`2d`);

const TWO_PI = Math.PI * 2;
const MAX_RADIUS = 300;
const WEIGHT_GAIN = 2;
const WEIGHT_LOOSE = 0.2;
const MAX_MASS = 300 * WEIGHT_GAIN;
const SMOOTH = 0.9;
const SPEED = 1;

const MOUSE_RADIUS = 40;

let circles = [];

let mouse;

let identifier = 0;

class Circle {
  constructor() {
    this.id = identifier++;
    this.rad = 1; //
    this.mass = this.rad * 2; //
    this.color = { r: 252, g: 252, b: 3 };
    this.pos = { x: mouse.x, y: mouse.y };
    this.vel = { x: 0, y: 0 };
    this.inited = false;
  }

  draw() {
    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (this.pos.x + this.vel.x - this.rad < 0) {
      this.vel.x = this.vel.x * -1;
      this.pos.x = 0 + this.rad;
    }
    if (this.pos.y + this.vel.y - this.rad < 0) {
      this.vel.y = this.vel.y * -1;
      this.pos.y = 0 + this.rad;
    }

    if (this.pos.x + this.vel.x + this.rad > canvas.width) {
      this.vel.x = this.vel.x * -1;
      this.pos.x = canvas.width - this.rad;
    }
    if (this.pos.y + this.vel.y + this.rad > canvas.height) {
      this.vel.y = this.vel.y * -1;
      this.pos.y = canvas.height - this.rad;
    }

    ctx.fillStyle = `rgb(${this.color.r},${this.color.g},${this.color.b})`;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.rad, 0, TWO_PI);
    ctx.closePath();
    ctx.fill();
  }

  remove() {
    circles = circles.filter((circ) => circ.id !== this.id);
  }

  increaseCircle(size) {
    if (this.rad >= MAX_RADIUS && !size) {
      return;
    }
    this.rad += size || WEIGHT_GAIN;

    this.mass = this.rad * 2;

    this.refreshColor();
  }

  decreaseCircle(size) {
    this.rad -= size || WEIGHT_LOOSE;

    this.mass = this.rad * 2;

    this.refreshColor();
    this.refreshColor();
  }

  refreshColor() {
    this.color = {
      r: this.color.r,
      g: 255 - Math.floor(this.rad * (255 / MAX_RADIUS)),
      b: this.color.b,
    };
  }
}

function init() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

  loop();
}

function handleMouseMove(event) {
  mouse.x = event.layerX;
  mouse.y = event.layerY;
}

function loop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (mouse.down) {
    const lastCircle = circles[circles.length - 1];
    lastCircle.pos = { x: mouse.x, y: mouse.y };

    lastCircle.increaseCircle();
  } else {
    const lastCircle = circles[circles.length - 1];
    if (lastCircle) {
      lastCircle.inited = true;
    }
  }

  updateCircles();

  window.requestAnimationFrame(loop);
}

function updateCircles() {
  for (let i = 0; i < circles.length; i++) {
    let acc = { x: 0, y: 0 };
    const curCircle = circles[i];

    if (!curCircle.inited) {
      continue;
    }
    const mouseDelta = {
      x: curCircle.pos.x - mouse.x,
      y: curCircle.pos.y - mouse.y,
    };
    if (!mouseDelta.x || !mouseDelta.y) {
      continue;
    }
    const mouseDist = Math.sqrt(
      mouseDelta.x * mouseDelta.x + mouseDelta.y * mouseDelta.y
    );

    if (mouseDist < MOUSE_RADIUS + curCircle.rad) {
      const dirX = mouseDelta.x / Math.abs(mouseDelta.x);
      const dirY = mouseDelta.y / Math.abs(mouseDelta.y);
      curCircle.vel.x += dirX;
      curCircle.vel.y += dirY;
    }

    if (curCircle.rad >= MAX_RADIUS / 2) {
      curCircle.decreaseCircle();
    }

    for (let j = 0; j < circles.length; j++) {
      const otherCircle = circles[j];

      let isThreat = false;
      if (i === j) {
        acc.x += ((Math.random() * 2 + -1) * SPEED) / 20;
        acc.y += ((Math.random() * 2 + -1) * SPEED) / 20;
        continue;
      }
      if (curCircle.rad < otherCircle.rad) {
        isThreat = true;
      }

      const delta = {
        x: otherCircle.pos.x - curCircle.pos.x,
        y: otherCircle.pos.y - curCircle.pos.y,
      };
      if (!delta.x || !delta.y) {
        continue;
      }
      const dist = Math.sqrt(delta.x * delta.x + delta.y * delta.y);

      const force = (curCircle.mass * SPEED) / MAX_MASS;
      const dirX = delta.x / Math.abs(delta.x);
      const dirY = delta.y / Math.abs(delta.y);

      acc.x += dirX * force * (isThreat ? -1 : 1);
      acc.y += dirY * force * (isThreat ? -1 : 1);
      try {
        if (dist <= curCircle.rad && otherCircle.inited && curCircle.inited) {
          if (otherCircle) {
            otherCircle.remove();
          }
          curCircle.increaseCircle(otherCircle.rad);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }

    circles[i].vel.x = circles[i].vel.x * SMOOTH + acc.x;
    circles[i].vel.y = circles[i].vel.y * SMOOTH + acc.y;
  }

  circles.map((e) => e.draw());
}

function startDraw() {
  mouse.down = true;
  const newCircle = new Circle();

  circles.push(newCircle);
}

function stopDraw() {
  mouse.down = false;
}

canvas.addEventListener("mousemove", handleMouseMove);

window.addEventListener("mouseup", stopDraw);
window.addEventListener("mousedown", startDraw);

init();
