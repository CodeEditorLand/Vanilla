import { NativeParsedArgs } from "vs/platform/environment/common/argv";
import { IDebugParams } from "vs/platform/environment/common/environment";
import { AbstractNativeEnvironmentService } from "vs/platform/environment/common/environmentService";
import { IProductService } from "vs/platform/product/common/productService";
export declare class NativeEnvironmentService extends AbstractNativeEnvironmentService {
    constructor(args: NativeParsedArgs, productService: IProductService);
}
export declare function parsePtyHostDebugPort(args: NativeParsedArgs, isBuilt: boolean): IDebugParams;
export declare function parseSharedProcessDebugPort(args: NativeParsedArgs, isBuilt: boolean): IDebugParams;
