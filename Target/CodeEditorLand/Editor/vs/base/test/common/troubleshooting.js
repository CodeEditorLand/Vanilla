import {
  setDisposableTracker
} from "../../common/lifecycle.js";
class DisposableTracker {
  allDisposables = [];
  trackDisposable(x) {
    this.allDisposables.push([x, new Error().stack]);
  }
  setParent(child, parent) {
    for (let idx = 0; idx < this.allDisposables.length; idx++) {
      if (this.allDisposables[idx][0] === child) {
        this.allDisposables.splice(idx, 1);
        return;
      }
    }
  }
  markAsDisposed(x) {
    for (let idx = 0; idx < this.allDisposables.length; idx++) {
      if (this.allDisposables[idx][0] === x) {
        this.allDisposables.splice(idx, 1);
        return;
      }
    }
  }
  markAsSingleton(disposable) {
  }
}
let currentTracker = null;
function beginTrackingDisposables() {
  currentTracker = new DisposableTracker();
  setDisposableTracker(currentTracker);
}
function endTrackingDisposables() {
  if (currentTracker) {
    setDisposableTracker(null);
    console.log(
      currentTracker.allDisposables.map((e) => `${e[0]}
${e[1]}`).join("\n\n")
    );
    currentTracker = null;
  }
}
function beginLoggingFS(withStacks = false) {
  self.beginLoggingFS?.(withStacks);
}
function endLoggingFS() {
  self.endLoggingFS?.();
}
export {
  beginLoggingFS,
  beginTrackingDisposables,
  endLoggingFS,
  endTrackingDisposables
};
