var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { findLast } from "../../../../base/common/arraysFind.js";
import { CancellationTokenSource } from "../../../../base/common/cancellation.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunHandleChanges,
  autorunOpts,
  autorunWithStore,
  observableValue,
  transaction
} from "../../../../base/common/observable.js";
import { Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { TextLength } from "../../../common/core/textLength.js";
import { ElementSizeObserver } from "../../config/elementSizeObserver.js";
function joinCombine(arr1, arr2, keySelector, combine) {
  if (arr1.length === 0) {
    return arr2;
  }
  if (arr2.length === 0) {
    return arr1;
  }
  const result = [];
  let i = 0;
  let j = 0;
  while (i < arr1.length && j < arr2.length) {
    const val1 = arr1[i];
    const val2 = arr2[j];
    const key1 = keySelector(val1);
    const key2 = keySelector(val2);
    if (key1 < key2) {
      result.push(val1);
      i++;
    } else if (key1 > key2) {
      result.push(val2);
      j++;
    } else {
      result.push(combine(val1, val2));
      i++;
      j++;
    }
  }
  while (i < arr1.length) {
    result.push(arr1[i]);
    i++;
  }
  while (j < arr2.length) {
    result.push(arr2[j]);
    j++;
  }
  return result;
}
__name(joinCombine, "joinCombine");
function applyObservableDecorations(editor, decorations) {
  const d = new DisposableStore();
  const decorationsCollection = editor.createDecorationsCollection();
  d.add(
    autorunOpts(
      {
        debugName: /* @__PURE__ */ __name(() => `Apply decorations from ${decorations.debugName}`, "debugName")
      },
      (reader) => {
        const d2 = decorations.read(reader);
        decorationsCollection.set(d2);
      }
    )
  );
  d.add({
    dispose: /* @__PURE__ */ __name(() => {
      decorationsCollection.clear();
    }, "dispose")
  });
  return d;
}
__name(applyObservableDecorations, "applyObservableDecorations");
function appendRemoveOnDispose(parent, child) {
  parent.appendChild(child);
  return toDisposable(() => {
    child.remove();
  });
}
__name(appendRemoveOnDispose, "appendRemoveOnDispose");
function prependRemoveOnDispose(parent, child) {
  parent.prepend(child);
  return toDisposable(() => {
    child.remove();
  });
}
__name(prependRemoveOnDispose, "prependRemoveOnDispose");
class ObservableElementSizeObserver extends Disposable {
  static {
    __name(this, "ObservableElementSizeObserver");
  }
  elementSizeObserver;
  _width;
  get width() {
    return this._width;
  }
  _height;
  get height() {
    return this._height;
  }
  _automaticLayout = false;
  get automaticLayout() {
    return this._automaticLayout;
  }
  constructor(element, dimension) {
    super();
    this.elementSizeObserver = this._register(
      new ElementSizeObserver(element, dimension)
    );
    this._width = observableValue(
      this,
      this.elementSizeObserver.getWidth()
    );
    this._height = observableValue(
      this,
      this.elementSizeObserver.getHeight()
    );
    this._register(
      this.elementSizeObserver.onDidChange(
        (e) => transaction((tx) => {
          this._width.set(this.elementSizeObserver.getWidth(), tx);
          this._height.set(this.elementSizeObserver.getHeight(), tx);
        })
      )
    );
  }
  observe(dimension) {
    this.elementSizeObserver.observe(dimension);
  }
  setAutomaticLayout(automaticLayout) {
    this._automaticLayout = automaticLayout;
    if (automaticLayout) {
      this.elementSizeObserver.startObserving();
    } else {
      this.elementSizeObserver.stopObserving();
    }
  }
}
function animatedObservable(targetWindow, base, store) {
  let targetVal = base.get();
  let startVal = targetVal;
  let curVal = targetVal;
  const result = observableValue("animatedValue", targetVal);
  let animationStartMs = -1;
  const durationMs = 300;
  let animationFrame;
  store.add(
    autorunHandleChanges(
      {
        createEmptyChangeSummary: /* @__PURE__ */ __name(() => ({ animate: false }), "createEmptyChangeSummary"),
        handleChange: /* @__PURE__ */ __name((ctx, s) => {
          if (ctx.didChange(base)) {
            s.animate = s.animate || ctx.change;
          }
          return true;
        }, "handleChange")
      },
      (reader, s) => {
        if (animationFrame !== void 0) {
          targetWindow.cancelAnimationFrame(animationFrame);
          animationFrame = void 0;
        }
        startVal = curVal;
        targetVal = base.read(reader);
        animationStartMs = Date.now() - (s.animate ? 0 : durationMs);
        update();
      }
    )
  );
  function update() {
    const passedMs = Date.now() - animationStartMs;
    curVal = Math.floor(
      easeOutExpo(passedMs, startVal, targetVal - startVal, durationMs)
    );
    if (passedMs < durationMs) {
      animationFrame = targetWindow.requestAnimationFrame(update);
    } else {
      curVal = targetVal;
    }
    result.set(curVal, void 0);
  }
  __name(update, "update");
  return result;
}
__name(animatedObservable, "animatedObservable");
function easeOutExpo(t, b, c, d) {
  return t === d ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
}
__name(easeOutExpo, "easeOutExpo");
function deepMerge(source1, source2) {
  const result = {};
  for (const key in source1) {
    result[key] = source1[key];
  }
  for (const key in source2) {
    const source2Value = source2[key];
    if (typeof result[key] === "object" && source2Value && typeof source2Value === "object") {
      result[key] = deepMerge(result[key], source2Value);
    } else {
      result[key] = source2Value;
    }
  }
  return result;
}
__name(deepMerge, "deepMerge");
class ViewZoneOverlayWidget extends Disposable {
  static {
    __name(this, "ViewZoneOverlayWidget");
  }
  constructor(editor, viewZone, htmlElement) {
    super();
    this._register(new ManagedOverlayWidget(editor, htmlElement));
    this._register(
      applyStyle(htmlElement, {
        height: viewZone.actualHeight,
        top: viewZone.actualTop
      })
    );
  }
}
class PlaceholderViewZone {
  constructor(_afterLineNumber, heightInPx) {
    this._afterLineNumber = _afterLineNumber;
    this.heightInPx = heightInPx;
  }
  static {
    __name(this, "PlaceholderViewZone");
  }
  domNode = document.createElement("div");
  _actualTop = observableValue(
    this,
    void 0
  );
  _actualHeight = observableValue(
    this,
    void 0
  );
  actualTop = this._actualTop;
  actualHeight = this._actualHeight;
  showInHiddenAreas = true;
  get afterLineNumber() {
    return this._afterLineNumber.get();
  }
  onChange = this._afterLineNumber;
  onDomNodeTop = /* @__PURE__ */ __name((top) => {
    this._actualTop.set(top, void 0);
  }, "onDomNodeTop");
  onComputedHeight = /* @__PURE__ */ __name((height) => {
    this._actualHeight.set(height, void 0);
  }, "onComputedHeight");
}
class ManagedOverlayWidget {
  constructor(_editor, _domElement) {
    this._editor = _editor;
    this._domElement = _domElement;
    this._editor.addOverlayWidget(this._overlayWidget);
  }
  static {
    __name(this, "ManagedOverlayWidget");
  }
  static _counter = 0;
  _overlayWidgetId = `managedOverlayWidget-${ManagedOverlayWidget._counter++}`;
  _overlayWidget = {
    getId: /* @__PURE__ */ __name(() => this._overlayWidgetId, "getId"),
    getDomNode: /* @__PURE__ */ __name(() => this._domElement, "getDomNode"),
    getPosition: /* @__PURE__ */ __name(() => null, "getPosition")
  };
  dispose() {
    this._editor.removeOverlayWidget(this._overlayWidget);
  }
}
function applyStyle(domNode, style) {
  return autorun((reader) => {
    for (let [key, val] of Object.entries(style)) {
      if (val && typeof val === "object" && "read" in val) {
        val = val.read(reader);
      }
      if (typeof val === "number") {
        val = `${val}px`;
      }
      key = key.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
      domNode.style[key] = val;
    }
  });
}
__name(applyStyle, "applyStyle");
function applyViewZones(editor, viewZones, setIsUpdating, zoneIds) {
  const store = new DisposableStore();
  const lastViewZoneIds = [];
  store.add(
    autorunWithStore((reader, store2) => {
      const curViewZones = viewZones.read(reader);
      const viewZonIdsPerViewZone = /* @__PURE__ */ new Map();
      const viewZoneIdPerOnChangeObservable = /* @__PURE__ */ new Map();
      if (setIsUpdating) {
        setIsUpdating(true);
      }
      editor.changeViewZones((a) => {
        for (const id of lastViewZoneIds) {
          a.removeZone(id);
          zoneIds?.delete(id);
        }
        lastViewZoneIds.length = 0;
        for (const z of curViewZones) {
          const id = a.addZone(z);
          if (z.setZoneId) {
            z.setZoneId(id);
          }
          lastViewZoneIds.push(id);
          zoneIds?.add(id);
          viewZonIdsPerViewZone.set(z, id);
        }
      });
      if (setIsUpdating) {
        setIsUpdating(false);
      }
      store2.add(
        autorunHandleChanges(
          {
            createEmptyChangeSummary() {
              return { zoneIds: [] };
            },
            handleChange(context, changeSummary) {
              const id = viewZoneIdPerOnChangeObservable.get(
                context.changedObservable
              );
              if (id !== void 0) {
                changeSummary.zoneIds.push(id);
              }
              return true;
            }
          },
          (reader2, changeSummary) => {
            for (const vz of curViewZones) {
              if (vz.onChange) {
                viewZoneIdPerOnChangeObservable.set(
                  vz.onChange,
                  viewZonIdsPerViewZone.get(vz)
                );
                vz.onChange.read(reader2);
              }
            }
            if (setIsUpdating) {
              setIsUpdating(true);
            }
            editor.changeViewZones((a) => {
              for (const id of changeSummary.zoneIds) {
                a.layoutZone(id);
              }
            });
            if (setIsUpdating) {
              setIsUpdating(false);
            }
          }
        )
      );
    })
  );
  store.add({
    dispose() {
      if (setIsUpdating) {
        setIsUpdating(true);
      }
      editor.changeViewZones((a) => {
        for (const id of lastViewZoneIds) {
          a.removeZone(id);
        }
      });
      zoneIds?.clear();
      if (setIsUpdating) {
        setIsUpdating(false);
      }
    }
  });
  return store;
}
__name(applyViewZones, "applyViewZones");
class DisposableCancellationTokenSource extends CancellationTokenSource {
  static {
    __name(this, "DisposableCancellationTokenSource");
  }
  dispose() {
    super.dispose(true);
  }
}
function translatePosition(posInOriginal, mappings) {
  const mapping = findLast(
    mappings,
    (m) => m.original.startLineNumber <= posInOriginal.lineNumber
  );
  if (!mapping) {
    return Range.fromPositions(posInOriginal);
  }
  if (mapping.original.endLineNumberExclusive <= posInOriginal.lineNumber) {
    const newLineNumber = posInOriginal.lineNumber - mapping.original.endLineNumberExclusive + mapping.modified.endLineNumberExclusive;
    return Range.fromPositions(
      new Position(newLineNumber, posInOriginal.column)
    );
  }
  if (!mapping.innerChanges) {
    return Range.fromPositions(
      new Position(mapping.modified.startLineNumber, 1)
    );
  }
  const innerMapping = findLast(
    mapping.innerChanges,
    (m) => m.originalRange.getStartPosition().isBeforeOrEqual(posInOriginal)
  );
  if (!innerMapping) {
    const newLineNumber = posInOriginal.lineNumber - mapping.original.startLineNumber + mapping.modified.startLineNumber;
    return Range.fromPositions(
      new Position(newLineNumber, posInOriginal.column)
    );
  }
  if (innerMapping.originalRange.containsPosition(posInOriginal)) {
    return innerMapping.modifiedRange;
  } else {
    const l = lengthBetweenPositions(
      innerMapping.originalRange.getEndPosition(),
      posInOriginal
    );
    return Range.fromPositions(
      l.addToPosition(innerMapping.modifiedRange.getEndPosition())
    );
  }
}
__name(translatePosition, "translatePosition");
function lengthBetweenPositions(position1, position2) {
  if (position1.lineNumber === position2.lineNumber) {
    return new TextLength(0, position2.column - position1.column);
  } else {
    return new TextLength(
      position2.lineNumber - position1.lineNumber,
      position2.column - 1
    );
  }
}
__name(lengthBetweenPositions, "lengthBetweenPositions");
function filterWithPrevious(arr, filter) {
  let prev;
  return arr.filter((cur) => {
    const result = filter(cur, prev);
    prev = cur;
    return result;
  });
}
__name(filterWithPrevious, "filterWithPrevious");
class RefCounted {
  static {
    __name(this, "RefCounted");
  }
  static create(value, debugOwner = void 0) {
    return new BaseRefCounted(value, value, debugOwner);
  }
  static createWithDisposable(value, disposable, debugOwner = void 0) {
    const store = new DisposableStore();
    store.add(disposable);
    store.add(value);
    return new BaseRefCounted(value, store, debugOwner);
  }
  static createOfNonDisposable(value, disposable, debugOwner = void 0) {
    return new BaseRefCounted(value, disposable, debugOwner);
  }
}
class BaseRefCounted extends RefCounted {
  constructor(object, _disposable, _debugOwner) {
    super();
    this.object = object;
    this._disposable = _disposable;
    this._debugOwner = _debugOwner;
    if (_debugOwner) {
      this._addOwner(_debugOwner);
    }
  }
  static {
    __name(this, "BaseRefCounted");
  }
  _refCount = 1;
  _isDisposed = false;
  _owners = [];
  _addOwner(debugOwner) {
    if (debugOwner) {
      this._owners.push(debugOwner);
    }
  }
  createNewRef(debugOwner) {
    this._refCount++;
    if (debugOwner) {
      this._addOwner(debugOwner);
    }
    return new ClonedRefCounted(this, debugOwner);
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._decreaseRefCount(this._debugOwner);
  }
  _decreaseRefCount(debugOwner) {
    this._refCount--;
    if (this._refCount === 0) {
      this._disposable.dispose();
    }
    if (debugOwner) {
      const idx = this._owners.indexOf(debugOwner);
      if (idx !== -1) {
        this._owners.splice(idx, 1);
      }
    }
  }
}
class ClonedRefCounted extends RefCounted {
  constructor(_base, _debugOwner) {
    super();
    this._base = _base;
    this._debugOwner = _debugOwner;
  }
  static {
    __name(this, "ClonedRefCounted");
  }
  _isDisposed = false;
  get object() {
    return this._base.object;
  }
  createNewRef(debugOwner) {
    return this._base.createNewRef(debugOwner);
  }
  dispose() {
    if (this._isDisposed) {
      return;
    }
    this._isDisposed = true;
    this._base._decreaseRefCount(this._debugOwner);
  }
}
export {
  DisposableCancellationTokenSource,
  ManagedOverlayWidget,
  ObservableElementSizeObserver,
  PlaceholderViewZone,
  RefCounted,
  ViewZoneOverlayWidget,
  animatedObservable,
  appendRemoveOnDispose,
  applyObservableDecorations,
  applyStyle,
  applyViewZones,
  deepMerge,
  filterWithPrevious,
  joinCombine,
  prependRemoveOnDispose,
  translatePosition
};
//# sourceMappingURL=utils.js.map
