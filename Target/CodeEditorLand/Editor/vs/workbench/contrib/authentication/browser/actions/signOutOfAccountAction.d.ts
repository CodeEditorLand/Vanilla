import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class SignOutOfAccountAction extends Action2 {
    constructor();
    run(accessor: ServicesAccessor, { providerId, accountLabel, }: {
        providerId: string;
        accountLabel: string;
    }): Promise<void>;
}
