import {
  Orientation,
  Sash,
  SashState
} from "../../../../../base/browser/ui/sash/sash.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  observableValue
} from "../../../../../base/common/observable.js";
import { derivedWithSetter } from "../../../../../base/common/observableInternal/derived.js";
class SashLayout {
  constructor(_options, dimensions) {
    this._options = _options;
    this.dimensions = dimensions;
  }
  sashLeft = derivedWithSetter(
    this,
    (reader) => {
      const ratio = this._sashRatio.read(reader) ?? this._options.splitViewDefaultRatio.read(reader);
      return this._computeSashLeft(ratio, reader);
    },
    (value, tx) => {
      const contentWidth = this.dimensions.width.get();
      this._sashRatio.set(value / contentWidth, tx);
    }
  );
  _sashRatio = observableValue(
    this,
    void 0
  );
  resetSash() {
    this._sashRatio.set(void 0, void 0);
  }
  /** @pure */
  _computeSashLeft(desiredRatio, reader) {
    const contentWidth = this.dimensions.width.read(reader);
    const midPoint = Math.floor(
      this._options.splitViewDefaultRatio.read(reader) * contentWidth
    );
    const sashLeft = this._options.enableSplitViewResizing.read(reader) ? Math.floor(desiredRatio * contentWidth) : midPoint;
    const MINIMUM_EDITOR_WIDTH = 100;
    if (contentWidth <= MINIMUM_EDITOR_WIDTH * 2) {
      return midPoint;
    }
    if (sashLeft < MINIMUM_EDITOR_WIDTH) {
      return MINIMUM_EDITOR_WIDTH;
    }
    if (sashLeft > contentWidth - MINIMUM_EDITOR_WIDTH) {
      return contentWidth - MINIMUM_EDITOR_WIDTH;
    }
    return sashLeft;
  }
}
class DiffEditorSash extends Disposable {
  constructor(_domNode, _dimensions, _enabled, _boundarySashes, sashLeft, _resetSash) {
    super();
    this._domNode = _domNode;
    this._dimensions = _dimensions;
    this._enabled = _enabled;
    this._boundarySashes = _boundarySashes;
    this.sashLeft = sashLeft;
    this._resetSash = _resetSash;
    this._register(
      this._sash.onDidStart(() => {
        this._startSashPosition = this.sashLeft.get();
      })
    );
    this._register(
      this._sash.onDidChange((e) => {
        this.sashLeft.set(
          this._startSashPosition + (e.currentX - e.startX),
          void 0
        );
      })
    );
    this._register(this._sash.onDidEnd(() => this._sash.layout()));
    this._register(this._sash.onDidReset(() => this._resetSash()));
    this._register(
      autorun((reader) => {
        const sashes = this._boundarySashes.read(reader);
        if (sashes) {
          this._sash.orthogonalEndSash = sashes.bottom;
        }
      })
    );
    this._register(
      autorun((reader) => {
        const enabled = this._enabled.read(reader);
        this._sash.state = enabled ? SashState.Enabled : SashState.Disabled;
        this.sashLeft.read(reader);
        this._dimensions.height.read(reader);
        this._sash.layout();
      })
    );
  }
  _sash = this._register(
    new Sash(
      this._domNode,
      {
        getVerticalSashTop: (_sash) => 0,
        getVerticalSashLeft: (_sash) => this.sashLeft.get(),
        getVerticalSashHeight: (_sash) => this._dimensions.height.get()
      },
      { orientation: Orientation.VERTICAL }
    )
  );
  _startSashPosition = void 0;
}
export {
  DiffEditorSash,
  SashLayout
};
