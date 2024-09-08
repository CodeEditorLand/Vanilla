import { type ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { type IOpenEmptyWindowOptions, type IOpenWindowOptions, type IWindowOpenable } from "../../../../platform/window/common/window.js";
export declare const openWindowCommand: (accessor: ServicesAccessor, toOpen: IWindowOpenable[], options?: IOpenWindowOptions) => void;
export declare const newWindowCommand: (accessor: ServicesAccessor, options?: IOpenEmptyWindowOptions) => void;
