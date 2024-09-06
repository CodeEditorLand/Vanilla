import{isActiveElement as I}from"../../../../vs/base/browser/dom.js";import{PagedList as k}from"../../../../vs/base/browser/ui/list/listPaging.js";import{List as C}from"../../../../vs/base/browser/ui/list/listWidget.js";import{Table as K}from"../../../../vs/base/browser/ui/table/tableWidget.js";import{AbstractTree as S,TreeFindMatchType as E,TreeFindMode as L}from"../../../../vs/base/browser/ui/tree/abstractTree.js";import{AsyncDataTree as u}from"../../../../vs/base/browser/ui/tree/asyncDataTree.js";import{DataTree as b}from"../../../../vs/base/browser/ui/tree/dataTree.js";import{ObjectTree as w}from"../../../../vs/base/browser/ui/tree/objectTree.js";import"../../../../vs/base/browser/ui/tree/tree.js";import{equals as D,range as q}from"../../../../vs/base/common/arrays.js";import{KeyChord as z,KeyCode as r,KeyMod as d}from"../../../../vs/base/common/keyCodes.js";import{localize as P,localize2 as j}from"../../../../vs/nls.js";import{Action2 as B,registerAction2 as G}from"../../../../vs/platform/actions/common/actions.js";import{CommandsRegistry as F}from"../../../../vs/platform/commands/common/commands.js";import{IConfigurationService as J}from"../../../../vs/platform/configuration/common/configuration.js";import{ContextKeyExpr as h}from"../../../../vs/platform/contextkey/common/contextkey.js";import{IHoverService as Q}from"../../../../vs/platform/hover/browser/hover.js";import"../../../../vs/platform/instantiation/common/instantiation.js";import{KeybindingsRegistry as a,KeybindingWeight as l}from"../../../../vs/platform/keybinding/common/keybindingsRegistry.js";import{getSelectionKeyboardEvent as H,IListService as c,RawWorkbenchListFocusContextKey as N,WorkbenchListFocusContextKey as g,WorkbenchListHasSelectionOrFocus as X,WorkbenchListScrollAtBottomContextKey as Y,WorkbenchListScrollAtTopContextKey as Z,WorkbenchListSelectionNavigation as O,WorkbenchListSupportsFind as _,WorkbenchListSupportsMultiSelectContextKey as W,WorkbenchTreeElementCanCollapse as $,WorkbenchTreeElementCanExpand as ee,WorkbenchTreeElementHasChild as te,WorkbenchTreeElementHasParent as ne,WorkbenchTreeFindOpen as oe,WorkbenchTreeStickyScrollFocused as T}from"../../../../vs/platform/list/browser/listService.js";function R(n){const e=n?.getHTMLElement();e&&!I(e)&&n?.domFocus()}async function ie(n,e){if(!O.getValue(n.contextKeyService))return e(n);const t=n.getFocus(),o=n.getSelection();await e(n);const i=n.getFocus();if(o.length>1||!D(t,o)||D(t,i))return;const s=new KeyboardEvent("keydown");n.setSelection(i,s)}async function y(n,e){if(!n)return;await ie(n,e);const t=n.getFocus();t.length&&n.reveal(t[0]),n.setAnchor(t[0]),R(n)}a.registerCommandAndKeybindingRule({id:"list.focusDown",weight:l.WorkbenchContrib,when:g,primary:r.DownArrow,mac:{primary:r.DownArrow,secondary:[d.WinCtrl|r.KeyN]},handler:(n,e)=>{y(n.get(c).lastFocusedList,async t=>{const o=new KeyboardEvent("keydown");await t.focusNext(typeof e=="number"?e:1,!1,o)})}}),a.registerCommandAndKeybindingRule({id:"list.focusUp",weight:l.WorkbenchContrib,when:g,primary:r.UpArrow,mac:{primary:r.UpArrow,secondary:[d.WinCtrl|r.KeyP]},handler:(n,e)=>{y(n.get(c).lastFocusedList,async t=>{const o=new KeyboardEvent("keydown");await t.focusPrevious(typeof e=="number"?e:1,!1,o)})}}),a.registerCommandAndKeybindingRule({id:"list.focusAnyDown",weight:l.WorkbenchContrib,when:g,primary:d.Alt|r.DownArrow,mac:{primary:d.Alt|r.DownArrow,secondary:[d.WinCtrl|d.Alt|r.KeyN]},handler:(n,e)=>{y(n.get(c).lastFocusedList,async t=>{const o=new KeyboardEvent("keydown",{altKey:!0});await t.focusNext(typeof e=="number"?e:1,!1,o)})}}),a.registerCommandAndKeybindingRule({id:"list.focusAnyUp",weight:l.WorkbenchContrib,when:g,primary:d.Alt|r.UpArrow,mac:{primary:d.Alt|r.UpArrow,secondary:[d.WinCtrl|d.Alt|r.KeyP]},handler:(n,e)=>{y(n.get(c).lastFocusedList,async t=>{const o=new KeyboardEvent("keydown",{altKey:!0});await t.focusPrevious(typeof e=="number"?e:1,!1,o)})}}),a.registerCommandAndKeybindingRule({id:"list.focusPageDown",weight:l.WorkbenchContrib,when:g,primary:r.PageDown,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown");await e.focusNextPage(t)})}}),a.registerCommandAndKeybindingRule({id:"list.focusPageUp",weight:l.WorkbenchContrib,when:g,primary:r.PageUp,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown");await e.focusPreviousPage(t)})}}),a.registerCommandAndKeybindingRule({id:"list.focusFirst",weight:l.WorkbenchContrib,when:g,primary:r.Home,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown");await e.focusFirst(t)})}}),a.registerCommandAndKeybindingRule({id:"list.focusLast",weight:l.WorkbenchContrib,when:g,primary:r.End,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown");await e.focusLast(t)})}}),a.registerCommandAndKeybindingRule({id:"list.focusAnyFirst",weight:l.WorkbenchContrib,when:g,primary:d.Alt|r.Home,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown",{altKey:!0});await e.focusFirst(t)})}}),a.registerCommandAndKeybindingRule({id:"list.focusAnyLast",weight:l.WorkbenchContrib,when:g,primary:d.Alt|r.End,handler:n=>{y(n.get(c).lastFocusedList,async e=>{const t=new KeyboardEvent("keydown",{altKey:!0});await e.focusLast(t)})}});function U(n,e){if(n instanceof C||n instanceof k||n instanceof K){const t=n,o=t.getFocus()?t.getFocus()[0]:void 0,i=t.getSelection();i&&typeof o=="number"&&i.indexOf(o)>=0?t.setSelection(i.filter(s=>s!==e)):typeof o=="number"&&t.setSelection(i.concat(o))}else if(n instanceof w||n instanceof b||n instanceof u){const t=n,o=t.getFocus()?t.getFocus()[0]:void 0;if(e===o)return;const i=t.getSelection(),s=new KeyboardEvent("keydown",{shiftKey:!0});i&&i.indexOf(o)>=0?t.setSelection(i.filter(f=>f!==e),s):t.setSelection(i.concat(o),s)}}function x(n,e){const t=n.getStickyScrollFocus();if(t.length===0)throw new Error("StickyScroll has no focus");if(t.length>1)throw new Error("StickyScroll can only have a single focused item");n.reveal(t[0]),n.getHTMLElement().focus(),n.setFocus(t),e?.(t[0])}a.registerCommandAndKeybindingRule({id:"list.expandSelectionDown",weight:l.WorkbenchContrib,when:h.and(g,W),primary:d.Shift|r.DownArrow,handler:(n,e)=>{const t=n.get(c).lastFocusedList;if(!t)return;const o=t.getFocus()?t.getFocus()[0]:void 0,i=new KeyboardEvent("keydown");t.focusNext(typeof e=="number"?e:1,!1,i),U(t,o);const s=t.getFocus();s.length&&t.reveal(s[0]),R(t)}}),a.registerCommandAndKeybindingRule({id:"list.expandSelectionUp",weight:l.WorkbenchContrib,when:h.and(g,W),primary:d.Shift|r.UpArrow,handler:(n,e)=>{const t=n.get(c).lastFocusedList;if(!t)return;const o=t.getFocus()?t.getFocus()[0]:void 0,i=new KeyboardEvent("keydown");t.focusPrevious(typeof e=="number"?e:1,!1,i),U(t,o);const s=t.getFocus();s.length&&t.reveal(s[0]),R(t)}}),a.registerCommandAndKeybindingRule({id:"list.collapse",weight:l.WorkbenchContrib,when:h.and(g,h.or($,ne)),primary:r.LeftArrow,mac:{primary:r.LeftArrow,secondary:[d.CtrlCmd|r.UpArrow]},handler:n=>{const e=n.get(c).lastFocusedList;if(!e||!(e instanceof w||e instanceof b||e instanceof u))return;const t=e,o=t.getFocus();if(o.length===0)return;const i=o[0];if(!t.collapse(i)){const s=t.getParentElement(i);s&&y(e,f=>{const m=new KeyboardEvent("keydown");f.setFocus([s],m)})}}}),a.registerCommandAndKeybindingRule({id:"list.stickyScroll.collapse",weight:l.WorkbenchContrib+50,when:T,primary:r.LeftArrow,mac:{primary:r.LeftArrow,secondary:[d.CtrlCmd|r.UpArrow]},handler:n=>{const e=n.get(c).lastFocusedList;!e||!(e instanceof w||e instanceof b||e instanceof u)||x(e,t=>e.collapse(t))}}),a.registerCommandAndKeybindingRule({id:"list.collapseAll",weight:l.WorkbenchContrib,when:g,primary:d.CtrlCmd|r.LeftArrow,mac:{primary:d.CtrlCmd|r.LeftArrow,secondary:[d.CtrlCmd|d.Shift|r.UpArrow]},handler:n=>{const e=n.get(c).lastFocusedList;e&&!(e instanceof C||e instanceof k||e instanceof K)&&e.collapseAll()}}),a.registerCommandAndKeybindingRule({id:"list.collapseAllToFocus",weight:l.WorkbenchContrib,when:g,handler:n=>{const e=n.get(c).lastFocusedList,t=H("keydown",!0);if(e instanceof w||e instanceof b||e instanceof u){const o=e,i=o.getFocus();i.length>0&&o.collapse(i[0],!0),o.setSelection(i,t),o.setAnchor(i[0])}}}),a.registerCommandAndKeybindingRule({id:"list.focusParent",weight:l.WorkbenchContrib,when:g,handler:n=>{const e=n.get(c).lastFocusedList;if(!e||!(e instanceof w||e instanceof b||e instanceof u))return;const t=e,o=t.getFocus();if(o.length===0)return;const i=o[0],s=t.getParentElement(i);s&&y(e,f=>{const m=new KeyboardEvent("keydown");f.setFocus([s],m)})}}),a.registerCommandAndKeybindingRule({id:"list.expand",weight:l.WorkbenchContrib,when:h.and(g,h.or(ee,te)),primary:r.RightArrow,handler:n=>{const e=n.get(c).lastFocusedList;if(e){if(e instanceof w||e instanceof b){const t=e.getFocus();if(t.length===0)return;const o=t[0];if(!e.expand(o)){const i=e.getFirstElementChild(o);i&&e.getNode(i).visible&&y(e,f=>{const m=new KeyboardEvent("keydown");f.setFocus([i],m)})}}else if(e instanceof u){const t=e.getFocus();if(t.length===0)return;const o=t[0];e.expand(o).then(i=>{if(o&&!i){const s=e.getFirstElementChild(o);s&&e.getNode(s).visible&&y(e,m=>{const p=new KeyboardEvent("keydown");m.setFocus([s],p)})}})}}}});function M(n,e){const t=n.get(c).lastFocusedList,o=H("keydown",e);if(t instanceof C||t instanceof k||t instanceof K){const i=t;i.setAnchor(i.getFocus()[0]),i.setSelection(i.getFocus(),o)}else if(t instanceof w||t instanceof b||t instanceof u){const i=t,s=i.getFocus();if(s.length>0){let f=!0;(i.expandOnlyOnTwistieClick===!0||typeof i.expandOnlyOnTwistieClick!="boolean"&&i.expandOnlyOnTwistieClick(s[0]))&&(f=!1),f&&i.toggleCollapsed(s[0])}i.setAnchor(s[0]),i.setSelection(s,o)}}a.registerCommandAndKeybindingRule({id:"list.select",weight:l.WorkbenchContrib,when:g,primary:r.Enter,mac:{primary:r.Enter,secondary:[d.CtrlCmd|r.DownArrow]},handler:n=>{M(n,!1)}}),a.registerCommandAndKeybindingRule({id:"list.stickyScrollselect",weight:l.WorkbenchContrib+50,when:T,primary:r.Enter,mac:{primary:r.Enter,secondary:[d.CtrlCmd|r.DownArrow]},handler:n=>{const e=n.get(c).lastFocusedList;!e||!(e instanceof w||e instanceof b||e instanceof u)||x(e,t=>e.setSelection([t]))}}),a.registerCommandAndKeybindingRule({id:"list.selectAndPreserveFocus",weight:l.WorkbenchContrib,when:g,handler:n=>{M(n,!0)}}),a.registerCommandAndKeybindingRule({id:"list.selectAll",weight:l.WorkbenchContrib,when:h.and(g,W),primary:d.CtrlCmd|r.KeyA,handler:n=>{const e=n.get(c).lastFocusedList;if(e instanceof C||e instanceof k||e instanceof K){const t=e,o=new KeyboardEvent("keydown");t.setSelection(q(t.length),o)}else if(e instanceof w||e instanceof b||e instanceof u){const t=e,o=t.getFocus(),i=t.getSelection();let s;o.length>0&&(i.length===0||!i.includes(o[0]))&&(s=o[0]),!s&&i.length>0&&(s=i[0]);let f;s?f=t.getParentElement(s):f=void 0;const m=[],p=V=>{for(const A of V.children)A.visible&&(m.push(A.element),A.collapsed||p(A))};p(t.getNode(f)),f&&i.length===m.length&&m.unshift(f);const v=new KeyboardEvent("keydown");t.setSelection(m,v)}}}),a.registerCommandAndKeybindingRule({id:"list.toggleSelection",weight:l.WorkbenchContrib,when:g,primary:d.CtrlCmd|d.Shift|r.Enter,handler:n=>{const e=n.get(c).lastFocusedList;if(!e)return;const t=e.getFocus();if(t.length===0)return;const o=e.getSelection(),i=o.indexOf(t[0]);i>-1?e.setSelection([...o.slice(0,i),...o.slice(i+1)]):e.setSelection([...o,t[0]])}}),a.registerCommandAndKeybindingRule({id:"list.showHover",weight:l.WorkbenchContrib,primary:z(d.CtrlCmd|r.KeyK,d.CtrlCmd|r.KeyI),when:g,handler:async(n,...e)=>{const o=n.get(c).lastFocusedList;if(!o)return;const i=o.getFocus();if(!i||i.length===0)return;const p=o.getHTMLElement().querySelector(".monaco-scrollable-element")?.querySelector(".monaco-list-rows")?.querySelector(".focused");if(!p)return;const v=re(p);v&&n.get(Q).showManagedHover(v)}});function re(n){if(n.matches('[custom-hover="true"]'))return n;const e=n.querySelector('[custom-hover="true"]:not([tabindex]):not(.action-item)');if(e)return e}a.registerCommandAndKeybindingRule({id:"list.toggleExpand",weight:l.WorkbenchContrib,when:g,primary:r.Space,handler:n=>{const e=n.get(c).lastFocusedList;if(e instanceof w||e instanceof b||e instanceof u){const t=e,o=t.getFocus();if(o.length>0&&t.isCollapsible(o[0])){t.toggleCollapsed(o[0]);return}}M(n,!0)}}),a.registerCommandAndKeybindingRule({id:"list.stickyScrolltoggleExpand",weight:l.WorkbenchContrib+50,when:T,primary:r.Space,handler:n=>{const e=n.get(c).lastFocusedList;!e||!(e instanceof w||e instanceof b||e instanceof u)||x(e)}}),a.registerCommandAndKeybindingRule({id:"list.clear",weight:l.WorkbenchContrib,when:h.and(g,X),primary:r.Escape,handler:n=>{const e=n.get(c).lastFocusedList;if(!e)return;const t=e.getSelection(),o=new KeyboardEvent("keydown");if(t.length>1)if(O.getValue(e.contextKeyService)){const s=e.getFocus();e.setSelection([s[0]],o)}else e.setSelection([],o);else e.setSelection([],o),e.setFocus([],o);e.setAnchor(void 0)}}),F.registerCommand({id:"list.triggerTypeNavigation",handler:n=>{n.get(c).lastFocusedList?.triggerTypeNavigation()}}),F.registerCommand({id:"list.toggleFindMode",handler:n=>{const e=n.get(c).lastFocusedList;if(e instanceof S||e instanceof u){const t=e;t.findMode=t.findMode===L.Filter?L.Highlight:L.Filter}}}),F.registerCommand({id:"list.toggleFindMatchType",handler:n=>{const e=n.get(c).lastFocusedList;if(e instanceof S||e instanceof u){const t=e;t.findMatchType=t.findMatchType===E.Contiguous?E.Fuzzy:E.Contiguous}}}),F.registerCommandAlias("list.toggleKeyboardNavigation","list.triggerTypeNavigation"),F.registerCommandAlias("list.toggleFilterOnType","list.toggleFindMode"),a.registerCommandAndKeybindingRule({id:"list.find",weight:l.WorkbenchContrib,when:h.and(N,_),primary:d.CtrlCmd|d.Alt|r.KeyF,secondary:[r.F3],handler:n=>{const e=n.get(c).lastFocusedList;e instanceof C||e instanceof k||e instanceof K||(e instanceof S||e instanceof u)&&e.openFind()}}),a.registerCommandAndKeybindingRule({id:"list.closeFind",weight:l.WorkbenchContrib,when:h.and(N,oe),primary:r.Escape,handler:n=>{const e=n.get(c).lastFocusedList;(e instanceof S||e instanceof u)&&e.closeFind()}}),a.registerCommandAndKeybindingRule({id:"list.scrollUp",weight:l.WorkbenchContrib,when:h.and(g,Z?.negate()),primary:d.CtrlCmd|r.UpArrow,handler:n=>{const e=n.get(c).lastFocusedList;e&&(e.scrollTop-=10)}}),a.registerCommandAndKeybindingRule({id:"list.scrollDown",weight:l.WorkbenchContrib,when:h.and(g,Y?.negate()),primary:d.CtrlCmd|r.DownArrow,handler:n=>{const e=n.get(c).lastFocusedList;e&&(e.scrollTop+=10)}}),a.registerCommandAndKeybindingRule({id:"list.scrollLeft",weight:l.WorkbenchContrib,when:g,handler:n=>{const e=n.get(c).lastFocusedList;e&&(e.scrollLeft-=10)}}),a.registerCommandAndKeybindingRule({id:"list.scrollRight",weight:l.WorkbenchContrib,when:g,handler:n=>{const e=n.get(c).lastFocusedList;e&&(e.scrollLeft+=10)}}),G(class extends B{constructor(){super({id:"tree.toggleStickyScroll",title:{...j("toggleTreeStickyScroll","Toggle Tree Sticky Scroll"),mnemonicTitle:P({key:"mitoggleTreeStickyScroll",comment:["&& denotes a mnemonic"]},"&&Toggle Tree Sticky Scroll")},category:"View",metadata:{description:P("toggleTreeStickyScrollDescription","Toggles Sticky Scroll widget at the top of tree structures such as the File Explorer and Debug variables View.")},f1:!0})}run(e){const t=e.get(J),o=!t.getValue("workbench.tree.enableStickyScroll");t.updateValue("workbench.tree.enableStickyScroll",o)}});
