import{importAMDNodeModule as i}from"../../../../vs/amdX.js";import{AbstractSignService as t}from"../../../../vs/platform/sign/common/abstractSignService.js";import"../../../../vs/platform/sign/common/sign.js";class v extends t{getValidator(){return this.vsda().then(r=>new r.validator)}signValue(r){return this.vsda().then(e=>new e.signer().sign(r))}async vsda(){return i("vsda","index.js")}}export{v as SignService};