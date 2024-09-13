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
import { ThrottledDelayer } from "../../../../base/common/async.js";
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { DisposableStore } from "../../../../base/common/lifecycle.js";
import { Schemas } from "../../../../base/common/network.js";
import { getCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import { EditorContextKeys } from "../../../../editor/common/editorContextKeys.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  Action2,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { IKeybindingService } from "../../../../platform/keybinding/common/keybinding.js";
import { KeybindingWeight } from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { INotificationService } from "../../../../platform/notification/common/notification.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../common/contributions.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import {
  ILanguageDetectionService,
  LanguageDetectionLanguageEventSource
} from "../../../services/languageDetection/common/languageDetectionWorkerService.js";
import { LifecyclePhase } from "../../../services/lifecycle/common/lifecycle.js";
import {
  IStatusbarService,
  StatusbarAlignment
} from "../../../services/statusbar/browser/statusbar.js";
import { NOTEBOOK_EDITOR_EDITABLE } from "../../notebook/common/notebookContextKeys.js";
const detectLanguageCommandId = "editor.detectLanguage";
let LanguageDetectionStatusContribution = class {
  constructor(_languageDetectionService, _statusBarService, _configurationService, _editorService, _languageService, _keybindingService) {
    this._languageDetectionService = _languageDetectionService;
    this._statusBarService = _statusBarService;
    this._configurationService = _configurationService;
    this._editorService = _editorService;
    this._languageService = _languageService;
    this._keybindingService = _keybindingService;
    _editorService.onDidActiveEditorChange(() => this._update(true), this, this._disposables);
    this._update(false);
  }
  static {
    __name(this, "LanguageDetectionStatusContribution");
  }
  static _id = "status.languageDetectionStatus";
  _disposables = new DisposableStore();
  _combinedEntry;
  _delayer = new ThrottledDelayer(1e3);
  _renderDisposables = new DisposableStore();
  dispose() {
    this._disposables.dispose();
    this._delayer.dispose();
    this._combinedEntry?.dispose();
    this._renderDisposables.dispose();
  }
  _update(clear) {
    if (clear) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    }
    this._delayer.trigger(() => this._doUpdate());
  }
  async _doUpdate() {
    const editor = getCodeEditor(
      this._editorService.activeTextEditorControl
    );
    this._renderDisposables.clear();
    editor?.onDidChangeModelLanguage(
      () => this._update(true),
      this,
      this._renderDisposables
    );
    editor?.onDidChangeModelContent(
      () => this._update(false),
      this,
      this._renderDisposables
    );
    const editorModel = editor?.getModel();
    const editorUri = editorModel?.uri;
    const existingId = editorModel?.getLanguageId();
    const enablementConfig = this._configurationService.getValue(
      "workbench.editor.languageDetectionHints"
    );
    const enabled = typeof enablementConfig === "object" && enablementConfig?.untitledEditors;
    const disableLightbulb = !enabled || editorUri?.scheme !== Schemas.untitled || !existingId;
    if (disableLightbulb || !editorUri) {
      this._combinedEntry?.dispose();
      this._combinedEntry = void 0;
    } else {
      const lang = await this._languageDetectionService.detectLanguage(editorUri);
      const skip = { jsonc: "json" };
      const existing = editorModel.getLanguageId();
      if (lang && lang !== existing && skip[existing] !== lang) {
        const detectedName = this._languageService.getLanguageName(lang) || lang;
        let tooltip = localize(
          "status.autoDetectLanguage",
          "Accept Detected Language: {0}",
          detectedName
        );
        const keybinding = this._keybindingService.lookupKeybinding(
          detectLanguageCommandId
        );
        const label = keybinding?.getLabel();
        if (label) {
          tooltip += ` (${label})`;
        }
        const props = {
          name: localize("langDetection.name", "Language Detection"),
          ariaLabel: localize(
            "langDetection.aria",
            "Change to Detected Language: {0}",
            lang
          ),
          tooltip,
          command: detectLanguageCommandId,
          text: "$(lightbulb-autofix)"
        };
        if (this._combinedEntry) {
          this._combinedEntry.update(props);
        } else {
          this._combinedEntry = this._statusBarService.addEntry(
            props,
            LanguageDetectionStatusContribution._id,
            StatusbarAlignment.RIGHT,
            {
              id: "status.editor.mode",
              alignment: StatusbarAlignment.RIGHT,
              compact: true
            }
          );
        }
      } else {
        this._combinedEntry?.dispose();
        this._combinedEntry = void 0;
      }
    }
  }
};
LanguageDetectionStatusContribution = __decorateClass([
  __decorateParam(0, ILanguageDetectionService),
  __decorateParam(1, IStatusbarService),
  __decorateParam(2, IConfigurationService),
  __decorateParam(3, IEditorService),
  __decorateParam(4, ILanguageService),
  __decorateParam(5, IKeybindingService)
], LanguageDetectionStatusContribution);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  LanguageDetectionStatusContribution,
  LifecyclePhase.Restored
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: detectLanguageCommandId,
        title: localize2("detectlang", "Detect Language from Content"),
        f1: true,
        precondition: ContextKeyExpr.and(
          NOTEBOOK_EDITOR_EDITABLE.toNegated(),
          EditorContextKeys.editorTextFocus
        ),
        keybinding: {
          primary: KeyCode.KeyD | KeyMod.Alt | KeyMod.Shift,
          weight: KeybindingWeight.WorkbenchContrib
        }
      });
    }
    async run(accessor) {
      const editorService = accessor.get(IEditorService);
      const languageDetectionService = accessor.get(
        ILanguageDetectionService
      );
      const editor = getCodeEditor(editorService.activeTextEditorControl);
      const notificationService = accessor.get(INotificationService);
      const editorUri = editor?.getModel()?.uri;
      if (editorUri) {
        const lang = await languageDetectionService.detectLanguage(editorUri);
        if (lang) {
          editor.getModel()?.setLanguage(
            lang,
            LanguageDetectionLanguageEventSource
          );
        } else {
          notificationService.warn(
            localize(
              "noDetection",
              "Unable to detect editor language"
            )
          );
        }
      }
    }
  }
);
//# sourceMappingURL=languageDetection.contribution.js.map
