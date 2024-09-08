import { type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import type { IActiveCodeEditor, ICodeEditor } from "../../../browser/editorBrowser.js";
import type { Location } from "../../../common/languages.js";
import type { ClickLinkMouseEvent } from "../../gotoSymbol/browser/link/clickLinkGesture.js";
import type { RenderedInlayHintLabelPart } from "./inlayHintsController.js";
export declare function showGoToContextMenu(accessor: ServicesAccessor, editor: ICodeEditor, anchor: HTMLElement, part: RenderedInlayHintLabelPart): Promise<void>;
export declare function goToDefinitionWithLocation(accessor: ServicesAccessor, event: ClickLinkMouseEvent, editor: IActiveCodeEditor, location: Location): Promise<void>;
