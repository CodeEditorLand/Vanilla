import { URI } from "vs/base/common/uri";
import { ISingleFolderWorkspaceIdentifier, IWorkspaceIdentifier } from "vs/platform/workspace/common/workspace";
export declare function getWorkspaceIdentifier(workspaceUri: URI): IWorkspaceIdentifier;
export declare function getSingleFolderWorkspaceIdentifier(folderUri: URI): ISingleFolderWorkspaceIdentifier;
