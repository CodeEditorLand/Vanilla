var L=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var l=(n,e,r,t)=>{for(var i=t>1?void 0:t?R(e,r):e,a=n.length-1,f;a>=0;a--)(f=n[a])&&(i=(t?f(e,r,i):f(i))||i);return t&&i&&L(e,r,i),i},o=(n,e)=>(r,t)=>e(r,t,n);import*as b from"../../../../../../vs/base/browser/dom.js";import"../../../../../../vs/base/browser/keyboardEvent.js";import{CountBadge as S}from"../../../../../../vs/base/browser/ui/countBadge/countBadge.js";import{HighlightedLabel as E}from"../../../../../../vs/base/browser/ui/highlightedlabel/highlightedLabel.js";import{IconLabel as F}from"../../../../../../vs/base/browser/ui/iconLabel/iconLabel.js";import"../../../../../../vs/base/browser/ui/list/list.js";import"../../../../../../vs/base/browser/ui/list/listWidget.js";import"../../../../../../vs/base/browser/ui/tree/tree.js";import{createMatches as v,FuzzyScore as M}from"../../../../../../vs/base/common/filters.js";import{Disposable as h}from"../../../../../../vs/base/common/lifecycle.js";import{basename as I,dirname as x}from"../../../../../../vs/base/common/resources.js";import{ITextModelService as O}from"../../../../../../vs/editor/common/services/resolverService.js";import{localize as p}from"../../../../../../vs/nls.js";import{IInstantiationService as z}from"../../../../../../vs/platform/instantiation/common/instantiation.js";import{IKeybindingService as C}from"../../../../../../vs/platform/keybinding/common/keybinding.js";import{ILabelService as P}from"../../../../../../vs/platform/label/common/label.js";import{defaultCountBadgeStyles as w}from"../../../../../../vs/platform/theme/browser/defaultStyles.js";import{FileReferences as u,OneReference as y,ReferencesModel as T}from"../referencesModel.js";let d=class{constructor(e){this._resolverService=e}hasChildren(e){return e instanceof T||e instanceof u}getChildren(e){if(e instanceof T)return e.groups;if(e instanceof u)return e.resolve(this._resolverService).then(r=>r.children);throw new Error("bad tree")}};d=l([o(0,O)],d);class oe{getHeight(){return 23}getTemplateId(e){return e instanceof u?s.id:g.id}}let m=class{constructor(e){this._keybindingService=e}getKeyboardNavigationLabel(e){if(e instanceof y){const r=e.parent.getPreview(e)?.preview(e.range);if(r)return r.value}return I(e.uri)}mightProducePrintableCharacter(e){return this._keybindingService.mightProducePrintableCharacter(e)}};m=l([o(0,C)],m);class ce{getId(e){return e instanceof y?e.id:e.uri}}let c=class extends h{constructor(r,t){super();this._labelService=t;const i=document.createElement("div");i.classList.add("reference-file"),this.file=this._register(new F(i,{supportHighlights:!0})),this.badge=new S(b.append(i,b.$(".count")),{},w),r.appendChild(i)}file;badge;set(r,t){const i=x(r.uri);this.file.setLabel(this._labelService.getUriBasenameLabel(r.uri),this._labelService.getUriLabel(i,{relative:!0}),{title:this._labelService.getUriLabel(r.uri),matches:t});const a=r.children.length;this.badge.setCount(a),a>1?this.badge.setTitleFormat(p("referencesCount","{0} references",a)):this.badge.setTitleFormat(p("referenceCount","{0} reference",a))}};c=l([o(1,P)],c);let s=class{constructor(e){this._instantiationService=e}static id="FileReferencesRenderer";templateId=s.id;renderTemplate(e){return this._instantiationService.createInstance(c,e)}renderElement(e,r,t){t.set(e.element,v(e.filterData))}disposeTemplate(e){e.dispose()}};s=l([o(0,z)],s);class _ extends h{label;constructor(e){super(),this.label=this._register(new E(e))}set(e,r){const t=e.parent.getPreview(e)?.preview(e.range);if(!t||!t.value)this.label.set(`${I(e.uri)}:${e.range.startLineNumber+1}:${e.range.startColumn+1}`);else{const{value:i,highlight:a}=t;r&&!M.isDefault(r)?(this.label.element.classList.toggle("referenceMatch",!1),this.label.set(i,v(r))):(this.label.element.classList.toggle("referenceMatch",!0),this.label.set(i,[a]))}}}class g{static id="OneReferenceRenderer";templateId=g.id;renderTemplate(e){return new _(e)}renderElement(e,r,t){t.set(e.element,e.filterData)}disposeTemplate(e){e.dispose()}}class de{getWidgetAriaLabel(){return p("treeAriaLabel","References")}getAriaLabel(e){return e.ariaMessage}}export{de as AccessibilityProvider,d as DataSource,oe as Delegate,s as FileReferencesRenderer,ce as IdentityProvider,g as OneReferenceRenderer,m as StringRepresentationProvider};
