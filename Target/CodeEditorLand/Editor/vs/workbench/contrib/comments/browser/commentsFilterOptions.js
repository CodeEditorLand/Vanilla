import{matchesFuzzy as s,matchesFuzzy2 as a}from"../../../../../vs/base/common/filters.js";import*as l from"../../../../../vs/base/common/strings.js";class h{constructor(t,o,r){this.filter=t;t=t.trim(),this.showResolved=o,this.showUnresolved=r;const e=t.startsWith("!");this.textFilter={text:(e?l.ltrim(t,"!"):t).trim(),negate:e}}static _filter=a;static _messageFilter=s;showResolved=!0;showUnresolved=!0;textFilter}export{h as FilterOptions};
