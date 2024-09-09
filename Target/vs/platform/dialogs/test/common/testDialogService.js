import{Event as r}from"../../../../base/common/event.js";import o from"../../../../base/common/severity.js";import"../../common/dialogs.js";class h{constructor(t=void 0,e=void 0){this.defaultConfirmResult=t;this.defaultPromptResult=e}onWillShowDialog=r.None;onDidShowDialog=r.None;confirmResult=void 0;setConfirmResult(t){this.confirmResult=t}async confirm(t){if(this.confirmResult){const e=this.confirmResult;return this.confirmResult=void 0,e}return this.defaultConfirmResult??{confirmed:!1}}async prompt(t){if(this.defaultPromptResult)return this.defaultPromptResult;const e=[...t.buttons??[]];return t.cancelButton&&typeof t.cancelButton!="string"&&typeof t.cancelButton!="boolean"&&e.push(t.cancelButton),{result:await e[0]?.run({checkboxChecked:!1})}}async info(t,e){await this.prompt({type:o.Info,message:t,detail:e})}async warn(t,e){await this.prompt({type:o.Warning,message:t,detail:e})}async error(t,e){await this.prompt({type:o.Error,message:t,detail:e})}async input(){return{confirmed:!0,values:[]}}async about(){}}export{h as TestDialogService};
