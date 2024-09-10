function g(n,E){let _=0,i=0,U=n.length;for(;i<U;){let x=n.charCodeAt(i);if(x===32)_++;else if(x===9)_=_-_%E+E;else break;i++}return i===U?-1:_}export{g as computeIndentLevel};
