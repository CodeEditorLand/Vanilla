import type { IJSONSchema } from "../../../../base/common/jsonSchema.js";
import * as extensionsRegistry from "../../../services/extensions/common/extensionsRegistry.js";
import type { IBreakpointContribution, IDebuggerContribution } from "./debug.js";
export declare const debuggersExtPoint: extensionsRegistry.IExtensionPoint<IDebuggerContribution[]>;
export declare const breakpointsExtPoint: extensionsRegistry.IExtensionPoint<IBreakpointContribution[]>;
export declare const presentationSchema: IJSONSchema;
export declare const launchSchema: IJSONSchema;
