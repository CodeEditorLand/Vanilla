var k=Object.defineProperty;var M=Object.getOwnPropertyDescriptor;var m=(l,a,e,i)=>{for(var t=i>1?void 0:i?M(a,e):a,r=l.length-1,o;r>=0;r--)(o=l[r])&&(t=(i?o(a,e,t):o(t))||t);return i&&t&&k(a,e,t),t},g=(l,a)=>(e,i)=>a(e,i,l);import{RunOnceScheduler as C}from"../../../../base/common/async.js";import{MarkdownString as _}from"../../../../base/common/htmlContent.js";import{parseTree as E}from"../../../../base/common/json.js";import{KeybindingParser as b}from"../../../../base/common/keybindingParser.js";import{Disposable as D,MutableDisposable as R}from"../../../../base/common/lifecycle.js";import{isEqual as L}from"../../../../base/common/resources.js";import"../../../../base/common/themables.js";import{assertIsDefined as I}from"../../../../base/common/types.js";import"../../../../editor/browser/editorBrowser.js";import{EditorContributionInstantiation as A,registerEditorContribution as P}from"../../../../editor/browser/editorExtensions.js";import{overviewRulerError as T,overviewRulerInfo as K}from"../../../../editor/common/core/editorColorRegistry.js";import{Range as N}from"../../../../editor/common/core/range.js";import{OverviewRulerLane as x,TrackedRangeStickiness as U}from"../../../../editor/common/model.js";import{SnippetController2 as O}from"../../../../editor/contrib/snippet/browser/snippetController2.js";import*as v from"../../../../nls.js";import{IInstantiationService as W}from"../../../../platform/instantiation/common/instantiation.js";import{IKeybindingService as F}from"../../../../platform/keybinding/common/keybinding.js";import{themeColorFromId as S}from"../../../../platform/theme/common/themeService.js";import{WindowsNativeResolvedKeybinding as z}from"../../../services/keybinding/common/windowsKeyboardMapper.js";import{DEFINE_KEYBINDING_EDITOR_CONTRIB_ID as B}from"../../../services/preferences/common/preferences.js";import{IUserDataProfileService as Y}from"../../../services/userDataProfile/common/userDataProfile.js";import{SmartSnippetInserter as q}from"../common/smartSnippetInserter.js";import{DefineKeybindingOverlayWidget as G}from"./keybindingWidgets.js";const $=v.localize("defineKeybinding.kbLayoutErrorMessage","You won't be able to produce this key combination under your current keyboard layout.");let p=class extends D{constructor(e,i,t){super();this._editor=e;this._instantiationService=i;this._userDataProfileService=t;this._defineWidget=this._register(this._instantiationService.createInstance(G,this._editor)),this._register(this._editor.onDidChangeModel(r=>this._update())),this._update()}_keybindingDecorationRenderer=this._register(new R);_defineWidget;_update(){this._keybindingDecorationRenderer.value=w(this._editor,this._userDataProfileService)?this._instantiationService.createInstance(u,this._editor):void 0}showDefineKeybindingWidget(){w(this._editor,this._userDataProfileService)&&this._defineWidget.start().then(e=>this._onAccepted(e))}_onAccepted(e){if(this._editor.focus(),e&&this._editor.hasModel()){new RegExp(/\\/g).test(e)&&(e=e.slice(0,-1)+"\\\\");let r=["{",'	"key": '+JSON.stringify(e)+",",'	"command": "${1:commandId}",','	"when": "${2:editorTextFocus}"',"}$0"].join(`
`);const o=q.insertSnippet(this._editor.getModel(),this._editor.getPosition());r=o.prepend+r+o.append,this._editor.setPosition(o.position),O.get(this._editor)?.insert(r,{overwriteBefore:0,overwriteAfter:0})}}};p=m([g(1,W),g(2,Y)],p);let u=class extends D{constructor(e,i){super();this._editor=e;this._keybindingService=i;this._updateDecorations=this._register(new C(()=>this._updateDecorationsNow(),500));const t=I(this._editor.getModel());this._register(t.onDidChangeContent(()=>this._updateDecorations.schedule())),this._register(this._keybindingService.onDidUpdateKeybindings(()=>this._updateDecorations.schedule())),this._register({dispose:()=>{this._dec.clear(),this._updateDecorations.cancel()}}),this._updateDecorations.schedule()}_updateDecorations;_dec=this._editor.createDecorationsCollection();_updateDecorationsNow(){const e=I(this._editor.getModel()),i=[],t=E(e.getValue());if(t&&Array.isArray(t.children))for(let r=0,o=t.children.length;r<o;r++){const d=t.children[r],n=this._getDecorationForEntry(e,d);n!==null&&i.push(n)}this._dec.set(i)}_getDecorationForEntry(e,i){if(!Array.isArray(i.children))return null;for(let t=0,r=i.children.length;t<r;t++){const o=i.children[t];if(o.type!=="property"||!Array.isArray(o.children)||o.children.length!==2||o.children[0].value!=="key")continue;const n=o.children[1];if(n.type!=="string")continue;const h=this._keybindingService.resolveUserBinding(n.value);if(h.length===0)return this._createDecoration(!0,null,null,e,n);const s=h[0];let c=null;if(s instanceof z&&(c=s.getUSLabel()),!s.isWYSIWYG()){const y=s.getLabel();return typeof y=="string"&&n.value.toLowerCase()===y.toLowerCase()?null:this._createDecoration(!1,s.getLabel(),c,e,n)}if(/abnt_|oem_/.test(n.value))return this._createDecoration(!1,s.getLabel(),c,e,n);const f=s.getUserSettingsLabel();return typeof f=="string"&&!u._userSettingsFuzzyEquals(n.value,f)?this._createDecoration(!1,s.getLabel(),c,e,n):null}return null}static _userSettingsFuzzyEquals(e,i){if(e=e.trim().toLowerCase(),i=i.trim().toLowerCase(),e===i)return!0;const t=b.parseKeybinding(e),r=b.parseKeybinding(i);return t===null&&r===null?!0:!t||!r?!1:t.equals(r)}_createDecoration(e,i,t,r,o){let d,n,h;e?(d=new _().appendText($),n="keybindingError",h=S(T)):(t&&i!==t?d=new _(v.localize({key:"defineKeybinding.kbLayoutLocalAndUSMessage",comment:["Please translate maintaining the stars (*) around the placeholders such that they will be rendered in bold.","The placeholders will contain a keyboard combination e.g. Ctrl+Shift+/"]},"**{0}** for your current keyboard layout (**{1}** for US standard).",i,t)):d=new _(v.localize({key:"defineKeybinding.kbLayoutLocalMessage",comment:["Please translate maintaining the stars (*) around the placeholder such that it will be rendered in bold.","The placeholder will contain a keyboard combination e.g. Ctrl+Shift+/"]},"**{0}** for your current keyboard layout.",i)),n="keybindingInfo",h=S(K));const s=r.getPositionAt(o.offset),c=r.getPositionAt(o.offset+o.length);return{range:new N(s.lineNumber,s.column,c.lineNumber,c.column),options:{description:"keybindings-widget",stickiness:U.NeverGrowsWhenTypingAtEdges,className:n,hoverMessage:d,overviewRuler:{color:h,position:x.Right}}}}};u=m([g(1,F)],u);function w(l,a){const e=l.getModel();return e?L(e.uri,a.currentProfile.keybindingsResource):!1}P(B,p,A.AfterFirstRender);export{u as KeybindingEditorDecorationsRenderer};
