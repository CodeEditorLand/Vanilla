var c=Object.defineProperty;var p=Object.getOwnPropertyDescriptor;var d=(m,r,e,t)=>{for(var o=t>1?void 0:t?p(r,e):r,n=m.length-1,i;n>=0;n--)(i=m[n])&&(o=(t?i(r,e,o):i(o))||o);return t&&o&&c(r,e,o),o},l=(m,r)=>(e,t)=>r(e,t,m);import*as C from"../../../../../../vs/base/browser/dom.js";import{Button as h}from"../../../../../../vs/base/browser/ui/button/button.js";import{Disposable as b}from"../../../../../../vs/base/common/lifecycle.js";import{localize as f}from"../../../../../../vs/nls.js";import{ICommandService as u}from"../../../../../../vs/platform/commands/common/commands.js";import{defaultButtonStyles as I}from"../../../../../../vs/platform/theme/browser/defaultStyles.js";import"../../../../../../vs/workbench/contrib/chat/browser/chatContentParts/chatContentParts.js";import"../../../../../../vs/workbench/contrib/chat/common/chatModel.js";import"../../../../../../vs/workbench/contrib/chat/common/chatService.js";import{isResponseVM as R}from"../../../../../../vs/workbench/contrib/chat/common/chatViewModel.js";const S=C.$;let s=class extends b{constructor(e,t,o){super();this.commandService=o;this.domNode=S(".chat-command-button");const n=!R(t.element)||!t.element.isStale,i=n?e.command.tooltip:f("commandButtonDisabled","Button not available in restored chat"),a=this._register(new h(this.domNode,{...I,supportIcons:!0,title:i}));a.label=e.command.title,a.enabled=n,this._register(a.onDidClick(()=>this.commandService.executeCommand(e.command.id,...e.command.arguments??[])))}domNode;hasSameContent(e){return e.kind==="command"}};s=d([l(2,u)],s);export{s as ChatCommandButtonContentPart};