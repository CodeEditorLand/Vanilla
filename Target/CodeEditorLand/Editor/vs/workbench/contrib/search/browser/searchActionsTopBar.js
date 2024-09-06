import{KeyCode as b}from"../../../../base/common/keyCodes.js";import*as c from"../../../../nls.js";import{Action2 as n,MenuId as S,registerAction2 as l}from"../../../../platform/actions/common/actions.js";import"../../../../platform/commands/common/commands.js";import{ContextKeyExpr as o}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as K}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchListFocusContextKey as E}from"../../../../platform/list/browser/listService.js";import{VIEW_ID as u}from"../../../services/search/common/search.js";import{IViewsService as m}from"../../../services/views/common/viewsService.js";import*as e from"../common/constants.js";import{SearchStateKey as g,SearchUIState as V}from"../common/search.js";import{ISearchHistoryService as F}from"../common/searchHistoryService.js";import{category as d,getSearchView as p}from"./searchActionsBase.js";import{searchClearIcon as L,searchCollapseAllIcon as q,searchExpandAllIcon as N,searchRefreshIcon as z,searchShowAsList as P,searchShowAsTree as M,searchStopIcon as k}from"./searchIcons.js";import{FileMatch as H,FolderMatch as x,FolderMatchNoRoot as R,FolderMatchWorkspaceRoot as y,Match as I,SearchResult as W}from"./searchModel.js";l(class extends n{constructor(){super({id:e.SearchCommandIds.ClearSearchHistoryCommandId,title:c.localize2("clearSearchHistoryLabel","Clear Search History"),category:d,f1:!0})}async run(r){D(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.CancelSearchActionId,title:c.localize2("CancelSearchAction.label","Cancel Search"),icon:k,category:d,f1:!0,precondition:g.isEqualTo(V.Idle).negate(),keybinding:{weight:K.WorkbenchContrib,when:o.and(e.SearchContext.SearchViewVisibleKey,E),primary:b.Escape},menu:[{id:S.ViewTitle,group:"navigation",order:0,when:o.and(o.equals("view",u),g.isEqualTo(V.SlowSearch))}]})}run(r){return _(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.RefreshSearchResultsActionId,title:c.localize2("RefreshAction.label","Refresh"),icon:z,precondition:e.SearchContext.ViewHasSearchPatternKey,category:d,f1:!0,menu:[{id:S.ViewTitle,group:"navigation",order:0,when:o.and(o.equals("view",u),g.isEqualTo(V.SlowSearch).negate())}]})}run(r,...i){return j(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.CollapseSearchResultsActionId,title:c.localize2("CollapseDeepestExpandedLevelAction.label","Collapse All"),category:d,icon:q,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey),menu:[{id:S.ViewTitle,group:"navigation",order:4,when:o.and(o.equals("view",u),o.or(e.SearchContext.HasSearchResults.negate(),e.SearchContext.ViewHasSomeCollapsibleKey))}]})}run(r,...i){return B(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.ExpandSearchResultsActionId,title:c.localize2("ExpandAllAction.label","Expand All"),category:d,icon:N,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey.toNegated()),menu:[{id:S.ViewTitle,group:"navigation",order:4,when:o.and(o.equals("view",u),e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey.toNegated())}]})}run(r,...i){return Q(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.ClearSearchResultsActionId,title:c.localize2("ClearSearchResultsAction.label","Clear Search Results"),category:d,icon:L,f1:!0,precondition:o.or(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSearchPatternKey,e.SearchContext.ViewHasReplacePatternKey,e.SearchContext.ViewHasFilePatternKey),menu:[{id:S.ViewTitle,group:"navigation",order:1,when:o.equals("view",u)}]})}run(r,...i){return U(r)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.ViewAsTreeActionId,title:c.localize2("ViewAsTreeAction.label","View as Tree"),category:d,icon:P,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.InTreeViewKey.toNegated()),menu:[{id:S.ViewTitle,group:"navigation",order:2,when:o.and(o.equals("view",u),e.SearchContext.InTreeViewKey.toNegated())}]})}run(r,...i){const t=p(r.get(m));t&&t.setTreeView(!0)}}),l(class extends n{constructor(){super({id:e.SearchCommandIds.ViewAsListActionId,title:c.localize2("ViewAsListAction.label","View as List"),category:d,icon:M,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.InTreeViewKey),menu:[{id:S.ViewTitle,group:"navigation",order:2,when:o.and(o.equals("view",u),e.SearchContext.InTreeViewKey)}]})}run(r,...i){const t=p(r.get(m));t&&t.setTreeView(!1)}});const D=a=>{a.get(F).clearHistory()};function Q(a){const r=a.get(m),i=p(r);i&&i.getControl().expandAll()}function U(a){const r=a.get(m);p(r)?.clearSearchResults()}function _(a){const r=a.get(m);p(r)?.cancelSearch()}function j(a){const r=a.get(m);p(r)?.triggerQueryChange({preserveFocus:!1})}function B(a){const r=a.get(m),i=p(r);if(i){const t=i.getControl(),f=t.navigate();let s=f.first(),T=!1,v=!1;if(s instanceof y||i.isTreeLayoutViewVisible)for(;s=f.next();){if(s instanceof I){T=!0;break}if(i.isTreeLayoutViewVisible&&!v){let A=s;if(s instanceof x){const h=t.getCompressedTreeNode(s).element?.elements[0];A=h&&!(h instanceof I)?h:s}const w=A.parent();w instanceof y||w instanceof R||w instanceof W||(v=!0)}}if(T){s=f.first();do s instanceof H&&t.collapse(s);while(s=f.next())}else if(v){if(s=f.first(),s)do{let A=s;if(s instanceof x){const h=t.getCompressedTreeNode(s).element?.elements[0];A=h&&!(h instanceof I)?h:s}const w=A.parent();(w instanceof y||w instanceof R)&&(t.hasElement(s)?t.collapse(s,!0):t.collapseAll())}while(s=f.next())}else t.collapseAll();const C=t.getFocus()[0]?.parent();C&&(C instanceof x||C instanceof H)&&t.hasElement(C)&&t.isCollapsed(C)&&(t.domFocus(),t.focusFirst(),t.setSelection(t.getFocus()))}}
