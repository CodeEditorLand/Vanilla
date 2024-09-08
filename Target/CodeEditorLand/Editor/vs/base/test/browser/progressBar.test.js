import assert from "assert";
import { ProgressBar } from "../../browser/ui/progressbar/progressbar.js";
import { mainWindow } from "../../browser/window.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("ProgressBar", () => {
  let fixture;
  setup(() => {
    fixture = document.createElement("div");
    mainWindow.document.body.appendChild(fixture);
  });
  teardown(() => {
    fixture.remove();
  });
  test("Progress Bar", () => {
    const bar = new ProgressBar(fixture);
    assert(bar.infinite());
    assert(bar.total(100));
    assert(bar.worked(50));
    assert(bar.setWorked(70));
    assert(bar.worked(30));
    assert(bar.done());
    bar.dispose();
  });
  ensureNoDisposablesAreLeakedInTestSuite();
});
