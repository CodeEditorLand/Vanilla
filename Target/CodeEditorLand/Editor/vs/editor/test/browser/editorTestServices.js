import{Emitter as i}from"../../../base/common/event.js";import"../../browser/editorBrowser.js";import{AbstractCodeEditorService as l,GlobalStyleSheet as s}from"../../browser/services/abstractCodeEditorService.js";import{CommandsRegistry as d}from"../../../platform/commands/common/commands.js";import"../../../platform/editor/common/editor.js";import"../../../platform/instantiation/common/instantiation.js";class f extends l{globalStyleSheet=new a;_createGlobalStyleSheet(){return this.globalStyleSheet}getActiveCodeEditor(){return null}lastInput;openCodeEditor(e,t,n){return this.lastInput=e,Promise.resolve(null)}}class a extends s{rules=[];constructor(){super(null)}insertRule(e,t){this.rules.unshift(`${e} {${t}}`)}removeRulesContainingSelector(e){for(let t=0;t<this.rules.length;t++)this.rules[t].indexOf(e)>=0&&(this.rules.splice(t,1),t--)}read(){return this.rules.join(`
`)}}class x{_instantiationService;_onWillExecuteCommand=new i;onWillExecuteCommand=this._onWillExecuteCommand.event;_onDidExecuteCommand=new i;onDidExecuteCommand=this._onDidExecuteCommand.event;constructor(e){this._instantiationService=e}executeCommand(e,...t){const n=d.getCommand(e);if(!n)return Promise.reject(new Error(`command '${e}' not found`));try{this._onWillExecuteCommand.fire({commandId:e,args:t});const o=this._instantiationService.invokeFunction.apply(this._instantiationService,[n.handler,...t]);return this._onDidExecuteCommand.fire({commandId:e,args:t}),Promise.resolve(o)}catch(o){return Promise.reject(o)}}}export{f as TestCodeEditorService,x as TestCommandService,a as TestGlobalStyleSheet};