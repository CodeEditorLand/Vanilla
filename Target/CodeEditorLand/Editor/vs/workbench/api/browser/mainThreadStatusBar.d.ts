import { IMarkdownString } from "vs/base/common/htmlContent";
import { ThemeColor } from "vs/base/common/themables";
import { Command } from "vs/editor/common/languages";
import { IAccessibilityInformation } from "vs/platform/accessibility/common/accessibility";
import { IExtensionStatusBarItemService } from "vs/workbench/api/browser/statusBarExtensionPoint";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { MainThreadStatusBarShape } from "../common/extHost.protocol";
export declare class MainThreadStatusBar implements MainThreadStatusBarShape {
    private readonly statusbarService;
    private readonly _store;
    constructor(extHostContext: IExtHostContext, statusbarService: IExtensionStatusBarItemService);
    dispose(): void;
    $setEntry(entryId: string, id: string, extensionId: string | undefined, name: string, text: string, tooltip: IMarkdownString | string | undefined, command: Command | undefined, color: string | ThemeColor | undefined, backgroundColor: ThemeColor | undefined, alignLeft: boolean, priority: number | undefined, accessibilityInformation: IAccessibilityInformation | undefined): void;
    $disposeEntry(entryId: string): void;
}
