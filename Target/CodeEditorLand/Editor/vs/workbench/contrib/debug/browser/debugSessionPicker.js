import{matchesFuzzy as f}from"../../../../../vs/base/common/filters.js";import{DisposableStore as S}from"../../../../../vs/base/common/lifecycle.js";import*as p from"../../../../../vs/nls.js";import{ICommandService as k}from"../../../../../vs/platform/commands/common/commands.js";import"../../../../../vs/platform/instantiation/common/instantiation.js";import{IQuickInputService as h}from"../../../../../vs/platform/quickinput/common/quickInput.js";import{IDebugService as D,REPL_VIEW_ID as I}from"../../../../../vs/workbench/contrib/debug/common/debug.js";import"../../../../../vs/workbench/contrib/debug/common/loadedScriptsPicker.js";import{IViewsService as v}from"../../../../../vs/workbench/services/views/common/viewsService.js";async function O(i,a){const c=i.get(h),r=i.get(D),o=i.get(v),t=i.get(k),n=new S,e=c.createQuickPick({useSeparators:!0});n.add(e),e.matchOnLabel=e.matchOnDescription=e.matchOnDetail=e.sortByLabel=!1,e.placeholder=p.localize("moveFocusedView.selectView","Search debug sessions by name");const u=b(e.value,a,r,o,t);e.items=u.picks,e.activeItems=u.activeItems,n.add(e.onDidChangeValue(async()=>{e.items=b(e.value,a,r,o,t).picks})),n.add(e.onDidAccept(()=>{e.selectedItems[0].accept(),e.hide(),n.dispose()})),e.show()}function b(i,a,c,r,o){const t=[],n=[],e=c.getViewModel().focusedSession,u=c.getModel().getSessions(!1),m=[];u.forEach(s=>{s.compact&&s.parentSession&&n.push(s.parentSession)}),u.forEach(s=>{const d=n.includes(s);if(s.parentSession||t.push({type:"separator",label:d?s.name:void 0}),!d){const l=P(s,i,c,r,o);l&&(t.push(l),s.getId()===e?.getId()&&m.push(l))}}),t.length&&t.push({type:"separator"});const g=p.localize("workbench.action.debug.startDebug","Start a New Debug Session");return t.push({label:`$(plus) ${g}`,ariaLabel:g,accept:()=>o.executeCommand(a)}),{picks:t,activeItems:m}}function w(i){const a=i.configuration.name.length?i.configuration.name:i.name,c=i.compact?void 0:i.parentSession?.configuration.name;let r="",o="";return c&&(o=p.localize("workbench.action.debug.spawnFrom","Session {0} spawned from {1}",a,c),r=c),{label:a,description:r,ariaLabel:o}}function P(i,a,c,r,o){const t=w(i),n=f(a,t.label,!0);if(n)return{label:t.label,description:t.description,ariaLabel:t.ariaLabel,highlights:{label:n},accept:()=>{c.focusStackFrame(void 0,void 0,i,{explicit:!0}),r.isViewVisible(I)||r.openView(I,!0)}}}export{O as showDebugSessionMenu};
