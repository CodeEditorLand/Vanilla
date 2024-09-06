import { Disposable } from "vs/base/common/lifecycle";
import { MainThreadProfileContentHandlersShape } from "vs/workbench/api/common/extHost.protocol";
import { IExtHostContext } from "vs/workbench/services/extensions/common/extHostCustomers";
import { IUserDataProfileImportExportService } from "vs/workbench/services/userDataProfile/common/userDataProfile";
export declare class MainThreadProfileContentHandlers extends Disposable implements MainThreadProfileContentHandlersShape {
    private readonly userDataProfileImportExportService;
    private readonly proxy;
    private readonly registeredHandlers;
    constructor(context: IExtHostContext, userDataProfileImportExportService: IUserDataProfileImportExportService);
    $registerProfileContentHandler(id: string, name: string, description: string | undefined, extensionId: string): Promise<void>;
    $unregisterProfileContentHandler(id: string): Promise<void>;
}
