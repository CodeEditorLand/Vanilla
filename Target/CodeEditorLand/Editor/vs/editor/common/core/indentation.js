import*as l from"../../../../vs/base/common/strings.js";import{CursorColumns as a}from"../../../../vs/editor/common/core/cursorColumns.js";function f(e,o,r){let t=0;for(let n=0;n<e.length;n++)e.charAt(n)==="	"?t=a.nextIndentTabStop(t,o):t++;let i="";if(!r){const n=Math.floor(t/o);t=t%o;for(let s=0;s<n;s++)i+="	"}for(let n=0;n<t;n++)i+=" ";return i}function m(e,o,r){let t=l.firstNonWhitespaceIndex(e);return t===-1&&(t=e.length),f(e.substring(0,t),o,r)+e.substring(t)}export{m as normalizeIndentation};
