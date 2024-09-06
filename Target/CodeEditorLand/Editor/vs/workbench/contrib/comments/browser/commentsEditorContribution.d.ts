import "vs/css!./media/review";
import { IActiveCodeEditor } from "vs/editor/browser/editorBrowser";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare function getActiveEditor(accessor: ServicesAccessor): IActiveCodeEditor | null;
