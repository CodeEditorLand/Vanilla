import{Emitter as i}from"../../../base/common/event.js";import{getCompressedContent as r}from"../../../base/common/jsonSchema.js";import*as s from"../../registry/common/platform.js";const o={JSONContribution:"base.contributions.json"};function a(t){return t.length>0&&t.charAt(t.length-1)==="#"?t.substring(0,t.length-1):t}class h{schemasById;_onDidChangeSchema=new i;onDidChangeSchema=this._onDidChangeSchema.event;constructor(){this.schemasById={}}registerSchema(e,n){this.schemasById[a(e)]=n,this._onDidChangeSchema.fire(e)}notifySchemaChanged(e){this._onDidChangeSchema.fire(e)}getSchemaContributions(){return{schemas:this.schemasById}}getSchemaContent(e){const n=this.schemasById[e];return n?r(n):void 0}hasSchemaContent(e){return!!this.schemasById[e]}}const c=new h;s.Registry.add(o.JSONContribution,c);export{o as Extensions};
