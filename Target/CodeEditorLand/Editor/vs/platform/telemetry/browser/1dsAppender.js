import{AbstractOneDataSystemAppender as s}from"../common/1dsAppender.js";class i extends s{constructor(e,t,r,n){super(e,t,r,n),fetch(this.endPointHealthUrl,{method:"GET"}).catch(p=>{this._aiCoreOrKey=void 0})}}export{i as OneDataSystemWebAppender};
