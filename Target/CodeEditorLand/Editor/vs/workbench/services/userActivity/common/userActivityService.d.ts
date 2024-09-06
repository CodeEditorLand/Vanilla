import { Event } from "vs/base/common/event";
import { Disposable, IDisposable } from "vs/base/common/lifecycle";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation";
export interface IMarkActiveOptions {
    whenHeldFor?: number;
}
/**
 * Service that observes user activity in the window.
 */
export interface IUserActivityService {
    _serviceBrand: undefined;
    /**
     * Whether the user is currently active.
     */
    readonly isActive: boolean;
    /**
     * Fires when the activity state changes.
     */
    readonly onDidChangeIsActive: Event<boolean>;
    /**
     * Marks the user as being active until the Disposable is disposed of.
     * Multiple consumers call this method; the user will only be considered
     * inactive once all consumers have disposed of their Disposables.
     */
    markActive(opts?: IMarkActiveOptions): IDisposable;
}
export declare const IUserActivityService: any;
export declare class UserActivityService extends Disposable implements IUserActivityService {
    readonly _serviceBrand: undefined;
    private readonly markInactive;
    private readonly changeEmitter;
    private active;
    /**
     * @inheritdoc
     *
     * Note: initialized to true, since the user just did something to open the
     * window. The bundled DomActivityTracker will initially assume activity
     * as well in order to unset this if the window gets abandoned.
     */
    isActive: boolean;
    /** @inheritdoc */
    onDidChangeIsActive: Event<boolean>;
    constructor(instantiationService: IInstantiationService);
    /** @inheritdoc */
    markActive(opts?: IMarkActiveOptions): IDisposable;
}
