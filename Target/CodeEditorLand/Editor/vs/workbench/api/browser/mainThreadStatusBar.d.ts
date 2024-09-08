import type { IMarkdownString } from "../../../base/common/htmlContent.js";
import type { ThemeColor } from "../../../base/common/themables.js";
import type { Command } from "../../../editor/common/languages.js";
import type { IAccessibilityInformation } from "../../../platform/accessibility/common/accessibility.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadStatusBarShape } from "../common/extHost.protocol.js";
import { IExtensionStatusBarItemService } from "./statusBarExtensionPoint.js";
export declare class MainThreadStatusBar implements MainThreadStatusBarShape {
    private readonly statusbarService;
    private readonly _store;
    constructor(extHostContext: IExtHostContext, statusbarService: IExtensionStatusBarItemService);
    dispose(): void;
    $setEntry(entryId: string, id: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): void;
    $disposeEntry(entryId: string): void;
}
