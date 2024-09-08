import{setDisposableTracker as a}from"../../common/lifecycle.js";class n{allDisposables=[];trackDisposable(s){this.allDisposables.push([s,new Error().stack])}setParent(s,i){for(let o=0;o<this.allDisposables.length;o++)if(this.allDisposables[o][0]===s){this.allDisposables.splice(o,1);return}}markAsDisposed(s){for(let i=0;i<this.allDisposables.length;i++)if(this.allDisposables[i][0]===s){this.allDisposables.splice(i,1);return}}markAsSingleton(s){}}let e=null;function b(){e=new n,a(e)}function D(){e&&(a(null),console.log(e.allDisposables.map(l=>`${l[0]}
${l[1]}`).join(`

`)),e=null)}function g(l=!1){self.beginLoggingFS?.(l)}function c(){self.endLoggingFS?.()}export{g as beginLoggingFS,b as beginTrackingDisposables,c as endLoggingFS,D as endTrackingDisposables};
