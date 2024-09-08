function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function rot(index, modulo) {
  return (modulo + index % modulo) % modulo;
}
class Counter {
  _next = 0;
  getNext() {
    return this._next++;
  }
}
class MovingAverage {
  _n = 1;
  _val = 0;
  update(value) {
    this._val = this._val + (value - this._val) / this._n;
    this._n += 1;
    return this._val;
  }
  get value() {
    return this._val;
  }
}
class SlidingWindowAverage {
  _n = 0;
  _val = 0;
  _values = [];
  _index = 0;
  _sum = 0;
  constructor(size) {
    this._values = new Array(size);
    this._values.fill(0, 0, size);
  }
  update(value) {
    const oldValue = this._values[this._index];
    this._values[this._index] = value;
    this._index = (this._index + 1) % this._values.length;
    this._sum -= oldValue;
    this._sum += value;
    if (this._n < this._values.length) {
      this._n += 1;
    }
    this._val = this._sum / this._n;
    return this._val;
  }
  get value() {
    return this._val;
  }
}
function isPointWithinTriangle(x, y, ax, ay, bx, by, cx, cy) {
  const v0x = cx - ax;
  const v0y = cy - ay;
  const v1x = bx - ax;
  const v1y = by - ay;
  const v2x = x - ax;
  const v2y = y - ay;
  const dot00 = v0x * v0x + v0y * v0y;
  const dot01 = v0x * v1x + v0y * v1y;
  const dot02 = v0x * v2x + v0y * v2y;
  const dot11 = v1x * v1x + v1y * v1y;
  const dot12 = v1x * v2x + v1y * v2y;
  const invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
  return u >= 0 && v >= 0 && u + v < 1;
}
export {
  Counter,
  MovingAverage,
  SlidingWindowAverage,
  clamp,
  isPointWithinTriangle,
  rot
};
