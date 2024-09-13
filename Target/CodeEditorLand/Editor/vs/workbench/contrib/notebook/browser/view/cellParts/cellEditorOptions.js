import{Emitter as c}from"../../../../../../base/common/event.js";import{localize as l,localize2 as f}from"../../../../../../nls.js";import{Action2 as g,MenuId as m,registerAction2 as p}from"../../../../../../platform/actions/common/actions.js";import{IConfigurationService as a}from"../../../../../../platform/configuration/common/configuration.js";import{Extensions as h}from"../../../../../../platform/configuration/common/configurationRegistry.js";import{ContextKeyExpr as r}from"../../../../../../platform/contextkey/common/contextkey.js";import{Registry as N}from"../../../../../../platform/registry/common/platform.js";import{ActiveEditorContext as C}from"../../../../../common/contextkeys.js";import{NOTEBOOK_EDITOR_ID as O}from"../../../common/notebookCommon.js";import{NOTEBOOK_CELL_LINE_NUMBERS as b,NOTEBOOK_EDITOR_FOCUSED as S}from"../../../common/notebookContextKeys.js";import{NOTEBOOK_ACTIONS_CATEGORY as _,NotebookMultiCellAction as k}from"../../controller/coreActions.js";import{CellContentPart as v}from"../cellPart.js";class R extends v{constructor(e,o,t){super();this.base=e;this.notebookOptions=o;this.configurationService=t;this._register(e.onDidChange(()=>{this._recomputeOptions()})),this._value=this._computeEditorOptions()}_lineNumbers="inherit";_tabSize;_indentSize;_insertSpaces;set tabSize(e){this._tabSize!==e&&(this._tabSize=e,this._onDidChange.fire())}get tabSize(){return this._tabSize}set indentSize(e){this._indentSize!==e&&(this._indentSize=e,this._onDidChange.fire())}get indentSize(){return this._indentSize}set insertSpaces(e){this._insertSpaces!==e&&(this._insertSpaces=e,this._onDidChange.fire())}get insertSpaces(){return this._insertSpaces}_onDidChange=this._register(new c);onDidChange=this._onDidChange.event;_value;updateState(e,o){o.cellLineNumberChanged&&this.setLineNumbers(e.lineNumbers)}_recomputeOptions(){this._value=this._computeEditorOptions(),this._onDidChange.fire()}_computeEditorOptions(){const e=this.base.value,o=this.notebookOptions.getDisplayOptions().editorOptionsCustomizations,t=o?.["editor.indentSize"];t!==void 0&&(this.indentSize=t);const s=o?.["editor.insertSpaces"];s!==void 0&&(this.insertSpaces=s);const d=o?.["editor.tabSize"];d!==void 0&&(this.tabSize=d);let n=e.lineNumbers;switch(this._lineNumbers){case"inherit":this.configurationService.getValue("notebook.lineNumbers")==="on"?e.lineNumbers==="off"&&(n="on"):n="off";break;case"on":e.lineNumbers==="off"&&(n="on");break;case"off":n="off";break}return e.lineNumbers!==n?{...e,lineNumbers:n}:Object.assign({},e)}getUpdatedValue(e,o){const t=this.getValue(e,o);return delete t.hover,t}getValue(e,o){return{...this._value,padding:this.notebookOptions.computeEditorPadding(e,o)}}getDefaultValue(){return{...this._value,padding:{top:12,bottom:12}}}setLineNumbers(e){this._lineNumbers=e,this._recomputeOptions()}}N.as(h.Configuration).registerConfiguration({id:"notebook",order:100,type:"object",properties:{"notebook.lineNumbers":{type:"string",enum:["off","on"],default:"off",markdownDescription:l("notebook.lineNumbers","Controls the display of line numbers in the cell editor.")}}}),p(class extends g{constructor(){super({id:"notebook.toggleLineNumbers",title:f("notebook.toggleLineNumbers","Toggle Notebook Line Numbers"),precondition:S,menu:[{id:m.NotebookToolbar,group:"notebookLayout",order:2,when:r.equals("config.notebook.globalToolbar",!0)}],category:_,f1:!0,toggled:{condition:r.notEquals("config.notebook.lineNumbers","off"),title:l("notebook.showLineNumbers","Notebook Line Numbers")}})}async run(i){const e=i.get(a);e.getValue("notebook.lineNumbers")==="on"?e.updateValue("notebook.lineNumbers","off"):e.updateValue("notebook.lineNumbers","on")}}),p(class extends k{constructor(){super({id:"notebook.cell.toggleLineNumbers",title:l("notebook.cell.toggleLineNumbers.title","Show Cell Line Numbers"),precondition:C.isEqualTo(O),menu:[{id:m.NotebookCellTitle,group:"View",order:1}],toggled:r.or(b.isEqualTo("on"),r.and(b.isEqualTo("inherit"),r.equals("config.notebook.lineNumbers","on")))})}async runWithContext(i,e){if(e.ui)this.updateCell(i.get(a),e.cell);else{const o=i.get(a);e.selectedCells.forEach(t=>{this.updateCell(o,t)})}}updateCell(i,e){const o=i.getValue("notebook.lineNumbers")==="on",t=e.lineNumbers;t==="on"||t==="inherit"&&o?e.lineNumbers="off":e.lineNumbers="on"}});export{R as CellEditorOptions};
