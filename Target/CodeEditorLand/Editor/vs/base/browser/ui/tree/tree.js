import"../../../../../vs/base/browser/dnd.js";import"../../../../../vs/base/browser/mouseEvent.js";import{ListDragOverEffectPosition as a,ListDragOverEffectType as l}from"../../../../../vs/base/browser/ui/list/list.js";import"../../../../../vs/base/browser/ui/list/listView.js";import"../../../../../vs/base/common/event.js";var i=(n=>(n[n.Hidden=0]="Hidden",n[n.Visible=1]="Visible",n[n.Recurse=2]="Recurse",n))(i||{}),d=(e=>(e[e.Expanded=0]="Expanded",e[e.Collapsed=1]="Collapsed",e[e.PreserveOrExpanded=2]="PreserveOrExpanded",e[e.PreserveOrCollapsed=3]="PreserveOrCollapsed",e))(d||{}),T=(e=>(e[e.Unknown=0]="Unknown",e[e.Twistie=1]="Twistie",e[e.Element=2]="Element",e[e.Filter=3]="Filter",e))(T||{}),p=(t=>(t[t.Down=0]="Down",t[t.Up=1]="Up",t))(p||{});const R={acceptBubbleUp(){return{accept:!0,bubble:1}},acceptBubbleDown(o=!1){return{accept:!0,bubble:0,autoExpand:o}},acceptCopyBubbleUp(){return{accept:!0,bubble:1,effect:{type:l.Copy,position:a.Over}}},acceptCopyBubbleDown(o=!1){return{accept:!0,bubble:0,effect:{type:l.Copy,position:a.Over},autoExpand:o}}};class E extends Error{constructor(r,t){super(`TreeError [${r}] ${t}`)}}class F{constructor(r){this.fn=r}_map=new WeakMap;map(r){let t=this._map.get(r);return t||(t=this.fn(r),this._map.set(r,t)),t}}export{d as ObjectTreeElementCollapseState,p as TreeDragOverBubble,R as TreeDragOverReactions,E as TreeError,T as TreeMouseEventTarget,i as TreeVisibility,F as WeakMapper};
