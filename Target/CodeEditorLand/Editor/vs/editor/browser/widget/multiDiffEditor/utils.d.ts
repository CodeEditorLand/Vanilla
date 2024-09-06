import { ActionRunner, IAction } from "vs/base/common/actions";
export declare class ActionRunnerWithContext extends ActionRunner {
    private readonly _getContext;
    constructor(_getContext: () => unknown);
    protected runAction(action: IAction, _context?: unknown): Promise<void>;
}
