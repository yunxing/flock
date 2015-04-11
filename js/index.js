var EventEmitter = require('events').EventEmitter,
    inherits = require('inherits'),
    Vector = require('./vector'),
    Dtree = require('./dtree'),
    _ = require('./lodash'),
    Boid = require('./boid');

module.exports = Boids;

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback);
  EventEmitter.call(this);
  this.startTime = (new Date).getTime();
  this.logicTime = 0;
  this.width = 300;
  this.height = 500;
  this.lastWinner = 0;
  this.halfHeight = this.height / 2;
  this.halfWidth = this.width/2;
  this.left = [];
  this.left[1] = 10;
  this.left[2] = 10;
  this.ticks = 0;
  opts = opts || {};
  callback = callback || function(){};

  this.speedLimit = opts.speedLimit || 1;
  this.accelerationLimit = opts.accelerationLimit || 0.03;
  this.separationDistance = opts.separationDistance || 30;
  this.separationDistanceSq = Math.pow(this.separationDistance, 2);
  this.alignmentDistance = opts.alignmentDistance || 60;
  this.alignmentDistanceSq = Math.pow(this.alignmentDistance, 2);
  this.cohesionDistance = opts.cohesionDistance || 60;
  this.cohesionDistanceSq = Math.pow(this.cohesionDistance, 2);
  this.separationForce = opts.separationForce || 1.5;
  this.cohesionForce = opts.cohesionForce || 1;
  this.alignmentForce = opts.alignmentForce || opts.alignment || 1;
  this.enemyForce = 2;
  this.enemyDistance = 60;
  this.enemyDistanceSq = Math.pow(this.enemyDistance, 2);
  this.maxDistSq = Math.max(this.separationDistanceSq,
                            this.cohesionDistanceSq, this.alignmentDistanceSq,
                            this.enemyDistanceSq);
  var boids = this.boids = [];

  this.on('tick', function() {
    callback(boids);
  });
}
inherits(Boids, EventEmitter);

Boids.prototype.init = function() {
  var dtree = new Dtree();
  for(var i=0; i<this.boids.length; i++) {
    dtree.insert(this.boids[i]);
  }

  this.tickData = {};
  this.tickData.dtree = dtree;
};

Boids.prototype.findNeighbors = function(point, distance) {
  this.tickData.neighbors = this.tickData.dtree.neighbors(point, distance);
};

Boids.prototype.calcCohesion = function(boid) {
  var total = new Vector(0, 0),
      distSq,
      target,
      neighbors = this.tickData.neighbors,
      count = 0;

  for(var i=0; i<neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if(boid === target)
      continue;

    if(boid.side !== target.side)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.cohesionDistanceSq &&
       isInFrontOf(boid, target.position)) {
      total = total.add(target.position);
      count++;
    }
  }

  if( count === 0)
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .subtract(boid.position)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

Boids.prototype.calcSeparation = function(boid) {
  var total = new Vector(0, 0),
      target,
      distSq,
      neighbors = this.tickData.neighbors,
      count = 0;

  for(var i=0; i<neighbors.length; i++) {
    target = neighbors[i].neighbor;
    if(boid === target)
      continue;

    if(boid.side !== target.side)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.separationDistanceSq) {
      total = total.add(
        target.position
          .subtract(boid.position)
          .normalize()
          .divideBy(
            // cannot divide by 0
            target.position.distance(boid.position) + 0.0000001
          )
      );
      count++;
    }

  }


  if(count === 0)
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .add(boid.speed) // Adding speed instead of subtracting because separation is repulsive
    .limit(this.accelerationLimit);
};

Boids.prototype.calcEnemy = function(boid) {
  var total = new Vector(0, 0),
      target,
      distSq,
      neighbors = this.tickData.neighbors,
      count = 0;

  for(var i=0; i<neighbors.length; i++) {
    target = this.tickData.neighbors[i].neighbor;
    if(boid === target)
      continue;

    if(boid.side === target.side)
      continue;

    distSq = neighbors[i].distSq;
    if (distSq < 4) {
      boid.hp -= 1;
      target.hp -= 1;
    }
    if(distSq < boid.alarmRange ) {
      total = total.add(target.position
                        .subtract(boid.position).normalize());
      count++;
      break;
    }
  }

  if (count === 0) {
    // If cannot find any enemies nearby, increase alarm
    boid.increaseAlarm();
    return new Vector(0, 0);
  }

  boid.decreaseAlarm();

  return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
}

