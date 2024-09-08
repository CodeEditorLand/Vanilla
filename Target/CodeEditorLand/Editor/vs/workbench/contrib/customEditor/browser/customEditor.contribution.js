import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import {
  registerWorkbenchContribution2,
  WorkbenchPhase
} from "../../../common/contributions.js";
import {
  EditorExtensions
} from "../../../common/editor.js";
import { WebviewEditor } from "../../webviewPanel/browser/webviewEditor.js";
import { ICustomEditorService } from "../common/customEditor.js";
import { CustomEditorInput } from "./customEditorInput.js";
import {
  ComplexCustomWorkingCopyEditorHandler,
  CustomEditorInputSerializer
} from "./customEditorInputFactory.js";
import { CustomEditorService } from "./customEditors.js";
registerSingleton(
  ICustomEditorService,
  CustomEditorService,
  InstantiationType.Delayed
);
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    WebviewEditor,
    WebviewEditor.ID,
    "Webview Editor"
  ),
  [new SyncDescriptor(CustomEditorInput)]
);
Registry.as(
  EditorExtensions.EditorFactory
).registerEditorSerializer(
  CustomEditorInputSerializer.ID,
  CustomEditorInputSerializer
);
registerWorkbenchContribution2(
  ComplexCustomWorkingCopyEditorHandler.ID,
  ComplexCustomWorkingCopyEditorHandler,
  WorkbenchPhase.BlockStartup
);
