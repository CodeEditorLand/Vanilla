import { WorkbenchCompressibleObjectTree } from '../../../../platform/list/browser/listService.js';
import { RenderableMatch } from './searchModel.js';
export interface ISearchActionContext {
    readonly viewer: WorkbenchCompressibleObjectTree<RenderableMatch>;
    readonly element: RenderableMatch;
}
export interface IFindInFilesArgs {
    query?: string;
    replace?: string;
    preserveCase?: boolean;
    triggerSearch?: boolean;
    filesToInclude?: string;
    filesToExclude?: string;
    isRegex?: boolean;
    isCaseSensitive?: boolean;
    matchWholeWord?: boolean;
    useExcludeSettingsAndIgnoreFiles?: boolean;
    onlyOpenEditors?: boolean;
}
/**
 * Returns element to focus after removing the given element
 */
export declare function getElementToFocusAfterRemoved(viewer: WorkbenchCompressibleObjectTree<RenderableMatch>, element: RenderableMatch, elementsToRemove: RenderableMatch[]): RenderableMatch | undefined;
/***
 * Finds the last element in the tree with the same type as `element`
 */
export declare function getLastNodeFromSameType(viewer: WorkbenchCompressibleObjectTree<RenderableMatch>, element: RenderableMatch): RenderableMatch | undefined;
