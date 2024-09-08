import type { Action } from "../../../../base/common/actions.js";
import type { ExtensionIdentifier } from "../../../../platform/extensions/common/extensions.js";
import type { IExtensionHostProfile } from "../../../services/extensions/common/extensions.js";
import { AbstractRuntimeExtensionsEditor, type IRuntimeExtension } from "./abstractRuntimeExtensionsEditor.js";
export declare class RuntimeExtensionsEditor extends AbstractRuntimeExtensionsEditor {
    protected _getProfileInfo(): IExtensionHostProfile | null;
    protected _getUnresponsiveProfile(extensionId: ExtensionIdentifier): IExtensionHostProfile | undefined;
    protected _createSlowExtensionAction(element: IRuntimeExtension): Action | null;
    protected _createReportExtensionIssueAction(element: IRuntimeExtension): Action | null;
    protected _createSaveExtensionHostProfileAction(): Action | null;
    protected _createProfileAction(): Action | null;
}
