import { IClipboardService } from "vs/platform/clipboard/common/clipboardService";
import { ILogService } from "vs/platform/log/common/log";
import { ICellOutputViewModel } from "vs/workbench/contrib/notebook/browser/notebookBrowser";
export declare function copyCellOutput(mimeType: string | undefined, outputViewModel: ICellOutputViewModel, clipboardService: IClipboardService, logService: ILogService): Promise<void>;
export declare const TEXT_BASED_MIMETYPES: string[];
