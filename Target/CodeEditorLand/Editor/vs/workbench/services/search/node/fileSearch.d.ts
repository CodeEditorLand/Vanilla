import * as childProcess from "child_process";
import type { URI } from "../../../../base/common/uri.js";
import { type IFileQuery, type IFolderQuery, type IProgressMessage, type IRawFileMatch, type ISearchEngine, type ISearchEngineStats, type ISearchEngineSuccess } from "../common/search.js";
export declare class FileWalker {
    private config;
    private filePattern;
    private normalizedFilePatternLowercase;
    private includePattern;
    private maxResults;
    private exists;
    private maxFilesize;
    private isLimitHit;
    private resultCount;
    private isCanceled;
    private fileWalkSW;
    private directoriesWalked;
    private filesWalked;
    private errors;
    private cmdSW;
    private cmdResultCount;
    private folderExcludePatterns;
    private globalExcludePattern;
    private walkedPaths;
    constructor(config: IFileQuery);
    cancel(): void;
    walk(folderQueries: IFolderQuery[], extraFiles: URI[], numThreads: number | undefined, onResult: (result: IRawFileMatch) => void, onMessage: (message: IProgressMessage) => void, done: (error: Error | null, isLimitHit: boolean) => void): void;
    private parallel;
    private call;
    private cmdTraversal;
    /**
     * Public for testing.
     */
    spawnFindCmd(folderQuery: IFolderQuery): childProcess.ChildProcessWithoutNullStreams;
    /**
     * Public for testing.
     */
    readStdout(cmd: childProcess.ChildProcess, encoding: BufferEncoding, cb: (err: Error | null, stdout?: string) => void): void;
    private collectStdout;
    private forwardData;
    private collectData;
    private decodeData;
    private initDirectoryTree;
    private addDirectoryEntries;
    private matchDirectoryTree;
    getStats(): ISearchEngineStats;
    private doWalk;
    private matchFile;
    private isFileMatch;
    private statLinkIfNeeded;
    private realPathIfNeeded;
    /**
     * If we're searching for files in multiple workspace folders, then better prepend the
     * name of the workspace folder to the path of the file. This way we'll be able to
     * better filter files that are all on the top of a workspace folder and have all the
     * same name. A typical example are `package.json` or `README.md` files.
     */
    private getSearchPath;
}
export declare class Engine implements ISearchEngine<IRawFileMatch> {
    private folderQueries;
    private extraFiles;
    private walker;
    private numThreads?;
    constructor(config: IFileQuery, numThreads?: number);
    search(onResult: (result: IRawFileMatch) => void, onProgress: (progress: IProgressMessage) => void, done: (error: Error | null, complete: ISearchEngineSuccess) => void): void;
    cancel(): void;
}
