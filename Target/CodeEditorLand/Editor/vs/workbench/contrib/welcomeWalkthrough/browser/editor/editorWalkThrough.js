import { FileAccess, Schemas } from "../../../../../base/common/network.js";
import { localize, localize2 } from "../../../../../nls.js";
import { Categories } from "../../../../../platform/action/common/actionCommonCategories.js";
import { Action2 } from "../../../../../platform/actions/common/actions.js";
import {
  IInstantiationService
} from "../../../../../platform/instantiation/common/instantiation.js";
import { IEditorService } from "../../../../services/editor/common/editorService.js";
import {
  WalkThroughInput
} from "../walkThroughInput.js";
const typeId = "workbench.editors.walkThroughInput";
const inputOptions = {
  typeId,
  name: localize("editorWalkThrough.title", "Editor Playground"),
  resource: FileAccess.asBrowserUri(
    "vs/workbench/contrib/welcomeWalkthrough/browser/editor/vs_code_editor_walkthrough.md"
  ).with({
    scheme: Schemas.walkThrough,
    query: JSON.stringify({
      moduleId: "../browser/editor/vs_code_editor_walkthrough.js"
    })
  }),
  telemetryFrom: "walkThrough"
};
class EditorWalkThroughAction extends Action2 {
  static ID = "workbench.action.showInteractivePlayground";
  static LABEL = localize2(
    "editorWalkThrough",
    "Interactive Editor Playground"
  );
  constructor() {
    super({
      id: EditorWalkThroughAction.ID,
      title: EditorWalkThroughAction.LABEL,
      category: Categories.Help,
      f1: true,
      metadata: {
        description: localize2(
          "editorWalkThroughMetadata",
          "Opens an interactive playground for learning about the editor."
        )
      }
    });
  }
  run(serviceAccessor) {
    const editorService = serviceAccessor.get(IEditorService);
    const instantiationService = serviceAccessor.get(IInstantiationService);
    const input = instantiationService.createInstance(
      WalkThroughInput,
      inputOptions
    );
    return editorService.openEditor(input, { pinned: true }).then(() => void 0);
  }
}
class EditorWalkThroughInputSerializer {
  static ID = typeId;
  canSerialize(editorInput) {
    return true;
  }
  serialize(editorInput) {
    return "";
  }
  deserialize(instantiationService) {
    return instantiationService.createInstance(
      WalkThroughInput,
      inputOptions
    );
  }
}
export {
  EditorWalkThroughAction,
  EditorWalkThroughInputSerializer
};
