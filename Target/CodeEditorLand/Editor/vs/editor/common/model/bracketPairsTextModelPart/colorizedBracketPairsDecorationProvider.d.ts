import { Disposable } from "../../../../base/common/lifecycle.js";
import { Range } from "../../core/range.js";
import type { IModelDecoration } from "../../model.js";
import type { IModelOptionsChangedEvent } from "../../textModelEvents.js";
import type { DecorationProvider } from "../decorationProvider.js";
import type { TextModel } from "../textModel.js";
export declare class ColorizedBracketPairsDecorationProvider extends Disposable implements DecorationProvider {
    private readonly textModel;
    private colorizationOptions;
    private readonly colorProvider;
    private readonly onDidChangeEmitter;
    readonly onDidChange: import("../../../../base/common/event.js").Event<void>;
    constructor(textModel: TextModel);
    handleDidChangeOptions(e: IModelOptionsChangedEvent): void;
    getDecorationsInRange(range: Range, ownerId?: number, filterOutValidation?: boolean, onlyMinimapDecorations?: boolean): IModelDecoration[];
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
}
