var a=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var h=(r,t,e,o)=>{for(var i=o>1?void 0:o?_(t,e):t,s=r.length-1,d;s>=0;s--)(d=r[s])&&(i=(o?d(t,e,i):d(i))||i);return o&&i&&a(t,e,i),i},l=(r,t)=>(e,o)=>t(e,o,r);import"../../../../../vs/base/common/lifecycle.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{IContextKeyService as m,RawContextKey as p}from"../../../../../vs/platform/contextkey/common/contextkey.js";import"./completionModel.js";import"./suggestWidget.js";let n=class{constructor(t,e){this._editor=t;this._ckOtherSuggestions=n.OtherSuggestions.bindTo(e)}static OtherSuggestions=new p("hasOtherSuggestions",!1);_ckOtherSuggestions;_index=0;_model;_acceptNext;_listener;_ignore;dispose(){this.reset()}reset(){this._ckOtherSuggestions.reset(),this._listener?.dispose(),this._model=void 0,this._acceptNext=void 0,this._ignore=!1}set({model:t,index:e},o){if(t.items.length===0){this.reset();return}if(n._moveIndex(!0,t,e)===e){this.reset();return}this._acceptNext=o,this._model=t,this._index=e,this._listener=this._editor.onDidChangeCursorPosition(()=>{this._ignore||this.reset()}),this._ckOtherSuggestions.set(!0)}static _moveIndex(t,e,o){let i=o;for(let s=e.items.length;s>0&&(i=(i+e.items.length+(t?1:-1))%e.items.length,!(i===o||!e.items[i].completion.additionalTextEdits));s--);return i}next(){this._move(!0)}prev(){this._move(!1)}_move(t){if(this._model)try{this._ignore=!0,this._index=n._moveIndex(t,this._model,this._index),this._acceptNext({index:this._index,item:this._model.items[this._index],model:this._model})}finally{this._ignore=!1}}};n=h([l(1,m)],n);export{n as SuggestAlternatives};
