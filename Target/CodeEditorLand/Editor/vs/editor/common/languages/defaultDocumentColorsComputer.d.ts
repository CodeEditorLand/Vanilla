import type { IPosition } from "../core/position.js";
import type { IColorInformation } from "../languages.js";
export interface IDocumentColorComputerTarget {
    getValue(): string;
    positionAt(offset: number): IPosition;
    findMatches(regex: RegExp): RegExpMatchArray[];
}
/**
 * Returns an array of all default document colors in the provided document
 */
export declare function computeDefaultDocumentColors(model: IDocumentColorComputerTarget): IColorInformation[];
