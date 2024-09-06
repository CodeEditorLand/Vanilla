var g=Object.defineProperty;var h=Object.getOwnPropertyDescriptor;var p=(i,e,n,r)=>{for(var t=r>1?void 0:r?h(e,n):e,l=i.length-1,u;l>=0;l--)(u=i[l])&&(t=(r?u(e,n,t):u(t))||t);return r&&t&&g(e,n,t),t},s=(i,e)=>(n,r)=>e(n,r,i);import{Emitter as d}from"../../../../base/common/event.js";import"../../../../base/common/jsonSchema.js";import"../../../../base/common/lifecycle.js";import"../../../../base/common/uri.js";import*as o from"../../../../nls.js";import"../../../../platform/extensions/common/extensions.js";import{InstantiationType as T,registerSingleton as f}from"../../../../platform/instantiation/common/extensions.js";import{createDecorator as E,IInstantiationService as b}from"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/remote/common/remoteAuthorityResolver.js";import{IStorageService as P,StorageScope as m,StorageTarget as c}from"../../../../platform/storage/common/storage.js";import{ITunnelService as _}from"../../../../platform/tunnel/common/tunnel.js";import"../../../common/views.js";import{ExtensionsRegistry as v}from"../../extensions/common/extensionsRegistry.js";import{TunnelModel as y}from"./tunnelModel.js";const S=E("remoteExplorerService"),I="remote.explorerType",ae="~remote.forwardedPorts",se="~remote.forwardedPortsContainer",de="remote.autoForwardPorts",le="remote.autoForwardPortsSource",ue="remote.autoForwardPortsFallback",pe="process",me="output",ce="hybrid";var C=(t=>(t.Candidate="Candidate",t.Detected="Detected",t.Forwarded="Forwarded",t.Add="Add",t))(C||{}),D=(t=>(t[t.None=0]="None",t[t.New=1]="New",t[t.Label=2]="Label",t[t.LocalPort=3]="LocalPort",t))(D||{});const x={type:"object",required:["id"],properties:{id:{description:o.localize("getStartedWalkthrough.id","The ID of a Get Started walkthrough to open."),type:"string"}}},R=v.registerExtensionPoint({extensionPoint:"remoteHelp",jsonSchema:{description:o.localize("RemoteHelpInformationExtPoint","Contributes help information for Remote"),type:"object",properties:{getStarted:{description:o.localize("RemoteHelpInformationExtPoint.getStarted","The url, or a command that returns the url, to your project's Getting Started page, or a walkthrough ID contributed by your project's extension"),oneOf:[{type:"string"},x]},documentation:{description:o.localize("RemoteHelpInformationExtPoint.documentation","The url, or a command that returns the url, to your project's documentation page"),type:"string"},feedback:{description:o.localize("RemoteHelpInformationExtPoint.feedback","The url, or a command that returns the url, to your project's feedback reporter"),type:"string",markdownDeprecationMessage:o.localize("RemoteHelpInformationExtPoint.feedback.deprecated","Use {0} instead","`reportIssue`")},reportIssue:{description:o.localize("RemoteHelpInformationExtPoint.reportIssue","The url, or a command that returns the url, to your project's issue reporter"),type:"string"},issues:{description:o.localize("RemoteHelpInformationExtPoint.issues","The url, or a command that returns the url, to your project's issues list"),type:"string"}}}});let a=class{constructor(e,n,r){this.storageService=e;this.tunnelService=n;this._tunnelModel=r.createInstance(y),R.setHandler(t=>{this._helpInformation.push(...t),this._onDidChangeHelpInformation.fire(t)})}_serviceBrand;_targetType=[];_onDidChangeTargetType=new d;onDidChangeTargetType=this._onDidChangeTargetType.event;_onDidChangeHelpInformation=new d;onDidChangeHelpInformation=this._onDidChangeHelpInformation.event;_helpInformation=[];_tunnelModel;_editable;_onDidChangeEditable=new d;onDidChangeEditable=this._onDidChangeEditable.event;_onEnabledPortsFeatures=new d;onEnabledPortsFeatures=this._onEnabledPortsFeatures.event;_portsFeaturesEnabled=!1;namedProcesses=new Map;get helpInformation(){return this._helpInformation}set targetType(e){const n=this._targetType.length>0?this._targetType[0]:"",r=e.length>0?e[0]:"";n!==r&&(this._targetType=e,this.storageService.store(I,this._targetType.toString(),m.WORKSPACE,c.MACHINE),this.storageService.store(I,this._targetType.toString(),m.PROFILE,c.USER),this._onDidChangeTargetType.fire(this._targetType))}get targetType(){return this._targetType}get tunnelModel(){return this._tunnelModel}forward(e,n){return this.tunnelModel.forward(e,n)}close(e,n){return this.tunnelModel.close(e.host,e.port,n)}setTunnelInformation(e){e?.features&&this.tunnelService.setTunnelFeatures(e.features),this.tunnelModel.addEnvironmentTunnels(e?.environmentTunnels)}setEditable(e,n,r){r?this._editable={tunnelItem:e,data:r,editId:n}:this._editable=void 0,this._onDidChangeEditable.fire(e?{tunnel:e,editId:n}:void 0)}getEditableData(e,n){return this._editable&&(!e&&e===this._editable.tunnelItem||e&&this._editable.tunnelItem?.remotePort===e.remotePort&&this._editable.tunnelItem.remoteHost===e.remoteHost&&this._editable.editId===n)?this._editable.data:void 0}setCandidateFilter(e){return e?(this.tunnelModel.setCandidateFilter(e),{dispose:()=>{this.tunnelModel.setCandidateFilter(void 0)}}):{dispose:()=>{}}}onFoundNewCandidates(e){this.tunnelModel.setCandidates(e)}restore(){return this.tunnelModel.restoreForwarded()}enablePortsFeatures(){this._portsFeaturesEnabled=!0,this._onEnabledPortsFeatures.fire()}get portsFeaturesEnabled(){return this._portsFeaturesEnabled}};a=p([s(0,P),s(1,_),s(2,b)],a),f(S,a,T.Delayed);export{S as IRemoteExplorerService,ue as PORT_AUTO_FALLBACK_SETTING,de as PORT_AUTO_FORWARD_SETTING,le as PORT_AUTO_SOURCE_SETTING,ce as PORT_AUTO_SOURCE_SETTING_HYBRID,me as PORT_AUTO_SOURCE_SETTING_OUTPUT,pe as PORT_AUTO_SOURCE_SETTING_PROCESS,I as REMOTE_EXPLORER_TYPE_KEY,se as TUNNEL_VIEW_CONTAINER_ID,ae as TUNNEL_VIEW_ID,D as TunnelEditId,C as TunnelType};
