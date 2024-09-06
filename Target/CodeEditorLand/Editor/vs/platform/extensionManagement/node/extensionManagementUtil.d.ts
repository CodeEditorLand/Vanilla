import { ExtensionManagementError } from "vs/platform/extensionManagement/common/extensionManagement";
import { IExtensionManifest } from "vs/platform/extensions/common/extensions";
export declare function fromExtractError(e: Error): ExtensionManagementError;
export declare function getManifest(vsixPath: string): Promise<IExtensionManifest>;
