import{Codicon as t}from"../../../../../vs/base/common/codicons.js";import{ThemeIcon as o}from"../../../../../vs/base/common/themables.js";import{ModelDecorationOptions as e}from"../../../../../vs/editor/common/model/textModel.js";import{localize as i}from"../../../../../vs/nls.js";import{registerColor as r}from"../../../../../vs/platform/theme/common/colorRegistry.js";import{registerIcon as n}from"../../../../../vs/platform/theme/common/iconRegistry.js";const g=r("diffEditor.move.border","#8b8b8b9c",i("diffEditor.move.border","The border color for text that got moved in the diff editor.")),p=r("diffEditor.moveActive.border","#FFA500",i("diffEditor.moveActive.border","The active border color for text that got moved in the diff editor.")),u=r("diffEditor.unchangedRegionShadow",{dark:"#000000",light:"#737373BF",hcDark:"#000000",hcLight:"#737373BF"},i("diffEditor.unchangedRegionShadow","The color of the shadow around unchanged region widgets.")),d=n("diff-insert",t.add,i("diffInsertIcon","Line decoration for inserts in the diff editor.")),s=n("diff-remove",t.remove,i("diffRemoveIcon","Line decoration for removals in the diff editor.")),D=e.register({className:"line-insert",description:"line-insert",isWholeLine:!0,linesDecorationsClassName:"insert-sign "+o.asClassName(d),marginClassName:"gutter-insert"}),L=e.register({className:"line-delete",description:"line-delete",isWholeLine:!0,linesDecorationsClassName:"delete-sign "+o.asClassName(s),marginClassName:"gutter-delete"}),N=e.register({className:"line-insert",description:"line-insert",isWholeLine:!0,marginClassName:"gutter-insert"}),v=e.register({className:"line-delete",description:"line-delete",isWholeLine:!0,marginClassName:"gutter-delete"}),x=e.register({className:"char-insert",description:"char-insert",shouldFillLineOnLineBreak:!0}),B=e.register({className:"char-insert",description:"char-insert",isWholeLine:!0}),C=e.register({className:"char-insert diff-range-empty",description:"char-insert diff-range-empty"}),I=e.register({className:"char-delete",description:"char-delete",shouldFillLineOnLineBreak:!0}),W=e.register({className:"char-delete",description:"char-delete",isWholeLine:!0}),b=e.register({className:"char-delete diff-range-empty",description:"char-delete diff-range-empty"});export{x as diffAddDecoration,C as diffAddDecorationEmpty,I as diffDeleteDecoration,b as diffDeleteDecorationEmpty,u as diffEditorUnchangedRegionShadow,d as diffInsertIcon,N as diffLineAddDecorationBackground,D as diffLineAddDecorationBackgroundWithIndicator,v as diffLineDeleteDecorationBackground,L as diffLineDeleteDecorationBackgroundWithIndicator,g as diffMoveBorder,p as diffMoveBorderActive,s as diffRemoveIcon,B as diffWholeLineAddDecoration,W as diffWholeLineDeleteDecoration};
