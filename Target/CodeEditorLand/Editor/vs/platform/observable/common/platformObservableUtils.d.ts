import { IDisposable } from "vs/base/common/lifecycle";
import { IObservable, IReader } from "vs/base/common/observable";
import { IConfigurationService } from "vs/platform/configuration/common/configuration";
import { ContextKeyValue, IContextKeyService, RawContextKey } from "vs/platform/contextkey/common/contextkey";
/** Creates an observable update when a configuration key updates. */
export declare function observableConfigValue<T>(key: string, defaultValue: T, configurationService: IConfigurationService): IObservable<T>;
/** Update the configuration key with a value derived from observables. */
export declare function bindContextKey<T extends ContextKeyValue>(key: RawContextKey<T>, service: IContextKeyService, computeValue: (reader: IReader) => T): IDisposable;
