import{InstantiationType as n,registerSingleton as i}from"../../../../../vs/platform/instantiation/common/extensions.js";import{EditorPaneDescriptor as e}from"../../../../../vs/workbench/browser/editor.js";import{IEditorPaneService as r}from"../../../../../vs/workbench/services/editor/common/editorPaneService.js";class a{onWillInstantiateEditorPane=e.onWillInstantiateEditorPane;didInstantiateEditorPane(t){return e.didInstantiateEditorPane(t)}}i(r,a,n.Delayed);export{a as EditorPaneService};