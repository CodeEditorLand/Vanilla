import{Categories as o}from"../../../../platform/action/common/actionCommonCategories.js";import{Action2 as s,registerAction2 as i}from"../../../../platform/actions/common/actions.js";import{IInstantiationService as n}from"../../../../platform/instantiation/common/instantiation.js";import{OpenExtensionLogsFolderAction as e,OpenLogsFolderAction as r}from"./logsActions.js";i(class extends s{constructor(){super({id:r.ID,title:r.TITLE,category:o.Developer,f1:!0})}run(t){return t.get(n).createInstance(r,r.ID,r.TITLE.value).run()}}),i(class extends s{constructor(){super({id:e.ID,title:e.TITLE,category:o.Developer,f1:!0})}run(t){return t.get(n).createInstance(e,e.ID,e.TITLE.value).run()}});
