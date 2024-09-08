import { Emitter, Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
const staticObservableValue = (value) => ({
  onDidChange: Event.None,
  value
});
class MutableObservableValue extends Disposable {
  constructor(_value) {
    super();
    this._value = _value;
  }
  changeEmitter = this._register(new Emitter());
  onDidChange = this.changeEmitter.event;
  get value() {
    return this._value;
  }
  set value(v) {
    if (v !== this._value) {
      this._value = v;
      this.changeEmitter.fire(v);
    }
  }
  static stored(stored, defaultValue) {
    const o = new MutableObservableValue(stored.get(defaultValue));
    o._register(stored);
    o._register(o.onDidChange((value) => stored.store(value)));
    return o;
  }
}
export {
  MutableObservableValue,
  staticObservableValue
};
