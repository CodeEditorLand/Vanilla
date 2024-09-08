const MINIMUM_SLIDER_SIZE = 20;
class ScrollbarState {
  /**
   * For the vertical scrollbar: the width.
   * For the horizontal scrollbar: the height.
   */
  _scrollbarSize;
  /**
   * For the vertical scrollbar: the height of the pair horizontal scrollbar.
   * For the horizontal scrollbar: the width of the pair vertical scrollbar.
   */
  _oppositeScrollbarSize;
  /**
   * For the vertical scrollbar: the height of the scrollbar's arrows.
   * For the horizontal scrollbar: the width of the scrollbar's arrows.
   */
  _arrowSize;
  // --- variables
  /**
   * For the vertical scrollbar: the viewport height.
   * For the horizontal scrollbar: the viewport width.
   */
  _visibleSize;
  /**
   * For the vertical scrollbar: the scroll height.
   * For the horizontal scrollbar: the scroll width.
   */
  _scrollSize;
  /**
   * For the vertical scrollbar: the scroll top.
   * For the horizontal scrollbar: the scroll left.
   */
  _scrollPosition;
  // --- computed variables
  /**
   * `visibleSize` - `oppositeScrollbarSize`
   */
  _computedAvailableSize;
  /**
   * (`scrollSize` > 0 && `scrollSize` > `visibleSize`)
   */
  _computedIsNeeded;
  _computedSliderSize;
  _computedSliderRatio;
  _computedSliderPosition;
  constructor(arrowSize, scrollbarSize, oppositeScrollbarSize, visibleSize, scrollSize, scrollPosition) {
    this._scrollbarSize = Math.round(scrollbarSize);
    this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
    this._arrowSize = Math.round(arrowSize);
    this._visibleSize = visibleSize;
    this._scrollSize = scrollSize;
    this._scrollPosition = scrollPosition;
    this._computedAvailableSize = 0;
    this._computedIsNeeded = false;
    this._computedSliderSize = 0;
    this._computedSliderRatio = 0;
    this._computedSliderPosition = 0;
    this._refreshComputedValues();
  }
  clone() {
    return new ScrollbarState(
      this._arrowSize,
      this._scrollbarSize,
      this._oppositeScrollbarSize,
      this._visibleSize,
      this._scrollSize,
      this._scrollPosition
    );
  }
  setVisibleSize(visibleSize) {
    const iVisibleSize = Math.round(visibleSize);
    if (this._visibleSize !== iVisibleSize) {
      this._visibleSize = iVisibleSize;
      this._refreshComputedValues();
      return true;
    }
    return false;
  }
  setScrollSize(scrollSize) {
    const iScrollSize = Math.round(scrollSize);
    if (this._scrollSize !== iScrollSize) {
      this._scrollSize = iScrollSize;
      this._refreshComputedValues();
      return true;
    }
    return false;
  }
  setScrollPosition(scrollPosition) {
    const iScrollPosition = Math.round(scrollPosition);
    if (this._scrollPosition !== iScrollPosition) {
      this._scrollPosition = iScrollPosition;
      this._refreshComputedValues();
      return true;
    }
    return false;
  }
  setScrollbarSize(scrollbarSize) {
    this._scrollbarSize = Math.round(scrollbarSize);
  }
  setOppositeScrollbarSize(oppositeScrollbarSize) {
    this._oppositeScrollbarSize = Math.round(oppositeScrollbarSize);
  }
  static _computeValues(oppositeScrollbarSize, arrowSize, visibleSize, scrollSize, scrollPosition) {
    const computedAvailableSize = Math.max(
      0,
      visibleSize - oppositeScrollbarSize
    );
    const computedRepresentableSize = Math.max(
      0,
      computedAvailableSize - 2 * arrowSize
    );
    const computedIsNeeded = scrollSize > 0 && scrollSize > visibleSize;
    if (!computedIsNeeded) {
      return {
        computedAvailableSize: Math.round(computedAvailableSize),
        computedIsNeeded,
        computedSliderSize: Math.round(computedRepresentableSize),
        computedSliderRatio: 0,
        computedSliderPosition: 0
      };
    }
    const computedSliderSize = Math.round(
      Math.max(
        MINIMUM_SLIDER_SIZE,
        Math.floor(
          visibleSize * computedRepresentableSize / scrollSize
        )
      )
    );
    const computedSliderRatio = (computedRepresentableSize - computedSliderSize) / (scrollSize - visibleSize);
    const computedSliderPosition = scrollPosition * computedSliderRatio;
    return {
      computedAvailableSize: Math.round(computedAvailableSize),
      computedIsNeeded,
      computedSliderSize: Math.round(computedSliderSize),
      computedSliderRatio,
      computedSliderPosition: Math.round(computedSliderPosition)
    };
  }
  _refreshComputedValues() {
    const r = ScrollbarState._computeValues(
      this._oppositeScrollbarSize,
      this._arrowSize,
      this._visibleSize,
      this._scrollSize,
      this._scrollPosition
    );
    this._computedAvailableSize = r.computedAvailableSize;
    this._computedIsNeeded = r.computedIsNeeded;
    this._computedSliderSize = r.computedSliderSize;
    this._computedSliderRatio = r.computedSliderRatio;
    this._computedSliderPosition = r.computedSliderPosition;
  }
  getArrowSize() {
    return this._arrowSize;
  }
  getScrollPosition() {
    return this._scrollPosition;
  }
  getRectangleLargeSize() {
    return this._computedAvailableSize;
  }
  getRectangleSmallSize() {
    return this._scrollbarSize;
  }
  isNeeded() {
    return this._computedIsNeeded;
  }
  getSliderSize() {
    return this._computedSliderSize;
  }
  getSliderPosition() {
    return this._computedSliderPosition;
  }
  /**
   * Compute a desired `scrollPosition` such that `offset` ends up in the center of the slider.
   * `offset` is based on the same coordinate system as the `sliderPosition`.
   */
  getDesiredScrollPositionFromOffset(offset) {
    if (!this._computedIsNeeded) {
      return 0;
    }
    const desiredSliderPosition = offset - this._arrowSize - this._computedSliderSize / 2;
    return Math.round(desiredSliderPosition / this._computedSliderRatio);
  }
  /**
   * Compute a desired `scrollPosition` from if offset is before or after the slider position.
   * If offset is before slider, treat as a page up (or left).  If after, page down (or right).
   * `offset` and `_computedSliderPosition` are based on the same coordinate system.
   * `_visibleSize` corresponds to a "page" of lines in the returned coordinate system.
   */
  getDesiredScrollPositionFromOffsetPaged(offset) {
    if (!this._computedIsNeeded) {
      return 0;
    }
    const correctedOffset = offset - this._arrowSize;
    let desiredScrollPosition = this._scrollPosition;
    if (correctedOffset < this._computedSliderPosition) {
      desiredScrollPosition -= this._visibleSize;
    } else {
      desiredScrollPosition += this._visibleSize;
    }
    return desiredScrollPosition;
  }
  /**
   * Compute a desired `scrollPosition` such that the slider moves by `delta`.
   */
  getDesiredScrollPositionFromDelta(delta) {
    if (!this._computedIsNeeded) {
      return 0;
    }
    const desiredSliderPosition = this._computedSliderPosition + delta;
    return Math.round(desiredSliderPosition / this._computedSliderRatio);
  }
}
export {
  ScrollbarState
};
