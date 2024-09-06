import { AbstractSignService, IVsdaValidator } from "vs/platform/sign/common/abstractSignService";
import { ISignService } from "vs/platform/sign/common/sign";
export declare class SignService extends AbstractSignService implements ISignService {
    protected getValidator(): Promise<IVsdaValidator>;
    protected signValue(arg: string): Promise<string>;
    private vsda;
}
