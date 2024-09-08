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
  CancellationTokenSource
} from "../../../../base/common/cancellation.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import * as strings from "../../../../base/common/strings.js";
import {
  isCodeEditor
} from "../../../../editor/browser/editorBrowser.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import { trimTrailingWhitespace } from "../../../../editor/common/commands/trimTrailingWhitespaceCommand.js";
import { EditOperation } from "../../../../editor/common/core/editOperation.js";
import { Position } from "../../../../editor/common/core/position.js";
import { Range } from "../../../../editor/common/core/range.js";
import {
  CodeActionTriggerType
} from "../../../../editor/common/languages.js";
import { ILanguageFeaturesService } from "../../../../editor/common/services/languageFeatures.js";
import {
  ApplyCodeActionReason,
  applyCodeAction,
  getCodeActions
} from "../../../../editor/contrib/codeAction/browser/codeAction.js";
import {
  CodeActionKind,
  CodeActionTriggerSource
} from "../../../../editor/contrib/codeAction/common/types.js";
import {
  FormattingMode,
  formatDocumentRangesWithSelectedProvider,
  formatDocumentWithSelectedProvider
} from "../../../../editor/contrib/format/browser/format.js";
import { SnippetController2 } from "../../../../editor/contrib/snippet/browser/snippetController2.js";
import { localize } from "../../../../nls.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import {
  Progress
} from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  Extensions as WorkbenchContributionsExtensions
} from "../../../common/contributions.js";
import { SaveReason } from "../../../common/editor.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IHostService } from "../../../services/host/browser/host.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  ITextFileService
} from "../../../services/textfile/common/textfiles.js";
import { getModifiedRanges } from "../../format/browser/formatModified.js";
let TrimWhitespaceParticipant = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context) {
    if (!model.textEditorModel) {
      return;
    }
    const trimTrailingWhitespaceOption = this.configurationService.getValue(
      "files.trimTrailingWhitespace",
      {
        overrideIdentifier: model.textEditorModel.getLanguageId(),
        resource: model.resource
      }
    );
    const trimInRegexAndStrings = this.configurationService.getValue(
      "files.trimTrailingWhitespaceInRegexAndStrings",
      {
        overrideIdentifier: model.textEditorModel.getLanguageId(),
        resource: model.resource
      }
    );
    if (trimTrailingWhitespaceOption) {
      this.doTrimTrailingWhitespace(
        model.textEditorModel,
        context.reason === SaveReason.AUTO,
        trimInRegexAndStrings
      );
    }
  }
  doTrimTrailingWhitespace(model, isAutoSaved, trimInRegexesAndStrings) {
    let prevSelection = [];
    let cursors = [];
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      prevSelection = editor.getSelections();
      if (isAutoSaved) {
        cursors = prevSelection.map((s) => s.getPosition());
        const snippetsRange = SnippetController2.get(editor)?.getSessionEnclosingRange();
        if (snippetsRange) {
          for (let lineNumber = snippetsRange.startLineNumber; lineNumber <= snippetsRange.endLineNumber; lineNumber++) {
            cursors.push(
              new Position(
                lineNumber,
                model.getLineMaxColumn(lineNumber)
              )
            );
          }
        }
      }
    }
    const ops = trimTrailingWhitespace(
      model,
      cursors,
      trimInRegexesAndStrings
    );
    if (!ops.length) {
      return;
    }
    model.pushEditOperations(prevSelection, ops, (_edits) => prevSelection);
  }
};
TrimWhitespaceParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], TrimWhitespaceParticipant);
function findEditor(model, codeEditorService) {
  let candidate = null;
  if (model.isAttachedToEditor()) {
    for (const editor of codeEditorService.listCodeEditors()) {
      if (editor.hasModel() && editor.getModel() === model) {
        if (editor.hasTextFocus()) {
          return editor;
        }
        candidate = editor;
      }
    }
  }
  return candidate;
}
let FinalNewLineParticipant = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context) {
    if (!model.textEditorModel) {
      return;
    }
    if (this.configurationService.getValue("files.insertFinalNewline", {
      overrideIdentifier: model.textEditorModel.getLanguageId(),
      resource: model.resource
    })) {
      this.doInsertFinalNewLine(model.textEditorModel);
    }
  }
  doInsertFinalNewLine(model) {
    const lineCount = model.getLineCount();
    const lastLine = model.getLineContent(lineCount);
    const lastLineIsEmptyOrWhitespace = strings.lastNonWhitespaceIndex(lastLine) === -1;
    if (!lineCount || lastLineIsEmptyOrWhitespace) {
      return;
    }
    const edits = [
      EditOperation.insert(
        new Position(lineCount, model.getLineMaxColumn(lineCount)),
        model.getEOL()
      )
    ];
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      editor.executeEdits(
        "insertFinalNewLine",
        edits,
        editor.getSelections()
      );
    } else {
      model.pushEditOperations([], edits, () => null);
    }
  }
};
FinalNewLineParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], FinalNewLineParticipant);
let TrimFinalNewLinesParticipant = class {
  constructor(configurationService, codeEditorService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
  }
  async participate(model, context) {
    if (!model.textEditorModel) {
      return;
    }
    if (this.configurationService.getValue("files.trimFinalNewlines", {
      overrideIdentifier: model.textEditorModel.getLanguageId(),
      resource: model.resource
    })) {
      this.doTrimFinalNewLines(
        model.textEditorModel,
        context.reason === SaveReason.AUTO
      );
    }
  }
  /**
   * returns 0 if the entire file is empty
   */
  findLastNonEmptyLine(model) {
    for (let lineNumber = model.getLineCount(); lineNumber >= 1; lineNumber--) {
      const lineLength = model.getLineLength(lineNumber);
      if (lineLength > 0) {
        return lineNumber;
      }
    }
    return 0;
  }
  doTrimFinalNewLines(model, isAutoSaved) {
    const lineCount = model.getLineCount();
    if (lineCount === 1) {
      return;
    }
    let prevSelection = [];
    let cannotTouchLineNumber = 0;
    const editor = findEditor(model, this.codeEditorService);
    if (editor) {
      prevSelection = editor.getSelections();
      if (isAutoSaved) {
        for (let i = 0, len = prevSelection.length; i < len; i++) {
          const positionLineNumber = prevSelection[i].positionLineNumber;
          if (positionLineNumber > cannotTouchLineNumber) {
            cannotTouchLineNumber = positionLineNumber;
          }
        }
      }
    }
    const lastNonEmptyLine = this.findLastNonEmptyLine(model);
    const deleteFromLineNumber = Math.max(
      lastNonEmptyLine + 1,
      cannotTouchLineNumber + 1
    );
    const deletionRange = model.validateRange(
      new Range(
        deleteFromLineNumber,
        1,
        lineCount,
        model.getLineMaxColumn(lineCount)
      )
    );
    if (deletionRange.isEmpty()) {
      return;
    }
    model.pushEditOperations(
      prevSelection,
      [EditOperation.delete(deletionRange)],
      (_edits) => prevSelection
    );
    editor?.setSelections(prevSelection);
  }
};
TrimFinalNewLinesParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService)
], TrimFinalNewLinesParticipant);
let FormatOnSaveParticipant = class {
  constructor(configurationService, codeEditorService, instantiationService) {
    this.configurationService = configurationService;
    this.codeEditorService = codeEditorService;
    this.instantiationService = instantiationService;
  }
  async participate(model, context, progress, token) {
    if (!model.textEditorModel) {
      return;
    }
    if (context.reason === SaveReason.AUTO) {
      return void 0;
    }
    const textEditorModel = model.textEditorModel;
    const overrides = {
      overrideIdentifier: textEditorModel.getLanguageId(),
      resource: textEditorModel.uri
    };
    const nestedProgress = new Progress((provider) => {
      progress.report({
        message: localize(
          {
            key: "formatting2",
            comment: [
              "[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}"
            ]
          },
          "Running '{0}' Formatter ([configure]({1})).",
          provider.displayName || provider.extensionId && provider.extensionId.value || "???",
          "command:workbench.action.openSettings?%5B%22editor.formatOnSave%22%5D"
        )
      });
    });
    const enabled = this.configurationService.getValue(
      "editor.formatOnSave",
      overrides
    );
    if (!enabled) {
      return void 0;
    }
    const editorOrModel = findEditor(textEditorModel, this.codeEditorService) || textEditorModel;
    const mode = this.configurationService.getValue("editor.formatOnSaveMode", overrides);
    if (mode === "file") {
      await this.instantiationService.invokeFunction(
        formatDocumentWithSelectedProvider,
        editorOrModel,
        FormattingMode.Silent,
        nestedProgress,
        token
      );
    } else {
      const ranges = await this.instantiationService.invokeFunction(
        getModifiedRanges,
        isCodeEditor(editorOrModel) ? editorOrModel.getModel() : editorOrModel
      );
      if (ranges === null && mode === "modificationsIfAvailable") {
        await this.instantiationService.invokeFunction(
          formatDocumentWithSelectedProvider,
          editorOrModel,
          FormattingMode.Silent,
          nestedProgress,
          token
        );
      } else if (ranges) {
        await this.instantiationService.invokeFunction(
          formatDocumentRangesWithSelectedProvider,
          editorOrModel,
          ranges,
          FormattingMode.Silent,
          nestedProgress,
          token,
          false
        );
      }
    }
  }
};
FormatOnSaveParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, ICodeEditorService),
  __decorateParam(2, IInstantiationService)
], FormatOnSaveParticipant);
let CodeActionOnSaveParticipant = class extends Disposable {
  constructor(configurationService, instantiationService, languageFeaturesService, hostService, editorService, codeEditorService, telemetryService) {
    super();
    this.configurationService = configurationService;
    this.instantiationService = instantiationService;
    this.languageFeaturesService = languageFeaturesService;
    this.hostService = hostService;
    this.editorService = editorService;
    this.codeEditorService = codeEditorService;
    this.telemetryService = telemetryService;
    this._register(this.hostService.onDidChangeFocus(() => {
      this.triggerCodeActionsCommand();
    }));
    this._register(this.editorService.onDidActiveEditorChange(() => {
      this.triggerCodeActionsCommand();
    }));
  }
  async triggerCodeActionsCommand() {
    if (this.configurationService.getValue(
      "editor.codeActions.triggerOnFocusChange"
    ) && this.configurationService.getValue("files.autoSave") === "afterDelay") {
      const model = this.codeEditorService.getActiveCodeEditor()?.getModel();
      if (!model) {
        return void 0;
      }
      const settingsOverrides = {
        overrideIdentifier: model.getLanguageId(),
        resource: model.uri
      };
      const setting = this.configurationService.getValue("editor.codeActionsOnSave", settingsOverrides);
      if (!setting) {
        return void 0;
      }
      if (Array.isArray(setting)) {
        return void 0;
      }
      const settingItems = Object.keys(setting).filter(
        (x) => setting[x] && setting[x] === "always" && CodeActionKind.Source.contains(new HierarchicalKind(x))
      );
      const cancellationTokenSource = new CancellationTokenSource();
      const codeActionKindList = [];
      for (const item of settingItems) {
        codeActionKindList.push(new HierarchicalKind(item));
      }
      await this.applyOnSaveActions(
        model,
        codeActionKindList,
        [],
        Progress.None,
        cancellationTokenSource.token
      );
    }
  }
  async participate(model, context, progress, token) {
    if (!model.textEditorModel) {
      return;
    }
    const textEditorModel = model.textEditorModel;
    const settingsOverrides = {
      overrideIdentifier: textEditorModel.getLanguageId(),
      resource: textEditorModel.uri
    };
    const setting = this.configurationService.getValue("editor.codeActionsOnSave", settingsOverrides);
    if (!setting) {
      return void 0;
    }
    if (context.reason === SaveReason.AUTO) {
      return void 0;
    }
    if (context.reason !== SaveReason.EXPLICIT && Array.isArray(setting)) {
      return void 0;
    }
    const settingItems = Array.isArray(setting) ? setting : Object.keys(setting).filter(
      (x) => setting[x] && setting[x] !== "never"
    );
    const codeActionsOnSave = this.createCodeActionsOnSave(settingItems);
    if (!Array.isArray(setting)) {
      codeActionsOnSave.sort((a, b) => {
        if (CodeActionKind.SourceFixAll.contains(a)) {
          if (CodeActionKind.SourceFixAll.contains(b)) {
            return 0;
          }
          return -1;
        }
        if (CodeActionKind.SourceFixAll.contains(b)) {
          return 1;
        }
        return 0;
      });
    }
    if (!codeActionsOnSave.length) {
      return void 0;
    }
    const excludedActions = Array.isArray(setting) ? [] : Object.keys(setting).filter((x) => setting[x] === "never" || false).map((x) => new HierarchicalKind(x));
    progress.report({ message: localize("codeaction", "Quick Fixes") });
    const filteredSaveList = Array.isArray(setting) ? codeActionsOnSave : codeActionsOnSave.filter(
      (x) => setting[x.value] === "always" || (setting[x.value] === "explicit" || setting[x.value] === true) && context.reason === SaveReason.EXPLICIT
    );
    await this.applyOnSaveActions(
      textEditorModel,
      filteredSaveList,
      excludedActions,
      progress,
      token
    );
  }
  createCodeActionsOnSave(settingItems) {
    const kinds = settingItems.map((x) => new HierarchicalKind(x));
    return kinds.filter((kind) => {
      return kinds.every(
        (otherKind) => otherKind.equals(kind) || !otherKind.contains(kind)
      );
    });
  }
  async applyOnSaveActions(model, codeActionsOnSave, excludes, progress, token) {
    const getActionProgress = new class {
      _names = /* @__PURE__ */ new Set();
      _report() {
        progress.report({
          message: localize(
            {
              key: "codeaction.get2",
              comment: [
                "[configure]({1}) is a link. Only translate `configure`. Do not change brackets and parentheses or {1}"
              ]
            },
            "Getting code actions from '{0}' ([configure]({1})).",
            [...this._names].map((name) => `'${name}'`).join(", "),
            "command:workbench.action.openSettings?%5B%22editor.codeActionsOnSave%22%5D"
          )
        });
      }
      report(provider) {
        if (provider.displayName && !this._names.has(provider.displayName)) {
          this._names.add(provider.displayName);
          this._report();
        }
      }
    }();
    for (const codeActionKind of codeActionsOnSave) {
      const sw = new StopWatch();
      const actionsToRun = await this.getActionsToRun(
        model,
        codeActionKind,
        excludes,
        getActionProgress,
        token
      );
      this.telemetryService.publicLog2("codeAction.appliedOnSave", {
        codeAction: codeActionKind.value,
        duration: sw.elapsed()
      });
      if (token.isCancellationRequested) {
        actionsToRun.dispose();
        return;
      }
      try {
        for (const action of actionsToRun.validActions) {
          progress.report({
            message: localize(
              "codeAction.apply",
              "Applying code action '{0}'.",
              action.action.title
            )
          });
          await this.instantiationService.invokeFunction(
            applyCodeAction,
            action,
            ApplyCodeActionReason.OnSave,
            {},
            token
          );
          if (token.isCancellationRequested) {
            return;
          }
        }
      } catch {
      } finally {
        actionsToRun.dispose();
      }
    }
  }
  getActionsToRun(model, codeActionKind, excludes, progress, token) {
    return getCodeActions(
      this.languageFeaturesService.codeActionProvider,
      model,
      model.getFullModelRange(),
      {
        type: CodeActionTriggerType.Auto,
        triggerAction: CodeActionTriggerSource.OnSave,
        filter: {
          include: codeActionKind,
          excludes,
          includeSourceActions: true
        }
      },
      progress,
      token
    );
  }
};
CodeActionOnSaveParticipant = __decorateClass([
  __decorateParam(0, IConfigurationService),
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, ILanguageFeaturesService),
  __decorateParam(3, IHostService),
  __decorateParam(4, IEditorService),
  __decorateParam(5, ICodeEditorService),
  __decorateParam(6, ITelemetryService)
], CodeActionOnSaveParticipant);
let SaveParticipantsContribution = class extends Disposable {
  constructor(instantiationService, textFileService) {
    super();
    this.instantiationService = instantiationService;
    this.textFileService = textFileService;
    this.registerSaveParticipants();
  }
  registerSaveParticipants() {
    this._register(
      this.textFileService.files.addSaveParticipant(
        this.instantiationService.createInstance(
          TrimWhitespaceParticipant
        )
      )
    );
    this._register(
      this.textFileService.files.addSaveParticipant(
        this.instantiationService.createInstance(
          CodeActionOnSaveParticipant
        )
      )
    );
    this._register(
      this.textFileService.files.addSaveParticipant(
        this.instantiationService.createInstance(
          FormatOnSaveParticipant
        )
      )
    );
    this._register(
      this.textFileService.files.addSaveParticipant(
        this.instantiationService.createInstance(
          FinalNewLineParticipant
        )
      )
    );
    this._register(
      this.textFileService.files.addSaveParticipant(
        this.instantiationService.createInstance(
          TrimFinalNewLinesParticipant
        )
      )
    );
  }
};
SaveParticipantsContribution = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, ITextFileService)
], SaveParticipantsContribution);
const workbenchContributionsRegistry = Registry.as(
  WorkbenchContributionsExtensions.Workbench
);
workbenchContributionsRegistry.registerWorkbenchContribution(
  SaveParticipantsContribution,
  LifecyclePhase.Restored
);
export {
  FinalNewLineParticipant,
  SaveParticipantsContribution,
  TrimFinalNewLinesParticipant,
  TrimWhitespaceParticipant
};
