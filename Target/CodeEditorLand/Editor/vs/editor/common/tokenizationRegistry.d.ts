import { Color } from "vs/base/common/color";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ILazyTokenizationSupport, ITokenizationRegistry, ITokenizationSupportChangedEvent } from "vs/editor/common/languages";
export declare class TokenizationRegistry<TSupport> implements ITokenizationRegistry<TSupport> {
    private readonly _tokenizationSupports;
    private readonly _factories;
    private readonly _onDidChange;
    readonly onDidChange: Event<ITokenizationSupportChangedEvent>;
    private _colorMap;
    constructor();
    handleChange(languageIds: string[]): void;
    register(languageId: string, support: TSupport): IDisposable;
    get(languageId: string): TSupport | null;
    registerFactory(languageId: string, factory: ILazyTokenizationSupport<TSupport>): IDisposable;
    getOrCreate(languageId: string): Promise<TSupport | null>;
    isResolved(languageId: string): boolean;
    setColorMap(colorMap: Color[]): void;
    getColorMap(): Color[] | null;
    getDefaultBackground(): Color | null;
}
