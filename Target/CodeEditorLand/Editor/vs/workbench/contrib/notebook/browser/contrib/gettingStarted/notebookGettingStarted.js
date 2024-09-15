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
import { Disposable } from "../../../../../../base/common/lifecycle.js";
import { localize2 } from "../../../../../../nls.js";
import { Categories } from "../../../../../../platform/action/common/actionCommonCategories.js";
import {
  Action2,
  registerAction2
} from "../../../../../../platform/actions/common/actions.js";
import { ICommandService } from "../../../../../../platform/commands/common/commands.js";
import { IConfigurationService } from "../../../../../../platform/configuration/common/configuration.js";
import {
  ContextKeyExpr,
  IContextKeyService
} from "../../../../../../platform/contextkey/common/contextkey.js";
import { Registry } from "../../../../../../platform/registry/common/platform.js";
import {
  IStorageService,
  StorageScope,
  StorageTarget
} from "../../../../../../platform/storage/common/storage.js";
import {
  Extensions as WorkbenchExtensions
} from "../../../../../common/contributions.js";
import { Memento } from "../../../../../common/memento.js";
import { IEditorService } from "../../../../../services/editor/common/editorService.js";
import { LifecyclePhase } from "../../../../../services/lifecycle/common/lifecycle.js";
import { NotebookSetting } from "../../../common/notebookCommon.js";
import { HAS_OPENED_NOTEBOOK } from "../../../common/notebookContextKeys.js";
import { NotebookEditorInput } from "../../../common/notebookEditorInput.js";
const hasOpenedNotebookKey = "hasOpenedNotebook";
const hasShownGettingStartedKey = "hasShownNotebookGettingStarted";
let NotebookGettingStarted = class extends Disposable {
  static {
    __name(this, "NotebookGettingStarted");
  }
  constructor(_editorService, _storageService, _contextKeyService, _commandService, _configurationService) {
    super();
    const hasOpenedNotebook = HAS_OPENED_NOTEBOOK.bindTo(_contextKeyService);
    const memento = new Memento("notebookGettingStarted2", _storageService);
    const storedValue = memento.getMemento(
      StorageScope.PROFILE,
      StorageTarget.USER
    );
    if (storedValue[hasOpenedNotebookKey]) {
      hasOpenedNotebook.set(true);
    }
    const needToShowGettingStarted = _configurationService.getValue(
      NotebookSetting.openGettingStarted
    ) && !storedValue[hasShownGettingStartedKey];
    if (!storedValue[hasOpenedNotebookKey] || needToShowGettingStarted) {
      const onDidOpenNotebook = /* @__PURE__ */ __name(() => {
        hasOpenedNotebook.set(true);
        storedValue[hasOpenedNotebookKey] = true;
        if (needToShowGettingStarted) {
          _commandService.executeCommand(
            "workbench.action.openWalkthrough",
            { category: "notebooks", step: "notebookProfile" },
            true
          );
          storedValue[hasShownGettingStartedKey] = true;
        }
        memento.saveMemento();
      }, "onDidOpenNotebook");
      if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
        onDidOpenNotebook();
        return;
      }
      const listener = this._register(
        _editorService.onDidActiveEditorChange(() => {
          if (_editorService.activeEditor?.typeId === NotebookEditorInput.ID) {
            listener.dispose();
            onDidOpenNotebook();
          }
        })
      );
    }
  }
};
NotebookGettingStarted = __decorateClass([
  __decorateParam(0, IEditorService),
  __decorateParam(1, IStorageService),
  __decorateParam(2, IContextKeyService),
  __decorateParam(3, ICommandService),
  __decorateParam(4, IConfigurationService)
], NotebookGettingStarted);
Registry.as(
  WorkbenchExtensions.Workbench
).registerWorkbenchContribution(
  NotebookGettingStarted,
  LifecyclePhase.Restored
);
registerAction2(
  class NotebookClearNotebookLayoutAction extends Action2 {
    static {
      __name(this, "NotebookClearNotebookLayoutAction");
    }
    constructor() {
      super({
        id: "workbench.notebook.layout.gettingStarted",
        title: localize2(
          "workbench.notebook.layout.gettingStarted.label",
          "Reset notebook getting started"
        ),
        f1: true,
        precondition: ContextKeyExpr.equals(
          `config.${NotebookSetting.openGettingStarted}`,
          true
        ),
        category: Categories.Developer
      });
    }
    run(accessor) {
      const storageService = accessor.get(IStorageService);
      const memento = new Memento(
        "notebookGettingStarted",
        storageService
      );
      const storedValue = memento.getMemento(
        StorageScope.PROFILE,
        StorageTarget.USER
      );
      storedValue[hasOpenedNotebookKey] = void 0;
      memento.saveMemento();
    }
  }
);
export {
  NotebookGettingStarted
};
//# sourceMappingURL=notebookGettingStarted.js.map
