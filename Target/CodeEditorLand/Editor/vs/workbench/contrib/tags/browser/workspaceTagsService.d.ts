import type { URI } from "../../../../base/common/uri.js";
import type { IWorkspace, WorkbenchState } from "../../../../platform/workspace/common/workspace.js";
import { IWorkspaceTagsService, type Tags } from "../common/workspaceTags.js";
export declare class NoOpWorkspaceTagsService implements IWorkspaceTagsService {
    readonly _serviceBrand: undefined;
    getTags(): Promise<Tags>;
    getTelemetryWorkspaceId(workspace: IWorkspace, state: WorkbenchState): Promise<string | undefined>;
    getHashedRemotesFromUri(workspaceUri: URI, stripEndingDotGit?: boolean): Promise<string[]>;
}
