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
import { coalesce } from "../../../../../base/common/arrays.js";
import {
  MarkdownString
} from "../../../../../base/common/htmlContent.js";
import { Disposable } from "../../../../../base/common/lifecycle.js";
import { basename } from "../../../../../base/common/resources.js";
import { URI } from "../../../../../base/common/uri.js";
import { Range } from "../../../../../editor/common/core/range.js";
import { ITextModelService } from "../../../../../editor/common/services/resolverService.js";
import { localize } from "../../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../platform/commands/common/commands.js";
import { ILabelService } from "../../../../../platform/label/common/label.js";
import { ILogService } from "../../../../../platform/log/common/log.js";
import { IQuickInputService } from "../../../../../platform/quickinput/common/quickInput.js";
import {
  IChatVariablesService
} from "../../common/chatVariables.js";
import { ChatWidget } from "../chatWidget.js";
const dynamicVariableDecorationType = "chat-dynamic-variable";
let ChatDynamicVariableModel = class extends Disposable {
  constructor(widget, labelService) {
    super();
    this.widget = widget;
    this.labelService = labelService;
    this._register(widget.inputEditor.onDidChangeModelContent((e) => {
      e.changes.forEach((c) => {
        this._variables = coalesce(this._variables.map((ref) => {
          const intersection = Range.intersectRanges(ref.range, c.range);
          if (intersection && !intersection.isEmpty()) {
            if (!Range.containsRange(c.range, ref.range)) {
              const rangeToDelete = new Range(ref.range.startLineNumber, ref.range.startColumn, ref.range.endLineNumber, ref.range.endColumn - 1);
              this.widget.inputEditor.executeEdits(this.id, [{
                range: rangeToDelete,
                text: ""
              }]);
            }
            return null;
          } else if (Range.compareRangesUsingStarts(ref.range, c.range) > 0) {
            const delta = c.text.length - c.rangeLength;
            return {
              ...ref,
              range: {
                startLineNumber: ref.range.startLineNumber,
                startColumn: ref.range.startColumn + delta,
                endLineNumber: ref.range.endLineNumber,
                endColumn: ref.range.endColumn + delta
              }
            };
          }
          return ref;
        }));
      });
      this.updateDecorations();
    }));
  }
  static ID = "chatDynamicVariableModel";
  _variables = [];
  get variables() {
    return [...this._variables];
  }
  get id() {
    return ChatDynamicVariableModel.ID;
  }
  getInputState() {
    return this.variables;
  }
  setInputState(s) {
    if (!Array.isArray(s)) {
      s = [];
    }
    this._variables = s;
    this.updateDecorations();
  }
  addReference(ref) {
    this._variables.push(ref);
    this.updateDecorations();
  }
  updateDecorations() {
    this.widget.inputEditor.setDecorationsByType(
      "chat",
      dynamicVariableDecorationType,
      this._variables.map(
        (r) => ({
          range: r.range,
          hoverMessage: this.getHoverForReference(r)
        })
      )
    );
  }
  getHoverForReference(ref) {
    const value = ref.data;
    if (URI.isUri(value)) {
      return new MarkdownString(
        this.labelService.getUriLabel(value, { relative: true })
      );
    } else {
      return void 0;
    }
  }
};
ChatDynamicVariableModel = __decorateClass([
  __decorateParam(1, ILabelService)
], ChatDynamicVariableModel);
ChatWidget.CONTRIBS.push(ChatDynamicVariableModel);
function isSelectAndInsertFileActionContext(context) {
  return "widget" in context && "range" in context;
}
class SelectAndInsertFileAction extends Action2 {
  static Name = "files";
  static Item = {
    label: localize("allFiles", "All Files"),
    description: localize(
      "allFilesDescription",
      "Search for relevant files in the workspace and provide context from them"
    )
  };
  static ID = "workbench.action.chat.selectAndInsertFile";
  constructor() {
    super({
      id: SelectAndInsertFileAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const textModelService = accessor.get(ITextModelService);
    const logService = accessor.get(ILogService);
    const quickInputService = accessor.get(IQuickInputService);
    const chatVariablesService = accessor.get(IChatVariablesService);
    const context = args[0];
    if (!isSelectAndInsertFileActionContext(context)) {
      return;
    }
    const doCleanup = () => {
      context.widget.inputEditor.executeEdits("chatInsertFile", [
        { range: context.range, text: `` }
      ]);
    };
    let options;
    if (chatVariablesService.hasVariable(SelectAndInsertFileAction.Name)) {
      const providerOptions = {
        additionPicks: [
          SelectAndInsertFileAction.Item,
          { type: "separator" }
        ]
      };
      options = { providerOptions };
    }
    const picks = await quickInputService.quickAccess.pick("", options);
    if (!picks?.length) {
      logService.trace("SelectAndInsertFileAction: no file selected");
      doCleanup();
      return;
    }
    const editor = context.widget.inputEditor;
    const range = context.range;
    if (picks[0] === SelectAndInsertFileAction.Item) {
      const text2 = `#${SelectAndInsertFileAction.Name}`;
      const success2 = editor.executeEdits("chatInsertFile", [
        { range, text: text2 + " " }
      ]);
      if (!success2) {
        logService.trace(
          `SelectAndInsertFileAction: failed to insert "${text2}"`
        );
        doCleanup();
      }
      return;
    }
    const resource = picks[0].resource;
    if (!textModelService.canHandleResource(resource)) {
      logService.trace(
        "SelectAndInsertFileAction: non-text resource selected"
      );
      doCleanup();
      return;
    }
    const fileName = basename(resource);
    const text = `#file:${fileName}`;
    const success = editor.executeEdits("chatInsertFile", [
      { range, text: text + " " }
    ]);
    if (!success) {
      logService.trace(
        `SelectAndInsertFileAction: failed to insert "${text}"`
      );
      doCleanup();
      return;
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: "vscode.file",
      range: {
        startLineNumber: range.startLineNumber,
        startColumn: range.startColumn,
        endLineNumber: range.endLineNumber,
        endColumn: range.startColumn + text.length
      },
      data: resource
    });
  }
}
registerAction2(SelectAndInsertFileAction);
function isAddDynamicVariableContext(context) {
  return "widget" in context && "range" in context && "variableData" in context;
}
class AddDynamicVariableAction extends Action2 {
  static ID = "workbench.action.chat.addDynamicVariable";
  constructor() {
    super({
      id: AddDynamicVariableAction.ID,
      title: ""
      // not displayed
    });
  }
  async run(accessor, ...args) {
    const context = args[0];
    if (!isAddDynamicVariableContext(context)) {
      return;
    }
    let range = context.range;
    const variableData = context.variableData;
    const doCleanup = () => {
      context.widget.inputEditor.executeEdits(
        "chatInsertDynamicVariableWithArguments",
        [{ range: context.range, text: `` }]
      );
    };
    if (context.command) {
      const commandService = accessor.get(ICommandService);
      const selection = await commandService.executeCommand(
        context.command.id,
        ...context.command.arguments ?? []
      );
      if (!selection) {
        doCleanup();
        return;
      }
      const insertText = ":" + selection;
      const insertRange = new Range(
        range.startLineNumber,
        range.endColumn,
        range.endLineNumber,
        range.endColumn + insertText.length
      );
      range = new Range(
        range.startLineNumber,
        range.startColumn,
        range.endLineNumber,
        range.endColumn + insertText.length
      );
      const editor = context.widget.inputEditor;
      const success = editor.executeEdits(
        "chatInsertDynamicVariableWithArguments",
        [{ range: insertRange, text: insertText + " " }]
      );
      if (!success) {
        doCleanup();
        return;
      }
    }
    context.widget.getContrib(ChatDynamicVariableModel.ID)?.addReference({
      id: context.id,
      range,
      data: variableData
    });
  }
}
registerAction2(AddDynamicVariableAction);
export {
  AddDynamicVariableAction,
  ChatDynamicVariableModel,
  SelectAndInsertFileAction,
  dynamicVariableDecorationType
};
