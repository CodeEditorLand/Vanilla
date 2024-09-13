var G=Object.defineProperty;var $=Object.getOwnPropertyDescriptor;var T=(d,c,t,e)=>{for(var n=e>1?void 0:e?$(c,t):c,o=d.length-1,i;o>=0;o--)(i=d[o])&&(n=(e?i(c,t,n):i(n))||n);return e&&n&&G(c,t,n),n},h=(d,c)=>(t,e)=>c(t,e,d);import{groupBy as F}from"../../../../../base/common/arrays.js";import{createCancelablePromise as U}from"../../../../../base/common/async.js";import{CancellationToken as z}from"../../../../../base/common/cancellation.js";import{Codicon as D}from"../../../../../base/common/codicons.js";import{Event as v}from"../../../../../base/common/event.js";import{DisposableStore as w}from"../../../../../base/common/lifecycle.js";import{MarshalledId as X}from"../../../../../base/common/marshallingIds.js";import{uppercaseFirstLetter as J}from"../../../../../base/common/strings.js";import{ThemeIcon as b}from"../../../../../base/common/themables.js";import{URI as R}from"../../../../../base/common/uri.js";import{localize as m}from"../../../../../nls.js";import{ICommandService as V}from"../../../../../platform/commands/common/commands.js";import{ILabelService as Y}from"../../../../../platform/label/common/label.js";import{ILogService as Z}from"../../../../../platform/log/common/log.js";import{IOpenerService as ee}from"../../../../../platform/opener/common/opener.js";import{IProductService as te}from"../../../../../platform/product/common/productService.js";import{ProgressLocation as ne}from"../../../../../platform/progress/common/progress.js";import{IQuickInputService as ie}from"../../../../../platform/quickinput/common/quickInput.js";import{EnablementState as I}from"../../../../services/extensionManagement/common/extensionManagement.js";import{IExtensionService as oe}from"../../../../services/extensions/common/extensions.js";import{IExtensionsWorkbenchService as re}from"../../../extensions/common/extensions.js";import{INotebookKernelHistoryService as ce,INotebookKernelService as se}from"../../common/notebookKernelService.js";import{SELECT_KERNEL_ID as le}from"../controller/coreActions.js";import{JUPYTER_EXTENSION_ID as ae,KERNEL_RECOMMENDATIONS as ue}from"../notebookBrowser.js";import{executingStateIcon as L,selectKernelIcon as M}from"../notebookIcons.js";function K(d){return"kernel"in d}function de(d){return"kernels"in d}function y(d){return"action"in d}function q(d){return d.id==="installSuggested"&&"extensionIds"in d}function B(d){return d.id==="install"}function W(d){return"command"in d}function ke(d){return"autoRun"in d&&!!d.autoRun}const j=200;function A(d,c){const t={kernel:d,picked:d.id===c?.id,label:d.label,description:d.description,detail:d.detail};return d.id===c?.id&&(t.description?t.description=m("current2","{0} - Currently Selected",t.description):t.description=m("current1","Currently Selected")),t}class me{constructor(c,t,e,n,o,i,a,s){this._notebookKernelService=c;this._productService=t;this._quickInputService=e;this._labelService=n;this._logService=o;this._extensionWorkbenchService=i;this._extensionService=a;this._commandService=s}async showQuickPick(c,t,e){const n=c.textModel,o=c.scopedContextKeyService,i=this._getMatchingResult(n),{selected:a,all:s}=i;let l;if(t){for(const k of s)if(k.id===t){l=k;break}if(!l)return this._logService.warn(`wanted kernel DOES NOT EXIST, wanted: ${t}, all: ${s.map(k=>k.id)}`),!1}if(l)return this._selecteKernel(n,l),!0;const r=new w,u=r.add(this._quickInputService.createQuickPick({useSeparators:!0})),p=this._getKernelPickerQuickPickItems(n,i,this._notebookKernelService,o);if(p.length===1&&ke(p[0])&&!e){const k=await this._handleQuickPick(c,p[0],p);return r.dispose(),k}u.items=p,u.canSelectMany=!1,u.placeholder=a?m("prompt.placeholder.change","Change kernel for '{0}'",this._labelService.getUriLabel(n.uri,{relative:!0})):m("prompt.placeholder.select","Select kernel for '{0}'",this._labelService.getUriLabel(n.uri,{relative:!0})),u.busy=this._notebookKernelService.getKernelDetectionTasks(n).length>0;const _=this._notebookKernelService.onDidChangeKernelDetectionTasks(()=>{u.busy=this._notebookKernelService.getKernelDetectionTasks(n).length>0}),H=p.length===0?U(k=>this._showInstallKernelExtensionRecommendation(n,u,this._extensionWorkbenchService,k)):void 0,O=v.debounce(v.any(this._notebookKernelService.onDidChangeSourceActions,this._notebookKernelService.onDidAddKernel,this._notebookKernelService.onDidRemoveKernel,this._notebookKernelService.onDidChangeNotebookAffinity),(k,E)=>k,j)(async()=>{u.busy=!1,H?.cancel();const k=u.activeItems,E=this._getMatchingResult(n),g=this._getKernelPickerQuickPickItems(n,E,this._notebookKernelService,o);u.keepScrollPosition=!0;const N=[];for(const S of k)if(K(S)){const P=S.kernel.id,f=g.find(C=>K(C)&&C.kernel.id===P);f&&N.push(f)}else if(y(S)){const P=g.find(f=>y(f)&&f.action.action.id===S.action.action.id);P&&N.push(P)}u.items=g,u.activeItems=N},this),Q=await new Promise((k,E)=>{r.add(u.onDidAccept(()=>{const g=u.selectedItems[0];k(g?{selected:g,items:u.items}:{selected:void 0,items:u.items}),u.hide()})),r.add(u.onDidHide(()=>{_.dispose(),O.dispose(),u.dispose(),k({selected:void 0,items:u.items})})),u.show()});return r.dispose(),Q.selected?await this._handleQuickPick(c,Q.selected,Q.items):!1}_getMatchingResult(c){return this._notebookKernelService.getMatchingKernel(c)}async _handleQuickPick(c,t,e){if(K(t)){const n=t.kernel;return this._selecteKernel(c.textModel,n),!0}return B(t)?await this._showKernelExtension(this._extensionWorkbenchService,this._extensionService,c.textModel.viewType,[]):q(t)?await this._showKernelExtension(this._extensionWorkbenchService,this._extensionService,c.textModel.viewType,t.extensionIds,this._productService.quality!=="stable"):y(t)&&t.action.runAction(),!0}_selecteKernel(c,t){this._notebookKernelService.selectKernelForNotebook(t,c)}async _showKernelExtension(c,t,e,n,o){const i=[],a=[];for(const l of n){const r=(await c.getExtensions([{id:l}],z.None))[0];r.enablementState===I.DisabledGlobally||r.enablementState===I.DisabledWorkspace||r.enablementState===I.DisabledByEnvironment?a.push(r):await c.canInstall(r)&&i.push(r)}if(i.length||a.length){await Promise.all([...i.map(async l=>{await c.install(l,{installPreReleaseVersion:o??!1,context:{skipWalkthrough:!0}},ne.Notification)}),...a.map(async l=>{switch(l.enablementState){case I.DisabledWorkspace:await c.setEnablement([l],I.EnabledWorkspace);return;case I.DisabledGlobally:await c.setEnablement([l],I.EnabledGlobally);return;case I.DisabledByEnvironment:await c.setEnablement([l],I.EnabledByEnvironment);return;default:break}})]),await t.activateByEvent(`onNotebook:${e}`);return}const s=e.split(/[^a-z0-9]/gi).map(J).join("");await c.openSearch(`@tag:notebookKernel${s}`)}async _showInstallKernelExtensionRecommendation(c,t,e,n){t.busy=!0;const o=await this._getKernelRecommendationsQuickPickItems(c,e);t.busy=!1,!n.isCancellationRequested&&o&&t.items.length===0&&(t.items=o)}async _getKernelRecommendationsQuickPickItems(c,t){const e=[],n=this.getSuggestedLanguage(c),o=n?this.getSuggestedKernelFromLanguage(c.viewType,n):void 0;if(o){if(await t.queryLocal(),t.installed.filter(a=>(a.enablementState===I.EnabledByEnvironment||a.enablementState===I.EnabledGlobally||a.enablementState===I.EnabledWorkspace)&&o.extensionIds.includes(a.identifier.id)).length===o.extensionIds.length)return;e.push({id:"installSuggested",description:o.displayName??o.extensionIds.join(", "),label:`$(${D.lightbulb.id}) `+m("installSuggestedKernel","Install/Enable suggested extensions"),extensionIds:o.extensionIds})}return e.push({id:"install",label:m("searchForKernels","Browse marketplace for kernel extensions")}),e}getSuggestedLanguage(c){let e=c.metadata?.metadata?.language_info?.name;if(!e){const n=c.cells.map(o=>o.language).filter(o=>o!=="markdown");if(n.length>1){const o=n[0];n.every(i=>i===o)&&(e=o)}}return e}getSuggestedKernelFromLanguage(c,t){return ue.get(c)?.get(t)}}let x=class extends me{constructor(t,e,n,o,i,a,s,l,r,u){super(t,e,n,o,i,a,s,l);this._notebookKernelHistoryService=r;this._openerService=u}_getKernelPickerQuickPickItems(t,e,n,o){const i=[];if(e.selected){const s=A(e.selected,e.selected);i.push(s)}e.suggestions.filter(s=>s.id!==e.selected?.id).map(s=>A(s,e.selected)).forEach(s=>{i.push(s)});const a=i.length===0;return i.length>0&&i.push({type:"separator"}),i.push({id:"selectAnother",label:m("selectAnotherKernel.more","Select Another Kernel..."),autoRun:a}),i}_selecteKernel(t,e){const n=this._notebookKernelService.getMatchingKernel(t);n.selected&&this._notebookKernelHistoryService.addMostRecentKernel(n.selected),super._selecteKernel(t,e),this._notebookKernelHistoryService.addMostRecentKernel(e)}_getMatchingResult(t){const{selected:e,all:n}=this._notebookKernelHistoryService.getKernels(t),o=this._notebookKernelService.getMatchingKernel(t);return{selected:e,all:o.all,suggestions:n,hidden:[]}}async _handleQuickPick(t,e,n){return e.id==="selectAnother"?this.displaySelectAnotherQuickPick(t,n.length===1&&n[0]===e):super._handleQuickPick(t,e,n)}async displaySelectAnotherQuickPick(t,e){const n=t.textModel,o=new w,i=o.add(this._quickInputService.createQuickPick({useSeparators:!0})),a=await new Promise(s=>{i.title=e?m("select","Select Kernel"):m("selectAnotherKernel","Select Another Kernel"),i.placeholder=m("selectKernel.placeholder","Type to choose a kernel source"),i.busy=!0,i.buttons=[this._quickInputService.backButton],i.show(),o.add(i.onDidTriggerButton(l=>{l===this._quickInputService.backButton&&s(l)})),o.add(i.onDidTriggerItemButton(async l=>{if(W(l.item)&&l.item.documentation!==void 0){const r=R.isUri(l.item.documentation)?R.parse(l.item.documentation):await this._commandService.executeCommand(l.item.documentation);this._openerService.open(r,{openExternal:!0})}})),o.add(i.onDidAccept(async()=>{s(i.selectedItems[0])})),o.add(i.onDidHide(()=>{s(void 0)})),this._calculdateKernelSources(t).then(l=>{i.items=l,i.items.length>0&&(i.busy=!1)}),o.add(v.debounce(v.any(this._notebookKernelService.onDidChangeSourceActions,this._notebookKernelService.onDidAddKernel,this._notebookKernelService.onDidRemoveKernel),(l,r)=>l,j)(async()=>{i.busy=!0;const l=await this._calculdateKernelSources(t);i.items=l,i.busy=!1}))});if(i.hide(),o.dispose(),a===this._quickInputService.backButton)return this.showQuickPick(t,void 0,!0);if(a){const s=a;if(W(s))try{const l=await this._executeCommand(n,s.command);if(l){const{all:r}=await this._getMatchingResult(n),u=r.find(p=>p.id===`ms-toolsai.jupyter/${l}`);return u&&await this._selecteKernel(n,u),!0}else return this.displaySelectAnotherQuickPick(t,!1)}catch{return!1}else{if(K(s))return await this._selecteKernel(n,s.kernel),!0;if(de(s))return await this._selectOneKernel(n,s.label,s.kernels),!0;if(y(s))try{return await s.action.runAction(),!0}catch{return!1}else{if(B(s))return await this._showKernelExtension(this._extensionWorkbenchService,this._extensionService,t.textModel.viewType,[]),!0;if(q(s))return await this._showKernelExtension(this._extensionWorkbenchService,this._extensionService,t.textModel.viewType,s.extensionIds,this._productService.quality!=="stable"),this.displaySelectAnotherQuickPick(t,!1)}}}return!1}async _calculdateKernelSources(t){const e=t.textModel,n=this._notebookKernelService.getSourceActions(e,t.scopedContextKeyService),o=await this._notebookKernelService.getKernelSourceActions2(e),i=this._getMatchingResult(e);if(n.length===0&&i.all.length===0&&o.length===0)return await this._getKernelRecommendationsQuickPickItems(e,this._extensionWorkbenchService)??[];const a=i.all.filter(r=>r.extension.value!==ae),s=[];for(const r of F(a,(u,p)=>u.extension.value===p.extension.value?0:1)){const u=this._extensionService.extensions.find(_=>_.identifier.value===r[0].extension.value),p=u?.displayName??u?.description??r[0].extension.value;r.length>1?s.push({label:p,kernels:r}):s.push({label:r[0].label,kernel:r[0]})}const l=o.filter(r=>r.command);s.push(...l.map(r=>{const u=r.documentation?[{iconClass:b.asClassName(D.info),tooltip:m("learnMoreTooltip","Learn More")}]:[];return{id:typeof r.command=="string"?r.command:r.command.id,label:r.label,description:r.description,command:r.command,documentation:r.documentation,buttons:u}}));for(const r of n){const u={action:r,picked:!1,label:r.action.label,tooltip:r.action.tooltip};s.push(u)}return s}async _selectOneKernel(t,e,n){const o=n.map(s=>A(s,void 0)),i=new w,a=i.add(this._quickInputService.createQuickPick({useSeparators:!0}));a.items=o,a.canSelectMany=!1,a.title=m("selectKernelFromExtension","Select Kernel from {0}",e),i.add(a.onDidAccept(async()=>{a.selectedItems&&a.selectedItems.length>0&&K(a.selectedItems[0])&&await this._selecteKernel(t,a.selectedItems[0].kernel),a.hide(),a.dispose()})),i.add(a.onDidHide(()=>{i.dispose()})),a.show()}async _executeCommand(t,e){const n=typeof e=="string"?e:e.id,o=typeof e=="string"?[]:e.arguments??[];return(typeof e=="string"||!e.arguments||!Array.isArray(e.arguments)||e.arguments.length===0)&&o.unshift({uri:t.uri,$mid:X.NotebookActionContext}),typeof e=="string"?this._commandService.executeCommand(n):this._commandService.executeCommand(n,...o)}static updateKernelStatusAction(t,e,n,o){if(n.getKernelDetectionTasks(t).length){const r=n.getMatchingKernel(t);if(e.enabled=!0,e.class=b.asClassName(b.modify(L,"spin")),r.selected){e.label=r.selected.label;const u=r.selected.description??r.selected.detail;e.tooltip=u?m("kernels.selectedKernelAndKernelDetectionRunning","Selected Kernel: {0} (Kernel Detection Tasks Running)",u):m("kernels.detecting","Detecting Kernels")}else e.label=m("kernels.detecting","Detecting Kernels");return}const a=n.getRunningSourceActions(t),s=(r,u)=>{const p=r.action;e.class=u?b.asClassName(b.modify(L,"spin")):b.asClassName(M),e.label=p.label,e.enabled=!0};if(a.length)return s(a[0],!0);const{selected:l}=o.getKernels(t);l?(e.label=l.label,e.class=b.asClassName(M),e.tooltip=l.description??l.detail??""):(e.label=m("select","Select Kernel"),e.class=b.asClassName(M),e.tooltip="")}static async resolveKernel(t,e,n,o){const i=n.getKernels(t);if(i.selected)return i.selected;await o.executeCommand(le);const{selected:a}=n.getKernels(t);return a}};x=T([h(0,se),h(1,te),h(2,ie),h(3,Y),h(4,Z),h(5,re),h(6,oe),h(7,V),h(8,ce),h(9,ee)],x);export{x as KernelPickerMRUStrategy};
