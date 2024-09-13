import { EnvironmentVariableService } from "./environmentVariableService.js";
import { InstantiationType, registerSingleton } from "../../../../platform/instantiation/common/extensions.js";
import { IEnvironmentVariableService } from "./environmentVariable.js";
registerSingleton(IEnvironmentVariableService, EnvironmentVariableService, InstantiationType.Delayed);
//# sourceMappingURL=environmentVariable.contribution.js.map
