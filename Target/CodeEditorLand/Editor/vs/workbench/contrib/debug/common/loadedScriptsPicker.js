import{matchesFuzzy as m}from"../../../../base/common/filters.js";import{DisposableStore as l}from"../../../../base/common/lifecycle.js";import{dirname as I}from"../../../../base/common/resources.js";import{ILanguageService as g}from"../../../../editor/common/languages/language.js";import{getIconClasses as p}from"../../../../editor/common/services/getIconClasses.js";import{IModelService as S}from"../../../../editor/common/services/model.js";import*as k from"../../../../nls.js";import"../../../../platform/instantiation/common/instantiation.js";import{ILabelService as f}from"../../../../platform/label/common/label.js";import{IQuickInputService as b}from"../../../../platform/quickinput/common/quickInput.js";import{IEditorService as v}from"../../../services/editor/common/editorService.js";import{IDebugService as P}from"./debug.js";import"./debugSource.js";async function U(i){const a=i.get(b),u=i.get(P),s=i.get(v),n=u.getModel().getSessions(!1),c=i.get(S),t=i.get(g),o=i.get(f),r=new l,e=a.createQuickPick({useSeparators:!0});r.add(e),e.matchOnLabel=e.matchOnDescription=e.matchOnDetail=e.sortByLabel=!1,e.placeholder=k.localize("moveFocusedView.selectView","Search loaded scripts by name"),e.items=await d(e.value,n,s,c,t,o),r.add(e.onDidChangeValue(async()=>{e.items=await d(e.value,n,s,c,t,o)})),r.add(e.onDidAccept(()=>{e.selectedItems[0].accept(),e.hide(),r.dispose()})),e.show()}async function h(i,a,u,s,n,c){const t=[];return t.push({type:"separator",label:i.name}),(await i.getLoadedSources()).forEach(r=>{const e=D(r,a,u,s,n,c);e&&t.push(e)}),t}async function d(i,a,u,s,n,c){const t=[],o=await Promise.all(a.map(r=>h(r,i,u,s,n,c)));for(const r of o)for(const e of r)t.push(e);return t}function D(i,a,u,s,n,c){const t=c.getUriBasenameLabel(i.uri),o=c.getUriLabel(I(i.uri)),r=m(a,t,!0),e=m(a,o,!0);if(r||e)return{label:t,description:o==="."?void 0:o,highlights:{label:r??void 0,description:e??void 0},iconClasses:p(s,n,i.uri),accept:()=>{i.available&&i.openInEditor(u,{startLineNumber:0,startColumn:0,endLineNumber:0,endColumn:0})}}}export{U as showLoadedScriptMenu};
