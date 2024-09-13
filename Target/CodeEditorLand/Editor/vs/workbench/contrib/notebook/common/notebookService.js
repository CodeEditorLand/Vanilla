var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const INotebookService = createDecorator("notebookService");
class SimpleNotebookProviderInfo {
  constructor(viewType, serializer, extensionData) {
    this.viewType = viewType;
    this.serializer = serializer;
    this.extensionData = extensionData;
  }
  static {
    __name(this, "SimpleNotebookProviderInfo");
  }
}
export {
  INotebookService,
  SimpleNotebookProviderInfo
};
//# sourceMappingURL=notebookService.js.map
