export interface OrbDrawer {
  drawOrb(x: number, y: number, radius: number): void;
}

class BaseOrb {
  protected drawer: OrbDrawer;
  constructor(drawer: OrbDrawer) {
    this.drawer = drawer;
  }
}

export class Orb extends BaseOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  bounds: { width: number; height: number };

  constructor(
    drawer: OrbDrawer,
    velocity: number,
    bounds: Orb["bounds"],
    radius: number
  ) {
    super(drawer);
    this.x = (Math.random() * bounds.width) | 0;
    this.y = (Math.random() * bounds.height) | 0;
    this.radius = radius;
    this.bounds = bounds;

    var radiant = Math.random() * Math.PI * 2,
      vel = velocity;

    vel *= 0.2;

    this.vx = Math.cos(radiant) * vel;
    this.vy = Math.sin(radiant) * vel;
  }
  step() {
    this.x += this.vx;
    this.y += this.vy;

    var radius = this.radius / 2;

    if (this.x < -radius || this.x > this.bounds.width + radius) this.vx *= -1;

    if (this.y < -radius || this.y > this.bounds.height + radius) this.vy *= -1;

    this.drawer.drawOrb(this.x | 0, this.y | 0, this.radius);
  }
}

export class GuideOrb extends BaseOrb {
  lastRadius!: number;
  lastX!: number;
  lastY!: number;
  deflateDuration: number;

  constructor(drawer: OrbDrawer, deflateDuration: number) {
    super(drawer);
    this.deflateDuration = deflateDuration;
  }

  step(
    size: number,
    sizeToIncrease: number,
    lastSizeTimestamp: number,
    lastPositionTimestamp: number,
    currPos: { x: number; y: number },
    moveBy: {
      x: number;
      y: number;
    }
  ) {
    const deltaTime = Date.now() - lastSizeTimestamp;
    const deltaTimePercent =
      deltaTime > 250 ? 1 : (deltaTime * 100) / 250 / 100;

    const radius = size - (sizeToIncrease - sizeToIncrease * deltaTimePercent);

    this.lastRadius = radius;

    const deltaTimePos = Date.now() - lastPositionTimestamp;
    const deltaTimePosPercent =
      deltaTimePos > this.deflateDuration
        ? 1
        : (deltaTimePos * 100) / this.deflateDuration / 100;

    const translateX = currPos.x - (moveBy.x - moveBy.x * deltaTimePosPercent);
    this.lastX = translateX;
    const translateY = currPos.y - (moveBy.y - moveBy.y * deltaTimePosPercent);
    this.lastY = translateY;

    this.drawer.drawOrb(translateX | 0, translateY | 0, radius);
  }
}
