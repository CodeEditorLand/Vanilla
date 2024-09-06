var Oe=Object.defineProperty;var Re=Object.getOwnPropertyDescriptor;var x=(s,i,e,t)=>{for(var n=t>1?void 0:t?Re(i,e):i,o=s.length-1,r;o>=0;o--)(r=s[o])&&(n=(t?r(i,e,n):r(n))||n);return t&&n&&Oe(i,e,n),n},h=(s,i)=>(e,t)=>i(e,t,s);import"./media/editorstatus.css";import{getWindowById as Te,runAtThisOrScheduleAtNextAnimationFrame as _e}from"../../../../base/browser/dom.js";import{Action as xe}from"../../../../base/common/actions.js";import{Promises as Be,timeout as Ue}from"../../../../base/common/async.js";import{Emitter as Ne,Event as U}from"../../../../base/common/event.js";import{KeyChord as We,KeyCode as pe,KeyMod as He}from"../../../../base/common/keyCodes.js";import{Disposable as q,DisposableStore as he,MutableDisposable as L}from"../../../../base/common/lifecycle.js";import{Schemas as N}from"../../../../base/common/network.js";import{deepClone as Ge}from"../../../../base/common/objects.js";import{Language as me}from"../../../../base/common/platform.js";import{basename as fe,extname as Se,isEqual as Ee}from"../../../../base/common/resources.js";import{compare as Qe,format as K,splitLines as Ve}from"../../../../base/common/strings.js";import{areFunctions as ze,assertIsDefined as O}from"../../../../base/common/types.js";import{URI as qe}from"../../../../base/common/uri.js";import{TabFocus as ie}from"../../../../editor/browser/config/tabFocus.js";import{getCodeEditor as C}from"../../../../editor/browser/editorBrowser.js";import"../../../../editor/browser/editorExtensions.js";import{EditorOption as oe}from"../../../../editor/common/config/editorOptions.js";import{Range as ae}from"../../../../editor/common/core/range.js";import{Selection as Ke}from"../../../../editor/common/core/selection.js";import"../../../../editor/common/editorCommon.js";import{ILanguageService as ve}from"../../../../editor/common/languages/language.js";import{EndOfLineSequence as Ie}from"../../../../editor/common/model.js";import{getIconClassesForLanguageId as be}from"../../../../editor/common/services/getIconClasses.js";import{ITextResourceConfigurationService as $e}from"../../../../editor/common/services/textResourceConfiguration.js";import{ChangeTabDisplaySize as je,DetectIndentation as Ye,IndentationToSpacesAction as Je,IndentationToTabsAction as Xe,IndentUsingSpaces as Ze,IndentUsingTabs as et}from"../../../../editor/contrib/indentation/browser/indentation.js";import{TrimTrailingWhitespaceAction as tt}from"../../../../editor/contrib/linesOperations/browser/linesOperations.js";import{localize as a,localize2 as re}from"../../../../nls.js";import{Action2 as se}from"../../../../platform/actions/common/actions.js";import{CommandsRegistry as nt,ICommandService as it}from"../../../../platform/commands/common/commands.js";import{ConfigurationTarget as ce,IConfigurationService as $}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as ot}from"../../../../platform/contextkey/common/contextkey.js";import{IExtensionGalleryService as at}from"../../../../platform/extensionManagement/common/extensionManagement.js";import{FILES_ASSOCIATIONS_CONFIG as ye,IFileService as rt}from"../../../../platform/files/common/files.js";import{IInstantiationService as Le}from"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as st}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{IMarkerData as Ce,IMarkerService as ct,MarkerSeverity as R}from"../../../../platform/markers/common/markers.js";import{IQuickInputService as j}from"../../../../platform/quickinput/common/quickInput.js";import{ITelemetryService as dt}from"../../../../platform/telemetry/common/telemetry.js";import"../../../common/contributions.js";import{EditorResourceAccessor as Y,SideBySideEditor as J}from"../../../common/editor.js";import"../../../common/editor/editorInput.js";import{SideBySideEditorInput as Me}from"../../../common/editor/sideBySideEditorInput.js";import{IEditorGroupsService as ut}from"../../../services/editor/common/editorGroupsService.js";import{IEditorService as X}from"../../../services/editor/common/editorService.js";import{AutomaticLanguageDetectionLikelyWrongId as lt,ILanguageDetectionService as gt}from"../../../services/languageDetection/common/languageDetectionWorkerService.js";import{IPreferencesService as pt}from"../../../services/preferences/common/preferences.js";import{IStatusbarService as ke,StatusbarAlignment as M}from"../../../services/statusbar/browser/statusbar.js";import{SUPPORTED_ENCODINGS as k}from"../../../services/textfile/common/encoding.js";import{EncodingMode as De,ITextFileService as de}from"../../../services/textfile/common/textfiles.js";import{UntitledTextEditorInput as ue}from"../../../services/untitled/common/untitledTextEditorInput.js";import{BinaryResourceDiffEditor as le}from"./binaryDiffEditor.js";import{BaseBinaryResourceEditor as Z}from"./binaryEditor.js";class ht{constructor(i,e){this.primary=i;this.secondary=e}getEncoding(){return this.primary.getEncoding()}async setEncoding(i,e){await Be.settled([this.primary,this.secondary].map(t=>t.setEncoding(i,e)))}}class mt{constructor(i,e){this.primary=i;this.secondary=e}setLanguageId(i,e){[this.primary,this.secondary].forEach(t=>t.setLanguageId(i,e))}}function W(s){if(s instanceof ue)return s;if(s instanceof Me){const e=W(s.primary),t=W(s.secondary);return e&&t?new ht(e,t):e}const i=s;return ze(i.setEncoding,i.getEncoding)?i:null}function ee(s){if(s instanceof ue)return s;if(s instanceof Me){const e=ee(s.primary),t=ee(s.secondary);return e&&t?new mt(e,t):e}const i=s;return typeof i.setLanguageId=="function"?i:null}class ft{indentation=!1;selectionStatus=!1;languageId=!1;languageStatus=!1;encoding=!1;EOL=!1;tabFocusMode=!1;columnSelectionMode=!1;metadata=!1;combine(i){this.indentation=this.indentation||i.indentation,this.selectionStatus=this.selectionStatus||i.selectionStatus,this.languageId=this.languageId||i.languageId,this.languageStatus=this.languageStatus||i.languageStatus,this.encoding=this.encoding||i.encoding,this.EOL=this.EOL||i.EOL,this.tabFocusMode=this.tabFocusMode||i.tabFocusMode,this.columnSelectionMode=this.columnSelectionMode||i.columnSelectionMode,this.metadata=this.metadata||i.metadata}hasChanges(){return this.indentation||this.selectionStatus||this.languageId||this.languageStatus||this.encoding||this.EOL||this.tabFocusMode||this.columnSelectionMode||this.metadata}}class St{_selectionStatus;get selectionStatus(){return this._selectionStatus}_languageId;get languageId(){return this._languageId}_encoding;get encoding(){return this._encoding}_EOL;get EOL(){return this._EOL}_indentation;get indentation(){return this._indentation}_tabFocusMode;get tabFocusMode(){return this._tabFocusMode}_columnSelectionMode;get columnSelectionMode(){return this._columnSelectionMode}_metadata;get metadata(){return this._metadata}update(i){const e=new ft;switch(i.type){case"selectionStatus":this._selectionStatus!==i.selectionStatus&&(this._selectionStatus=i.selectionStatus,e.selectionStatus=!0);break;case"indentation":this._indentation!==i.indentation&&(this._indentation=i.indentation,e.indentation=!0);break;case"languageId":this._languageId!==i.languageId&&(this._languageId=i.languageId,e.languageId=!0);break;case"encoding":this._encoding!==i.encoding&&(this._encoding=i.encoding,e.encoding=!0);break;case"EOL":this._EOL!==i.EOL&&(this._EOL=i.EOL,e.EOL=!0);break;case"tabFocusMode":this._tabFocusMode!==i.tabFocusMode&&(this._tabFocusMode=i.tabFocusMode,e.tabFocusMode=!0);break;case"columnSelectionMode":this._columnSelectionMode!==i.columnSelectionMode&&(this._columnSelectionMode=i.columnSelectionMode,e.columnSelectionMode=!0);break;case"metadata":this._metadata!==i.metadata&&(this._metadata=i.metadata,e.metadata=!0);break}return e}}let H=class extends q{constructor(e){super();this.configurationService=e;this.registerListeners();const t=e.getValue("editor.tabFocusMode")===!0;ie.setTabFocusMode(t)}_onDidChange=this._register(new Ne);onDidChange=this._onDidChange.event;registerListeners(){this._register(ie.onDidChangeTabFocus(e=>this._onDidChange.fire(e))),this._register(this.configurationService.onDidChangeConfiguration(e=>{if(e.affectsConfiguration("editor.tabFocusMode")){const t=this.configurationService.getValue("editor.tabFocusMode")===!0;ie.setTabFocusMode(t),this._onDidChange.fire(t)}}))}};H=x([h(0,$)],H);const Et=a("singleSelectionRange","Ln {0}, Col {1} ({2} selected)"),vt=a("singleSelection","Ln {0}, Col {1}"),It=a("multiSelectionRange","{0} selections ({1} characters selected)"),bt=a("multiSelection","{0} selections"),Fe=a("endOfLineLineFeed","LF"),we=a("endOfLineCarriageReturnLineFeed","CRLF");let G=class extends q{constructor(e,t,n,o,r,u,S,m){super();this.targetWindowId=e;this.editorService=t;this.quickInputService=n;this.languageService=o;this.textFileService=r;this.statusbarService=u;this.instantiationService=S;this.configurationService=m;this.registerCommands(),this.registerListeners()}tabFocusModeElement=this._register(new L);columnSelectionModeElement=this._register(new L);indentationElement=this._register(new L);selectionElement=this._register(new L);encodingElement=this._register(new L);eolElement=this._register(new L);languageElement=this._register(new L);metadataElement=this._register(new L);currentMarkerStatus=this._register(this.instantiationService.createInstance(Q));tabFocusMode=this._register(this.instantiationService.createInstance(H));state=new St;toRender=void 0;activeEditorListeners=this._register(new he);delayedRender=this._register(new L);registerListeners(){this._register(this.editorService.onDidActiveEditorChange(()=>this.updateStatusBar())),this._register(this.textFileService.untitled.onDidChangeEncoding(e=>this.onResourceEncodingChange(e.resource))),this._register(this.textFileService.files.onDidChangeEncoding(e=>this.onResourceEncodingChange(e.resource))),this._register(U.runAndSubscribe(this.tabFocusMode.onDidChange,e=>{e!==void 0?this.onTabFocusModeChange(e):this.onTabFocusModeChange(this.configurationService.getValue("editor.tabFocusMode"))}))}registerCommands(){this._register(nt.registerCommand({id:`changeEditorIndentation${this.targetWindowId}`,handler:()=>this.showIndentationPicker()}))}async showIndentationPicker(){const e=C(this.editorService.activeTextEditorControl);if(!e)return this.quickInputService.pick([{label:a("noEditor","No text editor active at this time")}]);if(this.editorService.activeEditor?.isReadonly())return this.quickInputService.pick([{label:a("noWritableCodeEditor","The active code editor is read-only.")}]);const t=[O(e.getAction(Ze.ID)),O(e.getAction(et.ID)),O(e.getAction(je.ID)),O(e.getAction(Ye.ID)),O(e.getAction(Je.ID)),O(e.getAction(Xe.ID)),O(e.getAction(tt.ID))].map(o=>({id:o.id,label:o.label,detail:me.isDefaultVariant()||o.label===o.alias?void 0:o.alias,run:()=>{e.focus(),o.run()}}));return t.splice(3,0,{type:"separator",label:a("indentConvert","convert file")}),t.unshift({type:"separator",label:a("indentView","change view")}),(await this.quickInputService.pick(t,{placeHolder:a("pickAction","Select Action"),matchOnDetail:!0}))?.run()}updateTabFocusModeElement(e){if(e){if(!this.tabFocusModeElement.value){const t=a("tabFocusModeEnabled","Tab Moves Focus");this.tabFocusModeElement.value=this.statusbarService.addEntry({name:a("status.editor.tabFocusMode","Accessibility Mode"),text:t,ariaLabel:t,tooltip:a("disableTabMode","Disable Accessibility Mode"),command:"editor.action.toggleTabFocusMode",kind:"prominent"},"status.editor.tabFocusMode",M.RIGHT,100.7)}}else this.tabFocusModeElement.clear()}updateColumnSelectionModeElement(e){if(e){if(!this.columnSelectionModeElement.value){const t=a("columnSelectionModeEnabled","Column Selection");this.columnSelectionModeElement.value=this.statusbarService.addEntry({name:a("status.editor.columnSelectionMode","Column Selection Mode"),text:t,ariaLabel:t,tooltip:a("disableColumnSelectionMode","Disable Column Selection Mode"),command:"editor.action.toggleColumnSelection",kind:"prominent"},"status.editor.columnSelectionMode",M.RIGHT,100.8)}}else this.columnSelectionModeElement.clear()}updateSelectionElement(e){if(!e){this.selectionElement.clear();return}if(C(this.editorService.activeTextEditorControl)?.getModel()?.uri?.scheme===N.vscodeNotebookCell){this.selectionElement.clear();return}const n={name:a("status.editor.selection","Editor Selection"),text:e,ariaLabel:e,tooltip:a("gotoLine","Go to Line/Column"),command:"workbench.action.gotoLine"};this.updateElement(this.selectionElement,n,"status.editor.selection",M.RIGHT,100.5)}updateIndentationElement(e){if(!e){this.indentationElement.clear();return}if(C(this.editorService.activeTextEditorControl)?.getModel()?.uri?.scheme===N.vscodeNotebookCell){this.indentationElement.clear();return}const n={name:a("status.editor.indentation","Editor Indentation"),text:e,ariaLabel:e,tooltip:a("selectIndentation","Select Indentation"),command:`changeEditorIndentation${this.targetWindowId}`};this.updateElement(this.indentationElement,n,"status.editor.indentation",M.RIGHT,100.4)}updateEncodingElement(e){if(!e){this.encodingElement.clear();return}const t={name:a("status.editor.encoding","Editor Encoding"),text:e,ariaLabel:e,tooltip:a("selectEncoding","Select Encoding"),command:"workbench.action.editor.changeEncoding"};this.updateElement(this.encodingElement,t,"status.editor.encoding",M.RIGHT,100.3)}updateEOLElement(e){if(!e){this.eolElement.clear();return}const t={name:a("status.editor.eol","Editor End of Line"),text:e,ariaLabel:e,tooltip:a("selectEOL","Select End of Line Sequence"),command:"workbench.action.editor.changeEOL"};this.updateElement(this.eolElement,t,"status.editor.eol",M.RIGHT,100.2)}updateLanguageIdElement(e){if(!e){this.languageElement.clear();return}const t={name:a("status.editor.mode","Editor Language"),text:e,ariaLabel:e,tooltip:a("selectLanguageMode","Select Language Mode"),command:"workbench.action.editor.changeLanguageMode"};this.updateElement(this.languageElement,t,"status.editor.mode",M.RIGHT,100.1)}updateMetadataElement(e){if(!e){this.metadataElement.clear();return}const t={name:a("status.editor.info","File Information"),text:e,ariaLabel:e,tooltip:a("fileInfo","File Information")};this.updateElement(this.metadataElement,t,"status.editor.info",M.RIGHT,100)}updateElement(e,t,n,o,r){e.value?e.value.update(t):e.value=this.statusbarService.addEntry(t,n,o,r)}updateState(e){const t=this.state.update(e);t.hasChanges()&&(this.toRender?this.toRender.combine(t):(this.toRender=t,this.delayedRender.value=_e(Te(this.targetWindowId,!0).window,()=>{this.delayedRender.clear();const n=this.toRender;this.toRender=void 0,n&&this.doRenderNow()})))}doRenderNow(){this.updateTabFocusModeElement(!!this.state.tabFocusMode),this.updateColumnSelectionModeElement(!!this.state.columnSelectionMode),this.updateIndentationElement(this.state.indentation),this.updateSelectionElement(this.state.selectionStatus),this.updateEncodingElement(this.state.encoding),this.updateEOLElement(this.state.EOL?this.state.EOL===`\r
`?we:Fe:void 0),this.updateLanguageIdElement(this.state.languageId),this.updateMetadataElement(this.state.metadata)}getSelectionLabel(e){if(!(!e||!e.selections)){if(e.selections.length===1)return e.charactersSelected?K(Et,e.selections[0].positionLineNumber,e.selections[0].positionColumn,e.charactersSelected):K(vt,e.selections[0].positionLineNumber,e.selections[0].positionColumn);if(e.charactersSelected)return K(It,e.selections.length,e.charactersSelected);if(e.selections.length>0)return K(bt,e.selections.length)}}updateStatusBar(){const e=this.editorService.activeEditor,t=this.editorService.activeEditorPane,n=t?C(t.getControl())??void 0:void 0;if(this.onColumnSelectionModeChange(n),this.onSelectionChange(n),this.onLanguageChange(n,e),this.onEOLChange(n),this.onEncodingChange(t,n),this.onIndentationChange(n),this.onMetadataChange(t),this.currentMarkerStatus.update(n),this.activeEditorListeners.clear(),t&&this.activeEditorListeners.add(t.onDidChangeControl(()=>{this.updateStatusBar()})),n)this.activeEditorListeners.add(n.onDidChangeConfiguration(o=>{o.hasChanged(oe.columnSelection)&&this.onColumnSelectionModeChange(n)})),this.activeEditorListeners.add(U.defer(n.onDidChangeCursorPosition)(()=>{this.onSelectionChange(n),this.currentMarkerStatus.update(n)})),this.activeEditorListeners.add(n.onDidChangeModelLanguage(()=>{this.onLanguageChange(n,e)})),this.activeEditorListeners.add(U.accumulate(n.onDidChangeModelContent)(o=>{this.onEOLChange(n),this.currentMarkerStatus.update(n);const r=n.getSelections();if(r){for(const u of o)for(const S of u.changes)if(r.some(m=>ae.areIntersecting(m,S.range))){this.onSelectionChange(n);break}}})),this.activeEditorListeners.add(n.onDidChangeModelOptions(()=>{this.onIndentationChange(n)}));else if(t instanceof Z||t instanceof le){const o=[];if(t instanceof le){const r=t.getPrimaryEditorPane();r instanceof Z&&o.push(r);const u=t.getSecondaryEditorPane();u instanceof Z&&o.push(u)}else o.push(t);for(const r of o)this.activeEditorListeners.add(r.onDidChangeMetadata(()=>{this.onMetadataChange(t)})),this.activeEditorListeners.add(r.onDidOpenInPlace(()=>{this.updateStatusBar()}))}}onLanguageChange(e,t){const n={type:"languageId",languageId:void 0};if(e&&t&&ee(t)){const o=e.getModel();if(o){const r=o.getLanguageId();n.languageId=this.languageService.getLanguageName(r)??void 0}}this.updateState(n)}onIndentationChange(e){const t={type:"indentation",indentation:void 0};if(e){const n=e.getModel();if(n){const o=n.getOptions();t.indentation=o.insertSpaces?o.tabSize===o.indentSize?a("spacesSize","Spaces: {0}",o.indentSize):a("spacesAndTabsSize","Spaces: {0} (Tab Size: {1})",o.indentSize,o.tabSize):a({key:"tabSize",comment:["Tab corresponds to the tab key"]},"Tab Size: {0}",o.tabSize)}}this.updateState(t)}onMetadataChange(e){const t={type:"metadata",metadata:void 0};(e instanceof Z||e instanceof le)&&(t.metadata=e.getMetadata()),this.updateState(t)}onColumnSelectionModeChange(e){const t={type:"columnSelectionMode",columnSelectionMode:!1};e?.getOption(oe.columnSelection)&&(t.columnSelectionMode=!0),this.updateState(t)}onSelectionChange(e){const t=Object.create(null);if(e){t.selections=e.getSelections()||[],t.charactersSelected=0;const n=e.getModel();if(n)for(const o of t.selections)typeof t.charactersSelected!="number"&&(t.charactersSelected=0),t.charactersSelected+=n.getCharacterCountInRange(o);if(t.selections.length===1){const o=e.getPosition(),r=new Ke(t.selections[0].selectionStartLineNumber,t.selections[0].selectionStartColumn,t.selections[0].positionLineNumber,o?e.getStatusbarColumn(o):t.selections[0].positionColumn);t.selections[0]=r}}this.updateState({type:"selectionStatus",selectionStatus:this.getSelectionLabel(t)})}onEOLChange(e){const t={type:"EOL",EOL:void 0};if(e&&!e.getOption(oe.readOnly)){const n=e.getModel();n&&(t.EOL=n.getEOL())}this.updateState(t)}onEncodingChange(e,t){if(e&&!this.isActiveEditor(e))return;const n={type:"encoding",encoding:void 0};if(e&&t?.hasModel()){const o=e.input?W(e.input):null;if(o){const r=o.getEncoding(),u=typeof r=="string"?k[r]:void 0;u?n.encoding=u.labelShort:n.encoding=r}}this.updateState(n)}onResourceEncodingChange(e){const t=this.editorService.activeEditorPane;if(t){const n=Y.getCanonicalUri(t.input,{supportSideBySide:J.PRIMARY});if(n&&Ee(n,e)){const o=C(t.getControl())??void 0;return this.onEncodingChange(t,o)}}}onTabFocusModeChange(e){const t={type:"tabFocusMode",tabFocusMode:e};this.updateState(t)}isActiveEditor(e){const t=this.editorService.activeEditorPane;return!!t&&t===e}};G=x([h(1,X),h(2,j),h(3,ve),h(4,de),h(5,ke),h(6,Le),h(7,$)],G);let te=class extends q{constructor(e){super();this.editorGroupService=e;for(const t of e.parts)this.createEditorStatus(t);this._register(e.onDidCreateAuxiliaryEditorPart(t=>this.createEditorStatus(t)))}static ID="workbench.contrib.editorStatus";createEditorStatus(e){const t=new he;U.once(e.onWillDispose)(()=>t.dispose());const n=this.editorGroupService.getScopedInstantiationService(e);t.add(n.createInstance(G,e.windowId))}};te=x([h(0,ut)],te);let Q=class extends q{constructor(e,t,n){super();this.statusbarService=e;this.markerService=t;this.configurationService=n;this.statusBarEntryAccessor=this._register(new L),this._register(t.onMarkerChanged(o=>this.onMarkerChanged(o))),this._register(U.filter(n.onDidChangeConfiguration,o=>o.affectsConfiguration("problems.showCurrentInStatus"))(()=>this.updateStatus()))}statusBarEntryAccessor;editor=void 0;markers=[];currentMarker=null;update(e){this.editor=e,this.updateMarkers(),this.updateStatus()}updateStatus(){const e=this.currentMarker;if(this.currentMarker=this.getMarker(),this.hasToUpdateStatus(e,this.currentMarker))if(this.currentMarker){const t=Ve(this.currentMarker.message)[0],n=`${this.getType(this.currentMarker)} ${t}`;this.statusBarEntryAccessor.value||(this.statusBarEntryAccessor.value=this.statusbarService.addEntry({name:a("currentProblem","Current Problem"),text:"",ariaLabel:""},"statusbar.currentProblem",M.LEFT)),this.statusBarEntryAccessor.value.update({name:a("currentProblem","Current Problem"),text:n,ariaLabel:n})}else this.statusBarEntryAccessor.clear()}hasToUpdateStatus(e,t){return!t||!e?!0:Ce.makeKey(e)!==Ce.makeKey(t)}getType(e){switch(e.severity){case R.Error:return"$(error)";case R.Warning:return"$(warning)";case R.Info:return"$(info)"}return""}getMarker(){if(!this.configurationService.getValue("problems.showCurrentInStatus")||!this.editor||!this.editor.getModel())return null;const t=this.editor.getPosition();return t&&this.markers.find(n=>ae.containsPosition(n,t))||null}onMarkerChanged(e){if(!this.editor)return;const t=this.editor.getModel();t&&(t&&!e.some(n=>Ee(t.uri,n))||this.updateMarkers())}updateMarkers(){if(!this.editor)return;const e=this.editor.getModel();e&&(e?(this.markers=this.markerService.read({resource:e.uri,severities:R.Error|R.Warning|R.Info}),this.markers.sort(this.compareMarker)):this.markers=[],this.updateStatus())}compareMarker(e,t){let n=Qe(e.resource.toString(),t.resource.toString());return n===0&&(n=R.compare(e.severity,t.severity)),n===0&&(n=ae.compareRangesUsingStarts(e,t)),n}};Q=x([h(0,ke),h(1,ct),h(2,$)],Q);let T=class extends xe{constructor(e,t,n){super(T.ID,a("showLanguageExtensions","Search Marketplace Extensions for '{0}'...",e));this.fileExtension=e;this.commandService=t;this.enabled=n.isEnabled()}static ID="workbench.action.showLanguageExtensions";async run(){await this.commandService.executeCommand("workbench.extensions.action.showExtensionsForLanguage",this.fileExtension)}};T=x([h(1,it),h(2,at)],T);class ge extends se{static ID="workbench.action.editor.changeLanguageMode";constructor(){super({id:ge.ID,title:re("changeMode","Change Language Mode"),f1:!0,keybinding:{weight:st.WorkbenchContrib,primary:We(He.CtrlCmd|pe.KeyK,pe.KeyM)},precondition:ot.not("notebookEditorFocused"),metadata:{description:a("changeLanguageMode.description","Change the language mode of the active text editor."),args:[{name:a("changeLanguageMode.arg.name","The name of the language mode to change to."),constraint:i=>typeof i=="string"}]}})}async run(i,e){const t=i.get(j),n=i.get(X),o=i.get(ve),r=i.get(gt),u=i.get(de),S=i.get(pt),m=i.get(Le),E=i.get($),l=i.get(dt),f=C(n.activeTextEditorControl);if(!f){await t.pick([{label:a("noEditor","No text editor active at this time")}]);return}const g=f.getModel(),c=Y.getOriginalUri(n.activeEditor,{supportSideBySide:J.PRIMARY});let D,v;g&&(v=g.getLanguageId(),D=o.getLanguageName(v)??void 0);let _=!!c;c?.scheme===N.untitled&&!u.untitled.get(c)?.hasAssociatedFilePath&&(_=!1);const I=o.getSortedRegisteredLanguageNames().map(({languageName:w,languageId:y})=>{const z=o.getExtensions(y).join(" ");let b;return D===w?b=a("languageDescription","({0}) - Configured Language",y):b=a("languageDescriptionConfigured","({0})",y),{label:w,meta:z,iconClasses:be(y),description:b}});I.unshift({type:"separator",label:a("languagesPicks","languages (identifier)")});let B,A,F;if(_&&c){const w=Se(c)||fe(c);F=m.createInstance(T,w),F.enabled&&I.unshift(F),A={label:a("configureModeSettings","Configure '{0}' language based settings...",D)},I.unshift(A),B={label:a("configureAssociationsExt","Configure File Association for '{0}'...",w)},I.unshift(B)}const d={label:a("autoDetect","Auto Detect")};I.unshift(d);const p=typeof e=="string"?{label:e}:await t.pick(I,{placeHolder:a("pickLanguage","Select Language Mode"),matchOnDescription:!0});if(!p)return;if(p===F){F.run();return}if(p===B){c&&this.configureFileAssociation(c,o,t,E);return}if(p===A){S.openUserSettings({jsonEditor:!0,revealSetting:{key:`[${v??null}]`,edit:!0}});return}const ne=n.activeEditor;if(ne){const w=ee(ne);if(w){let y,z;if(p===d){if(g){const b=Y.getOriginalUri(ne,{supportSideBySide:J.PRIMARY});if(b){let P=o.guessLanguageIdByFilepathOrFirstLine(b,g.getLineContent(1))??void 0;(!P||P==="unknown")&&(z=await r.detectLanguage(b),P=z),P&&(y=o.createById(P))}}}else{const b=o.getLanguageIdByLanguageName(p.label);y=o.createById(b),c&&r.detectLanguage(c).then(P=>{const Ae=o.getLanguageIdByLanguageName(p.label)||"unknown";if(P===v&&v!==Ae){const Pe=E.getValue("workbench.editor.preferHistoryBasedLanguageDetection")?"history":"classic";l.publicLog2(lt,{currentLanguageId:D??"unknown",nextLanguageId:p.label,lineCount:g?.getLineCount()??-1,modelPreference:Pe})}})}if(typeof y<"u"&&(w.setLanguageId(y.languageId,ge.ID),c?.scheme===N.untitled)){const b=E.getValue("workbench.editor.preferHistoryBasedLanguageDetection")?"history":"classic";l.publicLog2("setUntitledDocumentLanguage",{to:y.languageId,from:v??"none",modelPreference:b})}}f.focus()}}configureFileAssociation(i,e,t,n){const o=Se(i),r=fe(i),u=e.guessLanguageIdByFilepathOrFirstLine(qe.file(r)),m=e.getSortedRegisteredLanguageNames().map(({languageName:E,languageId:l})=>({id:l,label:E,iconClasses:be(l),description:l===u?a("currentAssociation","Current Association"):void 0}));setTimeout(async()=>{const E=await t.pick(m,{placeHolder:a("pickLanguageToConfigure","Select Language Mode to Associate with '{0}'",o||r)});if(E){const l=n.inspect(ye);let f;o&&r[0]!=="."?f=`*${o}`:f=r;let g=ce.USER;l.workspaceValue&&l.workspaceValue[f]&&(g=ce.WORKSPACE);const c=Ge(g===ce.WORKSPACE?l.workspaceValue:l.userValue)||Object.create(null);c[f]=E.id,n.updateValue(ye,c,g)}},50)}}class Gn extends se{constructor(){super({id:"workbench.action.editor.changeEOL",title:re("changeEndOfLine","Change End of Line Sequence"),f1:!0})}async run(i){const e=i.get(X),t=i.get(j),n=C(e.activeTextEditorControl);if(!n){await t.pick([{label:a("noEditor","No text editor active at this time")}]);return}if(e.activeEditor?.isReadonly()){await t.pick([{label:a("noWritableCodeEditor","The active code editor is read-only.")}]);return}let o=n.getModel();const r=[{label:Fe,eol:Ie.LF},{label:we,eol:Ie.CRLF}],u=o?.getEOL()===`
`?0:1,S=await t.pick(r,{placeHolder:a("pickEndOfLine","Select End of Line Sequence"),activeItem:r[u]});if(S){const m=C(e.activeTextEditorControl);m?.hasModel()&&!e.activeEditor?.isReadonly()&&(o=m.getModel(),o.pushStackElement(),o.pushEOL(S.eol),o.pushStackElement())}n.focus()}}class Qn extends se{constructor(){super({id:"workbench.action.editor.changeEncoding",title:re("changeEncoding","Change File Encoding"),f1:!0})}async run(i){const e=i.get(X),t=i.get(j),n=i.get(rt),o=i.get(de),r=i.get($e),u=C(e.activeTextEditorControl);if(!u){await t.pick([{label:a("noEditor","No text editor active at this time")}]);return}const S=e.activeEditorPane;if(!S){await t.pick([{label:a("noEditor","No text editor active at this time")}]);return}const m=W(S.input);if(!m){await t.pick([{label:a("noFileEditor","No file active at this time")}]);return}const E={label:a("saveWithEncoding","Save with Encoding")},l={label:a("reopenWithEncoding","Reopen with Encoding")};if(!me.isDefaultVariant()){const d="Save with Encoding";d!==E.label&&(E.detail=d);const p="Reopen with Encoding";p!==l.label&&(l.detail=p)}let f;if(m instanceof ue?f=E:S.input.isReadonly()?f=l:f=await t.pick([l,E],{placeHolder:a("pickAction","Select Action"),matchOnDetail:!0}),!f)return;await Ue(50);const g=Y.getOriginalUri(S.input,{supportSideBySide:J.PRIMARY});if(!g||!n.hasProvider(g)&&g.scheme!==N.untitled)return;let c;n.hasProvider(g)&&(c=(await o.readStream(g,{autoGuessEncoding:!0,candidateGuessEncodings:r.getValue(g,"files.candidateGuessEncodings")})).encoding);const D=f===l,v=r.getValue(g,"files.encoding");let _,V;const I=Object.keys(k).sort((d,p)=>d===v?-1:p===v?1:k[d].order-k[p].order).filter(d=>d===c&&c!==v?!1:!D||!k[d].encodeOnly).map((d,p)=>(d===m.getEncoding()?_=p:k[d].alias===m.getEncoding()&&(V=p),{id:d,label:k[d].labelLong,description:d})),B=I.slice();c&&v!==c&&k[c]&&(I.unshift({type:"separator"}),I.unshift({id:c,label:k[c].labelLong,description:a("guessedEncoding","Guessed from content")}));const A=await t.pick(I,{placeHolder:D?a("pickEncodingForReopen","Select File Encoding to Reopen File"):a("pickEncodingForSave","Select File Encoding to Save with"),activeItem:B[typeof _=="number"?_:typeof V=="number"?V:-1]});if(!A||!e.activeEditorPane)return;const F=W(e.activeEditorPane.input);typeof A.id<"u"&&F&&await F.setEncoding(A.id,D?De.Decode:De.Encode),u.focus()}}export{Gn as ChangeEOLAction,Qn as ChangeEncodingAction,ge as ChangeLanguageAction,te as EditorStatusContribution,T as ShowLanguageExtensionsAction};
