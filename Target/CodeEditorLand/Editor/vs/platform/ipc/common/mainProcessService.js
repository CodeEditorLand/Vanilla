import{createDecorator as t}from"../../instantiation/common/instantiation.js";const I=t("mainProcessService");class h{constructor(e,r){this.server=e;this.router=r}getChannel(e){return this.server.getChannel(e,this.router)}registerChannel(e,r){this.server.registerChannel(e,r)}}export{I as IMainProcessService,h as MainProcessService};
