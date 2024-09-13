import{URI as o}from"../../../base/common/uri.js";class t{constructor(e){this.service=e}listen(e,n,r){throw new Error("Invalid listen")}call(e,n,r){switch(n){case"download":return this.service.download(o.revive(r[0]),o.revive(r[1]))}throw new Error("Invalid call")}}class l{constructor(e,n){this.channel=e;this.getUriTransformer=n}async download(e,n){const r=this.getUriTransformer();r&&(e=r.transformOutgoingURI(e),n=r.transformOutgoingURI(n)),await this.channel.call("download",[e,n])}}export{t as DownloadServiceChannel,l as DownloadServiceChannelClient};
