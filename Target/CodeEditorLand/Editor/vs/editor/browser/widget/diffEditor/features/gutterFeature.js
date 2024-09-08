var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
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
  EventType,
  addDisposableListener,
  h
} from "../../../../../base/browser/dom.js";
import { ActionsOrientation } from "../../../../../base/browser/ui/actionbar/actionbar.js";
import { HoverPosition } from "../../../../../base/browser/ui/hover/hoverWidget.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  observableFromEvent,
  observableValue
} from "../../../../../base/common/observable.js";
import {
  derivedDisposable,
  derivedWithSetter
} from "../../../../../base/common/observableInternal/derived.js";
import {
  HiddenItemStrategy,
  MenuWorkbenchToolBar
} from "../../../../../platform/actions/browser/toolbar.js";
import {
  IMenuService,
  MenuId
} from "../../../../../platform/actions/common/actions.js";
import { IContextKeyService } from "../../../../../platform/contextkey/common/contextkey.js";
import { WorkbenchHoverDelegate } from "../../../../../platform/hover/browser/hover.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { EditorOption } from "../../../../common/config/editorOptions.js";
import { LineRange, LineRangeSet } from "../../../../common/core/lineRange.js";
import { OffsetRange } from "../../../../common/core/offsetRange.js";
import { Range } from "../../../../common/core/range.js";
import { TextEdit } from "../../../../common/core/textEdit.js";
import { DetailedLineRangeMapping } from "../../../../common/diff/rangeMapping.js";
import { TextModelText } from "../../../../common/model/textModelText.js";
import { ActionRunnerWithContext } from "../../multiDiffEditor/utils.js";
import {
  DiffEditorSash
} from "../components/diffEditorSash.js";
import {
  appendRemoveOnDispose,
  applyStyle,
  prependRemoveOnDispose
} from "../utils.js";
import {
  EditorGutter
} from "../utils/editorGutter.js";
const emptyArr = [];
const width = 35;
let DiffEditorGutter = class extends Disposable {
  constructor(diffEditorRoot, _diffModel, _editors, _options, _sashLayout, _boundarySashes, _instantiationService, _contextKeyService, _menuService) {
    super();
    this._diffModel = _diffModel;
    this._editors = _editors;
    this._options = _options;
    this._sashLayout = _sashLayout;
    this._boundarySashes = _boundarySashes;
    this._instantiationService = _instantiationService;
    this._contextKeyService = _contextKeyService;
    this._menuService = _menuService;
    this._register(prependRemoveOnDispose(diffEditorRoot, this.elements.root));
    this._register(addDisposableListener(this.elements.root, "click", () => {
      this._editors.modified.focus();
    }));
    this._register(applyStyle(this.elements.root, { display: this._hasActions.map((a) => a ? "block" : "none") }));
    derivedDisposable(this, (reader) => {
      const showSash = this._showSash.read(reader);
      return showSash ? new DiffEditorSash(
        diffEditorRoot,
        this._sashLayout.dimensions,
        this._options.enableSplitViewResizing,
        this._boundarySashes,
        derivedWithSetter(
          this,
          (reader2) => this._sashLayout.sashLeft.read(reader2) - width,
          (v, tx) => this._sashLayout.sashLeft.set(v + width, tx)
        ),
        () => this._sashLayout.resetSash()
      ) : void 0;
    }).recomputeInitiallyAndOnChange(this._store);
    const gutterItems = derived(this, (reader) => {
      const model = this._diffModel.read(reader);
      if (!model) {
        return [];
      }
      const diffs = model.diff.read(reader);
      if (!diffs) {
        return [];
      }
      const selection = this._selectedDiffs.read(reader);
      if (selection.length > 0) {
        const m = DetailedLineRangeMapping.fromRangeMappings(selection.flatMap((s) => s.rangeMappings));
        return [
          new DiffGutterItem(
            m,
            true,
            MenuId.DiffEditorSelectionToolbar,
            void 0,
            model.model.original.uri,
            model.model.modified.uri
          )
        ];
      }
      const currentDiff = this._currentDiff.read(reader);
      return diffs.mappings.map((m) => new DiffGutterItem(
        m.lineRangeMapping.withInnerChangesFromLineRanges(),
        m.lineRangeMapping === currentDiff?.lineRangeMapping,
        MenuId.DiffEditorHunkToolbar,
        void 0,
        model.model.original.uri,
        model.model.modified.uri
      ));
    });
    this._register(new EditorGutter(this._editors.modified, this.elements.root, {
      getIntersectingGutterItems: (range, reader) => gutterItems.read(reader),
      createView: (item, target) => {
        return this._instantiationService.createInstance(DiffToolBar, item, target, this);
      }
    }));
    this._register(addDisposableListener(this.elements.gutter, EventType.MOUSE_WHEEL, (e) => {
      if (this._editors.modified.getOption(EditorOption.scrollbar).handleMouseWheel) {
        this._editors.modified.delegateScrollFromMouseWheelEvent(e);
      }
    }, { passive: false }));
  }
  _menu = this._register(
    this._menuService.createMenu(
      MenuId.DiffEditorHunkToolbar,
      this._contextKeyService
    )
  );
  _actions = observableFromEvent(
    this,
    this._menu.onDidChange,
    () => this._menu.getActions()
  );
  _hasActions = this._actions.map((a) => a.length > 0);
  _showSash = derived(
    this,
    (reader) => this._options.renderSideBySide.read(reader) && this._hasActions.read(reader)
  );
  width = derived(
    this,
    (reader) => this._hasActions.read(reader) ? width : 0
  );
  elements = h(
    "div.gutter@gutter",
    {
      style: {
        position: "absolute",
        height: "100%",
        width: width + "px"
      }
    },
    []
  );
  computeStagedValue(mapping) {
    const c = mapping.innerChanges ?? [];
    const modified = new TextModelText(this._editors.modifiedModel.get());
    const original = new TextModelText(this._editors.original.getModel());
    const edit = new TextEdit(c.map((c2) => c2.toTextEdit(modified)));
    const value = edit.apply(original);
    return value;
  }
  _currentDiff = derived(this, (reader) => {
    const model = this._diffModel.read(reader);
    if (!model) {
      return void 0;
    }
    const mappings = model.diff.read(reader)?.mappings;
    const cursorPosition = this._editors.modifiedCursor.read(reader);
    if (!cursorPosition) {
      return void 0;
    }
    return mappings?.find(
      (m) => m.lineRangeMapping.modified.contains(cursorPosition.lineNumber)
    );
  });
  _selectedDiffs = derived(this, (reader) => {
    const model = this._diffModel.read(reader);
    const diff = model?.diff.read(reader);
    if (!diff) {
      return emptyArr;
    }
    const selections = this._editors.modifiedSelections.read(reader);
    if (selections.every((s) => s.isEmpty())) {
      return emptyArr;
    }
    const selectedLineNumbers = new LineRangeSet(
      selections.map((s) => LineRange.fromRangeInclusive(s))
    );
    const selectedMappings = diff.mappings.filter(
      (m) => m.lineRangeMapping.innerChanges && selectedLineNumbers.intersects(m.lineRangeMapping.modified)
    );
    const result = selectedMappings.map((mapping) => ({
      mapping,
      rangeMappings: mapping.lineRangeMapping.innerChanges.filter(
        (c) => selections.some(
          (s) => Range.areIntersecting(c.modifiedRange, s)
        )
      )
    }));
    if (result.length === 0 || result.every((r) => r.rangeMappings.length === 0)) {
      return emptyArr;
    }
    return result;
  });
  layout(left) {
    this.elements.gutter.style.left = left + "px";
  }
};
DiffEditorGutter = __decorateClass([
  __decorateParam(6, IInstantiationService),
  __decorateParam(7, IContextKeyService),
  __decorateParam(8, IMenuService)
], DiffEditorGutter);
class DiffGutterItem {
  constructor(mapping, showAlways, menuId, rangeOverride, originalUri, modifiedUri) {
    this.mapping = mapping;
    this.showAlways = showAlways;
    this.menuId = menuId;
    this.rangeOverride = rangeOverride;
    this.originalUri = originalUri;
    this.modifiedUri = modifiedUri;
  }
  get id() {
    return this.mapping.modified.toString();
  }
  get range() {
    return this.rangeOverride ?? this.mapping.modified;
  }
}
let DiffToolBar = class extends Disposable {
  constructor(_item, target, gutter, instantiationService) {
    super();
    this._item = _item;
    const hoverDelegate = this._register(
      instantiationService.createInstance(
        WorkbenchHoverDelegate,
        "element",
        true,
        { position: { hoverPosition: HoverPosition.RIGHT } }
      )
    );
    this._register(appendRemoveOnDispose(target, this._elements.root));
    this._register(
      autorun((reader) => {
        const showAlways = this._showAlways.read(reader);
        this._elements.root.classList.toggle("noTransition", true);
        this._elements.root.classList.toggle("showAlways", showAlways);
        setTimeout(() => {
          this._elements.root.classList.toggle("noTransition", false);
        }, 0);
      })
    );
    this._register(
      autorunWithStore((reader, store) => {
        this._elements.buttons.replaceChildren();
        const i = store.add(
          instantiationService.createInstance(
            MenuWorkbenchToolBar,
            this._elements.buttons,
            this._menuId.read(reader),
            {
              orientation: ActionsOrientation.VERTICAL,
              hoverDelegate,
              toolbarOptions: {
                primaryGroup: (g) => g.startsWith("primary")
              },
              overflowBehavior: {
                maxItems: this._isSmall.read(reader) ? 1 : 3
              },
              hiddenItemStrategy: HiddenItemStrategy.Ignore,
              actionRunner: new ActionRunnerWithContext(() => {
                const item = this._item.get();
                const mapping = item.mapping;
                return {
                  mapping,
                  originalWithModifiedChanges: gutter.computeStagedValue(mapping),
                  originalUri: item.originalUri,
                  modifiedUri: item.modifiedUri
                };
              }),
              menuOptions: {
                shouldForwardArgs: true
              }
            }
          )
        );
        store.add(
          i.onDidChangeMenuItems(() => {
            if (this._lastItemRange) {
              this.layout(
                this._lastItemRange,
                this._lastViewRange
              );
            }
          })
        );
      })
    );
  }
  _elements = h(
    "div.gutterItem",
    { style: { height: "20px", width: "34px" } },
    [
      h("div.background@background", {}, []),
      h("div.buttons@buttons", {}, [])
    ]
  );
  _showAlways = this._item.map(
    this,
    (item) => item.showAlways
  );
  _menuId = this._item.map(this, (item) => item.menuId);
  _isSmall = observableValue(this, false);
  _lastItemRange = void 0;
  _lastViewRange = void 0;
  layout(itemRange, viewRange) {
    this._lastItemRange = itemRange;
    this._lastViewRange = viewRange;
    let itemHeight = this._elements.buttons.clientHeight;
    this._isSmall.set(
      this._item.get().mapping.original.startLineNumber === 1 && itemRange.length < 30,
      void 0
    );
    itemHeight = this._elements.buttons.clientHeight;
    const middleHeight = itemRange.length / 2 - itemHeight / 2;
    const margin = itemHeight;
    let effectiveCheckboxTop = itemRange.start + middleHeight;
    const preferredViewPortRange = OffsetRange.tryCreate(
      margin,
      viewRange.endExclusive - margin - itemHeight
    );
    const preferredParentRange = OffsetRange.tryCreate(
      itemRange.start + margin,
      itemRange.endExclusive - itemHeight - margin
    );
    if (preferredParentRange && preferredViewPortRange && preferredParentRange.start < preferredParentRange.endExclusive) {
      effectiveCheckboxTop = preferredViewPortRange.clip(effectiveCheckboxTop);
      effectiveCheckboxTop = preferredParentRange.clip(effectiveCheckboxTop);
    }
    this._elements.buttons.style.top = `${effectiveCheckboxTop - itemRange.start}px`;
  }
};
DiffToolBar = __decorateClass([
  __decorateParam(3, IInstantiationService)
], DiffToolBar);
export {
  DiffEditorGutter
};
