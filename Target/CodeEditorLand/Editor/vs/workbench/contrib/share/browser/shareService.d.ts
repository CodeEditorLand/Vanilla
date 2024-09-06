import { CancellationToken } from "vs/base/common/cancellation";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { ICodeEditorService } from "vs/editor/browser/services/codeEditorService";
import { ISubmenuItem } from "vs/platform/actions/common/actions";
import { IContextKey, IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { ILabelService } from "vs/platform/label/common/label";
import { IQuickInputService } from "vs/platform/quickinput/common/quickInput";
import { ITelemetryService } from "vs/platform/telemetry/common/telemetry";
import { IShareableItem, IShareProvider, IShareService } from "vs/workbench/contrib/share/common/share";
export declare const ShareProviderCountContext: any;
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
