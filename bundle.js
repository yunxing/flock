(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

module.exports = Boid;

function Boid(position, speed, side) {
  this.position = position;
  this.speed = speed;
  this.hp = 10;

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

},{}],2:[function(require,module,exports){
var fps = require('fps'),
  ticker = require('ticker'),
  debounce = require('debounce'),
  Boids = require('./'),
  Vector = require('./vector'),
  Boid = require('./boid');


var anchor = document.createElement('a'),
  canvas = document.createElement('canvas'),
  ctx = canvas.getContext('2d'),
  boids = Boids();

var left = 100;

canvas.addEventListener('click', function(e) {
  var x = e.pageX,
    y = e.pageY,
    halfHeight = canvas.height/2,
    halfWidth = canvas.width/2;
  x = x - halfWidth;
  y = y - halfHeight;
    for (var i = -2; i < 3; ++i) {
        if (left > 0) {
            boids.boids.push(
                new Boid(new Vector(x+i*10, y+i*10), new Vector(Math.random()*6-3,Math.random()*6-3), 2)
            );
            left --;
        }
    }
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
      if (boidData[i].side == 1) {
          ctx.fillStyle = '#543D5E';
      } else {
          ctx.fillStyle = 'rgba(255,0,0,0.25)'; // '#FFF1EB'
      }
    x = boidData[i].position.x; y = boidData[i].position.y;
    // wrap around the screen
    boidData[i].position.x = x > halfWidth ? -halfWidth : -x > halfWidth ? halfWidth : x;
    boidData[i].position.y = y > halfHeight ? -halfHeight : -y > halfHeight ? halfHeight : y;
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

},{"./":4,"./boid":1,"./vector":5,"debounce":6,"fps":7,"ticker":10}],3:[function(require,module,exports){
module.exports = Dtree;

function Dtree() {
  this.size = 0;
}

Dtree.prototype.insert = function(obj) {
  this.root = insert(this.root, obj, false);
};

Dtree.prototype.contains = function(obj) {
  return contains(this.root, obj);
};

Dtree.prototype.toString = function() {
  return toString(this.root);
};

Dtree.prototype.neighbors = function(point, radiusSq) {
  var objects = [],
    stack = [this.root],
    distSq,
    distX, distY,
    node,
    cmp,
    position,
    dist2line;

  // Not speeding up enough with recursion
  while(stack.length > 0) {
    node = stack.pop();
    position = node.value.position;
    isEven = node.isEven;

    distX = point.x - position.x;
    distY = point.y - position.y;
    distSq = distX * distX + distY * distY;

    if(distSq <= radiusSq) 
      objects.push({
        neighbor: node.value,
        distSq: distSq
      });

    cmp = (isEven ? (distY || distX) : (distX || distY));
    dist2line = Math.pow(isEven ? distY : distX, 2);

    if(node.left && (cmp <= 0 || dist2line <= radiusSq))
      stack.push(node.left);

    if(node.right && (cmp >= 0 || dist2line <= radiusSq))
      stack.push(node.right);

  }

  return objects;
};

function insert(node, obj, isEven) {
  if(!node) {
    return { value : obj, isEven: isEven };
  }

  var cmp = obj.compare(node.value, isEven);
  if(cmp < 0) {
    node.left = insert(node.left, obj, !isEven);
  } else if (cmp > 0) {
    node.right = insert(node.right, obj, !isEven);
  }

  return node;
}

function contains(node, obj, isEven) {
  if(!node) 
    return false;

  var cmp = obj.compare(node.value, isEven);
  
  if(cmp < 0)
    return contains(node.left, obj, !isEven);
  else if (cmp > 0)
    return contains(node.right, obj, !isEven);

  return true;

}

function toString(node) {
  if(!node) {
    return '';
  }

  return '{ L:' + toString(node.left) + 
    ', N:' + node.value + 
    ', R:' + toString(node.right) + '}';
}

},{}],4:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter,
  inherits = require('inherits'),
  Vector = require('./vector'),
  Dtree = require('./dtree'),
  Boid = require('./boid');

module.exports = Boids;

function Boids(opts, callback) {
  if (!(this instanceof Boids)) return new Boids(opts, callback);
  EventEmitter.call(this);

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

  for (var i = 0, l = opts.boids === undefined ? 100 : opts.boids; i < l; i += 1) {
    boids[i] = new Boid(
      new Vector(Math.random()*100 - 50, Math.random()*100 - 50),
      new Vector(0, 0)
    );
  }

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

Boids.prototype.findNeighbors = function(point) {
  this.tickData.neighbors = this.tickData.dtree.neighbors(point, this.maxDistSq);
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
            target.position.distance(boid.position)
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
    if(distSq < this.enemyDistanceSq ) {
      total = total.add(target.position
                        .subtract(boid.position).normalize());
      count++;
        break;
    }
  }

  if (count === 0)
    return new Vector(0, 0);

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

Boids.prototype.tick = function() {

  var boid;
  this.init();

  for(var i=0; i<this.boids.length; i++) {
    boid = this.boids[i];
    this.findNeighbors(boid.position);

    boid.acceleration = this.calcCohesion(boid)
      .multiplyBy(this.cohesionForce)
      .add(this.calcAlignment(boid)
        .multiplyBy(this.alignmentForce))
      .add(this.calcEnemy(boid)
        .multiplyBy(this.enemyForce))
      .subtract(this.calcSeparation(boid)
        .multiplyBy(this.separationForce));
  }

  delete this.tickData;

  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
    boid.speed = boid.speed
      .add(boid.acceleration)
      .limit(this.speedLimit);

    boid.position = boid.position.add(boid.speed);
    delete boid.acceleration;
  }
    var newBoids = [];

  for(var j=0; j<this.boids.length; j++) {
    boid = this.boids[j];
      if (boid.hp > 0) {
          boid.hp += 0.1;
          if (boid.hp > 100) {
              boid.hp = 100;
          }
          newBoids.push(boid);
      }
  }
    this.boids = newBoids;

  this.emit('tick', this.boids);
};

function isInFrontOf(boid, point) {
  return boid.position.angle( boid.position.add(boid.speed), point) <=
    ( Math.PI / 3);
}

},{"./boid":1,"./dtree":3,"./vector":5,"events":11,"inherits":8}],5:[function(require,module,exports){

function Vector(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.add = function(v) {
  return new Vector(this.x + v.x, this.y + v.y);
};

Vector.prototype.distSquared = function(v) {
  return Math.pow(this.x - v.x, 2) + 
    Math.pow(this.y - v.y, 2);
};

Vector.prototype.distance = function(v) {
  return Math.sqrt(this.distSquared(v));
};

Vector.prototype.multiplyBy = function(s) {
  return new Vector(this.x * s, this.y * s);
};

Vector.prototype.neg = function(v) {
  return new Vector(-this.x, -this.y);
};

Vector.prototype.magnitude = function() {
  return this.distance(new Vector(0, 0));
};

Vector.prototype.normalize = function() {
  var magnitude = this.magnitude();
  
  if(magnitude === 0)
    return new Vector(0, 0);

  return new Vector(this.x / magnitude, this.y / magnitude);
};

Vector.prototype.subtract = function(v) {
  return this.add(v.neg());
};

Vector.prototype.divideBy = function(s) {
  return this.multiplyBy(1 / s);
};

Vector.prototype.limit = function(s) {
  if(this.magnitude() > s)
    return this.normalize().multiplyBy(s);

  return this;
};

Vector.prototype.angle = function(p1, p2) {
  var v1 = this.subtract(p1).normalize();
  var v2 = this.subtract(p2).normalize();

  return Math.acos(v1.x * v2.x + v1.y * v2.y);
};

Vector.prototype.compare = function(that, y) {
  return (y && (this.y - that.y || this.x - that.x)) ||
    (this.x - that.x || this.y - that.y);
};

Vector.prototype.toString = function() {
  return "{x:" + this.x + ", y:" + this.y + "}";
};

module.exports = Vector;

},{}],6:[function(require,module,exports){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`true`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;
  if (false !== execAsap) execAsap = true;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

},{}],7:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter
  , inherits = require('inherits')

module.exports = fps

// Try use performance.now(), otherwise try
// +new Date.
var now = (
  (function(){ return this }()).performance &&
  'function' === typeof performance.now
) ? function() { return performance.now() }
  : Date.now || function() { return +new Date }

function fps(opts) {
  if (!(this instanceof fps)) return new fps(opts)
  EventEmitter.call(this)

  opts = opts || {}
  this.last = now()
  this.rate = 0
  this.time = 0
  this.decay = opts.decay || 1
  this.every = opts.every || 1
  this.ticks = 0
}
inherits(fps, EventEmitter)

fps.prototype.tick = function() {
  var time = now()
    , diff = time - this.last
    , fps = diff

  this.ticks += 1
  this.last = time
  this.time += (fps - this.time) * this.decay
  this.rate = 1000 / this.time
  if (!(this.ticks % this.every)) this.emit('data', this.rate)
}


},{"events":11,"inherits":8}],8:[function(require,module,exports){
module.exports = inherits

function inherits (c, p, proto) {
  proto = proto || {}
  var e = {}
  ;[c.prototype, proto].forEach(function (s) {
    Object.getOwnPropertyNames(s).forEach(function (k) {
      e[k] = Object.getOwnPropertyDescriptor(s, k)
    })
  })
  c.prototype = Object.create(p.prototype, e)
  c.super = p
}

//function Child () {
//  Child.super.call(this)
//  console.error([this
//                ,this.constructor
//                ,this.constructor === Child
//                ,this.constructor.super === Parent
//                ,Object.getPrototypeOf(this) === Child.prototype
//                ,Object.getPrototypeOf(Object.getPrototypeOf(this))
//                 === Parent.prototype
//                ,this instanceof Child
//                ,this instanceof Parent])
//}
//function Parent () {}
//inherits(Child, Parent)
//new Child

},{}],9:[function(require,module,exports){
module.exports = raf

var EE = require('events').EventEmitter
  , global = typeof window === 'undefined' ? this : window
  , now = Date.now || function () { return +new Date() }

var _raf =
  global.requestAnimationFrame ||
  global.webkitRequestAnimationFrame ||
  global.mozRequestAnimationFrame ||
  global.msRequestAnimationFrame ||
  global.oRequestAnimationFrame ||
  (global.setImmediate ? function(fn, el) {
    setImmediate(fn)
  } :
  function(fn, el) {
    setTimeout(fn, 0)
  })

function raf(el) {
  var now = raf.now()
    , ee = new EE

  ee.pause = function() { ee.paused = true }
  ee.resume = function() { ee.paused = false }

  _raf(iter, el)

  return ee

  function iter(timestamp) {
    var _now = raf.now()
      , dt = _now - now
    
    now = _now

    ee.emit('data', dt)

    if(!ee.paused) {
      _raf(iter, el)
    }
  }
}

raf.polyfill = _raf
raf.now = now


},{"events":11}],10:[function(require,module,exports){
var raf = require('raf')
  , EventEmitter = require('events').EventEmitter

module.exports = ticker

function ticker(element, rate, limit) {
  var millisecondsPerFrame = 1000 / (rate || 60)
    , time = 0
    , emitter

  limit = arguments.length > 2 ? +limit + 1 : 2
  emitter = raf(element || window).on('data', function(dt) {
    var n = limit

    time += dt
    while (time > millisecondsPerFrame && n) {
      time -= millisecondsPerFrame
      n -= 1
      emitter.emit('tick')
    }
    time = (time + millisecondsPerFrame * 1000) % millisecondsPerFrame

    if (n !== limit) emitter.emit('draw')
  })

  return emitter
}

},{"events":11,"raf":9}],11:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}]},{},[1,2,3,4,5]);
