import { type IUniversalWatchRequest } from "../../common/watcher.js";
import type { NodeJSWatcher } from "./nodejs/nodejsWatcher.js";
import type { ParcelWatcher } from "./parcel/parcelWatcher.js";
export declare function computeStats(requests: IUniversalWatchRequest[], recursiveWatcher: ParcelWatcher, nonRecursiveWatcher: NodeJSWatcher): string;
