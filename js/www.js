#!/usr/bin/env node

/**
 * Module dependencies.
 */
var app = require('http').createServer(handler);
var fs = require('fs');
var Boids = require('./');

var startTime;

var boids;

function init() {
  startTime = (new Date).getTime();
  boids = new Boids();
}
init();

function handler (req, res) {
  if (req.url == "/") {
    fs.readFile(__dirname + '/../index.html', function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    });
  } else {
    fs.readFile(__dirname + '/..' + req.url, function (err, data) {
      if (err) {
        res.writeHead(500);
        return res.end('Error loading index.html');
      }

      res.writeHead(200);
      res.end(data);
    });
  }
}

/**
 * Get port from environment and store in Express.
 */

var port = 3000;
app.listen(port);

// Socket.io
var io = require('socket.io')(app);
var numberOfPlayer = 0;

io.on('connection', function (socket) {
  socket.on('join', function(data) {
    numberOfPlayer ++;
    var ts = (new Date).getTime() - startTime;
    boids.updateToLogicTime(ts);
    console.log('Player ' + numberOfPlayer + ' has joined');
    socket.emit('start', {
      side: numberOfPlayer % 2 + 1,
      boids: boids,
      player: numberOfPlayer,
      ts: data.ts
    });
  });
  socket.on('create', function(data){
    data.ts = (new Date).getTime() - startTime;
    boids.updateToLogicTime(data.ts);
    boids.updateEvent(data);
    io.sockets.emit('event', data);
  });
});

setInterval(function(){
  var ts = (new Date).getTime() - startTime;
  boids.updateToLogicTime(ts);
  if (boids.end()) {
    data = {
      ts:ts,
      lastWinner:boids.lastWinner,
      type:"reset"
    };
    boids.updateEvent(data);
    io.emit('event', data);
  } else {
    io.emit('update', {
      ts:ts
    });
  }
}, 1000)
