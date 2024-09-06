import{DisposableStore as A}from"../../../../../../vs/base/common/lifecycle.js";import"../../../../../../vs/editor/browser/editorExtensions.js";import{IBulkEditService as O,ResourceTextEdit as U}from"../../../../../../vs/editor/browser/services/bulkEditService.js";import{Range as V}from"../../../../../../vs/editor/common/core/range.js";import"../../../../../../vs/editor/common/model.js";import{ITextModelService as w}from"../../../../../../vs/editor/common/services/resolverService.js";import*as p from"../../../../../../vs/nls.js";import{Action2 as b,registerAction2 as v}from"../../../../../../vs/platform/actions/common/actions.js";import{IConfigurationService as C}from"../../../../../../vs/platform/configuration/common/configuration.js";import{ILogService as L}from"../../../../../../vs/platform/log/common/log.js";import{IQuickInputService as F}from"../../../../../../vs/platform/quickinput/common/quickInput.js";import{INotebookEditorService as D}from"../../../../../../vs/workbench/contrib/notebook/browser/services/notebookEditorService.js";import{NotebookSetting as f}from"../../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{isNotebookEditorInput as M}from"../../../../../../vs/workbench/contrib/notebook/common/notebookEditorInput.js";import{IEditorService as h}from"../../../../../../vs/workbench/services/editor/common/editorService.js";class z extends b{static ID="notebook.action.indentUsingTabs";constructor(){super({id:z.ID,title:p.localize("indentUsingTabs","Indent Using Tabs"),precondition:void 0})}run(t,...r){m(t,!1,!1)}}class x extends b{static ID="notebook.action.indentUsingSpaces";constructor(){super({id:x.ID,title:p.localize("indentUsingSpaces","Indent Using Spaces"),precondition:void 0})}run(t,...r){m(t,!0,!1)}}class k extends b{static ID="notebook.action.changeTabDisplaySize";constructor(){super({id:k.ID,title:p.localize("changeTabDisplaySize","Change Tab Display Size"),precondition:void 0})}run(t,...r){m(t,!0,!0)}}class E extends b{static ID="notebook.action.convertIndentationToSpaces";constructor(){super({id:E.ID,title:p.localize("convertIndentationToSpaces","Convert Indentation to Spaces"),precondition:void 0})}run(t,...r){N(t,!0)}}class T extends b{static ID="notebook.action.convertIndentationToTabs";constructor(){super({id:T.ID,title:p.localize("convertIndentationToTabs","Convert Indentation to Tabs"),precondition:void 0})}run(t,...r){N(t,!1)}}function m(e,t,r){const c=e.get(h),l=e.get(C),S=e.get(D),o=e.get(F),g=c.activeEditorPane?.input;if(!M(g)||!S.retrieveExistingWidgetFromURI(g.resource)?.value)return;const u=[1,2,3,4,5,6,7,8].map(s=>({id:s.toString(),label:s.toString()})),i=l.getValue(f.cellEditorOptionsCustomizations),n=i["editor.insertSpaces"];delete i["editor.indentSize"],delete i["editor.tabSize"],delete i["editor.insertSpaces"],setTimeout(()=>{o.pick(u,{placeHolder:p.localize({key:"selectTabWidth",comment:["Tab corresponds to the tab key"]},"Select Tab Size for Current File")}).then(s=>{if(s){const d=parseInt(s.label,10);r?l.updateValue(f.cellEditorOptionsCustomizations,{...i,"editor.tabSize":d,"editor.indentSize":d,"editor.insertSpaces":n}):l.updateValue(f.cellEditorOptionsCustomizations,{...i,"editor.tabSize":d,"editor.indentSize":d,"editor.insertSpaces":t})}})},50)}function N(e,t){const r=e.get(h),c=e.get(C),l=e.get(L),S=e.get(w),o=e.get(D),g=e.get(O),a=r.activeEditorPane?.input;if(!M(a))return;const u=o.retrieveExistingWidgetFromURI(a.resource)?.value?.textModel;if(!u)return;const i=new A;try{Promise.all(u.cells.map(async n=>{const s=await S.createModelReference(n.uri);i.add(s);const d=s.object.textEditorModel,y=n.textModel?.getOptions();if(!y)return;const R=W(d,y.tabSize,t);g.apply(R,{label:p.localize("convertIndentation","Convert Indentation"),code:"undoredo.convertIndentation"})})).then(()=>{const n=c.getValue(f.cellEditorOptionsCustomizations),s=n["editor.indentSize"],d=n["editor.tabSize"];delete n["editor.indentSize"],delete n["editor.tabSize"],delete n["editor.insertSpaces"],c.updateValue(f.cellEditorOptionsCustomizations,{...n,"editor.tabSize":d,"editor.indentSize":s,"editor.insertSpaces":t}),i.dispose()})}catch{l.error("Failed to convert indentation to spaces for notebook cells.")}}function W(e,t,r){if(e.getLineCount()===1&&e.getLineMaxColumn(1)===1)return[];let c="";for(let o=0;o<t;o++)c+=" ";const l=new RegExp(c,"gi"),S=[];for(let o=1,g=e.getLineCount();o<=g;o++){let a=e.getLineFirstNonWhitespaceColumn(o);if(a===0&&(a=e.getLineMaxColumn(o)),a===1)continue;const I=new V(o,1,o,a),u=e.getValueInRange(I),i=r?u.replace(/\t/gi,c):u.replace(l,"	");S.push(new U(e.uri,{range:I,text:i}))}return S}v(x),v(z),v(k),v(E),v(T);export{k as NotebookChangeTabDisplaySize,x as NotebookIndentUsingSpaces,z as NotebookIndentUsingTabs,E as NotebookIndentationToSpacesAction,T as NotebookIndentationToTabsAction};
