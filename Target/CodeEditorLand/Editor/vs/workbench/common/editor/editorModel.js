import{Emitter as e}from"../../../base/common/event.js";import{Disposable as s}from"../../../base/common/lifecycle.js";class l extends s{_onWillDispose=this._register(new e);onWillDispose=this._onWillDispose.event;resolved=!1;async resolve(){this.resolved=!0}isResolved(){return this.resolved}isDisposed(){return this._store.isDisposed}dispose(){this._onWillDispose.fire(),super.dispose()}}export{l as EditorModel};
