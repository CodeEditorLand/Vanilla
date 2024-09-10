var X=Object.defineProperty;var Y=Object.getOwnPropertyDescriptor;var W=(r,n,e,t)=>{for(var i=t>1?void 0:t?Y(n,e):n,s=r.length-1,o;s>=0;s--)(o=r[s])&&(i=(t?o(n,e,i):o(i))||i);return t&&i&&X(n,e,i),i},P=(r,n)=>(e,t)=>n(e,t,r);import{DisposableStore as F}from"../../../../base/common/lifecycle.js";import*as D from"../../../../base/common/strings.js";import{EditorAction as L,EditorContributionInstantiation as Z,registerEditorAction as f,registerEditorContribution as $}from"../../../browser/editorExtensions.js";import{ShiftCommand as B}from"../../../common/commands/shiftCommand.js";import{EditorAutoIndentStrategy as ee,EditorOption as E}from"../../../common/config/editorOptions.js";import{Range as v}from"../../../common/core/range.js";import{EditorContextKeys as z}from"../../../common/editorContextKeys.js";import{StandardTokenType as q}from"../../../common/encodedTokenAttributes.js";import{ILanguageConfigurationService as y}from"../../../common/languages/languageConfigurationRegistry.js";import{IndentConsts as te}from"../../../common/languages/supports/indentRules.js";import{IModelService as K}from"../../../common/services/model.js";import*as I from"../common/indentUtils.js";import*as c from"../../../../nls.js";import{IQuickInputService as ne}from"../../../../platform/quickinput/common/quickInput.js";import{getGoodIndentForLine as V,getIndentMetadata as ie}from"../../../common/languages/autoIndent.js";import{getReindentEditOperations as G}from"../common/indentation.js";import{getStandardTokenTypeAtPosition as oe}from"../../../common/tokens/lineTokens.js";class M extends L{static ID="editor.action.indentationToSpaces";constructor(){super({id:M.ID,label:c.localize("indentationToSpaces","Convert Indentation to Spaces"),alias:"Convert Indentation to Spaces",precondition:z.writable,metadata:{description:c.localize2("indentationToSpacesDescription","Convert the tab indentation to spaces.")}})}run(n,e){const t=e.getModel();if(!t)return;const i=t.getOptions(),s=e.getSelection();if(!s)return;const o=new le(s,i.tabSize);e.pushUndoStop(),e.executeCommands(this.id,[o]),e.pushUndoStop(),t.updateOptions({insertSpaces:!0})}}class N extends L{static ID="editor.action.indentationToTabs";constructor(){super({id:N.ID,label:c.localize("indentationToTabs","Convert Indentation to Tabs"),alias:"Convert Indentation to Tabs",precondition:z.writable,metadata:{description:c.localize2("indentationToTabsDescription","Convert the spaces indentation to tabs.")}})}run(n,e){const t=e.getModel();if(!t)return;const i=t.getOptions(),s=e.getSelection();if(!s)return;const o=new de(s,i.tabSize);e.pushUndoStop(),e.executeCommands(this.id,[o]),e.pushUndoStop(),t.updateOptions({insertSpaces:!1})}}class k extends L{constructor(e,t,i){super(i);this.insertSpaces=e;this.displaySizeOnly=t}run(e,t){const i=e.get(ne),s=e.get(K),o=t.getModel();if(!o)return;const d=s.getCreationOptions(o.getLanguageId(),o.uri,o.isForSimpleWidget),l=o.getOptions(),p=[1,2,3,4,5,6,7,8].map(a=>({id:a.toString(),label:a.toString(),description:a===d.tabSize&&a===l.tabSize?c.localize("configuredTabSize","Configured Tab Size"):a===d.tabSize?c.localize("defaultTabSize","Default Tab Size"):a===l.tabSize?c.localize("currentTabSize","Current Tab Size"):void 0})),m=Math.min(o.getOptions().tabSize-1,7);setTimeout(()=>{i.pick(p,{placeHolder:c.localize({key:"selectTabWidth",comment:["Tab corresponds to the tab key"]},"Select Tab Size for Current File"),activeItem:p[m]}).then(a=>{if(a&&o&&!o.isDisposed()){const S=parseInt(a.label,10);this.displaySizeOnly?o.updateOptions({tabSize:S}):o.updateOptions({tabSize:S,indentSize:S,insertSpaces:this.insertSpaces})}})},50)}}class _ extends k{static ID="editor.action.indentUsingTabs";constructor(){super(!1,!1,{id:_.ID,label:c.localize("indentUsingTabs","Indent Using Tabs"),alias:"Indent Using Tabs",precondition:void 0,metadata:{description:c.localize2("indentUsingTabsDescription","Use indentation with tabs.")}})}}class U extends k{static ID="editor.action.indentUsingSpaces";constructor(){super(!0,!1,{id:U.ID,label:c.localize("indentUsingSpaces","Indent Using Spaces"),alias:"Indent Using Spaces",precondition:void 0,metadata:{description:c.localize2("indentUsingSpacesDescription","Use indentation with spaces.")}})}}class w extends k{static ID="editor.action.changeTabDisplaySize";constructor(){super(!0,!0,{id:w.ID,label:c.localize("changeTabDisplaySize","Change Tab Display Size"),alias:"Change Tab Display Size",precondition:void 0,metadata:{description:c.localize2("changeTabDisplaySizeDescription","Change the space size equivalent of the tab.")}})}}class A extends L{static ID="editor.action.detectIndentation";constructor(){super({id:A.ID,label:c.localize("detectIndentation","Detect Indentation from Content"),alias:"Detect Indentation from Content",precondition:void 0,metadata:{description:c.localize2("detectIndentationDescription","Detect the indentation from content.")}})}run(n,e){const t=n.get(K),i=e.getModel();if(!i)return;const s=t.getCreationOptions(i.getLanguageId(),i.uri,i.isForSimpleWidget);i.detectIndentation(s.insertSpaces,s.tabSize)}}class se extends L{constructor(){super({id:"editor.action.reindentlines",label:c.localize("editor.reindentlines","Reindent Lines"),alias:"Reindent Lines",precondition:z.writable,metadata:{description:c.localize2("editor.reindentlinesDescription","Reindent the lines of the editor.")}})}run(n,e){const t=n.get(y),i=e.getModel();if(!i)return;const s=G(i,t,1,i.getLineCount());s.length>0&&(e.pushUndoStop(),e.executeEdits(this.id,s),e.pushUndoStop())}}class ae extends L{constructor(){super({id:"editor.action.reindentselectedlines",label:c.localize("editor.reindentselectedlines","Reindent Selected Lines"),alias:"Reindent Selected Lines",precondition:z.writable,metadata:{description:c.localize2("editor.reindentselectedlinesDescription","Reindent the selected lines of the editor.")}})}run(n,e){const t=n.get(y),i=e.getModel();if(!i)return;const s=e.getSelections();if(s===null)return;const o=[];for(const d of s){let l=d.startLineNumber,p=d.endLineNumber;if(l!==p&&d.endColumn===1&&p--,l===1){if(l===p)continue}else l--;const m=G(i,t,l,p);o.push(...m)}o.length>0&&(e.pushUndoStop(),e.executeEdits(this.id,o),e.pushUndoStop())}}class re{_edits;_initialSelection;_selectionId;constructor(n,e){this._initialSelection=e,this._edits=[],this._selectionId=null;for(const t of n)t.range&&typeof t.text=="string"&&this._edits.push(t)}getEditOperations(n,e){for(const i of this._edits)e.addEditOperation(v.lift(i.range),i.text);let t=!1;Array.isArray(this._edits)&&this._edits.length===1&&this._initialSelection.isEmpty()&&(this._edits[0].range.startColumn===this._initialSelection.endColumn&&this._edits[0].range.startLineNumber===this._initialSelection.endLineNumber?(t=!0,this._selectionId=e.trackSelection(this._initialSelection,!0)):this._edits[0].range.endColumn===this._initialSelection.startColumn&&this._edits[0].range.endLineNumber===this._initialSelection.startLineNumber&&(t=!0,this._selectionId=e.trackSelection(this._initialSelection,!1))),t||(this._selectionId=e.trackSelection(this._initialSelection))}computeCursorState(n,e){return e.getTrackedSelection(this._selectionId)}}let T=class{constructor(n,e){this.editor=n;this._languageConfigurationService=e;this.callOnDispose.add(n.onDidChangeConfiguration(()=>this.update())),this.callOnDispose.add(n.onDidChangeModel(()=>this.update())),this.callOnDispose.add(n.onDidChangeModelLanguage(()=>this.update()))}static ID="editor.contrib.autoIndentOnPaste";callOnDispose=new F;callOnModel=new F;update(){this.callOnModel.clear(),!(this.editor.getOption(E.autoIndent)<ee.Full||this.editor.getOption(E.formatOnPaste))&&this.editor.hasModel()&&this.callOnModel.add(this.editor.onDidPaste(({range:n})=>{this.trigger(n)}))}trigger(n){const e=this.editor.getSelections();if(e===null||e.length>1)return;const t=this.editor.getModel();if(!t||this.rangeContainsOnlyWhitespaceCharacters(t,n)||ce(t,n)||!t.tokenization.isCheapToTokenize(n.getStartPosition().lineNumber))return;const s=this.editor.getOption(E.autoIndent),{tabSize:o,indentSize:d,insertSpaces:l}=t.getOptions(),p=[],m={shiftIndent:g=>B.shiftIndent(g,g.length+1,o,d,l),unshiftIndent:g=>B.unshiftIndent(g,g.length+1,o,d,l)};let a=n.startLineNumber;for(;a<=n.endLineNumber;){if(this.shouldIgnoreLine(t,a)){a++;continue}break}if(a>n.endLineNumber)return;let S=t.getLineContent(a);if(!/\S/.test(S.substring(0,n.startColumn-1))){const g=V(s,t,t.getLanguageId(),a,m,this._languageConfigurationService);if(g!==null){const b=D.getLeadingWhitespace(S),u=I.getSpaceCnt(g,o),C=I.getSpaceCnt(b,o);if(u!==C){const h=I.generateIndent(u,o,l);p.push({range:new v(a,1,a,b.length+1),text:h}),S=h+S.substring(b.length)}else{const h=ie(t,a,this._languageConfigurationService);if(h===0||h===te.UNINDENT_MASK)return}}}const Q=a;for(;a<n.endLineNumber;){if(!/\S/.test(t.getLineContent(a+1))){a++;continue}break}if(a!==n.endLineNumber){const b=V(s,{tokenization:{getLineTokens:u=>t.tokenization.getLineTokens(u),getLanguageId:()=>t.getLanguageId(),getLanguageIdAtPosition:(u,C)=>t.getLanguageIdAtPosition(u,C)},getLineContent:u=>u===Q?S:t.getLineContent(u)},t.getLanguageId(),a+1,m,this._languageConfigurationService);if(b!==null){const u=I.getSpaceCnt(b,o),C=I.getSpaceCnt(D.getLeadingWhitespace(t.getLineContent(a+1)),o);if(u!==C){const h=u-C;for(let O=a+1;O<=n.endLineNumber;O++){const j=t.getLineContent(O),x=D.getLeadingWhitespace(j),J=I.getSpaceCnt(x,o)+h,R=I.generateIndent(J,o,l);R!==x&&p.push({range:new v(O,1,O,x.length+1),text:R})}}}}if(p.length>0){this.editor.pushUndoStop();const g=new re(p,this.editor.getSelection());this.editor.executeCommand("autoIndentOnPaste",g),this.editor.pushUndoStop()}}rangeContainsOnlyWhitespaceCharacters(n,e){const t=s=>s.trim().length===0;let i=!0;if(e.startLineNumber===e.endLineNumber){const o=n.getLineContent(e.startLineNumber).substring(e.startColumn-1,e.endColumn-1);i=t(o)}else for(let s=e.startLineNumber;s<=e.endLineNumber;s++){const o=n.getLineContent(s);if(s===e.startLineNumber){const d=o.substring(e.startColumn-1);i=t(d)}else if(s===e.endLineNumber){const d=o.substring(0,e.endColumn-1);i=t(d)}else i=n.getLineFirstNonWhitespaceColumn(s)===0;if(!i)break}return i}shouldIgnoreLine(n,e){n.tokenization.forceTokenization(e);const t=n.getLineFirstNonWhitespaceColumn(e);if(t===0)return!0;const i=n.tokenization.getLineTokens(e);if(i.getCount()>0){const s=i.findTokenIndexAtOffset(t);if(s>=0&&i.getStandardTokenType(s)===q.Comment)return!0}return!1}dispose(){this.callOnDispose.dispose(),this.callOnModel.dispose()}};T=W([P(1,y)],T);function ce(r,n){const e=t=>oe(r,t)===q.String;return e(n.getStartPosition())||e(n.getEndPosition())}function H(r,n,e,t){if(r.getLineCount()===1&&r.getLineMaxColumn(1)===1)return;let i="";for(let o=0;o<e;o++)i+=" ";const s=new RegExp(i,"gi");for(let o=1,d=r.getLineCount();o<=d;o++){let l=r.getLineFirstNonWhitespaceColumn(o);if(l===0&&(l=r.getLineMaxColumn(o)),l===1)continue;const p=new v(o,1,o,l),m=r.getValueInRange(p),a=t?m.replace(/\t/ig,i):m.replace(s,"	");n.addEditOperation(p,a)}}class le{constructor(n,e){this.selection=n;this.tabSize=e}selectionId=null;getEditOperations(n,e){this.selectionId=e.trackSelection(this.selection),H(n,e,this.tabSize,!0)}computeCursorState(n,e){return e.getTrackedSelection(this.selectionId)}}class de{constructor(n,e){this.selection=n;this.tabSize=e}selectionId=null;getEditOperations(n,e){this.selectionId=e.trackSelection(this.selection),H(n,e,this.tabSize,!1)}computeCursorState(n,e){return e.getTrackedSelection(this.selectionId)}}$(T.ID,T,Z.BeforeFirstInteraction),f(M),f(N),f(_),f(U),f(w),f(A),f(se),f(ae);export{T as AutoIndentOnPaste,re as AutoIndentOnPasteCommand,k as ChangeIndentationSizeAction,w as ChangeTabDisplaySize,A as DetectIndentation,U as IndentUsingSpaces,_ as IndentUsingTabs,M as IndentationToSpacesAction,le as IndentationToSpacesCommand,N as IndentationToTabsAction,de as IndentationToTabsCommand,se as ReindentLinesAction,ae as ReindentSelectedLinesAction};
