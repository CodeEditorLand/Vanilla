import{URI as e}from"../../../base/common/uri.js";import{ApiCommand as a,ApiCommandArgument as n,ApiCommandResult as c}from"./extHostCommands.js";class E{constructor(t,i,s,m,r){this._extHostNotebooks=i;this._textDocumentsAndEditors=s;this._commands=m;const p=new a("interactive.open","_interactive.open","Open interactive window and return notebook editor and input URI",[new n("showOptions","Show Options",o=>!0,o=>o),new n("resource","Interactive resource Uri",o=>!0,o=>o),new n("controllerId","Notebook controller Id",o=>!0,o=>o),new n("title","Interactive editor title",o=>!0,o=>o)],new c("Notebook and input URI",o=>{if(r.debug("[ExtHostInteractive] open iw with notebook editor id",o.notebookEditorId),o.notebookEditorId!==void 0){const d=this._extHostNotebooks.getEditorById(o.notebookEditorId);return r.debug("[ExtHostInteractive] notebook editor found",d.id),{notebookUri:e.revive(o.notebookUri),inputUri:e.revive(o.inputUri),notebookEditor:d.apiEditor}}return r.debug("[ExtHostInteractive] notebook editor not found, uris for the interactive document",o.notebookUri,o.inputUri),{notebookUri:e.revive(o.notebookUri),inputUri:e.revive(o.inputUri)}}));this._commands.registerApiCommand(p)}$willAddInteractiveDocument(t,i,s,m){this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({addedDocuments:[{EOL:i,lines:[""],languageId:s,uri:t,isDirty:!1,versionId:1}]})}$willRemoveInteractiveDocument(t,i){this._textDocumentsAndEditors.acceptDocumentsAndEditorsDelta({removedDocuments:[t]})}}export{E as ExtHostInteractive};
