var b=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var g=(s,c,e,r)=>{for(var t=r>1?void 0:r?T(c,e):c,i=s.length-1,o;i>=0;i--)(o=s[i])&&(t=(r?o(c,e,t):o(t))||t);return r&&t&&b(c,e,t),t},k=(s,c)=>(e,r)=>c(e,r,s);import{getWindow as v}from"../../../../../../vs/base/browser/dom.js";import{coalesce as S}from"../../../../../../vs/base/common/arrays.js";import{timeout as I}from"../../../../../../vs/base/common/async.js";import{Disposable as D,DisposableStore as B,dispose as C,MutableDisposable as L}from"../../../../../../vs/base/common/lifecycle.js";import{IConfigurationService as w}from"../../../../../../vs/platform/configuration/common/configuration.js";import{TerminalCapability as f}from"../../../../../../vs/platform/terminal/common/capabilities/capabilities.js";import"../../../../../../vs/platform/terminal/common/capabilities/commandDetection/terminalCommand.js";import{IThemeService as y}from"../../../../../../vs/platform/theme/common/themeService.js";import"../../../../../../vs/workbench/contrib/terminal/browser/terminal.js";import{TERMINAL_OVERVIEW_RULER_CURSOR_FOREGROUND_COLOR as P}from"../../../../../../vs/workbench/contrib/terminal/common/terminalColorRegistry.js";import{TerminalStickyScrollSettingId as R}from"../../../../../../vs/workbench/contrib/terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js";var O=(e=>(e[e.Top=0]="Top",e[e.Bottom=1]="Bottom",e))(O||{}),Y=(e=>(e[e.Top=0]="Top",e[e.Middle=1]="Middle",e))(Y||{});let m=class extends D{constructor(e,r,t){super();this._capabilities=e;this._configurationService=r;this._themeService=t}_currentMarker=1;_selectionStart=null;_isDisposable=!1;_terminal;_navigationDecorations;_activeCommandGuide;_commandGuideDecorations=this._register(new L);activate(e){this._terminal=e,this._register(this._terminal.onData(()=>{this._currentMarker=1}))}_getMarkers(e){const r=this._capabilities.get(f.CommandDetection),t=this._capabilities.get(f.PartialCommandDetection),i=this._capabilities.get(f.BufferMarkDetection);let o=[];if(r?(o=S(r.commands.filter(n=>e?n.exitCode!==void 0:!0).map(n=>n.promptStartMarker??n.marker)),r.currentCommand?.promptStartMarker&&r.currentCommand.commandExecutedMarker&&o.push(r.currentCommand?.promptStartMarker)):t&&o.push(...t.commands),i&&!e){let n=i.markers().next()?.value;const a=[];for(;n;)a.push(n),n=i.markers().next()?.value;o=a}return o}_findCommand(e){const r=this._capabilities.get(f.CommandDetection);if(r){const t=r.commands.find(i=>i.marker?.line===e.line||i.promptStartMarker?.line===e.line);if(t)return t;if(r.currentCommand)return r.currentCommand}}clear(){this._currentMarker=1,this._resetNavigationDecorations(),this._selectionStart=null}_resetNavigationDecorations(){this._navigationDecorations&&C(this._navigationDecorations),this._navigationDecorations=[]}_isEmptyCommand(e){return e===1?!0:e===0?!this._getMarkers(!0).map(r=>r.line).includes(0):!this._getMarkers(!0).includes(e)}scrollToPreviousMark(e=1,r=!1,t=!0){if(!this._terminal)return;r||(this._selectionStart=null);let i;const o=typeof this._currentMarker=="object"?this.getTargetScrollLine(this._currentMarker.line,e):Math.min(_(this._terminal,this._currentMarker),this._terminal.buffer.active.baseY),n=this._terminal.buffer.active.viewportY;if(typeof this._currentMarker=="object"?!this._isMarkerInViewport(this._terminal,this._currentMarker):o!==n){const a=this._getMarkers(t).filter(l=>l.line>=n).length;i=this._getMarkers(t).length-a-1}else this._currentMarker===1?i=this._getMarkers(t).length-1:this._currentMarker===0?i=-1:this._isDisposable?(i=this._findPreviousMarker(t),this._currentMarker.dispose(),this._isDisposable=!1):t&&this._isEmptyCommand(this._currentMarker)?i=this._findPreviousMarker(!0):i=this._getMarkers(t).indexOf(this._currentMarker)-1;if(i<0){this._currentMarker=0,this._terminal.scrollToTop(),this._resetNavigationDecorations();return}this._currentMarker=this._getMarkers(t)[i],this._scrollToCommand(this._currentMarker,e)}scrollToNextMark(e=1,r=!1,t=!0){if(!this._terminal)return;r||(this._selectionStart=null);let i;const o=typeof this._currentMarker=="object"?this.getTargetScrollLine(this._currentMarker.line,e):Math.min(_(this._terminal,this._currentMarker),this._terminal.buffer.active.baseY),n=this._terminal.buffer.active.viewportY;if((typeof this._currentMarker=="object"?!this._isMarkerInViewport(this._terminal,this._currentMarker):o!==n)?i=this._getMarkers(t).filter(l=>l.line<=n).length:this._currentMarker===1?i=this._getMarkers(t).length:this._currentMarker===0?i=0:this._isDisposable?(i=this._findNextMarker(t),this._currentMarker.dispose(),this._isDisposable=!1):t&&this._isEmptyCommand(this._currentMarker)?i=this._findNextMarker(!0):i=this._getMarkers(t).indexOf(this._currentMarker)+1,i>=this._getMarkers(t).length){this._currentMarker=1,this._terminal.scrollToBottom(),this._resetNavigationDecorations();return}this._currentMarker=this._getMarkers(t)[i],this._scrollToCommand(this._currentMarker,e)}_scrollToCommand(e,r){const t=this._findCommand(e);t?this.revealCommand(t,r):this._scrollToMarker(e,r)}_scrollToMarker(e,r,t,i){if(this._terminal){if(!this._isMarkerInViewport(this._terminal,e)||i?.forceScroll){const o=this.getTargetScrollLine(h(e),r);this._terminal.scrollToLine(o)}i?.hideDecoration||(i?.bufferRange?this._highlightBufferRange(i.bufferRange):this.registerTemporaryDecoration(e,t,!0))}}_createMarkerForOffset(e,r){if(r===0&&p(e))return e;{const t=this._terminal?.registerMarker(-this._terminal.buffer.active.cursorY+h(e)-this._terminal.buffer.active.baseY+r);if(t)return t;throw new Error(`Could not register marker with offset ${h(e)}, ${r}`)}}revealCommand(e,r=1){const t="getOutput"in e?e.marker:e.commandStartMarker;if(!this._terminal||!t)return;const i=h(t),o=e.getPromptRowCount(),n=e.getCommandRowCount();this._scrollToMarker(i-(o-1),r,i+(n-1))}revealRange(e){this._scrollToMarker(e.start.y-1,1,e.end.y-1,{bufferRange:e,forceScroll:!!this._configurationService.getValue(R.Enabled)})}showCommandGuide(e){if(this._terminal){if(!e){this._commandGuideDecorations.clear(),this._activeCommandGuide=void 0;return}if(this._activeCommandGuide!==e&&e.marker){this._activeCommandGuide=e;const r=this._commandGuideDecorations.value=new B;if(!e.executedMarker||!e.endMarker)return;const t=e.marker.line-(e.getPromptRowCount()-1),i=h(e.endMarker)-t;if(i>200)return;for(let o=0;o<i;o++){const n=this._terminal.registerDecoration({marker:this._createMarkerForOffset(t,o)});if(n){r.add(n);let a;r.add(n.onRender(l=>{a||(a=l,l.classList.add("terminal-command-guide"),o===0&&l.classList.add("top"),o===i-1&&l.classList.add("bottom")),this._terminal?.element&&(l.style.marginLeft=`-${v(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`)}))}}}}}_scrollState;saveScrollState(){this._scrollState={viewportY:this._terminal?.buffer.active.viewportY??0}}restoreScrollState(){this._scrollState&&this._terminal&&(this._terminal.scrollToLine(this._scrollState.viewportY),this._scrollState=void 0)}_highlightBufferRange(e){if(!this._terminal)return;this._resetNavigationDecorations();const r=e.start.y,t=e.end.y-e.start.y+1;for(let i=0;i<t;i++){const o=this._terminal.registerDecoration({marker:this._createMarkerForOffset(r-1,i),x:e.start.x-1,width:e.end.x-1-(e.start.x-1)+1,overviewRulerOptions:void 0});if(o){this._navigationDecorations?.push(o);let n;o.onRender(a=>{n||(n=a,a.classList.add("terminal-range-highlight"))}),o.onDispose(()=>{this._navigationDecorations=this._navigationDecorations?.filter(a=>a!==o)})}}}registerTemporaryDecoration(e,r,t){if(!this._terminal)return;this._resetNavigationDecorations();const i=this._themeService.getColorTheme().getColor(P),o=h(e),n=r?h(r)-o+1:1;for(let a=0;a<n;a++){const l=this._terminal.registerDecoration({marker:this._createMarkerForOffset(e,a),width:this._terminal.cols,overviewRulerOptions:a===0?{color:i?.toString()||"#a0a0a0cc"}:void 0});if(l){this._navigationDecorations?.push(l);let d;l.onRender(u=>{d?u.classList.add("terminal-scroll-highlight"):(d=u,u.classList.add("terminal-scroll-highlight"),t&&u.classList.add("terminal-scroll-highlight-outline"),a===0&&u.classList.add("top"),a===n-1&&u.classList.add("bottom")),this._terminal?.element&&(u.style.marginLeft=`-${v(this._terminal.element).getComputedStyle(this._terminal.element).paddingLeft}`)}),l.onDispose(()=>{this._navigationDecorations=this._navigationDecorations?.filter(u=>u!==l)}),t&&I(350).then(()=>{d&&d.classList.remove("terminal-scroll-highlight-outline")})}}}scrollToLine(e,r){this._terminal?.scrollToLine(this.getTargetScrollLine(e,r))}getTargetScrollLine(e,r){return this._terminal&&r===1?Math.max(e-Math.floor(this._terminal.rows/4),0):e}_isMarkerInViewport(e,r){const t=e.buffer.active.viewportY,i=h(r);return i>=t&&i<t+e.rows}scrollToClosestMarker(e,r,t){const i=this._capabilities.get(f.BufferMarkDetection);if(!i)return;const o=i.getMark(e);if(!o)return;const n=r?i.getMark(r):o;this._scrollToMarker(o,0,n,{hideDecoration:!t})}selectToPreviousMark(){this._terminal&&(this._selectionStart===null&&(this._selectionStart=this._currentMarker),this._capabilities.has(f.CommandDetection)?this.scrollToPreviousMark(1,!0,!0):this.scrollToPreviousMark(1,!0,!1),M(this._terminal,this._currentMarker,this._selectionStart))}selectToNextMark(){this._terminal&&(this._selectionStart===null&&(this._selectionStart=this._currentMarker),this._capabilities.has(f.CommandDetection)?this.scrollToNextMark(1,!0,!0):this.scrollToNextMark(1,!0,!1),M(this._terminal,this._currentMarker,this._selectionStart))}selectToPreviousLine(){this._terminal&&(this._selectionStart===null&&(this._selectionStart=this._currentMarker),this.scrollToPreviousLine(this._terminal,1,!0),M(this._terminal,this._currentMarker,this._selectionStart))}selectToNextLine(){this._terminal&&(this._selectionStart===null&&(this._selectionStart=this._currentMarker),this.scrollToNextLine(this._terminal,1,!0),M(this._terminal,this._currentMarker,this._selectionStart))}scrollToPreviousLine(e,r=1,t=!1){if(t||(this._selectionStart=null),this._currentMarker===0){e.scrollToTop();return}if(this._currentMarker===1)this._currentMarker=this._registerMarkerOrThrow(e,this._getOffset(e)-1);else{const i=this._getOffset(e);this._isDisposable&&this._currentMarker.dispose(),this._currentMarker=this._registerMarkerOrThrow(e,i-1)}this._isDisposable=!0,this._scrollToMarker(this._currentMarker,r)}scrollToNextLine(e,r=1,t=!1){if(t||(this._selectionStart=null),this._currentMarker===1){e.scrollToBottom();return}if(this._currentMarker===0)this._currentMarker=this._registerMarkerOrThrow(e,this._getOffset(e)+1);else{const i=this._getOffset(e);this._isDisposable&&this._currentMarker.dispose(),this._currentMarker=this._registerMarkerOrThrow(e,i+1)}this._isDisposable=!0,this._scrollToMarker(this._currentMarker,r)}_registerMarkerOrThrow(e,r){const t=e.registerMarker(r);if(!t)throw new Error(`Could not create marker for ${r}`);return t}_getOffset(e){if(this._currentMarker===1)return 0;if(this._currentMarker===0)return 0-(e.buffer.active.baseY+e.buffer.active.cursorY);{let r=_(e,this._currentMarker);return r-=e.buffer.active.baseY+e.buffer.active.cursorY,r}}_findPreviousMarker(e=!1){if(this._currentMarker===0)return 0;if(this._currentMarker===1)return this._getMarkers(e).length-1;let r;for(r=this._getMarkers(e).length-1;r>=0;r--)if(this._getMarkers(e)[r].line<this._currentMarker.line)return r;return-1}_findNextMarker(e=!1){if(this._currentMarker===0)return 0;if(this._currentMarker===1)return this._getMarkers(e).length-1;let r;for(r=0;r<this._getMarkers(e).length;r++)if(this._getMarkers(e)[r].line>this._currentMarker.line)return r;return this._getMarkers(e).length}};m=g([k(1,w),k(2,y)],m);function _(s,c){return c===1?s.buffer.active.baseY+s.rows-1:c===0?0:c.line}function M(s,c,e){e===null&&(e=1);let r=_(s,c),t=_(s,e);if(r>t){const i=r;r=t,t=i}t-=1,s.selectLines(r,t)}function p(s){return typeof s!="number"}function h(s){return p(s)?s.line:s}export{m as MarkNavigationAddon,Y as ScrollPosition,_ as getLine,M as selectLines};
