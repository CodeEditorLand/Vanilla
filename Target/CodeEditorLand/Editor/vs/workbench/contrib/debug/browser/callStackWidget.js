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
import * as dom from "../../../../base/browser/dom.js";
import { Button } from "../../../../base/browser/ui/button/button.js";
import { assertNever } from "../../../../base/common/assert.js";
import {
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { Emitter } from "../../../../base/common/event.js";
import {
  Disposable,
  DisposableStore,
  toDisposable
} from "../../../../base/common/lifecycle.js";
import {
  autorun,
  autorunWithStore,
  derived,
  observableValue,
  transaction
} from "../../../../base/common/observable.js";
import { Constants } from "../../../../base/common/uint.js";
import { generateUuid } from "../../../../base/common/uuid.js";
import "./media/callStackWidget.css";
import {
  EditorContributionInstantiation
} from "../../../../editor/browser/editorExtensions.js";
import { CodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import { ITextModelService } from "../../../../editor/common/services/resolverService.js";
import {
  ClickLinkGesture
} from "../../../../editor/contrib/gotoSymbol/browser/link/clickLinkGesture.js";
import { localize, localize2 } from "../../../../nls.js";
import { createActionViewItem } from "../../../../platform/actions/browser/menuEntryActionViewItem.js";
import { MenuWorkbenchToolBar } from "../../../../platform/actions/browser/toolbar.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { TextEditorSelectionRevealType } from "../../../../platform/editor/common/editor.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { WorkbenchList } from "../../../../platform/list/browser/listService.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { defaultButtonStyles } from "../../../../platform/theme/browser/defaultStyles.js";
import { ResourceLabel } from "../../../browser/labels.js";
import {
  IEditorService,
  SIDE_GROUP
} from "../../../services/editor/common/editorService.js";
import {
  TOP_STACK_FRAME_DECORATION,
  makeStackFrameColumnDecoration
} from "./callStackEditorContribution.js";
class CallStackFrame {
  constructor(name, source, line = 1, column = 1) {
    this.name = name;
    this.source = source;
    this.line = line;
    this.column = column;
  }
}
class SkippedCallFrames {
  constructor(label, load) {
    this.label = label;
    this.load = load;
  }
}
class CustomStackFrame {
  showHeader = observableValue(
    "CustomStackFrame.showHeader",
    true
  );
  icon;
}
class WrappedCallStackFrame extends CallStackFrame {
  editorHeight = observableValue(
    "WrappedCallStackFrame.height",
    this.source ? 100 : 0
  );
  collapsed = observableValue(
    "WrappedCallStackFrame.collapsed",
    false
  );
  height = derived((reader) => {
    return this.collapsed.read(reader) ? HEADER_HEIGHT : HEADER_HEIGHT + this.editorHeight.read(reader);
  });
  constructor(original) {
    super(original.name, original.source, original.line, original.column);
  }
}
class WrappedCustomStackFrame {
  constructor(original) {
    this.original = original;
  }
  collapsed = observableValue(
    "WrappedCallStackFrame.collapsed",
    false
  );
  height = derived((reader) => {
    const headerHeight = this.original.showHeader.read(reader) ? HEADER_HEIGHT : 0;
    return this.collapsed.read(reader) ? headerHeight : headerHeight + this.original.height.read(reader);
  });
}
const isFrameLike = (item) => item instanceof WrappedCallStackFrame || item instanceof WrappedCustomStackFrame;
const WIDGET_CLASS_NAME = "multiCallStackWidget";
let CallStackWidget = class extends Disposable {
  list;
  layoutEmitter = this._register(new Emitter());
  currentFramesDs = this._register(new DisposableStore());
  cts;
  constructor(container, containingEditor, instantiationService) {
    super();
    container.classList.add(WIDGET_CLASS_NAME);
    this._register(
      toDisposable(() => container.classList.remove(WIDGET_CLASS_NAME))
    );
    this.list = this._register(
      instantiationService.createInstance(
        WorkbenchList,
        "TestResultStackWidget",
        container,
        new StackDelegate(),
        [
          instantiationService.createInstance(
            FrameCodeRenderer,
            containingEditor,
            this.layoutEmitter.event
          ),
          instantiationService.createInstance(MissingCodeRenderer),
          instantiationService.createInstance(CustomRenderer),
          instantiationService.createInstance(
            SkippedRenderer,
            (i) => this.loadFrame(i)
          )
        ],
        {
          multipleSelectionSupport: false,
          mouseSupport: false,
          keyboardSupport: false,
          setRowLineHeight: false,
          accessibilityProvider: instantiationService.createInstance(
            StackAccessibilityProvider
          )
        }
      )
    );
  }
  /** Replaces the call frames display in the view. */
  setFrames(frames) {
    this.currentFramesDs.clear();
    this.cts = new CancellationTokenSource();
    this._register(toDisposable(() => this.cts.dispose(true)));
    this.list.splice(0, this.list.length, this.mapFrames(frames));
  }
  layout(height, width) {
    this.list.layout(height, width);
    this.layoutEmitter.fire();
  }
  collapseAll() {
    transaction((tx) => {
      for (let i = 0; i < this.list.length; i++) {
        const frame = this.list.element(i);
        if (isFrameLike(frame)) {
          frame.collapsed.set(true, tx);
        }
      }
    });
  }
  async loadFrame(replacing) {
    if (!this.cts) {
      return;
    }
    const frames = await replacing.load(this.cts.token);
    if (this.cts.token.isCancellationRequested) {
      return;
    }
    const index = this.list.indexOf(replacing);
    this.list.splice(index, 1, this.mapFrames(frames));
  }
  mapFrames(frames) {
    const result = [];
    for (const frame of frames) {
      if (frame instanceof SkippedCallFrames) {
        result.push(frame);
        continue;
      }
      const wrapped = frame instanceof CustomStackFrame ? new WrappedCustomStackFrame(frame) : new WrappedCallStackFrame(frame);
      result.push(wrapped);
      this.currentFramesDs.add(
        autorun((reader) => {
          const height = wrapped.height.read(reader);
          const idx = this.list.indexOf(wrapped);
          if (idx !== -1) {
            this.list.updateElementHeight(idx, height);
          }
        })
      );
    }
    return result;
  }
};
CallStackWidget = __decorateClass([
  __decorateParam(2, IInstantiationService)
], CallStackWidget);
let StackAccessibilityProvider = class {
  constructor(labelService) {
    this.labelService = labelService;
  }
  getAriaLabel(e) {
    if (e instanceof SkippedCallFrames) {
      return e.label;
    }
    if (e instanceof WrappedCustomStackFrame) {
      return e.original.label;
    }
    if (e instanceof CallStackFrame) {
      if (e.source && e.line) {
        return localize(
          {
            comment: [
              "{0} is an extension-defined label, then line number and filename"
            ],
            key: "stackTraceLabel"
          },
          "{0}, line {1} in {2}",
          e.name,
          e.line,
          this.labelService.getUriLabel(e.source, { relative: true })
        );
      }
      return e.name;
    }
    assertNever(e);
  }
  getWidgetAriaLabel() {
    return localize("stackTrace", "Stack Trace");
  }
};
StackAccessibilityProvider = __decorateClass([
  __decorateParam(0, ILabelService)
], StackAccessibilityProvider);
class StackDelegate {
  getHeight(element) {
    if (element instanceof CallStackFrame || element instanceof WrappedCustomStackFrame) {
      return element.height.get();
    }
    if (element instanceof SkippedCallFrames) {
      return HEADER_HEIGHT;
    }
    assertNever(element);
  }
  getTemplateId(element) {
    if (element instanceof CallStackFrame) {
      return element.source ? FrameCodeRenderer.templateId : MissingCodeRenderer.templateId;
    }
    if (element instanceof SkippedCallFrames) {
      return SkippedRenderer.templateId;
    }
    if (element instanceof WrappedCustomStackFrame) {
      return CustomRenderer.templateId;
    }
    assertNever(element);
  }
}
const editorOptions = {
  scrollBeyondLastLine: false,
  scrollbar: {
    vertical: "hidden",
    horizontal: "hidden",
    handleMouseWheel: false,
    useShadows: false
  },
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  overviewRulerBorder: false,
  stickyScroll: { enabled: false },
  minimap: { enabled: false },
  readOnly: true,
  automaticLayout: false
};
const makeFrameElements = () => dom.h("div.multiCallStackFrame", [
  dom.h("div.header@header", [
    dom.h("div.collapse-button@collapseButton"),
    dom.h("div.title.show-file-icons@title"),
    dom.h("div.actions@actions")
  ]),
  dom.h("div.editorParent", [dom.h("div.editorContainer@editor")])
]);
const HEADER_HEIGHT = 24;
let AbstractFrameRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  renderTemplate(container) {
    const elements = makeFrameElements();
    container.appendChild(elements.root);
    const templateStore = new DisposableStore();
    container.classList.add("multiCallStackFrameContainer");
    templateStore.add(
      toDisposable(() => {
        container.classList.remove("multiCallStackFrameContainer");
        elements.root.remove();
      })
    );
    const label = templateStore.add(
      this.instantiationService.createInstance(
        ResourceLabel,
        elements.title,
        {}
      )
    );
    const collapse = templateStore.add(
      new Button(elements.collapseButton, {})
    );
    const contentId = generateUuid();
    elements.editor.id = contentId;
    elements.editor.role = "region";
    elements.collapseButton.setAttribute("aria-controls", contentId);
    return this.finishRenderTemplate({
      container,
      decorations: [],
      elements,
      label,
      collapse,
      elementStore: templateStore.add(new DisposableStore()),
      templateStore
    });
  }
  renderElement(element, index, template, height) {
    const { elementStore } = template;
    elementStore.clear();
    const item = element;
    this.setupCollapseButton(item, template);
  }
  setupCollapseButton(item, { elementStore, elements, collapse }) {
    elementStore.add(
      autorun((reader) => {
        collapse.element.className = "";
        const collapsed = item.collapsed.read(reader);
        collapse.icon = collapsed ? Codicon.chevronRight : Codicon.chevronDown;
        collapse.element.ariaExpanded = String(!collapsed);
        elements.root.classList.toggle("collapsed", collapsed);
      })
    );
    const toggleCollapse = () => item.collapsed.set(!item.collapsed.get(), void 0);
    elementStore.add(collapse.onDidClick(toggleCollapse));
    elementStore.add(
      dom.addDisposableListener(elements.title, "click", toggleCollapse)
    );
  }
  disposeElement(element, index, templateData, height) {
    templateData.elementStore.clear();
  }
  disposeTemplate(templateData) {
    templateData.templateStore.dispose();
  }
};
AbstractFrameRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], AbstractFrameRenderer);
const CONTEXT_LINES = 2;
let FrameCodeRenderer = class extends AbstractFrameRenderer {
  constructor(containingEditor, onLayout, modelService, instantiationService) {
    super(instantiationService);
    this.containingEditor = containingEditor;
    this.onLayout = onLayout;
    this.modelService = modelService;
  }
  static templateId = "f";
  templateId = FrameCodeRenderer.templateId;
  finishRenderTemplate(data) {
    const contributions = [
      {
        id: ClickToLocationContribution.ID,
        instantiation: EditorContributionInstantiation.BeforeFirstInteraction,
        ctor: ClickToLocationContribution
      }
    ];
    const editor = this.containingEditor ? this.instantiationService.createInstance(
      EmbeddedCodeEditorWidget,
      data.elements.editor,
      editorOptions,
      { isSimpleWidget: true, contributions },
      this.containingEditor
    ) : this.instantiationService.createInstance(
      CodeEditorWidget,
      data.elements.editor,
      editorOptions,
      { isSimpleWidget: true, contributions }
    );
    data.templateStore.add(editor);
    const toolbar = data.templateStore.add(
      this.instantiationService.createInstance(
        MenuWorkbenchToolBar,
        data.elements.actions,
        MenuId.DebugCallStackToolbar,
        {
          menuOptions: { shouldForwardArgs: true },
          actionViewItemProvider: (action, options) => createActionViewItem(
            this.instantiationService,
            action,
            options
          )
        }
      )
    );
    return { ...data, editor, toolbar };
  }
  renderElement(element, index, template, height) {
    super.renderElement(element, index, template, height);
    const { elementStore, editor } = template;
    const item = element;
    const uri = item.source;
    template.label.element.setFile(uri);
    const cts = new CancellationTokenSource();
    elementStore.add(toDisposable(() => cts.dispose(true)));
    this.modelService.createModelReference(uri).then((reference) => {
      if (cts.token.isCancellationRequested) {
        return reference.dispose();
      }
      elementStore.add(reference);
      editor.setModel(reference.object.textEditorModel);
      this.setupEditorAfterModel(item, template);
      this.setupEditorLayout(item, template);
    });
  }
  setupEditorLayout(item, { elementStore, container, editor }) {
    const layout = () => {
      const prev = editor.getContentHeight();
      editor.layout({ width: container.clientWidth, height: prev });
      const next = editor.getContentHeight();
      if (next !== prev) {
        editor.layout({ width: container.clientWidth, height: next });
      }
      item.editorHeight.set(next, void 0);
    };
    elementStore.add(editor.onDidChangeModelDecorations(layout));
    elementStore.add(editor.onDidChangeModelContent(layout));
    elementStore.add(editor.onDidChangeModelOptions(layout));
    elementStore.add(this.onLayout(layout));
    layout();
  }
  setupEditorAfterModel(item, template) {
    const range = Range.fromPositions({
      column: item.column ?? 1,
      lineNumber: item.line ?? 1
    });
    template.toolbar.context = { uri: item.source, range };
    template.editor.setHiddenAreas([
      Range.fromPositions(
        { column: 1, lineNumber: 1 },
        {
          column: 1,
          lineNumber: Math.max(1, item.line - CONTEXT_LINES - 1)
        }
      ),
      Range.fromPositions(
        { column: 1, lineNumber: item.line + CONTEXT_LINES + 1 },
        { column: 1, lineNumber: Constants.MAX_SAFE_SMALL_INTEGER }
      )
    ]);
    template.editor.changeDecorations((accessor) => {
      for (const d of template.decorations) {
        accessor.removeDecoration(d);
      }
      template.decorations.length = 0;
      const beforeRange = range.setStartPosition(
        range.startLineNumber,
        1
      );
      const hasCharactersBefore = !!template.editor.getModel()?.getValueInRange(beforeRange).trim();
      const decoRange = range.setEndPosition(
        range.startLineNumber,
        Constants.MAX_SAFE_SMALL_INTEGER
      );
      template.decorations.push(
        accessor.addDecoration(
          decoRange,
          makeStackFrameColumnDecoration(!hasCharactersBefore)
        )
      );
      template.decorations.push(
        accessor.addDecoration(decoRange, TOP_STACK_FRAME_DECORATION)
      );
    });
    item.editorHeight.set(template.editor.getContentHeight(), void 0);
  }
};
FrameCodeRenderer = __decorateClass([
  __decorateParam(2, ITextModelService),
  __decorateParam(3, IInstantiationService)
], FrameCodeRenderer);
let MissingCodeRenderer = class {
  constructor(instantiationService) {
    this.instantiationService = instantiationService;
  }
  static templateId = "m";
  templateId = MissingCodeRenderer.templateId;
  renderTemplate(container) {
    const elements = makeFrameElements();
    elements.root.classList.add("missing");
    container.appendChild(elements.root);
    const label = this.instantiationService.createInstance(
      ResourceLabel,
      elements.title,
      {}
    );
    return { elements, label };
  }
  renderElement(element, _index, templateData) {
    const cast = element;
    templateData.label.element.setResource(
      {
        name: cast.name,
        description: localize(
          "stackFrameLocation",
          "Line {0} column {1}",
          cast.line,
          cast.column
        ),
        range: {
          startLineNumber: cast.line,
          startColumn: cast.column,
          endColumn: cast.column,
          endLineNumber: cast.line
        }
      },
      {
        icon: Codicon.fileBinary
      }
    );
  }
  disposeTemplate(templateData) {
    templateData.label.dispose();
    templateData.elements.root.remove();
  }
};
MissingCodeRenderer = __decorateClass([
  __decorateParam(0, IInstantiationService)
], MissingCodeRenderer);
class CustomRenderer extends AbstractFrameRenderer {
  static templateId = "c";
  templateId = CustomRenderer.templateId;
  finishRenderTemplate(data) {
    return data;
  }
  renderElement(element, index, template, height) {
    super.renderElement(element, index, template, height);
    const item = element;
    const { elementStore, container, label } = template;
    label.element.setResource(
      { name: item.original.label },
      { icon: item.original.icon }
    );
    elementStore.add(
      autorun((reader) => {
        template.elements.header.style.display = item.original.showHeader.read(reader) ? "" : "none";
      })
    );
    elementStore.add(
      autorunWithStore((reader, store) => {
        if (!item.collapsed.read(reader)) {
          store.add(item.original.render(container));
        }
      })
    );
    const actions = item.original.renderActions?.(
      template.elements.actions
    );
    if (actions) {
      elementStore.add(actions);
    }
  }
}
let SkippedRenderer = class {
  constructor(loadFrames, notificationService) {
    this.loadFrames = loadFrames;
    this.notificationService = notificationService;
  }
  static templateId = "s";
  templateId = SkippedRenderer.templateId;
  renderTemplate(container) {
    const store = new DisposableStore();
    const button = new Button(container, {
      title: "",
      ...defaultButtonStyles
    });
    const data = { button, store };
    store.add(button);
    store.add(
      button.onDidClick(() => {
        if (!data.current || !button.enabled) {
          return;
        }
        button.enabled = false;
        this.loadFrames(data.current).catch((e) => {
          this.notificationService.error(
            localize(
              "failedToLoadFrames",
              "Failed to load stack frames: {0}",
              e.message
            )
          );
        });
      })
    );
    return data;
  }
  renderElement(element, index, templateData, height) {
    const cast = element;
    templateData.button.enabled = true;
    templateData.button.label = cast.label;
    templateData.current = cast;
  }
  disposeTemplate(templateData) {
    templateData.store.dispose();
  }
};
SkippedRenderer = __decorateClass([
  __decorateParam(1, INotificationService)
], SkippedRenderer);
let ClickToLocationContribution = class extends Disposable {
  constructor(editor, editorService) {
    super();
    this.editor = editor;
    this.linkDecorations = editor.createDecorationsCollection();
    this._register(toDisposable(() => this.linkDecorations.clear()));
    const clickLinkGesture = this._register(new ClickLinkGesture(editor));
    this._register(
      clickLinkGesture.onMouseMoveOrRelevantKeyDown(
        ([mouseEvent, keyboardEvent]) => {
          this.onMove(mouseEvent);
        }
      )
    );
    this._register(
      clickLinkGesture.onExecute((e) => {
        const model = this.editor.getModel();
        if (!this.current || !model) {
          return;
        }
        editorService.openEditor(
          {
            resource: model.uri,
            options: {
              selection: Range.fromPositions(
                new Position(
                  this.current.line,
                  this.current.word.startColumn
                )
              ),
              selectionRevealType: TextEditorSelectionRevealType.CenterIfOutsideViewport
            }
          },
          e.hasSideBySideModifier ? SIDE_GROUP : void 0
        );
      })
    );
  }
  static ID = "clickToLocation";
  linkDecorations;
  current;
  onMove(mouseEvent) {
    if (!mouseEvent.hasTriggerModifier) {
      return this.clear();
    }
    const position = mouseEvent.target.position;
    const word = position && this.editor.getModel()?.getWordAtPosition(position);
    if (!word) {
      return this.clear();
    }
    const prev = this.current?.word;
    if (prev && prev.startColumn === word.startColumn && prev.endColumn === word.endColumn && prev.word === word.word) {
      return;
    }
    this.current = { word, line: position.lineNumber };
    this.linkDecorations.set([
      {
        range: new Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn
        ),
        options: {
          description: "call-stack-go-to-file-link",
          inlineClassName: "call-stack-go-to-file-link"
        }
      }
    ]);
  }
  clear() {
    this.linkDecorations.clear();
    this.current = void 0;
  }
};
ClickToLocationContribution = __decorateClass([
  __decorateParam(1, IEditorService)
], ClickToLocationContribution);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "callStackWidget.goToFile",
        title: localize2("goToFile", "Open File"),
        icon: Codicon.goToFile,
        menu: {
          id: MenuId.DebugCallStackToolbar,
          order: 22,
          group: "navigation"
        }
      });
    }
    async run(accessor, { uri, range }) {
      const editorService = accessor.get(IEditorService);
      await editorService.openEditor({
        resource: uri,
        options: {
          selection: range,
          selectionRevealType: TextEditorSelectionRevealType.CenterIfOutsideViewport
        }
      });
    }
  }
);
export {
  CallStackFrame,
  CallStackWidget,
  CustomStackFrame,
  SkippedCallFrames
};
