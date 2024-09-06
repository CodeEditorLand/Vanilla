import { IContextKeyService } from "vs/platform/contextkey/common/contextkey";
import { Variable } from "vs/workbench/contrib/debug/common/debugModel";
/**
 * Gets a context key overlay that has context for the given variable.
 */
export declare function getContextForVariable(parentContext: IContextKeyService, variable: Variable, additionalContext?: [string, unknown][]): any;
