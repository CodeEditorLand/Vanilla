import { CancellationToken } from "vs/base/common/cancellation";
import { Event } from "vs/base/common/event";
import { IDisposable } from "vs/base/common/lifecycle";
import Severity from "vs/base/common/severity";
import { Command } from "vs/editor/common/languages";
import { LanguageSelector } from "vs/editor/common/languageSelector";
import { ITextModel } from "vs/editor/common/model";
import { IAccessibilityInformation } from "vs/platform/accessibility/common/accessibility";
export interface ILanguageStatus {
    readonly id: string;
    readonly name: string;
    readonly selector: LanguageSelector;
    readonly severity: Severity;
    readonly label: string | {
        value: string;
        shortValue: string;
    };
    readonly detail: string;
    readonly busy: boolean;
    readonly source: string;
    readonly command: Command | undefined;
    readonly accessibilityInfo: IAccessibilityInformation | undefined;
}
export interface ILanguageStatusProvider {
    provideLanguageStatus(langId: string, token: CancellationToken): Promise<ILanguageStatus | undefined>;
}
export declare const ILanguageStatusService: any;
export interface ILanguageStatusService {
    _serviceBrand: undefined;
    onDidChange: Event<void>;
    addStatus(status: ILanguageStatus): IDisposable;
    getLanguageStatus(model: ITextModel): ILanguageStatus[];
}
