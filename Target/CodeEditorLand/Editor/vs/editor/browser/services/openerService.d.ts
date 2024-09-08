import type { IDisposable } from "../../../base/common/lifecycle.js";
import { URI } from "../../../base/common/uri.js";
import { ICommandService } from "../../../platform/commands/common/commands.js";
import { type IExternalOpener, type IExternalUriResolver, type IOpener, type IOpenerService, type IResolvedExternalUri, type IValidator, type OpenOptions, type ResolveExternalUriOptions } from "../../../platform/opener/common/opener.js";
import { ICodeEditorService } from "./codeEditorService.js";
export declare class OpenerService implements IOpenerService {
    readonly _serviceBrand: undefined;
    private readonly _openers;
    private readonly _validators;
    private readonly _resolvers;
    private readonly _resolvedUriTargets;
    private _defaultExternalOpener;
    private readonly _externalOpeners;
    constructor(editorService: ICodeEditorService, commandService: ICommandService);
    registerOpener(opener: IOpener): IDisposable;
    registerValidator(validator: IValidator): IDisposable;
    registerExternalUriResolver(resolver: IExternalUriResolver): IDisposable;
    setDefaultExternalOpener(externalOpener: IExternalOpener): void;
    registerExternalOpener(opener: IExternalOpener): IDisposable;
    open(target: URI | string, options?: OpenOptions): Promise<boolean>;
    resolveExternalUri(resource: URI, options?: ResolveExternalUriOptions): Promise<IResolvedExternalUri>;
    private _doOpenExternal;
    dispose(): void;
}
