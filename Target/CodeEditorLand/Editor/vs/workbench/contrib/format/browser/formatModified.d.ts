import { type ServicesAccessor } from "../../../../editor/browser/editorExtensions.js";
import { Range } from "../../../../editor/common/core/range.js";
import { type ITextModel } from "../../../../editor/common/model.js";
export declare function getModifiedRanges(accessor: ServicesAccessor, modified: ITextModel): Promise<Range[] | undefined | null>;