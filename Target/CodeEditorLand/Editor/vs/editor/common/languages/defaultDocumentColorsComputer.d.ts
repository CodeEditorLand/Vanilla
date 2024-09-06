import { IPosition } from "vs/editor/common/core/position";
import { IColorInformation } from "vs/editor/common/languages";
export interface IDocumentColorComputerTarget {
    getValue(): string;
    positionAt(offset: number): IPosition;
    findMatches(regex: RegExp): RegExpMatchArray[];
}
/**
 * Returns an array of all default document colors in the provided document
 */
export declare function computeDefaultDocumentColors(model: IDocumentColorComputerTarget): IColorInformation[];
