import"../../../../../base/common/cancellation.js";import{Event as t}from"../../../../../base/common/event.js";import{Disposable as e}from"../../../../../base/common/lifecycle.js";import"../../common/languageModelToolsService.js";class k{_serviceBrand;constructor(){}onDidChangeTools=t.None;registerToolData(o){return e.None}registerToolImplementation(o,n){return e.None}getTools(){return[]}getTool(o){}getToolByName(o){}async invokeTool(o,n,a){return{string:""}}}export{k as MockLanguageModelToolsService};