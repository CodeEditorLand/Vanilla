import{EXTENSION_CATEGORIES as l}from"../../../../platform/extensions/common/extensions.js";class n{constructor(t,s){this.value=t;this.sortBy=s;this.value=t.trim()}static suggestions(t){const s=["installed","updates","enabled","disabled","builtin","featured","popular","recommended","recentlyPublished","workspaceUnsupported","deprecated","sort","category","tag","ext","id"],e={sort:["installs","rating","name","publishedDate","updateDate"],category:l.map(r=>`"${r.toLowerCase()}"`),tag:[""],ext:[""],id:[""]},o=r=>t.indexOf(r)>-1,i=e.sort.some(r=>o(`@sort:${r}`)),u=e.category.some(r=>o(`@category:${r}`));return s.flatMap(r=>i&&r==="sort"||u&&r==="category"?[]:r in e?e[r].map(a=>`@${r}:${a}${a===""?"":" "}`):o(`@${r}`)?[]:[`@${r} `])}static parse(t){let s="";return t=t.replace(/@sort:(\w+)(-\w*)?/g,(e,o,i)=>(s=o,"")),new n(t,s)}toString(){let t=this.value;return this.sortBy&&(t=`${t}${t?" ":""}@sort:${this.sortBy}`),t}isValid(){return!/@outdated/.test(this.value)}equals(t){return this.value===t.value&&this.sortBy===t.sortBy}}export{n as Query};
