var fps = require('fps'),
    ticker = require('ticker'),
    debounce = require('debounce'),
    io = require('socket.io-client'),
    Boids = require('./'),
    _ = require('./lodash'),
    Vector = require('./vector'),
    Boid = require('./boid');

var socket = io.connect(window.location.href);

var anchor = document.createElement('a'),
    canvas = document.createElement('canvas'),
    ctx = canvas.getContext('2d');

var side = 1;
var player = 0;
boids = undefined;
boidsM = undefined;
socket.emit('join', {
  ts: (new Date).getTime()
});

socket.on('start', function(data){
  boids = new Boids();
  _.extend(boids, data.boids);
  boids.extend();
  // startTime based on localTime
  boids.startTime = (new Date).getTime() - (boids.logicTime + Math.floor(((new Date).getTime() - data.ts) / 2))
  boidsM = _.cloneDeep(boids);
  side = data.side;
  player = data.player;
});

socket.on('update', function(data){
  if (boidsM) {
    boidsM.updateToLogicTime(data.ts);
  }
});

socket.on('event', function(data){
  boidsM.updateToLogicTime(data.ts);
  boidsM.updateEvent(data);
  boids = _.cloneDeep(boidsM);
});

var left = 100;
var seq = 0;
canvas.addEventListener('click', function(e) {
  var x = e.pageX,
      y = e.pageY,
      halfWidth = 300/2;
      halfHeight = 500/2,
  x = x - halfWidth;
  y = y - halfHeight;

  socket.emit('create', {
    x:x,
    y:y,
    side:side,
    player:player,
    seq:seq++
  });
});

// window.onresize = debounce(function() {
//   canvas.width = window.innerWidth;
//   canvas.height = window.innerHeight;
// }, 100);
// window.onresize();

canvas.width = 300;
canvas.height = 500;
anchor.setAttribute('href', '#');
anchor.appendChild(canvas);
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.appendChild(anchor);

var tickTime = 16;

function timeToTicks(t) {
  return Math.floor(t / tickTime);
}


window.setInterval(function(){
  if (!boids) return;
  boids.updateToCurrentLogicTime();
}, 1000 / 60);

ticker(window, 60).on('tick', function() {
  frames.tick();
}).on('draw', function() {
  if (!boids) return;
  var boidData = boids.boids,
      halfHeight = canvas.height/2,
      halfWidth = canvas.width/2;

  ctx.fillStyle = 'rgba(255,241,235,0.25)'; // '#FFF1EB'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#543D5E';
  for (var i = 0, l = boidData.length, x, y; i < l; i += 1) {
    if (boidData[i].side == side) {
      ctx.fillStyle = 'rgb(0,0,0)';
    } else {
      ctx.fillStyle = 'rgb(255,0,0)';
    }
    if (boidData[i].player == player) {
      ctx.fillStyle = 'rgb(0,0,255)';
    }
    x = boidData[i].position.x; y = boidData[i].position.y;
    ctx.fillRect(x + halfWidth, y + halfHeight, 2, 2);
  }
});

// var fpsText = document.querySelector('[data-fps]');
var countText = document.querySelector('[data-count]');
var countText2 = document.querySelector('[data-count2]');
var livesText = document.querySelector('[data-left]');
// var hashText = document.querySelector('[data-hash]');
var winnerText = document.querySelector('[data-winner]');
var teamText = document.querySelector('[data-team]');
var frames = fps({ every: 10, decay: 0.04 }).on('data', function(rate) {
  if (!boids) return;
  var count = boids.countWin[1];
  var count2 = boids.countWin[2];
  livesText.innerHTML = String(boids.left[side]);
  countText.innerHTML = String(count);
  countText2.innerHTML = String(count2);
  // fpsText.innerHTML = String(boidsM.ticks);
  // hashText.innerHTML = String(boidsM.hash());
  teamText.innerHTML = String(side);
  if (boids.lastWinner != 0) {
    if (boids.lastWinner == side) {
      winnerText.innerHTML = "Your team won last time!";
    } else {
      winnerText.innerHTML = "Your team lose last time!";
    }
  }

});
