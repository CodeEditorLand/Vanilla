import { CancellationToken } from "../../../../base/common/cancellation.js";
import { URI } from "../../../../base/common/uri.js";
import { MarkerSeverity } from "../../../../platform/markers/common/markers.js";
import { IPosition } from "../../../common/core/position.js";
import { LanguageFeatureRegistry } from "../../../common/languageFeatureRegistry.js";
import { DocumentSymbol, DocumentSymbolProvider } from "../../../common/languages.js";
import { ITextModel } from "../../../common/model.js";
import { ILanguageFeatureDebounceService } from "../../../common/services/languageFeatureDebounce.js";
import { ILanguageFeaturesService } from "../../../common/services/languageFeatures.js";
import { IModelService } from "../../../common/services/model.js";
export declare abstract class TreeElement {
    abstract id: string;
    abstract children: Map<string, TreeElement>;
    abstract parent: TreeElement | undefined;
    remove(): void;
    static findId(candidate: DocumentSymbol | string, container: TreeElement): string;
    static getElementById(id: string, element: TreeElement): TreeElement | undefined;
    static size(element: TreeElement): number;
    static empty(element: TreeElement): boolean;
}
export interface IOutlineMarker {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
    severity: MarkerSeverity;
}
export declare class OutlineElement extends TreeElement {
    readonly id: string;
    parent: TreeElement | undefined;
    readonly symbol: DocumentSymbol;
    children: Map<string, OutlineElement>;
    marker: {
        count: number;
        topSev: MarkerSeverity;
    } | undefined;
    constructor(id: string, parent: TreeElement | undefined, symbol: DocumentSymbol);
}
export declare class OutlineGroup extends TreeElement {
    readonly id: string;
    parent: TreeElement | undefined;
    readonly label: string;
    readonly order: number;
    children: Map<string, OutlineElement>;
    constructor(id: string, parent: TreeElement | undefined, label: string, order: number);
    getItemEnclosingPosition(position: IPosition): OutlineElement | undefined;
    private _getItemEnclosingPosition;
    updateMarker(marker: IOutlineMarker[]): void;
    private _updateMarker;
}
export declare class OutlineModel extends TreeElement {
    readonly uri: URI;
    static create(registry: LanguageFeatureRegistry<DocumentSymbolProvider>, textModel: ITextModel, token: CancellationToken): Promise<OutlineModel>;
    private static _makeOutlineElement;
    static get(element: TreeElement | undefined): OutlineModel | undefined;
    readonly id = "root";
    readonly parent: undefined;
    protected _groups: Map<string, OutlineGroup>;
    children: Map<string, OutlineElement | OutlineGroup>;
    protected constructor(uri: URI);
    private _compact;
    merge(other: OutlineModel): boolean;
    getItemEnclosingPosition(position: IPosition, context?: OutlineElement): OutlineElement | undefined;
    getItemById(id: string): TreeElement | undefined;
    updateMarker(marker: IOutlineMarker[]): void;
    getTopLevelSymbols(): DocumentSymbol[];
    asListOfDocumentSymbols(): DocumentSymbol[];
    private static _flattenDocumentSymbols;
}
export declare const IOutlineModelService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IOutlineModelService>;
export interface IOutlineModelService {
    _serviceBrand: undefined;
    getOrCreate(model: ITextModel, token: CancellationToken): Promise<OutlineModel>;
    getDebounceValue(textModel: ITextModel): number;
}
export declare class OutlineModelService implements IOutlineModelService {
    private readonly _languageFeaturesService;
    _serviceBrand: undefined;
    private readonly _disposables;
    private readonly _debounceInformation;
    private readonly _cache;
    constructor(_languageFeaturesService: ILanguageFeaturesService, debounces: ILanguageFeatureDebounceService, modelService: IModelService);
    dispose(): void;
    getOrCreate(textModel: ITextModel, token: CancellationToken): Promise<OutlineModel>;
    getDebounceValue(textModel: ITextModel): number;
}
