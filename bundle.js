var Gario = (() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, {get: all[name], enumerable: true});
  };

  // src/index.ts
  var src_exports = {};
  __export(src_exports, {
    draw: () => draw,
    keyPressed: () => keyPressed,
    keyReleased: () => keyReleased,
    setup: () => setup
  });

  // src/drawings/drawDebug.ts
  function drawDebug(rectangle) {
    noFill();
    strokeWeight(1);
    stroke(0, 0, 255);
    rect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
    line(rectangle.left, rectangle.top, rectangle.right, rectangle.bottom);
    line(rectangle.right, rectangle.top, rectangle.left, rectangle.bottom);
    noStroke();
    fill(0, 255, 0);
    textAlign(RIGHT, BOTTOM);
    text(`${rectangle.constructor.name}
X:${Math.round(rectangle.x)}px Y:${Math.round(rectangle.y)}px
Width:${Math.round(rectangle.width)}px Height:${Math.round(rectangle.height)}px
Top:${Math.round(rectangle.top)}px Left:${Math.round(rectangle.left)}`, Math.round(rectangle.centerX), Math.round(rectangle.top));
  }

  // src/primary/Rectangle.ts
  var Rectangle = class {
    constructor() {
      this.children = [];
      this.debugMode = false;
    }
    reset() {
      for (const child of this.children)
        child.reset();
    }
    frame() {
      for (const child of this.children)
        child.frame();
    }
    draw() {
      for (const child of this.children)
        child.draw();
    }
    debug() {
      drawDebug(this);
      for (const child of this.children)
        child.debug();
    }
    touch(...rectangles) {
      return rectangles.some((resolvable) => {
        return Rectangle.touch(resolvable, this);
      });
    }
    addChildren(...children) {
      for (const child of children) {
        this.addChild(child);
      }
    }
    addChild(child) {
      this.children.push(child);
      child.parent = this;
    }
    static touch(r1, r2) {
      return r1.left < r2.right && r1.right > r2.left && r1.top < r2.bottom && r1.bottom > r2.top;
    }
  };
  var Rectangle_default = Rectangle;

  // src/primary/Polygon.ts
  var Polygon = class extends Rectangle_default {
    constructor(relX, relY, width2, height2, relZ = 1) {
      super();
      this.relX = relX;
      this.relY = relY;
      this.width = width2;
      this.height = height2;
      this.relZ = relZ;
      this.debugMode = false;
    }
    get x() {
      return this.left;
    }
    get y() {
      return this.top;
    }
    get z() {
      return;
    }
    get left() {
      return this.parent.x + this.relX;
    }
    get top() {
      return this.parent.y + this.relY;
    }
    get right() {
      return this.left + this.width;
    }
    get bottom() {
      return this.top + this.height;
    }
    get centerX() {
      return this.left + this.width / 2;
    }
    get centerY() {
      return this.top + this.height / 2;
    }
    draw() {
      fill(255);
      stroke(0);
      strokeWeight(5);
      rect(this.left, this.top, this.width, this.height, this.height / 3);
      super.draw();
    }
  };
  var Polygon_default = Polygon;

  // src/drawings/drawCheckpoint.ts
  function drawCheckpoint(cp) {
    strokeWeight(5);
    stroke(0);
    if (!cp.obtained) {
      fill(100, 100, 255);
      rect(cp.left + 10, cp.top + 5, cp.width - 10, cp.height / 2);
    } else {
    }
    fill(100);
    rect(cp.left, cp.top, 10, cp.height, 5, 5, 0, 0);
  }

  // src/elements/CheckPoint.ts
  var CheckPoint = class extends Polygon_default {
    constructor(x, y) {
      super(x + 30, y - 60, 60, 60);
      this.obtained = false;
    }
    frame() {
      if (!this.obtained && this.touch(this.parent.party.player)) {
        this.obtained = true;
        this.parent.addSpawn(this);
      }
    }
    reset() {
      this.obtained = false;
    }
    draw() {
      drawCheckpoint(this);
    }
  };
  var CheckPoint_default = CheckPoint;

  // src/elements/Platform.ts
  var Platform = class extends Polygon_default {
    constructor(relX, relY, width2 = 200, height2 = 10, relZ = 1) {
      super(relX, relY, width2, height2, relZ);
    }
  };
  var Platform_default = Platform;

  // src/primary/HitBox.ts
  var HitBox = class extends Rectangle_default {
    constructor(x, y, z, ...children) {
      super();
      this.x = x;
      this.y = y;
      this.z = z;
      this.addChildren(...children);
    }
    get left() {
      return Math.min(...this.children.map((child) => child.left));
    }
    get top() {
      return Math.min(...this.children.map((child) => child.top));
    }
    get right() {
      return Math.max(...this.children.map((child) => child.right));
    }
    get bottom() {
      return Math.max(...this.children.map((child) => child.bottom));
    }
    get width() {
      return this.right - this.left;
    }
    get height() {
      return this.bottom - this.top;
    }
    get centerX() {
      return this.left + this.width / 2;
    }
    get centerY() {
      return this.top + this.height / 2;
    }
  };
  var HitBox_default = HitBox;

  // src/elements/Cursor.ts
  var Cursor = class extends HitBox_default {
    constructor(party2) {
      super(0, 0, 20, new Polygon_default(0, 0, 15, 15));
      this.party = party2;
    }
    frame() {
      this.x = mouseX;
      this.y = mouseY;
    }
    draw() {
      strokeWeight(5);
      fill(255);
      stroke(0);
      rect(this.x, this.y, this.width, this.height, 0, this.width / 2, this.width / 2, this.width / 2);
      if (this.debugMode)
        this.debug();
    }
    debug() {
    }
  };
  var Cursor_default = Cursor;

  // src/elements/Wall.ts
  var Wall = class extends Polygon_default {
  };
  var Wall_default = Wall;

  // src/primary/MoveBox.ts
  var MoveBox = class extends HitBox_default {
    constructor() {
      super(...arguments);
      this.jumpProgress = false;
      this.jumpMaxHeight = 150;
      this.jumpHeight = 0;
      this.speed = {x: 10, y: 15};
      this.velocity = {x: 0, y: 0};
    }
    set(x, y) {
      this.x = x;
      this.y = y;
    }
    setBottom(x, y) {
      this.x = x + this.width / 2;
      this.y = y - this.height;
    }
    add(x, y) {
      this.x += x;
      this.y += y;
    }
    initJump() {
      if (this.onGround()) {
        this.velocity.y = -1;
        this.jumpProgress = true;
        this.jumpHeight = 0;
      }
    }
    onGround() {
      let bottom = -Infinity;
      let foots = [];
      this.children.forEach((child) => {
        if (bottom < child.bottom) {
          bottom = child.bottom;
          foots = [child];
        } else if (bottom == child.bottom) {
          foots.push(child);
        }
      });
      return this.party.level.children.filter((polygon) => {
        return polygon instanceof Platform_default || polygon instanceof Wall_default;
      }).some((polygon) => {
        return foots.some((jambe) => {
          return jambe.bottom > polygon.top && jambe.top < polygon.top && jambe.right > polygon.left && jambe.left < polygon.right;
        });
      });
    }
    fall() {
      this.velocity.y += 0.1;
    }
  };
  var MoveBox_default = MoveBox;

  // src/drawings/drawTrap.ts
  function drawTrap(trap) {
    fill(255, 0, 0);
    stroke(255, 98, 0);
    strokeWeight(random(1, trap.height / 10));
    rect(trap.left, trap.top, trap.width, trap.height, trap.height / 3);
    stroke(255, 217, 0);
    strokeWeight(random(1, trap.height / 20));
    rect(trap.left, trap.top, trap.width, trap.height, trap.height / 3);
    noStroke();
    for (var i = 0; i < (trap.height + trap.width) / 100; i++) {
      let size = random(5, 15);
      fill(255, 100, 30);
      rect(random(trap.left, trap.right), random(trap.top, trap.bottom), size, size);
      size = random(5, 15);
      fill(10);
      rect(random(trap.left, trap.right), random(trap.top, trap.bottom), size, size);
    }
  }

  // src/elements/Trap.ts
  var Trap = class extends Polygon_default {
    draw() {
      drawTrap(this);
    }
  };
  var Trap_default = Trap;

  // src/drawings/drawPlayer.ts
  function drawPlayer(player) {
    const [
      tete,
      brasGauche,
      brasDroit,
      torse,
      jambeGauche,
      jambeDroite
    ] = player.children;
    let centerX = tete.centerX + player.velocity.x * 8, top = tete.top, bottom = tete.bottom;
    if (player.party.keys["38"]) {
      top -= 5;
      bottom -= 5;
    }
    if (player.party.keys["40"]) {
      top += 5;
      bottom += 5;
    }
    strokeWeight(5);
    stroke(0);
    fill(255);
    rect(tete.left, tete.top, tete.width, tete.height, tete.width / 5);
    const lifes = player.vitality;
    noFill();
    if (lifes == 0) {
      line(centerX - 15, top + 15, centerX - 5, top + 30);
      line(centerX - 5, top + 15, centerX - 15, top + 30);
      line(centerX + 15, top + 15, centerX + 5, top + 30);
      line(centerX + 5, top + 15, centerX + 15, top + 30);
    } else {
      line(centerX - 10, top + 15, centerX - 10, top + 30);
      line(centerX + 10, top + 15, centerX + 10, top + 30);
    }
    if (lifes >= 3) {
      bezier(centerX - 10, bottom - 15, centerX - 5, bottom - 10, centerX + 5, bottom - 10, centerX + 10, bottom - 15);
    } else if (lifes == 2) {
      line(centerX - 8, bottom - 15, centerX + 8, bottom - 15);
    } else if (lifes == 1) {
      bezier(centerX - 10, bottom - 10, centerX - 5, bottom - 15, centerX + 5, bottom - 15, centerX + 10, bottom - 10);
    } else {
      bezier(centerX - 10, bottom - 10, centerX - 5, bottom - 20, centerX + 5, bottom - 20, centerX + 10, bottom - 10);
      line(centerX - 10, bottom - 10, centerX + 10, bottom - 10);
    }
    fill(255);
    angleMode(RADIANS);
    push();
    translate(brasGauche.centerX, brasGauche.top + 5);
    rotate(Math.max(player.velocity.x / 3, 0));
    translate(-brasGauche.centerX, -(brasGauche.top + 5));
    rect(brasGauche.left, brasGauche.top, brasGauche.width, brasGauche.height, brasGauche.width / 2, 0, 0, brasGauche.width / 2);
    pop();
    push();
    translate(brasDroit.centerX, brasDroit.top + 5);
    rotate(Math.min(player.velocity.x / 3, 0));
    translate(-brasDroit.centerX, -(brasDroit.top + 5));
    rect(brasDroit.left, brasDroit.top, brasDroit.width, brasDroit.height, 0, brasGauche.width / 2, brasGauche.width / 2, 0);
    pop();
    rect(torse.left, torse.top, torse.width, torse.height, 0, 0, torse.width / 4, torse.width / 4);
    push();
    translate(jambeGauche.centerX, jambeGauche.top + 5);
    rotate(Math.max(map(player.jumpHeight, 0, player.jumpMaxHeight, 0, 0.5) + player.velocity.x / 10, 0));
    translate(-jambeGauche.centerX, -(jambeGauche.top + 5));
    rect(jambeGauche.left, jambeGauche.top, jambeGauche.width, jambeGauche.height, jambeGauche.width / 2, jambeGauche.width / 2, 0, 0);
    pop();
    push();
    translate(jambeDroite.centerX, jambeDroite.top + 5);
    rotate(Math.min(map(player.jumpHeight, 0, player.jumpMaxHeight, 0, -0.5) + player.velocity.x / 10, 0));
    translate(-jambeDroite.centerX, -(jambeDroite.top + 5));
    rect(jambeDroite.left, jambeDroite.top, jambeDroite.width, jambeDroite.height, jambeDroite.width / 2, jambeDroite.width / 2, 0, 0);
    pop();
  }

  // src/elements/Player.ts
  var Player = class extends MoveBox_default {
    constructor(party2) {
      super(party2.level.spawns[0].x, party2.level.spawns[0].y, 2, new Polygon_default(-30, -120, 60, 60, 4), new Polygon_default(-30, -60, 15, 30, 1), new Polygon_default(15, -60, 15, 30, 1), new Polygon_default(-15, -60, 30, 30, 3), new Polygon_default(-15, -30, 15, 30, 2), new Polygon_default(0, -30, 15, 30, 2));
      this.party = party2;
      this.vitality = 3;
    }
    reset() {
      this.vitality = 3;
      this.party.respawn();
    }
    frame() {
      if (this.velocity.y > 1)
        this.velocity.y = 1;
      if (this.velocity.y < -1)
        this.velocity.y = -1;
      if (this.velocity.x > 1)
        this.velocity.x = 1;
      if (this.velocity.x < -1)
        this.velocity.x = -1;
      if (this.velocity.x > -0.1 && this.velocity.x < 0.1) {
        this.velocity.x = 0;
      }
      this.x += this.speed.x * this.velocity.x;
      this.y += this.speed.y * this.velocity.y;
      if (this.party.keys["32"] && this.jumpProgress && this.jumpHeight < this.jumpMaxHeight) {
        this.velocity.y -= 0.1;
      } else {
        this.jumpProgress = false;
      }
      this.jumpHeight += this.speed.y * this.velocity.y * -1;
      if (this.onGround() && this.velocity.y >= 0) {
        this.velocity.y = 0;
        this.jumpHeight = 0;
        while (this.onGround()) {
          this.y--;
        }
        this.y++;
      } else {
        this.fall();
      }
      if (!this.party.keys["37"] == !this.party.keys["39"]) {
        this.velocity.x *= 0.5;
      }
      if (this.party.keys["37"]) {
        this.velocity.x -= 0.2;
      }
      if (this.party.keys["39"]) {
        this.velocity.x += 0.2;
      }
      if (this.touch(...this.party.level.children.filter((child) => child instanceof Trap_default))) {
        this.vitality--;
        this.party.respawn();
        if (this.vitality < 0) {
          this.party.reset();
        }
      }
    }
    draw() {
      drawPlayer(this);
    }
  };
  var Player_default = Player;

  // src/elements/Enemy.ts
  var Enemy = class extends MoveBox_default {
    constructor(x, y, party2, pattern) {
      super(x, y, 0, new Polygon_default(-60, -90, 120, 60, 1), new Polygon_default(-45, -30, 30, 30, 1));
      this.party = party2;
      this.pattern = pattern;
    }
  };
  var Enemy_default = Enemy;

  // src/elements/Level.ts
  var Level = class extends HitBox_default {
    constructor(party2, options) {
      super(0, 0, 1, ...options.polygons);
      this.party = party2;
      this.name = options.name;
      this.enemies = options.enemies;
      this.spawns = [options.spawn];
    }
    addSpawn(polygon) {
      this.spawns.unshift({
        x: polygon.relX + 30,
        y: polygon.relY + 60
      });
    }
    reset() {
      this.x = 0;
      this.y = 0;
      this.spawns = [this.spawns.pop()];
      super.reset();
    }
  };
  var Level_default = Level;

  // src/Party.ts
  var Party = class {
    constructor() {
      this.keys = {};
      this.levelIndex = 0;
      this.debugMode = false;
      this.levels = [
        new Level_default(this, {
          spawn: {
            x: 60,
            y: 120
          },
          name: "Level 1",
          polygons: [
            new Platform_default(0, 120),
            new Platform_default(400, 60),
            new Platform_default(0, -120),
            new Platform_default(-400, -180),
            new Platform_default(0, -400),
            new Platform_default(400, -360),
            new Platform_default(0, -600),
            new Platform_default(-400, -500),
            new Trap_default(-3e3, 200, 6e3, 500),
            new CheckPoint_default(500, 60),
            new CheckPoint_default(-300, -180)
          ],
          enemies: [new Enemy_default(0, 0, this, []), new Enemy_default(0, 0, this, [])]
        })
      ];
      this.player = new Player_default(this);
      this.cursor = new Cursor_default(this);
    }
    get elements() {
      return [this.level, this.player, this.cursor].sort((a, b) => a.z - b.z);
    }
    get level() {
      return this.levels[this.levelIndex];
    }
    respawn() {
      this.level.x = 0;
      this.level.y = 0;
      this.player.set(this.level.spawns[0].x, this.level.spawns[0].y);
      this.player.velocity = {
        x: 0,
        y: 0
      };
    }
    reset() {
      this.elements.forEach((element) => {
        element.reset();
      });
    }
    frame() {
      const distX = this.player.x - width / 2, distY = this.player.y - height / 2;
      this.elements.forEach((element) => {
        element.x -= distX / 10;
        element.y -= distY / 10;
        element.frame();
      });
    }
    draw() {
      this.elements.forEach((element) => {
        element.draw();
      });
      if (this.debugMode)
        this.debug();
    }
    debug() {
      textSize(20);
      fill(255, 0, 255);
      noStroke();
      text(`${this.level.name}
${Math.round(frameRate())} FPS`, width / 2, 50);
    }
  };
  var Party_default = Party;

  // src/index.ts
  document.addEventListener("contextmenu", (event) => event.preventDefault());
  var party;
  function setup() {
    createCanvas(Math.max(document.documentElement.clientWidth, window.innerWidth || 0), Math.max(document.documentElement.clientHeight, window.innerHeight || 0));
    frameRate(50);
    party = new Party_default();
  }
  function draw() {
    party.frame();
    background(20);
    party.draw();
  }
  function keyPressed() {
    party.keys[String(keyCode)] = true;
    if (keyCode == 32) {
      party.player.initJump();
    }
  }
  function keyReleased() {
    party.keys[String(keyCode)] = false;
  }
  return src_exports;
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL2luZGV4LnRzIiwgInNyYy9kcmF3aW5ncy9kcmF3RGVidWcudHMiLCAic3JjL3ByaW1hcnkvUmVjdGFuZ2xlLnRzIiwgInNyYy9wcmltYXJ5L1BvbHlnb24udHMiLCAic3JjL2RyYXdpbmdzL2RyYXdDaGVja3BvaW50LnRzIiwgInNyYy9lbGVtZW50cy9DaGVja1BvaW50LnRzIiwgInNyYy9lbGVtZW50cy9QbGF0Zm9ybS50cyIsICJzcmMvcHJpbWFyeS9IaXRCb3gudHMiLCAic3JjL2VsZW1lbnRzL0N1cnNvci50cyIsICJzcmMvZWxlbWVudHMvV2FsbC50cyIsICJzcmMvcHJpbWFyeS9Nb3ZlQm94LnRzIiwgInNyYy9kcmF3aW5ncy9kcmF3VHJhcC50cyIsICJzcmMvZWxlbWVudHMvVHJhcC50cyIsICJzcmMvZHJhd2luZ3MvZHJhd1BsYXllci50cyIsICJzcmMvZWxlbWVudHMvUGxheWVyLnRzIiwgInNyYy9lbGVtZW50cy9FbmVteS50cyIsICJzcmMvZWxlbWVudHMvTGV2ZWwudHMiLCAic3JjL1BhcnR5LnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyIvLy8gQHRzLWNoZWNrXHJcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi9ub2RlX21vZHVsZXMvQHR5cGVzL3A1L2dsb2JhbC5kLnRzXCIgLz5cclxuXHJcbmltcG9ydCBQYXJ0eSBmcm9tIFwiLi9QYXJ0eVwiXHJcbi8vIGltcG9ydCBDdXJzb3IgZnJvbSBcIi4vZWxlbWVudHMvQ3Vyc29yXCJcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjb250ZXh0bWVudVwiLCAoZXZlbnQpID0+IGV2ZW50LnByZXZlbnREZWZhdWx0KCkpXHJcblxyXG5sZXQgcGFydHk6IFBhcnR5XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gc2V0dXAoKSB7XHJcbiAgY3JlYXRlQ2FudmFzKFxyXG4gICAgTWF0aC5tYXgoZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLCB3aW5kb3cuaW5uZXJXaWR0aCB8fCAwKSxcclxuICAgIE1hdGgubWF4KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsIHdpbmRvdy5pbm5lckhlaWdodCB8fCAwKVxyXG4gIClcclxuICBmcmFtZVJhdGUoNTApXHJcbiAgcGFydHkgPSBuZXcgUGFydHkoKVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZHJhdygpIHtcclxuICBwYXJ0eS5mcmFtZSgpXHJcbiAgYmFja2dyb3VuZCgyMClcclxuICBwYXJ0eS5kcmF3KClcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGtleVByZXNzZWQoKSB7XHJcbiAgcGFydHkua2V5c1tTdHJpbmcoa2V5Q29kZSldID0gdHJ1ZVxyXG4gIGlmIChrZXlDb2RlID09IDMyKSB7XHJcbiAgICBwYXJ0eS5wbGF5ZXIuaW5pdEp1bXAoKVxyXG4gIH1cclxufVxyXG5leHBvcnQgZnVuY3Rpb24ga2V5UmVsZWFzZWQoKSB7XHJcbiAgcGFydHkua2V5c1tTdHJpbmcoa2V5Q29kZSldID0gZmFsc2VcclxufVxyXG5cclxuLy8gZnVuY3Rpb24gbW91c2VQcmVzc2VkKCkge1xyXG4vLyAgIGxldCB0YXJnZXRcclxuLy8gICBpZiAobW91c2VCdXR0b24gPT09IExFRlQpIHtcclxuLy8gICAgIHRhcmdldCA9IHBhcnR5LmN1cnNvci50b3VjaChcclxuLy8gICAgICAgLi4ucGFydHkuZWxlbWVudHNcclxuLy8gICAgICAgICAuZmlsdGVyKChlbGVtZW50KSA9PiB7XHJcbi8vICAgICAgICAgICByZXR1cm4gIShlbGVtZW50IGluc3RhbmNlb2YgQ3Vyc29yKVxyXG4vLyAgICAgICAgIH0pXHJcbi8vICAgICAgICAgLm1hcCgoZWxlbWVudCkgPT4ge1xyXG4vLyAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQucG9seWdvbnNcclxuLy8gICAgICAgICB9KVxyXG4vLyAgICAgICAgIC5mbGF0KClcclxuLy8gICAgIClcclxuLy8gICB9IGVsc2Uge1xyXG4vLyAgICAgdGFyZ2V0ID0gcGFydHkuY3Vyc29yLnRvdWNoKFxyXG4vLyAgICAgICAuLi5wYXJ0eS5lbGVtZW50cy5maWx0ZXIoKGVsZW1lbnQpID0+IHtcclxuLy8gICAgICAgICByZXR1cm4gIShlbGVtZW50IGluc3RhbmNlb2YgQ3Vyc29yKVxyXG4vLyAgICAgICB9KVxyXG4vLyAgICAgKVxyXG4vLyAgIH1cclxuLy8gICBpZiAodGFyZ2V0KSB7XHJcbi8vICAgICB0YXJnZXQuZGVidWdNb2RlID0gIXRhcmdldC5kZWJ1Z01vZGVcclxuLy8gICB9XHJcbi8vIH1cclxuIiwgImltcG9ydCBSZWN0YW5nbGUgZnJvbSBcIi4uL3ByaW1hcnkvUmVjdGFuZ2xlXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRyYXdEZWJ1ZyhyZWN0YW5nbGU6IFJlY3RhbmdsZSkge1xyXG4gIG5vRmlsbCgpXHJcbiAgc3Ryb2tlV2VpZ2h0KDEpXHJcbiAgc3Ryb2tlKDAsIDAsIDI1NSlcclxuICByZWN0KHJlY3RhbmdsZS5sZWZ0LCByZWN0YW5nbGUudG9wLCByZWN0YW5nbGUud2lkdGgsIHJlY3RhbmdsZS5oZWlnaHQpXHJcbiAgbGluZShyZWN0YW5nbGUubGVmdCwgcmVjdGFuZ2xlLnRvcCwgcmVjdGFuZ2xlLnJpZ2h0LCByZWN0YW5nbGUuYm90dG9tKVxyXG4gIGxpbmUocmVjdGFuZ2xlLnJpZ2h0LCByZWN0YW5nbGUudG9wLCByZWN0YW5nbGUubGVmdCwgcmVjdGFuZ2xlLmJvdHRvbSlcclxuICBub1N0cm9rZSgpXHJcbiAgZmlsbCgwLCAyNTUsIDApXHJcbiAgdGV4dEFsaWduKFJJR0hULCBCT1RUT00pXHJcbiAgdGV4dChcclxuICAgIGAke3JlY3RhbmdsZS5jb25zdHJ1Y3Rvci5uYW1lfVxcblg6JHtNYXRoLnJvdW5kKFxyXG4gICAgICByZWN0YW5nbGUueFxyXG4gICAgKX1weCBZOiR7TWF0aC5yb3VuZChyZWN0YW5nbGUueSl9cHhcXG5XaWR0aDoke01hdGgucm91bmQoXHJcbiAgICAgIHJlY3RhbmdsZS53aWR0aFxyXG4gICAgKX1weCBIZWlnaHQ6JHtNYXRoLnJvdW5kKHJlY3RhbmdsZS5oZWlnaHQpfXB4XFxuVG9wOiR7TWF0aC5yb3VuZChcclxuICAgICAgcmVjdGFuZ2xlLnRvcFxyXG4gICAgKX1weCBMZWZ0OiR7TWF0aC5yb3VuZChyZWN0YW5nbGUubGVmdCl9YCxcclxuICAgIE1hdGgucm91bmQocmVjdGFuZ2xlLmNlbnRlclgpLFxyXG4gICAgTWF0aC5yb3VuZChyZWN0YW5nbGUudG9wKVxyXG4gIClcclxufVxyXG4iLCAiaW1wb3J0IGRyYXdEZWJ1ZyBmcm9tIFwiLi4vZHJhd2luZ3MvZHJhd0RlYnVnXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGFic3RyYWN0IGNsYXNzIFJlY3RhbmdsZSB7XHJcbiAgcHVibGljIGNoaWxkcmVuOiBSZWN0YW5nbGVbXSA9IFtdXHJcbiAgcHVibGljIGRlYnVnTW9kZSA9IGZhbHNlXHJcbiAgcHVibGljIHBhcmVudD86IFJlY3RhbmdsZVxyXG5cclxuICBhYnN0cmFjdCB4OiBudW1iZXJcclxuICBhYnN0cmFjdCB5OiBudW1iZXJcclxuICBhYnN0cmFjdCB6OiBudW1iZXJcclxuICBhYnN0cmFjdCBsZWZ0OiBudW1iZXJcclxuICBhYnN0cmFjdCB0b3A6IG51bWJlclxyXG4gIGFic3RyYWN0IHJpZ2h0OiBudW1iZXJcclxuICBhYnN0cmFjdCBib3R0b206IG51bWJlclxyXG4gIGFic3RyYWN0IHdpZHRoOiBudW1iZXJcclxuICBhYnN0cmFjdCBoZWlnaHQ6IG51bWJlclxyXG4gIGFic3RyYWN0IGNlbnRlclg6IG51bWJlclxyXG4gIGFic3RyYWN0IGNlbnRlclk6IG51bWJlclxyXG5cclxuICByZXNldCgpIHtcclxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikgY2hpbGQucmVzZXQoKVxyXG4gIH1cclxuICBmcmFtZSgpIHtcclxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikgY2hpbGQuZnJhbWUoKVxyXG4gIH1cclxuICBkcmF3KCkge1xyXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKSBjaGlsZC5kcmF3KClcclxuICB9XHJcbiAgZGVidWcoKSB7XHJcbiAgICBkcmF3RGVidWcodGhpcylcclxuICAgIGZvciAoY29uc3QgY2hpbGQgb2YgdGhpcy5jaGlsZHJlbikgY2hpbGQuZGVidWcoKVxyXG4gIH1cclxuXHJcbiAgdG91Y2goLi4ucmVjdGFuZ2xlczogUmVjdGFuZ2xlW10pOiBib29sZWFuIHtcclxuICAgIHJldHVybiByZWN0YW5nbGVzLnNvbWUoKHJlc29sdmFibGUpID0+IHtcclxuICAgICAgcmV0dXJuIFJlY3RhbmdsZS50b3VjaChyZXNvbHZhYmxlLCB0aGlzKVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIGFkZENoaWxkcmVuKC4uLmNoaWxkcmVuOiBSZWN0YW5nbGVbXSkge1xyXG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbikge1xyXG4gICAgICB0aGlzLmFkZENoaWxkKGNoaWxkKVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYWRkQ2hpbGQoY2hpbGQ6IFJlY3RhbmdsZSkge1xyXG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKVxyXG4gICAgY2hpbGQucGFyZW50ID0gdGhpc1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIHRvdWNoKHIxOiBSZWN0YW5nbGUsIHIyOiBSZWN0YW5nbGUpIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgIHIxLmxlZnQgPCByMi5yaWdodCAmJlxyXG4gICAgICByMS5yaWdodCA+IHIyLmxlZnQgJiZcclxuICAgICAgcjEudG9wIDwgcjIuYm90dG9tICYmXHJcbiAgICAgIHIxLmJvdHRvbSA+IHIyLnRvcFxyXG4gICAgKVxyXG4gIH1cclxufVxyXG4iLCAiaW1wb3J0IFJlY3RhbmdsZSBmcm9tIFwiLi9SZWN0YW5nbGVcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9seWdvbiBleHRlbmRzIFJlY3RhbmdsZSB7XHJcbiAgcHVibGljIHBhcmVudDogYW55XHJcbiAgcHVibGljIGRlYnVnTW9kZSA9IGZhbHNlXHJcblxyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHJlbFg6IG51bWJlcixcclxuICAgIHB1YmxpYyByZWxZOiBudW1iZXIsXHJcbiAgICBwdWJsaWMgd2lkdGg6IG51bWJlcixcclxuICAgIHB1YmxpYyBoZWlnaHQ6IG51bWJlcixcclxuICAgIHB1YmxpYyByZWxaID0gMVxyXG4gICkge1xyXG4gICAgc3VwZXIoKVxyXG4gIH1cclxuXHJcbiAgZ2V0IHgoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnRcclxuICB9XHJcbiAgZ2V0IHkoKTogbnVtYmVyIHtcclxuICAgIHJldHVybiB0aGlzLnRvcFxyXG4gIH1cclxuICBnZXQgeigpOiBudW1iZXIge1xyXG4gICAgcmV0dXJuXHJcbiAgfVxyXG4gIGdldCBsZWZ0KCkge1xyXG4gICAgcmV0dXJuIHRoaXMucGFyZW50LnggKyB0aGlzLnJlbFhcclxuICB9XHJcbiAgZ2V0IHRvcCgpIHtcclxuICAgIHJldHVybiB0aGlzLnBhcmVudC55ICsgdGhpcy5yZWxZXHJcbiAgfVxyXG4gIGdldCByaWdodCgpIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnQgKyB0aGlzLndpZHRoXHJcbiAgfVxyXG4gIGdldCBib3R0b20oKSB7XHJcbiAgICByZXR1cm4gdGhpcy50b3AgKyB0aGlzLmhlaWdodFxyXG4gIH1cclxuICBnZXQgY2VudGVyWCgpIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnQgKyB0aGlzLndpZHRoIC8gMlxyXG4gIH1cclxuICBnZXQgY2VudGVyWSgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvcCArIHRoaXMuaGVpZ2h0IC8gMlxyXG4gIH1cclxuXHJcbiAgZHJhdygpIHtcclxuICAgIGZpbGwoMjU1KVxyXG4gICAgc3Ryb2tlKDApXHJcbiAgICBzdHJva2VXZWlnaHQoNSlcclxuICAgIHJlY3QodGhpcy5sZWZ0LCB0aGlzLnRvcCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQsIHRoaXMuaGVpZ2h0IC8gMylcclxuICAgIHN1cGVyLmRyYXcoKVxyXG4gIH1cclxufVxyXG4iLCAiaW1wb3J0IENoZWNrUG9pbnQgZnJvbSBcIi4uL2VsZW1lbnRzL0NoZWNrcG9pbnRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZHJhd0NoZWNrcG9pbnQoY3A6IENoZWNrUG9pbnQpIHtcclxuICBzdHJva2VXZWlnaHQoNSlcclxuICBzdHJva2UoMClcclxuICBpZiAoIWNwLm9idGFpbmVkKSB7XHJcbiAgICBmaWxsKDEwMCwgMTAwLCAyNTUpXHJcbiAgICByZWN0KGNwLmxlZnQgKyAxMCwgY3AudG9wICsgNSwgY3Aud2lkdGggLSAxMCwgY3AuaGVpZ2h0IC8gMilcclxuICB9IGVsc2Uge1xyXG4gIH1cclxuICBmaWxsKDEwMClcclxuICByZWN0KGNwLmxlZnQsIGNwLnRvcCwgMTAsIGNwLmhlaWdodCwgNSwgNSwgMCwgMClcclxufVxyXG4iLCAiaW1wb3J0IFBvbHlnb24gZnJvbSBcIi4uL3ByaW1hcnkvUG9seWdvblwiXHJcbmltcG9ydCBkcmF3Q2hlY2twb2ludCBmcm9tIFwiLi4vZHJhd2luZ3MvZHJhd0NoZWNrcG9pbnRcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ2hlY2tQb2ludCBleHRlbmRzIFBvbHlnb24ge1xyXG4gIHB1YmxpYyBvYnRhaW5lZCA9IGZhbHNlXHJcblxyXG4gIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICBzdXBlcih4ICsgMzAsIHkgLSA2MCwgNjAsIDYwKVxyXG4gIH1cclxuXHJcbiAgZnJhbWUoKSB7XHJcbiAgICBpZiAoIXRoaXMub2J0YWluZWQgJiYgdGhpcy50b3VjaCh0aGlzLnBhcmVudC5wYXJ0eS5wbGF5ZXIpKSB7XHJcbiAgICAgIHRoaXMub2J0YWluZWQgPSB0cnVlXHJcbiAgICAgIHRoaXMucGFyZW50LmFkZFNwYXduKHRoaXMpXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNldCgpIHtcclxuICAgIHRoaXMub2J0YWluZWQgPSBmYWxzZVxyXG4gIH1cclxuXHJcbiAgZHJhdygpIHtcclxuICAgIGRyYXdDaGVja3BvaW50KHRoaXMpXHJcbiAgfVxyXG59XHJcbiIsICJpbXBvcnQgUG9seWdvbiBmcm9tIFwiLi4vcHJpbWFyeS9Qb2x5Z29uXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXRmb3JtIGV4dGVuZHMgUG9seWdvbiB7XHJcbiAgY29uc3RydWN0b3IocmVsWDogbnVtYmVyLCByZWxZOiBudW1iZXIsIHdpZHRoID0gMjAwLCBoZWlnaHQgPSAxMCwgcmVsWiA9IDEpIHtcclxuICAgIHN1cGVyKHJlbFgsIHJlbFksIHdpZHRoLCBoZWlnaHQsIHJlbFopXHJcbiAgfVxyXG59XHJcbiIsICJpbXBvcnQgUmVjdGFuZ2xlIGZyb20gXCIuL1JlY3RhbmdsZVwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIaXRCb3ggZXh0ZW5kcyBSZWN0YW5nbGUge1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgcHVibGljIHg6IG51bWJlcixcclxuICAgIHB1YmxpYyB5OiBudW1iZXIsXHJcbiAgICBwdWJsaWMgejogbnVtYmVyLFxyXG4gICAgLi4uY2hpbGRyZW46IFJlY3RhbmdsZVtdXHJcbiAgKSB7XHJcbiAgICBzdXBlcigpXHJcbiAgICB0aGlzLmFkZENoaWxkcmVuKC4uLmNoaWxkcmVuKVxyXG4gIH1cclxuXHJcbiAgZ2V0IGxlZnQoKSB7XHJcbiAgICByZXR1cm4gTWF0aC5taW4oLi4udGhpcy5jaGlsZHJlbi5tYXAoKGNoaWxkKSA9PiBjaGlsZC5sZWZ0KSlcclxuICB9XHJcbiAgZ2V0IHRvcCgpIHtcclxuICAgIHJldHVybiBNYXRoLm1pbiguLi50aGlzLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IGNoaWxkLnRvcCkpXHJcbiAgfVxyXG4gIGdldCByaWdodCgpIHtcclxuICAgIHJldHVybiBNYXRoLm1heCguLi50aGlzLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IGNoaWxkLnJpZ2h0KSlcclxuICB9XHJcbiAgZ2V0IGJvdHRvbSgpIHtcclxuICAgIHJldHVybiBNYXRoLm1heCguLi50aGlzLmNoaWxkcmVuLm1hcCgoY2hpbGQpID0+IGNoaWxkLmJvdHRvbSkpXHJcbiAgfVxyXG4gIGdldCB3aWR0aCgpIHtcclxuICAgIHJldHVybiB0aGlzLnJpZ2h0IC0gdGhpcy5sZWZ0XHJcbiAgfVxyXG4gIGdldCBoZWlnaHQoKSB7XHJcbiAgICByZXR1cm4gdGhpcy5ib3R0b20gLSB0aGlzLnRvcFxyXG4gIH1cclxuICBnZXQgY2VudGVyWCgpIHtcclxuICAgIHJldHVybiB0aGlzLmxlZnQgKyB0aGlzLndpZHRoIC8gMlxyXG4gIH1cclxuICBnZXQgY2VudGVyWSgpIHtcclxuICAgIHJldHVybiB0aGlzLnRvcCArIHRoaXMuaGVpZ2h0IC8gMlxyXG4gIH1cclxufVxyXG4iLCAiaW1wb3J0IEhpdEJveCBmcm9tIFwiLi4vcHJpbWFyeS9IaXRCb3hcIlxyXG5pbXBvcnQgUG9seWdvbiBmcm9tIFwiLi4vcHJpbWFyeS9Qb2x5Z29uXCJcclxuaW1wb3J0IFBhcnR5IGZyb20gXCIuLi9QYXJ0eVwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDdXJzb3IgZXh0ZW5kcyBIaXRCb3gge1xyXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJ0eTogUGFydHkpIHtcclxuICAgIHN1cGVyKDAsIDAsIDIwLCBuZXcgUG9seWdvbigwLCAwLCAxNSwgMTUpKVxyXG4gIH1cclxuXHJcbiAgZnJhbWUoKSB7XHJcbiAgICB0aGlzLnggPSBtb3VzZVhcclxuICAgIHRoaXMueSA9IG1vdXNlWVxyXG4gIH1cclxuXHJcbiAgZHJhdygpIHtcclxuICAgIHN0cm9rZVdlaWdodCg1KVxyXG4gICAgZmlsbCgyNTUpXHJcbiAgICBzdHJva2UoMClcclxuICAgIHJlY3QoXHJcbiAgICAgIHRoaXMueCxcclxuICAgICAgdGhpcy55LFxyXG4gICAgICB0aGlzLndpZHRoLFxyXG4gICAgICB0aGlzLmhlaWdodCxcclxuICAgICAgMCxcclxuICAgICAgdGhpcy53aWR0aCAvIDIsXHJcbiAgICAgIHRoaXMud2lkdGggLyAyLFxyXG4gICAgICB0aGlzLndpZHRoIC8gMlxyXG4gICAgKVxyXG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB0aGlzLmRlYnVnKClcclxuICB9XHJcblxyXG4gIGRlYnVnKCkge1xyXG4gICAgLy8gVE9ETzogYWZmaWNoZXIgWCBldCBZIGR1IHBvaW50IHBvaW50XHUwMEU5XHJcbiAgfVxyXG59XHJcbiIsICJpbXBvcnQgUG9seWdvbiBmcm9tIFwiLi4vcHJpbWFyeS9Qb2x5Z29uXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdhbGwgZXh0ZW5kcyBQb2x5Z29uIHt9XHJcbiIsICJpbXBvcnQgSGl0Qm94IGZyb20gXCIuL0hpdEJveFwiXHJcbmltcG9ydCBQYXJ0eSBmcm9tIFwiLi4vUGFydHlcIlxyXG5pbXBvcnQgUGxhdGZvcm0gZnJvbSBcIi4uL2VsZW1lbnRzL1BsYXRmb3JtXCJcclxuaW1wb3J0IFJlY3RhbmdsZSBmcm9tIFwiLi9SZWN0YW5nbGVcIlxyXG5pbXBvcnQgV2FsbCBmcm9tIFwiLi4vZWxlbWVudHMvV2FsbFwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZlQm94IGV4dGVuZHMgSGl0Qm94IHtcclxuICBwdWJsaWMgcGFydHk6IFBhcnR5XHJcbiAgcHVibGljIGp1bXBQcm9ncmVzcyA9IGZhbHNlXHJcbiAgcHVibGljIGp1bXBNYXhIZWlnaHQgPSAxNTBcclxuICBwdWJsaWMganVtcEhlaWdodCA9IDBcclxuICBwdWJsaWMgc3BlZWQgPSB7IHg6IDEwLCB5OiAxNSB9XHJcbiAgcHVibGljIHZlbG9jaXR5ID0geyB4OiAwLCB5OiAwIH1cclxuXHJcbiAgc2V0KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XHJcbiAgICB0aGlzLnggPSB4XHJcbiAgICB0aGlzLnkgPSB5XHJcbiAgfVxyXG5cclxuICBzZXRCb3R0b20oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgIHRoaXMueCA9IHggKyB0aGlzLndpZHRoIC8gMlxyXG4gICAgdGhpcy55ID0geSAtIHRoaXMuaGVpZ2h0XHJcbiAgfVxyXG5cclxuICBhZGQoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcclxuICAgIHRoaXMueCArPSB4XHJcbiAgICB0aGlzLnkgKz0geVxyXG4gIH1cclxuXHJcbiAgaW5pdEp1bXAoKSB7XHJcbiAgICBpZiAodGhpcy5vbkdyb3VuZCgpKSB7XHJcbiAgICAgIHRoaXMudmVsb2NpdHkueSA9IC0xXHJcbiAgICAgIHRoaXMuanVtcFByb2dyZXNzID0gdHJ1ZVxyXG4gICAgICB0aGlzLmp1bXBIZWlnaHQgPSAwXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBvbkdyb3VuZCgpIHtcclxuICAgIGxldCBib3R0b20gPSAtSW5maW5pdHlcclxuICAgIGxldCBmb290czogUmVjdGFuZ2xlW10gPSBbXVxyXG4gICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCkgPT4ge1xyXG4gICAgICBpZiAoYm90dG9tIDwgY2hpbGQuYm90dG9tKSB7XHJcbiAgICAgICAgYm90dG9tID0gY2hpbGQuYm90dG9tXHJcbiAgICAgICAgZm9vdHMgPSBbY2hpbGRdXHJcbiAgICAgIH0gZWxzZSBpZiAoYm90dG9tID09IGNoaWxkLmJvdHRvbSkge1xyXG4gICAgICAgIGZvb3RzLnB1c2goY2hpbGQpXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICByZXR1cm4gdGhpcy5wYXJ0eS5sZXZlbC5jaGlsZHJlblxyXG4gICAgICAuZmlsdGVyKChwb2x5Z29uKSA9PiB7XHJcbiAgICAgICAgcmV0dXJuIHBvbHlnb24gaW5zdGFuY2VvZiBQbGF0Zm9ybSB8fCBwb2x5Z29uIGluc3RhbmNlb2YgV2FsbFxyXG4gICAgICB9KVxyXG4gICAgICAuc29tZSgocG9seWdvbikgPT4ge1xyXG4gICAgICAgIHJldHVybiBmb290cy5zb21lKChqYW1iZSkgPT4ge1xyXG4gICAgICAgICAgcmV0dXJuIChcclxuICAgICAgICAgICAgamFtYmUuYm90dG9tID4gcG9seWdvbi50b3AgJiZcclxuICAgICAgICAgICAgamFtYmUudG9wIDwgcG9seWdvbi50b3AgJiZcclxuICAgICAgICAgICAgamFtYmUucmlnaHQgPiBwb2x5Z29uLmxlZnQgJiZcclxuICAgICAgICAgICAgamFtYmUubGVmdCA8IHBvbHlnb24ucmlnaHRcclxuICAgICAgICAgIClcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgZmFsbCgpIHtcclxuICAgIHRoaXMudmVsb2NpdHkueSArPSAwLjFcclxuICB9XHJcbn1cclxuIiwgImltcG9ydCBUcmFwIGZyb20gXCIuLi9lbGVtZW50cy9UcmFwXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRyYXdUcmFwKHRyYXA6IFRyYXApIHtcclxuICBmaWxsKDI1NSwgMCwgMClcclxuICBzdHJva2UoMjU1LCA5OCwgMClcclxuICBzdHJva2VXZWlnaHQocmFuZG9tKDEsIHRyYXAuaGVpZ2h0IC8gMTApKVxyXG4gIHJlY3QodHJhcC5sZWZ0LCB0cmFwLnRvcCwgdHJhcC53aWR0aCwgdHJhcC5oZWlnaHQsIHRyYXAuaGVpZ2h0IC8gMylcclxuICBzdHJva2UoMjU1LCAyMTcsIDApXHJcbiAgc3Ryb2tlV2VpZ2h0KHJhbmRvbSgxLCB0cmFwLmhlaWdodCAvIDIwKSlcclxuICByZWN0KHRyYXAubGVmdCwgdHJhcC50b3AsIHRyYXAud2lkdGgsIHRyYXAuaGVpZ2h0LCB0cmFwLmhlaWdodCAvIDMpXHJcbiAgbm9TdHJva2UoKVxyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgKHRyYXAuaGVpZ2h0ICsgdHJhcC53aWR0aCkgLyAxMDA7IGkrKykge1xyXG4gICAgbGV0IHNpemUgPSByYW5kb20oNSwgMTUpXHJcbiAgICBmaWxsKDI1NSwgMTAwLCAzMClcclxuICAgIHJlY3QoXHJcbiAgICAgIHJhbmRvbSh0cmFwLmxlZnQsIHRyYXAucmlnaHQpLFxyXG4gICAgICByYW5kb20odHJhcC50b3AsIHRyYXAuYm90dG9tKSxcclxuICAgICAgc2l6ZSxcclxuICAgICAgc2l6ZVxyXG4gICAgKVxyXG4gICAgc2l6ZSA9IHJhbmRvbSg1LCAxNSlcclxuICAgIGZpbGwoMTApXHJcbiAgICByZWN0KFxyXG4gICAgICByYW5kb20odHJhcC5sZWZ0LCB0cmFwLnJpZ2h0KSxcclxuICAgICAgcmFuZG9tKHRyYXAudG9wLCB0cmFwLmJvdHRvbSksXHJcbiAgICAgIHNpemUsXHJcbiAgICAgIHNpemVcclxuICAgIClcclxuICB9XHJcbn1cclxuIiwgImltcG9ydCBQb2x5Z29uIGZyb20gXCIuLi9wcmltYXJ5L1BvbHlnb25cIlxyXG5pbXBvcnQgZHJhd1RyYXAgZnJvbSBcIi4uL2RyYXdpbmdzL2RyYXdUcmFwXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYXAgZXh0ZW5kcyBQb2x5Z29uIHtcclxuICBkcmF3KCkge1xyXG4gICAgZHJhd1RyYXAodGhpcylcclxuICB9XHJcbn1cclxuIiwgImltcG9ydCBQbGF5ZXIgZnJvbSBcIi4uL2VsZW1lbnRzL1BsYXllclwiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkcmF3UGxheWVyKHBsYXllcjogUGxheWVyKSB7XHJcbiAgY29uc3QgW1xyXG4gICAgdGV0ZSxcclxuICAgIGJyYXNHYXVjaGUsXHJcbiAgICBicmFzRHJvaXQsXHJcbiAgICB0b3JzZSxcclxuICAgIGphbWJlR2F1Y2hlLFxyXG4gICAgamFtYmVEcm9pdGUsXHJcbiAgXSA9IHBsYXllci5jaGlsZHJlblxyXG5cclxuICAvLyB0ZXRlXHJcbiAgbGV0IGNlbnRlclggPSB0ZXRlLmNlbnRlclggKyBwbGF5ZXIudmVsb2NpdHkueCAqIDgsXHJcbiAgICB0b3AgPSB0ZXRlLnRvcCxcclxuICAgIGJvdHRvbSA9IHRldGUuYm90dG9tXHJcblxyXG4gIGlmIChwbGF5ZXIucGFydHkua2V5c1tcIjM4XCJdKSB7XHJcbiAgICB0b3AgLT0gNVxyXG4gICAgYm90dG9tIC09IDVcclxuICB9XHJcbiAgaWYgKHBsYXllci5wYXJ0eS5rZXlzW1wiNDBcIl0pIHtcclxuICAgIHRvcCArPSA1XHJcbiAgICBib3R0b20gKz0gNVxyXG4gIH1cclxuICBzdHJva2VXZWlnaHQoNSlcclxuICBzdHJva2UoMClcclxuICBmaWxsKDI1NSlcclxuICByZWN0KHRldGUubGVmdCwgdGV0ZS50b3AsIHRldGUud2lkdGgsIHRldGUuaGVpZ2h0LCB0ZXRlLndpZHRoIC8gNSlcclxuXHJcbiAgY29uc3QgbGlmZXMgPSBwbGF5ZXIudml0YWxpdHlcclxuXHJcbiAgLy8geWV1eFxyXG4gIG5vRmlsbCgpXHJcbiAgaWYgKGxpZmVzID09IDApIHtcclxuICAgIGxpbmUoY2VudGVyWCAtIDE1LCB0b3AgKyAxNSwgY2VudGVyWCAtIDUsIHRvcCArIDMwKVxyXG4gICAgbGluZShjZW50ZXJYIC0gNSwgdG9wICsgMTUsIGNlbnRlclggLSAxNSwgdG9wICsgMzApXHJcbiAgICBsaW5lKGNlbnRlclggKyAxNSwgdG9wICsgMTUsIGNlbnRlclggKyA1LCB0b3AgKyAzMClcclxuICAgIGxpbmUoY2VudGVyWCArIDUsIHRvcCArIDE1LCBjZW50ZXJYICsgMTUsIHRvcCArIDMwKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBsaW5lKGNlbnRlclggLSAxMCwgdG9wICsgMTUsIGNlbnRlclggLSAxMCwgdG9wICsgMzApXHJcbiAgICBsaW5lKGNlbnRlclggKyAxMCwgdG9wICsgMTUsIGNlbnRlclggKyAxMCwgdG9wICsgMzApXHJcbiAgfVxyXG5cclxuICAvLyBib3VjaGVcclxuICBpZiAobGlmZXMgPj0gMykge1xyXG4gICAgYmV6aWVyKFxyXG4gICAgICBjZW50ZXJYIC0gMTAsXHJcbiAgICAgIGJvdHRvbSAtIDE1LFxyXG4gICAgICBjZW50ZXJYIC0gNSxcclxuICAgICAgYm90dG9tIC0gMTAsXHJcbiAgICAgIGNlbnRlclggKyA1LFxyXG4gICAgICBib3R0b20gLSAxMCxcclxuICAgICAgY2VudGVyWCArIDEwLFxyXG4gICAgICBib3R0b20gLSAxNVxyXG4gICAgKVxyXG4gIH0gZWxzZSBpZiAobGlmZXMgPT0gMikge1xyXG4gICAgbGluZShjZW50ZXJYIC0gOCwgYm90dG9tIC0gMTUsIGNlbnRlclggKyA4LCBib3R0b20gLSAxNSlcclxuICB9IGVsc2UgaWYgKGxpZmVzID09IDEpIHtcclxuICAgIGJlemllcihcclxuICAgICAgY2VudGVyWCAtIDEwLFxyXG4gICAgICBib3R0b20gLSAxMCxcclxuICAgICAgY2VudGVyWCAtIDUsXHJcbiAgICAgIGJvdHRvbSAtIDE1LFxyXG4gICAgICBjZW50ZXJYICsgNSxcclxuICAgICAgYm90dG9tIC0gMTUsXHJcbiAgICAgIGNlbnRlclggKyAxMCxcclxuICAgICAgYm90dG9tIC0gMTBcclxuICAgIClcclxuICB9IGVsc2Uge1xyXG4gICAgYmV6aWVyKFxyXG4gICAgICBjZW50ZXJYIC0gMTAsXHJcbiAgICAgIGJvdHRvbSAtIDEwLFxyXG4gICAgICBjZW50ZXJYIC0gNSxcclxuICAgICAgYm90dG9tIC0gMjAsXHJcbiAgICAgIGNlbnRlclggKyA1LFxyXG4gICAgICBib3R0b20gLSAyMCxcclxuICAgICAgY2VudGVyWCArIDEwLFxyXG4gICAgICBib3R0b20gLSAxMFxyXG4gICAgKVxyXG4gICAgbGluZShjZW50ZXJYIC0gMTAsIGJvdHRvbSAtIDEwLCBjZW50ZXJYICsgMTAsIGJvdHRvbSAtIDEwKVxyXG4gIH1cclxuXHJcbiAgLy8gYnJhcyBnYXVjaGVcclxuICBmaWxsKDI1NSlcclxuICBhbmdsZU1vZGUoUkFESUFOUylcclxuICBwdXNoKClcclxuICB0cmFuc2xhdGUoYnJhc0dhdWNoZS5jZW50ZXJYLCBicmFzR2F1Y2hlLnRvcCArIDUpXHJcbiAgcm90YXRlKE1hdGgubWF4KHBsYXllci52ZWxvY2l0eS54IC8gMywgMCkpXHJcbiAgdHJhbnNsYXRlKC1icmFzR2F1Y2hlLmNlbnRlclgsIC0oYnJhc0dhdWNoZS50b3AgKyA1KSlcclxuICByZWN0KFxyXG4gICAgYnJhc0dhdWNoZS5sZWZ0LFxyXG4gICAgYnJhc0dhdWNoZS50b3AsXHJcbiAgICBicmFzR2F1Y2hlLndpZHRoLFxyXG4gICAgYnJhc0dhdWNoZS5oZWlnaHQsXHJcbiAgICBicmFzR2F1Y2hlLndpZHRoIC8gMixcclxuICAgIDAsXHJcbiAgICAwLFxyXG4gICAgYnJhc0dhdWNoZS53aWR0aCAvIDJcclxuICApXHJcbiAgcG9wKClcclxuXHJcbiAgLy8gYnJhcyBkcm9pdFxyXG4gIHB1c2goKVxyXG4gIHRyYW5zbGF0ZShicmFzRHJvaXQuY2VudGVyWCwgYnJhc0Ryb2l0LnRvcCArIDUpXHJcbiAgcm90YXRlKE1hdGgubWluKHBsYXllci52ZWxvY2l0eS54IC8gMywgMCkpXHJcbiAgdHJhbnNsYXRlKC1icmFzRHJvaXQuY2VudGVyWCwgLShicmFzRHJvaXQudG9wICsgNSkpXHJcbiAgcmVjdChcclxuICAgIGJyYXNEcm9pdC5sZWZ0LFxyXG4gICAgYnJhc0Ryb2l0LnRvcCxcclxuICAgIGJyYXNEcm9pdC53aWR0aCxcclxuICAgIGJyYXNEcm9pdC5oZWlnaHQsXHJcbiAgICAwLFxyXG4gICAgYnJhc0dhdWNoZS53aWR0aCAvIDIsXHJcbiAgICBicmFzR2F1Y2hlLndpZHRoIC8gMixcclxuICAgIDBcclxuICApXHJcbiAgcG9wKClcclxuXHJcbiAgLy8gdG9yc2VcclxuICByZWN0KFxyXG4gICAgdG9yc2UubGVmdCxcclxuICAgIHRvcnNlLnRvcCxcclxuICAgIHRvcnNlLndpZHRoLFxyXG4gICAgdG9yc2UuaGVpZ2h0LFxyXG4gICAgMCxcclxuICAgIDAsXHJcbiAgICB0b3JzZS53aWR0aCAvIDQsXHJcbiAgICB0b3JzZS53aWR0aCAvIDRcclxuICApXHJcblxyXG4gIC8vIGphbWJlIGdhdWNoZVxyXG4gIHB1c2goKVxyXG4gIHRyYW5zbGF0ZShqYW1iZUdhdWNoZS5jZW50ZXJYLCBqYW1iZUdhdWNoZS50b3AgKyA1KVxyXG4gIHJvdGF0ZShcclxuICAgIE1hdGgubWF4KFxyXG4gICAgICBtYXAocGxheWVyLmp1bXBIZWlnaHQsIDAsIHBsYXllci5qdW1wTWF4SGVpZ2h0LCAwLCAwLjUpICtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHkueCAvIDEwLFxyXG4gICAgICAwXHJcbiAgICApXHJcbiAgKVxyXG4gIHRyYW5zbGF0ZSgtamFtYmVHYXVjaGUuY2VudGVyWCwgLShqYW1iZUdhdWNoZS50b3AgKyA1KSlcclxuICByZWN0KFxyXG4gICAgamFtYmVHYXVjaGUubGVmdCxcclxuICAgIGphbWJlR2F1Y2hlLnRvcCxcclxuICAgIGphbWJlR2F1Y2hlLndpZHRoLFxyXG4gICAgamFtYmVHYXVjaGUuaGVpZ2h0LFxyXG4gICAgamFtYmVHYXVjaGUud2lkdGggLyAyLFxyXG4gICAgamFtYmVHYXVjaGUud2lkdGggLyAyLFxyXG4gICAgMCxcclxuICAgIDBcclxuICApXHJcbiAgcG9wKClcclxuXHJcbiAgLy8gamFtYmUgZHJvaXRlXHJcbiAgcHVzaCgpXHJcbiAgdHJhbnNsYXRlKGphbWJlRHJvaXRlLmNlbnRlclgsIGphbWJlRHJvaXRlLnRvcCArIDUpXHJcbiAgcm90YXRlKFxyXG4gICAgTWF0aC5taW4oXHJcbiAgICAgIG1hcChwbGF5ZXIuanVtcEhlaWdodCwgMCwgcGxheWVyLmp1bXBNYXhIZWlnaHQsIDAsIC0wLjUpICtcclxuICAgICAgICBwbGF5ZXIudmVsb2NpdHkueCAvIDEwLFxyXG4gICAgICAwXHJcbiAgICApXHJcbiAgKVxyXG4gIHRyYW5zbGF0ZSgtamFtYmVEcm9pdGUuY2VudGVyWCwgLShqYW1iZURyb2l0ZS50b3AgKyA1KSlcclxuICByZWN0KFxyXG4gICAgamFtYmVEcm9pdGUubGVmdCxcclxuICAgIGphbWJlRHJvaXRlLnRvcCxcclxuICAgIGphbWJlRHJvaXRlLndpZHRoLFxyXG4gICAgamFtYmVEcm9pdGUuaGVpZ2h0LFxyXG4gICAgamFtYmVEcm9pdGUud2lkdGggLyAyLFxyXG4gICAgamFtYmVEcm9pdGUud2lkdGggLyAyLFxyXG4gICAgMCxcclxuICAgIDBcclxuICApXHJcbiAgcG9wKClcclxufVxyXG4iLCAiaW1wb3J0IE1vdmVCb3ggZnJvbSBcIi4uL3ByaW1hcnkvTW92ZUJveFwiXHJcbmltcG9ydCBQYXJ0eSBmcm9tIFwiLi4vUGFydHlcIlxyXG5pbXBvcnQgUG9seWdvbiBmcm9tIFwiLi4vcHJpbWFyeS9Qb2x5Z29uXCJcclxuaW1wb3J0IFRyYXAgZnJvbSBcIi4vVHJhcFwiXHJcbmltcG9ydCBkcmF3UGxheWVyIGZyb20gXCIuLi9kcmF3aW5ncy9kcmF3UGxheWVyXCJcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBsYXllciBleHRlbmRzIE1vdmVCb3gge1xyXG4gIHB1YmxpYyB2aXRhbGl0eSA9IDNcclxuXHJcbiAgY29uc3RydWN0b3IocHVibGljIHBhcnR5OiBQYXJ0eSkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIHBhcnR5LmxldmVsLnNwYXduc1swXS54LFxyXG4gICAgICBwYXJ0eS5sZXZlbC5zcGF3bnNbMF0ueSxcclxuICAgICAgMixcclxuICAgICAgbmV3IFBvbHlnb24oLTMwLCAtMTIwLCA2MCwgNjAsIDQpLCAvLyB0XHUwMEVBdGVcclxuICAgICAgbmV3IFBvbHlnb24oLTMwLCAtNjAsIDE1LCAzMCwgMSksIC8vIGJyYXMgZ2F1Y2hlXHJcbiAgICAgIG5ldyBQb2x5Z29uKDE1LCAtNjAsIDE1LCAzMCwgMSksIC8vIGJyYXMgZHJvaXRcclxuICAgICAgbmV3IFBvbHlnb24oLTE1LCAtNjAsIDMwLCAzMCwgMyksIC8vIHRvcnNlXHJcbiAgICAgIG5ldyBQb2x5Z29uKC0xNSwgLTMwLCAxNSwgMzAsIDIpLCAvLyBqYW1iZSBnYXVjaGVcclxuICAgICAgbmV3IFBvbHlnb24oMCwgLTMwLCAxNSwgMzAsIDIpIC8vIGphbWJlIGRyb2l0ZVxyXG4gICAgKVxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnZpdGFsaXR5ID0gM1xyXG4gICAgdGhpcy5wYXJ0eS5yZXNwYXduKClcclxuICB9XHJcblxyXG4gIGZyYW1lKCkge1xyXG4gICAgLy8gY3JvcCB2ZWxvY2l0eVxyXG4gICAgaWYgKHRoaXMudmVsb2NpdHkueSA+IDEpIHRoaXMudmVsb2NpdHkueSA9IDFcclxuICAgIGlmICh0aGlzLnZlbG9jaXR5LnkgPCAtMSkgdGhpcy52ZWxvY2l0eS55ID0gLTFcclxuICAgIGlmICh0aGlzLnZlbG9jaXR5LnggPiAxKSB0aGlzLnZlbG9jaXR5LnggPSAxXHJcbiAgICBpZiAodGhpcy52ZWxvY2l0eS54IDwgLTEpIHRoaXMudmVsb2NpdHkueCA9IC0xXHJcbiAgICBpZiAodGhpcy52ZWxvY2l0eS54ID4gLTAuMSAmJiB0aGlzLnZlbG9jaXR5LnggPCAwLjEpIHtcclxuICAgICAgdGhpcy52ZWxvY2l0eS54ID0gMFxyXG4gICAgfVxyXG5cclxuICAgIC8vIGFwcGx5IG1vdmUgWCxZXHJcbiAgICB0aGlzLnggKz0gdGhpcy5zcGVlZC54ICogdGhpcy52ZWxvY2l0eS54XHJcbiAgICB0aGlzLnkgKz0gdGhpcy5zcGVlZC55ICogdGhpcy52ZWxvY2l0eS55XHJcblxyXG4gICAgLy8ganVtcCBmbG93XHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMucGFydHkua2V5c1tcIjMyXCJdICYmXHJcbiAgICAgIHRoaXMuanVtcFByb2dyZXNzICYmXHJcbiAgICAgIHRoaXMuanVtcEhlaWdodCA8IHRoaXMuanVtcE1heEhlaWdodFxyXG4gICAgKSB7XHJcbiAgICAgIHRoaXMudmVsb2NpdHkueSAtPSAwLjFcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuanVtcFByb2dyZXNzID0gZmFsc2VcclxuICAgIH1cclxuICAgIHRoaXMuanVtcEhlaWdodCArPSB0aGlzLnNwZWVkLnkgKiB0aGlzLnZlbG9jaXR5LnkgKiAtMVxyXG5cclxuICAgIC8vIGZhbGwgZmxvd1xyXG4gICAgaWYgKHRoaXMub25Hcm91bmQoKSAmJiB0aGlzLnZlbG9jaXR5LnkgPj0gMCkge1xyXG4gICAgICB0aGlzLnZlbG9jaXR5LnkgPSAwXHJcbiAgICAgIHRoaXMuanVtcEhlaWdodCA9IDBcclxuICAgICAgd2hpbGUgKHRoaXMub25Hcm91bmQoKSkge1xyXG4gICAgICAgIHRoaXMueS0tXHJcbiAgICAgIH1cclxuICAgICAgdGhpcy55KytcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRoaXMuZmFsbCgpXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaG9yaXpvbnRhbCBtb3ZlIGZsb3dcclxuICAgIGlmICghdGhpcy5wYXJ0eS5rZXlzW1wiMzdcIl0gPT0gIXRoaXMucGFydHkua2V5c1tcIjM5XCJdKSB7XHJcbiAgICAgIHRoaXMudmVsb2NpdHkueCAqPSAwLjVcclxuICAgIH1cclxuICAgIGlmICh0aGlzLnBhcnR5LmtleXNbXCIzN1wiXSkge1xyXG4gICAgICB0aGlzLnZlbG9jaXR5LnggLT0gMC4yXHJcbiAgICB9XHJcbiAgICBpZiAodGhpcy5wYXJ0eS5rZXlzW1wiMzlcIl0pIHtcclxuICAgICAgdGhpcy52ZWxvY2l0eS54ICs9IDAuMlxyXG4gICAgfVxyXG5cclxuICAgIC8vIGRlYWRseSBmYWxsXHJcbiAgICBpZiAoXHJcbiAgICAgIHRoaXMudG91Y2goXHJcbiAgICAgICAgLi4udGhpcy5wYXJ0eS5sZXZlbC5jaGlsZHJlbi5maWx0ZXIoKGNoaWxkKSA9PiBjaGlsZCBpbnN0YW5jZW9mIFRyYXApXHJcbiAgICAgIClcclxuICAgICkge1xyXG4gICAgICB0aGlzLnZpdGFsaXR5LS1cclxuICAgICAgdGhpcy5wYXJ0eS5yZXNwYXduKClcclxuICAgICAgaWYgKHRoaXMudml0YWxpdHkgPCAwKSB7XHJcbiAgICAgICAgdGhpcy5wYXJ0eS5yZXNldCgpXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRyYXcoKSB7XHJcbiAgICBkcmF3UGxheWVyKHRoaXMpXHJcbiAgfVxyXG59XHJcbiIsICJpbXBvcnQgTW92ZUJveCBmcm9tIFwiLi4vcHJpbWFyeS9Nb3ZlQm94XCJcclxuaW1wb3J0IFBvbHlnb24gZnJvbSBcIi4uL3ByaW1hcnkvUG9seWdvblwiXHJcbmltcG9ydCBQYXJ0eSBmcm9tIFwiLi4vUGFydHlcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRW5lbXkgZXh0ZW5kcyBNb3ZlQm94IHtcclxuICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgcHVibGljIHBhcnR5OiBQYXJ0eSwgcHVibGljIHBhdHRlcm46IGFueSkge1xyXG4gICAgc3VwZXIoXHJcbiAgICAgIHgsXHJcbiAgICAgIHksXHJcbiAgICAgIDAsXHJcbiAgICAgIG5ldyBQb2x5Z29uKC02MCwgLTkwLCAxMjAsIDYwLCAxKSwgLy8gdGV0ZVxyXG4gICAgICBuZXcgUG9seWdvbigtNDUsIC0zMCwgMzAsIDMwLCAxKVxyXG4gICAgKVxyXG4gIH1cclxufVxyXG4iLCAiaW1wb3J0IEhpdEJveCBmcm9tIFwiLi4vcHJpbWFyeS9IaXRCb3hcIlxyXG5pbXBvcnQgVmVjdG9yIGZyb20gXCIuLi90eXBlcy9WZWN0b3JcIlxyXG5pbXBvcnQgUGFydHkgZnJvbSBcIi4uL1BhcnR5XCJcclxuaW1wb3J0IEVuZW15IGZyb20gXCIuL0VuZW15XCJcclxuaW1wb3J0IFBvbHlnb24gZnJvbSBcIi4uL3ByaW1hcnkvUG9seWdvblwiXHJcbmltcG9ydCBMZXZlbE9wdGlvbnMgZnJvbSBcIi4uL3R5cGVzL0xldmVsT3B0aW9uc1wiXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMZXZlbCBleHRlbmRzIEhpdEJveCB7XHJcbiAgcHVibGljIHBhcnR5OiBQYXJ0eVxyXG4gIHB1YmxpYyBuYW1lOiBzdHJpbmdcclxuICBwdWJsaWMgc3Bhd25zOiBWZWN0b3JbXVxyXG4gIHB1YmxpYyBlbmVtaWVzOiBFbmVteVtdXHJcblxyXG4gIGNvbnN0cnVjdG9yKHBhcnR5OiBQYXJ0eSwgb3B0aW9uczogTGV2ZWxPcHRpb25zKSB7XHJcbiAgICBzdXBlcigwLCAwLCAxLCAuLi5vcHRpb25zLnBvbHlnb25zKVxyXG4gICAgdGhpcy5wYXJ0eSA9IHBhcnR5XHJcbiAgICB0aGlzLm5hbWUgPSBvcHRpb25zLm5hbWVcclxuICAgIHRoaXMuZW5lbWllcyA9IG9wdGlvbnMuZW5lbWllc1xyXG4gICAgdGhpcy5zcGF3bnMgPSBbb3B0aW9ucy5zcGF3bl1cclxuICB9XHJcblxyXG4gIGFkZFNwYXduKHBvbHlnb246IFBvbHlnb24pIHtcclxuICAgIHRoaXMuc3Bhd25zLnVuc2hpZnQoe1xyXG4gICAgICB4OiBwb2x5Z29uLnJlbFggKyAzMCxcclxuICAgICAgeTogcG9seWdvbi5yZWxZICsgNjAsXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLnggPSAwXHJcbiAgICB0aGlzLnkgPSAwXHJcbiAgICB0aGlzLnNwYXducyA9IFt0aGlzLnNwYXducy5wb3AoKV1cclxuICAgIHN1cGVyLnJlc2V0KClcclxuICB9XHJcbn1cclxuIiwgImltcG9ydCBDaGVja1BvaW50IGZyb20gXCIuL2VsZW1lbnRzL0NoZWNrUG9pbnRcIlxyXG5pbXBvcnQgUmVjdGFuZ2xlIGZyb20gXCIuL3ByaW1hcnkvUmVjdGFuZ2xlXCJcclxuaW1wb3J0IFBsYXRmb3JtIGZyb20gXCIuL2VsZW1lbnRzL1BsYXRmb3JtXCJcclxuaW1wb3J0IEN1cnNvciBmcm9tIFwiLi9lbGVtZW50cy9DdXJzb3JcIlxyXG5pbXBvcnQgUGxheWVyIGZyb20gXCIuL2VsZW1lbnRzL1BsYXllclwiXHJcbmltcG9ydCBFbmVteSBmcm9tIFwiLi9lbGVtZW50cy9FbmVteVwiXHJcbmltcG9ydCBMZXZlbCBmcm9tIFwiLi9lbGVtZW50cy9MZXZlbFwiXHJcbmltcG9ydCBUcmFwIGZyb20gXCIuL2VsZW1lbnRzL1RyYXBcIlxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGFydHkge1xyXG4gIHB1YmxpYyBrZXlzOiB7IFtrZXk6IHN0cmluZ106IGJvb2xlYW4gfSA9IHt9XHJcbiAgcHVibGljIHBsYXllcjogUGxheWVyXHJcbiAgcHVibGljIGN1cnNvcjogQ3Vyc29yXHJcbiAgcHVibGljIGxldmVsczogTGV2ZWxbXVxyXG4gIHB1YmxpYyBsZXZlbEluZGV4ID0gMFxyXG4gIHB1YmxpYyBkZWJ1Z01vZGUgPSBmYWxzZVxyXG5cclxuICBjb25zdHJ1Y3RvcigpIHtcclxuICAgIHRoaXMubGV2ZWxzID0gW1xyXG4gICAgICBuZXcgTGV2ZWwodGhpcywge1xyXG4gICAgICAgIHNwYXduOiB7XHJcbiAgICAgICAgICB4OiA2MCxcclxuICAgICAgICAgIHk6IDEyMCxcclxuICAgICAgICB9LFxyXG4gICAgICAgIG5hbWU6IFwiTGV2ZWwgMVwiLFxyXG4gICAgICAgIHBvbHlnb25zOiBbXHJcbiAgICAgICAgICBuZXcgUGxhdGZvcm0oMCwgMTIwKSxcclxuICAgICAgICAgIG5ldyBQbGF0Zm9ybSg0MDAsIDYwKSxcclxuICAgICAgICAgIG5ldyBQbGF0Zm9ybSgwLCAtMTIwKSxcclxuICAgICAgICAgIG5ldyBQbGF0Zm9ybSgtNDAwLCAtMTgwKSxcclxuICAgICAgICAgIG5ldyBQbGF0Zm9ybSgwLCAtNDAwKSxcclxuICAgICAgICAgIG5ldyBQbGF0Zm9ybSg0MDAsIC0zNjApLFxyXG4gICAgICAgICAgbmV3IFBsYXRmb3JtKDAsIC02MDApLFxyXG4gICAgICAgICAgbmV3IFBsYXRmb3JtKC00MDAsIC01MDApLFxyXG4gICAgICAgICAgbmV3IFRyYXAoLTMwMDAsIDIwMCwgNjAwMCwgNTAwKSxcclxuICAgICAgICAgIG5ldyBDaGVja1BvaW50KDUwMCwgNjApLFxyXG4gICAgICAgICAgbmV3IENoZWNrUG9pbnQoLTMwMCwgLTE4MCksXHJcbiAgICAgICAgXSxcclxuICAgICAgICBlbmVtaWVzOiBbbmV3IEVuZW15KDAsIDAsIHRoaXMsIFtdKSwgbmV3IEVuZW15KDAsIDAsIHRoaXMsIFtdKV0sXHJcbiAgICAgIH0pLFxyXG4gICAgXVxyXG4gICAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKHRoaXMpXHJcbiAgICB0aGlzLmN1cnNvciA9IG5ldyBDdXJzb3IodGhpcylcclxuICB9XHJcblxyXG4gIGdldCBlbGVtZW50cygpOiBSZWN0YW5nbGVbXSB7XHJcbiAgICByZXR1cm4gW3RoaXMubGV2ZWwsIHRoaXMucGxheWVyLCB0aGlzLmN1cnNvcl0uc29ydCgoYSwgYikgPT4gYS56IC0gYi56KVxyXG4gIH1cclxuXHJcbiAgZ2V0IGxldmVsKCkge1xyXG4gICAgcmV0dXJuIHRoaXMubGV2ZWxzW3RoaXMubGV2ZWxJbmRleF1cclxuICB9XHJcblxyXG4gIHJlc3Bhd24oKSB7XHJcbiAgICB0aGlzLmxldmVsLnggPSAwXHJcbiAgICB0aGlzLmxldmVsLnkgPSAwXHJcbiAgICB0aGlzLnBsYXllci5zZXQodGhpcy5sZXZlbC5zcGF3bnNbMF0ueCwgdGhpcy5sZXZlbC5zcGF3bnNbMF0ueSlcclxuICAgIHRoaXMucGxheWVyLnZlbG9jaXR5ID0ge1xyXG4gICAgICB4OiAwLFxyXG4gICAgICB5OiAwLFxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmVzZXQoKSB7XHJcbiAgICB0aGlzLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcclxuICAgICAgZWxlbWVudC5yZXNldCgpXHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgZnJhbWUoKSB7XHJcbiAgICBjb25zdCBkaXN0WCA9IHRoaXMucGxheWVyLnggLSB3aWR0aCAvIDIsXHJcbiAgICAgIGRpc3RZID0gdGhpcy5wbGF5ZXIueSAtIGhlaWdodCAvIDJcclxuICAgIHRoaXMuZWxlbWVudHMuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xyXG4gICAgICBlbGVtZW50LnggLT0gZGlzdFggLyAxMFxyXG4gICAgICBlbGVtZW50LnkgLT0gZGlzdFkgLyAxMFxyXG4gICAgICBlbGVtZW50LmZyYW1lKClcclxuICAgIH0pXHJcbiAgfVxyXG5cclxuICBkcmF3KCkge1xyXG4gICAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKChlbGVtZW50KSA9PiB7XHJcbiAgICAgIGVsZW1lbnQuZHJhdygpXHJcbiAgICB9KVxyXG4gICAgaWYgKHRoaXMuZGVidWdNb2RlKSB0aGlzLmRlYnVnKClcclxuICB9XHJcblxyXG4gIGRlYnVnKCkge1xyXG4gICAgdGV4dFNpemUoMjApXHJcbiAgICBmaWxsKDI1NSwgMCwgMjU1KVxyXG4gICAgbm9TdHJva2UoKVxyXG4gICAgdGV4dChgJHt0aGlzLmxldmVsLm5hbWV9XFxuJHtNYXRoLnJvdW5kKGZyYW1lUmF0ZSgpKX0gRlBTYCwgd2lkdGggLyAyLCA1MClcclxuICB9XHJcbn1cclxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTs7O0FDRWUscUJBQW1CLFdBQXNCO0FBQ3REO0FBQ0EsaUJBQWE7QUFDYixXQUFPLEdBQUcsR0FBRztBQUNiLFNBQUssVUFBVSxNQUFNLFVBQVUsS0FBSyxVQUFVLE9BQU8sVUFBVTtBQUMvRCxTQUFLLFVBQVUsTUFBTSxVQUFVLEtBQUssVUFBVSxPQUFPLFVBQVU7QUFDL0QsU0FBSyxVQUFVLE9BQU8sVUFBVSxLQUFLLFVBQVUsTUFBTSxVQUFVO0FBQy9EO0FBQ0EsU0FBSyxHQUFHLEtBQUs7QUFDYixjQUFVLE9BQU87QUFDakIsU0FDRSxHQUFHLFVBQVUsWUFBWTtBQUFBLElBQVcsS0FBSyxNQUN2QyxVQUFVLFVBQ0gsS0FBSyxNQUFNLFVBQVU7QUFBQSxRQUFlLEtBQUssTUFDaEQsVUFBVSxtQkFDRSxLQUFLLE1BQU0sVUFBVTtBQUFBLE1BQWtCLEtBQUssTUFDeEQsVUFBVSxlQUNBLEtBQUssTUFBTSxVQUFVLFNBQ2pDLEtBQUssTUFBTSxVQUFVLFVBQ3JCLEtBQUssTUFBTSxVQUFVO0FBQUE7OztBQ25CekIsd0JBQXdDO0FBQUEsSUFBeEMsY0FGQTtBQUdTLHNCQUF3QjtBQUN4Qix1QkFBWTtBQUFBO0FBQUEsSUFlbkIsUUFBUTtBQUNOLGlCQUFXLFNBQVMsS0FBSztBQUFVLGNBQU07QUFBQTtBQUFBLElBRTNDLFFBQVE7QUFDTixpQkFBVyxTQUFTLEtBQUs7QUFBVSxjQUFNO0FBQUE7QUFBQSxJQUUzQyxPQUFPO0FBQ0wsaUJBQVcsU0FBUyxLQUFLO0FBQVUsY0FB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
