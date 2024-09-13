import{getActiveElement as I}from"../../../../base/browser/dom.js";import{Codicon as f}from"../../../../base/common/codicons.js";import{KeyCode as p,KeyMod as D}from"../../../../base/common/keyCodes.js";import{localize2 as n}from"../../../../nls.js";import{Action2 as s,MenuId as b}from"../../../../platform/actions/common/actions.js";import{IConfigurationService as E}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as d}from"../../../../platform/contextkey/common/contextkey.js";import{KeybindingWeight as v}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import{EditorContextKeys as y}from"../../../common/editorContextKeys.js";import{EditorAction2 as u}from"../../editorExtensions.js";import{ICodeEditorService as S}from"../../services/codeEditorService.js";import{DiffEditorWidget as l}from"./diffEditorWidget.js";import"./registrations.contribution.js";class H extends s{constructor(){super({id:"diffEditor.toggleCollapseUnchangedRegions",title:n("toggleCollapseUnchangedRegions","Toggle Collapse Unchanged Regions"),icon:f.map,toggled:d.has("config.diffEditor.hideUnchangedRegions.enabled"),precondition:d.has("isInDiffEditor"),menu:{when:d.has("isInDiffEditor"),id:b.EditorTitle,order:22,group:"navigation"}})}run(e,...o){const t=e.get(E),i=!t.getValue("diffEditor.hideUnchangedRegions.enabled");t.updateValue("diffEditor.hideUnchangedRegions.enabled",i)}}class N extends s{constructor(){super({id:"diffEditor.toggleShowMovedCodeBlocks",title:n("toggleShowMovedCodeBlocks","Toggle Show Moved Code Blocks"),precondition:d.has("isInDiffEditor")})}run(e,...o){const t=e.get(E),i=!t.getValue("diffEditor.experimental.showMoves");t.updateValue("diffEditor.experimental.showMoves",i)}}class P extends s{constructor(){super({id:"diffEditor.toggleUseInlineViewWhenSpaceIsLimited",title:n("toggleUseInlineViewWhenSpaceIsLimited","Toggle Use Inline View When Space Is Limited"),precondition:d.has("isInDiffEditor")})}run(e,...o){const t=e.get(E),i=!t.getValue("diffEditor.useInlineViewWhenSpaceIsLimited");t.updateValue("diffEditor.useInlineViewWhenSpaceIsLimited",i)}}const a=n("diffEditor","Diff Editor");class G extends u{constructor(){super({id:"diffEditor.switchSide",title:n("switchSide","Switch Side"),icon:f.arrowSwap,precondition:d.has("isInDiffEditor"),f1:!0,category:a})}runEditorCommand(e,o,t){const i=c(e);if(i instanceof l){if(t&&t.dryRun)return{destinationSelection:i.mapToOtherSide().destinationSelection};i.switchSide()}}}class q extends u{constructor(){super({id:"diffEditor.exitCompareMove",title:n("exitCompareMove","Exit Compare Move"),icon:f.close,precondition:y.comparingMovedCode,f1:!1,category:a,keybinding:{weight:1e4,primary:p.Escape}})}runEditorCommand(e,o,...t){const i=c(e);i instanceof l&&i.exitCompareMove()}}class J extends u{constructor(){super({id:"diffEditor.collapseAllUnchangedRegions",title:n("collapseAllUnchangedRegions","Collapse All Unchanged Regions"),icon:f.fold,precondition:d.has("isInDiffEditor"),f1:!0,category:a})}runEditorCommand(e,o,...t){const i=c(e);i instanceof l&&i.collapseAllUnchangedRegions()}}class Q extends u{constructor(){super({id:"diffEditor.showAllUnchangedRegions",title:n("showAllUnchangedRegions","Show All Unchanged Regions"),icon:f.unfold,precondition:d.has("isInDiffEditor"),f1:!0,category:a})}runEditorCommand(e,o,...t){const i=c(e);i instanceof l&&i.showAllUnchangedRegions()}}class X extends s{constructor(){super({id:"diffEditor.revert",title:n("revert","Revert"),f1:!1,category:a})}run(e,o){const t=A(e,o.originalUri,o.modifiedUri);t instanceof l&&t.revertRangeMappings(o.mapping.innerChanges??[])}}const w=n("accessibleDiffViewer","Accessible Diff Viewer");class C extends s{static id="editor.action.accessibleDiffViewer.next";constructor(){super({id:C.id,title:n("editor.action.accessibleDiffViewer.next","Go to Next Difference"),category:w,precondition:d.has("isInDiffEditor"),keybinding:{primary:p.F7,weight:v.EditorContrib},f1:!0})}run(e){c(e)?.accessibleDiffViewerNext()}}class x extends s{static id="editor.action.accessibleDiffViewer.prev";constructor(){super({id:x.id,title:n("editor.action.accessibleDiffViewer.prev","Go to Previous Difference"),category:w,precondition:d.has("isInDiffEditor"),keybinding:{primary:D.Shift|p.F7,weight:v.EditorContrib},f1:!0})}run(e){c(e)?.accessibleDiffViewerPrev()}}function A(r,e,o){return r.get(S).listDiffEditors().find(g=>{const m=g.getModifiedEditor(),h=g.getOriginalEditor();return m&&m.getModel()?.uri.toString()===o.toString()&&h&&h.getModel()?.uri.toString()===e.toString()})||null}function c(r){const o=r.get(S).listDiffEditors(),t=I();if(t)for(const i of o){const g=i.getContainerDomNode();if(U(g,t))return i}return null}function U(r,e){let o=e;for(;o;){if(o===r)return!0;o=o.parentElement}return!1}export{C as AccessibleDiffViewerNext,x as AccessibleDiffViewerPrev,J as CollapseAllUnchangedRegions,q as ExitCompareMove,X as RevertHunkOrSelection,Q as ShowAllUnchangedRegions,G as SwitchSide,H as ToggleCollapseUnchangedRegions,N as ToggleShowMovedCodeBlocks,P as ToggleUseInlineViewWhenSpaceIsLimited,A as findDiffEditor,c as findFocusedDiffEditor};
