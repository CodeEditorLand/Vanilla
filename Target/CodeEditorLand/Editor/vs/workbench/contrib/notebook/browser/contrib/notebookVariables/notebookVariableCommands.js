import{CancellationToken as u}from"../../../../../../../vs/base/common/cancellation.js";import{URI as b}from"../../../../../../../vs/base/common/uri.js";import{localize as n}from"../../../../../../../vs/nls.js";import{Action2 as c,registerAction2 as a}from"../../../../../../../vs/platform/actions/common/actions.js";import{IClipboardService as m}from"../../../../../../../vs/platform/clipboard/common/clipboardService.js";import"../../../../../../../vs/platform/instantiation/common/instantiation.js";import"../../../../../../../vs/workbench/contrib/notebook/browser/contrib/notebookVariables/notebookVariablesView.js";import{INotebookKernelService as p}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookKernelService.js";import{INotebookService as v}from"../../../../../../../vs/workbench/contrib/notebook/common/notebookService.js";const d="workbench.debug.viewlet.action.copyWorkspaceVariableValue",f=n("copyWorkspaceVariableValue","Copy Value");a(class extends c{constructor(){super({id:d,title:f,f1:!1})}run(o,e){const r=o.get(m);e.value&&r.writeText(e.value)}}),a(class extends c{constructor(){super({id:"_executeNotebookVariableProvider",title:n("executeNotebookVariableProvider","Execute Notebook Variable Provider"),f1:!1})}async run(o,e){if(!e)return[];const r=b.revive(e),s=o.get(p),t=o.get(v).getNotebookTextModel(r);if(!t)return[];const i=s.getMatchingKernel(t).selected;return i&&i.hasVariableProvider?await i.provideVariables(t.uri,void 0,"named",0,u.None).map(l=>l).toPromise():[]}});export{d as COPY_NOTEBOOK_VARIABLE_VALUE_ID,f as COPY_NOTEBOOK_VARIABLE_VALUE_LABEL};
