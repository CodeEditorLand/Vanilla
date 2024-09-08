import { IEnvironmentService } from "../../../../platform/environment/common/environment.js";
import { refineServiceDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IWorkbenchEnvironmentService = refineServiceDecorator(IEnvironmentService);
export {
  IWorkbenchEnvironmentService
};
