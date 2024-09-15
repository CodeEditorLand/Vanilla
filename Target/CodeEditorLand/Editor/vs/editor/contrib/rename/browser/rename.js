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
import { alert } from "../../../../base/browser/ui/aria/aria.js";
import { raceCancellation } from "../../../../base/common/async.js";
import { CancellationToken, CancellationTokenSource } from "../../../../base/common/cancellation.js";
import { CancellationError, onUnexpectedError } from "../../../../base/common/errors.js";
import { isMarkdownString } from "../../../../base/common/htmlContent.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorAction, EditorCommand, EditorContributionInstantiation, ServicesAccessor, registerEditorAction, registerEditorCommand, registerEditorContribution, registerModelAndPositionCommand } from "../../../browser/editorExtensions.js";
import { IBulkEditService } from "../../../browser/services/bulkEditService.js";
import { ICodeEditorService } from "../../../browser/services/codeEditorService.js";
import { IPosition, Position } from "../../../common/core/position.js";
import { Range } from "../../../common/core/range.js";
import { IEditorContribution } from "../../../common/editorCommon.js";
import { EditorContextKeys } from "../../../common/editorContextKeys.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { NewSymbolNameTriggerKind, Rejection, RenameLocation, RenameProvider, WorkspaceEdit } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { ITextResourceConfigurationService } from "../../../common/services/textResourceConfiguration.js";
import { CodeEditorStateFlag, EditorStateCancellationTokenSource } from "../../editorState/browser/editorState.js";
import { MessageController } from "../../message/browser/messageController.js";
import * as nls from "../../../../nls.js";
import { Action2, registerAction2 } from "../../../../platform/actions/common/actions.js";
import { ConfigurationScope, Extensions, IConfigurationRegistry } from "../../../../platform/configuration/common/configurationRegistry.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { ILogService } from "../../../../platform/log/common/log.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import { CONTEXT_RENAME_INPUT_VISIBLE, NewNameSource, RenameWidget, RenameWidgetResult } from "./renameWidget.js";
class RenameSkeleton {
  constructor(model, position, registry) {
    this.model = model;
    this.position = position;
    this._providers = registry.ordered(model);
  }
  static {
    __name(this, "RenameSkeleton");
  }
  _providers;
  _providerRenameIdx = 0;
  hasProvider() {
    return this._providers.length > 0;
  }
  async resolveRenameLocation(token) {
    const rejects = [];
    for (this._providerRenameIdx = 0; this._providerRenameIdx < this._providers.length; this._providerRenameIdx++) {
      const provider = this._providers[this._providerRenameIdx];
      if (!provider.resolveRenameLocation) {
        break;
      }
      const res = await provider.resolveRenameLocation(this.model, this.position, token);
      if (!res) {
        continue;
      }
      if (res.rejectReason) {
        rejects.push(res.rejectReason);
        continue;
      }
      return res;
    }
    this._providerRenameIdx = 0;
    const word = this.model.getWordAtPosition(this.position);
    if (!word) {
      return {
        range: Range.fromPositions(this.position),
        text: "",
        rejectReason: rejects.length > 0 ? rejects.join("\n") : void 0
      };
    }
    return {
      range: new Range(this.position.lineNumber, word.startColumn, this.position.lineNumber, word.endColumn),
      text: word.word,
      rejectReason: rejects.length > 0 ? rejects.join("\n") : void 0
    };
  }
  async provideRenameEdits(newName, token) {
    return this._provideRenameEdits(newName, this._providerRenameIdx, [], token);
  }
  async _provideRenameEdits(newName, i, rejects, token) {
    const provider = this._providers[i];
    if (!provider) {
      return {
        edits: [],
        rejectReason: rejects.join("\n")
      };
    }
    const result = await provider.provideRenameEdits(this.model, this.position, newName, token);
    if (!result) {
      return this._provideRenameEdits(newName, i + 1, rejects.concat(nls.localize("no result", "No result.")), token);
    } else if (result.rejectReason) {
      return this._provideRenameEdits(newName, i + 1, rejects.concat(result.rejectReason), token);
    }
    return result;
  }
}
async function rename(registry, model, position, newName) {
  const skeleton = new RenameSkeleton(model, position, registry);
  const loc = await skeleton.resolveRenameLocation(CancellationToken.None);
  if (loc?.rejectReason) {
    return { edits: [], rejectReason: loc.rejectReason };
  }
  return skeleton.provideRenameEdits(newName, CancellationToken.None);
}
__name(rename, "rename");
let RenameController = class {
  constructor(editor, _instaService, _notificationService, _bulkEditService, _progressService, _logService, _configService, _languageFeaturesService, _telemetryService) {
    this.editor = editor;
    this._instaService = _instaService;
    this._notificationService = _notificationService;
    this._bulkEditService = _bulkEditService;
    this._progressService = _progressService;
    this._logService = _logService;
    this._configService = _configService;
    this._languageFeaturesService = _languageFeaturesService;
    this._telemetryService = _telemetryService;
    this._renameWidget = this._disposableStore.add(this._instaService.createInstance(RenameWidget, this.editor, ["acceptRenameInput", "acceptRenameInputWithPreview"]));
  }
  static {
    __name(this, "RenameController");
  }
  static ID = "editor.contrib.renameController";
  static get(editor) {
    return editor.getContribution(RenameController.ID);
  }
  _renameWidget;
  _disposableStore = new DisposableStore();
  _cts = new CancellationTokenSource();
  dispose() {
    this._disposableStore.dispose();
    this._cts.dispose(true);
  }
  async run() {
    const trace = this._logService.trace.bind(this._logService, "[rename]");
    this._cts.dispose(true);
    this._cts = new CancellationTokenSource();
    if (!this.editor.hasModel()) {
      trace("editor has no model");
      return void 0;
    }
    const position = this.editor.getPosition();
    const skeleton = new RenameSkeleton(this.editor.getModel(), position, this._languageFeaturesService.renameProvider);
    if (!skeleton.hasProvider()) {
      trace("skeleton has no provider");
      return void 0;
    }
    const cts1 = new EditorStateCancellationTokenSource(this.editor, CodeEditorStateFlag.Position | CodeEditorStateFlag.Value, void 0, this._cts.token);
    let loc;
    try {
      trace("resolving rename location");
      const resolveLocationOperation = skeleton.resolveRenameLocation(cts1.token);
      this._progressService.showWhile(resolveLocationOperation, 250);
      loc = await resolveLocationOperation;
      trace("resolved rename location");
    } catch (e) {
      if (e instanceof CancellationError) {
        trace("resolve rename location cancelled", JSON.stringify(e, null, "	"));
      } else {
        trace("resolve rename location failed", e instanceof Error ? e : JSON.stringify(e, null, "	"));
        if (typeof e === "string" || isMarkdownString(e)) {
          MessageController.get(this.editor)?.showMessage(e || nls.localize("resolveRenameLocationFailed", "An unknown error occurred while resolving rename location"), position);
        }
      }
      return void 0;
    } finally {
      cts1.dispose();
    }
    if (!loc) {
      trace("returning early - no loc");
      return void 0;
    }
    if (loc.rejectReason) {
      trace(`returning early - rejected with reason: ${loc.rejectReason}`, loc.rejectReason);
      MessageController.get(this.editor)?.showMessage(loc.rejectReason, position);
      return void 0;
    }
    if (cts1.token.isCancellationRequested) {
      trace("returning early - cts1 cancelled");
      return void 0;
    }
    const cts2 = new EditorStateCancellationTokenSource(this.editor, CodeEditorStateFlag.Position | CodeEditorStateFlag.Value, loc.range, this._cts.token);
    const model = this.editor.getModel();
    const newSymbolNamesProviders = this._languageFeaturesService.newSymbolNamesProvider.all(model);
    const resolvedNewSymbolnamesProviders = await Promise.all(newSymbolNamesProviders.map(async (p) => [p, await p.supportsAutomaticNewSymbolNamesTriggerKind ?? false]));
    const requestRenameSuggestions = /* @__PURE__ */ __name((triggerKind, cts) => {
      let providers = resolvedNewSymbolnamesProviders.slice();
      if (triggerKind === NewSymbolNameTriggerKind.Automatic) {
        providers = providers.filter(([_, supportsAutomatic]) => supportsAutomatic);
      }
      return providers.map(([p]) => p.provideNewSymbolNames(model, loc.range, triggerKind, cts));
    }, "requestRenameSuggestions");
    trace("creating rename input field and awaiting its result");
    const supportPreview = this._bulkEditService.hasPreviewHandler() && this._configService.getValue(this.editor.getModel().uri, "editor.rename.enablePreview");
    const inputFieldResult = await this._renameWidget.getInput(
      loc.range,
      loc.text,
      supportPreview,
      newSymbolNamesProviders.length > 0 ? requestRenameSuggestions : void 0,
      cts2
    );
    trace("received response from rename input field");
    if (newSymbolNamesProviders.length > 0) {
      this._reportTelemetry(newSymbolNamesProviders.length, model.getLanguageId(), inputFieldResult);
    }
    if (typeof inputFieldResult === "boolean") {
      trace(`returning early - rename input field response - ${inputFieldResult}`);
      if (inputFieldResult) {
        this.editor.focus();
      }
      cts2.dispose();
      return void 0;
    }
    this.editor.focus();
    trace("requesting rename edits");
    const renameOperation = raceCancellation(skeleton.provideRenameEdits(inputFieldResult.newName, cts2.token), cts2.token).then(async (renameResult) => {
      if (!renameResult) {
        trace("returning early - no rename edits result");
        return;
      }
      if (!this.editor.hasModel()) {
        trace("returning early - no model after rename edits are provided");
        return;
      }
      if (renameResult.rejectReason) {
        trace(`returning early - rejected with reason: ${renameResult.rejectReason}`);
        this._notificationService.info(renameResult.rejectReason);
        return;
      }
      this.editor.setSelection(Range.fromPositions(this.editor.getSelection().getPosition()));
      trace("applying edits");
      this._bulkEditService.apply(renameResult, {
        editor: this.editor,
        showPreview: inputFieldResult.wantsPreview,
        label: nls.localize("label", "Renaming '{0}' to '{1}'", loc?.text, inputFieldResult.newName),
        code: "undoredo.rename",
        quotableLabel: nls.localize("quotableLabel", "Renaming {0} to {1}", loc?.text, inputFieldResult.newName),
        respectAutoSaveConfig: true
      }).then((result) => {
        trace("edits applied");
        if (result.ariaSummary) {
          alert(nls.localize("aria", "Successfully renamed '{0}' to '{1}'. Summary: {2}", loc.text, inputFieldResult.newName, result.ariaSummary));
        }
      }).catch((err) => {
        trace(`error when applying edits ${JSON.stringify(err, null, "	")}`);
        this._notificationService.error(nls.localize("rename.failedApply", "Rename failed to apply edits"));
        this._logService.error(err);
      });
    }, (err) => {
      trace("error when providing rename edits", JSON.stringify(err, null, "	"));
      this._notificationService.error(nls.localize("rename.failed", "Rename failed to compute edits"));
      this._logService.error(err);
    }).finally(() => {
      cts2.dispose();
    });
    trace("returning rename operation");
    this._progressService.showWhile(renameOperation, 250);
    return renameOperation;
  }
  acceptRenameInput(wantsPreview) {
    this._renameWidget.acceptInput(wantsPreview);
  }
  cancelRenameInput() {
    this._renameWidget.cancelInput(true, "cancelRenameInput command");
  }
  focusNextRenameSuggestion() {
    this._renameWidget.focusNextRenameSuggestion();
  }
  focusPreviousRenameSuggestion() {
    this._renameWidget.focusPreviousRenameSuggestion();
  }
  _reportTelemetry(nRenameSuggestionProviders, languageId, inputFieldResult) {
    const value = typeof inputFieldResult === "boolean" ? {
      kind: "cancelled",
      languageId,
      nRenameSuggestionProviders
    } : {
      kind: "accepted",
      languageId,
      nRenameSuggestionProviders,
      source: inputFieldResult.stats.source.k,
      nRenameSuggestions: inputFieldResult.stats.nRenameSuggestions,
      timeBeforeFirstInputFieldEdit: inputFieldResult.stats.timeBeforeFirstInputFieldEdit,
      wantsPreview: inputFieldResult.wantsPreview,
      nRenameSuggestionsInvocations: inputFieldResult.stats.nRenameSuggestionsInvocations,
      hadAutomaticRenameSuggestionsInvocation: inputFieldResult.stats.hadAutomaticRenameSuggestionsInvocation
    };
    this._telemetryService.publicLog2("renameInvokedEvent", value);
  }
};
RenameController = __decorateClass([
  __decorateParam(1, IInstantiationService),
  __decorateParam(2, INotificationService),
  __decorateParam(3, IBulkEditService),
  __decorateParam(4, IEditorProgressService),
  __decorateParam(5, ILogService),
  __decorateParam(6, ITextResourceConfigurationService),
  __decorateParam(7, ILanguageFeaturesService),
  __decorateParam(8, ITelemetryService)
], RenameController);
class RenameAction extends EditorAction {
  static {
    __name(this, "RenameAction");
  }
  constructor() {
    super({
      id: "editor.action.rename",
      label: nls.localize("rename.label", "Rename Symbol"),
      alias: "Rename Symbol",
      precondition: ContextKeyExpr.and(EditorContextKeys.writable, EditorContextKeys.hasRenameProvider),
      kbOpts: {
        kbExpr: EditorContextKeys.editorTextFocus,
        primary: KeyCode.F2,
        weight: KeybindingWeight.EditorContrib
      },
      contextMenuOpts: {
        group: "1_modification",
        order: 1.1
      }
    });
  }
  runCommand(accessor, args) {
    const editorService = accessor.get(ICodeEditorService);
    const [uri, pos] = Array.isArray(args) && args || [void 0, void 0];
    if (URI.isUri(uri) && Position.isIPosition(pos)) {
      return editorService.openCodeEditor({ resource: uri }, editorService.getActiveCodeEditor()).then((editor) => {
        if (!editor) {
          return;
        }
        editor.setPosition(pos);
        editor.invokeWithinContext((accessor2) => {
          this.reportTelemetry(accessor2, editor);
          return this.run(accessor2, editor);
        });
      }, onUnexpectedError);
    }
    return super.runCommand(accessor, args);
  }
  run(accessor, editor) {
    const logService = accessor.get(ILogService);
    const controller = RenameController.get(editor);
    if (controller) {
      logService.trace("[RenameAction] got controller, running...");
      return controller.run();
    }
    logService.trace("[RenameAction] returning early - controller missing");
    return Promise.resolve();
  }
}
registerEditorContribution(RenameController.ID, RenameController, EditorContributionInstantiation.Lazy);
registerEditorAction(RenameAction);
const RenameCommand = EditorCommand.bindToContribution(RenameController.get);
registerEditorCommand(new RenameCommand({
  id: "acceptRenameInput",
  precondition: CONTEXT_RENAME_INPUT_VISIBLE,
  handler: /* @__PURE__ */ __name((x) => x.acceptRenameInput(false), "handler"),
  kbOpts: {
    weight: KeybindingWeight.EditorContrib + 99,
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, ContextKeyExpr.not("isComposing")),
    primary: KeyCode.Enter
  }
}));
registerEditorCommand(new RenameCommand({
  id: "acceptRenameInputWithPreview",
  precondition: ContextKeyExpr.and(CONTEXT_RENAME_INPUT_VISIBLE, ContextKeyExpr.has("config.editor.rename.enablePreview")),
  handler: /* @__PURE__ */ __name((x) => x.acceptRenameInput(true), "handler"),
  kbOpts: {
    weight: KeybindingWeight.EditorContrib + 99,
    kbExpr: ContextKeyExpr.and(EditorContextKeys.focus, ContextKeyExpr.not("isComposing")),
    primary: KeyMod.CtrlCmd + KeyCode.Enter
  }
}));
registerEditorCommand(new RenameCommand({
  id: "cancelRenameInput",
  precondition: CONTEXT_RENAME_INPUT_VISIBLE,
  handler: /* @__PURE__ */ __name((x) => x.cancelRenameInput(), "handler"),
  kbOpts: {
    weight: KeybindingWeight.EditorContrib + 99,
    kbExpr: EditorContextKeys.focus,
    primary: KeyCode.Escape,
    secondary: [KeyMod.Shift | KeyCode.Escape]
  }
}));
registerAction2(class FocusNextRenameSuggestion extends Action2 {
  static {
    __name(this, "FocusNextRenameSuggestion");
  }
  constructor() {
    super({
      id: "focusNextRenameSuggestion",
      title: {
        ...nls.localize2("focusNextRenameSuggestion", "Focus Next Rename Suggestion")
      },
      precondition: CONTEXT_RENAME_INPUT_VISIBLE,
      keybinding: [
        {
          primary: KeyCode.DownArrow,
          weight: KeybindingWeight.EditorContrib + 99
        }
      ]
    });
  }
  run(accessor) {
    const currentEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!currentEditor) {
      return;
    }
    const controller = RenameController.get(currentEditor);
    if (!controller) {
      return;
    }
    controller.focusNextRenameSuggestion();
  }
});
registerAction2(class FocusPreviousRenameSuggestion extends Action2 {
  static {
    __name(this, "FocusPreviousRenameSuggestion");
  }
  constructor() {
    super({
      id: "focusPreviousRenameSuggestion",
      title: {
        ...nls.localize2("focusPreviousRenameSuggestion", "Focus Previous Rename Suggestion")
      },
      precondition: CONTEXT_RENAME_INPUT_VISIBLE,
      keybinding: [
        {
          primary: KeyCode.UpArrow,
          weight: KeybindingWeight.EditorContrib + 99
        }
      ]
    });
  }
  run(accessor) {
    const currentEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
    if (!currentEditor) {
      return;
    }
    const controller = RenameController.get(currentEditor);
    if (!controller) {
      return;
    }
    controller.focusPreviousRenameSuggestion();
  }
});
registerModelAndPositionCommand("_executeDocumentRenameProvider", function(accessor, model, position, ...args) {
  const [newName] = args;
  assertType(typeof newName === "string");
  const { renameProvider } = accessor.get(ILanguageFeaturesService);
  return rename(renameProvider, model, position, newName);
});
registerModelAndPositionCommand("_executePrepareRename", async function(accessor, model, position) {
  const { renameProvider } = accessor.get(ILanguageFeaturesService);
  const skeleton = new RenameSkeleton(model, position, renameProvider);
  const loc = await skeleton.resolveRenameLocation(CancellationToken.None);
  if (loc?.rejectReason) {
    throw new Error(loc.rejectReason);
  }
  return loc;
});
Registry.as(Extensions.Configuration).registerConfiguration({
  id: "editor",
  properties: {
    "editor.rename.enablePreview": {
      scope: ConfigurationScope.LANGUAGE_OVERRIDABLE,
      description: nls.localize("enablePreview", "Enable/disable the ability to preview changes before renaming"),
      default: true,
      type: "boolean"
    }
  }
});
export {
  RenameAction,
  rename
};
//# sourceMappingURL=rename.js.map
