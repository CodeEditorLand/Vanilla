import type { IDisposable } from "../../../base/common/lifecycle.js";
import { type IObservable, type IReader } from "../../../base/common/observable.js";
import type { IConfigurationService } from "../../configuration/common/configuration.js";
import type { ContextKeyValue, IContextKeyService, RawContextKey } from "../../contextkey/common/contextkey.js";
/** Creates an observable update when a configuration key updates. */
export declare function observableConfigValue<T>(key: string, defaultValue: T, configurationService: IConfigurationService): IObservable<T>;
/** Update the configuration key with a value derived from observables. */
export declare function bindContextKey<T extends ContextKeyValue>(key: RawContextKey<T>, service: IContextKeyService, computeValue: (reader: IReader) => T): IDisposable;
