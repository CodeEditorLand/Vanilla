import { DebugSession } from "../../browser/debugSession.js";
import { type IDebugSessionOptions } from "../../common/debug.js";
import { type DebugModel } from "../../common/debugModel.js";
export declare function createTestSession(model: DebugModel, name?: string, options?: IDebugSessionOptions): DebugSession;
