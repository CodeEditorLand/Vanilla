import { Action2 } from "vs/platform/actions/common/actions";
import { ServicesAccessor } from "vs/platform/instantiation/common/instantiation";
export declare class ShowSignalSoundHelp extends Action2 {
    static readonly ID = "signals.sounds.help";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class ShowAccessibilityAnnouncementHelp extends Action2 {
    static readonly ID = "accessibility.announcement.help";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
