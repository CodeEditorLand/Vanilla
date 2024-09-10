import{Emitter as i}from"../../../base/common/event.js";import{getCompressedContent as r}from"../../../base/common/jsonSchema.js";import*as s from"../../registry/common/platform.js";const o={JSONContribution:"base.contributions.json"};function a(n){return n.length>0&&n.charAt(n.length-1)==="#"?n.substring(0,n.length-1):n}class h{schemasById;_onDidChangeSchema=new i;onDidChangeSchema=this._onDidChangeSchema.event;constructor(){this.schemasById={}}registerSchema(e,t){this.schemasById[a(e)]=t,this._onDidChangeSchema.fire(e)}notifySchemaChanged(e){this._onDidChangeSchema.fire(e)}getSchemaContributions(){return{schemas:this.schemasById}}getSchemaContent(e){const t=this.schemasById[e];return t?r(t):void 0}hasSchemaContent(e){return!!this.schemasById[e]}}const c=new h;s.Registry.add(o.JSONContribution,c);export{o as Extensions};
