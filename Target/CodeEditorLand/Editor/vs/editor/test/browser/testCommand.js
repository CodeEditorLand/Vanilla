import assert from "assert";
import { DisposableStore } from "../../../base/common/lifecycle.js";
import { instantiateTextModel } from "../common/testTextModel.js";
import {
  createCodeEditorServices,
  instantiateTestCodeEditor
} from "./testCodeEditor.js";
function testCommand(lines, languageId, selection, commandFactory, expectedLines, expectedSelection, forceTokenization, prepare) {
  const disposables = new DisposableStore();
  const instantiationService = createCodeEditorServices(disposables);
  if (prepare) {
    instantiationService.invokeFunction(prepare, disposables);
  }
  const model = disposables.add(
    instantiateTextModel(
      instantiationService,
      lines.join("\n"),
      languageId
    )
  );
  const editor = disposables.add(
    instantiateTestCodeEditor(instantiationService, model)
  );
  const viewModel = editor.getViewModel();
  if (forceTokenization) {
    model.tokenization.forceTokenization(model.getLineCount());
  }
  viewModel.setSelections("tests", [selection]);
  const command = instantiationService.invokeFunction(
    (accessor) => commandFactory(accessor, viewModel.getSelection())
  );
  viewModel.executeCommand(command, "tests");
  assert.deepStrictEqual(model.getLinesContent(), expectedLines);
  const actualSelection = viewModel.getSelection();
  assert.deepStrictEqual(
    actualSelection.toString(),
    expectedSelection.toString()
  );
  disposables.dispose();
}
function getEditOperation(model, command) {
  const operations = [];
  const editOperationBuilder = {
    addEditOperation: (range, text, forceMoveMarkers = false) => {
      operations.push({
        range,
        text,
        forceMoveMarkers
      });
    },
    addTrackedEditOperation: (range, text, forceMoveMarkers = false) => {
      operations.push({
        range,
        text,
        forceMoveMarkers
      });
    },
    trackSelection: (selection) => {
      return "";
    }
  };
  command.getEditOperations(model, editOperationBuilder);
  return operations;
}
export {
  getEditOperation,
  testCommand
};
