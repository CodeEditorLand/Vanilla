var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import assert from "assert";
import { isHTMLElement } from "../../browser/dom.js";
import { renderLabelWithIcons } from "../../browser/ui/iconLabel/iconLabels.js";
import { ensureNoDisposablesAreLeakedInTestSuite } from "../common/utils.js";
suite("renderLabelWithIcons", () => {
  test("no icons", () => {
    const result = renderLabelWithIcons(" hello World .");
    assert.strictEqual(elementsToString(result), " hello World .");
  });
  test("icons only", () => {
    const result = renderLabelWithIcons("$(alert)");
    assert.strictEqual(elementsToString(result), '<span class="codicon codicon-alert"></span>');
  });
  test("icon and non-icon strings", () => {
    const result = renderLabelWithIcons(` $(alert) Unresponsive`);
    assert.strictEqual(elementsToString(result), ' <span class="codicon codicon-alert"></span> Unresponsive');
  });
  test("multiple icons", () => {
    const result = renderLabelWithIcons("$(check)$(error)");
    assert.strictEqual(elementsToString(result), '<span class="codicon codicon-check"></span><span class="codicon codicon-error"></span>');
  });
  test("escaped icons", () => {
    const result = renderLabelWithIcons("\\$(escaped)");
    assert.strictEqual(elementsToString(result), "$(escaped)");
  });
  test("icon with animation", () => {
    const result = renderLabelWithIcons("$(zip~anim)");
    assert.strictEqual(elementsToString(result), '<span class="codicon codicon-zip codicon-modifier-anim"></span>');
  });
  const elementsToString = /* @__PURE__ */ __name((elements) => {
    return elements.map((elem) => isHTMLElement(elem) ? elem.outerHTML : elem).reduce((a, b) => a + b, "");
  }, "elementsToString");
  ensureNoDisposablesAreLeakedInTestSuite();
});
//# sourceMappingURL=iconLabels.test.js.map
