var g=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var l=(n,i,o,e)=>{for(var t=e>1?void 0:e?p(i,o):i,s=n.length-1,d;s>=0;s--)(d=n[s])&&(t=(e?d(i,o,t):d(t))||t);return e&&t&&g(i,o,t),t},c=(n,i)=>(o,e)=>i(o,e,n);import{Emitter as b}from"../../../base/common/event.js";import{ILogService as E}from"../../../platform/log/common/log.js";import*as a from"./extHostTypeConverters.js";let r=class{constructor(i,o){this._logService=i;this._notebooksAndEditors=o}_onDidChangeNotebookEditorSelection=new b;_onDidChangeNotebookEditorVisibleRanges=new b;onDidChangeNotebookEditorSelection=this._onDidChangeNotebookEditorSelection.event;onDidChangeNotebookEditorVisibleRanges=this._onDidChangeNotebookEditorVisibleRanges.event;$acceptEditorPropertiesChanged(i,o){this._logService.debug("ExtHostNotebook#$acceptEditorPropertiesChanged",i,o);const e=this._notebooksAndEditors.getEditorById(i);o.visibleRanges&&e._acceptVisibleRanges(o.visibleRanges.ranges.map(a.NotebookRange.to)),o.selections&&e._acceptSelections(o.selections.selections.map(a.NotebookRange.to)),o.visibleRanges&&this._onDidChangeNotebookEditorVisibleRanges.fire({notebookEditor:e.apiEditor,visibleRanges:e.apiEditor.visibleRanges}),o.selections&&this._onDidChangeNotebookEditorSelection.fire(Object.freeze({notebookEditor:e.apiEditor,selections:e.apiEditor.selections}))}$acceptEditorViewColumns(i){for(const o in i)this._notebooksAndEditors.getEditorById(o)._acceptViewColumn(a.ViewColumn.to(i[o]))}};r=l([c(0,E)],r);export{r as ExtHostNotebookEditors};
