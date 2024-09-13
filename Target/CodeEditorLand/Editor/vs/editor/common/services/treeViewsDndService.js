import {
  InstantiationType,
  registerSingleton
} from "../../../platform/instantiation/common/extensions.js";
import { createDecorator } from "../../../platform/instantiation/common/instantiation.js";
import {
  TreeViewsDnDService
} from "./treeViewsDnd.js";
const ITreeViewsDnDService = createDecorator(
  "treeViewsDndService"
);
registerSingleton(
  ITreeViewsDnDService,
  TreeViewsDnDService,
  InstantiationType.Delayed
);
export {
  ITreeViewsDnDService
};
//# sourceMappingURL=treeViewsDndService.js.map
