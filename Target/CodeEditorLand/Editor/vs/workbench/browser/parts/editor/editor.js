import{Dimension as s}from"../../../../../vs/base/browser/dom.js";import"../../../../../vs/base/browser/ui/grid/grid.js";import"../../../../../vs/base/common/event.js";import"../../../../../vs/base/common/lifecycle.js";import{isObject as I}from"../../../../../vs/base/common/types.js";import{BooleanVerifier as o,EnumVerifier as t,NumberVerifier as d,ObjectVerifier as l,SetVerifier as w,verifyObject as E}from"../../../../../vs/base/common/verifier.js";import"../../../../../vs/platform/configuration/common/configuration.js";import"../../../../../vs/platform/contextkey/common/contextkey.js";import"../../../../../vs/platform/editor/common/editor.js";import"../../../../../vs/platform/theme/common/themeService.js";import"../../../../../vs/platform/window/common/window.js";import"../../../../../vs/workbench/common/editor.js";import"../../../../../vs/workbench/common/editor/editorInput.js";import"../../../../../vs/workbench/services/auxiliaryWindow/browser/auxiliaryWindowService.js";import"../../../../../vs/workbench/services/editor/common/editorGroupsService.js";import"../../../../../vs/workbench/services/editor/common/editorService.js";const ce=new s(220,70),Ie=new s(Number.POSITIVE_INFINITY,Number.POSITIVE_INFINITY),e={showTabs:"multiple",highlightModifiedTabs:!1,tabActionLocation:"right",tabActionCloseVisibility:!0,tabActionUnpinVisibility:!0,alwaysShowEditorActions:!1,tabSizing:"fit",tabSizingFixedMinWidth:50,tabSizingFixedMaxWidth:160,pinnedTabSizing:"normal",pinnedTabsOnSeparateRow:!1,tabHeight:"default",preventPinnedEditorClose:"keyboardAndMouse",titleScrollbarSizing:"default",focusRecentEditorAfterClose:!0,showIcons:!0,hasIcons:!0,enablePreview:!0,openPositioning:"right",openSideBySideDirection:"right",closeEmptyGroups:!0,labelFormat:"default",splitSizing:"auto",splitOnDragAndDrop:!0,dragToOpenWindow:!0,centeredLayoutFixedWidth:!1,doubleClickTabToToggleEditorGroupSizes:"expand",editorActionsLocation:"default",wrapTabs:!1,enablePreviewFromQuickOpen:!1,scrollToSwitchTabs:!1,enablePreviewFromCodeNavigation:!1,closeOnFileDelete:!1,mouseBackForwardToNavigate:!0,restoreViewState:!0,splitInGroupLayout:"horizontal",revealIfOpen:!1,get limit(){return{enabled:!1,value:10,perEditorGroup:!1,excludeDirty:!1}},get decorations(){return{badges:!0,colors:!0}},get autoLockGroups(){return new Set}};function we(i){return i.affectsConfiguration("workbench.editor")||i.affectsConfiguration("workbench.iconTheme")||i.affectsConfiguration("window.density")}function Ee(i,a){const r={...e,hasIcons:a.getFileIconTheme().hasFileIcons},n=i.getValue();if(n?.workbench?.editor)if(Object.assign(r,n.workbench.editor),I(n.workbench.editor.autoLockGroups)){r.autoLockGroups=e.autoLockGroups;for(const[u,c]of Object.entries(n.workbench.editor.autoLockGroups))c===!0&&r.autoLockGroups.add(u)}else r.autoLockGroups=e.autoLockGroups;const p=i.getValue();return p?.window?.density?.editorTabHeight&&(r.tabHeight=p.window.density.editorTabHeight),f(r)}function f(i){return typeof i.showTabs=="boolean"&&(i.showTabs=i.showTabs?"multiple":"single"),E({wrapTabs:new o(e.wrapTabs),scrollToSwitchTabs:new o(e.scrollToSwitchTabs),highlightModifiedTabs:new o(e.highlightModifiedTabs),tabActionCloseVisibility:new o(e.tabActionCloseVisibility),tabActionUnpinVisibility:new o(e.tabActionUnpinVisibility),alwaysShowEditorActions:new o(e.alwaysShowEditorActions),pinnedTabsOnSeparateRow:new o(e.pinnedTabsOnSeparateRow),focusRecentEditorAfterClose:new o(e.focusRecentEditorAfterClose),showIcons:new o(e.showIcons),enablePreview:new o(e.enablePreview),enablePreviewFromQuickOpen:new o(e.enablePreviewFromQuickOpen),enablePreviewFromCodeNavigation:new o(e.enablePreviewFromCodeNavigation),closeOnFileDelete:new o(e.closeOnFileDelete),closeEmptyGroups:new o(e.closeEmptyGroups),revealIfOpen:new o(e.revealIfOpen),mouseBackForwardToNavigate:new o(e.mouseBackForwardToNavigate),restoreViewState:new o(e.restoreViewState),splitOnDragAndDrop:new o(e.splitOnDragAndDrop),dragToOpenWindow:new o(e.dragToOpenWindow),centeredLayoutFixedWidth:new o(e.centeredLayoutFixedWidth),hasIcons:new o(e.hasIcons),tabSizingFixedMinWidth:new d(e.tabSizingFixedMinWidth),tabSizingFixedMaxWidth:new d(e.tabSizingFixedMaxWidth),showTabs:new t(e.showTabs,["multiple","single","none"]),tabActionLocation:new t(e.tabActionLocation,["left","right"]),tabSizing:new t(e.tabSizing,["fit","shrink","fixed"]),pinnedTabSizing:new t(e.pinnedTabSizing,["normal","compact","shrink"]),tabHeight:new t(e.tabHeight,["default","compact"]),preventPinnedEditorClose:new t(e.preventPinnedEditorClose,["keyboardAndMouse","keyboard","mouse","never"]),titleScrollbarSizing:new t(e.titleScrollbarSizing,["default","large"]),openPositioning:new t(e.openPositioning,["left","right","first","last"]),openSideBySideDirection:new t(e.openSideBySideDirection,["right","down"]),labelFormat:new t(e.labelFormat,["default","short","medium","long"]),splitInGroupLayout:new t(e.splitInGroupLayout,["vertical","horizontal"]),splitSizing:new t(e.splitSizing,["distribute","split","auto"]),doubleClickTabToToggleEditorGroupSizes:new t(e.doubleClickTabToToggleEditorGroupSizes,["maximize","expand","off"]),editorActionsLocation:new t(e.editorActionsLocation,["default","titleBar","hidden"]),autoLockGroups:new w(e.autoLockGroups),limit:new l(e.limit,{enabled:new o(e.limit.enabled),value:new d(e.limit.value),perEditorGroup:new o(e.limit.perEditorGroup),excludeDirty:new o(e.limit.excludeDirty)}),decorations:new l(e.decorations,{badges:new o(e.decorations.badges),colors:new o(e.decorations.colors)})},i)}function fe(i,a,r){return!a||!i.activeEditor||a.matches(i.activeEditor)?{...r,viewState:i.activeEditorPane?.getViewState()}:r||Object.create(null)}export{Ie as DEFAULT_EDITOR_MAX_DIMENSIONS,ce as DEFAULT_EDITOR_MIN_DIMENSIONS,e as DEFAULT_EDITOR_PART_OPTIONS,fe as fillActiveEditorViewState,Ee as getEditorPartOptions,we as impactsEditorPartOptions};