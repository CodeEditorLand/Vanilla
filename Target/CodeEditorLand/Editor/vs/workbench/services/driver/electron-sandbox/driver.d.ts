import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
interface INativeWindowDriverHelper {
    exitApplication(): Promise<void>;
}
export declare function registerWindowDriver(instantiationService: IInstantiationService, helper: INativeWindowDriverHelper): void;
export {};
