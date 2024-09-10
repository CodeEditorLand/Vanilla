import{Emitter as n}from"../../../../base/common/event.js";import{Disposable as r}from"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import{createDecorator as o}from"../../../../platform/instantiation/common/instantiation.js";const U=o("IInteractiveDocumentService");class d extends r{_onWillAddInteractiveDocument=this._register(new n);onWillAddInteractiveDocument=this._onWillAddInteractiveDocument.event;_onWillRemoveInteractiveDocument=this._register(new n);onWillRemoveInteractiveDocument=this._onWillRemoveInteractiveDocument.event;constructor(){super()}willCreateInteractiveDocument(e,t,i){this._onWillAddInteractiveDocument.fire({notebookUri:e,inputUri:t,languageId:i})}willRemoveInteractiveDocument(e,t){this._onWillRemoveInteractiveDocument.fire({notebookUri:e,inputUri:t})}}export{U as IInteractiveDocumentService,d as InteractiveDocumentService};
