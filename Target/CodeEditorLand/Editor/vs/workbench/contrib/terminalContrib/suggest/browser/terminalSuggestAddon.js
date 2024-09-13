var R=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var y=(r,o,e,s)=>{for(var i=s>1?void 0:s?q(o,e):o,t=r.length-1,n;t>=0;t--)(n=r[t])&&(i=(s?n(o,e,i):n(i))||i);return s&&i&&R(o,e,i),i},C=(r,o)=>(e,s)=>o(e,s,r);import*as v from"../../../../../base/browser/dom.js";import{Codicon as a}from"../../../../../base/common/codicons.js";import{Emitter as x,Event as D}from"../../../../../base/common/event.js";import{Disposable as B,MutableDisposable as F,combinedDisposable as A}from"../../../../../base/common/lifecycle.js";import{sep as T}from"../../../../../base/common/path.js";import{commonPrefixLength as E}from"../../../../../base/common/strings.js";import{editorSuggestWidgetSelectedBackground as k}from"../../../../../editor/contrib/suggest/browser/suggestWidget.js";import{IConfigurationService as O}from"../../../../../platform/configuration/common/configuration.js";import{IInstantiationService as N}from"../../../../../platform/instantiation/common/instantiation.js";import{IStorageService as K,StorageScope as P,StorageTarget as V}from"../../../../../platform/storage/common/storage.js";import{TerminalCapability as $}from"../../../../../platform/terminal/common/capabilities/capabilities.js";import{ShellIntegrationOscPs as H}from"../../../../../platform/terminal/common/xterm/shellIntegrationAddon.js";import{getListStyles as j}from"../../../../../platform/theme/browser/defaultStyles.js";import{activeContrastBorder as G}from"../../../../../platform/theme/common/colorRegistry.js";import{SimpleCompletionItem as b}from"../../../../services/suggest/browser/simpleCompletionItem.js";import{LineContext as w,SimpleCompletionModel as M}from"../../../../services/suggest/browser/simpleCompletionModel.js";import{SimpleSuggestWidget as z}from"../../../../services/suggest/browser/simpleSuggestWidget.js";import{ITerminalConfigurationService as U}from"../../../terminal/browser/terminal.js";import{TerminalStorageKeys as X}from"../../../terminal/common/terminalStorageKeys.js";import{terminalSuggestConfigSection as W}from"../common/terminalSuggestConfiguration.js";var J=(i=>(i.Completions="Completions",i.CompletionsPwshCommands="CompletionsPwshCommands",i.CompletionsBash="CompletionsBash",i.CompletionsBashFirstWord="CompletionsBashFirstWord",i))(J||{});const Y={0:a.symbolText,1:a.history,2:a.symbolMethod,3:a.symbolFile,4:a.folder,5:a.symbolProperty,6:a.symbolMethod,7:a.symbolVariable,8:a.symbolValue,9:a.symbolVariable,10:a.symbolNamespace,11:a.symbolInterface,12:a.symbolKeyword,13:a.symbolKeyword};let _=class extends B{constructor(e,s,i,t,n,p){super();this._cachedPwshCommands=e;this._capabilities=s;this._terminalSuggestWidgetVisibleContextKey=i;this._configurationService=t;this._instantiationService=n;this._terminalConfigurationService=p;this._register(D.runAndSubscribe(D.any(this._capabilities.onDidAddCapabilityType,this._capabilities.onDidRemoveCapabilityType),()=>{const l=this._capabilities.get($.CommandDetection);l?this._promptInputModel!==l.promptInputModel&&(this._promptInputModel=l.promptInputModel,this._promptInputModelSubscriptions.value=A(this._promptInputModel.onDidChangeInput(m=>this._sync(m)),this._promptInputModel.onDidFinishInput(()=>this.hideSuggestWidget()))):this._promptInputModel=void 0}))}_terminal;_promptInputModel;_promptInputModelSubscriptions=this._register(new F);_mostRecentPromptInputState;_currentPromptInputState;_model;_container;_screen;_suggestWidget;_enableWidget=!0;_pathSeparator=T;_isFilteringDirectories=!1;_mostRecentCompletion;_codeCompletionsRequested=!1;_gitCompletionsRequested=!1;_leadingLineContent;_cursorIndexDelta=0;_lastUserDataTimestamp=0;_lastAcceptedCompletionTimestamp=0;_lastUserData;isPasting=!1;static requestCompletionsSequence="\x1B[24~e";static requestGlobalCompletionsSequence="\x1B[24~f";static requestEnableGitCompletionsSequence="\x1B[24~g";static requestEnableCodeCompletionsSequence="\x1B[24~h";_onBell=this._register(new x);onBell=this._onBell.event;_onAcceptedCompletion=this._register(new x);onAcceptedCompletion=this._onAcceptedCompletion.event;_onDidRequestCompletions=this._register(new x);onDidRequestCompletions=this._onDidRequestCompletions.event;_onDidReceiveCompletions=this._register(new x);onDidReceiveCompletions=this._onDidReceiveCompletions.event;activate(e){this._terminal=e,this._register(e.parser.registerOscHandler(H.VSCode,s=>this._handleVSCodeSequence(s))),this._register(e.onData(s=>{this._lastUserData=s,this._lastUserDataTimestamp=Date.now()}))}setContainerWithOverflow(e){this._container=e}setScreen(e){this._screen=e}_requestCompletions(){if(!this._promptInputModel||this.isPasting)return;const e=this._configurationService.getValue(W).builtinCompletions;!this._codeCompletionsRequested&&e.pwshCode&&(this._onAcceptedCompletion.fire(_.requestEnableCodeCompletionsSequence),this._codeCompletionsRequested=!0),!this._gitCompletionsRequested&&e.pwshGit&&(this._onAcceptedCompletion.fire(_.requestEnableGitCompletionsSequence),this._gitCompletionsRequested=!0),this._cachedPwshCommands.size===0&&this._requestGlobalCompletions(),this._lastUserDataTimestamp>this._lastAcceptedCompletionTimestamp&&(this._onAcceptedCompletion.fire(_.requestCompletionsSequence),this._onDidRequestCompletions.fire())}_requestGlobalCompletions(){this._onAcceptedCompletion.fire(_.requestGlobalCompletionsSequence)}_sync(e){const s=this._configurationService.getValue(W);if(!this._mostRecentPromptInputState||e.cursorIndex>this._mostRecentPromptInputState.cursorIndex){let n=!1;if(this._terminalSuggestWidgetVisibleContextKey.get()||s.quickSuggestions&&(e.cursorIndex===1||e.prefix.match(/([\s[])[^\s]$/))&&(this._lastUserData?.match(/^\x1b[[O]?[A-D]$/)||(this._requestCompletions(),n=!0)),s.suggestOnTriggerCharacters&&!n){const p=e.prefix;(p?.match(/\s[-]$/)||this._isFilteringDirectories&&p?.match(/[\\/]$/))&&(this._requestCompletions(),n=!0)}}if(this._mostRecentPromptInputState=e,!this._promptInputModel||!this._terminal||!this._suggestWidget||this._leadingLineContent===void 0)return;if(this._currentPromptInputState=e,this._currentPromptInputState.cursorIndex>1&&this._currentPromptInputState.value.at(this._currentPromptInputState.cursorIndex-1)===" "){this.hideSuggestWidget();return}if(this._currentPromptInputState.cursorIndex<this._replacementIndex+this._replacementLength){this.hideSuggestWidget();return}if(this._terminalSuggestWidgetVisibleContextKey.get()){this._cursorIndexDelta=this._currentPromptInputState.cursorIndex-(this._replacementIndex+this._replacementLength);let n=this._currentPromptInputState.value.substring(this._replacementIndex,this._replacementIndex+this._replacementLength+this._cursorIndexDelta);this._isFilteringDirectories&&(n=L(n,this._pathSeparator));const p=new w(n,this._cursorIndexDelta);this._suggestWidget.setLineContext(p)}if(!this._suggestWidget.hasCompletions()){this.hideSuggestWidget();return}const i=this._getTerminalDimensions();if(!i.width||!i.height)return;const t=this._screen.getBoundingClientRect();this._suggestWidget.showSuggestions(0,!1,!1,{left:t.left+this._terminal.buffer.active.cursorX*i.width,top:t.top+this._terminal.buffer.active.cursorY*i.height,height:i.height})}_handleVSCodeSequence(e){if(!this._terminal)return!1;const[s,...i]=e.split(";");switch(s){case"Completions":return this._handleCompletionsSequence(this._terminal,e,s,i),!0;case"CompletionsBash":return this._handleCompletionsBashSequence(this._terminal,e,s,i),!0;case"CompletionsBashFirstWord":return this._handleCompletionsBashFirstWordSequence(this._terminal,e,s,i)}return!1}_replacementIndex=0;_replacementLength=0;_handleCompletionsSequence(e,s,i,t){if(this._onDidReceiveCompletions.fire(),!e.element||!this._enableWidget||!this._promptInputModel||!v.isAncestorOfActiveElement(e.element))return;let n=0,p=this._promptInputModel.cursorIndex;this._currentPromptInputState={value:this._promptInputModel.value,prefix:this._promptInputModel.prefix,suffix:this._promptInputModel.suffix,cursorIndex:this._promptInputModel.cursorIndex,ghostTextIndex:this._promptInputModel.ghostTextIndex},this._leadingLineContent=this._currentPromptInputState.prefix.substring(n,n+p+this._cursorIndexDelta);const l=s.slice(i.length+t[0].length+t[1].length+t[2].length+4),m=t.length===0||l.length===0?void 0:JSON.parse(l),c=Q(m),h=this._leadingLineContent.length===0?"":this._leadingLineContent[0];this._leadingLineContent.includes(" ")||h==="["?(n=Number.parseInt(t[0]),p=Number.parseInt(t[1]),this._leadingLineContent=this._promptInputModel.prefix):c.push(...this._cachedPwshCommands),this._replacementIndex=n,this._replacementLength=p,this._mostRecentCompletion?.isDirectory&&c.every(d=>d.completion.isDirectory)&&c.push(new b(this._mostRecentCompletion)),this._mostRecentCompletion=void 0,this._cursorIndexDelta=this._currentPromptInputState.cursorIndex-(n+p);let f=this._leadingLineContent;if(this._isFilteringDirectories=c.some(d=>d.completion.isDirectory),this._isFilteringDirectories){const d=c.find(I=>I.completion.isDirectory);this._pathSeparator=d?.completion.label.match(/(?<sep>[\\/])/)?.groups?.sep??T,f=L(f,this._pathSeparator)}const g=new w(f,this._cursorIndexDelta),u=new M(c,g,n,p);this._handleCompletionModel(u)}_cachedBashAliases=new Set;_cachedBashBuiltins=new Set;_cachedBashCommands=new Set;_cachedBashKeywords=new Set;_cachedFirstWord;_handleCompletionsBashFirstWordSequence(e,s,i,t){const n=t[0],p=s.slice(i.length+n.length+2).split(";");let l;switch(n){case"alias":l=this._cachedBashAliases;break;case"builtin":l=this._cachedBashBuiltins;break;case"command":l=this._cachedBashCommands;break;case"keyword":l=this._cachedBashKeywords;break;default:return!1}l.clear();const m=new Set;for(const c of p)m.add(c);for(const c of m)l.add(new b({label:c,icon:a.symbolString,detail:n}));return this._cachedFirstWord=void 0,!0}_handleCompletionsBashSequence(e,s,i,t){if(!e.element)return;let n=Number.parseInt(t[0]);const p=Number.parseInt(t[1]);if(!t[2]){this._onBell.fire();return}const l=s.slice(i.length+t[0].length+t[1].length+t[2].length+4).split(";");let m;if(n!==100&&l.length>0?m=l.map(h=>new b({label:h,icon:a.symbolProperty})):(n=0,this._cachedFirstWord||(this._cachedFirstWord=[...this._cachedBashAliases,...this._cachedBashBuiltins,...this._cachedBashCommands,...this._cachedBashKeywords],this._cachedFirstWord.sort((h,f)=>{const g=h.completion.label.charCodeAt(0),u=f.completion.label.charCodeAt(0),d=g<65||g>90&&g<97||g>122?1:0,I=u<65||u>90&&u<97||u>122?1:0;return d!==I?d-I:h.completion.label.localeCompare(f.completion.label)})),m=this._cachedFirstWord),m.length===0)return;this._leadingLineContent=m[0].completion.label.slice(0,p);const c=new M(m,new w(this._leadingLineContent,n),n,p);if(m.length===1&&m[0].completion.label.substring(p).length===0){this._onBell.fire();return}this._handleCompletionModel(c)}_getTerminalDimensions(){const e=this._terminal._core._renderService.dimensions.css.cell;return{width:e.width,height:e.height}}_handleCompletionModel(e){if(!this._terminal?.element)return;const s=this._ensureSuggestWidget(this._terminal);if(s.setCompletionModel(e),e.items.length===0||!this._promptInputModel)return;this._model=e;const i=this._getTerminalDimensions();if(!i.width||!i.height)return;const t=this._screen.getBoundingClientRect();s.showSuggestions(0,!1,!1,{left:t.left+this._terminal.buffer.active.cursorX*i.width,top:t.top+this._terminal.buffer.active.cursorY*i.height,height:i.height})}_ensureSuggestWidget(e){if(this._terminalSuggestWidgetVisibleContextKey.set(!0),!this._suggestWidget){const s=this._terminalConfigurationService.config,i=this._terminalConfigurationService.getFont(v.getActiveWindow()),t={fontFamily:i.fontFamily,fontSize:i.fontSize,lineHeight:Math.ceil(1.5*i.fontSize),fontWeight:s.fontWeight.toString(),letterSpacing:i.letterSpacing};this._suggestWidget=this._register(this._instantiationService.createInstance(z,this._container,this._instantiationService.createInstance(S),()=>t,{})),this._suggestWidget.list.style(j({listInactiveFocusBackground:k,listInactiveFocusOutline:G})),this._register(this._suggestWidget.onDidSelect(async n=>this.acceptSelectedSuggestion(n))),this._register(this._suggestWidget.onDidHide(()=>this._terminalSuggestWidgetVisibleContextKey.set(!1))),this._register(this._suggestWidget.onDidShow(()=>this._terminalSuggestWidgetVisibleContextKey.set(!0)))}return this._suggestWidget}selectPreviousSuggestion(){this._suggestWidget?.selectPrevious()}selectPreviousPageSuggestion(){this._suggestWidget?.selectPreviousPage()}selectNextSuggestion(){this._suggestWidget?.selectNext()}selectNextPageSuggestion(){this._suggestWidget?.selectNextPage()}acceptSelectedSuggestion(e,s){e||(e=this._suggestWidget?.getFocusedItem());const i=this._mostRecentPromptInputState;if(!e||!i||!this._leadingLineContent||!this._model)return;this._lastAcceptedCompletionTimestamp=Date.now(),this._suggestWidget?.hide();const t=this._currentPromptInputState??i,n=t.value.substring(this._model.replacementIndex,t.cursorIndex);let p="";if((t.ghostTextIndex===-1||t.ghostTextIndex>t.cursorIndex)&&t.value.length>t.cursorIndex+1&&t.value.at(t.cursorIndex)!==" "){const d=t.value.substring(t.cursorIndex,t.ghostTextIndex===-1?void 0:t.ghostTextIndex).indexOf(" ");p=t.value.substring(t.cursorIndex,d===-1?void 0:t.cursorIndex+d)}const l=e.item.completion,m=l.label;let c=!1;if(s)switch(this._configurationService.getValue(W).runOnEnter){case"always":{c=!0;break}case"exactMatch":{c=n.toLowerCase()===m.toLowerCase();break}case"exactMatchIgnoreExtension":{c=n.toLowerCase()===m.toLowerCase(),l.isFile&&(c||=n.toLowerCase()===m.toLowerCase().replace(/\.[^.]+$/,""));break}}l.icon===a.folder&&(this._lastAcceptedCompletionTimestamp=0),this._mostRecentCompletion=l;const h=E(n,l.label),f=n.substring(n.length-1-h,n.length-1),g=l.label.substring(h);let u;t.suffix.length>0&&t.prefix.endsWith(f)&&t.suffix.startsWith(g)?u="\x1BOC".repeat(l.label.length-h):u=["\x7F".repeat(n.length-h),"\x1B[3~".repeat(p.length),g,c?"\r":""].join(""),this._onAcceptedCompletion.fire(u),this.hideSuggestWidget()}hideSuggestWidget(){this._currentPromptInputState=void 0,this._leadingLineContent=void 0,this._suggestWidget?.hide()}};_=y([C(3,O),C(4,N),C(5,U)],_);let S=class{constructor(o){this._storageService=o}_key=X.TerminalSuggestSize;restore(){const o=this._storageService.get(this._key,P.PROFILE)??"";try{const e=JSON.parse(o);if(v.Dimension.is(e))return v.Dimension.lift(e)}catch{}}store(o){this._storageService.store(this._key,JSON.stringify(o),P.PROFILE,V.MACHINE)}reset(){this._storageService.remove(this._key,P.PROFILE)}};S=y([C(0,K)],S);function Q(r){if(!r)return[];let o;if(Array.isArray(r)){if(r.length===0)return[];typeof r[0]=="string"?o=[r].map(e=>({CompletionText:e[0],ResultType:e[1],ToolTip:e[2],CustomIcon:e[3]})):Array.isArray(r[0])?o=r.map(e=>({CompletionText:e[0],ResultType:e[1],ToolTip:e[2],CustomIcon:e[3]})):o=r}else o=[r];return o.map(e=>Z(e))}function Z(r){let o=r.CompletionText;if(r.ResultType===4&&!o.match(/^[-+]$/)&&!o.match(/^\.\.?$/)&&!o.match(/[\\/]$/)){const t=o.match(/(?<sep>[\\/])/)?.groups?.sep??T;o=o+t}const e=r.ToolTip??o,s=ee(r.ResultType,r.CustomIcon);return r.ResultType===2&&r.CompletionText.match(/\.[a-z0-9]{2,4}$/i)&&(r.ResultType=3),new b({label:o,icon:s,detail:e,isFile:r.ResultType===3,isDirectory:r.ResultType===4,isKeyword:r.ResultType===12})}function ee(r,o){if(o){const e=o in a?a[o]:a.symbolText;if(e)return e}return Y[r]??a.symbolText}function L(r,o){return o==="/"?r.replaceAll("\\","/"):r.replaceAll("/","\\")}export{_ as SuggestAddon,J as VSCodeSuggestOscPt,Q as parseCompletionsFromShell};
