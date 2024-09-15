import assert from "assert";
import { IListRenderer, IListVirtualDelegate } from "../../../../browser/ui/list/list.js";
import { ListView } from "../../../../browser/ui/list/listView.js";
import { range } from "../../../../common/arrays.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../../../common/utils.js";
suite("ListView", function() {
  ensureNoDisposablesAreLeakedInTestSuite();
  test("all rows get disposed", function() {
    const element = document.createElement("div");
    element.style.height = "200px";
    element.style.width = "200px";
    const delegate = {
      getHeight() {
        return 20;
      },
      getTemplateId() {
        return "template";
      }
    };
    let templatesCount = 0;
    const renderer = {
      templateId: "template",
      renderTemplate() {
        templatesCount++;
      },
      renderElement() {
      },
      disposeTemplate() {
        templatesCount--;
      }
    };
    const listView = new ListView(element, delegate, [renderer]);
    listView.layout(200);
    assert.strictEqual(templatesCount, 0, "no templates have been allocated");
    listView.splice(0, 0, range(100));
    assert.strictEqual(templatesCount, 10, "some templates have been allocated");
    listView.dispose();
    assert.strictEqual(templatesCount, 0, "all templates have been disposed");
  });
});
//# sourceMappingURL=listView.test.js.map
