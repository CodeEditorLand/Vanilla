import"vs/css!./media/severityIcon";import{Codicon as r}from"../../../../vs/base/common/codicons.js";import e from"../../../../vs/base/common/severity.js";import{ThemeIcon as a}from"../../../../vs/base/common/themables.js";var n;(t=>{function o(s){switch(s){case e.Ignore:return"severity-ignore "+a.asClassName(r.info);case e.Info:return a.asClassName(r.info);case e.Warning:return a.asClassName(r.warning);case e.Error:return a.asClassName(r.error);default:return""}}t.className=o})(n||={});export{n as SeverityIcon};