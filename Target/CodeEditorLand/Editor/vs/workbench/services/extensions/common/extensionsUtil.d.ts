import { type IExtensionDescription } from "../../../../platform/extensions/common/extensions.js";
import type { ILogService } from "../../../../platform/log/common/log.js";
export declare function dedupExtensions(system: IExtensionDescription[], user: IExtensionDescription[], workspace: IExtensionDescription[], development: IExtensionDescription[], logService: ILogService): IExtensionDescription[];
