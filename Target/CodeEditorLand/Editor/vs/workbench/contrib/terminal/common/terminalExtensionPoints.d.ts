import { IExtensionTerminalProfile } from "vs/platform/terminal/common/terminal";
export interface ITerminalContributionService {
    readonly _serviceBrand: undefined;
    readonly terminalProfiles: ReadonlyArray<IExtensionTerminalProfile>;
}
export declare const ITerminalContributionService: any;
export declare class TerminalContributionService implements ITerminalContributionService {
    _serviceBrand: undefined;
    private _terminalProfiles;
    get terminalProfiles(): readonly IExtensionTerminalProfile[];
    constructor();
}
