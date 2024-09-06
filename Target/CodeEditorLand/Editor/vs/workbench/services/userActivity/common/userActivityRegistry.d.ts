import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
import { IUserActivityService } from "vs/workbench/services/userActivity/common/userActivityService";
declare class UserActivityRegistry {
    private todo;
    add: (ctor: {
        new (s: IUserActivityService, ...args: any[]): any;
    }) => void;
    take(userActivityService: IUserActivityService, instantiation: IInstantiationService): void;
}
export declare const userActivityRegistry: UserActivityRegistry;
export {};
