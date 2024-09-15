var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { IWorkbenchAssignmentService } from "../../common/assignmentService.js";
class NullWorkbenchAssignmentService {
  static {
    __name(this, "NullWorkbenchAssignmentService");
  }
  _serviceBrand;
  async getCurrentExperiments() {
    return [];
  }
  async getTreatment(name) {
    return void 0;
  }
}
export {
  NullWorkbenchAssignmentService
};
//# sourceMappingURL=nullAssignmentService.js.map
