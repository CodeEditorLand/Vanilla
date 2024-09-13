import{Emitter as c,Event as r}from"./event.js";const l=Object.freeze((n,e)=>{const a=setTimeout(n.bind(e),0);return{dispose(){clearTimeout(a)}}});var s;(i=>{function n(t){return t===i.None||t===i.Cancelled||t instanceof o?!0:!t||typeof t!="object"?!1:typeof t.isCancellationRequested=="boolean"&&typeof t.onCancellationRequested=="function"}i.isCancellationToken=n,i.None=Object.freeze({isCancellationRequested:!1,onCancellationRequested:r.None}),i.Cancelled=Object.freeze({isCancellationRequested:!0,onCancellationRequested:l})})(s||={});class o{_isCancelled=!1;_emitter=null;cancel(){this._isCancelled||(this._isCancelled=!0,this._emitter&&(this._emitter.fire(void 0),this.dispose()))}get isCancellationRequested(){return this._isCancelled}get onCancellationRequested(){return this._isCancelled?l:(this._emitter||(this._emitter=new c),this._emitter.event)}dispose(){this._emitter&&(this._emitter.dispose(),this._emitter=null)}}class u{_token=void 0;_parentListener=void 0;constructor(e){this._parentListener=e&&e.onCancellationRequested(this.cancel,this)}get token(){return this._token||(this._token=new o),this._token}cancel(){this._token?this._token instanceof o&&this._token.cancel():this._token=s.Cancelled}dispose(e=!1){e&&this.cancel(),this._parentListener?.dispose(),this._token?this._token instanceof o&&this._token.dispose():this._token=s.None}}function p(n){const e=new u;return n.add({dispose(){e.cancel()}}),e.token}export{s as CancellationToken,u as CancellationTokenSource,p as cancelOnDispose};
