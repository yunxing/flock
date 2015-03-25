var fps = require('fps'),
  ticker = require('ticker'),
  debounce = require('debounce'),
  Boids = require('./'),
  Vector = require('./vector');

var attractors = [{
    x: Infinity,
    y: Infinity,
    dist: 150,
    speed: 0.25
}];

var canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  boids = Boids({
    attractors: attractors
  });

document.body.onmousemove = function(e) {
  var halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;

  attractors[0].x = e.x - halfWidth;
  attractors[0].y = e.y - halfHeight;
};

window.onresize = debounce(function() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}, 100);
window.onresize();

document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.appendChild(canvas);

ticker(window, 60).on('tick', function() {
  frames.tick();
  boids.tick();
}).on('draw', function() {
  var boidData = boids.boids,
    halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;

  ctx.fillStyle = 'rgba(255,241,235,0.25)'; // '#FFF1EB'
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#543D5E';
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
    x = boidData[i].position.x; y = boidData[i].position.y;
    // wrap around the screen
    boidData[i].position.x = x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
    boidData[i].position.y = y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
    ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
  }
});

var frameText = document.querySelector('[data-fps]');
var countText = document.querySelector('[data-count]');
var frames = fps({ every: 10, decay: 0.04 }).on('data', function(rate) {
  for (var i = 0; i < 3; i += 1) {
    if (rate <= 56 && boids.boids.length > 10) boids.boids.pop();
    if (rate >= 60 && boids.boids.length < 500) 
      boids.boids.push({
        position: new Vector(0,0),
        speed: new Vector(Math.random()*6-3,Math.random()*6-3),
        acceleration : new Vector(0,0)
      });
  }
  frameText.innerHTML = String(Math.round(rate));
  countText.innerHTML = String(boids.boids.length);
});