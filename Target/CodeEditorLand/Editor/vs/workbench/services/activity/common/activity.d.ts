import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import { ThemeIcon } from "vs/base/common/themables";
import { ViewContainer } from "vs/workbench/common/views";
export interface IActivity {
    readonly badge: IBadge;
    readonly priority?: number;
}
export declare const IActivityService: any;
export interface IActivityService {
    readonly _serviceBrand: undefined;
    /**
     * Emitted when activity changes for a view container or when the activity of the global actions change.
     */
    readonly onDidChangeActivity: Event<string | ViewContainer>;
    /**
     * Show activity for the given view container
     */
    showViewContainerActivity(viewContainerId: string, badge: IActivity): IDisposable;
    /**
     * Returns the activity for the given view container
     */
    getViewContainerActivities(viewContainerId: string): IActivity[];
    /**
     * Show activity for the given view
     */
    showViewActivity(viewId: string, badge: IActivity): IDisposable;
    /**
     * Show accounts activity
     */
    showAccountsActivity(activity: IActivity): IDisposable;
    /**
     * Show global activity
     */
    showGlobalActivity(activity: IActivity): IDisposable;
    /**
     * Return the activity for the given action
     */
    getActivity(id: string): IActivity[];
}
export interface IBadge {
    getDescription(): string;
}
declare class BaseBadge implements IBadge {
    readonly descriptorFn: (arg: any) => string;
    constructor(descriptorFn: (arg: any) => string);
    getDescription(): string;
}
export declare class NumberBadge extends BaseBadge {
    readonly number: number;
    constructor(number: number, descriptorFn: (num: number) => string);
    getDescription(): string;
}
export declare class IconBadge extends BaseBadge {
    readonly icon: ThemeIcon;
    constructor(icon: ThemeIcon, descriptorFn: () => string);
}
export declare class ProgressBadge extends BaseBadge {
}
export {};
