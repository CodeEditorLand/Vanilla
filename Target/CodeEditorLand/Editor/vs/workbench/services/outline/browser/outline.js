import"../../../../base/browser/ui/list/list.js";import"../../../../base/browser/ui/tree/tree.js";import"../../../../base/common/cancellation.js";import"../../../../base/common/event.js";import"../../../../base/common/filters.js";import"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import"../../../../platform/editor/common/editor.js";import{createDecorator as t}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/list/browser/listService.js";import"../../../common/editor.js";const h=t("IOutlineService");var n=(e=>(e[e.OutlinePane=1]="OutlinePane",e[e.Breadcrumbs=2]="Breadcrumbs",e[e.QuickPick=4]="QuickPick",e))(n||{}),a=(r=>(r.icons="outline.icons",r.collapseItems="outline.collapseItems",r.problemsEnabled="outline.problems.enabled",r.problemsColors="outline.problems.colors",r.problemsBadges="outline.problems.badges",r))(a||{}),i=(o=>(o.Collapsed="alwaysCollapse",o.Expanded="alwaysExpand",o))(i||{});export{h as IOutlineService,i as OutlineConfigCollapseItemsValues,a as OutlineConfigKeys,n as OutlineTarget};
