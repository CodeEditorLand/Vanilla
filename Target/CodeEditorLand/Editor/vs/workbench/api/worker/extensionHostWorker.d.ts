import "vs/workbench/api/common/extHost.common.services";
import "vs/workbench/api/worker/extHost.worker.services";
/**
 * Defines the worker entry point. Must be exported and named `create`.
 * @skipMangle
 */
export declare function create(): {
    onmessage: (message: any) => void;
};
