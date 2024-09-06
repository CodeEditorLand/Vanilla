import { BrandedService, IConstructorSignature } from "vs/platform/instantiation/common/instantiation";
import { IDetachedTerminalInstance, ITerminalContribution, ITerminalInstance } from "vs/workbench/contrib/terminal/browser/terminal";
import { TerminalWidgetManager } from "vs/workbench/contrib/terminal/browser/widgets/widgetManager";
import { ITerminalProcessInfo, ITerminalProcessManager } from "vs/workbench/contrib/terminal/common/terminal";
/** Constructor compatible with full terminal instances, is assignable to {@link DetachedCompatibleTerminalContributionCtor} */
export type TerminalContributionCtor = IConstructorSignature<ITerminalContribution, [
    ITerminalInstance,
    ITerminalProcessManager,
    TerminalWidgetManager
]>;
/** Constructor compatible with detached terminals */
export type DetachedCompatibleTerminalContributionCtor = IConstructorSignature<ITerminalContribution, [
    IDetachedTerminalInstance,
    ITerminalProcessInfo,
    TerminalWidgetManager
]>;
export type ITerminalContributionDescription = {
    readonly id: string;
} & ({
    readonly canRunInDetachedTerminals: false;
    readonly ctor: TerminalContributionCtor;
} | {
    readonly canRunInDetachedTerminals: true;
    readonly ctor: DetachedCompatibleTerminalContributionCtor;
});
export declare function registerTerminalContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (instance: ITerminalInstance, processManager: ITerminalProcessManager, widgetManager: TerminalWidgetManager, ...services: Services): ITerminalContribution;
}, canRunInDetachedTerminals?: false): void;
export declare function registerTerminalContribution<Services extends BrandedService[]>(id: string, ctor: {
    new (instance: ITerminalInstance, processManager: ITerminalProcessInfo, widgetManager: TerminalWidgetManager, ...services: Services): ITerminalContribution;
}, canRunInDetachedTerminals: true): void;
export declare namespace TerminalExtensionsRegistry {
    function getTerminalContributions(): ITerminalContributionDescription[];
}
