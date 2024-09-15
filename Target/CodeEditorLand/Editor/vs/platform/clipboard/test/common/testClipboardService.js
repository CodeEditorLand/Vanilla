var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { URI } from "../../../../base/common/uri.js";
import { IClipboardService } from "../../common/clipboardService.js";
class TestClipboardService {
  static {
    __name(this, "TestClipboardService");
  }
  _serviceBrand;
  text = void 0;
  async writeText(text, type) {
    this.text = text;
  }
  async readText(type) {
    return this.text ?? "";
  }
  findText = void 0;
  async readFindText() {
    return this.findText ?? "";
  }
  async writeFindText(text) {
    this.findText = text;
  }
  resources = void 0;
  async writeResources(resources) {
    this.resources = resources;
  }
  async readResources() {
    return this.resources ?? [];
  }
  async hasResources() {
    return Array.isArray(this.resources) && this.resources.length > 0;
  }
}
export {
  TestClipboardService
};
//# sourceMappingURL=testClipboardService.js.map
