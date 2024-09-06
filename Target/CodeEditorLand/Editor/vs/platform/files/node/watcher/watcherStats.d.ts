import { IUniversalWatchRequest } from "vs/platform/files/common/watcher";
import { NodeJSWatcher } from "vs/platform/files/node/watcher/nodejs/nodejsWatcher";
import { ParcelWatcher } from "vs/platform/files/node/watcher/parcel/parcelWatcher";
export declare function computeStats(requests: IUniversalWatchRequest[], recursiveWatcher: ParcelWatcher, nonRecursiveWatcher: NodeJSWatcher): string;
