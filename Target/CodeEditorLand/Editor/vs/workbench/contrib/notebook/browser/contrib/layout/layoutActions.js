import{localize2 as g}from"../../../../../../nls.js";import{Action2 as c,MenuId as f,registerAction2 as a}from"../../../../../../platform/actions/common/actions.js";import{IConfigurationService as u}from"../../../../../../platform/configuration/common/configuration.js";import"../../../../../../platform/instantiation/common/instantiation.js";import{NOTEBOOK_ACTIONS_CATEGORY as d}from"../../controller/coreActions.js";import{NotebookSetting as r}from"../../../common/notebookCommon.js";const m="notebook.toggleCellToolbarPosition";class T extends c{constructor(){super({id:m,title:g("notebook.toggleCellToolbarPosition","Toggle Cell Toolbar Position"),menu:[{id:f.NotebookCellTitle,group:"View",order:1}],category:d,f1:!1})}async run(t,o){const e=o&&o.ui?o.notebookEditor:void 0;if(e&&e.hasModel()){const i=e.textModel.viewType,n=t.get(u),s=n.getValue(r.cellToolbarLocation),l=this.togglePosition(i,s);await n.updateValue(r.cellToolbarLocation,l)}}togglePosition(t,o){if(typeof o=="string")if(["left","right","hidden"].indexOf(o)>=0){const e=o==="right"?"left":"right",i={default:o};return i[t]=e,i}else{const e={default:"right"};return e[t]="left",e}else{const i=(o[t]??o.default??"right")==="right"?"left":"right",n={...o};return n[t]=i,n}}}a(T);export{T as ToggleCellToolbarPositionAction};
