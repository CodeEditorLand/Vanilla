import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IThemeService } from "vs/platform/theme/common/themeService";
import { IUriIdentityService } from "vs/platform/uriIdentity/common/uriIdentity";
import { IDecoration, IDecorationsProvider, IDecorationsService, IResourceDecorationChangeEvent } from "../common/decorations";
export declare class DecorationsService implements IDecorationsService {
    _serviceBrand: undefined;
    private readonly _store;
    private readonly _onDidChangeDecorationsDelayed;
    private readonly _onDidChangeDecorations;
    onDidChangeDecorations: Event<IResourceDecorationChangeEvent>;
    private readonly _provider;
    private readonly _decorationStyles;
    private readonly _data;
    constructor(uriIdentityService: IUriIdentityService, themeService: IThemeService);
    dispose(): void;
    registerDecorationsProvider(provider: IDecorationsProvider): IDisposable;
    private _ensureEntry;
    getDecoration(uri: URI, includeChildren: boolean): IDecoration | undefined;
    private _fetchData;
    private _keepItem;
}
