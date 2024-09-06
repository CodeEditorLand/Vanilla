import { IProcessEnvironment } from "vs/base/common/platform";
export declare const IShellEnvironmentService: any;
export interface IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
export declare class ShellEnvironmentService implements IShellEnvironmentService {
    readonly _serviceBrand: undefined;
    getShellEnv(): Promise<IProcessEnvironment>;
}
