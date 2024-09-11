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
import { distinct } from "../../../../base/common/arrays.js";
import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { Constants } from "../../../../base/common/uint.js";
import { ICodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { Range } from "../../../../editor/common/core/range.js";
import { IEditorContribution } from "../../../../editor/common/editorCommon.js";
import { GlyphMarginLane, IModelDecorationOptions, IModelDeltaDecoration, OverviewRulerLane, TrackedRangeStickiness } from "../../../../editor/common/model.js";
import { localize } from "../../../../nls.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { registerColor } from "../../../../platform/theme/common/colorRegistry.js";
import { themeColorFromId } from "../../../../platform/theme/common/themeService.js";
import { ThemeIcon } from "../../../../base/common/themables.js";
import { IUriIdentityService } from "../../../../platform/uriIdentity/common/uriIdentity.js";
import { debugStackframe, debugStackframeFocused } from "./debugIcons.js";
import { IDebugService, IStackFrame } from "../common/debug.js";
import "./media/callStackEditorContribution.css";
const topStackFrameColor = registerColor("editor.stackFrameHighlightBackground", { dark: "#ffff0033", light: "#ffff6673", hcDark: "#ffff0033", hcLight: "#ffff6673" }, localize("topStackFrameLineHighlight", "Background color for the highlight of line at the top stack frame position."));
const focusedStackFrameColor = registerColor("editor.focusedStackFrameHighlightBackground", { dark: "#7abd7a4d", light: "#cee7ce73", hcDark: "#7abd7a4d", hcLight: "#cee7ce73" }, localize("focusedStackFrameLineHighlight", "Background color for the highlight of line at focused stack frame position."));
const stickiness = TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges;
const TOP_STACK_FRAME_MARGIN = {
  description: "top-stack-frame-margin",
  glyphMarginClassName: ThemeIcon.asClassName(debugStackframe),
  glyphMargin: { position: GlyphMarginLane.Right },
  zIndex: 9999,
  stickiness,
  overviewRuler: {
    position: OverviewRulerLane.Full,
    color: themeColorFromId(topStackFrameColor)
  }
};
const FOCUSED_STACK_FRAME_MARGIN = {
  description: "focused-stack-frame-margin",
  glyphMarginClassName: ThemeIcon.asClassName(debugStackframeFocused),
  glyphMargin: { position: GlyphMarginLane.Right },
  zIndex: 9999,
  stickiness,
  overviewRuler: {
    position: OverviewRulerLane.Full,
    color: themeColorFromId(focusedStackFrameColor)
  }
};
const TOP_STACK_FRAME_DECORATION = {
  description: "top-stack-frame-decoration",
  isWholeLine: true,
  className: "debug-top-stack-frame-line",
  stickiness
};
const FOCUSED_STACK_FRAME_DECORATION = {
  description: "focused-stack-frame-decoration",
  isWholeLine: true,
  className: "debug-focused-stack-frame-line",
  stickiness
};
const makeStackFrameColumnDecoration = /* @__PURE__ */ __name((noCharactersBefore) => ({
  description: "top-stack-frame-inline-decoration",
  before: {
    content: "\uEB8B",
    inlineClassName: noCharactersBefore ? "debug-top-stack-frame-column start-of-line" : "debug-top-stack-frame-column",
    inlineClassNameAffectsLetterSpacing: true
  }
}), "makeStackFrameColumnDecoration");
function createDecorationsForStackFrame(stackFrame, isFocusedSession, noCharactersBefore) {
  const result = [];
  const columnUntilEOLRange = new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, Constants.MAX_SAFE_SMALL_INTEGER);
  const range = new Range(stackFrame.range.startLineNumber, stackFrame.range.startColumn, stackFrame.range.startLineNumber, stackFrame.range.startColumn + 1);
  const topStackFrame = stackFrame.thread.getTopStackFrame();
  if (stackFrame.getId() === topStackFrame?.getId()) {
    if (isFocusedSession) {
      result.push({
        options: TOP_STACK_FRAME_MARGIN,
        range
      });
    }
    result.push({
      options: TOP_STACK_FRAME_DECORATION,
      range: columnUntilEOLRange
    });
    if (stackFrame.range.startColumn > 1) {
      result.push({
        options: makeStackFrameColumnDecoration(noCharactersBefore),
        range: columnUntilEOLRange
      });
    }
  } else {
    if (isFocusedSession) {
      result.push({
        options: FOCUSED_STACK_FRAME_MARGIN,
        range
      });
    }
    result.push({
      options: FOCUSED_STACK_FRAME_DECORATION,
      range: columnUntilEOLRange
    });
  }
  return result;
}
__name(createDecorationsForStackFrame, "createDecorationsForStackFrame");
let CallStackEditorContribution = class extends Disposable {
  constructor(editor, debugService, uriIdentityService, logService) {
    super();
    this.editor = editor;
    this.debugService = debugService;
    this.uriIdentityService = uriIdentityService;
    this.logService = logService;
    const setDecorations = /* @__PURE__ */ __name(() => this.decorations.set(this.createCallStackDecorations()), "setDecorations");
    this._register(Event.any(this.debugService.getViewModel().onDidFocusStackFrame, this.debugService.getModel().onDidChangeCallStack)(() => {
      setDecorations();
    }));
    this._register(this.editor.onDidChangeModel((e) => {
      if (e.newModelUrl) {
        setDecorations();
      }
    }));
    setDecorations();
  }
  static {
    __name(this, "CallStackEditorContribution");
  }
  decorations = this.editor.createDecorationsCollection();
  createCallStackDecorations() {
    const editor = this.editor;
    if (!editor.hasModel()) {
      return [];
    }
    const focusedStackFrame = this.debugService.getViewModel().focusedStackFrame;
    const decorations = [];
    this.debugService.getModel().getSessions().forEach((s) => {
      const isSessionFocused = s === focusedStackFrame?.thread.session;
      s.getAllThreads().forEach((t) => {
        if (t.stopped) {
          const callStack = t.getCallStack();
          const stackFrames = [];
          if (callStack.length > 0) {
            if (focusedStackFrame && !focusedStackFrame.equals(callStack[0])) {
              stackFrames.push(focusedStackFrame);
            }
            stackFrames.push(callStack[0]);
          }
          stackFrames.forEach((candidateStackFrame) => {
            if (candidateStackFrame && this.uriIdentityService.extUri.isEqual(candidateStackFrame.source.uri, editor.getModel()?.uri)) {
              if (candidateStackFrame.range.startLineNumber > editor.getModel()?.getLineCount() || candidateStackFrame.range.startLineNumber < 1) {
                this.logService.warn(`CallStackEditorContribution: invalid stack frame line number: ${candidateStackFrame.range.startLineNumber}`);
                return;
              }
              const noCharactersBefore = editor.getModel().getLineFirstNonWhitespaceColumn(candidateStackFrame.range.startLineNumber) >= candidateStackFrame.range.startColumn;
              decorations.push(...createDecorationsForStackFrame(candidateStackFrame, isSessionFocused, noCharactersBefore));
            }
          });
        }
      });
    });
    return distinct(decorations, (d) => `${d.options.className} ${d.options.glyphMarginClassName} ${d.range.startLineNumber} ${d.range.startColumn}`);
  }
  dispose() {
    super.dispose();
    this.decorations.clear();
  }
};
CallStackEditorContribution = __decorateClass([
  __decorateParam(1, IDebugService),
  __decorateParam(2, IUriIdentityService),
  __decorateParam(3, ILogService)
], CallStackEditorContribution);
export {
  CallStackEditorContribution,
  FOCUSED_STACK_FRAME_DECORATION,
  TOP_STACK_FRAME_DECORATION,
  createDecorationsForStackFrame,
  focusedStackFrameColor,
  makeStackFrameColumnDecoration,
  topStackFrameColor
};
//# sourceMappingURL=callStackEditorContribution.js.map
