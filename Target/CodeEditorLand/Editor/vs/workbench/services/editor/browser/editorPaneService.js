import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { EditorPaneDescriptor } from "../../../browser/editor.js";
import { IEditorPaneService } from "../common/editorPaneService.js";
class EditorPaneService {
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
