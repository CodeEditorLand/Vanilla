import"../../../base/common/event.js";import{RawContextKey as o}from"../../contextkey/common/contextkey.js";import{createDecorator as n}from"../../instantiation/common/instantiation.js";const d=n("accessibilityService");var t=(e=>(e[e.Unknown=0]="Unknown",e[e.Disabled=1]="Disabled",e[e.Enabled=2]="Enabled",e))(t||{});const l=new o("accessibilityModeEnabled",!1);function y(i){return i&&typeof i=="object"&&typeof i.label=="string"&&(typeof i.role>"u"||typeof i.role=="string")}const E="ACCESSIBLE_VIEW_SHOWN_";export{E as ACCESSIBLE_VIEW_SHOWN_STORAGE_PREFIX,t as AccessibilitySupport,l as CONTEXT_ACCESSIBILITY_MODE_ENABLED,d as IAccessibilityService,y as isAccessibilityInformation};
