import * as cp from "child_process";
import * as glob from "vs/base/common/glob";
import { IFileQuery, IFolderQuery } from "vs/workbench/services/search/common/search";
export declare function spawnRipgrepCmd(config: IFileQuery, folderQuery: IFolderQuery, includePattern?: glob.IExpression, excludePattern?: glob.IExpression, numThreads?: number): {
    cmd: cp.ChildProcessWithoutNullStreams;
    rgDiskPath: any;
    siblingClauses: glob.IExpression;
    rgArgs: {
        args: string[];
        siblingClauses: glob.IExpression;
    };
    cwd: any;
};
/**
 * Resolves a glob like "node_modules/**" in "/foo/bar" to "/foo/bar/node_modules/**".
 * Special cases C:/foo paths to write the glob like /foo instead - see https://github.com/BurntSushi/ripgrep/issues/530.
 *
 * Exported for testing
 */
export declare function getAbsoluteGlob(folder: string, key: string): string;
export declare function fixDriveC(path: string): string;
