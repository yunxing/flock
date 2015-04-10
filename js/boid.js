var  _ = require('./lodash'),
    Vector = require('./vector');
module.exports = Boid;

function Boid(position, speed, side, player) {
  this.position = position;
  this.maxAlarm = 700;
  this.maxAlarmSq = 700*700;
  this.speed = speed;
  this.maxHP = 60;
  this.alarmRange = 0;
  this.hp = this.maxHP;
  if (!side) {
      this.side = 1;
  } else {
      this.side = side;
  }

  if (player) {
      this.player = player;
  }
}

Boid.prototype.compare = function(that, isEven) {
  return this.position.compare(that.position, isEven);
};

Boid.prototype.extend = function() {
  var s = new Vector();
  _.extend(s, this.speed);
  this.speed = s;
  var p = new Vector();
  _.extend(p, this.position);
  this.position = p;
};

Boid.prototype.increaseAlarm = function() {
  this.alarmRange+=100;
  if (this.alarmRange > this.maxAlarmSq) {
    this.alarmRange = this.maxAlarmSq
  }
}

Boid.prototype.decreaseAlarm = function() {
  this.alarmRange-=100;
  if (this.alarmRange < 0) {
    this.alarmRange=0;
  }
}

Boid.prototype.toString = function() {
  return this.position.toString();
};
