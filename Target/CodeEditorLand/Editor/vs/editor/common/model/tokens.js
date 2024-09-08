import { equals } from "../../../base/common/arrays.js";
import { RunOnceScheduler } from "../../../base/common/async.js";
import { Emitter } from "../../../base/common/event.js";
import { Disposable } from "../../../base/common/lifecycle.js";
import { LineRange } from "../core/lineRange.js";
import {
  BackgroundTokenizationState
} from "../tokenizationTextModelPart.js";
class AttachedViews {
  _onDidChangeVisibleRanges = new Emitter();
  onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
  _views = /* @__PURE__ */ new Set();
  attachView() {
    const view = new AttachedViewImpl((state) => {
      this._onDidChangeVisibleRanges.fire({ view, state });
    });
    this._views.add(view);
    return view;
  }
  detachView(view) {
    this._views.delete(view);
    this._onDidChangeVisibleRanges.fire({ view, state: void 0 });
  }
}
class AttachedViewImpl {
  constructor(handleStateChange) {
    this.handleStateChange = handleStateChange;
  }
  setVisibleLines(visibleLines, stabilized) {
    const visibleLineRanges = visibleLines.map(
      (line) => new LineRange(line.startLineNumber, line.endLineNumber + 1)
    );
    this.handleStateChange({ visibleLineRanges, stabilized });
  }
}
class AttachedViewHandler extends Disposable {
  constructor(_refreshTokens) {
    super();
    this._refreshTokens = _refreshTokens;
  }
  runner = this._register(
    new RunOnceScheduler(() => this.update(), 50)
  );
  _computedLineRanges = [];
  _lineRanges = [];
  get lineRanges() {
    return this._lineRanges;
  }
  update() {
    if (equals(
      this._computedLineRanges,
      this._lineRanges,
      (a, b) => a.equals(b)
    )) {
      return;
    }
    this._computedLineRanges = this._lineRanges;
    this._refreshTokens();
  }
  handleStateChange(state) {
    this._lineRanges = state.visibleLineRanges;
    if (state.stabilized) {
      this.runner.cancel();
      this.update();
    } else {
      this.runner.schedule();
    }
  }
}
class AbstractTokens extends Disposable {
  constructor(_languageIdCodec, _textModel, getLanguageId) {
    super();
    this._languageIdCodec = _languageIdCodec;
    this._textModel = _textModel;
    this.getLanguageId = getLanguageId;
  }
  _backgroundTokenizationState = BackgroundTokenizationState.InProgress;
  get backgroundTokenizationState() {
    return this._backgroundTokenizationState;
  }
  _onDidChangeBackgroundTokenizationState = this._register(
    new Emitter()
  );
  /** @internal, should not be exposed by the text model! */
  onDidChangeBackgroundTokenizationState = this._onDidChangeBackgroundTokenizationState.event;
  _onDidChangeTokens = this._register(
    new Emitter()
  );
  /** @internal, should not be exposed by the text model! */
  onDidChangeTokens = this._onDidChangeTokens.event;
  tokenizeIfCheap(lineNumber) {
    if (this.isCheapToTokenize(lineNumber)) {
      this.forceTokenization(lineNumber);
    }
  }
}
export {
  AbstractTokens,
  AttachedViewHandler,
  AttachedViews
};
