import type { VSDataTransfer } from "../../../base/common/dataTransfer.js";
import { type ITreeViewsDnDService as ITreeViewsDnDServiceCommon } from "./treeViewsDnd.js";
export interface ITreeViewsDnDService extends ITreeViewsDnDServiceCommon<VSDataTransfer> {
}
export declare const ITreeViewsDnDService: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITreeViewsDnDService>;
