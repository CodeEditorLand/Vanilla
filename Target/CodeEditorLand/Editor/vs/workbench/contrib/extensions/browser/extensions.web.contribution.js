import { localize } from "../../../../nls.js";
import { SyncDescriptor } from "../../../../platform/instantiation/common/descriptors.js";
import { Registry } from "../../../../platform/registry/common/platform.js";
import {
  EditorPaneDescriptor
} from "../../../browser/editor.js";
import { EditorExtensions } from "../../../common/editor.js";
import { RuntimeExtensionsInput } from "../common/runtimeExtensionsInput.js";
import { RuntimeExtensionsEditor } from "./browserRuntimeExtensionsEditor.js";
Registry.as(
  EditorExtensions.EditorPane
).registerEditorPane(
  EditorPaneDescriptor.create(
    RuntimeExtensionsEditor,
    RuntimeExtensionsEditor.ID,
    localize("runtimeExtension", "Running Extensions")
  ),
  [new SyncDescriptor(RuntimeExtensionsInput)]
);
//# sourceMappingURL=extensions.web.contribution.js.map
