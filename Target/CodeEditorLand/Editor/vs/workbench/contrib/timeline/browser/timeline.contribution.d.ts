import { ILocalizedString } from "vs/platform/action/common/action";
import { IViewDescriptor } from "vs/workbench/common/views";
export declare class TimelinePaneDescriptor implements IViewDescriptor {
    readonly id: any;
    readonly name: ILocalizedString;
    readonly containerIcon: any;
    readonly ctorDescriptor: any;
    readonly order = 2;
    readonly weight = 30;
    readonly collapsed = true;
    readonly canToggleVisibility = true;
    readonly hideByDefault = false;
    readonly canMoveView = true;
    readonly when: any;
    focusCommand: {
        id: string;
    };
}
