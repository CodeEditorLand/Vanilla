var $=Object.defineProperty;var B=Object.getOwnPropertyDescriptor;var A=(l,t,n,e)=>{for(var o=e>1?void 0:e?B(t,n):t,a=l.length-1,r;a>=0;a--)(r=l[a])&&(o=(e?r(t,n,o):r(o))||o);return e&&o&&$(t,n,o),o},x=(l,t)=>(n,e)=>t(n,e,l);import{MarkdownString as J}from"../../../base/common/htmlContent.js";import{Disposable as O}from"../../../base/common/lifecycle.js";import*as W from"../../../base/common/resources.js";import{isFalsyOrWhitespace as F}from"../../../base/common/strings.js";import{ThemeIcon as U}from"../../../base/common/themables.js";import{localize as i}from"../../../nls.js";import{ContextKeyExpr as G}from"../../../platform/contextkey/common/contextkey.js";import{ExtensionIdentifier as K,ExtensionIdentifierSet as j}from"../../../platform/extensions/common/extensions.js";import{SyncDescriptor as m}from"../../../platform/instantiation/common/descriptors.js";import{IInstantiationService as X}from"../../../platform/instantiation/common/instantiation.js";import{ILogService as Z}from"../../../platform/log/common/log.js";import{Registry as v}from"../../../platform/registry/common/platform.js";import{Extensions as Q}from"../../browser/panecomposite.js";import{CustomTreeView as Y,TreeViewPane as ee}from"../../browser/parts/views/treeView.js";import{ViewPaneContainer as ie}from"../../browser/parts/views/viewPaneContainer.js";import{WorkbenchPhase as te,registerWorkbenchContribution2 as ne}from"../../common/contributions.js";import{Extensions as f,ViewContainerLocation as C}from"../../common/views.js";import{VIEWLET_ID as q}from"../../contrib/debug/common/debug.js";import{VIEWLET_ID as I}from"../../contrib/files/common/files.js";import{VIEWLET_ID as E}from"../../contrib/remote/browser/remoteExplorer.js";import{VIEWLET_ID as L}from"../../contrib/scm/common/scm.js";import{WebviewViewPane as re}from"../../contrib/webviewView/browser/webviewViewPane.js";import{Extensions as M}from"../../services/extensionManagement/common/extensionFeatures.js";import{isProposedApiEnabled as z}from"../../services/extensions/common/extensions.js";import{ExtensionsRegistry as N}from"../../services/extensions/common/extensionsRegistry.js";const H={type:"object",properties:{id:{description:i({key:"vscode.extension.contributes.views.containers.id",comment:["Contribution refers to those that an extension contributes to VS Code through an extension/contribution point. "]},"Unique id used to identify the container in which views can be contributed using 'views' contribution point"),type:"string",pattern:"^[a-zA-Z0-9_-]+$"},title:{description:i("vscode.extension.contributes.views.containers.title","Human readable string used to render the container"),type:"string"},icon:{description:i("vscode.extension.contributes.views.containers.icon","Path to the container icon. Icons are 24x24 centered on a 50x40 block and have a fill color of 'rgb(215, 218, 224)' or '#d7dae0'. It is recommended that icons be in SVG, though any image file type is accepted."),type:"string"}},required:["id","title","icon"]},oe={description:i("vscode.extension.contributes.viewsContainers","Contributes views containers to the editor"),type:"object",properties:{activitybar:{description:i("views.container.activitybar","Contribute views containers to Activity Bar"),type:"array",items:H},panel:{description:i("views.container.panel","Contribute views containers to Panel"),type:"array",items:H}}};var se=(n=>(n.Tree="tree",n.Webview="webview",n))(se||{}),T=(e=>(e.Visible="visible",e.Hidden="hidden",e.Collapsed="collapsed",e))(T||{});const g={type:"object",required:["id","name"],defaultSnippets:[{body:{id:"${1:id}",name:"${2:name}"}}],properties:{type:{markdownDescription:i("vscode.extension.contributes.view.type","Type of the view. This can either be `tree` for a tree view based view or `webview` for a webview based view. The default is `tree`."),type:"string",enum:["tree","webview"],markdownEnumDescriptions:[i("vscode.extension.contributes.view.tree","The view is backed by a `TreeView` created by `createTreeView`."),i("vscode.extension.contributes.view.webview","The view is backed by a `WebviewView` registered by `registerWebviewViewProvider`.")]},id:{markdownDescription:i("vscode.extension.contributes.view.id","Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`."),type:"string"},name:{description:i("vscode.extension.contributes.view.name","The human-readable name of the view. Will be shown"),type:"string"},when:{description:i("vscode.extension.contributes.view.when","Condition which must be true to show this view"),type:"string"},icon:{description:i("vscode.extension.contributes.view.icon","Path to the view icon. View icons are displayed when the name of the view cannot be shown. It is recommended that icons be in SVG, though any image file type is accepted."),type:"string"},contextualTitle:{description:i("vscode.extension.contributes.view.contextualTitle","Human-readable context for when the view is moved out of its original location. By default, the view's container name will be used."),type:"string"},visibility:{description:i("vscode.extension.contributes.view.initialState","Initial state of the view when the extension is first installed. Once the user has changed the view state by collapsing, moving, or hiding the view, the initial state will not be used again."),type:"string",enum:["visible","hidden","collapsed"],default:"visible",enumDescriptions:[i("vscode.extension.contributes.view.initialState.visible","The default initial state for the view. In most containers the view will be expanded, however; some built-in containers (explorer, scm, and debug) show all contributed views collapsed regardless of the `visibility`."),i("vscode.extension.contributes.view.initialState.hidden","The view will not be shown in the view container, but will be discoverable through the views menu and other view entry points and can be un-hidden by the user."),i("vscode.extension.contributes.view.initialState.collapsed","The view will show in the view container, but will be collapsed.")]},initialSize:{type:"number",description:i("vscode.extension.contributs.view.size","The initial size of the view. The size will behave like the css 'flex' property, and will set the initial size when the view is first shown. In the side bar, this is the height of the view. This value is only respected when the same extension owns both the view and the view container.")},accessibilityHelpContent:{type:"string",markdownDescription:i("vscode.extension.contributes.view.accessibilityHelpContent","When the accessibility help dialog is invoked in this view, this content will be presented to the user as a markdown string. Keybindings will be resolved when provided in the format of <keybinding:commandId>. If there is no keybinding, that will be indicated and this command will be included in a quickpick for easy configuration.")}}},ae={type:"object",required:["id","name"],properties:{id:{description:i("vscode.extension.contributes.view.id","Identifier of the view. This should be unique across all views. It is recommended to include your extension id as part of the view id. Use this to register a data provider through `vscode.window.registerTreeDataProviderForView` API. Also to trigger activating your extension by registering `onView:${id}` event to `activationEvents`."),type:"string"},name:{description:i("vscode.extension.contributes.view.name","The human-readable name of the view. Will be shown"),type:"string"},when:{description:i("vscode.extension.contributes.view.when","Condition which must be true to show this view"),type:"string"},group:{description:i("vscode.extension.contributes.view.group","Nested group in the viewlet"),type:"string"},remoteName:{description:i("vscode.extension.contributes.view.remoteName","The name of the remote type associated with this view"),type:["string","array"],items:{type:"string"}}}},ce={description:i("vscode.extension.contributes.views","Contributes views to the editor"),type:"object",properties:{explorer:{description:i("views.explorer","Contributes views to Explorer container in the Activity bar"),type:"array",items:g,default:[]},debug:{description:i("views.debug","Contributes views to Debug container in the Activity bar"),type:"array",items:g,default:[]},scm:{description:i("views.scm","Contributes views to SCM container in the Activity bar"),type:"array",items:g,default:[]},test:{description:i("views.test","Contributes views to Test container in the Activity bar"),type:"array",items:g,default:[]},remote:{description:i("views.remote","Contributes views to Remote container in the Activity bar. To contribute to this container, enableProposedApi needs to be turned on"),type:"array",items:ae,default:[]}},additionalProperties:{description:i("views.contributed","Contributes views to contributed views container"),type:"array",items:g,default:[]}},_=N.registerExtensionPoint({extensionPoint:"viewsContainers",jsonSchema:oe}),de=N.registerExtensionPoint({extensionPoint:"views",deps:[_],jsonSchema:ce,activationEventsGenerator:(l,t)=>{for(const n of l)for(const e of Object.values(n))for(const o of e)o.id&&t.push(`onView:${o.id}`)}}),we=7;let h=class{constructor(t,n){this.instantiationService=t;this.logService=n;this.viewContainersRegistry=v.as(f.ViewContainersRegistry),this.viewsRegistry=v.as(f.ViewsRegistry),this.handleAndRegisterCustomViewContainers(),this.handleAndRegisterCustomViews()}static ID="workbench.contrib.viewsExtensionHandler";viewContainersRegistry;viewsRegistry;handleAndRegisterCustomViewContainers(){_.setHandler((t,{added:n,removed:e})=>{e.length&&this.removeCustomViewContainers(e),n.length&&this.addCustomViewContainers(n,this.viewContainersRegistry.all)})}addCustomViewContainers(t,n){const e=v.as(f.ViewContainersRegistry);let o=we+e.all.filter(r=>!!r.extensionId&&e.getViewContainerLocation(r)===C.Sidebar).length,a=5+e.all.filter(r=>!!r.extensionId&&e.getViewContainerLocation(r)===C.Panel).length+1;for(const{value:r,collector:c,description:w}of t)Object.entries(r).forEach(([d,p])=>{if(this.isValidViewsContainer(p,c))switch(d){case"activitybar":o=this.registerCustomViewContainers(p,w,o,n,C.Sidebar);break;case"panel":a=this.registerCustomViewContainers(p,w,a,n,C.Panel);break}})}removeCustomViewContainers(t){const n=v.as(f.ViewContainersRegistry),e=t.reduce((o,a)=>(o.add(a.description.identifier),o),new j);for(const o of n.all)if(o.extensionId&&e.has(o.extensionId)){const a=this.viewsRegistry.getViews(o);a.length&&this.viewsRegistry.moveViews(a,this.getDefaultViewContainer()),this.deregisterCustomViewContainer(o)}}isValidViewsContainer(t,n){if(!Array.isArray(t))return n.error(i("viewcontainer requirearray","views containers must be an array")),!1;for(const e of t){if(typeof e.id!="string"&&F(e.id))return n.error(i("requireidstring","property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.","id")),!1;if(!/^[a-z0-9_-]+$/i.test(e.id))return n.error(i("requireidstring","property `{0}` is mandatory and must be of type `string` with non-empty value. Only alphanumeric characters, '_', and '-' are allowed.","id")),!1;if(typeof e.title!="string")return n.error(i("requirestring","property `{0}` is mandatory and must be of type `string`","title")),!1;if(typeof e.icon!="string")return n.error(i("requirestring","property `{0}` is mandatory and must be of type `string`","icon")),!1;if(F(e.title))return n.warn(i("requirenonemptystring","property `{0}` is mandatory and must be of type `string` with non-empty value","title")),!0}return!0}registerCustomViewContainers(t,n,e,o,a){return t.forEach(r=>{const w=U.fromString(r.icon)||W.joinPath(n.extensionLocation,r.icon),d=`workbench.view.extension.${r.id}`,p=r.title||d,y=this.registerCustomViewContainer(d,p,w,e++,n.identifier,a);if(o.length){const u=[];for(const s of o)y!==s&&u.push(...this.viewsRegistry.getViews(s).filter(V=>V.originalContainerId===r.id));u.length&&this.viewsRegistry.moveViews(u,y)}}),e}registerCustomViewContainer(t,n,e,o,a,r){let c=this.viewContainersRegistry.get(t);return c||(c=this.viewContainersRegistry.registerViewContainer({id:t,title:{value:n,original:n},extensionId:a,ctorDescriptor:new m(ie,[t,{mergeViewWithContainerWhenSingleView:!0}]),hideIfEmpty:!0,order:o,icon:e},r)),c}deregisterCustomViewContainer(t){this.viewContainersRegistry.deregisterViewContainer(t),v.as(Q.Viewlets).deregisterPaneComposite(t.id)}handleAndRegisterCustomViews(){de.setHandler((t,{added:n,removed:e})=>{e.length&&this.removeViews(e),n.length&&this.addViews(n)})}addViews(t){const n=new Set,e=[];for(const o of t){const{value:a,collector:r}=o;Object.entries(a).forEach(([c,w])=>{if(!this.isValidViewDescriptors(w,r))return;if(c==="remote"&&!z(o.description,"contribViewsRemote")){r.warn(i("ViewContainerRequiresProposedAPI",`View container '{0}' requires 'enabledApiProposals: ["contribViewsRemote"]' to be added to 'Remote'.`,c));return}const d=this.getViewContainer(c);d||r.warn(i("ViewContainerDoesnotExist","View container '{0}' does not exist and all views registered to it will be added to 'Explorer'.",c));const p=d||this.getDefaultViewContainer(),y=[];for(let u=0;u<w.length;u++){const s=w[u];if(n.has(s.id)){r.error(i("duplicateView1","Cannot register multiple views with same id `{0}`",s.id));continue}if(this.viewsRegistry.getView(s.id)!==null){r.error(i("duplicateView2","A view with id `{0}` is already registered.",s.id));continue}const V=K.equals(o.description.identifier,p.extensionId)?u+1:p.viewOrderDelegate?p.viewOrderDelegate.getOrder(s.group):void 0;let R;typeof s.icon=="string"&&(R=U.fromString(s.icon)||W.joinPath(o.description.extensionLocation,s.icon));const D=this.convertInitialVisibility(s.visibility),b=this.getViewType(s.type);if(!b){r.error(i("unknownViewType","Unknown view type `{0}`.",s.type));continue}let S;typeof s.initialSize=="number"&&(p.extensionId?.value===o.description.identifier.value?S=s.initialSize:this.logService.warn(`${o.description.identifier.value} tried to set the view size of ${s.id} but it was ignored because the view container does not belong to it.`));let P;z(o.description,"contribAccessibilityHelpContent")&&s.accessibilityHelpContent&&(P=new J(s.accessibilityHelpContent));const k={type:b,ctorDescriptor:b==="tree"?new m(ee):new m(re),id:s.id,name:{value:s.name,original:s.name},when:G.deserialize(s.when),containerIcon:R||d?.icon,containerTitle:s.contextualTitle||d&&(typeof d.title=="string"?d.title:d.title.value),canToggleVisibility:!0,canMoveView:d?.id!==E,treeView:b==="tree"?this.instantiationService.createInstance(Y,s.id,s.name,o.description.identifier.value):void 0,collapsed:this.showCollapsed(p)||D==="collapsed",order:V,extensionId:o.description.identifier,originalContainerId:c,group:s.group,remoteAuthority:s.remoteName||s.remoteAuthority,virtualWorkspace:s.virtualWorkspace,hideByDefault:D==="hidden",workspace:d?.id===E?!0:void 0,weight:S,accessibilityHelpContent:P};n.add(k.id),y.push(k)}e.push({viewContainer:p,views:y})})}this.viewsRegistry.registerViews2(e)}getViewType(t){if(t==="webview")return"webview";if(!t||t==="tree")return"tree"}getDefaultViewContainer(){return this.viewContainersRegistry.get(I)}removeViews(t){const n=t.reduce((e,o)=>(e.add(o.description.identifier),e),new j);for(const e of this.viewContainersRegistry.all){const o=this.viewsRegistry.getViews(e).filter(a=>a.extensionId&&n.has(a.extensionId));if(o.length){this.viewsRegistry.deregisterViews(o,e);for(const a of o){const r=a;r.treeView&&r.treeView.dispose()}}}}convertInitialVisibility(t){if(Object.values(T).includes(t))return t}isValidViewDescriptors(t,n){if(!Array.isArray(t))return n.error(i("requirearray","views must be an array")),!1;for(const e of t){if(typeof e.id!="string")return n.error(i("requirestring","property `{0}` is mandatory and must be of type `string`","id")),!1;if(typeof e.name!="string")return n.error(i("requirestring","property `{0}` is mandatory and must be of type `string`","name")),!1;if(e.when&&typeof e.when!="string")return n.error(i("optstring","property `{0}` can be omitted or must be of type `string`","when")),!1;if(e.icon&&typeof e.icon!="string")return n.error(i("optstring","property `{0}` can be omitted or must be of type `string`","icon")),!1;if(e.contextualTitle&&typeof e.contextualTitle!="string")return n.error(i("optstring","property `{0}` can be omitted or must be of type `string`","contextualTitle")),!1;if(e.visibility&&!this.convertInitialVisibility(e.visibility))return n.error(i("optenum","property `{0}` can be omitted or must be one of {1}","visibility",Object.values(T).join(", "))),!1}return!0}getViewContainer(t){switch(t){case"explorer":return this.viewContainersRegistry.get(I);case"debug":return this.viewContainersRegistry.get(q);case"scm":return this.viewContainersRegistry.get(L);case"remote":return this.viewContainersRegistry.get(E);default:return this.viewContainersRegistry.get(`workbench.view.extension.${t}`)}}showCollapsed(t){switch(t.id){case I:case L:case q:return!0}return!1}};h=A([x(0,X),x(1,Z)],h);class pe extends O{type="table";shouldRender(t){return!!t.contributes?.viewsContainers}render(t){const n=t.contributes?.viewsContainers||{},e=Object.keys(n).reduce((r,c)=>{const w=n[c];return r.push(...w.map(d=>({...d,location:c}))),r},[]);if(!e.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const o=[i("view container id","ID"),i("view container title","Title"),i("view container location","Where")],a=e.sort((r,c)=>r.id.localeCompare(c.id)).map(r=>[r.id,r.title,r.location]);return{data:{headers:o,rows:a},dispose:()=>{}}}}class le extends O{type="table";shouldRender(t){return!!t.contributes?.views}render(t){const n=t.contributes?.views||{},e=Object.keys(n).reduce((r,c)=>{const w=n[c];return r.push(...w.map(d=>({...d,location:c}))),r},[]);if(!e.length)return{data:{headers:[],rows:[]},dispose:()=>{}};const o=[i("view id","ID"),i("view name title","Name"),i("view container location","Where")],a=e.sort((r,c)=>r.id.localeCompare(c.id)).map(r=>[r.id,r.name,r.location]);return{data:{headers:o,rows:a},dispose:()=>{}}}}v.as(M.ExtensionFeaturesRegistry).registerExtensionFeature({id:"viewsContainers",label:i("viewsContainers","View Containers"),access:{canToggle:!1},renderer:new m(pe)}),v.as(M.ExtensionFeaturesRegistry).registerExtensionFeature({id:"views",label:i("views","Views"),access:{canToggle:!1},renderer:new m(le)}),ne(h.ID,h,te.BlockStartup);export{oe as viewsContainersContribution};
