var f=Object.defineProperty;var v=Object.getOwnPropertyDescriptor;var a=(o,r,t,i)=>{for(var e=i>1?void 0:i?v(r,t):r,n=o.length-1,d;n>=0;n--)(d=o[n])&&(e=(i?d(r,t,e):d(e))||e);return i&&e&&f(r,t,e),e},s=(o,r)=>(t,i)=>r(t,i,o);import{Disposable as h}from"../../../../base/common/lifecycle.js";import{isDiffEditor as m}from"../../../../editor/browser/editorBrowser.js";import{localize as l}from"../../../../nls.js";import{IAccessibilityService as g}from"../../../../platform/accessibility/common/accessibility.js";import{IConfigurationService as _}from"../../../../platform/configuration/common/configuration.js";import{IEditorService as S}from"../../../services/editor/common/editorService.js";import{Event as b}from"../../../../base/common/event.js";import{AccessibilityVerbositySettingId as p}from"../../accessibility/browser/accessibilityConfiguration.js";let c=class extends h{constructor(t,i,e){super();this._editorService=t;this._accessibilityService=i;this._configurationService=e;this._register(b.runAndSubscribe(i.onDidChangeScreenReaderOptimized,()=>this._updateListener())),this._register(e.onDidChangeConfiguration(n=>{n.affectsConfiguration(p.DiffEditorActive)&&this._updateListener()}))}static ID="workbench.contrib.diffEditorActiveAnnouncement";_onDidActiveEditorChangeListener;_updateListener(){const t=this._configurationService.getValue(p.DiffEditorActive),i=this._accessibilityService.isScreenReaderOptimized();if(!t||!i){this._onDidActiveEditorChangeListener?.dispose(),this._onDidActiveEditorChangeListener=void 0;return}this._onDidActiveEditorChangeListener||(this._onDidActiveEditorChangeListener=this._register(this._editorService.onDidActiveEditorChange(()=>{m(this._editorService.activeTextEditorControl)&&this._accessibilityService.alert(l("openDiffEditorAnnouncement","Diff editor"))})))}};c=a([s(0,S),s(1,g),s(2,_)],c);export{c as DiffEditorActiveAnnouncementContribution};
