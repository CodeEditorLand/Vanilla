import { Disposable } from "../../../../base/common/lifecycle.js";
import type { IWorkbenchContribution } from "../../../common/contributions.js";
import type { IExtensionPoint } from "../../../services/extensions/common/extensionsRegistry.js";
import { type ViewsWelcomeExtensionPoint } from "./viewsWelcomeExtensionPoint.js";
export declare class ViewsWelcomeContribution extends Disposable implements IWorkbenchContribution {
    private viewWelcomeContents;
    constructor(extensionPoint: IExtensionPoint<ViewsWelcomeExtensionPoint>);
}
