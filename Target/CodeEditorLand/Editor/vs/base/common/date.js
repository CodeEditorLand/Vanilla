import{localize as r}from"../../../vs/nls.js";const u=60,s=u*60,f=s*24,i=f*7,g=f*30,d=f*365;function m(t,n,a,l){typeof t!="number"&&(t=t.getTime());const e=Math.round((new Date().getTime()-t)/1e3);if(e<-30)return r("date.fromNow.in","in {0}",m(new Date().getTime()+e*1e3,!1));if(!l&&e<30)return r("date.fromNow.now","now");let o;return e<u?(o=e,n?o===1?a?r("date.fromNow.seconds.singular.ago.fullWord","{0} second ago",o):r("date.fromNow.seconds.singular.ago","{0} sec ago",o):a?r("date.fromNow.seconds.plural.ago.fullWord","{0} seconds ago",o):r("date.fromNow.seconds.plural.ago","{0} secs ago",o):o===1?a?r("date.fromNow.seconds.singular.fullWord","{0} second",o):r("date.fromNow.seconds.singular","{0} sec",o):a?r("date.fromNow.seconds.plural.fullWord","{0} seconds",o):r("date.fromNow.seconds.plural","{0} secs",o)):e<s?(o=Math.floor(e/u),n?o===1?a?r("date.fromNow.minutes.singular.ago.fullWord","{0} minute ago",o):r("date.fromNow.minutes.singular.ago","{0} min ago",o):a?r("date.fromNow.minutes.plural.ago.fullWord","{0} minutes ago",o):r("date.fromNow.minutes.plural.ago","{0} mins ago",o):o===1?a?r("date.fromNow.minutes.singular.fullWord","{0} minute",o):r("date.fromNow.minutes.singular","{0} min",o):a?r("date.fromNow.minutes.plural.fullWord","{0} minutes",o):r("date.fromNow.minutes.plural","{0} mins",o)):e<f?(o=Math.floor(e/s),n?o===1?a?r("date.fromNow.hours.singular.ago.fullWord","{0} hour ago",o):r("date.fromNow.hours.singular.ago","{0} hr ago",o):a?r("date.fromNow.hours.plural.ago.fullWord","{0} hours ago",o):r("date.fromNow.hours.plural.ago","{0} hrs ago",o):o===1?a?r("date.fromNow.hours.singular.fullWord","{0} hour",o):r("date.fromNow.hours.singular","{0} hr",o):a?r("date.fromNow.hours.plural.fullWord","{0} hours",o):r("date.fromNow.hours.plural","{0} hrs",o)):e<i?(o=Math.floor(e/f),n?o===1?r("date.fromNow.days.singular.ago","{0} day ago",o):r("date.fromNow.days.plural.ago","{0} days ago",o):o===1?r("date.fromNow.days.singular","{0} day",o):r("date.fromNow.days.plural","{0} days",o)):e<g?(o=Math.floor(e/i),n?o===1?a?r("date.fromNow.weeks.singular.ago.fullWord","{0} week ago",o):r("date.fromNow.weeks.singular.ago","{0} wk ago",o):a?r("date.fromNow.weeks.plural.ago.fullWord","{0} weeks ago",o):r("date.fromNow.weeks.plural.ago","{0} wks ago",o):o===1?a?r("date.fromNow.weeks.singular.fullWord","{0} week",o):r("date.fromNow.weeks.singular","{0} wk",o):a?r("date.fromNow.weeks.plural.fullWord","{0} weeks",o):r("date.fromNow.weeks.plural","{0} wks",o)):e<d?(o=Math.floor(e/g),n?o===1?a?r("date.fromNow.months.singular.ago.fullWord","{0} month ago",o):r("date.fromNow.months.singular.ago","{0} mo ago",o):a?r("date.fromNow.months.plural.ago.fullWord","{0} months ago",o):r("date.fromNow.months.plural.ago","{0} mos ago",o):o===1?a?r("date.fromNow.months.singular.fullWord","{0} month",o):r("date.fromNow.months.singular","{0} mo",o):a?r("date.fromNow.months.plural.fullWord","{0} months",o):r("date.fromNow.months.plural","{0} mos",o)):(o=Math.floor(e/d),n?o===1?a?r("date.fromNow.years.singular.ago.fullWord","{0} year ago",o):r("date.fromNow.years.singular.ago","{0} yr ago",o):a?r("date.fromNow.years.plural.ago.fullWord","{0} years ago",o):r("date.fromNow.years.plural.ago","{0} yrs ago",o):o===1?a?r("date.fromNow.years.singular.fullWord","{0} year",o):r("date.fromNow.years.singular","{0} yr",o):a?r("date.fromNow.years.plural.fullWord","{0} years",o):r("date.fromNow.years.plural","{0} yrs",o))}function N(t,n,a){typeof t!="number"&&(t=t.getTime());const l=new Date;l.setHours(0,0,0,0);const e=new Date(l.getTime());return e.setDate(e.getDate()-1),t>l.getTime()?r("today","Today"):t>e.getTime()?r("yesterday","Yesterday"):m(t,n,a)}function h(t,n){const a=Math.abs(t/1e3);return a<1?n?r("duration.ms.full","{0} milliseconds",t):r("duration.ms","{0}ms",t):a<u?n?r("duration.s.full","{0} seconds",Math.round(t)/1e3):r("duration.s","{0}s",Math.round(t)/1e3):a<s?n?r("duration.m.full","{0} minutes",Math.round(t/(1e3*u))):r("duration.m","{0} mins",Math.round(t/(1e3*u))):a<f?n?r("duration.h.full","{0} hours",Math.round(t/(1e3*s))):r("duration.h","{0} hrs",Math.round(t/(1e3*s))):r("duration.d","{0} days",Math.round(t/(1e3*f)))}function c(t){return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")+"T"+String(t.getHours()).padStart(2,"0")+":"+String(t.getMinutes()).padStart(2,"0")+":"+String(t.getSeconds()).padStart(2,"0")+"."+(t.getMilliseconds()/1e3).toFixed(3).slice(2,5)+"Z"}export{m as fromNow,N as fromNowByDay,h as getDurationString,c as toLocalISOString};
