import { URI } from "../../../../base/common/uri.js";
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "../../../../platform/workspace/common/workspace.js";
export declare function getWorkspaceIdentifier(workspaceUri: URI): IWorkspaceIdentifier;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI): ISingleFolderWorkspaceIdentifier;
