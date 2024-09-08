import type { IClipboardService } from "../../../../../../platform/clipboard/common/clipboardService.js";
import type { ILogService } from "../../../../../../platform/log/common/log.js";
import type { ICellOutputViewModel } from "../../notebookBrowser.js";
export declare function copyCellOutput(mimeType: string | undefined, outputViewModel: ICellOutputViewModel, clipboardService: IClipboardService, logService: ILogService): Promise<void>;
export declare const TEXT_BASED_MIMETYPES: string[];
