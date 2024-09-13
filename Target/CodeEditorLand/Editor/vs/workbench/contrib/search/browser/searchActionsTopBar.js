import{KeyCode as b}from"../../../../base/common/keyCodes.js";import*as n from"../../../../nls.js";import{Action2 as c,MenuId as S,registerAction2 as l}from"../../../../platform/actions/common/actions.js";import{ContextKeyExpr as o}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as K}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{WorkbenchListFocusContextKey as E}from"../../../../platform/list/browser/listService.js";import{VIEW_ID as u}from"../../../services/search/common/search.js";import{IViewsService as m}from"../../../services/views/common/viewsService.js";import*as e from"../common/constants.js";import{SearchStateKey as g,SearchUIState as V}from"../common/search.js";import{ISearchHistoryService as F}from"../common/searchHistoryService.js";import{category as d,getSearchView as p}from"./searchActionsBase.js";import{searchClearIcon as L,searchCollapseAllIcon as q,searchExpandAllIcon as N,searchRefreshIcon as z,searchShowAsList as P,searchShowAsTree as M,searchStopIcon as k}from"./searchIcons.js";import{FileMatch as H,FolderMatch as x,FolderMatchNoRoot as R,FolderMatchWorkspaceRoot as y,Match as I,SearchResult as W}from"./searchModel.js";l(class extends c{constructor(){super({id:e.SearchCommandIds.ClearSearchHistoryCommandId,title:n.localize2("clearSearchHistoryLabel","Clear Search History"),category:d,f1:!0})}async run(t){D(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.CancelSearchActionId,title:n.localize2("CancelSearchAction.label","Cancel Search"),icon:k,category:d,f1:!0,precondition:g.isEqualTo(V.Idle).negate(),keybinding:{weight:K.WorkbenchContrib,when:o.and(e.SearchContext.SearchViewVisibleKey,E),primary:b.Escape},menu:[{id:S.ViewTitle,group:"navigation",order:0,when:o.and(o.equals("view",u),g.isEqualTo(V.SlowSearch))}]})}run(t){return U(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.RefreshSearchResultsActionId,title:n.localize2("RefreshAction.label","Refresh"),icon:z,precondition:e.SearchContext.ViewHasSearchPatternKey,category:d,f1:!0,menu:[{id:S.ViewTitle,group:"navigation",order:0,when:o.and(o.equals("view",u),g.isEqualTo(V.SlowSearch).negate())}]})}run(t,...i){return _(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.CollapseSearchResultsActionId,title:n.localize2("CollapseDeepestExpandedLevelAction.label","Collapse All"),category:d,icon:q,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey),menu:[{id:S.ViewTitle,group:"navigation",order:4,when:o.and(o.equals("view",u),o.or(e.SearchContext.HasSearchResults.negate(),e.SearchContext.ViewHasSomeCollapsibleKey))}]})}run(t,...i){return B(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.ExpandSearchResultsActionId,title:n.localize2("ExpandAllAction.label","Expand All"),category:d,icon:N,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey.toNegated()),menu:[{id:S.ViewTitle,group:"navigation",order:4,when:o.and(o.equals("view",u),e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSomeCollapsibleKey.toNegated())}]})}run(t,...i){return j(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.ClearSearchResultsActionId,title:n.localize2("ClearSearchResultsAction.label","Clear Search Results"),category:d,icon:L,f1:!0,precondition:o.or(e.SearchContext.HasSearchResults,e.SearchContext.ViewHasSearchPatternKey,e.SearchContext.ViewHasReplacePatternKey,e.SearchContext.ViewHasFilePatternKey),menu:[{id:S.ViewTitle,group:"navigation",order:1,when:o.equals("view",u)}]})}run(t,...i){return Q(t)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.ViewAsTreeActionId,title:n.localize2("ViewAsTreeAction.label","View as Tree"),category:d,icon:P,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.InTreeViewKey.toNegated()),menu:[{id:S.ViewTitle,group:"navigation",order:2,when:o.and(o.equals("view",u),e.SearchContext.InTreeViewKey.toNegated())}]})}run(t,...i){const r=p(t.get(m));r&&r.setTreeView(!0)}}),l(class extends c{constructor(){super({id:e.SearchCommandIds.ViewAsListActionId,title:n.localize2("ViewAsListAction.label","View as List"),category:d,icon:M,f1:!0,precondition:o.and(e.SearchContext.HasSearchResults,e.SearchContext.InTreeViewKey),menu:[{id:S.ViewTitle,group:"navigation",order:2,when:o.and(o.equals("view",u),e.SearchContext.InTreeViewKey)}]})}run(t,...i){const r=p(t.get(m));r&&r.setTreeView(!1)}});const D=a=>{a.get(F).clearHistory()};function j(a){const t=a.get(m),i=p(t);i&&i.getControl().expandAll()}function Q(a){const t=a.get(m);p(t)?.clearSearchResults()}function U(a){const t=a.get(m);p(t)?.cancelSearch()}function _(a){const t=a.get(m);p(t)?.triggerQueryChange({preserveFocus:!1})}function B(a){const t=a.get(m),i=p(t);if(i){const r=i.getControl(),f=r.navigate();let s=f.first(),T=!1,v=!1;if(s instanceof y||i.isTreeLayoutViewVisible)for(;s=f.next();){if(s instanceof I){T=!0;break}if(i.isTreeLayoutViewVisible&&!v){let A=s;if(s instanceof x){const h=r.getCompressedTreeNode(s).element?.elements[0];A=h&&!(h instanceof I)?h:s}const w=A.parent();w instanceof y||w instanceof R||w instanceof W||(v=!0)}}if(T){s=f.first();do s instanceof H&&r.collapse(s);while(s=f.next())}else if(v){if(s=f.first(),s)do{let A=s;if(s instanceof x){const h=r.getCompressedTreeNode(s).element?.elements[0];A=h&&!(h instanceof I)?h:s}const w=A.parent();(w instanceof y||w instanceof R)&&(r.hasElement(s)?r.collapse(s,!0):r.collapseAll())}while(s=f.next())}else r.collapseAll();const C=r.getFocus()[0]?.parent();C&&(C instanceof x||C instanceof H)&&r.hasElement(C)&&r.isCollapsed(C)&&(r.domFocus(),r.focusFirst(),r.setSelection(r.getFocus()))}}
