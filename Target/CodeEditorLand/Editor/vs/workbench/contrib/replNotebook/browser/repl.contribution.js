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
import { KeyCode, KeyMod } from "../../../../base/common/keyCodes.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { parse } from "../../../../base/common/marshalling.js";
import { extname, isEqual } from "../../../../base/common/resources.js";
import { isFalsyOrWhitespace } from "../../../../base/common/strings.js";
import { assertType } from "../../../../base/common/types.js";
import { URI } from "../../../../base/common/uri.js";
import { IBulkEditService } from "../../../../editor/browser/services/bulkEditService.js";
import { PLAINTEXT_LANGUAGE_ID } from "../../../../editor/common/languages/modesRegistry.js";
import { localize2 } from "../../../../nls.js";
import {
  Action2,
  MenuId,
  registerAction2
} from "../../../../platform/actions/common/actions.js";
import { IConfigurationService } from "../../../../platform/configuration/common/configuration.js";
import { ContextKeyExpr } from "../../../../platform/contextkey/common/contextkey.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  IInstantiationService
} from "../../../../platform/instantiation/common/instantiation.js";
import {
  KeybindingWeight,
  KeybindingsRegistry
} from "../../../../platform/keybinding/common/keybindingsRegistry.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  WorkbenchPhase,
  registerWorkbenchContribution2
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import {
  IEditorResolverService,
  RegisteredEditorPriority
} from "../../../services/editor/common/editorResolverService.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { IExtensionService } from "../../../services/extensions/common/extensions.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import {
  IWorkingCopyEditorService
} from "../../../services/workingCopy/common/workingCopyEditorService.js";
import { ResourceNotebookCellEdit } from "../../bulkEdit/browser/bulkCellEdits.js";
import { getReplView } from "../../debug/browser/repl.js";
import { REPL_VIEW_ID } from "../../debug/common/debug.js";
import { IInteractiveHistoryService } from "../../interactive/browser/interactiveHistoryService.js";
import { NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT } from "../../notebook/browser/controller/coreActions.js";
import * as icons from "../../notebook/browser/notebookIcons.js";
import { INotebookEditorService } from "../../notebook/browser/services/notebookEditorService.js";
import {
  CellEditType,
  CellKind,
  NotebookSetting,
  NotebookWorkingCopyTypeIdentifier,
  REPL_EDITOR_ID
} from "../../notebook/common/notebookCommon.js";
import { INotebookEditorModelResolverService } from "../../notebook/common/notebookEditorModelResolverService.js";
import { INotebookService } from "../../notebook/common/notebookService.js";
import { ReplEditor } from "./replEditor.js";
import { ReplEditorInput } from "./replEditorInput.js";
class ReplEditorSerializer {
  static {
    __name(this, "ReplEditorSerializer");
  }
  canSerialize(input) {
    return input.typeId === ReplEditorInput.ID;
  }
  serialize(input) {
    assertType(input instanceof ReplEditorInput);
    const data = {
      resource: input.resource,
      preferredResource: input.preferredResource,
      viewType: input.viewType,
      options: input.options,
      label: input.getName()
    };
    return JSON.stringify(data);
  }
  deserialize(instantiationService, raw) {
    const data = parse(raw);
    if (!data) {
      return void 0;
    }
    const { resource, viewType } = data;
    if (!data || !URI.isUri(resource) || typeof viewType !== "string") {
      return void 0;
    }
    const input = instantiationService.createInstance(
      ReplEditorInput,
      resource,
      data.label
    );
    return input;
  }
}
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(ReplEditor, REPL_EDITOR_ID, "REPL Editor"),
  [new SyncDescriptor(ReplEditorInput)]
);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(ReplEditorInput.ID, ReplEditorSerializer);
let ReplDocumentContribution = class extends Disposable {
  constructor(notebookService, editorResolverService, notebookEditorModelResolverService, instantiationService, configurationService) {
    super();
    this.notebookEditorModelResolverService = notebookEditorModelResolverService;
    this.instantiationService = instantiationService;
    this.configurationService = configurationService;
    editorResolverService.registerEditor(
      // don't match anything, we don't need to support re-opening files as REPL editor at this point
      ` `,
      {
        id: "repl",
        label: "repl Editor",
        priority: RegisteredEditorPriority.option
      },
      {
        // We want to support all notebook types which could have any file extension,
        // so we just check if the resource corresponds to a notebook
        canSupportResource: /* @__PURE__ */ __name((uri) => notebookService.getNotebookTextModel(uri) !== void 0, "canSupportResource"),
        singlePerResource: true
      },
      {
        createUntitledEditorInput: /* @__PURE__ */ __name(async ({ resource, options }) => {
          const scratchpad = this.configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
          const ref = await this.notebookEditorModelResolverService.resolve({ untitledResource: resource }, "jupyter-notebook", { scratchpad });
          ref.object.notebook.onWillDispose(() => {
            ref.dispose();
          });
          const label = options?.label ?? void 0;
          return { editor: this.instantiationService.createInstance(ReplEditorInput, resource, label), options };
        }, "createUntitledEditorInput"),
        createEditorInput: /* @__PURE__ */ __name(async ({ resource, options }) => {
          const label = options?.label ?? void 0;
          return { editor: this.instantiationService.createInstance(ReplEditorInput, resource, label), options };
        }, "createEditorInput")
      }
    );
  }
  static {
    __name(this, "ReplDocumentContribution");
  }
  static ID = "workbench.contrib.replDocument";
};
ReplDocumentContribution = __decorateClass([
  __decorateParam(0, INotebookService),
  __decorateParam(1, IEditorResolverService),
  __decorateParam(2, INotebookEditorModelResolverService),
  __decorateParam(3, IInstantiationService),
  __decorateParam(4, IConfigurationService)
], ReplDocumentContribution);
let ReplWindowWorkingCopyEditorHandler = class extends Disposable {
  constructor(instantiationService, workingCopyEditorService, extensionService) {
    super();
    this.instantiationService = instantiationService;
    this.workingCopyEditorService = workingCopyEditorService;
    this.extensionService = extensionService;
    this._installHandler();
  }
  static {
    __name(this, "ReplWindowWorkingCopyEditorHandler");
  }
  static ID = "workbench.contrib.replWorkingCopyEditorHandler";
  handles(workingCopy) {
    const viewType = this._getViewType(workingCopy);
    return !!viewType && viewType === "jupyter-notebook" && extname(workingCopy.resource) === ".replNotebook";
  }
  isOpen(workingCopy, editor) {
    if (!this.handles(workingCopy)) {
      return false;
    }
    return editor instanceof ReplEditorInput && isEqual(workingCopy.resource, editor.resource);
  }
  createEditor(workingCopy) {
    return this.instantiationService.createInstance(
      ReplEditorInput,
      workingCopy.resource,
      void 0
    );
  }
  async _installHandler() {
    await this.extensionService.whenInstalledExtensionsRegistered();
    this._register(this.workingCopyEditorService.registerHandler(this));
  }
  _getViewType(workingCopy) {
    return NotebookWorkingCopyTypeIdentifier.parse(workingCopy.typeId);
  }
};
ReplWindowWorkingCopyEditorHandler = __decorateClass([
  __decorateParam(0, IInstantiationService),
  __decorateParam(1, IWorkingCopyEditorService),
  __decorateParam(2, IExtensionService)
], ReplWindowWorkingCopyEditorHandler);
registerWorkbenchContribution2(
  ReplWindowWorkingCopyEditorHandler.ID,
  ReplWindowWorkingCopyEditorHandler,
  WorkbenchPhase.BlockRestore
);
registerWorkbenchContribution2(
  ReplDocumentContribution.ID,
  ReplDocumentContribution,
  WorkbenchPhase.BlockRestore
);
registerAction2(
  class extends Action2 {
    constructor() {
      super({
        id: "repl.execute",
        title: localize2("repl.execute", "Execute REPL input"),
        category: "REPL",
        keybinding: [
          {
            when: ContextKeyExpr.equals(
              "activeEditor",
              "workbench.editor.repl"
            ),
            primary: KeyMod.CtrlCmd | KeyCode.Enter,
            weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
          },
          {
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals(
                "activeEditor",
                "workbench.editor.repl"
              ),
              ContextKeyExpr.equals(
                "config.interactiveWindow.executeWithShiftEnter",
                true
              )
            ),
            primary: KeyMod.Shift | KeyCode.Enter,
            weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
          },
          {
            when: ContextKeyExpr.and(
              ContextKeyExpr.equals(
                "activeEditor",
                "workbench.editor.repl"
              ),
              ContextKeyExpr.equals(
                "config.interactiveWindow.executeWithShiftEnter",
                false
              )
            ),
            primary: KeyCode.Enter,
            weight: NOTEBOOK_EDITOR_WIDGET_ACTION_WEIGHT
          }
        ],
        menu: [
          {
            id: MenuId.ReplInputExecute
          }
        ],
        icon: icons.executeIcon,
        f1: false,
        metadata: {
          description: "Execute the Contents of the Input Box",
          args: [
            {
              name: "resource",
              description: "Interactive resource Uri",
              isOptional: true
            }
          ]
        }
      });
    }
    async run(accessor, context) {
      const editorService = accessor.get(IEditorService);
      const bulkEditService = accessor.get(IBulkEditService);
      const historyService = accessor.get(IInteractiveHistoryService);
      const notebookEditorService = accessor.get(INotebookEditorService);
      let editorControl;
      if (context) {
        const resourceUri = URI.revive(context);
        const editors = editorService.findEditors(resourceUri);
        for (const found of editors) {
          if (found.editor.typeId === ReplEditorInput.ID) {
            const editor = await editorService.openEditor(
              found.editor,
              found.groupId
            );
            editorControl = editor?.getControl();
            break;
          }
        }
      } else {
        editorControl = editorService.activeEditorPane?.getControl();
      }
      if (editorControl) {
        executeReplInput(
          bulkEditService,
          historyService,
          notebookEditorService,
          editorControl
        );
      }
    }
  }
);
async function executeReplInput(bulkEditService, historyService, notebookEditorService, editorControl) {
  if (editorControl && editorControl.notebookEditor && editorControl.codeEditor) {
    const notebookDocument = editorControl.notebookEditor.textModel;
    const textModel = editorControl.codeEditor.getModel();
    const activeKernel = editorControl.notebookEditor.activeKernel;
    const language = activeKernel?.supportedLanguages[0] ?? PLAINTEXT_LANGUAGE_ID;
    if (notebookDocument && textModel) {
      const index = notebookDocument.length - 1;
      const value = textModel.getValue();
      if (isFalsyOrWhitespace(value)) {
        return;
      }
      historyService.replaceLast(notebookDocument.uri, value);
      historyService.addToHistory(notebookDocument.uri, "");
      textModel.setValue("");
      notebookDocument.cells[index].resetTextBuffer(
        textModel.getTextBuffer()
      );
      const collapseState = editorControl.notebookEditor.notebookOptions.getDisplayOptions().interactiveWindowCollapseCodeCells === "fromEditor" ? {
        inputCollapsed: false,
        outputCollapsed: false
      } : void 0;
      await bulkEditService.apply([
        new ResourceNotebookCellEdit(notebookDocument.uri, {
          editType: CellEditType.Replace,
          index,
          count: 0,
          cells: [
            {
              cellKind: CellKind.Code,
              mime: void 0,
              language,
              source: value,
              outputs: [],
              metadata: {},
              collapseState
            }
          ]
        })
      ]);
      const range = { start: index, end: index + 1 };
      editorControl.notebookEditor.revealCellRangeInView(range);
      await editorControl.notebookEditor.executeNotebookCells(
        editorControl.notebookEditor.getCellsInRange({
          start: index,
          end: index + 1
        })
      );
      const editor = notebookEditorService.getNotebookEditor(
        editorControl.notebookEditor.getId()
      );
      if (editor) {
        editor.setSelections([range]);
        editor.setFocus(range);
      }
    }
  }
}
__name(executeReplInput, "executeReplInput");
KeybindingsRegistry.registerCommandAndKeybindingRule({
  id: "list.find.replInputFocus",
  weight: KeybindingWeight.WorkbenchContrib + 1,
  when: ContextKeyExpr.equals("view", REPL_VIEW_ID),
  primary: KeyMod.CtrlCmd | KeyMod.Alt | KeyCode.KeyF,
  secondary: [KeyCode.F3],
  handler: /* @__PURE__ */ __name((accessor) => {
    getReplView(accessor.get(IViewsService))?.openFind();
  }, "handler")
});
export {
  ReplDocumentContribution
};
//# sourceMappingURL=repl.contribution.js.map
