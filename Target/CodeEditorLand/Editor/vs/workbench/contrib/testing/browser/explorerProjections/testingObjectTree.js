import"../../../../../../vs/base/browser/ui/tree/tree.js";import{WorkbenchObjectTree as a}from"../../../../../../vs/platform/list/browser/listService.js";import{TestItemTreeElement as s}from"../../../../../../vs/workbench/contrib/testing/browser/explorerProjections/index.js";import"../../../../../../vs/workbench/contrib/testing/browser/explorerProjections/testingViewState.js";import{TestId as T}from"../../../../../../vs/workbench/contrib/testing/common/testId.js";class b extends a{getOptimizedViewState(d){const l=d||{},n=(e,t)=>{if(!(e.element instanceof s))return!1;const r=T.localId(e.element.test.item.extId),i=t.children?.[r]||{};i.collapsed=e.depth===0||!e.collapsed?e.collapsed:void 0;let o=i.collapsed!==void 0;if(e.children.length)for(const c of e.children)o=n(c,i)||o;return o?(t.children??={},t.children[r]=i):t.children?.hasOwnProperty(r)&&delete t.children[r],o};l.children??={};for(const e of this.getNode().children)if(e.element instanceof s)if(e.element.test.controllerId===e.element.test.item.extId)n(e,l);else{const t=l.children[e.element.test.controllerId]??={children:{}};n(e,t)}return l}}export{b as TestingObjectTree};
