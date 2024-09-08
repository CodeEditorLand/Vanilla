import { VSBuffer } from "../../../../base/common/buffer.js";
import { Codicon } from "../../../../base/common/codicons.js";
import { randomPath } from "../../../../base/common/extpath.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import { localize, localize2 } from "../../../../nls.js";
import {
  Action2
} from "../../../../platform/actions/common/actions.js";
import { IClipboardService } from "../../../../platform/clipboard/common/clipboardService.js";
import { INativeEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { IFileService } from "../../../../platform/files/common/files.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { IEditorService } from "../../../services/editor/common/editorService.js";
import { MergeEditor } from "../browser/view/mergeEditor.js";
const MERGE_EDITOR_CATEGORY = localize2(
  "mergeEditor",
  "Merge Editor (Dev)"
);
class MergeEditorOpenContentsFromJSON extends Action2 {
  constructor() {
    super({
      id: "merge.dev.openContentsJson",
      category: MERGE_EDITOR_CATEGORY,
      title: localize2(
        "merge.dev.openState",
        "Open Merge Editor State from JSON"
      ),
      icon: Codicon.layoutCentered,
      f1: true
    });
  }
  async run(accessor, args) {
    const quickInputService = accessor.get(IQuickInputService);
    const clipboardService = accessor.get(IClipboardService);
    const editorService = accessor.get(IEditorService);
    const languageService = accessor.get(ILanguageService);
    const env = accessor.get(INativeEnvironmentService);
    const fileService = accessor.get(IFileService);
    if (!args) {
      args = {};
    }
    let content;
    if (args.data) {
      content = args.data;
    } else {
      const result = await quickInputService.input({
        prompt: localize("mergeEditor.enterJSON", "Enter JSON"),
        value: await clipboardService.readText()
      });
      if (result === void 0) {
        return;
      }
      content = result !== "" ? JSON.parse(result) : {
        base: "",
        input1: "",
        input2: "",
        result: "",
        languageId: "plaintext"
      };
    }
    const targetDir = URI.joinPath(env.tmpDir, randomPath());
    const extension = languageService.getExtensions(content.languageId)[0] || "";
    const baseUri = URI.joinPath(targetDir, `/base${extension}`);
    const input1Uri = URI.joinPath(targetDir, `/input1${extension}`);
    const input2Uri = URI.joinPath(targetDir, `/input2${extension}`);
    const resultUri = URI.joinPath(targetDir, `/result${extension}`);
    const initialResultUri = URI.joinPath(
      targetDir,
      `/initialResult${extension}`
    );
    async function writeFile(uri, content2) {
      await fileService.writeFile(uri, VSBuffer.fromString(content2));
    }
    const shouldOpenInitial = await promptOpenInitial(
      quickInputService,
      args.resultState
    );
    await Promise.all([
      writeFile(baseUri, content.base),
      writeFile(input1Uri, content.input1),
      writeFile(input2Uri, content.input2),
      writeFile(
        resultUri,
        shouldOpenInitial ? content.initialResult || "" : content.result
      ),
      writeFile(initialResultUri, content.initialResult || "")
    ]);
    const input = {
      base: { resource: baseUri },
      input1: {
        resource: input1Uri,
        label: "Input 1",
        description: "Input 1",
        detail: "(from JSON)"
      },
      input2: {
        resource: input2Uri,
        label: "Input 2",
        description: "Input 2",
        detail: "(from JSON)"
      },
      result: { resource: resultUri }
    };
    editorService.openEditor(input);
  }
}
async function promptOpenInitial(quickInputService, resultStateOverride) {
  if (resultStateOverride) {
    return resultStateOverride === "initial";
  }
  const result = await quickInputService.pick(
    [
      { label: "result", result: false },
      { label: "initial result", result: true }
    ],
    { canPickMany: false }
  );
  return result?.result;
}
class MergeEditorAction extends Action2 {
  constructor(desc) {
    super(desc);
  }
  run(accessor) {
    const { activeEditorPane } = accessor.get(IEditorService);
    if (activeEditorPane instanceof MergeEditor) {
      const vm = activeEditorPane.viewModel.get();
      if (!vm) {
        return;
      }
      this.runWithViewModel(vm, accessor);
    }
  }
}
class OpenSelectionInTemporaryMergeEditor extends MergeEditorAction {
  constructor() {
    super({
      id: "merge.dev.openSelectionInTemporaryMergeEditor",
      category: MERGE_EDITOR_CATEGORY,
      title: localize2(
        "merge.dev.openSelectionInTemporaryMergeEditor",
        "Open Selection In Temporary Merge Editor"
      ),
      icon: Codicon.layoutCentered,
      f1: true
    });
  }
  async runWithViewModel(viewModel, accessor) {
    const rangesInBase = viewModel.selectionInBase.get()?.rangesInBase;
    if (!rangesInBase || rangesInBase.length === 0) {
      return;
    }
    const base = rangesInBase.map((r) => viewModel.model.base.getValueInRange(r)).join("\n");
    const input1 = rangesInBase.map(
      (r) => viewModel.inputCodeEditorView1.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToInput(1, r)
      )
    ).join("\n");
    const input2 = rangesInBase.map(
      (r) => viewModel.inputCodeEditorView2.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToInput(2, r)
      )
    ).join("\n");
    const result = rangesInBase.map(
      (r) => viewModel.resultCodeEditorView.editor.getModel().getValueInRange(
        viewModel.model.translateBaseRangeToResult(r)
      )
    ).join("\n");
    new MergeEditorOpenContentsFromJSON().run(accessor, {
      data: {
        base,
        input1,
        input2,
        result,
        languageId: viewModel.resultCodeEditorView.editor.getModel().getLanguageId()
      }
    });
  }
}
export {
  MergeEditorOpenContentsFromJSON,
  OpenSelectionInTemporaryMergeEditor
};
