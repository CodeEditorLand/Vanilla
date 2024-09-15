var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { CancelablePromise, createCancelablePromise, TimeoutTimer } from "../../../../base/common/async.js";
import { isCancellationError } from "../../../../base/common/errors.js";
import { Emitter } from "../../../../base/common/event.js";
import { Disposable, MutableDisposable } from "../../../../base/common/lifecycle.js";
import { isEqual } from "../../../../base/common/resources.js";
import { URI } from "../../../../base/common/uri.js";
import { ICodeEditor } from "../../../browser/editorBrowser.js";
import { EditorOption, ShowLightbulbIconMode } from "../../../common/config/editorOptions.js";
import { Position } from "../../../common/core/position.js";
import { Selection } from "../../../common/core/selection.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { CodeActionProvider, CodeActionTriggerType } from "../../../common/languages.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKey, IContextKeyService, RawContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { IEditorProgressService, Progress } from "../../../../platform/progress/common/progress.js";
import { CodeActionKind, CodeActionSet, CodeActionTrigger, CodeActionTriggerSource } from "../common/types.js";
import { getCodeActions } from "./codeAction.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { StopWatch } from "../../../../base/common/stopwatch.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
const SUPPORTED_CODE_ACTIONS = new RawContextKey("supportedCodeAction", "");
const APPLY_FIX_ALL_COMMAND_ID = "_typescript.applyFixAllCodeAction";
class CodeActionOracle extends Disposable {
  constructor(_editor, _markerService, _signalChange, _delay = 250) {
    super();
    this._editor = _editor;
    this._markerService = _markerService;
    this._signalChange = _signalChange;
    this._delay = _delay;
    this._register(this._markerService.onMarkerChanged((e) => this._onMarkerChanges(e)));
    this._register(this._editor.onDidChangeCursorPosition(() => this._tryAutoTrigger()));
  }
  static {
    __name(this, "CodeActionOracle");
  }
  _autoTriggerTimer = this._register(new TimeoutTimer());
  trigger(trigger) {
    const selection = this._getRangeOfSelectionUnlessWhitespaceEnclosed(trigger);
    this._signalChange(selection ? { trigger, selection } : void 0);
  }
  _onMarkerChanges(resources) {
    const model = this._editor.getModel();
    if (model && resources.some((resource) => isEqual(resource, model.uri))) {
      this._tryAutoTrigger();
    }
  }
  _tryAutoTrigger() {
    this._autoTriggerTimer.cancelAndSet(() => {
      this.trigger({ type: CodeActionTriggerType.Auto, triggerAction: CodeActionTriggerSource.Default });
    }, this._delay);
  }
  _getRangeOfSelectionUnlessWhitespaceEnclosed(trigger) {
    if (!this._editor.hasModel()) {
      return void 0;
    }
    const selection = this._editor.getSelection();
    if (trigger.type === CodeActionTriggerType.Invoke) {
      return selection;
    }
    const enabled = this._editor.getOption(EditorOption.lightbulb).enabled;
    if (enabled === ShowLightbulbIconMode.Off) {
      return void 0;
    } else if (enabled === ShowLightbulbIconMode.On) {
      return selection;
    } else if (enabled === ShowLightbulbIconMode.OnCode) {
      const isSelectionEmpty = selection.isEmpty();
      if (!isSelectionEmpty) {
        return selection;
      }
      const model = this._editor.getModel();
      const { lineNumber, column } = selection.getPosition();
      const line = model.getLineContent(lineNumber);
      if (line.length === 0) {
        return void 0;
      } else if (column === 1) {
        if (/\s/.test(line[0])) {
          return void 0;
        }
      } else if (column === model.getLineMaxColumn(lineNumber)) {
        if (/\s/.test(line[line.length - 1])) {
          return void 0;
        }
      } else {
        if (/\s/.test(line[column - 2]) && /\s/.test(line[column - 1])) {
          return void 0;
        }
      }
    }
    return selection;
  }
}
var CodeActionsState;
((CodeActionsState2) => {
  let Type;
  ((Type2) => {
    Type2[Type2["Empty"] = 0] = "Empty";
    Type2[Type2["Triggered"] = 1] = "Triggered";
  })(Type = CodeActionsState2.Type || (CodeActionsState2.Type = {}));
  CodeActionsState2.Empty = { type: 0 /* Empty */ };
  class Triggered {
    constructor(trigger, position, _cancellablePromise) {
      this.trigger = trigger;
      this.position = position;
      this._cancellablePromise = _cancellablePromise;
      this.actions = _cancellablePromise.catch((e) => {
        if (isCancellationError(e)) {
          return emptyCodeActionSet;
        }
        throw e;
      });
    }
    static {
      __name(this, "Triggered");
    }
    type = 1 /* Triggered */;
    actions;
    cancel() {
      this._cancellablePromise.cancel();
    }
  }
  CodeActionsState2.Triggered = Triggered;
})(CodeActionsState || (CodeActionsState = {}));
const emptyCodeActionSet = Object.freeze({
  allActions: [],
  validActions: [],
  dispose: /* @__PURE__ */ __name(() => {
  }, "dispose"),
  documentation: [],
  hasAutoFix: false,
  hasAIFix: false,
  allAIFixes: false
});
class CodeActionModel extends Disposable {
  constructor(_editor, _registry, _markerService, contextKeyService, _progressService, _configurationService, _telemetryService) {
    super();
    this._editor = _editor;
    this._registry = _registry;
    this._markerService = _markerService;
    this._progressService = _progressService;
    this._configurationService = _configurationService;
    this._telemetryService = _telemetryService;
    this._supportedCodeActions = SUPPORTED_CODE_ACTIONS.bindTo(contextKeyService);
    this._register(this._editor.onDidChangeModel(() => this._update()));
    this._register(this._editor.onDidChangeModelLanguage(() => this._update()));
    this._register(this._registry.onDidChange(() => this._update()));
    this._register(this._editor.onDidChangeConfiguration((e) => {
      if (e.hasChanged(EditorOption.lightbulb)) {
        this._update();
      }
    }));
    this._update();
  }
  static {
    __name(this, "CodeActionModel");
  }
  _codeActionOracle = this._register(new MutableDisposable());
  _state = CodeActionsState.Empty;
  _supportedCodeActions;
  _onDidChangeState = this._register(new Emitter());
  onDidChangeState = this._onDidChangeState.event;
  _disposed = false;
  dispose() {
    if (this._disposed) {
      return;
    }
    this._disposed = true;
    super.dispose();
    this.setState(CodeActionsState.Empty, true);
  }
  _settingEnabledNearbyQuickfixes() {
    const model = this._editor?.getModel();
    return this._configurationService ? this._configurationService.getValue("editor.codeActionWidget.includeNearbyQuickFixes", { resource: model?.uri }) : false;
  }
  _update() {
    if (this._disposed) {
      return;
    }
    this._codeActionOracle.value = void 0;
    this.setState(CodeActionsState.Empty);
    const model = this._editor.getModel();
    if (model && this._registry.has(model) && !this._editor.getOption(EditorOption.readOnly)) {
      const supportedActions = this._registry.all(model).flatMap((provider) => provider.providedCodeActionKinds ?? []);
      this._supportedCodeActions.set(supportedActions.join(" "));
      this._codeActionOracle.value = new CodeActionOracle(this._editor, this._markerService, (trigger) => {
        if (!trigger) {
          this.setState(CodeActionsState.Empty);
          return;
        }
        const startPosition = trigger.selection.getStartPosition();
        const actions = createCancelablePromise(async (token) => {
          if (this._settingEnabledNearbyQuickfixes() && trigger.trigger.type === CodeActionTriggerType.Invoke && (trigger.trigger.triggerAction === CodeActionTriggerSource.QuickFix || trigger.trigger.filter?.include?.contains(CodeActionKind.QuickFix))) {
            const codeActionSet = await getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token);
            const allCodeActions = [...codeActionSet.allActions];
            if (token.isCancellationRequested) {
              return emptyCodeActionSet;
            }
            const foundQuickfix = codeActionSet.validActions?.some((action) => action.action.kind ? CodeActionKind.QuickFix.contains(new HierarchicalKind(action.action.kind)) : false);
            const allMarkers = this._markerService.read({ resource: model.uri });
            if (foundQuickfix) {
              for (const action of codeActionSet.validActions) {
                if (action.action.command?.arguments?.some((arg) => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                  action.action.diagnostics = [...allMarkers.filter((marker) => marker.relatedInformation)];
                }
              }
              return { validActions: codeActionSet.validActions, allActions: allCodeActions, documentation: codeActionSet.documentation, hasAutoFix: codeActionSet.hasAutoFix, hasAIFix: codeActionSet.hasAIFix, allAIFixes: codeActionSet.allAIFixes, dispose: /* @__PURE__ */ __name(() => {
                codeActionSet.dispose();
              }, "dispose") };
            } else if (!foundQuickfix) {
              if (allMarkers.length > 0) {
                const currPosition = trigger.selection.getPosition();
                let trackedPosition = currPosition;
                let distance = Number.MAX_VALUE;
                const currentActions = [...codeActionSet.validActions];
                for (const marker of allMarkers) {
                  const col = marker.endColumn;
                  const row = marker.endLineNumber;
                  const startRow = marker.startLineNumber;
                  if (row === currPosition.lineNumber || startRow === currPosition.lineNumber) {
                    trackedPosition = new Position(row, col);
                    const newCodeActionTrigger = {
                      type: trigger.trigger.type,
                      triggerAction: trigger.trigger.triggerAction,
                      filter: { include: trigger.trigger.filter?.include ? trigger.trigger.filter?.include : CodeActionKind.QuickFix },
                      autoApply: trigger.trigger.autoApply,
                      context: { notAvailableMessage: trigger.trigger.context?.notAvailableMessage || "", position: trackedPosition }
                    };
                    const selectionAsPosition = new Selection(trackedPosition.lineNumber, trackedPosition.column, trackedPosition.lineNumber, trackedPosition.column);
                    const actionsAtMarker = await getCodeActions(this._registry, model, selectionAsPosition, newCodeActionTrigger, Progress.None, token);
                    if (actionsAtMarker.validActions.length !== 0) {
                      for (const action of actionsAtMarker.validActions) {
                        if (action.action.command?.arguments?.some((arg) => typeof arg === "string" && arg.includes(APPLY_FIX_ALL_COMMAND_ID))) {
                          action.action.diagnostics = [...allMarkers.filter((marker2) => marker2.relatedInformation)];
                        }
                      }
                      if (codeActionSet.allActions.length === 0) {
                        allCodeActions.push(...actionsAtMarker.allActions);
                      }
                      if (Math.abs(currPosition.column - col) < distance) {
                        currentActions.unshift(...actionsAtMarker.validActions);
                      } else {
                        currentActions.push(...actionsAtMarker.validActions);
                      }
                    }
                    distance = Math.abs(currPosition.column - col);
                  }
                }
                const filteredActions = currentActions.filter((action, index, self) => self.findIndex((a) => a.action.title === action.action.title) === index);
                filteredActions.sort((a, b) => {
                  if (a.action.isPreferred && !b.action.isPreferred) {
                    return -1;
                  } else if (!a.action.isPreferred && b.action.isPreferred) {
                    return 1;
                  } else if (a.action.isAI && !b.action.isAI) {
                    return 1;
                  } else if (!a.action.isAI && b.action.isAI) {
                    return -1;
                  } else {
                    return 0;
                  }
                });
                return { validActions: filteredActions, allActions: allCodeActions, documentation: codeActionSet.documentation, hasAutoFix: codeActionSet.hasAutoFix, hasAIFix: codeActionSet.hasAIFix, allAIFixes: codeActionSet.allAIFixes, dispose: /* @__PURE__ */ __name(() => {
                  codeActionSet.dispose();
                }, "dispose") };
              }
            }
          }
          if (trigger.trigger.type === CodeActionTriggerType.Invoke) {
            const sw = new StopWatch();
            const codeActions = await getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token);
            if (this._telemetryService) {
              this._telemetryService.publicLog2("codeAction.invokedDurations", {
                codeActions: codeActions.validActions.length,
                duration: sw.elapsed()
              });
            }
            return codeActions;
          }
          return getCodeActions(this._registry, model, trigger.selection, trigger.trigger, Progress.None, token);
        });
        if (trigger.trigger.type === CodeActionTriggerType.Invoke) {
          this._progressService?.showWhile(actions, 250);
        }
        const newState = new CodeActionsState.Triggered(trigger.trigger, startPosition, actions);
        let isManualToAutoTransition = false;
        if (this._state.type === 1 /* Triggered */) {
          isManualToAutoTransition = this._state.trigger.type === CodeActionTriggerType.Invoke && newState.type === 1 /* Triggered */ && newState.trigger.type === CodeActionTriggerType.Auto && this._state.position !== newState.position;
        }
        if (!isManualToAutoTransition) {
          this.setState(newState);
        } else {
          setTimeout(() => {
            this.setState(newState);
          }, 500);
        }
      }, void 0);
      this._codeActionOracle.value.trigger({ type: CodeActionTriggerType.Auto, triggerAction: CodeActionTriggerSource.Default });
    } else {
      this._supportedCodeActions.reset();
    }
  }
  trigger(trigger) {
    this._codeActionOracle.value?.trigger(trigger);
  }
  setState(newState, skipNotify) {
    if (newState === this._state) {
      return;
    }
    if (this._state.type === 1 /* Triggered */) {
      this._state.cancel();
    }
    this._state = newState;
    if (!skipNotify && !this._disposed) {
      this._onDidChangeState.fire(newState);
    }
  }
}
export {
  APPLY_FIX_ALL_COMMAND_ID,
  CodeActionModel,
  CodeActionsState,
  SUPPORTED_CODE_ACTIONS
};
//# sourceMappingURL=codeActionModel.js.map
