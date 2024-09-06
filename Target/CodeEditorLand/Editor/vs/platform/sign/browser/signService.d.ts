import { IProductService } from "vs/platform/product/common/productService";
import { AbstractSignService, IVsdaValidator } from "vs/platform/sign/common/abstractSignService";
import { ISignService } from "vs/platform/sign/common/sign";
export declare class SignService extends AbstractSignService implements ISignService {
    private readonly productService;
    constructor(productService: IProductService);
    protected getValidator(): Promise<IVsdaValidator>;
    protected signValue(arg: string): Promise<string>;
    private vsda;
    private getWasmBytes;
}
