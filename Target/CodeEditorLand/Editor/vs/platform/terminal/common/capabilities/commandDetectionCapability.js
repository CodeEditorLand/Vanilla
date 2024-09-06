var w=Object.defineProperty;var L=Object.getOwnPropertyDescriptor;var f=(o,d,e,t)=>{for(var r=t>1?void 0:t?L(d,e):d,i=o.length-1,n;i>=0;i--)(n=o[i])&&(r=(t?n(d,e,r):n(r))||r);return t&&r&&w(d,e,r),r},k=(o,d)=>(e,t)=>d(e,t,o);import{RunOnceScheduler as b}from"../../../../../vs/base/common/async.js";import{debounce as x}from"../../../../../vs/base/common/decorators.js";import{Emitter as C}from"../../../../../vs/base/common/event.js";import{Disposable as g,MandatoryMutableDisposable as P,MutableDisposable as E}from"../../../../../vs/base/common/lifecycle.js";import{ILogService as M}from"../../../../../vs/platform/log/common/log.js";import{CommandInvalidationReason as v,TerminalCapability as T}from"../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import{PromptInputModel as H}from"../../../../../vs/platform/terminal/common/capabilities/commandDetection/promptInputModel.js";import{PartialTerminalCommand as y,TerminalCommand as D}from"../../../../../vs/platform/terminal/common/capabilities/commandDetection/terminalCommand.js";import"../../../../../vs/platform/terminal/common/terminal.js";let _=class extends g{constructor(e,t){super();this._terminal=e;this._logService=t;this._promptInputModel=this._register(new H(this._terminal,this.onCommandStarted,this.onCommandExecuted,this._logService)),this._register(this.onCommandExecuted(i=>{if(i.commandLineConfidence!=="high"){const n=i;i.command=n.extractCommandLine(),i.commandLineConfidence="low","getOutput"in n?n.promptStartMarker&&n.marker&&n.executedMarker&&i.command.indexOf(`
`)===-1&&n.startX!==void 0&&n.startX>0&&(i.commandLineConfidence="medium"):n.promptStartMarker&&n.commandStartMarker&&n.commandExecutedMarker&&i.command.indexOf(`
`)===-1&&n.commandStartX!==void 0&&n.commandStartX>0&&(i.commandLineConfidence="medium")}}));const r=this;this._ptyHeuristicsHooks=new class{get onCurrentCommandInvalidatedEmitter(){return r._onCurrentCommandInvalidated}get onCommandStartedEmitter(){return r._onCommandStarted}get onCommandExecutedEmitter(){return r._onCommandExecuted}get dimensions(){return r._dimensions}get isCommandStorageDisabled(){return r.__isCommandStorageDisabled}get commandMarkers(){return r._commandMarkers}set commandMarkers(i){r._commandMarkers=i}get clearCommandsInViewport(){return r._clearCommandsInViewport.bind(r)}commitCommandFinished(){r._commitCommandFinished?.flush(),r._commitCommandFinished=void 0}},this._ptyHeuristics=this._register(new P(new S(this._terminal,this,this._ptyHeuristicsHooks,this._logService))),this._dimensions={cols:this._terminal.cols,rows:this._terminal.rows},this._register(this._terminal.onResize(i=>this._handleResize(i))),this._register(this._terminal.onCursorMove(()=>this._handleCursorMove()))}type=T.CommandDetection;_promptInputModel;get promptInputModel(){return this._promptInputModel}_commands=[];_cwd;_promptTerminator;_currentCommand=new y(this._terminal);_commandMarkers=[];_dimensions;__isCommandStorageDisabled=!1;_handleCommandStartOptions;_commitCommandFinished;_ptyHeuristicsHooks;_ptyHeuristics;get commands(){return this._commands}get executingCommand(){return this._currentCommand.command}get executingCommandObject(){if(this._currentCommand.commandStartMarker)return{marker:this._currentCommand.commandStartMarker}}get currentCommand(){return this._currentCommand}get cwd(){return this._cwd}get promptTerminator(){return this._promptTerminator}_onCommandStarted=this._register(new C);onCommandStarted=this._onCommandStarted.event;_onBeforeCommandFinished=this._register(new C);onBeforeCommandFinished=this._onBeforeCommandFinished.event;_onCommandFinished=this._register(new C);onCommandFinished=this._onCommandFinished.event;_onCommandExecuted=this._register(new C);onCommandExecuted=this._onCommandExecuted.event;_onCommandInvalidated=this._register(new C);onCommandInvalidated=this._onCommandInvalidated.event;_onCurrentCommandInvalidated=this._register(new C);onCurrentCommandInvalidated=this._onCurrentCommandInvalidated.event;_handleResize(e){this._ptyHeuristics.value.preHandleResize?.(e),this._dimensions.cols=e.cols,this._dimensions.rows=e.rows}_handleCursorMove(){this._store.isDisposed||this._terminal.buffer.active===this._terminal.buffer.normal&&this._currentCommand.commandStartMarker&&this._terminal.buffer.active.baseY+this._terminal.buffer.active.cursorY<this._currentCommand.commandStartMarker.line&&(this._clearCommandsInViewport(),this._currentCommand.isInvalid=!0,this._onCurrentCommandInvalidated.fire({reason:v.Windows}))}_clearCommandsInViewport(){let e=0;for(let t=this._commands.length-1;t>=0;t--){const r=this._commands[t].marker?.line;if(r&&r<this._terminal.buffer.active.baseY)break;e++}e>0&&this._onCommandInvalidated.fire(this._commands.splice(this._commands.length-e,e))}setContinuationPrompt(e){this._promptInputModel.setContinuationPrompt(e)}setPromptTerminator(e,t){this._logService.debug("CommandDetectionCapability#setPromptTerminator",e),this._promptTerminator=e,this._promptInputModel.setLastPromptLine(t)}setCwd(e){this._cwd=e}setIsWindowsPty(e){if(e&&!(this._ptyHeuristics.value instanceof h)){const t=this;this._ptyHeuristics.value=new h(this._terminal,this,new class{get onCurrentCommandInvalidatedEmitter(){return t._onCurrentCommandInvalidated}get onCommandStartedEmitter(){return t._onCommandStarted}get onCommandExecutedEmitter(){return t._onCommandExecuted}get dimensions(){return t._dimensions}get isCommandStorageDisabled(){return t.__isCommandStorageDisabled}get commandMarkers(){return t._commandMarkers}set commandMarkers(r){t._commandMarkers=r}get clearCommandsInViewport(){return t._clearCommandsInViewport.bind(t)}commitCommandFinished(){t._commitCommandFinished?.flush(),t._commitCommandFinished=void 0}},this._logService)}else!e&&!(this._ptyHeuristics.value instanceof S)&&(this._ptyHeuristics.value=new S(this._terminal,this,this._ptyHeuristicsHooks,this._logService))}setIsCommandStorageDisabled(){this.__isCommandStorageDisabled=!0}getCommandForLine(e){if(this._currentCommand.promptStartMarker&&e>=this._currentCommand.promptStartMarker?.line)return this._currentCommand;if(this._commands.length!==0&&!((this._commands[0].promptStartMarker??this._commands[0].marker).line>e)){for(let t=this.commands.length-1;t>=0;t--)if((this.commands[t].promptStartMarker??this.commands[t].marker).line<=e)return this.commands[t]}}getCwdForLine(e){if(this._currentCommand.promptStartMarker&&e>=this._currentCommand.promptStartMarker?.line)return this._cwd;const t=this.getCommandForLine(e);if(t&&"cwd"in t)return t.cwd}handlePromptStart(e){const t=this.commands.at(-1);t?.endMarker&&t?.executedMarker&&t.endMarker.line===t.executedMarker.line&&(this._logService.debug("CommandDetectionCapability#handlePromptStart adjusted commandFinished",`${t.endMarker.line} -> ${t.executedMarker.line+1}`),t.endMarker=p(this._terminal,t.executedMarker,1)),this._currentCommand.promptStartMarker=e?.marker||(t?.endMarker?p(this._terminal,t.endMarker):this._terminal.registerMarker(0)),this._logService.debug("CommandDetectionCapability#handlePromptStart",this._terminal.buffer.active.cursorX,this._currentCommand.promptStartMarker?.line)}handleContinuationStart(){this._currentCommand.currentContinuationMarker=this._terminal.registerMarker(0),this._logService.debug("CommandDetectionCapability#handleContinuationStart",this._currentCommand.currentContinuationMarker)}handleContinuationEnd(){if(!this._currentCommand.currentContinuationMarker){this._logService.warn("CommandDetectionCapability#handleContinuationEnd Received continuation end without start");return}this._currentCommand.continuations||(this._currentCommand.continuations=[]),this._currentCommand.continuations.push({marker:this._currentCommand.currentContinuationMarker,end:this._terminal.buffer.active.cursorX}),this._currentCommand.currentContinuationMarker=void 0,this._logService.debug("CommandDetectionCapability#handleContinuationEnd",this._currentCommand.continuations[this._currentCommand.continuations.length-1])}handleRightPromptStart(){this._currentCommand.commandRightPromptStartX=this._terminal.buffer.active.cursorX,this._logService.debug("CommandDetectionCapability#handleRightPromptStart",this._currentCommand.commandRightPromptStartX)}handleRightPromptEnd(){this._currentCommand.commandRightPromptEndX=this._terminal.buffer.active.cursorX,this._logService.debug("CommandDetectionCapability#handleRightPromptEnd",this._currentCommand.commandRightPromptEndX)}handleCommandStart(e){if(this._handleCommandStartOptions=e,this._currentCommand.cwd=this._cwd,this._currentCommand.commandStartMarker=e?.marker||this._currentCommand.commandStartMarker,this._currentCommand.commandStartMarker?.line===this._terminal.buffer.active.cursorY){this._currentCommand.commandStartX=this._terminal.buffer.active.cursorX,this._logService.debug("CommandDetectionCapability#handleCommandStart",this._currentCommand.commandStartX,this._currentCommand.commandStartMarker?.line);return}this._ptyHeuristics.value.handleCommandStart(e)}handleGenericCommand(e){e?.markProperties?.disableCommandStorage&&this.setIsCommandStorageDisabled(),this.handlePromptStart(e),this.handleCommandStart(e),this.handleCommandExecuted(e),this.handleCommandFinished(void 0,e)}handleCommandExecuted(e){this._ptyHeuristics.value.handleCommandExecuted(e),this._currentCommand.markExecutedTime()}handleCommandFinished(e,t){if(this._currentCommand.markFinishedTime(),this._ptyHeuristics.value.preHandleCommandFinished?.(),this._logService.debug("CommandDetectionCapability#handleCommandFinished",this._terminal.buffer.active.cursorX,t?.marker?.line,this._currentCommand.command,this._currentCommand),e===void 0){const i=this.commands.length>0?this.commands[this.commands.length-1]:void 0;this._currentCommand.command&&this._currentCommand.command.length>0&&i?.command===this._currentCommand.command&&(e=i.exitCode)}if(this._currentCommand.commandStartMarker===void 0||!this._terminal.buffer.active)return;this._currentCommand.commandFinishedMarker=t?.marker||this._terminal.registerMarker(0),this._ptyHeuristics.value.postHandleCommandFinished?.();const r=this._currentCommand.promoteToFullCommand(this._cwd,e,this._handleCommandStartOptions?.ignoreCommandLine??!1,t?.markProperties);r&&(this._commands.push(r),this._commitCommandFinished=new b(()=>{this._onBeforeCommandFinished.fire(r),this._currentCommand.isInvalid||(this._logService.debug("CommandDetectionCapability#onCommandFinished",r),this._onCommandFinished.fire(r))},50),this._commitCommandFinished.schedule()),this._currentCommand=new y(this._terminal),this._handleCommandStartOptions=void 0}setCommandLine(e,t){this._logService.debug("CommandDetectionCapability#setCommandLine",e,t),this._currentCommand.command=e,this._currentCommand.commandLineConfidence="high",this._currentCommand.isTrusted=t,t&&this._promptInputModel.setConfidentCommandLine(e)}serialize(){const e=this.commands.map(r=>r.serialize(this.__isCommandStorageDisabled)),t=this._currentCommand.serialize(this._cwd);return t&&e.push(t),{isWindowsPty:this._ptyHeuristics.value instanceof h,commands:e,promptInputModel:this._promptInputModel.serialize()}}deserialize(e){e.isWindowsPty&&this.setIsWindowsPty(e.isWindowsPty);const t=this._terminal.buffer.normal;for(const r of e.commands){if(!r.endLine){const n=r.startLine!==void 0?this._terminal.registerMarker(r.startLine-(t.baseY+t.cursorY)):void 0;if(!n)continue;this._currentCommand.commandStartMarker=r.startLine!==void 0?this._terminal.registerMarker(r.startLine-(t.baseY+t.cursorY)):void 0,this._currentCommand.commandStartX=r.startX,this._currentCommand.promptStartMarker=r.promptStartLine!==void 0?this._terminal.registerMarker(r.promptStartLine-(t.baseY+t.cursorY)):void 0,this._cwd=r.cwd,this._onCommandStarted.fire({marker:n});continue}const i=D.deserialize(this._terminal,r,this.__isCommandStorageDisabled);i&&(this._commands.push(i),this._logService.debug("CommandDetectionCapability#onCommandFinished",i),this._onCommandFinished.fire(i))}e.promptInputModel&&this._promptInputModel.deserialize(e.promptInputModel)}};f([x(500)],_.prototype,"_handleCursorMove",1),_=f([k(1,M)],_);class S extends g{constructor(e,t,r,i){super();this._terminal=e;this._capability=t;this._hooks=r;this._logService=i;this._register(e.parser.registerCsiHandler({final:"J"},n=>(n.length>=1&&(n[0]===2||n[0]===3)&&r.clearCommandsInViewport(),!1)))}handleCommandStart(e){this._hooks.commitCommandFinished();const t=this._capability.currentCommand;t.commandStartX=this._terminal.buffer.active.cursorX,t.commandStartMarker=e?.marker||this._terminal.registerMarker(0),t.commandExecutedMarker?.dispose(),t.commandExecutedMarker=void 0,t.commandExecutedX=void 0;for(const r of this._hooks.commandMarkers)r.dispose();this._hooks.commandMarkers.length=0,this._hooks.onCommandStartedEmitter.fire({marker:e?.marker||t.commandStartMarker,markProperties:e?.markProperties}),this._logService.debug("CommandDetectionCapability#handleCommandStart",t.commandStartX,t.commandStartMarker?.line)}handleCommandExecuted(e){const t=this._capability.currentCommand;if(t.commandExecutedMarker=e?.marker||this._terminal.registerMarker(0),t.commandExecutedX=this._terminal.buffer.active.cursorX,this._logService.debug("CommandDetectionCapability#handleCommandExecuted",t.commandExecutedX,t.commandExecutedMarker?.line),!t.commandStartMarker||!t.commandExecutedMarker||t.commandStartX===void 0)return;t.command=this._hooks.isCommandStorageDisabled?"":this._terminal.buffer.active.getLine(t.commandStartMarker.line)?.translateToString(!0,t.commandStartX,t.commandRightPromptStartX).trim();let r=t.commandStartMarker.line+1;const i=t.commandExecutedMarker.line;for(;r<i;r++){const n=this._terminal.buffer.active.getLine(r);if(n){const a=t.continuations?.find(s=>s.marker.line===r);a&&(t.command+=`
`);const c=a?.end??0;t.command+=n.translateToString(!0,c)}}r===i&&(t.command+=this._terminal.buffer.active.getLine(i)?.translateToString(!0,void 0,t.commandExecutedX)||""),this._hooks.onCommandExecutedEmitter.fire(t)}}var X=(t=>(t[t.MaxCheckLineCount=10]="MaxCheckLineCount",t[t.Interval=20]="Interval",t[t.MaximumPollCount=10]="MaximumPollCount",t))(X||{});let h=class extends g{constructor(e,t,r,i){super();this._terminal=e;this._capability=t;this._hooks=r;this._logService=i;this._register(e.parser.registerCsiHandler({final:"J"},n=>(n.length>=1&&(n[0]===2||n[0]===3)&&this._hooks.clearCommandsInViewport(),!1))),this._register(this._capability.onBeforeCommandFinished(n=>{(n.command.trim().toLowerCase()==="clear"||n.command.trim().toLowerCase()==="cls")&&(this._tryAdjustCommandStartMarkerScheduler?.cancel(),this._tryAdjustCommandStartMarkerScheduler=void 0,this._hooks.clearCommandsInViewport(),this._capability.currentCommand.isInvalid=!0,this._hooks.onCurrentCommandInvalidatedEmitter.fire({reason:v.Windows}))}))}_onCursorMoveListener=this._register(new E);_tryAdjustCommandStartMarkerScheduler;_tryAdjustCommandStartMarkerScannedLineCount=0;_tryAdjustCommandStartMarkerPollCount=0;preHandleResize(e){const t=this._terminal.buffer.active.baseY,r=e.rows-this._hooks.dimensions.rows;r>0&&this._waitForCursorMove().then(()=>{const i=Math.min(r,t);for(let n=this._capability.commands.length-1;n>=0;n--){const a=this._capability.commands[n];if(!a.marker||a.marker.line<t||a.commandStartLineContent===void 0)break;const c=this._terminal.buffer.active.getLine(a.marker.line);if(!c||c.translateToString(!0)===a.commandStartLineContent)continue;const s=a.marker.line-i;this._terminal.buffer.active.getLine(s)?.translateToString(!0)===a.commandStartLineContent&&this._terminal._core._bufferService.buffer.lines.onDeleteEmitter.fire({index:this._terminal.buffer.active.baseY,amount:i})}})}handleCommandStart(){this._capability.currentCommand.commandStartX=this._terminal.buffer.active.cursorX,this._hooks.commandMarkers.length=0;const e=this._capability.currentCommand.commandStartMarker=this._capability.currentCommand.promptStartMarker?p(this._terminal,this._capability.currentCommand.promptStartMarker):this._terminal.registerMarker(0);this._capability.currentCommand.commandStartX=0,this._tryAdjustCommandStartMarkerScannedLineCount=0,this._tryAdjustCommandStartMarkerPollCount=0,this._tryAdjustCommandStartMarkerScheduler=new b(()=>this._tryAdjustCommandStartMarker(e),20),this._tryAdjustCommandStartMarkerScheduler.schedule()}_tryAdjustCommandStartMarker(e){if(this._store.isDisposed)return;const t=this._terminal.buffer.active;let r=this._tryAdjustCommandStartMarkerScannedLineCount;for(;r<10&&e.line+r<t.baseY+this._terminal.rows;){if(this._cursorOnNextLine()){const i=this._getWindowsPrompt(e.line+r);if(i){const n=typeof i=="string"?i:i.prompt;if(this._capability.currentCommand.commandStartMarker=this._terminal.registerMarker(0),typeof i=="object"&&i.likelySingleLine){this._logService.debug("CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted promptStart",`${this._capability.currentCommand.promptStartMarker?.line} -> ${this._capability.currentCommand.commandStartMarker.line}`),this._capability.currentCommand.promptStartMarker?.dispose(),this._capability.currentCommand.promptStartMarker=p(this._terminal,this._capability.currentCommand.commandStartMarker);const a=this._capability.commands.at(-1);a&&this._capability.currentCommand.commandStartMarker.line!==a.endMarker?.line&&(a.endMarker?.dispose(),a.endMarker=p(this._terminal,this._capability.currentCommand.commandStartMarker))}this._capability.currentCommand.commandStartX=n.length,this._logService.debug("CommandDetectionCapability#_tryAdjustCommandStartMarker adjusted commandStart",`${e.line} -> ${this._capability.currentCommand.commandStartMarker.line}:${this._capability.currentCommand.commandStartX}`),this._flushPendingHandleCommandStartTask();return}}r++}r<10?(this._tryAdjustCommandStartMarkerScannedLineCount=r,++this._tryAdjustCommandStartMarkerPollCount<10?this._tryAdjustCommandStartMarkerScheduler?.schedule():this._flushPendingHandleCommandStartTask()):this._flushPendingHandleCommandStartTask()}_flushPendingHandleCommandStartTask(){if(this._tryAdjustCommandStartMarkerScheduler&&(this._tryAdjustCommandStartMarkerPollCount=10,this._tryAdjustCommandStartMarkerScheduler.flush(),this._tryAdjustCommandStartMarkerScheduler=void 0),this._hooks.commitCommandFinished(),this._capability.currentCommand.commandExecutedMarker||(this._onCursorMoveListener.value=this._terminal.onCursorMove(()=>{if(this._hooks.commandMarkers.length===0||this._hooks.commandMarkers[this._hooks.commandMarkers.length-1].line!==this._terminal.buffer.active.cursorY){const e=this._terminal.registerMarker(0);e&&this._hooks.commandMarkers.push(e)}})),this._capability.currentCommand.commandStartMarker){const e=this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);e&&(this._capability.currentCommand.commandStartLineContent=e.translateToString(!0))}this._hooks.onCommandStartedEmitter.fire({marker:this._capability.currentCommand.commandStartMarker}),this._logService.debug("CommandDetectionCapability#_handleCommandStartWindows",this._capability.currentCommand.commandStartX,this._capability.currentCommand.commandStartMarker?.line)}handleCommandExecuted(e){this._tryAdjustCommandStartMarkerScheduler&&this._flushPendingHandleCommandStartTask(),this._onCursorMoveListener.clear(),this._evaluateCommandMarkers(),this._capability.currentCommand.commandExecutedX=this._terminal.buffer.active.cursorX,this._hooks.onCommandExecutedEmitter.fire(this._capability.currentCommand),this._logService.debug("CommandDetectionCapability#handleCommandExecuted",this._capability.currentCommand.commandExecutedX,this._capability.currentCommand.commandExecutedMarker?.line)}preHandleCommandFinished(){this._capability.currentCommand.commandExecutedMarker||(this._hooks.commandMarkers.length===0&&(this._capability.currentCommand.commandStartMarker||(this._capability.currentCommand.commandStartMarker=this._terminal.registerMarker(0)),this._capability.currentCommand.commandStartMarker&&this._hooks.commandMarkers.push(this._capability.currentCommand.commandStartMarker)),this._evaluateCommandMarkers())}postHandleCommandFinished(){const e=this._capability.currentCommand,t=e.command,r=e.commandStartMarker?.line,i=e.commandExecutedMarker?.line;if(!t||t.length===0||r===void 0||r===-1||i===void 0||i===-1)return;let n=0,a=!1;for(let c=r;c<=i;c++){const s=this._terminal.buffer.active.getLine(c);if(!s)break;const m=s.translateToString(!0);for(let l=0;l<m.length;l++){for(;t.length<n&&t[n]===" ";)n++;if(m[l]===t[n]&&n++,n===t.length){const u=l>=this._terminal.cols-1;e.commandExecutedMarker=this._terminal.registerMarker(c-(this._terminal.buffer.active.baseY+this._terminal.buffer.active.cursorY)+(u?1:0)),e.commandExecutedX=u?0:l+1,a=!0;break}}if(a)break}}_evaluateCommandMarkers(){if(this._hooks.commandMarkers.length!==0){if(this._hooks.commandMarkers=this._hooks.commandMarkers.sort((e,t)=>e.line-t.line),this._capability.currentCommand.commandStartMarker=this._hooks.commandMarkers[0],this._capability.currentCommand.commandStartMarker){const e=this._terminal.buffer.active.getLine(this._capability.currentCommand.commandStartMarker.line);e&&(this._capability.currentCommand.commandStartLineContent=e.translateToString(!0))}this._capability.currentCommand.commandExecutedMarker=this._hooks.commandMarkers[this._hooks.commandMarkers.length-1],this._hooks.onCommandExecutedEmitter.fire(this._capability.currentCommand)}}_cursorOnNextLine(){const e=this._capability.commands.at(-1);if(!e)return!0;const t=this._terminal.buffer.active.baseY+this._terminal.buffer.active.cursorY,r=(e.endMarker?e.endMarker.line:e.marker?.line)??-1;return t>r}_waitForCursorMove(){const e=this._terminal.buffer.active.cursorX,t=this._terminal.buffer.active.cursorY;let r=0;return new Promise((i,n)=>{const a=setInterval(()=>{if(e!==this._terminal.buffer.active.cursorX||t!==this._terminal.buffer.active.cursorY){i(),clearInterval(a);return}r+=10,r>1e3&&(clearInterval(a),i())},10)})}_getWindowsPrompt(e=this._terminal.buffer.active.baseY+this._terminal.buffer.active.cursorY){const t=this._terminal.buffer.active.getLine(e);if(!t)return;const r=t.translateToString(!0);if(!r)return;const i=r.match(/(?<prompt>(\(.+\)\s)?(?:PS.+>\s?))/)?.groups?.prompt;if(i){const m=this._adjustPrompt(i,r,">");if(m)return{prompt:m,likelySingleLine:!0}}const n=r.match(/.*\u276f(?=[^\u276f]*$)/g)?.[0];if(n){const m=this._adjustPrompt(n,r,"\u276F");if(m)return m}const a=r.match(/^(?<prompt>\$)/)?.groups?.prompt;if(a){const m=this._adjustPrompt(a,r,"$");if(m)return m}const c=r.match(/^(?<prompt>>>> )/g)?.groups?.prompt;if(c)return{prompt:c,likelySingleLine:!0};if(this._capability.promptTerminator&&r.trim().endsWith(this._capability.promptTerminator)){const m=this._adjustPrompt(r,r,this._capability.promptTerminator);if(m)return m}const s=r.match(/^(?<prompt>(\(.+\)\s)?(?:[A-Z]:\\.*>))/);return s?.groups?.prompt?{prompt:s.groups.prompt,likelySingleLine:!0}:void 0}_adjustPrompt(e,t,r){if(e)return t===e&&e.endsWith(r)&&(e+=" "),e}};h=f([k(3,M)],h);function tt(o,d,e,t){if(!t)return;const r=d.executedMarker,i=d.endMarker;if(!r||!i)return;const n=r.line,a=i.line,c=t.length,s=[];if(t.anchor==="bottom")for(let m=a-(t.offset||0);m>=n;m--){let l=m;const u=m;for(;l>=n&&o.getLine(l)?.isWrapped;)l--;m=l,s.unshift(I(o,l,u,e)),s.length>c&&s.pop()}else for(let m=n+(t.offset||0);m<a;m++){const l=m;let u=m;for(;u+1<a&&o.getLine(u+1)?.isWrapped;)u++;m=u,s.push(I(o,l,u,e)),s.length===c&&s.shift()}return s}function I(o,d,e,t){const r=Math.max(2048/t*2);e=Math.min(e,d+r);let i="";for(let n=d;n<=e;n++){const a=o.getLine(n);a&&(i+=a.translateToString(!0,0,t))}return i}function p(o,d,e=0){return o.registerMarker(d.line-(o.buffer.active.baseY+o.buffer.active.cursorY)+e)}export{_ as CommandDetectionCapability,tt as getLinesForCommand};
