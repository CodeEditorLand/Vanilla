var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { SetWithKey } from "./collections.js";
import { ArrayNavigator } from "./navigator.js";
class HistoryNavigator {
  static {
    __name(this, "HistoryNavigator");
  }
  _history;
  _limit;
  _navigator;
  constructor(history = [], limit = 10) {
    this._initialize(history);
    this._limit = limit;
    this._onChange();
  }
  getHistory() {
    return this._elements;
  }
  add(t) {
    this._history.delete(t);
    this._history.add(t);
    this._onChange();
  }
  next() {
    return this._navigator.next();
  }
  previous() {
    if (this._currentPosition() !== 0) {
      return this._navigator.previous();
    }
    return null;
  }
  current() {
    return this._navigator.current();
  }
  first() {
    return this._navigator.first();
  }
  last() {
    return this._navigator.last();
  }
  isFirst() {
    return this._currentPosition() === 0;
  }
  isLast() {
    return this._currentPosition() >= this._elements.length - 1;
  }
  isNowhere() {
    return this._navigator.current() === null;
  }
  has(t) {
    return this._history.has(t);
  }
  clear() {
    this._initialize([]);
    this._onChange();
  }
  _onChange() {
    this._reduceToLimit();
    const elements = this._elements;
    this._navigator = new ArrayNavigator(
      elements,
      0,
      elements.length,
      elements.length
    );
  }
  _reduceToLimit() {
    const data = this._elements;
    if (data.length > this._limit) {
      this._initialize(data.slice(data.length - this._limit));
    }
  }
  _currentPosition() {
    const currentElement = this._navigator.current();
    if (!currentElement) {
      return -1;
    }
    return this._elements.indexOf(currentElement);
  }
  _initialize(history) {
    this._history = /* @__PURE__ */ new Set();
    for (const entry of history) {
      this._history.add(entry);
    }
  }
  get _elements() {
    const elements = [];
    this._history.forEach((e) => elements.push(e));
    return elements;
  }
}
class HistoryNavigator2 {
  constructor(history, capacity = 10, identityFn = (t) => t) {
    this.capacity = capacity;
    this.identityFn = identityFn;
    if (history.length < 1) {
      throw new Error("not supported");
    }
    this._size = 1;
    this.head = this.tail = this.cursor = {
      value: history[0],
      previous: void 0,
      next: void 0
    };
    this.valueSet = new SetWithKey([history[0]], identityFn);
    for (let i = 1; i < history.length; i++) {
      this.add(history[i]);
    }
  }
  static {
    __name(this, "HistoryNavigator2");
  }
  valueSet;
  head;
  tail;
  cursor;
  _size;
  get size() {
    return this._size;
  }
  add(value) {
    const node = {
      value,
      previous: this.tail,
      next: void 0
    };
    this.tail.next = node;
    this.tail = node;
    this.cursor = this.tail;
    this._size++;
    if (this.valueSet.has(value)) {
      this._deleteFromList(value);
    } else {
      this.valueSet.add(value);
    }
    while (this._size > this.capacity) {
      this.valueSet.delete(this.head.value);
      this.head = this.head.next;
      this.head.previous = void 0;
      this._size--;
    }
  }
  /**
   * @returns old last value
   */
  replaceLast(value) {
    if (this.identityFn(this.tail.value) === this.identityFn(value)) {
      return value;
    }
    const oldValue = this.tail.value;
    this.valueSet.delete(oldValue);
    this.tail.value = value;
    if (this.valueSet.has(value)) {
      this._deleteFromList(value);
    } else {
      this.valueSet.add(value);
    }
    return oldValue;
  }
  prepend(value) {
    if (this._size === this.capacity || this.valueSet.has(value)) {
      return;
    }
    const node = {
      value,
      previous: void 0,
      next: this.head
    };
    this.head.previous = node;
    this.head = node;
    this._size++;
    this.valueSet.add(value);
  }
  isAtEnd() {
    return this.cursor === this.tail;
  }
  current() {
    return this.cursor.value;
  }
  previous() {
    if (this.cursor.previous) {
      this.cursor = this.cursor.previous;
    }
    return this.cursor.value;
  }
  next() {
    if (this.cursor.next) {
      this.cursor = this.cursor.next;
    }
    return this.cursor.value;
  }
  has(t) {
    return this.valueSet.has(t);
  }
  resetCursor() {
    this.cursor = this.tail;
    return this.cursor.value;
  }
  *[Symbol.iterator]() {
    let node = this.head;
    while (node) {
      yield node.value;
      node = node.next;
    }
  }
  _deleteFromList(value) {
    let temp = this.head;
    const valueKey = this.identityFn(value);
    while (temp !== this.tail) {
      if (this.identityFn(temp.value) === valueKey) {
        if (temp === this.head) {
          this.head = this.head.next;
          this.head.previous = void 0;
        } else {
          temp.previous.next = temp.next;
          temp.next.previous = temp.previous;
        }
        this._size--;
      }
      temp = temp.next;
    }
  }
}
export {
  HistoryNavigator,
  HistoryNavigator2
};
//# sourceMappingURL=history.js.map
