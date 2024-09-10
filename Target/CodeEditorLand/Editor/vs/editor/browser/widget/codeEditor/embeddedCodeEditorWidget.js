var O=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var v=(n,e,r,o)=>{for(var i=o>1?void 0:o?h(e,r):e,s=n.length-1,a;s>=0;s--)(a=n[s])&&(i=(o?a(e,r,i):a(i))||i);return o&&i&&O(e,r,i),i},t=(n,e)=>(r,o)=>e(r,o,n);import*as S from"../../../../base/common/objects.js";import{ICodeEditorService as E}from"../../services/codeEditorService.js";import{CodeEditorWidget as _}from"./codeEditorWidget.js";import{ILanguageConfigurationService as w}from"../../../common/languages/languageConfigurationRegistry.js";import{ILanguageFeaturesService as l}from"../../../common/services/languageFeatures.js";import{IAccessibilityService as y}from"../../../../platform/accessibility/common/accessibility.js";import{ICommandService as x}from"../../../../platform/commands/common/commands.js";import{IContextKeyService as L}from"../../../../platform/contextkey/common/contextkey.js";import{IInstantiationService as N}from"../../../../platform/instantiation/common/instantiation.js";import{INotificationService as D}from"../../../../platform/notification/common/notification.js";import{IThemeService as P}from"../../../../platform/theme/common/themeService.js";let p=class extends _{_parentEditor;_overwriteOptions;constructor(e,r,o,i,s,a,m,d,I,g,c,u,f){super(e,{...i.getRawOptions(),overflowWidgetsDomNode:i.getOverflowWidgetsDomNode()},o,s,a,m,d,I,g,c,u,f),this._parentEditor=i,this._overwriteOptions=r,super.updateOptions(this._overwriteOptions),this._register(i.onDidChangeConfiguration(C=>this._onParentConfigurationChanged(C)))}getParentEditor(){return this._parentEditor}_onParentConfigurationChanged(e){super.updateOptions(this._parentEditor.getRawOptions()),super.updateOptions(this._overwriteOptions)}updateOptions(e){S.mixin(this._overwriteOptions,e,!0),super.updateOptions(this._overwriteOptions)}};p=v([t(4,N),t(5,E),t(6,x),t(7,L),t(8,P),t(9,D),t(10,y),t(11,w),t(12,l)],p);export{p as EmbeddedCodeEditorWidget};
