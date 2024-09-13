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
import {
  $,
  addDisposableListener,
  getWindow,
  h,
  reset
} from "../../../../../base/browser/dom.js";
import {
  renderIcon,
  renderLabelWithIcons
} from "../../../../../base/browser/ui/iconLabel/iconLabels.js";
import { Codicon } from "../../../../../base/common/codicons.js";
import { MarkdownString } from "../../../../../base/common/htmlContent.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  derived,
  derivedDisposable,
  derivedWithStore,
  observableValue,
  transaction
} from "../../../../../base/common/observable.js";
import { ThemeIcon } from "../../../../../base/common/themables.js";
import { isDefined } from "../../../../../base/common/types.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { LineRange } from "../../../../common/core/lineRange.js";
import { Position } from "../../../../common/core/position.js";
import { Range } from "../../../../common/core/range.js";
import { CursorChangeReason } from "../../../../common/cursorEvents.js";
import { SymbolKinds } from "../../../../common/languages.js";
import { observableCodeEditor } from "../../../observableCodeEditor.js";
import {
  RevealPreference
} from "../diffEditorViewModel.js";
import {
  PlaceholderViewZone,
  ViewZoneOverlayWidget,
  applyObservableDecorations,
  applyStyle
} from "../utils.js";
let HideUnchangedRegionsFeature = class extends Disposable {
  constructor(_editors, _diffModel, _options, _instantiationService) {
    super();
    this._editors = _editors;
    this._diffModel = _diffModel;
    this._options = _options;
    this._instantiationService = _instantiationService;
    this._register(this._editors.original.onDidChangeCursorPosition((e) => {
      if (e.reason === CursorChangeReason.ContentFlush) {
        return;
      }
      const m = this._diffModel.get();
      transaction((tx) => {
        for (const s of this._editors.original.getSelections() || []) {
          m?.ensureOriginalLineIsVisible(s.getStartPosition().lineNumber, RevealPreference.FromCloserSide, tx);
          m?.ensureOriginalLineIsVisible(s.getEndPosition().lineNumber, RevealPreference.FromCloserSide, tx);
        }
      });
    }));
    this._register(this._editors.modified.onDidChangeCursorPosition((e) => {
      if (e.reason === CursorChangeReason.ContentFlush) {
        return;
      }
      const m = this._diffModel.get();
      transaction((tx) => {
        for (const s of this._editors.modified.getSelections() || []) {
          m?.ensureModifiedLineIsVisible(s.getStartPosition().lineNumber, RevealPreference.FromCloserSide, tx);
          m?.ensureModifiedLineIsVisible(s.getEndPosition().lineNumber, RevealPreference.FromCloserSide, tx);
        }
      });
    }));
    const unchangedRegions = this._diffModel.map((m, reader) => {
      const regions = m?.unchangedRegions.read(reader) ?? [];
      if (regions.length === 1 && regions[0].modifiedLineNumber === 1 && regions[0].lineCount === this._editors.modifiedModel.read(reader)?.getLineCount()) {
        return [];
      }
      return regions;
    });
    this.viewZones = derivedWithStore(this, (reader, store) => {
      const modifiedOutlineSource = this._modifiedOutlineSource.read(reader);
      if (!modifiedOutlineSource) {
        return { origViewZones: [], modViewZones: [] };
      }
      const origViewZones = [];
      const modViewZones = [];
      const sideBySide = this._options.renderSideBySide.read(reader);
      const compactMode = this._options.compactMode.read(reader);
      const curUnchangedRegions = unchangedRegions.read(reader);
      for (let i = 0; i < curUnchangedRegions.length; i++) {
        const r = curUnchangedRegions[i];
        if (r.shouldHideControls(reader)) {
          continue;
        }
        if (compactMode && (i === 0 || i === curUnchangedRegions.length - 1)) {
          continue;
        }
        if (compactMode) {
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenOriginalRangeStart */
              r.getHiddenOriginalRange(reader2).startLineNumber - 1
            ));
            const origVz = new PlaceholderViewZone(d, 12);
            origViewZones.push(origVz);
            store.add(new CompactCollapsedCodeOverlayWidget(
              this._editors.original,
              origVz,
              r,
              !sideBySide
            ));
          }
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenModifiedRangeStart */
              r.getHiddenModifiedRange(reader2).startLineNumber - 1
            ));
            const modViewZone = new PlaceholderViewZone(d, 12);
            modViewZones.push(modViewZone);
            store.add(new CompactCollapsedCodeOverlayWidget(
              this._editors.modified,
              modViewZone,
              r
            ));
          }
        } else {
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenOriginalRangeStart */
              r.getHiddenOriginalRange(reader2).startLineNumber - 1
            ));
            const origVz = new PlaceholderViewZone(d, 24);
            origViewZones.push(origVz);
            store.add(new CollapsedCodeOverlayWidget(
              this._editors.original,
              origVz,
              r,
              r.originalUnchangedRange,
              !sideBySide,
              modifiedOutlineSource,
              (l) => this._diffModel.get().ensureModifiedLineIsVisible(l, RevealPreference.FromBottom, void 0),
              this._options
            ));
          }
          {
            const d = derived(this, (reader2) => (
              /** @description hiddenModifiedRangeStart */
              r.getHiddenModifiedRange(reader2).startLineNumber - 1
            ));
            const modViewZone = new PlaceholderViewZone(d, 24);
            modViewZones.push(modViewZone);
            store.add(new CollapsedCodeOverlayWidget(
              this._editors.modified,
              modViewZone,
              r,
              r.modifiedUnchangedRange,
              false,
              modifiedOutlineSource,
              (l) => this._diffModel.get().ensureModifiedLineIsVisible(l, RevealPreference.FromBottom, void 0),
              this._options
            ));
          }
        }
      }
      return { origViewZones, modViewZones };
    });
    const unchangedLinesDecoration = {
      description: "unchanged lines",
      className: "diff-unchanged-lines",
      isWholeLine: true
    };
    const unchangedLinesDecorationShow = {
      description: "Fold Unchanged",
      glyphMarginHoverMessage: new MarkdownString(void 0, { isTrusted: true, supportThemeIcons: true }).appendMarkdown(localize("foldUnchanged", "Fold Unchanged Region")),
      glyphMarginClassName: "fold-unchanged " + ThemeIcon.asClassName(Codicon.fold),
      zIndex: 10001
    };
    this._register(applyObservableDecorations(this._editors.original, derived(this, (reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      const result = curUnchangedRegions.map((r) => ({
        range: r.originalUnchangedRange.toInclusiveRange(),
        options: unchangedLinesDecoration
      }));
      for (const r of curUnchangedRegions) {
        if (r.shouldHideControls(reader)) {
          result.push({
            range: Range.fromPositions(new Position(r.originalLineNumber, 1)),
            options: unchangedLinesDecorationShow
          });
        }
      }
      return result;
    })));
    this._register(applyObservableDecorations(this._editors.modified, derived(this, (reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      const result = curUnchangedRegions.map((r) => ({
        range: r.modifiedUnchangedRange.toInclusiveRange(),
        options: unchangedLinesDecoration
      }));
      for (const r of curUnchangedRegions) {
        if (r.shouldHideControls(reader)) {
          result.push({
            range: LineRange.ofLength(r.modifiedLineNumber, 1).toInclusiveRange(),
            options: unchangedLinesDecorationShow
          });
        }
      }
      return result;
    })));
    this._register(autorun((reader) => {
      const curUnchangedRegions = unchangedRegions.read(reader);
      this._isUpdatingHiddenAreas = true;
      try {
        this._editors.original.setHiddenAreas(curUnchangedRegions.map((r) => r.getHiddenOriginalRange(reader).toInclusiveRange()).filter(isDefined));
        this._editors.modified.setHiddenAreas(curUnchangedRegions.map((r) => r.getHiddenModifiedRange(reader).toInclusiveRange()).filter(isDefined));
      } finally {
        this._isUpdatingHiddenAreas = false;
      }
    }));
    this._register(this._editors.modified.onMouseUp((event) => {
      if (!event.event.rightButton && event.target.position && event.target.element?.className.includes("fold-unchanged")) {
        const lineNumber = event.target.position.lineNumber;
        const model = this._diffModel.get();
        if (!model) {
          return;
        }
        const region = model.unchangedRegions.get().find((r) => r.modifiedUnchangedRange.includes(lineNumber));
        if (!region) {
          return;
        }
        region.collapseAll(void 0);
        event.event.stopPropagation();
        event.event.preventDefault();
      }
    }));
    this._register(this._editors.original.onMouseUp((event) => {
      if (!event.event.rightButton && event.target.position && event.target.element?.className.includes("fold-unchanged")) {
        const lineNumber = event.target.position.lineNumber;
        const model = this._diffModel.get();
        if (!model) {
          return;
        }
        const region = model.unchangedRegions.get().find((r) => r.originalUnchangedRange.includes(lineNumber));
        if (!region) {
          return;
        }
        region.collapseAll(void 0);
        event.event.stopPropagation();
        event.event.preventDefault();
      }
    }));
  }
  static {
    __name(this, "HideUnchangedRegionsFeature");
  }
  static _breadcrumbsSourceFactory = observableValue(HideUnchangedRegionsFeature, () => ({
    dispose() {
    },
    getBreadcrumbItems(startRange, reader) {
      return [];
    }
  }));
  static setBreadcrumbsSourceFactory(factory) {
    this._breadcrumbsSourceFactory.set(factory, void 0);
  }
  _modifiedOutlineSource = derivedDisposable(
    this,
    (reader) => {
      const m = this._editors.modifiedModel.read(reader);
      const factory = HideUnchangedRegionsFeature._breadcrumbsSourceFactory.read(
        reader
      );
      return !m || !factory ? void 0 : factory(m, this._instantiationService);
    }
  );
  viewZones;
  _isUpdatingHiddenAreas = false;
  get isUpdatingHiddenAreas() {
    return this._isUpdatingHiddenAreas;
  }
};
HideUnchangedRegionsFeature = __decorateClass([
  __decorateParam(3, IInstantiationService)
], HideUnchangedRegionsFeature);
class CompactCollapsedCodeOverlayWidget extends ViewZoneOverlayWidget {
  constructor(editor, _viewZone, _unchangedRegion, _hide = false) {
    const root = h("div.diff-hidden-lines-widget");
    super(editor, _viewZone, root.root);
    this._unchangedRegion = _unchangedRegion;
    this._hide = _hide;
    root.root.appendChild(this._nodes.root);
    if (this._hide) {
      this._nodes.root.replaceChildren();
    }
    this._register(
      autorun((reader) => {
        if (!this._hide) {
          const lineCount = this._unchangedRegion.getHiddenModifiedRange(
            reader
          ).length;
          const linesHiddenText = localize(
            "hiddenLines",
            "{0} hidden lines",
            lineCount
          );
          this._nodes.text.innerText = linesHiddenText;
        }
      })
    );
  }
  static {
    __name(this, "CompactCollapsedCodeOverlayWidget");
  }
  _nodes = h("div.diff-hidden-lines-compact", [
    h("div.line-left", []),
    h("div.text@text", []),
    h("div.line-right", [])
  ]);
}
class CollapsedCodeOverlayWidget extends ViewZoneOverlayWidget {
  constructor(_editor, _viewZone, _unchangedRegion, _unchangedRegionRange, _hide, _modifiedOutlineSource, _revealModifiedHiddenLine, _options) {
    const root = h("div.diff-hidden-lines-widget");
    super(_editor, _viewZone, root.root);
    this._editor = _editor;
    this._unchangedRegion = _unchangedRegion;
    this._unchangedRegionRange = _unchangedRegionRange;
    this._hide = _hide;
    this._modifiedOutlineSource = _modifiedOutlineSource;
    this._revealModifiedHiddenLine = _revealModifiedHiddenLine;
    this._options = _options;
    root.root.appendChild(this._nodes.root);
    if (this._hide) {
      reset(this._nodes.first);
    } else {
      this._register(
        applyStyle(this._nodes.first, {
          width: observableCodeEditor(this._editor).layoutInfoContentLeft
        })
      );
    }
    this._register(
      autorun((reader) => {
        const isFullyRevealed = this._unchangedRegion.visibleLineCountTop.read(reader) + this._unchangedRegion.visibleLineCountBottom.read(
          reader
        ) === this._unchangedRegion.lineCount;
        this._nodes.bottom.classList.toggle(
          "canMoveTop",
          !isFullyRevealed
        );
        this._nodes.bottom.classList.toggle(
          "canMoveBottom",
          this._unchangedRegion.visibleLineCountBottom.read(reader) > 0
        );
        this._nodes.top.classList.toggle(
          "canMoveTop",
          this._unchangedRegion.visibleLineCountTop.read(reader) > 0
        );
        this._nodes.top.classList.toggle(
          "canMoveBottom",
          !isFullyRevealed
        );
        const isDragged = this._unchangedRegion.isDragged.read(reader);
        const domNode = this._editor.getDomNode();
        if (domNode) {
          domNode.classList.toggle(
            "draggingUnchangedRegion",
            !!isDragged
          );
          if (isDragged === "top") {
            domNode.classList.toggle(
              "canMoveTop",
              this._unchangedRegion.visibleLineCountTop.read(
                reader
              ) > 0
            );
            domNode.classList.toggle(
              "canMoveBottom",
              !isFullyRevealed
            );
          } else if (isDragged === "bottom") {
            domNode.classList.toggle(
              "canMoveTop",
              !isFullyRevealed
            );
            domNode.classList.toggle(
              "canMoveBottom",
              this._unchangedRegion.visibleLineCountBottom.read(
                reader
              ) > 0
            );
          } else {
            domNode.classList.toggle("canMoveTop", false);
            domNode.classList.toggle("canMoveBottom", false);
          }
        }
      })
    );
    const editor = this._editor;
    this._register(
      addDisposableListener(this._nodes.top, "mousedown", (e) => {
        if (e.button !== 0) {
          return;
        }
        this._nodes.top.classList.toggle("dragging", true);
        this._nodes.root.classList.toggle("dragging", true);
        e.preventDefault();
        const startTop = e.clientY;
        let didMove = false;
        const cur = this._unchangedRegion.visibleLineCountTop.get();
        this._unchangedRegion.isDragged.set("top", void 0);
        const window = getWindow(this._nodes.top);
        const mouseMoveListener = addDisposableListener(
          window,
          "mousemove",
          (e2) => {
            const currentTop = e2.clientY;
            const delta = currentTop - startTop;
            didMove = didMove || Math.abs(delta) > 2;
            const lineDelta = Math.round(
              delta / editor.getOption(EditorOption.lineHeight)
            );
            const newVal = Math.max(
              0,
              Math.min(
                cur + lineDelta,
                this._unchangedRegion.getMaxVisibleLineCountTop()
              )
            );
            this._unchangedRegion.visibleLineCountTop.set(
              newVal,
              void 0
            );
          }
        );
        const mouseUpListener = addDisposableListener(
          window,
          "mouseup",
          (e2) => {
            if (!didMove) {
              this._unchangedRegion.showMoreAbove(
                this._options.hideUnchangedRegionsRevealLineCount.get(),
                void 0
              );
            }
            this._nodes.top.classList.toggle("dragging", false);
            this._nodes.root.classList.toggle("dragging", false);
            this._unchangedRegion.isDragged.set(
              void 0,
              void 0
            );
            mouseMoveListener.dispose();
            mouseUpListener.dispose();
          }
        );
      })
    );
    this._register(
      addDisposableListener(this._nodes.bottom, "mousedown", (e) => {
        if (e.button !== 0) {
          return;
        }
        this._nodes.bottom.classList.toggle("dragging", true);
        this._nodes.root.classList.toggle("dragging", true);
        e.preventDefault();
        const startTop = e.clientY;
        let didMove = false;
        const cur = this._unchangedRegion.visibleLineCountBottom.get();
        this._unchangedRegion.isDragged.set("bottom", void 0);
        const window = getWindow(this._nodes.bottom);
        const mouseMoveListener = addDisposableListener(
          window,
          "mousemove",
          (e2) => {
            const currentTop = e2.clientY;
            const delta = currentTop - startTop;
            didMove = didMove || Math.abs(delta) > 2;
            const lineDelta = Math.round(
              delta / editor.getOption(EditorOption.lineHeight)
            );
            const newVal = Math.max(
              0,
              Math.min(
                cur - lineDelta,
                this._unchangedRegion.getMaxVisibleLineCountBottom()
              )
            );
            const top = this._unchangedRegionRange.endLineNumberExclusive > editor.getModel().getLineCount() ? editor.getContentHeight() : editor.getTopForLineNumber(
              this._unchangedRegionRange.endLineNumberExclusive
            );
            this._unchangedRegion.visibleLineCountBottom.set(
              newVal,
              void 0
            );
            const top2 = this._unchangedRegionRange.endLineNumberExclusive > editor.getModel().getLineCount() ? editor.getContentHeight() : editor.getTopForLineNumber(
              this._unchangedRegionRange.endLineNumberExclusive
            );
            editor.setScrollTop(
              editor.getScrollTop() + (top2 - top)
            );
          }
        );
        const mouseUpListener = addDisposableListener(
          window,
          "mouseup",
          (e2) => {
            this._unchangedRegion.isDragged.set(
              void 0,
              void 0
            );
            if (!didMove) {
              const top = editor.getTopForLineNumber(
                this._unchangedRegionRange.endLineNumberExclusive
              );
              this._unchangedRegion.showMoreBelow(
                this._options.hideUnchangedRegionsRevealLineCount.get(),
                void 0
              );
              const top2 = editor.getTopForLineNumber(
                this._unchangedRegionRange.endLineNumberExclusive
              );
              editor.setScrollTop(
                editor.getScrollTop() + (top2 - top)
              );
            }
            this._nodes.bottom.classList.toggle("dragging", false);
            this._nodes.root.classList.toggle("dragging", false);
            mouseMoveListener.dispose();
            mouseUpListener.dispose();
          }
        );
      })
    );
    this._register(
      autorun((reader) => {
        const children = [];
        if (!this._hide) {
          const lineCount = _unchangedRegion.getHiddenModifiedRange(reader).length;
          const linesHiddenText = localize(
            "hiddenLines",
            "{0} hidden lines",
            lineCount
          );
          const span = $(
            "span",
            {
              title: localize(
                "diff.hiddenLines.expandAll",
                "Double click to unfold"
              )
            },
            linesHiddenText
          );
          span.addEventListener("dblclick", (e) => {
            if (e.button !== 0) {
              return;
            }
            e.preventDefault();
            this._unchangedRegion.showAll(void 0);
          });
          children.push(span);
          const range = this._unchangedRegion.getHiddenModifiedRange(reader);
          const items = this._modifiedOutlineSource.getBreadcrumbItems(
            range,
            reader
          );
          if (items.length > 0) {
            children.push(
              $("span", void 0, "\xA0\xA0|\xA0\xA0")
            );
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const icon = SymbolKinds.toIcon(item.kind);
              const divItem = h(
                "div.breadcrumb-item",
                {
                  style: {
                    display: "flex",
                    alignItems: "center"
                  }
                },
                [
                  renderIcon(icon),
                  "\xA0",
                  item.name,
                  ...i === items.length - 1 ? [] : [renderIcon(Codicon.chevronRight)]
                ]
              ).root;
              children.push(divItem);
              divItem.onclick = () => {
                this._revealModifiedHiddenLine(
                  item.startLineNumber
                );
              };
            }
          }
        }
        reset(this._nodes.others, ...children);
      })
    );
  }
  static {
    __name(this, "CollapsedCodeOverlayWidget");
  }
  _nodes = h("div.diff-hidden-lines", [
    h("div.top@top", {
      title: localize(
        "diff.hiddenLines.top",
        "Click or drag to show more above"
      )
    }),
    h("div.center@content", { style: { display: "flex" } }, [
      h(
        "div@first",
        {
          style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexShrink: "0"
          }
        },
        [
          $(
            "a",
            {
              title: localize(
                "showUnchangedRegion",
                "Show Unchanged Region"
              ),
              role: "button",
              onclick: /* @__PURE__ */ __name(() => {
                this._unchangedRegion.showAll(void 0);
              }, "onclick")
            },
            ...renderLabelWithIcons("$(unfold)")
          )
        ]
      ),
      h("div@others", {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }
      })
    ]),
    h("div.bottom@bottom", {
      title: localize("diff.bottom", "Click or drag to show more below"),
      role: "button"
    })
  ]);
}
export {
  HideUnchangedRegionsFeature
};
//# sourceMappingURL=hideUnchangedRegionsFeature.js.map
