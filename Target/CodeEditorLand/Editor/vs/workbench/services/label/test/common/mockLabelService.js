import { Emitter } from "../../../../../base/common/event.js";
import {
  Disposable
} from "../../../../../base/common/lifecycle.js";
import { basename, normalize } from "../../../../../base/common/path.js";
class MockLabelService {
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
