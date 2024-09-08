import { Disposable } from "../../../base/common/lifecycle.js";
import type { URI } from "../../../base/common/uri.js";
import type { ExtensionIdentifier } from "../../../platform/extensions/common/extensions.js";
import { INotificationService } from "../../../platform/notification/common/notification.js";
import { IOpenerService } from "../../../platform/opener/common/opener.js";
import { IStorageService } from "../../../platform/storage/common/storage.js";
import { IExternalUriOpenerService, type IExternalOpenerProvider, type IExternalUriOpener } from "../../contrib/externalUriOpener/common/externalUriOpenerService.js";
import { IExtensionService } from "../../services/extensions/common/extensions.js";
import { type IExtHostContext } from "../../services/extensions/common/extHostCustomers.js";
import { type MainThreadUriOpenersShape } from "../common/extHost.protocol.js";
export declare class MainThreadUriOpeners extends Disposable implements MainThreadUriOpenersShape, IExternalOpenerProvider {
    private readonly extensionService;
    private readonly openerService;
    private readonly notificationService;
    private readonly proxy;
    private readonly _registeredOpeners;
    private readonly _contributedExternalUriOpenersStore;
    constructor(context: IExtHostContext, storageService: IStorageService, externalUriOpenerService: IExternalUriOpenerService, extensionService: IExtensionService, openerService: IOpenerService, notificationService: INotificationService);
    getOpeners(targetUri: URI): AsyncIterable<IExternalUriOpener>;
    private createOpener;
    $registerUriOpener(id: string, schemes: readonly string[], extensionId: ExtensionIdentifier, label: string): Promise<void>;
    $unregisterUriOpener(id: string): Promise<void>;
    dispose(): void;
}
