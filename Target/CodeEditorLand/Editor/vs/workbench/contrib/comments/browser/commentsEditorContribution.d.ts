import "./media/review.css";
import { type IActiveCodeEditor } from "../../../../editor/browser/editorBrowser.js";
import type { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
export declare function getActiveEditor(accessor: ServicesAccessor): IActiveCodeEditor | null;
