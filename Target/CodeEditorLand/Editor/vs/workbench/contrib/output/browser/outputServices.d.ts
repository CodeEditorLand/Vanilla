import { Event } from "../../../../base/common/event.js";
import { Disposable } from "../../../../base/common/lifecycle.js";
import { URI } from "../../../../base/common/uri.js";
import { ILanguageService } from "../../../../editor/common/languages/language.js";
import type { ITextModel } from "../../../../editor/common/model.js";
import { ITextModelService, type ITextModelContentProvider } from "../../../../editor/common/services/resolverService.js";
import { IContextKeyService } from "../../../../platform/contextkey/common/contextkey.js";
import { IInstantiationService } from "../../../../platform/instantiation/common/instantiation.js";
import { ILoggerService, ILogService } from "../../../../platform/log/common/log.js";
import { IStorageService } from "../../../../platform/storage/common/storage.js";
import { ILifecycleService } from "../../../services/lifecycle/common/lifecycle.js";
import { type IOutputChannel, type IOutputChannelDescriptor, type IOutputService, type OutputChannelUpdateMode } from "../../../services/output/common/output.js";
import { IViewsService } from "../../../services/views/common/viewsService.js";
import { IDefaultLogLevelsService } from "../../logs/common/defaultLogLevels.js";
import type { IOutputChannelModel } from "../common/outputChannelModel.js";
import { IOutputChannelModelService } from "../common/outputChannelModelService.js";
declare class OutputChannel extends Disposable implements IOutputChannel {
    readonly outputChannelDescriptor: IOutputChannelDescriptor;
    scrollLock: boolean;
    readonly model: IOutputChannelModel;
    readonly id: string;
    readonly label: string;
    readonly uri: URI;
    constructor(outputChannelDescriptor: IOutputChannelDescriptor, outputChannelModelService: IOutputChannelModelService, languageService: ILanguageService);
    append(output: string): void;
    update(mode: OutputChannelUpdateMode, till?: number): void;
    clear(): void;
    replace(value: string): void;
}
export declare class OutputService extends Disposable implements IOutputService, ITextModelContentProvider {
    private readonly storageService;
    private readonly instantiationService;
    private readonly logService;
    private readonly loggerService;
    private readonly lifecycleService;
    private readonly viewsService;
    private readonly defaultLogLevelsService;
    readonly _serviceBrand: undefined;
    private channels;
    private activeChannelIdInStorage;
    private activeChannel?;
    private readonly _onActiveOutputChannel;
    readonly onActiveOutputChannel: Event<string>;
    private readonly activeOutputChannelContext;
    private readonly activeFileOutputChannelContext;
    private readonly activeOutputChannelLevelSettableContext;
    private readonly activeOutputChannelLevelContext;
    private readonly activeOutputChannelLevelIsDefaultContext;
    constructor(storageService: IStorageService, instantiationService: IInstantiationService, textModelResolverService: ITextModelService, logService: ILogService, loggerService: ILoggerService, lifecycleService: ILifecycleService, viewsService: IViewsService, contextKeyService: IContextKeyService, defaultLogLevelsService: IDefaultLogLevelsService);
    provideTextContent(resource: URI): Promise<ITextModel> | null;
    showChannel(id: string, preserveFocus?: boolean): Promise<void>;
    getChannel(id: string): OutputChannel | undefined;
    getChannelDescriptor(id: string): IOutputChannelDescriptor | undefined;
    getChannelDescriptors(): IOutputChannelDescriptor[];
    getActiveChannel(): IOutputChannel | undefined;
    private onDidRegisterChannel;
    private createChannel;
    private instantiateChannel;
    private setLevelContext;
    private setLevelIsDefaultContext;
    private setActiveChannel;
}
export {};