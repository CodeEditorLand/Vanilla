import{getActiveElement as x}from"../../../../base/browser/dom.js";import{KeyCode as h,KeyMod as g}from"../../../../base/common/keyCodes.js";import{isMacintosh as A}from"../../../../base/common/platform.js";import{assertIsDefined as I}from"../../../../base/common/types.js";import{ToggleCaseSensitiveKeybinding as w,TogglePreserveCaseKeybinding as F,ToggleRegexKeybinding as R,ToggleWholeWordKeybinding as T}from"../../../../editor/contrib/find/browser/findModel.js";import*as s from"../../../../nls.js";import{CONTEXT_ACCESSIBILITY_MODE_ENABLED as W}from"../../../../platform/accessibility/common/accessibility.js";import{Action2 as i,MenuId as V,registerAction2 as n}from"../../../../platform/actions/common/actions.js";import"../../../../platform/commands/common/commands.js";import{IConfigurationService as P}from"../../../../platform/configuration/common/configuration.js";import{ContextKeyExpr as l,IContextKeyService as K}from"../../../../platform/contextkey/common/contextkey.js";import"../../../../platform/instantiation/common/instantiation.js";import{KeybindingWeight as u}from"../../../../platform/keybinding/common/keybindingsRegistry.js";import"../../../../platform/list/browser/listService.js";import{IEditorService as p}from"../../../services/editor/common/editorService.js";import{IViewsService as d}from"../../../services/views/common/viewsService.js";import*as C from"../../searchEditor/browser/constants.js";import"../../searchEditor/browser/searchEditor.js";import{SearchEditorInput as y}from"../../searchEditor/browser/searchEditorInput.js";import*as r from"../common/constants.js";import{category as a,getSearchView as m,openSearchView as b}from"./searchActionsBase.js";import{FolderMatch as M}from"./searchModel.js";n(class extends i{constructor(){super({id:r.SearchCommandIds.ToggleQueryDetailsActionId,title:s.localize2("ToggleQueryDetailsAction.label","Toggle Query Details"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.or(r.SearchContext.SearchViewFocusedKey,C.InSearchEditor),primary:g.CtrlCmd|g.Shift|h.KeyJ}})}run(e,...t){const c=e.get(K).getContext(x());if(c.getValue(C.InSearchEditor.serialize()))e.get(p).activeEditorPane.toggleQueryDetails(t[0]?.show);else if(c.getValue(r.SearchContext.SearchViewFocusedKey.serialize())){const S=m(e.get(d));I(S).toggleQueryDetails(void 0,t[0]?.show)}}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.CloseReplaceWidgetActionId,title:s.localize2("CloseReplaceWidget.label","Close Replace Widget"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.ReplaceInputBoxFocusedKey),primary:h.Escape}})}run(e){const t=m(e.get(d));return t&&(t.searchAndReplaceWidget.toggleReplace(!1),t.searchAndReplaceWidget.focus()),Promise.resolve(null)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.ToggleCaseSensitiveCommandId,title:s.localize2("ToggleCaseSensitiveCommandId.label","Toggle Case Sensitive"),category:a,keybinding:Object.assign({weight:u.WorkbenchContrib,when:A?l.and(r.SearchContext.SearchViewFocusedKey,r.SearchContext.FileMatchOrFolderMatchFocusKey.toNegated()):r.SearchContext.SearchViewFocusedKey},w)})}async run(e){E(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.ToggleWholeWordCommandId,title:s.localize2("ToggleWholeWordCommandId.label","Toggle Whole Word"),keybinding:Object.assign({weight:u.WorkbenchContrib,when:r.SearchContext.SearchViewFocusedKey},T),category:a})}async run(e){return O(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.ToggleRegexCommandId,title:s.localize2("ToggleRegexCommandId.label","Toggle Regex"),keybinding:Object.assign({weight:u.WorkbenchContrib,when:r.SearchContext.SearchViewFocusedKey},R),category:a})}async run(e){return k(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.TogglePreserveCaseId,title:s.localize2("TogglePreserveCaseId.label","Toggle Preserve Case"),keybinding:Object.assign({weight:u.WorkbenchContrib,when:r.SearchContext.SearchViewFocusedKey},F),category:a})}async run(e){return z(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.OpenMatch,title:s.localize2("OpenMatch.label","Open Match"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.FileMatchOrMatchFocusKey),primary:h.Enter,mac:{primary:h.Enter,secondary:[g.CtrlCmd|h.DownArrow]}}})}run(e){const t=m(e.get(d));if(t){const c=t.getControl(),S=t.getControl(),f=c.getFocus()[0];f instanceof M?S.toggleCollapsed(f):t.open(c.getFocus()[0],!1,!1,!0)}}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.OpenMatchToSide,title:s.localize2("OpenMatchToSide.label","Open Match To Side"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.FileMatchOrMatchFocusKey),primary:g.CtrlCmd|h.Enter,mac:{primary:g.WinCtrl|h.Enter}}})}run(e){const t=m(e.get(d));if(t){const c=t.getControl();t.open(c.getFocus()[0],!1,!0,!0)}}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.AddCursorsAtSearchResults,title:s.localize2("AddCursorsAtSearchResults.label","Add Cursors at Search Results"),keybinding:{weight:u.WorkbenchContrib,when:l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.FileMatchOrMatchFocusKey),primary:g.CtrlCmd|g.Shift|h.KeyL},category:a})}async run(e){const t=m(e.get(d));if(t){const c=t.getControl();t.openEditorWithMultiCursor(c.getFocus()[0])}}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusNextInputActionId,title:s.localize2("FocusNextInputAction.label","Focus Next Input"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.or(l.and(C.InSearchEditor,r.SearchContext.InputBoxFocusedKey),l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.InputBoxFocusedKey)),primary:g.CtrlCmd|h.DownArrow}})}async run(e){const t=e.get(p);t.activeEditor instanceof y&&t.activeEditorPane.focusNextInput(),m(e.get(d))?.focusNextInputBox()}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusPreviousInputActionId,title:s.localize2("FocusPreviousInputAction.label","Focus Previous Input"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.or(l.and(C.InSearchEditor,r.SearchContext.InputBoxFocusedKey),l.and(r.SearchContext.SearchViewVisibleKey,r.SearchContext.InputBoxFocusedKey,r.SearchContext.SearchInputBoxFocusedKey.toNegated())),primary:g.CtrlCmd|h.UpArrow}})}async run(e){const t=e.get(p);t.activeEditor instanceof y&&t.activeEditorPane.focusPrevInput(),m(e.get(d))?.focusPreviousInputBox()}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusSearchFromResults,title:s.localize2("FocusSearchFromResults.label","Focus Search From Results"),category:a,keybinding:{weight:u.WorkbenchContrib,when:l.and(r.SearchContext.SearchViewVisibleKey,l.or(r.SearchContext.FirstMatchFocusKey,W)),primary:g.CtrlCmd|h.UpArrow}})}run(e){m(e.get(d))?.focusPreviousInputBox()}}),n(class v extends i{static searchOnTypeKey="search.searchOnType";constructor(){super({id:r.SearchCommandIds.ToggleSearchOnTypeActionId,title:s.localize2("toggleTabs","Toggle Search on Type"),category:a})}async run(e){const t=e.get(P),c=t.getValue(v.searchOnTypeKey);return t.updateValue(v.searchOnTypeKey,!c)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusSearchListCommandID,title:s.localize2("focusSearchListCommandLabel","Focus List"),category:a,f1:!0})}async run(e){N(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusNextSearchResultActionId,title:s.localize2("FocusNextSearchResult.label","Focus Next Search Result"),keybinding:[{primary:h.F4,weight:u.WorkbenchContrib}],category:a,f1:!0,precondition:l.or(r.SearchContext.HasSearchResults,C.InSearchEditor)})}async run(e){return await D(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.FocusPreviousSearchResultActionId,title:s.localize2("FocusPreviousSearchResult.label","Focus Previous Search Result"),keybinding:[{primary:g.Shift|h.F4,weight:u.WorkbenchContrib}],category:a,f1:!0,precondition:l.or(r.SearchContext.HasSearchResults,C.InSearchEditor)})}async run(e){return await B(e)}}),n(class extends i{constructor(){super({id:r.SearchCommandIds.ReplaceInFilesActionId,title:s.localize2("replaceInFiles","Replace in Files"),keybinding:[{primary:g.CtrlCmd|g.Shift|h.KeyH,weight:u.WorkbenchContrib}],category:a,f1:!0,menu:[{id:V.MenubarEditMenu,group:"4_find_global",order:2}]})}async run(e){return await L(e,!0)}});function E(o){m(o.get(d))?.toggleCaseSensitive()}function O(o){m(o.get(d))?.toggleWholeWords()}function k(o){m(o.get(d))?.toggleRegex()}function z(o){m(o.get(d))?.togglePreserveCase()}const N=o=>{const e=o.get(d);b(e).then(t=>{t?.moveFocusToResults()})};async function D(o){const e=o.get(p);return e.activeEditor instanceof y?e.activeEditorPane.focusNextResult():b(o.get(d)).then(c=>{c?.selectNextMatch()})}async function B(o){const e=o.get(p);return e.activeEditor instanceof y?e.activeEditorPane.focusPreviousResult():b(o.get(d)).then(c=>{c?.selectPreviousMatch()})}async function L(o,e){return b(o.get(d),!1).then(t=>{if(t){t.searchAndReplaceWidget.toggleReplace(e);const S=t.updateTextFromFindWidgetOrSelection({allowUnselectedWord:!e});t.searchAndReplaceWidget.focus(void 0,S,S)}})}
