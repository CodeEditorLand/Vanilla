import{Codicon as t}from"../../../../base/common/codicons.js";import{localize as e}from"../../../../nls.js";import"../../../../platform/action/common/action.js";import{MenuId as o,MenuRegistry as l}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as u}from"../../../../platform/commands/common/commands.js";import{Extensions as g}from"../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as y}from"../../../../platform/contextkey/common/contextkey.js";import{SyncDescriptor as I}from"../../../../platform/instantiation/common/descriptors.js";import{InstantiationType as w,registerSingleton as h}from"../../../../platform/instantiation/common/extensions.js";import{Registry as m}from"../../../../platform/registry/common/platform.js";import{registerIcon as n}from"../../../../platform/theme/common/iconRegistry.js";import{ResourceContextKey as T}from"../../../common/contextkeys.js";import{Extensions as C}from"../../../common/views.js";import{VIEW_CONTAINER as x}from"../../files/browser/explorerViewlet.js";import{ExplorerFolderContext as S}from"../../files/common/files.js";import{ITimelineService as a,TimelinePaneId as v}from"../common/timeline.js";import{TimelineHasProviderContext as s,TimelineService as E}from"../common/timelineService.js";import{TimelinePane as p}from"./timelinePane.js";const V=n("timeline-view-icon",t.history,e("timelineViewIcon","View icon of the timeline view.")),b=n("timeline-open",t.history,e("timelineOpenIcon","Icon for the open timeline action."));class R{id=v;name=p.TITLE;containerIcon=V;ctorDescriptor=new I(p);order=2;weight=30;collapsed=!0;canToggleVisibility=!0;hideByDefault=!1;canMoveView=!0;when=s;focusCommand={id:"timeline.focus"}}const D=m.as(g.Configuration);D.registerConfiguration({id:"timeline",order:1001,title:e("timelineConfigurationTitle","Timeline"),type:"object",properties:{"timeline.pageSize":{type:["number","null"],default:null,markdownDescription:e("timeline.pageSize","The number of items to show in the Timeline view by default and when loading more items. Setting to `null` (the default) will automatically choose a page size based on the visible area of the Timeline view.")},"timeline.pageOnScroll":{type:"boolean",default:!1,description:e("timeline.pageOnScroll","Experimental. Controls whether the Timeline view will load the next page of items when you scroll to the end of the list.")}}}),m.as(C.ViewsRegistry).registerViews([new R],x);var i;(r=>{r.ID="files.openTimeline",r.LABEL=e("files.openTimeline","Open Timeline");function M(){return(d,f)=>d.get(a).setUri(f)}r.handler=M})(i||={}),u.registerCommand(i.ID,i.handler()),l.appendMenuItem(o.ExplorerContext,{group:"4_timeline",order:1,command:{id:i.ID,title:i.LABEL,icon:b},when:y.and(S.toNegated(),T.HasResource,s)});const L=n("timeline-filter",t.filter,e("timelineFilter","Icon for the filter timeline action."));l.appendMenuItem(o.TimelineTitle,{submenu:o.TimelineFilterSubMenu,title:e("filterTimeline","Filter Timeline"),group:"navigation",order:100,icon:L}),h(a,E,w.Delayed);export{R as TimelinePaneDescriptor};
