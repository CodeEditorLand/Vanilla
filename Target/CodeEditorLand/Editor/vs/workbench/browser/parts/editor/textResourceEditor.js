var O=Object.defineProperty;var w=Object.getOwnPropertyDescriptor;var m=(u,i,t,r)=>{for(var e=r>1?void 0:r?w(i,t):i,n=u.length-1,a;n>=0;n--)(a=u[n])&&(e=(r?a(i,t,e):a(e))||e);return r&&e&&O(i,t,e),e},o=(u,i)=>(t,r)=>i(t,r,u);import"../../../../../vs/base/common/cancellation.js";import{assertIsDefined as b}from"../../../../../vs/base/common/types.js";import"../../../../../vs/editor/browser/editorBrowser.js";import{EditorOption as G}from"../../../../../vs/editor/common/config/editorOptions.js";import{ScrollType as f}from"../../../../../vs/editor/common/editorCommon.js";import{ILanguageService as N}from"../../../../../vs/editor/common/languages/language.js";import{PLAINTEXT_LANGUAGE_ID as v}from"../../../../../vs/editor/common/languages/modesRegistry.js";import{ModelConstants as D}from"../../../../../vs/editor/common/model.js";import{IModelService as P}from"../../../../../vs/editor/common/services/model.js";import{ITextResourceConfigurationService as S}from"../../../../../vs/editor/common/services/textResourceConfiguration.js";import"../../../../../vs/platform/editor/common/editor.js";import{IFileService as E}from"../../../../../vs/platform/files/common/files.js";import{IInstantiationService as C}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IStorageService as L}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as h}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{IThemeService as T}from"../../../../../vs/platform/theme/common/themeService.js";import{AbstractTextCodeEditor as F}from"../../../../../vs/workbench/browser/parts/editor/textCodeEditor.js";import{isTextEditorViewState as V}from"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import{applyTextEditorOptions as _}from"../../../../../vs/workbench/common/editor/editorOptions.js";import{BaseTextEditorModel as R}from"../../../../../vs/workbench/common/editor/textEditorModel.js";import{TextResourceEditorInput as k}from"../../../../../vs/workbench/common/editor/textResourceEditorInput.js";import{IEditorGroupsService as x}from"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import{IEditorService as M}from"../../../../../vs/workbench/services/editor/common/editorService.js";import{UntitledTextEditorInput as p}from"../../../../../vs/workbench/services/untitled/common/untitledTextEditorInput.js";let l=class extends F{constructor(i,t,r,e,n,a,s,d,I,g){super(i,t,r,e,n,a,s,I,d,g)}async setInput(i,t,r,e){await super.setInput(i,t,r,e);const n=await i.resolve();if(e.isCancellationRequested)return;if(!(n instanceof R))throw new Error("Unable to open file as text");const a=b(this.editorControl),s=n.textEditorModel;if(a.setModel(s),!V(t?.viewState)){const d=this.loadEditorViewState(i,r);d&&(t?.selection&&(d.cursorState=[]),a.restoreViewState(d))}t&&_(t,a,f.Immediate),a.updateOptions(this.getReadonlyConfiguration(n.isReadonly()))}revealLastLine(){const i=this.editorControl;if(!i)return;const t=i.getModel();if(t){const r=t.getLineCount();i.revealPosition({lineNumber:r,column:t.getLineMaxColumn(r)},f.Smooth)}}clearInput(){super.clearInput(),this.editorControl?.setModel(null)}tracksEditorViewState(i){return i instanceof p||i instanceof k}};l=m([o(2,h),o(3,C),o(4,L),o(5,S),o(6,T),o(7,x),o(8,M),o(9,E)],l);let c=class extends l{constructor(t,r,e,n,a,s,d,I,g,A,y){super(c.ID,t,r,e,n,a,s,I,d,y);this.modelService=g;this.languageService=A}static ID="workbench.editors.textResourceEditor";createEditorControl(t,r){super.createEditorControl(t,r);const e=this.editorControl;e&&this._register(e.onDidPaste(n=>this.onDidEditorPaste(n,e)))}onDidEditorPaste(t,r){if(this.input instanceof p&&this.input.hasLanguageSetExplicitly||t.range.startLineNumber!==1||t.range.startColumn!==1||r.getOption(G.readOnly))return;const e=r.getModel();if(!e||!(e.getLineCount()===t.range.endLineNumber&&e.getLineMaxColumn(t.range.endLineNumber)===t.range.endColumn)||e.getLanguageId()!==v)return;let s;if(t.languageId)s={id:t.languageId,source:"event"};else{const d=this.languageService.guessLanguageIdByFilepathOrFirstLine(e.uri,e.getLineContent(1).substr(0,D.FIRST_LINE_DETECTION_LENGTH_LIMIT))??void 0;d&&(s={id:d,source:"guess"})}if(s&&s.id!==v){this.input instanceof p&&s.source==="event"?this.input.setLanguageId(s.id):e.setLanguage(this.languageService.createById(s.id));const d=this.modelService.getCreationOptions(e.getLanguageId(),e.uri,e.isForSimpleWidget);e.detectIndentation(d.insertSpaces,d.tabSize)}}};c=m([o(1,h),o(2,C),o(3,L),o(4,S),o(5,T),o(6,M),o(7,x),o(8,P),o(9,N),o(10,E)],c);export{l as AbstractTextResourceEditor,c as TextResourceEditor};