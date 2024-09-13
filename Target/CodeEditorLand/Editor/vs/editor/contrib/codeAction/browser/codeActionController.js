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
import { getDomNodePagePosition } from "../../../../base/browser/dom.js";
import * as aria from "../../../../base/browser/ui/aria/aria.js";
import { onUnexpectedError } from "../../../../base/common/errors.js";
import { HierarchicalKind } from "../../../../base/common/hierarchicalKind.js";
import { Lazy } from "../../../../base/common/lazy.js";
import {
  Disposable,
  MutableDisposable
} from "../../../../base/common/lifecycle.js";
import { localize } from "../../../../nls.js";
import { IActionWidgetService } from "../../../../platform/actionWidget/browser/actionWidget.js";
import { ICommandService } from "../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { IMarkerService } from "../../../../platform/markers/common/markers.js";
import { IEditorProgressService } from "../../../../platform/progress/common/progress.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import {
  editorFindMatchHighlight,
  editorFindMatchHighlightBorder
} from "../../../../platform/theme/common/colorRegistry.js";
import { isHighContrast } from "../../../../platform/theme/common/theme.js";
import { registerThemingParticipant } from "../../../../platform/theme/common/themeService.js";
import { Position } from "../../../common/core/position.js";
import {
  ScrollType
} from "../../../common/editorCommon.js";
import { CodeActionTriggerType } from "../../../common/languages.js";
import { ModelDecorationOptions } from "../../../common/model/textModel.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { MessageController } from "../../message/browser/messageController.js";
import {
  CodeActionAutoApply,
  CodeActionKind,
  CodeActionTriggerSource
} from "../common/types.js";
import { ApplyCodeActionReason, applyCodeAction } from "./codeAction.js";
import { CodeActionKeybindingResolver } from "./codeActionKeybindingResolver.js";
import { toMenuItems } from "./codeActionMenu.js";
import { CodeActionModel, CodeActionsState } from "./codeActionModel.js";
import { LightBulbWidget } from "./lightBulbWidget.js";
const DECORATION_CLASS_NAME = "quickfix-edit-highlight";
let CodeActionController = class extends Disposable {
  constructor(editor, markerService, contextKeyService, instantiationService, languageFeaturesService, progressService, _commandService, _configurationService, _actionWidgetService, _instantiationService, _telemetryService) {
    super();
    this._commandService = _commandService;
    this._configurationService = _configurationService;
    this._actionWidgetService = _actionWidgetService;
    this._instantiationService = _instantiationService;
    this._telemetryService = _telemetryService;
    this._editor = editor;
    this._model = this._register(new CodeActionModel(this._editor, languageFeaturesService.codeActionProvider, markerService, contextKeyService, progressService, _configurationService, this._telemetryService));
    this._register(this._model.onDidChangeState((newState) => this.update(newState)));
    this._lightBulbWidget = new Lazy(() => {
      const widget = this._editor.getContribution(LightBulbWidget.ID);
      if (widget) {
        this._register(widget.onClick((e) => this.showCodeActionsFromLightbulb(e.actions, e)));
      }
      return widget;
    });
    this._resolver = instantiationService.createInstance(CodeActionKeybindingResolver);
    this._register(this._editor.onDidLayoutChange(() => this._actionWidgetService.hide()));
  }
  static {
    __name(this, "CodeActionController");
  }
  static ID = "editor.contrib.codeActionController";
  static get(editor) {
    return editor.getContribution(
      CodeActionController.ID
    );
  }
  _editor;
  _model;
  _lightBulbWidget;
  _activeCodeActions = this._register(
    new MutableDisposable()
  );
  _showDisabled = false;
  _resolver;
  _disposed = false;
  dispose() {
    this._disposed = true;
    super.dispose();
  }
  async showCodeActionsFromLightbulb(actions, at) {
    if (actions.allAIFixes && actions.validActions.length === 1) {
      const actionItem = actions.validActions[0];
      const command = actionItem.action.command;
      if (command && command.id === "inlineChat.start") {
        if (command.arguments && command.arguments.length >= 1) {
          command.arguments[0] = {
            ...command.arguments[0],
            autoSend: false
          };
        }
      }
      await this._applyCodeAction(
        actionItem,
        false,
        false,
        ApplyCodeActionReason.FromAILightbulb
      );
      return;
    }
    await this.showCodeActionList(actions, at, {
      includeDisabledActions: false,
      fromLightbulb: true
    });
  }
  showCodeActions(_trigger, actions, at) {
    return this.showCodeActionList(actions, at, {
      includeDisabledActions: false,
      fromLightbulb: false
    });
  }
  hideCodeActions() {
    this._actionWidgetService.hide();
  }
  manualTriggerAtCurrentPosition(notAvailableMessage, triggerAction, filter, autoApply) {
    if (!this._editor.hasModel()) {
      return;
    }
    MessageController.get(this._editor)?.closeMessage();
    const triggerPosition = this._editor.getPosition();
    this._trigger({
      type: CodeActionTriggerType.Invoke,
      triggerAction,
      filter,
      autoApply,
      context: { notAvailableMessage, position: triggerPosition }
    });
  }
  _trigger(trigger) {
    return this._model.trigger(trigger);
  }
  async _applyCodeAction(action, retrigger, preview, actionReason) {
    try {
      await this._instantiationService.invokeFunction(
        applyCodeAction,
        action,
        actionReason,
        { preview, editor: this._editor }
      );
    } finally {
      if (retrigger) {
        this._trigger({
          type: CodeActionTriggerType.Auto,
          triggerAction: CodeActionTriggerSource.QuickFix,
          filter: {}
        });
      }
    }
  }
  hideLightBulbWidget() {
    this._lightBulbWidget.rawValue?.hide();
    this._lightBulbWidget.rawValue?.gutterHide();
  }
  async update(newState) {
    if (newState.type !== CodeActionsState.Type.Triggered) {
      this.hideLightBulbWidget();
      return;
    }
    let actions;
    try {
      actions = await newState.actions;
    } catch (e) {
      onUnexpectedError(e);
      return;
    }
    if (this._disposed) {
      return;
    }
    const selection = this._editor.getSelection();
    if (selection?.startLineNumber !== newState.position.lineNumber) {
      return;
    }
    this._lightBulbWidget.value?.update(
      actions,
      newState.trigger,
      newState.position
    );
    if (newState.trigger.type === CodeActionTriggerType.Invoke) {
      if (newState.trigger.filter?.include) {
        const validActionToApply = this.tryGetValidActionToApply(
          newState.trigger,
          actions
        );
        if (validActionToApply) {
          try {
            this.hideLightBulbWidget();
            await this._applyCodeAction(
              validActionToApply,
              false,
              false,
              ApplyCodeActionReason.FromCodeActions
            );
          } finally {
            actions.dispose();
          }
          return;
        }
        if (newState.trigger.context) {
          const invalidAction = this.getInvalidActionThatWouldHaveBeenApplied(
            newState.trigger,
            actions
          );
          if (invalidAction && invalidAction.action.disabled) {
            MessageController.get(this._editor)?.showMessage(
              invalidAction.action.disabled,
              newState.trigger.context.position
            );
            actions.dispose();
            return;
          }
        }
      }
      const includeDisabledActions = !!newState.trigger.filter?.include;
      if (newState.trigger.context) {
        if (!actions.allActions.length || !includeDisabledActions && !actions.validActions.length) {
          MessageController.get(this._editor)?.showMessage(
            newState.trigger.context.notAvailableMessage,
            newState.trigger.context.position
          );
          this._activeCodeActions.value = actions;
          actions.dispose();
          return;
        }
      }
      this._activeCodeActions.value = actions;
      this.showCodeActionList(actions, this.toCoords(newState.position), {
        includeDisabledActions,
        fromLightbulb: false
      });
    } else {
      if (this._actionWidgetService.isVisible) {
        actions.dispose();
      } else {
        this._activeCodeActions.value = actions;
      }
    }
  }
  getInvalidActionThatWouldHaveBeenApplied(trigger, actions) {
    if (!actions.allActions.length) {
      return void 0;
    }
    if (trigger.autoApply === CodeActionAutoApply.First && actions.validActions.length === 0 || trigger.autoApply === CodeActionAutoApply.IfSingle && actions.allActions.length === 1) {
      return actions.allActions.find(({ action }) => action.disabled);
    }
    return void 0;
  }
  tryGetValidActionToApply(trigger, actions) {
    if (!actions.validActions.length) {
      return void 0;
    }
    if (trigger.autoApply === CodeActionAutoApply.First && actions.validActions.length > 0 || trigger.autoApply === CodeActionAutoApply.IfSingle && actions.validActions.length === 1) {
      return actions.validActions[0];
    }
    return void 0;
  }
  static DECORATION = ModelDecorationOptions.register({
    description: "quickfix-highlight",
    className: DECORATION_CLASS_NAME
  });
  async showCodeActionList(actions, at, options) {
    const currentDecorations = this._editor.createDecorationsCollection();
    const editorDom = this._editor.getDomNode();
    if (!editorDom) {
      return;
    }
    const actionsToShow = options.includeDisabledActions && (this._showDisabled || actions.validActions.length === 0) ? actions.allActions : actions.validActions;
    if (!actionsToShow.length) {
      return;
    }
    const anchor = Position.isIPosition(at) ? this.toCoords(at) : at;
    const delegate = {
      onSelect: /* @__PURE__ */ __name(async (action, preview) => {
        this._applyCodeAction(
          action,
          /* retrigger */
          true,
          !!preview,
          options.fromLightbulb ? ApplyCodeActionReason.FromAILightbulb : ApplyCodeActionReason.FromCodeActions
        );
        this._actionWidgetService.hide(false);
        currentDecorations.clear();
      }, "onSelect"),
      onHide: /* @__PURE__ */ __name((didCancel) => {
        this._editor?.focus();
        currentDecorations.clear();
      }, "onHide"),
      onHover: /* @__PURE__ */ __name(async (action, token) => {
        if (token.isCancellationRequested) {
          return;
        }
        let canPreview = false;
        const actionKind = action.action.kind;
        if (actionKind) {
          const hierarchicalKind = new HierarchicalKind(actionKind);
          const refactorKinds = [
            CodeActionKind.RefactorExtract,
            CodeActionKind.RefactorInline,
            CodeActionKind.RefactorRewrite,
            CodeActionKind.RefactorMove,
            CodeActionKind.Source
          ];
          canPreview = refactorKinds.some(
            (refactorKind) => refactorKind.contains(hierarchicalKind)
          );
        }
        return {
          canPreview: canPreview || !!action.action.edit?.edits.length
        };
      }, "onHover"),
      onFocus: /* @__PURE__ */ __name((action) => {
        if (action && action.action) {
          const ranges = action.action.ranges;
          const diagnostics = action.action.diagnostics;
          currentDecorations.clear();
          if (ranges && ranges.length > 0) {
            const decorations = diagnostics && diagnostics?.length > 1 ? diagnostics.map((diagnostic) => ({
              range: diagnostic,
              options: CodeActionController.DECORATION
            })) : ranges.map((range) => ({
              range,
              options: CodeActionController.DECORATION
            }));
            currentDecorations.set(decorations);
          } else if (diagnostics && diagnostics.length > 0) {
            const decorations = diagnostics.map((diagnostic2) => ({
              range: diagnostic2,
              options: CodeActionController.DECORATION
            }));
            currentDecorations.set(decorations);
            const diagnostic = diagnostics[0];
            if (diagnostic.startLineNumber && diagnostic.startColumn) {
              const selectionText = this._editor.getModel()?.getWordAtPosition({
                lineNumber: diagnostic.startLineNumber,
                column: diagnostic.startColumn
              })?.word;
              aria.status(
                localize(
                  "editingNewSelection",
                  "Context: {0} at line {1} and column {2}.",
                  selectionText,
                  diagnostic.startLineNumber,
                  diagnostic.startColumn
                )
              );
            }
          }
        } else {
          currentDecorations.clear();
        }
      }, "onFocus")
    };
    this._actionWidgetService.show(
      "codeActionWidget",
      true,
      toMenuItems(
        actionsToShow,
        this._shouldShowHeaders(),
        this._resolver.getResolver()
      ),
      delegate,
      anchor,
      editorDom,
      this._getActionBarActions(actions, at, options)
    );
  }
  toCoords(position) {
    if (!this._editor.hasModel()) {
      return { x: 0, y: 0 };
    }
    this._editor.revealPosition(position, ScrollType.Immediate);
    this._editor.render();
    const cursorCoords = this._editor.getScrolledVisiblePosition(position);
    const editorCoords = getDomNodePagePosition(this._editor.getDomNode());
    const x = editorCoords.left + cursorCoords.left;
    const y = editorCoords.top + cursorCoords.top + cursorCoords.height;
    return { x, y };
  }
  _shouldShowHeaders() {
    const model = this._editor?.getModel();
    return this._configurationService.getValue(
      "editor.codeActionWidget.showHeaders",
      { resource: model?.uri }
    );
  }
  _getActionBarActions(actions, at, options) {
    if (options.fromLightbulb) {
      return [];
    }
    const resultActions = actions.documentation.map(
      (command) => ({
        id: command.id,
        label: command.title,
        tooltip: command.tooltip ?? "",
        class: void 0,
        enabled: true,
        run: /* @__PURE__ */ __name(() => this._commandService.executeCommand(
          command.id,
          ...command.arguments ?? []
        ), "run")
      })
    );
    if (options.includeDisabledActions && actions.validActions.length > 0 && actions.allActions.length !== actions.validActions.length) {
      resultActions.push(
        this._showDisabled ? {
          id: "hideMoreActions",
          label: localize("hideMoreActions", "Hide Disabled"),
          enabled: true,
          tooltip: "",
          class: void 0,
          run: /* @__PURE__ */ __name(() => {
            this._showDisabled = false;
            return this.showCodeActionList(
              actions,
              at,
              options
            );
          }, "run")
        } : {
          id: "showMoreActions",
          label: localize("showMoreActions", "Show Disabled"),
          enabled: true,
          tooltip: "",
          class: void 0,
          run: /* @__PURE__ */ __name(() => {
            this._showDisabled = true;
            return this.showCodeActionList(
              actions,
              at,
              options
            );
          }, "run")
        }
      );
    }
    return resultActions;
  }
};
CodeActionController = __decorateClass([
  __decorateParam(1, IMarkerService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, ILanguageFeaturesService),
  __decorateParam(5, IEditorProgressService),
  __decorateParam(6, ICommandService),
  __decorateParam(7, IConfigurationService),
  __decorateParam(8, IActionWidgetService),
  __decorateParam(9, IInstantiationService),
  __decorateParam(10, ITelemetryService)
], CodeActionController);
registerThemingParticipant((theme, collector) => {
  const addBackgroundColorRule = /* @__PURE__ */ __name((selector, color) => {
    if (color) {
      collector.addRule(
        `.monaco-editor ${selector} { background-color: ${color}; }`
      );
    }
  }, "addBackgroundColorRule");
  addBackgroundColorRule(
    ".quickfix-edit-highlight",
    theme.getColor(editorFindMatchHighlight)
  );
  const findMatchHighlightBorder = theme.getColor(
    editorFindMatchHighlightBorder
  );
  if (findMatchHighlightBorder) {
    collector.addRule(
      `.monaco-editor .quickfix-edit-highlight { border: 1px ${isHighContrast(theme.type) ? "dotted" : "solid"} ${findMatchHighlightBorder}; box-sizing: border-box; }`
    );
  }
});
export {
  CodeActionController
};
//# sourceMappingURL=codeActionController.js.map
