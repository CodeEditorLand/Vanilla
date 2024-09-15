import assert from "assert";
import { Selection } from "../../../common/core/selection.js";
import { withTestCodeEditor } from "../testCodeEditor.js";
suite("Editor Controller", () => {
  test("issue #23913: Greater than 1000+ multi cursor typing replacement text appears inverted, lines begin to drop off selection", function() {
    this.timeout(1e4);
    const LINE_CNT = 2e3;
    const text = [];
    for (let i = 0; i < LINE_CNT; i++) {
      text[i] = "asd";
    }
    withTestCodeEditor(text, {}, (editor, viewModel) => {
      const model = editor.getModel();
      const selections = [];
      for (let i = 0; i < LINE_CNT; i++) {
        selections[i] = new Selection(i + 1, 1, i + 1, 1);
      }
      viewModel.setSelections("test", selections);
      viewModel.type("n", "keyboard");
      viewModel.type("n", "keyboard");
      for (let i = 0; i < LINE_CNT; i++) {
        assert.strictEqual(model.getLineContent(i + 1), "nnasd", "line #" + (i + 1));
      }
      assert.strictEqual(viewModel.getSelections().length, LINE_CNT);
      assert.strictEqual(viewModel.getSelections()[LINE_CNT - 1].startLineNumber, LINE_CNT);
    });
  });
});
//# sourceMappingURL=cursor.integrationTest.js.map
