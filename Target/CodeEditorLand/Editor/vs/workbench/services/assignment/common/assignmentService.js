var l=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var c=(o,t,e,r)=>{for(var n=r>1?void 0:r?g(t,e):t,i=o.length-1,a;i>=0;i--)(a=o[i])&&(n=(r?a(t,e,n):a(n))||n);return r&&n&&l(t,e,n),n},s=(o,t)=>(e,r)=>t(e,r,o);import"../../../../../vs/base/common/actions.js";import{localize as p}from"../../../../../vs/nls.js";import"../../../../../vs/platform/assignment/common/assignment.js";import{BaseAssignmentService as u}from"../../../../../vs/platform/assignment/common/assignmentService.js";import{IConfigurationService as f}from"../../../../../vs/platform/configuration/common/configuration.js";import{Extensions as d,ConfigurationScope as v}from"../../../../../vs/platform/configuration/common/configurationRegistry.js";import{IEnvironmentService as S}from"../../../../../vs/platform/environment/common/environment.js";import{InstantiationType as y,registerSingleton as T}from"../../../../../vs/platform/instantiation/common/extensions.js";import{createDecorator as h}from"../../../../../vs/platform/instantiation/common/instantiation.js";import{IProductService as I}from"../../../../../vs/platform/product/common/productService.js";import{Registry as C}from"../../../../../vs/platform/registry/common/platform.js";import{IStorageService as x,StorageScope as b,StorageTarget as A}from"../../../../../vs/platform/storage/common/storage.js";import{ITelemetryService as E}from"../../../../../vs/platform/telemetry/common/telemetry.js";import{workbenchConfigurationNodeBase as P}from"../../../../../vs/workbench/common/configuration.js";import{Memento as w}from"../../../../../vs/workbench/common/memento.js";const M=h("WorkbenchAssignmentService");class O{constructor(t){this.memento=t;this.mementoObj=t.getMemento(b.APPLICATION,A.MACHINE)}mementoObj;async getValue(t,e){return await this.mementoObj[t]||e}setValue(t,e){this.mementoObj[t]=e,this.memento.saveMemento()}}class N{constructor(t,e){this.telemetryService=t;this.productService=e}_lastAssignmentContext;get assignmentContext(){return this._lastAssignmentContext?.split(";")}setSharedProperty(t,e){t===this.productService.tasConfig?.assignmentContextTelemetryPropertyName&&(this._lastAssignmentContext=e),this.telemetryService.setExperimentProperty(t,e)}postEvent(t,e){const r={};for(const[n,i]of e.entries())r[n]=i;this.telemetryService.publicLog(t,r)}}let m=class extends u{constructor(e,r,n,i,a){super(e.machineId,n,i,a,new N(e,i),new O(new w("experiment.service.memento",r)));this.telemetryService=e}get experimentsEnabled(){return this.configurationService.getValue("workbench.enableExperiments")===!0}async getTreatment(e){const r=await super.getTreatment(e);return this.telemetryService.publicLog2("tasClientReadTreatmentComplete",{treatmentName:e,treatmentValue:JSON.stringify(r)}),r}async getCurrentExperiments(){if(this.tasClient&&this.experimentsEnabled)return await this.tasClient,this.telemetry?.assignmentContext}};m=c([s(0,E),s(1,x),s(2,f),s(3,I),s(4,S)],m),T(M,m,y.Delayed);const V=C.as(d.Configuration);V.registerConfiguration({...P,properties:{"workbench.enableExperiments":{type:"boolean",description:p("workbench.enableExperiments","Fetches experiments to run from a Microsoft online service."),default:!0,scope:v.APPLICATION,restricted:!0,tags:["usesOnlineServices"]}}});export{M as IWorkbenchAssignmentService,m as WorkbenchAssignmentService};
