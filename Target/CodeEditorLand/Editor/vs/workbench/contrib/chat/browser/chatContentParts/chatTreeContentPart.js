var C=Object.defineProperty;var T=Object.getOwnPropertyDescriptor;var c=(o,e,r,t)=>{for(var s=t>1?void 0:t?T(e,r):e,i=o.length-1,a;i>=0;i--)(a=o[i])&&(s=(t?a(e,r,s):a(s))||s);return t&&s&&C(e,r,s),s},l=(o,e)=>(r,t)=>e(r,t,o);import*as b from"../../../../../base/browser/dom.js";import{Emitter as D}from"../../../../../base/common/event.js";import{Disposable as I,DisposableStore as u}from"../../../../../base/common/lifecycle.js";import{localize as R}from"../../../../../nls.js";import{IConfigurationService as f}from"../../../../../platform/configuration/common/configuration.js";import{FileKind as p,FileType as v}from"../../../../../platform/files/common/files.js";import{IInstantiationService as F}from"../../../../../platform/instantiation/common/instantiation.js";import{WorkbenchCompressibleAsyncDataTree as y}from"../../../../../platform/list/browser/listService.js";import{IOpenerService as P}from"../../../../../platform/opener/common/opener.js";import{IThemeService as L}from"../../../../../platform/theme/common/themeService.js";import{ResourceLabels as S}from"../../../../browser/labels.js";import{ResourcePool as _}from"./chatCollections.js";import{createFileIconThemableTreeContainerScope as E}from"../../../files/browser/views/explorerView.js";const x=b.$;let h=class extends I{constructor(r,t,s,i,a){super();this.openerService=a;const g=this._register(s.get());this.tree=g.object,this.onDidFocus=this.tree.onDidFocus,this._register(this.tree.onDidOpen(n=>{n.element&&!("children"in n.element)&&this.openerService.open(n.element.uri)})),this._register(this.tree.onDidChangeCollapseState(()=>{this._onDidChangeHeight.fire()})),this._register(this.tree.onContextMenu(n=>{n.browserEvent.preventDefault(),n.browserEvent.stopPropagation()})),this.tree.setInput(r).then(()=>{g.isStale()||(this.tree.layout(),this._onDidChangeHeight.fire())}),this.domNode=this.tree.getHTMLElement().parentElement}domNode;_onDidChangeHeight=this._register(new D);onDidChangeHeight=this._onDidChangeHeight.event;onDidFocus;tree;domFocus(){this.tree.domFocus()}hasSameContent(r){return r.kind==="treeData"}addDisposable(r){this._register(r)}};h=c([l(4,P)],h);let m=class extends I{constructor(r,t,s,i){super();this._onDidChangeVisibility=r;this.instantiationService=t;this.configService=s;this.themeService=i;this._pool=this._register(new _(()=>this.treeFactory()))}_pool;get inUse(){return this._pool.inUse}treeFactory(){const r=this._register(this.instantiationService.createInstance(S,{onDidChangeVisibility:this._onDidChangeVisibility})),t=x(".interactive-response-progress-tree");return this._register(E(t,this.themeService)),this.instantiationService.createInstance(y,"ChatListRenderer",t,new d,new H,[new w(r,this.configService.getValue("explorer.decorations"))],new A,{collapseByDefault:()=>!1,expandOnlyOnTwistieClick:()=>!1,identityProvider:{getId:i=>i.uri.toString()},accessibilityProvider:{getAriaLabel:i=>i.label,getWidgetAriaLabel:()=>R("treeAriaLabel","File Tree")},alwaysConsumeMouseWheel:!1})}get(){const r=this._pool.get();let t=!1;return{object:r,isStale:()=>t,dispose:()=>{t=!0,this._pool.release(r)}}}};m=c([l(1,F),l(2,f),l(3,L)],m);class d{static ITEM_HEIGHT=22;getHeight(e){return d.ITEM_HEIGHT}getTemplateId(e){return"chatListTreeTemplate"}}class H{isIncompressible(e){return!e.children}}class w{constructor(e,r){this.labels=e;this.decorations=r}templateId="chatListTreeTemplate";renderCompressedElements(e,r,t,s){t.label.element.style.display="flex";const i=e.element.elements.map(a=>a.label);t.label.setResource({resource:e.element.elements[0].uri,name:i},{title:e.element.elements[0].label,fileKind:e.children?p.FOLDER:p.FILE,extraClasses:["explorer-item"],fileDecorations:this.decorations})}renderTemplate(e){const r=new u,t=r.add(this.labels.create(e,{supportHighlights:!0}));return{templateDisposables:r,label:t}}renderElement(e,r,t,s){t.label.element.style.display="flex",!e.children.length&&e.element.type!==v.Directory?t.label.setFile(e.element.uri,{fileKind:p.FILE,hidePath:!0,fileDecorations:this.decorations}):t.label.setResource({resource:e.element.uri,name:e.element.label},{title:e.element.label,fileKind:p.FOLDER,fileDecorations:this.decorations})}disposeTemplate(e){e.templateDisposables.dispose()}}class A{hasChildren(e){return!!e.children}async getChildren(e){return e.children??[]}}export{h as ChatTreeContentPart,m as TreePool};
