import { DisposableStore, IDisposable } from "vs/base/common/lifecycle";
import { URI } from "vs/base/common/uri";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export declare const enum ExplorerExtensions {
    FileContributionRegistry = "workbench.registry.explorer.fileContributions"
}
/**
 * Contributes to the rendering of a file in the explorer.
 */
export interface IExplorerFileContribution extends IDisposable {
    /**
     * Called to render a file in the container. The implementation should
     * remove any rendered elements if `resource` is undefined.
     */
    setResource(resource: URI | undefined): void;
}
export interface IExplorerFileContributionDescriptor {
    create(insta: IInstantiationService, container: HTMLElement): IExplorerFileContribution;
}
export interface IExplorerFileContributionRegistry {
    /**
     * Registers a new contribution. A new instance of the contribution will be
     * instantiated for each template in the explorer.
     */
    register(descriptor: IExplorerFileContributionDescriptor): void;
}
declare class ExplorerFileContributionRegistry implements IExplorerFileContributionRegistry {
    private readonly _onDidRegisterDescriptor;
    readonly onDidRegisterDescriptor: any;
    private readonly descriptors;
    /** @inheritdoc */
    register(descriptor: IExplorerFileContributionDescriptor): void;
    /**
     * Creates a new instance of all registered contributions.
     */
    create(insta: IInstantiationService, container: HTMLElement, store: DisposableStore): IExplorerFileContribution[];
}
export declare const explorerFileContribRegistry: ExplorerFileContributionRegistry;
export {};
