import { AsyncIterableObject } from "../../../../base/common/async.js";
import { CancellationToken } from "../../../../base/common/cancellation.js";
import type { Position } from "../../../common/core/position.js";
import type { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import type { Hover, HoverProvider } from "../../../common/languages.js";
import type { ITextModel } from "../../../common/model.js";
export declare class HoverProviderResult {
    readonly provider: HoverProvider;
    readonly hover: Hover;
    readonly ordinal: number;
    constructor(provider: HoverProvider, hover: Hover, ordinal: number);
}
export declare function getHoverProviderResultsAsAsyncIterable(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): AsyncIterableObject<HoverProviderResult>;
export declare function getHoversPromise(registry: LanguageFeatureRegistry<HoverProvider>, model: ITextModel, position: Position, token: CancellationToken, recursive?: boolean): Promise<Hover[]>;
