var fps = require('fps'),
  ticker = require('ticker'),
  debounce = require('debounce'),
  io = require('socket.io-client'),
  Boids = require('./'),
  Vector = require('./vector'),
    Boid = require('./boid');
var socket = io.connect('http://172.16.2.150:3000');


var anchor = document.createElement('a'),
  canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

var side = 1;
boids = Boids();
socket.emit('join', {
    id: 1
});
  socket.on('start', function(data){
      boids = Boids();
      boidsM = Boids();
      side = data.side;
  });

  socket.on('create', function(data){
      boidsM.updateToLogicTime(data.ts);
      boidsM.updateEvent(data);
      boids = boidsM;
      // boids = _.cloneDeep(boidsM);
      // boids.prototype = boidsM;
  });


var left = 100;

canvas.addEventListener('click', function(e) {
  var x = e.pageX,
    y = e.pageY,
    halfHeight = 700/2,
    halfWidth = 700/2;
    x = x - halfWidth;
    y = y - halfHeight;

    socket.emit('create', {
        x:x,
        y:y,
        side:side
    });
});

// window.onresize = debounce(function() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }, 100);
// window.onresize();

canvas.width = 700;
canvas.height = 700;
anchor.setAttribute('href', '#');
anchor.appendChild(canvas);
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.appendChild(anchor);

var tickTime = 16;

function timeToTicks(t) {
    return Math.floor(t / tickTime)
}


window.setInterval(function(){
  boids.updateToCurrentLogicTime();
}, 1000 / 60)

ticker(window, 60).on('tick', function() {
  frames.tick();
}).on('draw', function() {
      console.log("here");

  var boidData = boids.boids,
    halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;

  ctx.fillStyle = 'rgba(255,241,235,0.25)'; // '#FFF1EB'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#543D5E';
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
      if (boidData[i].side == 1) {
          ctx.fillStyle = '#543D5E';
      } else {
          ctx.fillStyle = 'rgba(255,0,0,0.25)'; // '#FFF1EB'
      }
    x = boidData[i].position.x; y = boidData[i].position.y;
    ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
  }
});

var fpsText = document.querySelector('[data-fps]');
var countText = document.querySelector('[data-count]');
var countText2 = document.querySelector('[data-count2]');
var livesText = document.querySelector('[data-left]');
var frames = fps({ every: 10, decay: 0.04 }).on('data', function(rate) {
  // for (var i = 0; i < 3; i += 1) {
  //   if (rate <= 56 && boids.boids.length > 10) boids.boids.pop();
  //   if (rate >= 60 && boids.boids.length < 300)
  //     boids.boids.push(
  //       new Boid(new Vector(0,0), new Vector(Math.random()*6-3,Math.random()*6-3))
  //     );
  // }
    var count = 0;
    var count2 = 0;
    var boidData = boids.boids;
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
      if (boidData[i].side == 1) {
          count ++;
      } else {
          count2 ++;
      }
  }
  livesText.innerHTML = String(left);
  countText.innerHTML = String(count);
  countText2.innerHTML = String(count2);
  fpsText.innerHTML = String(Math.round(rate));
});
