import { VSBuffer } from "vs/base/common/buffer";
import { Disposable } from "vs/base/common/lifecycle";
import { ICellOutput, IOutputDto, IOutputItemDto } from "vs/workbench/contrib/notebook/common/notebookCommon";
export declare class NotebookCellOutputTextModel extends Disposable implements ICellOutput {
    private _rawOutput;
    private _onDidChangeData;
    onDidChangeData: any;
    get outputs(): any;
    get metadata(): Record<string, any> | undefined;
    get outputId(): string;
    /**
     * Alternative output id that's reused when the output is updated.
     */
    private _alternativeOutputId;
    get alternativeOutputId(): string;
    private _versionId;
    get versionId(): number;
    constructor(_rawOutput: IOutputDto);
    replaceData(rawData: IOutputDto): void;
    appendData(items: IOutputItemDto[]): void;
    private trackBufferLengths;
    private versionedBufferLengths;
    appendedSinceVersion(versionId: number, mime: string): VSBuffer | undefined;
    private optimizeOutputItems;
    asDto(): IOutputDto;
    bumpVersion(): void;
}
