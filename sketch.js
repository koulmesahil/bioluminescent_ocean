let plankton = [];
let fish = [];

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Initialize plankton
  for (let i = 0; i < 500; i++) {
    plankton.push(new Plankton());
  }

  // Reset button
  document.getElementById('reset').addEventListener('click', () => {
    plankton = [];
    fish = [];
    for (let i = 0; i < 500; i++) plankton.push(new Plankton());
  });
}

function draw() {
  background(0, 20, 40);

  // Update and display plankton
  for (let p of plankton) {
    p.update();
    p.display();
  }

  // Update and display fish
  for (let i = fish.length - 1; i >= 0; i--) {
    fish[i].update();
    fish[i].display();

    // Remove fish if it reaches the cursor (after the initial delay)
    if (fish[i].reachesCursor() && fish[i].canDisappear) {
      fish.splice(i, 1);
    }
  }
}

function mousePressed() {
  // Spawn fish on click
  fish.push(new Fish(mouseX, mouseY));
}

// Plankton class
class Plankton {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.size = random(2, 5);
    this.colorShift = random(100, 255); // Random color shift for each plankton
  }

  update() {
    // Move plankton with Perlin noise
    let angle = noise(this.pos.x * 0.01, this.pos.y * 0.01) * TWO_PI;
    this.vel = p5.Vector.fromAngle(angle).mult(0.5);
    this.pos.add(this.vel);

    // Wrap around screen
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    let col = color(0, this.colorShift, 255, 150); // Fixed opacity
    noStroke();
    fill(col);
    ellipse(this.pos.x, this.pos.y, this.size);
  }
}

// Fish class
class Fish {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-1, 1), random(-1, 1)).mult(2); // Initial random direction
    this.size = random(20, 40);
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
    this.tailAngle = 0;
    this.maxSpeed = 1.5; // Slower movement
    this.randomMoveDuration = 100; // Duration of random movement in frames
    this.randomMoveTimer = 0; // Timer for random movement
    this.canDisappear = false; // Fish cannot disappear immediately
    this.disappearDelay = 60; // Delay before fish can disappear (1 second at 60 FPS)
    this.spawnTime = frameCount; // Record spawn time
  }

  update() {
    // Enable disappearance after the delay
    if (frameCount - this.spawnTime > this.disappearDelay) {
      this.canDisappear = true;
    }

    if (this.randomMoveTimer < this.randomMoveDuration) {
      // Move in a random direction for a short time
      this.randomMoveTimer++;
    } else {
      // Move towards cursor
      let target = createVector(mouseX, mouseY);
      let direction = p5.Vector.sub(target, this.pos).normalize().mult(this.maxSpeed);
      this.vel.lerp(direction, 0.05); // Smooth turning
    }

    this.pos.add(this.vel);

    // Bounce off edges
    if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
    if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;

    // Tail movement
    this.tailAngle = sin(frameCount * 0.1) * 0.5;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(atan2(this.vel.y, this.vel.x));

    // Body
    fill(this.color);
    noStroke();
    ellipse(0, 0, this.size, this.size / 2);

    // Tail
    push();
    translate(-this.size / 2, 0);
    rotate(this.tailAngle);
    triangle(-10, 0, 0, -this.size / 4, 0, this.size / 4);
    pop();

    // Eye
    fill(255);
    ellipse(this.size / 4, -this.size / 8, this.size / 8);

    pop();
  }

  reachesCursor() {
    // Check if fish is close to the cursor
    return dist(this.pos.x, this.pos.y, mouseX, mouseY) < 10; // 10px threshold
  }
}