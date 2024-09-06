import { IExtensionManifest } from "../../extensions/common/extensions.js";
import { ExtensionManagementError } from "../common/extensionManagement.js";
export declare function fromExtractError(e: Error): ExtensionManagementError;
export declare function getManifest(vsixPath: string): Promise<IExtensionManifest>;
