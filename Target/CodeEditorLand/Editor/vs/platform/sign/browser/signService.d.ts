import { IProductService } from "../../product/common/productService.js";
import { AbstractSignService, type IVsdaValidator } from "../common/abstractSignService.js";
import type { ISignService } from "../common/sign.js";
export declare class SignService extends AbstractSignService implements ISignService {
    private readonly productService;
    constructor(productService: IProductService);
    protected getValidator(): Promise<IVsdaValidator>;
    protected signValue(arg: string): Promise<string>;
    private vsda;
    private getWasmBytes;
}
