var D=Object.defineProperty;var F=Object.getOwnPropertyDescriptor;var R=(p,s,e,o)=>{for(var i=o>1?void 0:o?F(s,e):s,r=p.length-1,t;r>=0;r--)(t=p[r])&&(i=(o?t(s,e,i):t(i))||i);return o&&i&&D(s,e,i),i},d=(p,s)=>(e,o)=>s(e,o,p);import{ThrottledDelayer as N}from"../../../../../vs/base/common/async.js";import"../../../../../vs/base/common/cancellation.js";import{Codicon as w}from"../../../../../vs/base/common/codicons.js";import"../../../../../vs/base/common/filters.js";import{pieceToQuery as M,prepareQuery as A,scoreFuzzy2 as P}from"../../../../../vs/base/common/fuzzyScorer.js";import"../../../../../vs/base/common/lifecycle.js";import{Schemas as _}from"../../../../../vs/base/common/network.js";import{ThemeIcon as W}from"../../../../../vs/base/common/themables.js";import{ICodeEditorService as G}from"../../../../../vs/editor/browser/services/codeEditorService.js";import{Range as K}from"../../../../../vs/editor/common/core/range.js";import{SymbolKind as l,SymbolKinds as v,SymbolTag as Y}from"../../../../../vs/editor/common/languages.js";import{getSelectionSearchString as x}from"../../../../../vs/editor/contrib/find/browser/findController.js";import{localize as C}from"../../../../../vs/nls.js";import{IConfigurationService as U}from"../../../../../vs/platform/configuration/common/configuration.js";import{ILabelService as $}from"../../../../../vs/platform/label/common/label.js";import{IOpenerService as z}from"../../../../../vs/platform/opener/common/opener.js";import{PickerQuickAccessProvider as V,TriggerAction as H}from"../../../../../vs/platform/quickinput/browser/pickerQuickAccess.js";import"../../../../../vs/platform/quickinput/common/quickInput.js";import"../../../../../vs/workbench/common/editor.js";import{getWorkspaceSymbols as X}from"../../../../../vs/workbench/contrib/search/common/search.js";import{ACTIVE_GROUP as j,IEditorService as J,SIDE_GROUP as Z}from"../../../../../vs/workbench/services/editor/common/editorService.js";let c=class extends V{constructor(e,o,i,r,t){super(c.PREFIX,{canAcceptInBackground:!0,noResultsPick:{label:C("noSymbolResults","No matching workspace symbols")}});this.labelService=e;this.openerService=o;this.editorService=i;this.configurationService=r;this.codeEditorService=t}static PREFIX="#";static TYPING_SEARCH_DELAY=200;static TREAT_AS_GLOBAL_SYMBOL_TYPES=new Set([l.Class,l.Enum,l.File,l.Interface,l.Namespace,l.Package,l.Module]);delayer=this._register(new N(c.TYPING_SEARCH_DELAY));get defaultFilterValue(){const e=this.codeEditorService.getFocusedCodeEditor();if(e)return x(e)??void 0}get configuration(){const e=this.configurationService.getValue().workbench?.editor;return{openEditorPinned:!e?.enablePreviewFromQuickOpen||!e?.enablePreview,openSideBySideDirection:e?.openSideBySideDirection}}_getPicks(e,o,i){return this.getSymbolPicks(e,void 0,i)}async getSymbolPicks(e,o,i){return this.delayer.trigger(async()=>i.isCancellationRequested?[]:this.doGetSymbolPicks(A(e),o,i),o?.delay)}async doGetSymbolPicks(e,o,i){let r,t;e.values&&e.values.length>1?(r=M(e.values[0]),t=M(e.values.slice(1))):r=e;const B=await X(r.original,i);if(i.isCancellationRequested)return[];const b=[],E=this.configuration.openSideBySideDirection;for(const{symbol:n,provider:f}of B){if(o?.skipLocal&&!c.TREAT_AS_GLOBAL_SYMBOL_TYPES.has(n.kind)&&n.containerName)continue;const I=n.name,S=`$(${v.toIcon(n.kind).id}) ${I}`,T=S.length-I.length;let a,k,L=!1;if(r.original.length>0&&(r!==e&&([a,k]=P(S,{...e,values:void 0},0,T),typeof a=="number"&&(L=!0)),typeof a!="number"&&([a,k]=P(S,r,0,T),typeof a!="number")))continue;const g=n.location.uri;let m;if(g){const u=this.labelService.getUriLabel(g,{relative:!0});n.containerName?m=`${n.containerName} \u2022 ${u}`:m=u}let h,O;if(!L&&t&&t.original.length>0){if(m&&([h,O]=P(m,t)),typeof h!="number")continue;typeof a=="number"&&(a+=h)}const Q=n.tags?n.tags.indexOf(Y.Deprecated)>=0:!1;b.push({symbol:n,resource:g,score:a,label:S,ariaLabel:I,highlights:Q?void 0:{label:k,description:O},description:m,strikethrough:Q,buttons:[{iconClass:E==="right"?W.asClassName(w.splitHorizontal):W.asClassName(w.splitVertical),tooltip:E==="right"?C("openToSide","Open to the Side"):C("openToBottom","Open to the Bottom")}],trigger:(u,y)=>(this.openSymbol(f,n,i,{keyMods:y,forceOpenSideBySide:!0}),H.CLOSE_PICKER),accept:async(u,y)=>this.openSymbol(f,n,i,{keyMods:u,preserveFocus:y.inBackground,forcePinned:y.inBackground})})}return o?.skipSorting||b.sort((n,f)=>this.compareSymbols(n,f)),b}async openSymbol(e,o,i,r){let t=o;typeof e.resolveWorkspaceSymbol=="function"&&(t=await e.resolveWorkspaceSymbol(o,i)||o,i.isCancellationRequested)||(t.location.uri.scheme===_.http||t.location.uri.scheme===_.https?await this.openerService.open(t.location.uri,{fromUserGesture:!0,allowContributedOpeners:!0}):await this.editorService.openEditor({resource:t.location.uri,options:{preserveFocus:r?.preserveFocus,pinned:r.keyMods.ctrlCmd||r.forcePinned||this.configuration.openEditorPinned,selection:t.location.range?K.collapseToStart(t.location.range):void 0}},r.keyMods.alt||this.configuration.openEditorPinned&&r.keyMods.ctrlCmd||r?.forceOpenSideBySide?Z:j))}compareSymbols(e,o){if(typeof e.score=="number"&&typeof o.score=="number"){if(e.score>o.score)return-1;if(e.score<o.score)return 1}if(e.symbol&&o.symbol){const i=e.symbol.name.toLowerCase(),r=o.symbol.name.toLowerCase(),t=i.localeCompare(r);if(t!==0)return t}if(e.symbol&&o.symbol){const i=v.toIcon(e.symbol.kind).id,r=v.toIcon(o.symbol.kind).id;return i.localeCompare(r)}return 0}};c=R([d(0,$),d(1,z),d(2,J),d(3,U),d(4,G)],c);export{c as SymbolsQuickAccessProvider};