Boids.prototype.calcAlignment = function(boid) {
  var total = new Vector(0, 0),
      target,
      distSq,
      neighbors = this.tickData.neighbors,
      count = 0;

  for(var i=0; i<neighbors.length; i++) {
    target = this.tickData.neighbors[i].neighbor;
    if(boid === target)
      continue;

    distSq = neighbors[i].distSq;
    if(distSq < this.alignmentDistanceSq &&
       isInFrontOf(boid, target.position)) {
      total = total.add(target.speed);
      count++;
    }
  }

  if (count === 0)
    return new Vector(0, 0);

  return total
    .divideBy(count)
    .normalize()
    .subtract(boid.speed)
    .limit(this.accelerationLimit);
};

var tickTime = 16;

Boids.prototype.updateToLogicTime = function(newLogicTime) {
  var count = 0;
  if (newLogicTime <= this.logicTime) {
    console.log("gone too far");
  }
  while (newLogicTime > this.logicTime + tickTime) {
    this.logicTime = this.logicTime + tickTime;
    this.tick();
    count ++;
  }
};

Boids.prototype.getCurrentLogicTime = function() {
  return (new Date).getTime() - this.startTime;
};

Boids.prototype.extend = function() {
  var extendedBoids = [];

  for(var i=0; i<this.boids.length; i++) {
    var b = new Boid();
    _.extend(b, this.boids[i]);
    b.extend();
    extendedBoids.push(b);
  }
  this.boids = extendedBoids;
};

Boids.prototype.updateToCurrentLogicTime = function() {
  this.updateToLogicTime(this.getCurrentLogicTime());
};

Boids.prototype.updateEvent = function(data) {
  if (data.type == "reset") {
    this.reset(data.lastWinner);
    return;
  }
  if (this.left[data.side] > 0) {
    x = Math.floor(Math.cos(data.ts) * 100);
    y = Math.floor(Math.sin(data.ts) * 100);
    this.boids.push(
        new Boid(new Vector(data.x, data.y), new Vector(x, y).normalize(), data.side, data.player)
    );
    this.left[data.side]--;
  }
};

Boids.prototype.count = function(side) {
  var boidData = this.boids;
  var sum = 0;
  for (var i = 0, l = boidData.length; i < l; i += 1) {
    if (side == boidData[i].side) {
      sum++;
    }
  }
  return sum;
}

Boids.prototype.end = function() {
  sideOneCount = this.count(1);
  sideTwoCount = this.count(2);
  if (sideOneCount == 0 && this.left[1] == 0) {
    this.lastWinner=2
    return true;
  }
  if (sideTwoCount == 0 && this.left[2] == 0) {
    this.lastWinner=1
    return true;
  }
  return false;
}

Boids.prototype.hash = function() {
  var boidData = this.boids;
  var sum = 0;
  for (var i = 0, l = boidData.length; i < l; i += 1) {
    sum += boidData[i].position.x;
  }
  return sum;
}

Boids.prototype.reset = function(lastWinner) {
  this.left = [];
  this.left[1] = 10;
  this.left[2] = 10;
  this.boids = [];
  this.lastWinner = lastWinner
}

var p = false;
Boids.prototype.tick = function() {
  this.ticks++;
  var boid;
  this.init();

  for(var i=0; i<this.boids.length; i++) {
    boid = this.boids[i];
    this.findNeighbors(boid.position, boid.alarmRange);
    boid.acceleration = this.calcCohesion(boid)
      .multiplyBy(this.cohesionForce)
      .add(this.calcAlignment(boid)
           .multiplyBy(this.alignmentForce))
      .add(this.calcEnemy(boid)
           .multiplyBy(this.enemyForce))
      .subtract(this.calcSeparation(boid)
                .multiplyBy(this.separationForce))
  }

  delete this.tickData;

  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
    boid.speed = boid.speed
      .add(boid.acceleration)
      .limit(this.speedLimit);
    boid.position = boid.position.add(boid.speed);
    x = boid.position.x;
    y = boid.position.y;
    boid.position.x = x > this.halfWidth ? -this.halfWidth : -x > this.halfWidth ? this.halfWidth : x;
    boid.position.y = y > this.halfHeight ? -this.halfHeight : -y > this.halfHeight ? this.halfHeight : y;
    //    delete boid.acceleration;
  }
  var newBoids = [];
  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
    if (boid.hp > 0) {
      boid.hp += 0.1;
      if (boid.hp > boid.maxHP) {
        boid.hp = boid.maxHP;
      }
      newBoids.push(boid);
    }
  }
  this.boids = newBoids;
};

function isInFrontOf(boid, point) {
  return boid.position.angle( boid.position.add(boid.speed), point) <=
    ( Math.PI / 3);
}
