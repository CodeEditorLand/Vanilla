import{timeout as p}from"../../../../vs/base/common/async.js";import{Disposable as a}from"../../../../vs/base/common/lifecycle.js";import{isWindows as h}from"../../../../vs/base/common/platform.js";import"../../../../vs/platform/log/common/log.js";import"../../../../vs/platform/terminal/common/terminal.js";class v extends a{_pointer=0;_paused=!1;_throttled=!1;constructor(r,t,s,n){super(),this._register(r.onProcessData(e=>{if(this._paused||this._throttled)return;const o=typeof e=="string"?e:e.data;for(let i=0;i<o.length;i++)o[i]===t[this._pointer]?this._pointer++:this._reset(),this._pointer===t.length&&(n.debug(`Auto reply match: "${t}", response: "${s}"`),r.input(s),this._throttled=!0,p(1e3).then(()=>this._throttled=!1),this._reset())}))}_reset(){this._pointer=0}handleResize(){h&&(this._paused=!0)}handleInput(){this._paused=!1}}export{v as TerminalAutoResponder};
