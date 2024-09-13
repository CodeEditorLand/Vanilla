var F=Object.defineProperty;var W=Object.getOwnPropertyDescriptor;var d=(s,i,e,t)=>{for(var o=t>1?void 0:t?W(i,e):i,l=s.length-1,m;l>=0;l--)(m=s[l])&&(o=(t?m(i,e,o):m(o))||o);return t&&o&&F(i,e,o),o},I=(s,i)=>(e,t)=>i(e,t,s);import{MouseWheelClassifier as _}from"../../../../../base/browser/ui/scrollbar/scrollableElement.js";import{Event as z}from"../../../../../base/common/event.js";import{Disposable as C,MutableDisposable as D,toDisposable as Z}from"../../../../../base/common/lifecycle.js";import{isMacintosh as b}from"../../../../../base/common/platform.js";import{isNumber as S}from"../../../../../base/common/types.js";import{localize2 as g}from"../../../../../nls.js";import{IConfigurationService as c}from"../../../../../platform/configuration/common/configuration.js";import{TerminalSettingId as r}from"../../../../../platform/terminal/common/terminal.js";import{registerTerminalAction as p}from"../../../terminal/browser/terminalActions.js";import{registerTerminalContribution as w}from"../../../terminal/browser/terminalExtensions.js";import{defaultTerminalFontSize as V}from"../../../terminal/common/terminalConfiguration.js";import{TerminalZoomCommandId as h,TerminalZoomSettingId as v}from"../common/terminal.zoom.js";let a=class extends C{constructor(e,t,o,l){super();this._configurationService=l}static ID="terminal.mouseWheelZoom";static activeFindWidget;static get(e){return e.getContribution(a.ID)}_listener=this._register(new D);xtermOpen(e){this._register(z.runAndSubscribe(this._configurationService.onDidChangeConfiguration,t=>{(!t||t.affectsConfiguration(v.MouseWheelZoom))&&(this._configurationService.getValue(v.MouseWheelZoom)?this._setupMouseWheelZoomListener(e.raw):this._listener.clear())}))}_getConfigFontSize(){return this._configurationService.getValue(r.FontSize)}_setupMouseWheelZoomListener(e){const t=_.INSTANCE;let o=0,l=this._getConfigFontSize(),m=!1,u=0;e.attachCustomWheelEventHandler(M=>{const n=M;if(t.isPhysicalMouseWheel()){if(this._hasMouseWheelZoomModifiers(n)){const f=n.deltaY>0?-1:1;return this._configurationService.updateValue(r.FontSize,this._getConfigFontSize()+f),n.preventDefault(),n.stopPropagation(),!1}}else if(Date.now()-o>50&&(l=this._getConfigFontSize(),m=this._hasMouseWheelZoomModifiers(n),u=0),o=Date.now(),u+=n.deltaY,m){const f=Math.ceil(Math.abs(u/5)),T=u>0?-1:1,y=f*T;return this._configurationService.updateValue(r.FontSize,l+y),u+=n.deltaY,n.preventDefault(),n.stopPropagation(),!1}return!0}),this._listener.value=Z(()=>e.attachCustomWheelEventHandler(()=>!0))}_hasMouseWheelZoomModifiers(e){return b?(e.metaKey||e.ctrlKey)&&!e.shiftKey&&!e.altKey:e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey}};a=d([I(3,c)],a),w(a.ID,a,!0),p({id:h.FontZoomIn,title:g("fontZoomIn","Increase Font Size"),run:async(s,i)=>{const e=i.get(c),t=e.getValue(r.FontSize);S(t)&&await e.updateValue(r.FontSize,t+1)}}),p({id:h.FontZoomOut,title:g("fontZoomOut","Decrease Font Size"),run:async(s,i)=>{const e=i.get(c),t=e.getValue(r.FontSize);S(t)&&await e.updateValue(r.FontSize,t-1)}}),p({id:h.FontZoomReset,title:g("fontZoomReset","Reset Font Size"),run:async(s,i)=>{await i.get(c).updateValue(r.FontSize,V)}});
