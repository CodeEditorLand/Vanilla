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
import * as dom from "../../../../../base/browser/dom.js";
import { Delayer } from "../../../../../base/common/async.js";
import { Event } from "../../../../../base/common/event.js";
import { Iterable } from "../../../../../base/common/iterator.js";
import { Lazy } from "../../../../../base/common/lazy.js";
import {
  Disposable,
  MutableDisposable,
  combinedDisposable,
  toDisposable
} from "../../../../../base/common/lifecycle.js";
import { CodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js";
import { EmbeddedCodeEditorWidget } from "../../../../../editor/browser/widget/codeEditor/embeddedCodeEditorWidget.js";
import { DiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js";
import { EmbeddedDiffEditorWidget } from "../../../../../editor/browser/widget/diffEditor/embeddedDiffEditorWidget.js";
import { MarkdownRenderer } from "../../../../../editor/browser/widget/markdownRenderer/browser/markdownRenderer.js";
import {
  ITextModelService
} from "../../../../../editor/common/services/resolverService.js";
import { peekViewResultsBackground } from "../../../../../editor/contrib/peekView/browser/peekView.js";
import { localize } from "../../../../../nls.js";
import { IInstantiationService } from "../../../../../platform/instantiation/common/instantiation.js";
import { TerminalCapability } from "../../../../../platform/terminal/common/capabilities/capabilities.js";
import { TerminalCapabilityStore } from "../../../../../platform/terminal/common/capabilities/terminalCapabilityStore.js";
import { formatMessageForTerminal } from "../../../../../platform/terminal/common/terminalStrings.js";
import { IWorkspaceContextService } from "../../../../../platform/workspace/common/workspace.js";
import { EditorModel } from "../../../../common/editor/editorModel.js";
import {
  PANEL_BACKGROUND,
  SIDE_BAR_BACKGROUND
} from "../../../../common/theme.js";
import {
  IViewDescriptorService,
  ViewContainerLocation
} from "../../../../common/views.js";
import { DetachedProcessInfo } from "../../../terminal/browser/detachedTerminal.js";
import {
  ITerminalService
} from "../../../terminal/browser/terminal.js";
import { getXtermScaledDimensions } from "../../../terminal/browser/xterm/xtermTerminal.js";
import { TERMINAL_BACKGROUND_COLOR } from "../../../terminal/common/terminalColorRegistry.js";
import { Testing } from "../../common/constants.js";
import { MutableObservableValue } from "../../common/observableValue.js";
import {
  LiveTestResult,
  TestResultItemChangeReason
} from "../../common/testResult.js";
import {
  ITestMessage,
  TestMessageType,
  getMarkId
} from "../../common/testTypes.js";
import { colorizeTestMessageInEditor } from "../testMessageColorizer.js";
import {
  MessageSubject,
  TaskSubject,
  TestOutputSubject
} from "./testResultsSubject.js";
class SimpleDiffEditorModel extends EditorModel {
  constructor(_original, _modified) {
    super();
    this._original = _original;
    this._modified = _modified;
  }
  original = this._original.object.textEditorModel;
  modified = this._modified.object.textEditorModel;
  dispose() {
    super.dispose();
    this._original.dispose();
    this._modified.dispose();
  }
}
const commonEditorOptions = {
  scrollBeyondLastLine: false,
  links: true,
  lineNumbers: "off",
  glyphMargin: false,
  scrollbar: {
    verticalScrollbarSize: 14,
    horizontal: "auto",
    useShadows: false,
    verticalHasArrows: false,
    horizontalHasArrows: false,
    alwaysConsumeMouseWheel: false
  },
  overviewRulerLanes: 0,
  fixedOverflowWidgets: true,
  readOnly: true,
  stickyScroll: { enabled: false },
  minimap: { enabled: false },
  automaticLayout: false
};
const diffEditorOptions = {
  ...commonEditorOptions,
  enableSplitViewResizing: true,
  isInEmbeddedEditor: true,
  renderOverviewRuler: false,
  ignoreTrimWhitespace: false,
  renderSideBySide: true,
  useInlineViewWhenSpaceIsLimited: false,
  originalAriaLabel: localize("testingOutputExpected", "Expected result"),
  modifiedAriaLabel: localize("testingOutputActual", "Actual result"),
  diffAlgorithm: "advanced"
};
let DiffContentProvider = class extends Disposable {
  constructor(editor, container, instantiationService, modelService) {
    super();
    this.editor = editor;
    this.container = container;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
  }
  widget = this._register(
    new MutableDisposable()
  );
  model = this._register(new MutableDisposable());
  dimension;
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event.None;
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (!ITestMessage.isDiffable(message)) {
      this.clear();
      return false;
    }
    const [original, modified] = await Promise.all([
      this.modelService.createModelReference(subject.expectedUri),
      this.modelService.createModelReference(subject.actualUri)
    ]);
    const model = this.model.value = new SimpleDiffEditorModel(
      original,
      modified
    );
    if (!this.widget.value) {
      this.widget.value = this.editor ? this.instantiationService.createInstance(
        EmbeddedDiffEditorWidget,
        this.container,
        diffEditorOptions,
        {},
        this.editor
      ) : this.instantiationService.createInstance(
        DiffEditorWidget,
        this.container,
        diffEditorOptions,
        {}
      );
      if (this.dimension) {
        this.widget.value.layout(this.dimension);
      }
    }
    this.widget.value.setModel(model);
    this.widget.value.updateOptions(
      this.getOptions(
        isMultiline(message.expected) || isMultiline(message.actual)
      )
    );
    return true;
  }
  clear() {
    this.model.clear();
    this.widget.clear();
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    if (!hasMultipleFrames) {
      return dimensions.height;
    }
    const height = Math.min(
      1e4,
      Math.max(
        editor.getOriginalEditor().getContentHeight(),
        editor.getModifiedEditor().getContentHeight()
      )
    );
    editor.layout({ height, width: dimensions.width });
    return height;
  }
  getOptions(isMultiline2) {
    return isMultiline2 ? { ...diffEditorOptions, lineNumbers: "on" } : { ...diffEditorOptions, lineNumbers: "off" };
  }
};
DiffContentProvider = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService)
], DiffContentProvider);
let MarkdownTestMessagePeek = class extends Disposable {
  constructor(container, instantiationService) {
    super();
    this.container = container;
    this.instantiationService = instantiationService;
    this._register(toDisposable(() => this.clear()));
  }
  markdown = new Lazy(
    () => this._register(
      this.instantiationService.createInstance(MarkdownRenderer, {})
    )
  );
  element;
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || typeof message.message === "string") {
      this.clear();
      return false;
    }
    const rendered = this._register(
      this.markdown.value.render(message.message, {})
    );
    rendered.element.style.userSelect = "text";
    rendered.element.classList.add("preview-text");
    this.container.appendChild(rendered.element);
    this.element = rendered.element;
    return true;
  }
  layout(dimension) {
    if (!this.element) {
      return void 0;
    }
    this.element.style.width = `${dimension.width - 32}px`;
    return this.element.clientHeight;
  }
  clear() {
    if (this.element) {
      this.element.remove();
      this.element = void 0;
    }
  }
};
MarkdownTestMessagePeek = __decorateClass([
  __decorateParam(1, IInstantiationService)
], MarkdownTestMessagePeek);
let PlainTextMessagePeek = class extends Disposable {
  constructor(editor, container, instantiationService, modelService) {
    super();
    this.editor = editor;
    this.container = container;
    this.instantiationService = instantiationService;
    this.modelService = modelService;
  }
  widgetDecorations = this._register(
    new MutableDisposable()
  );
  widget = this._register(
    new MutableDisposable()
  );
  model = this._register(new MutableDisposable());
  dimension;
  get onDidContentSizeChange() {
    return this.widget.value?.onDidContentSizeChange || Event.None;
  }
  async update(subject) {
    if (!(subject instanceof MessageSubject)) {
      this.clear();
      return false;
    }
    const message = subject.message;
    if (ITestMessage.isDiffable(message) || message.type === TestMessageType.Output || typeof message.message !== "string") {
      this.clear();
      return false;
    }
    const modelRef = this.model.value = await this.modelService.createModelReference(subject.messageUri);
    if (!this.widget.value) {
      this.widget.value = this.editor ? this.instantiationService.createInstance(
        EmbeddedCodeEditorWidget,
        this.container,
        commonEditorOptions,
        {},
        this.editor
      ) : this.instantiationService.createInstance(
        CodeEditorWidget,
        this.container,
        commonEditorOptions,
        { isSimpleWidget: true }
      );
      if (this.dimension) {
        this.widget.value.layout(this.dimension);
      }
    }
    this.widget.value.setModel(modelRef.object.textEditorModel);
    this.widget.value.updateOptions(commonEditorOptions);
    this.widgetDecorations.value = colorizeTestMessageInEditor(
      message.message,
      this.widget.value
    );
    return true;
  }
  clear() {
    this.widgetDecorations.clear();
    this.widget.clear();
    this.model.clear();
  }
  layout(dimensions, hasMultipleFrames) {
    this.dimension = dimensions;
    const editor = this.widget.value;
    if (!editor) {
      return;
    }
    editor.layout(dimensions);
    if (!hasMultipleFrames) {
      return dimensions.height;
    }
    const height = editor.getContentHeight();
    editor.layout({ height, width: dimensions.width });
    return height;
  }
};
PlainTextMessagePeek = __decorateClass([
  __decorateParam(2, IInstantiationService),
  __decorateParam(3, ITextModelService)
], PlainTextMessagePeek);
let TerminalMessagePeek = class extends Disposable {
  constructor(container, isInPeekView, terminalService, viewDescriptorService, workspaceContext) {
    super();
    this.container = container;
    this.isInPeekView = isInPeekView;
    this.terminalService = terminalService;
    this.viewDescriptorService = viewDescriptorService;
    this.workspaceContext = workspaceContext;
  }
  dimensions;
  terminalCwd = this._register(
    new MutableObservableValue("")
  );
  xtermLayoutDelayer = this._register(new Delayer(50));
  /** Active terminal instance. */
  terminal = this._register(
    new MutableDisposable()
  );
  /** Listener for streaming result data */
  outputDataListener = this._register(
    new MutableDisposable()
  );
  async makeTerminal() {
    const prev = this.terminal.value;
    if (prev) {
      prev.xterm.clearBuffer();
      prev.xterm.clearSearchDecorations();
      prev.xterm.write(`\x1B[2J\x1B[0;0H`);
      return prev;
    }
    const capabilities = new TerminalCapabilityStore();
    const cwd = this.terminalCwd;
    capabilities.add(TerminalCapability.CwdDetection, {
      type: TerminalCapability.CwdDetection,
      get cwds() {
        return [cwd.value];
      },
      onDidChangeCwd: cwd.onDidChange,
      getCwd: () => cwd.value,
      updateCwd: () => {
      }
    });
    return this.terminal.value = await this.terminalService.createDetachedTerminal({
      rows: 10,
      cols: 80,
      readonly: true,
      capabilities,
      processInfo: new DetachedProcessInfo({ initialCwd: cwd.value }),
      colorProvider: {
        getBackgroundColor: (theme) => {
          const terminalBackground = theme.getColor(
            TERMINAL_BACKGROUND_COLOR
          );
          if (terminalBackground) {
            return terminalBackground;
          }
          if (this.isInPeekView) {
            return theme.getColor(peekViewResultsBackground);
          }
          const location = this.viewDescriptorService.getViewLocationById(
            Testing.ResultsViewId
          );
          return location === ViewContainerLocation.Panel ? theme.getColor(PANEL_BACKGROUND) : theme.getColor(SIDE_BAR_BACKGROUND);
        }
      }
    });
  }
  async update(subject) {
    this.outputDataListener.clear();
    if (subject instanceof TaskSubject) {
      await this.updateForTaskSubject(subject);
    } else if (subject instanceof TestOutputSubject || subject instanceof MessageSubject && subject.message.type === TestMessageType.Output) {
      await this.updateForTestSubject(subject);
    } else {
      this.clear();
      return false;
    }
    return true;
  }
  async updateForTestSubject(subject) {
    const that = this;
    const testItem = subject instanceof TestOutputSubject ? subject.test.item : subject.test;
    const terminal = await this.updateGenerically({
      subject,
      noOutputMessage: localize(
        "caseNoOutput",
        "The test case did not report any output."
      ),
      getTarget: (result) => result?.tasks[subject.taskIndex].output,
      *doInitialWrite(output, results) {
        that.updateCwd(testItem.uri);
        const state = subject instanceof TestOutputSubject ? subject.test : results.getStateById(testItem.extId);
        if (!state) {
          return;
        }
        for (const message of state.tasks[subject.taskIndex].messages) {
          if (message.type === TestMessageType.Output) {
            yield* output.getRangeIter(
              message.offset,
              message.length
            );
          }
        }
      },
      doListenForMoreData: (output, result, write) => result.onChange((e) => {
        if (e.reason === TestResultItemChangeReason.NewMessage && e.item.item.extId === testItem.extId && e.message.type === TestMessageType.Output) {
          for (const chunk of output.getRangeIter(
            e.message.offset,
            e.message.length
          )) {
            write(chunk.buffer);
          }
        }
      })
    });
    if (subject instanceof MessageSubject && subject.message.type === TestMessageType.Output && subject.message.marker !== void 0) {
      terminal?.xterm.selectMarkedRange(
        getMarkId(subject.message.marker, true),
        getMarkId(subject.message.marker, false),
        /* scrollIntoView= */
        true
      );
    }
  }
  updateForTaskSubject(subject) {
    return this.updateGenerically({
      subject,
      noOutputMessage: localize(
        "runNoOutput",
        "The test run did not record any output."
      ),
      getTarget: (result) => result?.tasks[subject.taskIndex],
      doInitialWrite: (task, result) => {
        this.updateCwd(
          Iterable.find(result.tests, (t) => !!t.item.uri)?.item.uri
        );
        return task.output.buffers;
      },
      doListenForMoreData: (task, _result, write) => task.output.onDidWriteData((e) => write(e.buffer))
    });
  }
  async updateGenerically(opts) {
    const result = opts.subject.result;
    const target = opts.getTarget(result);
    if (!target) {
      return this.clear();
    }
    const terminal = await this.makeTerminal();
    let didWriteData = false;
    const pendingWrites = new MutableObservableValue(0);
    if (result instanceof LiveTestResult) {
      for (const chunk of opts.doInitialWrite(target, result)) {
        didWriteData ||= chunk.byteLength > 0;
        pendingWrites.value++;
        terminal.xterm.write(chunk.buffer, () => pendingWrites.value--);
      }
    } else {
      didWriteData = true;
      this.writeNotice(
        terminal,
        localize(
          "runNoOutputForPast",
          "Test output is only available for new test runs."
        )
      );
    }
    this.attachTerminalToDom(terminal);
    this.outputDataListener.clear();
    if (result instanceof LiveTestResult && !result.completedAt) {
      const l1 = result.onComplete(() => {
        if (!didWriteData) {
          this.writeNotice(terminal, opts.noOutputMessage);
        }
      });
      const l2 = opts.doListenForMoreData(target, result, (data) => {
        terminal.xterm.write(data);
        didWriteData ||= data.byteLength > 0;
      });
      this.outputDataListener.value = combinedDisposable(l1, l2);
    }
    if (!this.outputDataListener.value && !didWriteData) {
      this.writeNotice(terminal, opts.noOutputMessage);
    }
    if (pendingWrites.value > 0) {
      await new Promise((resolve) => {
        const l = pendingWrites.onDidChange(() => {
          if (pendingWrites.value === 0) {
            l.dispose();
            resolve();
          }
        });
      });
    }
    return terminal;
  }
  updateCwd(testUri) {
    const wf = testUri && this.workspaceContext.getWorkspaceFolder(testUri) || this.workspaceContext.getWorkspace().folders[0];
    if (wf) {
      this.terminalCwd.value = wf.uri.fsPath;
    }
  }
  writeNotice(terminal, str) {
    terminal.xterm.write(formatMessageForTerminal(str));
  }
  attachTerminalToDom(terminal) {
    terminal.xterm.write("\x1B[?25l");
    dom.scheduleAtNextAnimationFrame(
      dom.getWindow(this.container),
      () => this.layoutTerminal(terminal)
    );
    terminal.attachToElement(this.container, { enableGpu: false });
  }
  clear() {
    this.outputDataListener.clear();
    this.xtermLayoutDelayer.cancel();
    this.terminal.clear();
  }
  layout(dimensions) {
    this.dimensions = dimensions;
    if (this.terminal.value) {
      this.layoutTerminal(
        this.terminal.value,
        dimensions.width,
        dimensions.height
      );
      return dimensions.height;
    }
    return void 0;
  }
  layoutTerminal({ xterm }, width = this.dimensions?.width ?? this.container.clientWidth, height = this.dimensions?.height ?? this.container.clientHeight) {
    width -= 10 + 20;
    this.xtermLayoutDelayer.trigger(() => {
      const scaled = getXtermScaledDimensions(
        dom.getWindow(this.container),
        xterm.getFont(),
        width,
        height
      );
      if (scaled) {
        xterm.resize(scaled.cols, scaled.rows);
      }
    });
  }
};
TerminalMessagePeek = __decorateClass([
  __decorateParam(2, ITerminalService),
  __decorateParam(3, IViewDescriptorService),
  __decorateParam(4, IWorkspaceContextService)
], TerminalMessagePeek);
const isMultiline = (str) => !!str && str.includes("\n");
export {
  DiffContentProvider,
  MarkdownTestMessagePeek,
  PlainTextMessagePeek,
  TerminalMessagePeek
};
