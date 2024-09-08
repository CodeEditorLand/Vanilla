import type { ResolvedKeybinding } from "../../../../base/common/keybindings.js";
import * as nls from "../../../../nls.js";
import type { WorkbenchCompressibleObjectTree } from "../../../../platform/list/browser/listService.js";
import { type ISearchConfigurationProperties } from "../../../services/search/common/search.js";
import type { IViewsService } from "../../../services/views/common/viewsService.js";
import { type RenderableMatch } from "./searchModel.js";
import type { SearchView } from "./searchView.js";
export declare const category: nls.ILocalizedString;
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
