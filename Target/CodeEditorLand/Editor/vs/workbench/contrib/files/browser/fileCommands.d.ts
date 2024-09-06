import { ServicesAccessor } from "../../../../platform/instantiation/common/instantiation.js";
import { IOpenEmptyWindowOptions, IOpenWindowOptions, IWindowOpenable } from "../../../../platform/window/common/window.js";
export declare const openWindowCommand: (accessor: ServicesAccessor, toOpen: IWindowOpenable[], options?: IOpenWindowOptions) => void;
export declare const newWindowCommand: (accessor: ServicesAccessor, options?: IOpenEmptyWindowOptions) => void;
