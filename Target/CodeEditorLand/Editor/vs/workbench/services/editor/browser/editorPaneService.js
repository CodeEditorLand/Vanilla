var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { IEditorPaneService } from "../common/editorPaneService.js";
class EditorPaneService {
  static {
    __name(this, "EditorPaneService");
  }
  onWillInstantiateEditorPane = EditorPaneDescriptor.onWillInstantiateEditorPane;
  didInstantiateEditorPane(typeId) {
    return EditorPaneDescriptor.didInstantiateEditorPane(typeId);
  }
}
registerSingleton(
  IEditorPaneService,
  EditorPaneService,
  InstantiationType.Delayed
);
export {
  EditorPaneService
};
//# sourceMappingURL=editorPaneService.js.map
