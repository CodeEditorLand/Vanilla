import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
import { IWindowOpenable } from "vs/platform/window/common/window";
export declare const openWindowCommand: (accessor: ServicesAccessor, toOpen: IWindowOpenable[], options?: any) => void;
export declare const newWindowCommand: (accessor: ServicesAccessor, options?: any) => void;
