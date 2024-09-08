import {
  InstantiationType,
  registerSingleton
} from "../../../../platform/instantiation/common/extensions.js";
import { IElevatedFileService } from "../common/elevatedFileService.js";
class BrowserElevatedFileService {
  _serviceBrand;
  isSupported(resource) {
    return false;
  }
  async writeFileElevated(resource, value, options) {
    throw new Error("Unsupported");
  }
}
registerSingleton(
  IElevatedFileService,
  BrowserElevatedFileService,
  InstantiationType.Delayed
);
export {
  BrowserElevatedFileService
};
