import{Codicon as u}from"./codicons.js";var m;(d=>{function c(t){return t&&typeof t=="object"&&typeof t.id=="string"}d.isThemeColor=c})(m||={});function S(c){return{id:c}}var x;(r=>{r.iconNameSegment="[A-Za-z0-9]+",r.iconNameExpression="[A-Za-z0-9-]+",r.iconModifierExpression="~[A-Za-z]+",r.iconNameCharacter="[A-Za-z0-9~-]";const p=new RegExp(`^(${r.iconNameExpression})(${r.iconModifierExpression})?$`);function s(e){const n=p.exec(e.id);if(!n)return s(u.error);const[,o,i]=n,f=["codicon","codicon-"+o];return i&&f.push("codicon-modifier-"+i.substring(1)),f}r.asClassNameArray=s;function g(e){return s(e).join(" ")}r.asClassName=g;function h(e){return"."+s(e).join(".")}r.asCSSSelector=h;function I(e){return e&&typeof e=="object"&&typeof e.id=="string"&&(typeof e.color>"u"||m.isThemeColor(e.color))}r.isThemeIcon=I;const a=new RegExp(`^\\$\\((${r.iconNameExpression}(?:${r.iconModifierExpression})?)\\)$`);function T(e){const n=a.exec(e);if(!n)return;const[,o]=n;return{id:o}}r.fromString=T;function C(e){return{id:e}}r.fromId=C;function y(e,n){let o=e.id;const i=o.lastIndexOf("~");return i!==-1&&(o=o.substring(0,i)),n&&(o=`${o}~${n}`),{id:o}}r.modify=y;function $(e){const n=e.id.lastIndexOf("~");if(n!==-1)return e.id.substring(n+1)}r.getModifier=$;function E(e,n){return e.id===n.id&&e.color?.id===n.color?.id}r.isEqual=E})(x||={});export{m as ThemeColor,x as ThemeIcon,S as themeColorFromId};
