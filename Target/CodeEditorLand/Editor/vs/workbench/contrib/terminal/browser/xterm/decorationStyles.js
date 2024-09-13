var h=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var C=(n,o,t,e)=>{for(var i=e>1?void 0:e?x(o,t):o,r=n.length-1,a;r>=0;r--)(a=n[r])&&(i=(e?a(o,t,i):a(i))||i);return e&&i&&h(o,t,i),i},u=(n,o)=>(t,e)=>o(t,e,n);import*as l from"../../../../../base/browser/dom.js";import{Delayer as v}from"../../../../../base/common/async.js";import{fromNow as m,getDurationString as y}from"../../../../../base/common/date.js";import{MarkdownString as b}from"../../../../../base/common/htmlContent.js";import{Disposable as c,combinedDisposable as D}from"../../../../../base/common/lifecycle.js";import{localize as d}from"../../../../../nls.js";import{IConfigurationService as E}from"../../../../../platform/configuration/common/configuration.js";import{IContextMenuService as _}from"../../../../../platform/contextview/browser/contextView.js";import{IHoverService as g}from"../../../../../platform/hover/browser/hover.js";import{TerminalSettingId as f}from"../../../../../platform/terminal/common/terminal.js";var S=(t=>(t[t.DefaultDimension=16]="DefaultDimension",t[t.MarginLeft=-17]="MarginLeft",t))(S||{}),I=(s=>(s.CommandDecoration="terminal-command-decoration",s.Hide="hide",s.ErrorColor="error",s.DefaultColor="default-color",s.Default="default",s.Codicon="codicon",s.XtermDecoration="xterm-decoration",s.OverviewRuler=".xterm-decoration-overview-ruler",s))(I||{});let p=class extends c{constructor(t,e,i){super();this._hoverService=t;this._register(i.onDidShowContextMenu(()=>this._contextMenuVisible=!0)),this._register(i.onDidHideContextMenu(()=>this._contextMenuVisible=!1)),this._hoverDelayer=this._register(new v(e.getValue("workbench.hover.delay")))}_hoverDelayer;_contextMenuVisible=!1;hideHover(){this._hoverDelayer.cancel(),this._hoverService.hideHover()}createHover(t,e,i){return D(l.addDisposableListener(t,l.EventType.MOUSE_ENTER,()=>{this._contextMenuVisible||this._hoverDelayer.trigger(()=>{let r=`${d("terminalPromptContextMenu","Show Command Actions")}`;if(r+=`

---

`,e)if(e.markProperties||i)if(e.markProperties?.hoverMessage||i)r=e.markProperties?.hoverMessage||i||"";else return;else if(e.duration){const a=y(e.duration);e.exitCode?e.exitCode===-1?r+=d("terminalPromptCommandFailed.duration","Command executed {0}, took {1} and failed",m(e.timestamp,!0),a):r+=d("terminalPromptCommandFailedWithExitCode.duration","Command executed {0}, took {1} and failed (Exit Code {2})",m(e.timestamp,!0),a,e.exitCode):r+=d("terminalPromptCommandSuccess.duration","Command executed {0} and took {1}",m(e.timestamp,!0),a)}else e.exitCode?e.exitCode===-1?r+=d("terminalPromptCommandFailed","Command executed {0} and failed",m(e.timestamp,!0)):r+=d("terminalPromptCommandFailedWithExitCode","Command executed {0} and failed (Exit Code {1})",m(e.timestamp,!0),e.exitCode):r+=d("terminalPromptCommandSuccess","Command executed {0}",m(e.timestamp,!0));else if(i)r=i;else return;this._hoverService.showHover({content:new b(r),target:t})})}),l.addDisposableListener(t,l.EventType.MOUSE_LEAVE,()=>this.hideHover()),l.addDisposableListener(t,l.EventType.MOUSE_OUT,()=>this.hideHover()))}};p=C([u(0,g),u(1,E),u(2,_)],p);function O(n,o){if(!o)return;const t=n.inspect(f.FontSize).value,e=n.inspect(f.FontSize).defaultValue,i=n.inspect(f.LineHeight).value;if(typeof t=="number"&&typeof e=="number"&&typeof i=="number"){const r=t/e<=1?t/e:1;o.style.width=`${r*16}px`,o.style.height=`${r*16*i}px`,o.style.fontSize=`${r*16}px`,o.style.marginLeft=`${r*-17}px`}}export{I as DecorationSelector,p as TerminalDecorationHoverManager,O as updateLayout};
