import { ResolvedKeybinding } from "vs/base/common/keybindings";
import { WorkbenchCompressibleObjectTree } from "vs/platform/list/browser/listService";
import { RenderableMatch } from "vs/workbench/contrib/search/browser/searchModel";
import { SearchView } from "vs/workbench/contrib/search/browser/searchView";
import { ISearchConfigurationProperties } from "vs/workbench/services/search/common/search";
import { IViewsService } from "vs/workbench/services/views/common/viewsService";
export declare const category: any;
export declare function isSearchViewFocused(viewsService: IViewsService): boolean;
export declare function appendKeyBindingLabel(label: string, inputKeyBinding: ResolvedKeybinding | undefined): string;
export declare function getSearchView(viewsService: IViewsService): SearchView | undefined;
export declare function getElementsToOperateOn(viewer: WorkbenchCompressibleObjectTree<RenderableMatch, void>, currElement: RenderableMatch | undefined, sortConfig: ISearchConfigurationProperties): RenderableMatch[];
/**
 * @param elements elements that are going to be removed
 * @param focusElement element that is focused
 * @returns whether we need to re-focus on a remove
 */
export declare function shouldRefocus(elements: RenderableMatch[], focusElement: RenderableMatch | undefined): boolean;
export declare function openSearchView(viewsService: IViewsService, focus?: boolean): Promise<SearchView | undefined>;
