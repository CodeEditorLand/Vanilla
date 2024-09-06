import"../../../../../vs/base/browser/ui/list/listWidget.js";import{Emitter as b,Event as c}from"../../../../../vs/base/common/event.js";import{Disposable as u}from"../../../../../vs/base/common/lifecycle.js";import{observableFromEvent as v}from"../../../../../vs/base/common/observable.js";import*as l from"../../../../../vs/nls.js";import"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/platform/keybinding/common/keybinding.js";import{AccessibilityVerbositySettingId as g}from"../../../../../vs/workbench/contrib/accessibility/browser/accessibilityConfiguration.js";import{AccessibilityCommandId as m}from"../../../../../vs/workbench/contrib/accessibility/common/accessibilityCommands.js";import"../../../../../vs/workbench/contrib/notebook/browser/viewModel/notebookViewModelImpl.js";import{CellKind as p,NotebookCellExecutionState as d}from"../../../../../vs/workbench/contrib/notebook/common/notebookCommon.js";import{NotebookExecutionType as f}from"../../../../../vs/workbench/contrib/notebook/common/notebookExecutionStateService.js";class O extends u{constructor(e,t,i,o){super();this.notebookExecutionStateService=e;this.viewModel=t;this.keybindingService=i;this.configurationService=o;this._register(c.debounce(this.notebookExecutionStateService.onDidChangeExecution,(r,n)=>this.mergeEvents(r,n),100)(r=>{const n=this.viewModel();if(n)for(const s of r){const a=n.getCellByHandle(s);a&&this._onDidAriaLabelChange.fire(a)}},this))}_onDidAriaLabelChange=new b;onDidAriaLabelChange=this._onDidAriaLabelChange.event;getAriaLabel(e){const t=c.filter(this.onDidAriaLabelChange,i=>i===e);return v(this,t,()=>{const i=this.viewModel();if(!i)return"";const o=i.getCellIndex(e);return o>=0?this.getLabel(o,e):""})}getLabel(e,t){const i=this.notebookExecutionStateService.getCellExecution(t.uri)?.state,o=i===d.Executing?", executing":i===d.Pending?", pending":"";return`Cell ${e}, ${t.cellKind===p.Markup?"markdown":"code"} cell${o}`}getWidgetAriaLabel(){const e=this.keybindingService.lookupKeybinding(m.OpenAccessibilityHelp)?.getLabel();return this.configurationService.getValue(g.Notebook)?e?l.localize("notebookTreeAriaLabelHelp",`Notebook
Use {0} for accessibility help`,e):l.localize("notebookTreeAriaLabelHelpNoKb",`Notebook
Run the Open Accessibility Help command for more information`,e):l.localize("notebookTreeAriaLabel","Notebook")}mergeEvents(e,t){const i=this.viewModel(),o=e||[];return i&&t.type===f.cell&&t.affectsNotebook(i.uri)&&o.indexOf(t.cellHandle)<0&&o.push(t.cellHandle),o}}export{O as NotebookAccessibilityProvider};
