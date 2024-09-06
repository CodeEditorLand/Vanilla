import{Emitter as a}from"../../../../../../vs/base/common/event.js";import{Disposable as s,toDisposable as n}from"../../../../../../vs/base/common/lifecycle.js";import{OperatingSystem as o}from"../../../../../../vs/base/common/platform.js";class v extends s{constructor(i){super();this._initializationPromise=i}_xterm;_isOsSet=!1;_onLineData=this._register(new a);onLineData=this._onLineData.event;async activate(i){this._xterm=i;const e=i.buffer;await this._initializationPromise,this._register(i.onLineFeed(()=>{const t=e.active.getLine(e.active.baseY+e.active.cursorY);t&&!t.isWrapped&&this._sendLineData(e.active,e.active.baseY+e.active.cursorY-1)})),this._register(n(()=>{this._sendLineData(e.active,e.active.baseY+e.active.cursorY)}))}setOperatingSystem(i){if(!(this._isOsSet||!this._xterm)&&(this._isOsSet=!0,i===o.Windows)){const e=this._xterm;this._register(e.parser.registerCsiHandler({final:"H"},()=>{const t=e.buffer;return this._sendLineData(t.active,t.active.baseY+t.active.cursorY),!1}))}}_sendLineData(i,e){let t=i.getLine(e);if(!t)return;let r=t.translateToString(!0);for(;e>0&&t.isWrapped&&(t=i.getLine(--e),!!t);)r=t.translateToString(!1)+r;this._onLineData.fire(r)}}export{v as LineDataEventAddon};
