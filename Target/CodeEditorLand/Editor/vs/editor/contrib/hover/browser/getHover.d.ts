import { AsyncIterableObject } from "vs/base/common/async";
import { CancellationToken } from "vs/base/common/cancellation";
import { Position } from "vs/editor/common/core/position";
import { LanguageFeatureRegistry } from "vs/editor/common/languageFeatureRegistry";
import { Hover, HoverProvider } from "vs/editor/common/languages";
import { ITextModel } from "vs/editor/common/model";
export declare class HoverProviderResult {
    readonly provider: HoverProvider;
    readonly hover: Hover;
    readonly ordinal: number;
    constructor(provider: HoverProvider, hover: Hover, ordinal: number);
}
export declare function getHoverProviderResultsAsAsyncIterable(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): AsyncIterableObject<HoverProviderResult>;
export declare function getHoversPromise(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): Promise<Hover[]>;
