import"../../../../vs/base/parts/ipc/common/ipc.js";import{createDecorator as t}from"../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../vs/platform/ipc/common/services.js";const I=t("mainProcessService");class h{constructor(e,r){this.server=e;this.router=r}getChannel(e){return this.server.getChannel(e,this.router)}registerChannel(e,r){this.server.registerChannel(e,r)}}export{I as IMainProcessService,h as MainProcessService};