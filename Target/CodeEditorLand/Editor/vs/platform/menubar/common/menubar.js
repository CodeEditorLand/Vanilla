import"../../../../vs/base/common/uri.js";function n(e){return e.submenu!==void 0}function r(e){return e.id==="vscode.menubar.separator"}function t(e){return e.uri!==void 0}function i(e){return!n(e)&&!r(e)&&!t(e)}export{i as isMenubarMenuItemAction,t as isMenubarMenuItemRecentAction,r as isMenubarMenuItemSeparator,n as isMenubarMenuItemSubmenu};
