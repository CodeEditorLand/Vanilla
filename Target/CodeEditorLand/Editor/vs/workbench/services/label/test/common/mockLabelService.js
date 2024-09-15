var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Emitter, Event } from "../../../../../base/common/event.js";
import { Disposable, IDisposable } from "../../../../../base/common/lifecycle.js";
import { basename, normalize } from "../../../../../base/common/path.js";
import { URI } from "../../../../../base/common/uri.js";
import { IFormatterChangeEvent, ILabelService, ResourceLabelFormatter, Verbosity } from "../../../../../platform/label/common/label.js";
import { IWorkspace, IWorkspaceIdentifier } from "../../../../../platform/workspace/common/workspace.js";
class MockLabelService {
  static {
    __name(this, "MockLabelService");
  }
  _serviceBrand;
  registerCachedFormatter(formatter) {
    throw new Error("Method not implemented.");
  }
  getUriLabel(resource, options) {
    return normalize(resource.fsPath);
  }
  getUriBasenameLabel(resource) {
    return basename(resource.fsPath);
  }
  getWorkspaceLabel(workspace, options) {
    return "";
  }
  getHostLabel(scheme, authority) {
    return "";
  }
  getHostTooltip() {
    return "";
  }
  getSeparator(scheme, authority) {
    return "/";
  }
  registerFormatter(formatter) {
    return Disposable.None;
  }
  onDidChangeFormatters = new Emitter().event;
}
export {
  MockLabelService
};
//# sourceMappingURL=mockLabelService.js.map
