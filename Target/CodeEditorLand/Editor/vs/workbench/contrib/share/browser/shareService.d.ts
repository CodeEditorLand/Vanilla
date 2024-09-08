import type { CancellationToken } from "../../../../base/common/cancellation.js";
import type { IDisposable } from "../../../../base/common/lifecycle.js";
import type { URI } from "../../../../base/common/uri.js";
import { ICodeEditorService } from "../../../../editor/browser/services/codeEditorService.js";
import type { ISubmenuItem } from "../../../../platform/actions/common/actions.js";
import { IContextKeyService, RawContextKey, type IContextKey } from "../../../../platform/contextkey/common/contextkey.js";
import { ILabelService } from "../../../../platform/label/common/label.js";
import { IQuickInputService } from "../../../../platform/quickinput/common/quickInput.js";
import { ITelemetryService } from "../../../../platform/telemetry/common/telemetry.js";
import type { IShareableItem, IShareProvider, IShareService } from "../common/share.js";
export declare const ShareProviderCountContext: RawContextKey<number>;
export declare class ShareService implements IShareService {
    private contextKeyService;
    private readonly labelService;
    private quickInputService;
    private readonly codeEditorService;
    private readonly telemetryService;
    readonly _serviceBrand: undefined;
    readonly providerCount: IContextKey<number>;
    private readonly _providers;
    constructor(contextKeyService: IContextKeyService, labelService: ILabelService, quickInputService: IQuickInputService, codeEditorService: ICodeEditorService, telemetryService: ITelemetryService);
    registerShareProvider(provider: IShareProvider): IDisposable;
    getShareActions(): ISubmenuItem[];
    provideShare(item: IShareableItem, token: CancellationToken): Promise<URI | string | undefined>;
}
