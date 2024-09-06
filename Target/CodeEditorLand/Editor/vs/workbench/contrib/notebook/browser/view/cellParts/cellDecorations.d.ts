import { ICellViewModel } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class CellDecorations extends CellContentPart {
    readonly rootContainer: HTMLElement;
    readonly decorationContainer: HTMLElement;
    constructor(rootContainer: HTMLElement, decorationContainer: HTMLElement);
    didRenderCell(element: ICellViewModel): void;
}
