import{ExtensionIdentifier as o}from"../../../platform/extensions/common/extensions.js";import{Event as i}from"../../../base/common/event.js";import{DisposableStore as r}from"../../../base/common/lifecycle.js";class g{_id;#e;onDidChange;disposables=new r;constructor(e,t){this._id=o.toKey(e.identifier),this.#e=t,this.onDidChange=i.map(i.filter(this.#e.onDidChangePassword,s=>s.extensionId===this._id),s=>({key:s.key}),this.disposables)}dispose(){this.disposables.dispose()}get(e){return this.#e.get(this._id,e)}store(e,t){return this.#e.store(this._id,e,t)}delete(e){return this.#e.delete(this._id,e)}}export{g as ExtensionSecrets};
