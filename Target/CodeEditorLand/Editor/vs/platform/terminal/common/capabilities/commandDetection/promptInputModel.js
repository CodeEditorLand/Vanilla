var v=Object.defineProperty;var S=Object.getOwnPropertyDescriptor;var g=(p,l,t,e)=>{for(var n=e>1?void 0:e?S(l,t):l,h=p.length-1,s;h>=0;h--)(s=p[h])&&(n=(e?s(l,t,n):s(n))||n);return e&&n&&v(l,t,n),n},f=(p,l)=>(t,e)=>l(t,e,p);import{throttle as C}from"../../../../../base/common/decorators.js";import{Emitter as c,Event as P}from"../../../../../base/common/event.js";import{Disposable as b}from"../../../../../base/common/lifecycle.js";import{ILogService as T,LogLevel as x}from"../../../../log/common/log.js";var y=(e=>(e[e.Unknown=0]="Unknown",e[e.Input=1]="Input",e[e.Execute=2]="Execute",e))(y||{});let I=class extends b{constructor(t,e,n,h){super();this._xterm=t;this._logService=h;this._register(P.any(this._xterm.onCursorMove,this._xterm.onData,this._xterm.onWriteParsed)(()=>this._sync())),this._register(this._xterm.onData(s=>this._handleUserInput(s))),this._register(e(s=>this._handleCommandStart(s))),this._register(n(()=>this._handleCommandExecuted())),this._register(this.onDidStartInput(()=>this._logCombinedStringIfTrace("PromptInputModel#onDidStartInput"))),this._register(this.onDidChangeInput(()=>this._logCombinedStringIfTrace("PromptInputModel#onDidChangeInput"))),this._register(this.onDidFinishInput(()=>this._logCombinedStringIfTrace("PromptInputModel#onDidFinishInput"))),this._register(this.onDidInterrupt(()=>this._logCombinedStringIfTrace("PromptInputModel#onDidInterrupt")))}_state=0;_commandStartMarker;_commandStartX=0;_lastPromptLine;_continuationPrompt;_lastUserInput="";_value="";get value(){return this._value}get prefix(){return this._value.substring(0,this._cursorIndex)}get suffix(){return this._value.substring(this._cursorIndex,this._ghostTextIndex===-1?void 0:this._ghostTextIndex)}_cursorIndex=0;get cursorIndex(){return this._cursorIndex}_ghostTextIndex=-1;get ghostTextIndex(){return this._ghostTextIndex}_onDidStartInput=this._register(new c);onDidStartInput=this._onDidStartInput.event;_onDidChangeInput=this._register(new c);onDidChangeInput=this._onDidChangeInput.event;_onDidFinishInput=this._register(new c);onDidFinishInput=this._onDidFinishInput.event;_onDidInterrupt=this._register(new c);onDidInterrupt=this._onDidInterrupt.event;_logCombinedStringIfTrace(t){this._logService.getLevel()===x.Trace&&this._logService.trace(t,this.getCombinedString())}setContinuationPrompt(t){this._continuationPrompt=t,this._sync()}setLastPromptLine(t){this._lastPromptLine=t,this._sync()}setConfidentCommandLine(t){this._value!==t&&(this._value=t,this._cursorIndex=-1,this._ghostTextIndex=-1,this._onDidChangeInput.fire(this._createStateObject()))}getCombinedString(){const t=this._value.replaceAll(`
`,"\u23CE");if(this._cursorIndex===-1)return t;let e=`${t.substring(0,this.cursorIndex)}|`;return this.ghostTextIndex!==-1?(e+=`${t.substring(this.cursorIndex,this.ghostTextIndex)}[`,e+=`${t.substring(this.ghostTextIndex)}]`):e+=t.substring(this.cursorIndex),e}serialize(){return{modelState:this._createStateObject(),commandStartX:this._commandStartX,lastPromptLine:this._lastPromptLine,continuationPrompt:this._continuationPrompt,lastUserInput:this._lastUserInput}}deserialize(t){this._value=t.modelState.value,this._cursorIndex=t.modelState.cursorIndex,this._ghostTextIndex=t.modelState.ghostTextIndex,this._commandStartX=t.commandStartX,this._lastPromptLine=t.lastPromptLine,this._continuationPrompt=t.continuationPrompt,this._lastUserInput=t.lastUserInput}_handleCommandStart(t){this._state!==1&&(this._state=1,this._commandStartMarker=t.marker,this._commandStartX=this._xterm.buffer.active.cursorX,this._value="",this._cursorIndex=0,this._onDidStartInput.fire(this._createStateObject()),this._onDidChangeInput.fire(this._createStateObject()),this._lastPromptLine&&this._commandStartX!==this._lastPromptLine.length&&this._xterm.buffer.active.getLine(this._commandStartMarker.line)?.translateToString(!0).startsWith(this._lastPromptLine)&&(this._commandStartX=this._lastPromptLine.length,this._sync()))}_handleCommandExecuted(){if(this._state===2)return;this._cursorIndex=-1,this._ghostTextIndex!==-1&&(this._value=this._value.substring(0,this._ghostTextIndex),this._ghostTextIndex=-1);const t=this._createStateObject();this._lastUserInput===""&&(this._lastUserInput="",this._onDidInterrupt.fire(t)),this._state=2,this._onDidFinishInput.fire(t),this._onDidChangeInput.fire(t)}_sync(){try{this._doSync()}catch(t){this._logService.error("Error while syncing prompt input model",t)}}_doSync(){if(this._state!==1)return;const t=this._commandStartMarker?.line;if(t===void 0)return;const e=this._xterm.buffer.active;let n=e.getLine(t);const h=n?.translateToString(!0,this._commandStartX);if(!n||h===void 0){this._logService.trace("PromptInputModel#_sync: no line");return}const s=e.baseY+e.cursorY;let o=h,u=-1,r;s===t?r=this._getRelativeCursorIndex(this._commandStartX,e,n):r=h.trimEnd().length,s===t&&e.cursorX>1&&(u=this._scanForGhostText(e,n,r));for(let i=t+1;i<=s;i++){n=e.getLine(i);const a=n?.translateToString(!0);if(a&&n)if(n.isWrapped){o+=a;const d=this._getRelativeCursorIndex(0,e,n);s===i?r+=d:r+=a.length}else if(this._continuationPrompt===void 0||this._lineContainsContinuationPrompt(a)){const d=this._trimContinuationPrompt(a);if(o+=`
${d}`,s===i){const _=this._getContinuationPromptCellWidth(n,a),m=this._getRelativeCursorIndex(_,e,n);r+=m+1}else r+=d.length+1}else break}for(let i=s+1;i<e.baseY+this._xterm.rows;i++){n=e.getLine(i);const a=n?.translateToString(!0);if(a&&n)if(this._continuationPrompt===void 0||this._lineContainsContinuationPrompt(a))o+=`
${this._trimContinuationPrompt(a)}`;else break;else break}this._logService.getLevel()===x.Trace&&this._logService.trace(`PromptInputModel#_sync: ${this.getCombinedString()}`);{let i=this._value.length-this._value.trimEnd().length;this._lastUserInput==="\x7F"&&(this._lastUserInput="",r===this._cursorIndex-1&&(this._value.trimEnd().length>o.trimEnd().length&&o.trimEnd().length<=r?i=Math.max(this._value.length-1-o.trimEnd().length,0):i=Math.max(i-1,0))),this._lastUserInput==="\x1B[3~"&&(this._lastUserInput="",r===this._cursorIndex&&(i=Math.max(i-1,0)));const a=o.split(`
`),d=a.length>1,_=o.trimEnd();if(!d){_.length<o.length&&(this._lastUserInput===" "&&(this._lastUserInput="",r>_.length&&r>this._cursorIndex&&i++),i=Math.max(r-_.length,i,0));const m=r===0?"":o[r-1];i>0&&r===this._cursorIndex+1&&this._lastUserInput!==""&&m!==" "&&(i=this._value.length-this._cursorIndex)}if(d){a[a.length-1]=a.at(-1)?.trimEnd()??"";const m=(a.length-1)*(this._continuationPrompt?.length??0);i=Math.max(0,r-o.length-m)}o=a.map(m=>m.trimEnd()).join(`
`)+" ".repeat(i)}(this._value!==o||this._cursorIndex!==r||this._ghostTextIndex!==u)&&(this._value=o,this._cursorIndex=r,this._ghostTextIndex=u,this._onDidChangeInput.fire(this._createStateObject()))}_handleUserInput(t){this._lastUserInput=t}_scanForGhostText(t,e,n){let h=-1,s=!1,o=t.cursorX;for(;o>0;){const u=e.getCell(--o);if(!u)break;if(u.getChars().trim().length>0){s=!this._isCellStyledLikeGhostText(u);break}}if(s){let u=0,r=t.cursorX;for(;r<e.length;){const i=e.getCell(r++);if(!i||i.getCode()===0)break;if(this._isCellStyledLikeGhostText(i)){h=n+u;break}u+=i.getChars().length}}return h}_trimContinuationPrompt(t){return this._lineContainsContinuationPrompt(t)&&(t=t.substring(this._continuationPrompt.length)),t}_lineContainsContinuationPrompt(t){return!!(this._continuationPrompt&&t.startsWith(this._continuationPrompt))}_getContinuationPromptCellWidth(t,e){if(!this._continuationPrompt||!e.startsWith(this._continuationPrompt))return 0;let n="",h=0;for(;n!==this._continuationPrompt;)n+=t.getCell(h++).getChars();return h}_getRelativeCursorIndex(t,e,n){return n?.translateToString(!0,t,e.cursorX).length??0}_isCellStyledLikeGhostText(t){return!!(t.isItalic()||t.isDim())}_createStateObject(){return Object.freeze({value:this._value,prefix:this.prefix,suffix:this.suffix,cursorIndex:this._cursorIndex,ghostTextIndex:this._ghostTextIndex})}};g([C(0)],I.prototype,"_sync",1),I=g([f(3,T)],I);export{I as PromptInputModel};
