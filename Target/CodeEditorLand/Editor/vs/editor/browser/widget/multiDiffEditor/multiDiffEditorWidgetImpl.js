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
  getWindow,
  h,
  scheduleAtNextAnimationFrame
} from "../../../../base/browser/dom.js";
import { SmoothScrollableElement } from "../../../../base/browser/ui/scrollbar/scrollableElement.js";
import { compareBy, numberComparator } from "../../../../base/common/arrays.js";
import { findFirstMax } from "../../../../base/common/arraysFind.js";
import { BugIndicatingError } from "../../../../base/common/errors.js";
import {
  Disposable,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  derivedWithStore,
  disposableObservableValue,
  globalTransaction,
  observableFromEvent,
  observableValue,
  transaction
} from "../../../../base/common/observable.js";
import {
  Scrollable,
  ScrollbarVisibility
} from "../../../../base/common/scrollable.js";
import { localize } from "../../../../nls.js";
import {
  IContextKeyService
} from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "../../../../platform/instantiation/common/serviceCollection.js";
import { OffsetRange } from "../../../common/core/offsetRange.js";
import { Selection } from "../../../common/core/selection.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { ObservableElementSizeObserver } from "../diffEditor/utils.js";
import {
  DiffEditorItemTemplate,
  TemplateData
} from "./diffEditorItemTemplate.js";
import { ObjectPool } from "./objectPool.js";
import "./style.css";
let MultiDiffEditorWidgetImpl = class extends Disposable {
  constructor(_element, _dimension, _viewModel, _workbenchUIElementFactory, _parentContextKeyService, _parentInstantiationService) {
    super();
    this._element = _element;
    this._dimension = _dimension;
    this._viewModel = _viewModel;
    this._workbenchUIElementFactory = _workbenchUIElementFactory;
    this._parentContextKeyService = _parentContextKeyService;
    this._parentInstantiationService = _parentInstantiationService;
    this._register(autorunWithStore((reader, store) => {
      const viewModel = this._viewModel.read(reader);
      if (viewModel && viewModel.contextKeys) {
        for (const [key, value] of Object.entries(viewModel.contextKeys)) {
          const contextKey = this._contextKeyService.createKey(key, void 0);
          contextKey.set(value);
          store.add(toDisposable(() => contextKey.reset()));
        }
      }
    }));
    const ctxAllCollapsed = this._parentContextKeyService.createKey(EditorContextKeys.multiDiffEditorAllCollapsed.key, false);
    this._register(autorun((reader) => {
      const viewModel = this._viewModel.read(reader);
      if (viewModel) {
        const allCollapsed = viewModel.items.read(reader).every((item) => item.collapsed.read(reader));
        ctxAllCollapsed.set(allCollapsed);
      }
    }));
    this._register(autorun((reader) => {
      const dimension = this._dimension.read(reader);
      this._sizeObserver.observe(dimension);
    }));
    const placeholderMessage = derived((reader) => {
      const items = this._viewItems.read(reader);
      if (items.length > 0) {
        return void 0;
      }
      const vm = this._viewModel.read(reader);
      return !vm || vm.isLoading.read(reader) ? localize("loading", "Loading...") : localize("noChangedFiles", "No Changed Files");
    });
    this._register(autorun((reader) => {
      const message = placeholderMessage.read(reader);
      this._elements.placeholder.innerText = message ?? "";
      this._elements.placeholder.classList.toggle("visible", !!message);
    }));
    this._scrollableElements.content.style.position = "relative";
    this._register(autorun((reader) => {
      const height = this._sizeObserver.height.read(reader);
      this._scrollableElements.root.style.height = `${height}px`;
      const totalHeight = this._totalHeight.read(reader);
      this._scrollableElements.content.style.height = `${totalHeight}px`;
      const width = this._sizeObserver.width.read(reader);
      let scrollWidth = width;
      const viewItems = this._viewItems.read(reader);
      const max = findFirstMax(viewItems, compareBy((i) => i.maxScroll.read(reader).maxScroll, numberComparator));
      if (max) {
        const maxScroll = max.maxScroll.read(reader);
        scrollWidth = width + maxScroll.maxScroll;
      }
      this._scrollableElement.setScrollDimensions({
        width,
        height,
        scrollHeight: totalHeight,
        scrollWidth
      });
    }));
    _element.replaceChildren(this._elements.root);
    this._register(toDisposable(() => {
      _element.replaceChildren();
    }));
    this._register(this._register(autorun((reader) => {
      globalTransaction((tx) => {
        this.render(reader);
      });
    })));
  }
  static {
    __name(this, "MultiDiffEditorWidgetImpl");
  }
  _scrollableElements = h("div.scrollContent", [
    h("div@content", {
      style: {
        overflow: "hidden"
      }
    }),
    h("div.monaco-editor@overflowWidgetsDomNode", {})
  ]);
  _scrollable = this._register(
    new Scrollable({
      forceIntegerValues: false,
      scheduleAtNextAnimationFrame: /* @__PURE__ */ __name((cb) => scheduleAtNextAnimationFrame(getWindow(this._element), cb), "scheduleAtNextAnimationFrame"),
      smoothScrollDuration: 100
    })
  );
  _scrollableElement = this._register(
    new SmoothScrollableElement(
      this._scrollableElements.root,
      {
        vertical: ScrollbarVisibility.Auto,
        horizontal: ScrollbarVisibility.Auto,
        useShadows: false
      },
      this._scrollable
    )
  );
  _elements = h("div.monaco-component.multiDiffEditor", {}, [
    h("div", {}, [this._scrollableElement.getDomNode()]),
    h("div.placeholder@placeholder", {}, [h("div")])
  ]);
  _sizeObserver = this._register(
    new ObservableElementSizeObserver(this._element, void 0)
  );
  _objectPool = this._register(
    new ObjectPool((data) => {
      const template = this._instantiationService.createInstance(
        DiffEditorItemTemplate,
        this._scrollableElements.content,
        this._scrollableElements.overflowWidgetsDomNode,
        this._workbenchUIElementFactory
      );
      template.setData(data);
      return template;
    })
  );
  scrollTop = observableFromEvent(
    this,
    this._scrollableElement.onScroll,
    () => (
      /** @description scrollTop */
      this._scrollableElement.getScrollPosition().scrollTop
    )
  );
  scrollLeft = observableFromEvent(
    this,
    this._scrollableElement.onScroll,
    () => (
      /** @description scrollLeft */
      this._scrollableElement.getScrollPosition().scrollLeft
    )
  );
  _viewItemsInfo = derivedWithStore(this, (reader, store) => {
    const vm = this._viewModel.read(reader);
    if (!vm) {
      return {
        items: [],
        getItem: /* @__PURE__ */ __name((_d) => {
          throw new BugIndicatingError();
        }, "getItem")
      };
    }
    const viewModels = vm.items.read(reader);
    const map = /* @__PURE__ */ new Map();
    const items = viewModels.map((d) => {
      const item = store.add(
        new VirtualizedViewItem(
          d,
          this._objectPool,
          this.scrollLeft,
          (delta) => {
            this._scrollableElement.setScrollPosition({
              scrollTop: this._scrollableElement.getScrollPosition().scrollTop + delta
            });
          }
        )
      );
      const data = this._lastDocStates?.[item.getKey()];
      if (data) {
        transaction((tx) => {
          item.setViewState(data, tx);
        });
      }
      map.set(d, item);
      return item;
    });
    return { items, getItem: /* @__PURE__ */ __name((d) => map.get(d), "getItem") };
  });
  _viewItems = this._viewItemsInfo.map(
    this,
    (items) => items.items
  );
  _spaceBetweenPx = 0;
  _totalHeight = this._viewItems.map(
    this,
    (items, reader) => items.reduce(
      (r, i) => r + i.contentHeight.read(reader) + this._spaceBetweenPx,
      0
    )
  );
  activeControl = derived(this, (reader) => {
    const activeDiffItem = this._viewModel.read(reader)?.activeDiffItem.read(reader);
    if (!activeDiffItem) {
      return void 0;
    }
    const viewItem = this._viewItemsInfo.read(reader).getItem(activeDiffItem);
    return viewItem.template.read(reader)?.editor;
  });
  _contextKeyService = this._register(
    this._parentContextKeyService.createScoped(this._element)
  );
  _instantiationService = this._register(
    this._parentInstantiationService.createChild(
      new ServiceCollection([
        IContextKeyService,
        this._contextKeyService
      ])
    )
  );
  setScrollState(scrollState) {
    this._scrollableElement.setScrollPosition({
      scrollLeft: scrollState.left,
      scrollTop: scrollState.top
    });
  }
  reveal(resource, options) {
    const viewItems = this._viewItems.get();
    const index = viewItems.findIndex(
      (item) => item.viewModel.originalUri?.toString() === resource.original?.toString() && item.viewModel.modifiedUri?.toString() === resource.modified?.toString()
    );
    if (index === -1) {
      throw new BugIndicatingError("Resource not found in diff editor");
    }
    const viewItem = viewItems[index];
    this._viewModel.get().activeDiffItem.setCache(viewItem.viewModel, void 0);
    let scrollTop = 0;
    for (let i = 0; i < index; i++) {
      scrollTop += viewItems[i].contentHeight.get() + this._spaceBetweenPx;
    }
    this._scrollableElement.setScrollPosition({ scrollTop });
    const diffEditor = viewItem.template.get()?.editor;
    const editor = "original" in resource ? diffEditor?.getOriginalEditor() : diffEditor?.getModifiedEditor();
    if (editor && options?.range) {
      editor.revealRangeInCenter(options.range);
      highlightRange(editor, options.range);
    }
  }
  getViewState() {
    return {
      scrollState: {
        top: this.scrollTop.get(),
        left: this.scrollLeft.get()
      },
      docStates: Object.fromEntries(
        this._viewItems.get().map((i) => [i.getKey(), i.getViewState()])
      )
    };
  }
  /** This accounts for documents that are not loaded yet. */
  _lastDocStates = {};
  setViewState(viewState) {
    this.setScrollState(viewState.scrollState);
    this._lastDocStates = viewState.docStates;
    transaction((tx) => {
      if (viewState.docStates) {
        for (const i of this._viewItems.get()) {
          const state = viewState.docStates[i.getKey()];
          if (state) {
            i.setViewState(state, tx);
          }
        }
      }
    });
  }
  findDocumentDiffItem(resource) {
    const item = this._viewItems.get().find(
      (v) => v.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString() || v.viewModel.diffEditorViewModel.model.original.uri.toString() === resource.toString()
    );
    return item?.viewModel.documentDiffItem;
  }
  tryGetCodeEditor(resource) {
    const item = this._viewItems.get().find(
      (v) => v.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString() || v.viewModel.diffEditorViewModel.model.original.uri.toString() === resource.toString()
    );
    const editor = item?.template.get()?.editor;
    if (!editor) {
      return void 0;
    }
    if (item.viewModel.diffEditorViewModel.model.modified.uri.toString() === resource.toString()) {
      return { diffEditor: editor, editor: editor.getModifiedEditor() };
    } else {
      return { diffEditor: editor, editor: editor.getOriginalEditor() };
    }
  }
  render(reader) {
    const scrollTop = this.scrollTop.read(reader);
    let contentScrollOffsetToScrollOffset = 0;
    let itemHeightSumBefore = 0;
    let itemContentHeightSumBefore = 0;
    const viewPortHeight = this._sizeObserver.height.read(reader);
    const contentViewPort = OffsetRange.ofStartAndLength(
      scrollTop,
      viewPortHeight
    );
    const width = this._sizeObserver.width.read(reader);
    for (const v of this._viewItems.read(reader)) {
      const itemContentHeight = v.contentHeight.read(reader);
      const itemHeight = Math.min(itemContentHeight, viewPortHeight);
      const itemRange = OffsetRange.ofStartAndLength(
        itemHeightSumBefore,
        itemHeight
      );
      const itemContentRange = OffsetRange.ofStartAndLength(
        itemContentHeightSumBefore,
        itemContentHeight
      );
      if (itemContentRange.isBefore(contentViewPort)) {
        contentScrollOffsetToScrollOffset -= itemContentHeight - itemHeight;
        v.hide();
      } else if (itemContentRange.isAfter(contentViewPort)) {
        v.hide();
      } else {
        const scroll = Math.max(
          0,
          Math.min(
            contentViewPort.start - itemContentRange.start,
            itemContentHeight - itemHeight
          )
        );
        contentScrollOffsetToScrollOffset -= scroll;
        const viewPort = OffsetRange.ofStartAndLength(
          scrollTop + contentScrollOffsetToScrollOffset,
          viewPortHeight
        );
        v.render(itemRange, scroll, width, viewPort);
      }
      itemHeightSumBefore += itemHeight + this._spaceBetweenPx;
      itemContentHeightSumBefore += itemContentHeight + this._spaceBetweenPx;
    }
    this._scrollableElements.content.style.transform = `translateY(${-(scrollTop + contentScrollOffsetToScrollOffset)}px)`;
  }
};
MultiDiffEditorWidgetImpl = __decorateClass([
  __decorateParam(4, IContextKeyService),
  __decorateParam(5, IInstantiationService)
], MultiDiffEditorWidgetImpl);
function highlightRange(targetEditor, range) {
  const modelNow = targetEditor.getModel();
  const decorations = targetEditor.createDecorationsCollection([
    {
      range,
      options: {
        description: "symbol-navigate-action-highlight",
        className: "symbolHighlight"
      }
    }
  ]);
  setTimeout(() => {
    if (targetEditor.getModel() === modelNow) {
      decorations.clear();
    }
  }, 350);
}
__name(highlightRange, "highlightRange");
class VirtualizedViewItem extends Disposable {
  constructor(viewModel, _objectPool, _scrollLeft, _deltaScrollVertical) {
    super();
    this.viewModel = viewModel;
    this._objectPool = _objectPool;
    this._scrollLeft = _scrollLeft;
    this._deltaScrollVertical = _deltaScrollVertical;
    this.viewModel.setIsFocused(this._isFocused, void 0);
    this._register(
      autorun((reader) => {
        const scrollLeft = this._scrollLeft.read(reader);
        this._templateRef.read(reader)?.object.setScrollLeft(scrollLeft);
      })
    );
    this._register(
      autorun((reader) => {
        const ref = this._templateRef.read(reader);
        if (!ref) {
          return;
        }
        const isHidden = this._isHidden.read(reader);
        if (!isHidden) {
          return;
        }
        const isFocused = ref.object.isFocused.read(reader);
        if (isFocused) {
          return;
        }
        this._clear();
      })
    );
  }
  static {
    __name(this, "VirtualizedViewItem");
  }
  _templateRef = this._register(
    disposableObservableValue(this, void 0)
  );
  contentHeight = derived(
    this,
    (reader) => this._templateRef.read(reader)?.object.contentHeight?.read(reader) ?? this.viewModel.lastTemplateData.read(reader).contentHeight
  );
  maxScroll = derived(
    this,
    (reader) => this._templateRef.read(reader)?.object.maxScroll.read(reader) ?? {
      maxScroll: 0,
      scrollWidth: 0
    }
  );
  template = derived(
    this,
    (reader) => this._templateRef.read(reader)?.object
  );
  _isHidden = observableValue(this, false);
  _isFocused = derived(
    this,
    (reader) => this.template.read(reader)?.isFocused.read(reader) ?? false
  );
  dispose() {
    this._clear();
    super.dispose();
  }
  toString() {
    return `VirtualViewItem(${this.viewModel.documentDiffItem.modified?.uri.toString()})`;
  }
  getKey() {
    return this.viewModel.getKey();
  }
  getViewState() {
    transaction((tx) => {
      this._updateTemplateData(tx);
    });
    return {
      collapsed: this.viewModel.collapsed.get(),
      selections: this.viewModel.lastTemplateData.get().selections
    };
  }
  setViewState(viewState, tx) {
    this.viewModel.collapsed.set(viewState.collapsed, tx);
    this._updateTemplateData(tx);
    const data = this.viewModel.lastTemplateData.get();
    const selections = viewState.selections?.map(Selection.liftSelection);
    this.viewModel.lastTemplateData.set(
      {
        ...data,
        selections
      },
      tx
    );
    const ref = this._templateRef.get();
    if (ref) {
      if (selections) {
        ref.object.editor.setSelections(selections);
      }
    }
  }
  _updateTemplateData(tx) {
    const ref = this._templateRef.get();
    if (!ref) {
      return;
    }
    this.viewModel.lastTemplateData.set(
      {
        contentHeight: ref.object.contentHeight.get(),
        selections: ref.object.editor.getSelections() ?? void 0
      },
      tx
    );
  }
  _clear() {
    const ref = this._templateRef.get();
    if (!ref) {
      return;
    }
    transaction((tx) => {
      this._updateTemplateData(tx);
      ref.object.hide();
      this._templateRef.set(void 0, tx);
    });
  }
  hide() {
    this._isHidden.set(true, void 0);
  }
  render(verticalSpace, offset, width, viewPort) {
    this._isHidden.set(false, void 0);
    let ref = this._templateRef.get();
    if (!ref) {
      ref = this._objectPool.getUnusedObj(
        new TemplateData(this.viewModel, this._deltaScrollVertical)
      );
      this._templateRef.set(ref, void 0);
      const selections = this.viewModel.lastTemplateData.get().selections;
      if (selections) {
        ref.object.editor.setSelections(selections);
      }
    }
    ref.object.render(verticalSpace, width, offset, viewPort);
  }
}
export {
  MultiDiffEditorWidgetImpl
};
//# sourceMappingURL=multiDiffEditorWidgetImpl.js.map
