import type { Color } from "../../base/common/color.js";
import { type Event } from "../../base/common/event.js";
import { type IDisposable } from "../../base/common/lifecycle.js";
import type { ILazyTokenizationSupport, ITokenizationRegistry, ITokenizationSupportChangedEvent } from "./languages.js";
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