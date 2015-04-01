
module.exports = Boid;

function Boid(position, speed, side) {
  this.position = position;
  this.speed = speed;
  this.hp = 100;

    if (!side) {
        this.side = 1;
    } else {
        this.side = side;
    }

}

Boid.prototype.compare = function(that, isEven) {
  return this.position.compare(that.position, isEven);
};

Boid.prototype.toString = function() {
  return this.position.toString();
};
