import { process } from "../../../../base/parts/sandbox/electron-sandbox/globals.js";
import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../../platform/instantiation/common/instantiation.js";
const IShellEnvironmentService = createDecorator("shellEnvironmentService");
class ShellEnvironmentService {
  getShellEnv() {
    return process.shellEnv();
  }
}
registerSingleton(
  IShellEnvironmentService,
  ShellEnvironmentService,
  InstantiationType.Delayed
);
export {
  IShellEnvironmentService,
  ShellEnvironmentService
};
