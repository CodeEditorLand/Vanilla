var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);
import * as dom from "../../base/browser/dom.js";
import {
  createFastDomNode
} from "../../base/browser/fastDomNode.js";
import { inputLatency } from "../../base/browser/performance.js";
import {
  BugIndicatingError,
  onUnexpectedError
} from "../../base/common/errors.js";
import { IInstantiationService } from "../../platform/instantiation/common/instantiation.js";
import {
  getThemeTypeSelector
} from "../../platform/theme/common/themeService.js";
import { EditorOption } from "../common/config/editorOptions.js";
import { Position } from "../common/core/position.js";
import { Range } from "../common/core/range.js";
import { Selection } from "../common/core/selection.js";
import { ScrollType } from "../common/editorCommon.js";
import {
  GlyphMarginLane
} from "../common/model.js";
import { ViewEventHandler } from "../common/viewEventHandler.js";
import { ViewportData } from "../common/viewLayout/viewLinesViewportData.js";
import { ViewContext } from "../common/viewModel/viewContext.js";
import { NativeEditContext } from "./controller/editContext/native/nativeEditContext.js";
import {
  TextAreaEditContext
} from "./controller/editContext/textArea/textAreaEditContext.js";
import { PointerHandlerLastRenderData } from "./controller/mouseTarget.js";
import { PointerHandler } from "./controller/pointerHandler.js";
import { ViewGpuContext } from "./gpu/viewGpuContext.js";
import {
  RenderingContext
} from "./view/renderingContext.js";
import {
  ViewController
} from "./view/viewController.js";
import {
  ContentViewOverlays,
  MarginViewOverlays
} from "./view/viewOverlays.js";
import {
  PartFingerprint,
  PartFingerprints
} from "./view/viewPart.js";
import { ViewUserInputEvents } from "./view/viewUserInputEvents.js";
import { BlockDecorations } from "./viewParts/blockDecorations/blockDecorations.js";
import { ViewContentWidgets } from "./viewParts/contentWidgets/contentWidgets.js";
import {
  CurrentLineHighlightOverlay,
  CurrentLineMarginHighlightOverlay
} from "./viewParts/currentLineHighlight/currentLineHighlight.js";
import { DecorationsOverlay } from "./viewParts/decorations/decorations.js";
import { EditorScrollbar } from "./viewParts/editorScrollbar/editorScrollbar.js";
import { GlyphMarginWidgets } from "./viewParts/glyphMargin/glyphMargin.js";
import { IndentGuidesOverlay } from "./viewParts/indentGuides/indentGuides.js";
import { LineNumbersOverlay } from "./viewParts/lineNumbers/lineNumbers.js";
import { LinesDecorationsOverlay } from "./viewParts/linesDecorations/linesDecorations.js";
import { Margin } from "./viewParts/margin/margin.js";
import { MarginViewLineDecorationsOverlay } from "./viewParts/marginDecorations/marginDecorations.js";
import { Minimap } from "./viewParts/minimap/minimap.js";
import { ViewOverlayWidgets } from "./viewParts/overlayWidgets/overlayWidgets.js";
import { DecorationsOverviewRuler } from "./viewParts/overviewRuler/decorationsOverviewRuler.js";
import { OverviewRuler } from "./viewParts/overviewRuler/overviewRuler.js";
import { Rulers } from "./viewParts/rulers/rulers.js";
import { ScrollDecorationViewPart } from "./viewParts/scrollDecoration/scrollDecoration.js";
import { SelectionsOverlay } from "./viewParts/selections/selections.js";
import { ViewCursors } from "./viewParts/viewCursors/viewCursors.js";
import { ViewLines } from "./viewParts/viewLines/viewLines.js";
import { ViewLinesGpu } from "./viewParts/viewLinesGpu/viewLinesGpu.js";
import { ViewZones } from "./viewParts/viewZones/viewZones.js";
import { WhitespaceOverlay } from "./viewParts/whitespace/whitespace.js";
let View = class extends ViewEventHandler {
  constructor(commandDelegate, configuration, colorTheme, model, userInputEvents, overflowWidgetsDomNode, _instantiationService) {
    super();
    this._instantiationService = _instantiationService;
    this._selections = [new Selection(1, 1, 1, 1)];
    this._renderAnimationFrame = null;
    this._viewController = new ViewController(
      configuration,
      model,
      userInputEvents,
      commandDelegate
    );
    this._context = new ViewContext(configuration, colorTheme, model);
    this._context.addEventHandler(this);
    this._viewParts = [];
    this._experimentalEditContextEnabled = this._context.configuration.options.get(
      EditorOption.experimentalEditContextEnabled
    );
    this._editContext = this._instantiateEditContext(
      this._experimentalEditContextEnabled
    );
    this._viewParts.push(this._editContext);
    this._linesContent = createFastDomNode(document.createElement("div"));
    this._linesContent.setClassName(
      "lines-content monaco-editor-background"
    );
    this._linesContent.setPosition("absolute");
    this.domNode = createFastDomNode(document.createElement("div"));
    this.domNode.setClassName(this._getEditorClassName());
    this.domNode.setAttribute("role", "code");
    if (this._context.configuration.options.get(EditorOption.experimentalGpuAcceleration) === "on") {
      this._viewGpuContext = this._instantiationService.createInstance(ViewGpuContext);
    }
    this._overflowGuardContainer = createFastDomNode(
      document.createElement("div")
    );
    PartFingerprints.write(
      this._overflowGuardContainer,
      PartFingerprint.OverflowGuard
    );
    this._overflowGuardContainer.setClassName("overflow-guard");
    this._scrollbar = new EditorScrollbar(
      this._context,
      this._linesContent,
      this.domNode,
      this._overflowGuardContainer
    );
    this._viewParts.push(this._scrollbar);
    this._viewLines = new ViewLines(this._context, this._linesContent);
    if (this._viewGpuContext) {
      this._viewLinesGpu = this._instantiationService.createInstance(
        ViewLinesGpu,
        this._context,
        this._viewGpuContext
      );
    }
    this._viewZones = new ViewZones(this._context);
    this._viewParts.push(this._viewZones);
    const decorationsOverviewRuler = new DecorationsOverviewRuler(
      this._context
    );
    this._viewParts.push(decorationsOverviewRuler);
    const scrollDecoration = new ScrollDecorationViewPart(this._context);
    this._viewParts.push(scrollDecoration);
    const contentViewOverlays = new ContentViewOverlays(this._context);
    this._viewParts.push(contentViewOverlays);
    contentViewOverlays.addDynamicOverlay(
      new CurrentLineHighlightOverlay(this._context)
    );
    contentViewOverlays.addDynamicOverlay(
      new SelectionsOverlay(this._context)
    );
    contentViewOverlays.addDynamicOverlay(
      new IndentGuidesOverlay(this._context)
    );
    contentViewOverlays.addDynamicOverlay(
      new DecorationsOverlay(this._context)
    );
    contentViewOverlays.addDynamicOverlay(
      new WhitespaceOverlay(this._context)
    );
    const marginViewOverlays = new MarginViewOverlays(this._context);
    this._viewParts.push(marginViewOverlays);
    marginViewOverlays.addDynamicOverlay(
      new CurrentLineMarginHighlightOverlay(this._context)
    );
    marginViewOverlays.addDynamicOverlay(
      new MarginViewLineDecorationsOverlay(this._context)
    );
    marginViewOverlays.addDynamicOverlay(
      new LinesDecorationsOverlay(this._context)
    );
    marginViewOverlays.addDynamicOverlay(
      new LineNumbersOverlay(this._context)
    );
    this._glyphMarginWidgets = new GlyphMarginWidgets(this._context);
    this._viewParts.push(this._glyphMarginWidgets);
    const margin = new Margin(this._context);
    margin.getDomNode().appendChild(this._viewZones.marginDomNode);
    margin.getDomNode().appendChild(marginViewOverlays.getDomNode());
    margin.getDomNode().appendChild(this._glyphMarginWidgets.domNode);
    this._viewParts.push(margin);
    this._contentWidgets = new ViewContentWidgets(
      this._context,
      this.domNode
    );
    this._viewParts.push(this._contentWidgets);
    this._viewCursors = new ViewCursors(this._context);
    this._viewParts.push(this._viewCursors);
    this._overlayWidgets = new ViewOverlayWidgets(
      this._context,
      this.domNode
    );
    this._viewParts.push(this._overlayWidgets);
    const rulers = new Rulers(this._context);
    this._viewParts.push(rulers);
    const blockOutline = new BlockDecorations(this._context);
    this._viewParts.push(blockOutline);
    const minimap = new Minimap(this._context);
    this._viewParts.push(minimap);
    if (decorationsOverviewRuler) {
      const overviewRulerData = this._scrollbar.getOverviewRulerLayoutInfo();
      overviewRulerData.parent.insertBefore(
        decorationsOverviewRuler.getDomNode(),
        overviewRulerData.insertBefore
      );
    }
    this._linesContent.appendChild(contentViewOverlays.getDomNode());
    this._linesContent.appendChild(rulers.domNode);
    this._linesContent.appendChild(this._viewZones.domNode);
    this._linesContent.appendChild(this._viewLines.getDomNode());
    this._linesContent.appendChild(this._contentWidgets.domNode);
    this._linesContent.appendChild(this._viewCursors.getDomNode());
    this._overflowGuardContainer.appendChild(margin.getDomNode());
    this._overflowGuardContainer.appendChild(this._scrollbar.getDomNode());
    if (this._viewGpuContext) {
      this._overflowGuardContainer.appendChild(
        this._viewGpuContext.canvas
      );
    }
    this._overflowGuardContainer.appendChild(scrollDecoration.getDomNode());
    this._editContext.appendTo(this._overflowGuardContainer);
    this._overflowGuardContainer.appendChild(
      this._overlayWidgets.getDomNode()
    );
    this._overflowGuardContainer.appendChild(minimap.getDomNode());
    this._overflowGuardContainer.appendChild(blockOutline.domNode);
    this.domNode.appendChild(this._overflowGuardContainer);
    if (overflowWidgetsDomNode) {
      overflowWidgetsDomNode.appendChild(
        this._contentWidgets.overflowingContentWidgetsDomNode.domNode
      );
      overflowWidgetsDomNode.appendChild(
        this._overlayWidgets.overflowingOverlayWidgetsDomNode.domNode
      );
    } else {
      this.domNode.appendChild(
        this._contentWidgets.overflowingContentWidgetsDomNode
      );
      this.domNode.appendChild(
        this._overlayWidgets.overflowingOverlayWidgetsDomNode
      );
    }
    this._applyLayout();
    this._pointerHandler = this._register(
      new PointerHandler(
        this._context,
        this._viewController,
        this._createPointerHandlerHelper()
      )
    );
  }
  static {
    __name(this, "View");
  }
  _scrollbar;
  _context;
  _viewGpuContext;
  _selections;
  // The view lines
  _viewLines;
  _viewLinesGpu;
  // These are parts, but we must do some API related calls on them, so we keep a reference
  _viewZones;
  _contentWidgets;
  _overlayWidgets;
  _glyphMarginWidgets;
  _viewCursors;
  _viewParts;
  _viewController;
  _experimentalEditContextEnabled;
  _editContext;
  _pointerHandler;
  // Dom nodes
  _linesContent;
  domNode;
  _overflowGuardContainer;
  // Actual mutable state
  _shouldRecomputeGlyphMarginLanes = false;
  _renderAnimationFrame;
  _instantiateEditContext(experimentalEditContextEnabled) {
    return experimentalEditContextEnabled ? this._instantiationService.createInstance(
      NativeEditContext,
      this._context,
      this._viewController
    ) : this._instantiationService.createInstance(
      TextAreaEditContext,
      this._context,
      this._viewController,
      this._createTextAreaHandlerHelper()
    );
  }
  _updateEditContext() {
    const experimentalEditContextEnabled = this._context.configuration.options.get(
      EditorOption.experimentalEditContextEnabled
    );
    if (this._experimentalEditContextEnabled === experimentalEditContextEnabled) {
      return;
    }
    this._experimentalEditContextEnabled = experimentalEditContextEnabled;
    this._editContext.dispose();
    this._editContext = this._instantiateEditContext(
      experimentalEditContextEnabled
    );
    this._editContext.appendTo(this._overflowGuardContainer);
    const indexOfEditContextHandler = this._viewParts.indexOf(
      this._editContext
    );
    if (indexOfEditContextHandler !== -1) {
      this._viewParts.splice(
        indexOfEditContextHandler,
        1,
        this._editContext
      );
    }
  }
  _computeGlyphMarginLanes() {
    const model = this._context.viewModel.model;
    const laneModel = this._context.viewModel.glyphLanes;
    let glyphs = [];
    let maxLineNumber = 0;
    glyphs = glyphs.concat(
      model.getAllMarginDecorations().map((decoration) => {
        const lane = decoration.options.glyphMargin?.position ?? GlyphMarginLane.Center;
        maxLineNumber = Math.max(
          maxLineNumber,
          decoration.range.endLineNumber
        );
        return {
          range: decoration.range,
          lane,
          persist: decoration.options.glyphMargin?.persistLane
        };
      })
    );
    glyphs = glyphs.concat(
      this._glyphMarginWidgets.getWidgets().map((widget) => {
        const range = model.validateRange(widget.preference.range);
        maxLineNumber = Math.max(maxLineNumber, range.endLineNumber);
        return { range, lane: widget.preference.lane };
      })
    );
    glyphs.sort((a, b) => Range.compareRangesUsingStarts(a.range, b.range));
    laneModel.reset(maxLineNumber);
    for (const glyph of glyphs) {
      laneModel.push(glyph.lane, glyph.range, glyph.persist);
    }
    return laneModel;
  }
  _createPointerHandlerHelper() {
    return {
      viewDomNode: this.domNode.domNode,
      linesContentDomNode: this._linesContent.domNode,
      viewLinesDomNode: this._viewLines.getDomNode().domNode,
      focusTextArea: /* @__PURE__ */ __name(() => {
        this.focus();
      }, "focusTextArea"),
      dispatchTextAreaEvent: /* @__PURE__ */ __name((event) => {
        this._editContext.domNode.domNode.dispatchEvent(event);
      }, "dispatchTextAreaEvent"),
      getLastRenderData: /* @__PURE__ */ __name(() => {
        const lastViewCursorsRenderData = this._viewCursors.getLastRenderData() || [];
        const lastTextareaPosition = this._editContext.getLastRenderData();
        return new PointerHandlerLastRenderData(
          lastViewCursorsRenderData,
          lastTextareaPosition
        );
      }, "getLastRenderData"),
      renderNow: /* @__PURE__ */ __name(() => {
        this.render(true, false);
      }, "renderNow"),
      shouldSuppressMouseDownOnViewZone: /* @__PURE__ */ __name((viewZoneId) => {
        return this._viewZones.shouldSuppressMouseDownOnViewZone(
          viewZoneId
        );
      }, "shouldSuppressMouseDownOnViewZone"),
      shouldSuppressMouseDownOnWidget: /* @__PURE__ */ __name((widgetId) => {
        return this._contentWidgets.shouldSuppressMouseDownOnWidget(
          widgetId
        );
      }, "shouldSuppressMouseDownOnWidget"),
      getPositionFromDOMInfo: /* @__PURE__ */ __name((spanNode, offset) => {
        this._flushAccumulatedAndRenderNow();
        return this._viewLines.getPositionFromDOMInfo(spanNode, offset);
      }, "getPositionFromDOMInfo"),
      visibleRangeForPosition: /* @__PURE__ */ __name((lineNumber, column) => {
        this._flushAccumulatedAndRenderNow();
        return this._viewLines.visibleRangeForPosition(
          new Position(lineNumber, column)
        );
      }, "visibleRangeForPosition"),
      getLineWidth: /* @__PURE__ */ __name((lineNumber) => {
        this._flushAccumulatedAndRenderNow();
        return this._viewLines.getLineWidth(lineNumber);
      }, "getLineWidth")
    };
  }
  _createTextAreaHandlerHelper() {
    return {
      visibleRangeForPosition: /* @__PURE__ */ __name((position) => {
        this._flushAccumulatedAndRenderNow();
        return this._viewLines.visibleRangeForPosition(position);
      }, "visibleRangeForPosition")
    };
  }
  _applyLayout() {
    const options = this._context.configuration.options;
    const layoutInfo = options.get(EditorOption.layoutInfo);
    this.domNode.setWidth(layoutInfo.width);
    this.domNode.setHeight(layoutInfo.height);
    this._overflowGuardContainer.setWidth(layoutInfo.width);
    this._overflowGuardContainer.setHeight(layoutInfo.height);
    this._linesContent.setWidth(16777216);
    this._linesContent.setHeight(16777216);
  }
  _getEditorClassName() {
    const focused = this._editContext.isFocused() ? " focused" : "";
    return this._context.configuration.options.get(
      EditorOption.editorClassName
    ) + " " + getThemeTypeSelector(this._context.theme.type) + focused;
  }
  // --- begin event handlers
  handleEvents(events) {
    super.handleEvents(events);
    this._scheduleRender();
  }
  onConfigurationChanged(e) {
    this.domNode.setClassName(this._getEditorClassName());
    this._updateEditContext();
    this._applyLayout();
    return false;
  }
  onCursorStateChanged(e) {
    this._selections = e.selections;
    return false;
  }
  onDecorationsChanged(e) {
    if (e.affectsGlyphMargin) {
      this._shouldRecomputeGlyphMarginLanes = true;
    }
    return false;
  }
  onFocusChanged(e) {
    this.domNode.setClassName(this._getEditorClassName());
    return false;
  }
  onThemeChanged(e) {
    this._context.theme.update(e.theme);
    this.domNode.setClassName(this._getEditorClassName());
    return false;
  }
  // --- end event handlers
  dispose() {
    if (this._renderAnimationFrame !== null) {
      this._renderAnimationFrame.dispose();
      this._renderAnimationFrame = null;
    }
    this._contentWidgets.overflowingContentWidgetsDomNode.domNode.remove();
    this._context.removeEventHandler(this);
    this._viewGpuContext?.dispose();
    this._viewLines.dispose();
    this._viewLinesGpu?.dispose();
    for (const viewPart of this._viewParts) {
      viewPart.dispose();
    }
    super.dispose();
  }
  _scheduleRender() {
    if (this._store.isDisposed) {
      throw new BugIndicatingError();
    }
    if (this._renderAnimationFrame === null) {
      const rendering = this._createCoordinatedRendering();
      this._renderAnimationFrame = EditorRenderingCoordinator.INSTANCE.scheduleCoordinatedRendering(
        {
          window: dom.getWindow(this.domNode?.domNode),
          prepareRenderText: /* @__PURE__ */ __name(() => {
            if (this._store.isDisposed) {
              throw new BugIndicatingError();
            }
            try {
              return rendering.prepareRenderText();
            } finally {
              this._renderAnimationFrame = null;
            }
          }, "prepareRenderText"),
          renderText: /* @__PURE__ */ __name(() => {
            if (this._store.isDisposed) {
              throw new BugIndicatingError();
            }
            return rendering.renderText();
          }, "renderText"),
          prepareRender: /* @__PURE__ */ __name((viewParts, ctx) => {
            if (this._store.isDisposed) {
              throw new BugIndicatingError();
            }
            return rendering.prepareRender(viewParts, ctx);
          }, "prepareRender"),
          render: /* @__PURE__ */ __name((viewParts, ctx) => {
            if (this._store.isDisposed) {
              throw new BugIndicatingError();
            }
            return rendering.render(viewParts, ctx);
          }, "render")
        }
      );
    }
  }
  _flushAccumulatedAndRenderNow() {
    const rendering = this._createCoordinatedRendering();
    safeInvokeNoArg(() => rendering.prepareRenderText());
    const data = safeInvokeNoArg(() => rendering.renderText());
    if (data) {
      const [viewParts, ctx] = data;
      safeInvokeNoArg(() => rendering.prepareRender(viewParts, ctx));
      safeInvokeNoArg(() => rendering.render(viewParts, ctx));
    }
  }
  _getViewPartsToRender() {
    const result = [];
    let resultLen = 0;
    for (const viewPart of this._viewParts) {
      if (viewPart.shouldRender()) {
        result[resultLen++] = viewPart;
      }
    }
    return result;
  }
  _createCoordinatedRendering() {
    return {
      prepareRenderText: /* @__PURE__ */ __name(() => {
        if (this._shouldRecomputeGlyphMarginLanes) {
          this._shouldRecomputeGlyphMarginLanes = false;
          const model = this._computeGlyphMarginLanes();
          this._context.configuration.setGlyphMarginDecorationLaneCount(
            model.requiredLanes
          );
        }
        inputLatency.onRenderStart();
      }, "prepareRenderText"),
      renderText: /* @__PURE__ */ __name(() => {
        if (!this.domNode.domNode.isConnected) {
          return null;
        }
        let viewPartsToRender = this._getViewPartsToRender();
        if (!this._viewLines.shouldRender() && viewPartsToRender.length === 0) {
          return null;
        }
        const partialViewportData = this._context.viewLayout.getLinesViewportData();
        this._context.viewModel.setViewport(
          partialViewportData.startLineNumber,
          partialViewportData.endLineNumber,
          partialViewportData.centeredLineNumber
        );
        const viewportData = new ViewportData(
          this._selections,
          partialViewportData,
          this._context.viewLayout.getWhitespaceViewportData(),
          this._context.viewModel
        );
        if (this._contentWidgets.shouldRender()) {
          this._contentWidgets.onBeforeRender(viewportData);
        }
        if (this._viewLines.shouldRender()) {
          this._viewLines.renderText(viewportData);
          this._viewLines.onDidRender();
          viewPartsToRender = this._getViewPartsToRender();
        }
        if (this._viewLinesGpu?.shouldRender()) {
          this._viewLinesGpu.renderText(viewportData);
          this._viewLinesGpu.onDidRender();
        }
        return [
          viewPartsToRender,
          new RenderingContext(
            this._context.viewLayout,
            viewportData,
            this._viewLines
          )
        ];
      }, "renderText"),
      prepareRender: /* @__PURE__ */ __name((viewPartsToRender, ctx) => {
        for (const viewPart of viewPartsToRender) {
          viewPart.prepareRender(ctx);
        }
      }, "prepareRender"),
      render: /* @__PURE__ */ __name((viewPartsToRender, ctx) => {
        for (const viewPart of viewPartsToRender) {
          viewPart.render(ctx);
          viewPart.onDidRender();
        }
      }, "render")
    };
  }
  // --- BEGIN CodeEditor helpers
  delegateVerticalScrollbarPointerDown(browserEvent) {
    this._scrollbar.delegateVerticalScrollbarPointerDown(browserEvent);
  }
  delegateScrollFromMouseWheelEvent(browserEvent) {
    this._scrollbar.delegateScrollFromMouseWheelEvent(browserEvent);
  }
  restoreState(scrollPosition) {
    this._context.viewModel.viewLayout.setScrollPosition(
      {
        scrollTop: scrollPosition.scrollTop,
        scrollLeft: scrollPosition.scrollLeft
      },
      ScrollType.Immediate
    );
    this._context.viewModel.visibleLinesStabilized();
  }
  getOffsetForColumn(modelLineNumber, modelColumn) {
    const modelPosition = this._context.viewModel.model.validatePosition({
      lineNumber: modelLineNumber,
      column: modelColumn
    });
    const viewPosition = this._context.viewModel.coordinatesConverter.convertModelPositionToViewPosition(
      modelPosition
    );
    this._flushAccumulatedAndRenderNow();
    const visibleRange = this._viewLines.visibleRangeForPosition(
      new Position(viewPosition.lineNumber, viewPosition.column)
    );
    if (!visibleRange) {
      return -1;
    }
    return visibleRange.left;
  }
  getTargetAtClientPoint(clientX, clientY) {
    const mouseTarget = this._pointerHandler.getTargetAtClientPoint(
      clientX,
      clientY
    );
    if (!mouseTarget) {
      return null;
    }
    return ViewUserInputEvents.convertViewToModelMouseTarget(
      mouseTarget,
      this._context.viewModel.coordinatesConverter
    );
  }
  createOverviewRuler(cssClassName) {
    return new OverviewRuler(this._context, cssClassName);
  }
  change(callback) {
    this._viewZones.changeViewZones(callback);
    this._scheduleRender();
  }
  render(now, everything) {
    if (everything) {
      this._viewLines.forceShouldRender();
      for (const viewPart of this._viewParts) {
        viewPart.forceShouldRender();
      }
    }
    if (now) {
      this._flushAccumulatedAndRenderNow();
    } else {
      this._scheduleRender();
    }
  }
  writeScreenReaderContent(reason) {
    this._editContext.writeScreenReaderContent(reason);
  }
  focus() {
    this._editContext.focus();
  }
  isFocused() {
    return this._editContext.isFocused();
  }
  refreshFocusState() {
    this._editContext.refreshFocusState();
  }
  setAriaOptions(options) {
    this._editContext.setAriaOptions(options);
  }
  addContentWidget(widgetData) {
    this._contentWidgets.addWidget(widgetData.widget);
    this.layoutContentWidget(widgetData);
    this._scheduleRender();
  }
  layoutContentWidget(widgetData) {
    this._contentWidgets.setWidgetPosition(
      widgetData.widget,
      widgetData.position?.position ?? null,
      widgetData.position?.secondaryPosition ?? null,
      widgetData.position?.preference ?? null,
      widgetData.position?.positionAffinity ?? null
    );
    this._scheduleRender();
  }
  removeContentWidget(widgetData) {
    this._contentWidgets.removeWidget(widgetData.widget);
    this._scheduleRender();
  }
  addOverlayWidget(widgetData) {
    this._overlayWidgets.addWidget(widgetData.widget);
    this.layoutOverlayWidget(widgetData);
    this._scheduleRender();
  }
  layoutOverlayWidget(widgetData) {
    const shouldRender = this._overlayWidgets.setWidgetPosition(
      widgetData.widget,
      widgetData.position
    );
    if (shouldRender) {
      this._scheduleRender();
    }
  }
  removeOverlayWidget(widgetData) {
    this._overlayWidgets.removeWidget(widgetData.widget);
    this._scheduleRender();
  }
  addGlyphMarginWidget(widgetData) {
    this._glyphMarginWidgets.addWidget(widgetData.widget);
    this._shouldRecomputeGlyphMarginLanes = true;
    this._scheduleRender();
  }
  layoutGlyphMarginWidget(widgetData) {
    const newPreference = widgetData.position;
    const shouldRender = this._glyphMarginWidgets.setWidgetPosition(
      widgetData.widget,
      newPreference
    );
    if (shouldRender) {
      this._shouldRecomputeGlyphMarginLanes = true;
      this._scheduleRender();
    }
  }
  removeGlyphMarginWidget(widgetData) {
    this._glyphMarginWidgets.removeWidget(widgetData.widget);
    this._shouldRecomputeGlyphMarginLanes = true;
    this._scheduleRender();
  }
  // --- END CodeEditor helpers
};
View = __decorateClass([
  __decorateParam(6, IInstantiationService)
], View);
function safeInvokeNoArg(func) {
  try {
    return func();
  } catch (e) {
    onUnexpectedError(e);
    return null;
  }
}
__name(safeInvokeNoArg, "safeInvokeNoArg");
class EditorRenderingCoordinator {
  static {
    __name(this, "EditorRenderingCoordinator");
  }
  static INSTANCE = new EditorRenderingCoordinator();
  _coordinatedRenderings = [];
  _animationFrameRunners = /* @__PURE__ */ new Map();
  constructor() {
  }
  scheduleCoordinatedRendering(rendering) {
    this._coordinatedRenderings.push(rendering);
    this._scheduleRender(rendering.window);
    return {
      dispose: /* @__PURE__ */ __name(() => {
        const renderingIndex = this._coordinatedRenderings.indexOf(rendering);
        if (renderingIndex === -1) {
          return;
        }
        this._coordinatedRenderings.splice(renderingIndex, 1);
        if (this._coordinatedRenderings.length === 0) {
          for (const [_, disposable] of this._animationFrameRunners) {
            disposable.dispose();
          }
          this._animationFrameRunners.clear();
        }
      }, "dispose")
    };
  }
  _scheduleRender(window) {
    if (!this._animationFrameRunners.has(window)) {
      const runner = /* @__PURE__ */ __name(() => {
        this._animationFrameRunners.delete(window);
        this._onRenderScheduled();
      }, "runner");
      this._animationFrameRunners.set(
        window,
        dom.runAtThisOrScheduleAtNextAnimationFrame(
          window,
          runner,
          100
        )
      );
    }
  }
  _onRenderScheduled() {
    const coordinatedRenderings = this._coordinatedRenderings.slice(0);
    this._coordinatedRenderings = [];
    for (const rendering of coordinatedRenderings) {
      safeInvokeNoArg(() => rendering.prepareRenderText());
    }
    const datas = [];
    for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
      const rendering = coordinatedRenderings[i];
      datas[i] = safeInvokeNoArg(() => rendering.renderText());
    }
    for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
      const rendering = coordinatedRenderings[i];
      const data = datas[i];
      if (!data) {
        continue;
      }
      const [viewParts, ctx] = data;
      safeInvokeNoArg(() => rendering.prepareRender(viewParts, ctx));
    }
    for (let i = 0, len = coordinatedRenderings.length; i < len; i++) {
      const rendering = coordinatedRenderings[i];
      const data = datas[i];
      if (!data) {
        continue;
      }
      const [viewParts, ctx] = data;
      safeInvokeNoArg(() => rendering.render(viewParts, ctx));
    }
  }
}
export {
  View
};
//# sourceMappingURL=view.js.map
