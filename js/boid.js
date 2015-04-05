var  _ = require('./lodash'),
    Vector = require('./vector');
module.exports = Boid;

function Boid(position, speed, side) {
  this.position = position;
  this.speed = speed;
  this.maxHP = 60;
  this.hp = this.maxHP;
  if (!side) {
      this.side = 1;
  } else {
      this.side = side;
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

Boid.prototype.toString = function() {
  return this.position.toString();
};
