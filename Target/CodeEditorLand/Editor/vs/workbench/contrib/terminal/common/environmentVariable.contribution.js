import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IEnvironmentVariableService } from "./environmentVariable.js";
import { EnvironmentVariableService } from "./environmentVariableService.js";
registerSingleton(
  IEnvironmentVariableService,
  EnvironmentVariableService,
  InstantiationType.Delayed
);
