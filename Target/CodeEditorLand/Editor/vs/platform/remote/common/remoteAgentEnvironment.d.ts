import type * as performance from "../../../base/common/performance.js";
import type { OperatingSystem } from "../../../base/common/platform.js";
import type { URI } from "../../../base/common/uri.js";
import type { IUserDataProfile } from "../../userDataProfile/common/userDataProfile.js";
export interface IRemoteAgentEnvironment {
    pid: number;
    connectionToken: string;
    appRoot: URI;
    settingsPath: URI;
    logsPath: URI;
    extensionHostLogsPath: URI;
    globalStorageHome: URI;
    workspaceStorageHome: URI;
    localHistoryHome: URI;
    userHome: URI;
    os: OperatingSystem;
    arch: string;
    marks: performance.PerformanceMark[];
    useHostProxy: boolean;
    profiles: {
        all: IUserDataProfile[];
        home: URI;
    };
    isUnsupportedGlibc: boolean;
}
export interface RemoteAgentConnectionContext {
    remoteAuthority: string;
    clientId: string;
}