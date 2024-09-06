import{StandardMouseEvent as d}from"../../../../base/browser/mouseEvent.js";import{ActionRunner as u}from"../../../../base/common/actions.js";import{asArray as l}from"../../../../base/common/arrays.js";import{MarshalledId as p}from"../../../../base/common/marshallingIds.js";import"../../../../base/common/types.js";import{createAndFillInContextMenuActions as A}from"../../../../platform/actions/browser/menuEntryActionViewItem.js";import"../../../../platform/actions/common/actions.js";import"../../../../platform/contextview/browser/contextView.js";import"../common/terminal.js";import"./terminal.js";class a{instanceId;constructor(e){this.instanceId=e.instanceId}toJSON(){return{$mid:p.TerminalContext,instanceId:this.instanceId}}}class f extends u{async runAction(e,n){if(Array.isArray(n)&&n.every(r=>r instanceof a)){await e.run(n?.[0],n);return}return super.runAction(e,n)}}function J(t,e,n,r,s,i){const c=new d(t,e),o=[];A(r,{shouldForwardArgs:!0},o),i&&o.push(...i);const m=n?l(n).map(I=>new a(I)):[];s.showContextMenu({actionRunner:new f,getAnchor:()=>c,getActions:()=>o,getActionsContext:()=>m})}export{a as InstanceContext,f as TerminalContextActionRunner,J as openContextMenu};
