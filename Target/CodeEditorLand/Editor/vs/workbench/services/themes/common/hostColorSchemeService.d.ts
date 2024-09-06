import { Event } from "vs/base/common/event";
export declare const IHostColorSchemeService: any;
export interface IHostColorSchemeService {
    readonly _serviceBrand: undefined;
    readonly dark: boolean;
    readonly highContrast: boolean;
    readonly onDidChangeColorScheme: Event<void>;
}
