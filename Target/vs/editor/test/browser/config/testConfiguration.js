import{EditorConfiguration as o}from"../../../browser/config/editorConfiguration.js";import{EditorFontLigatures as i,EditorFontVariations as e}from"../../../common/config/editorOptions.js";import{FontInfo as r}from"../../../common/config/fontInfo.js";import"../testCodeEditor.js";import{AccessibilitySupport as n}from"../../../../platform/accessibility/common/accessibility.js";import{TestAccessibilityService as a}from"../../../../platform/accessibility/test/common/testAccessibilityService.js";import{MenuId as s}from"../../../../platform/actions/common/actions.js";class E extends o{constructor(t){super(!1,s.EditorContext,t,null,new a)}_readEnvConfiguration(){const t=this.getRawOptions().envConfig;return{extraEditorClassName:t?.extraEditorClassName??"",outerWidth:t?.outerWidth??100,outerHeight:t?.outerHeight??100,emptySelectionClipboard:t?.emptySelectionClipboard??!0,pixelRatio:t?.pixelRatio??1,accessibilitySupport:t?.accessibilitySupport??n.Unknown}}_readFontInfo(t){return new r({pixelRatio:1,fontFamily:"mockFont",fontWeight:"normal",fontSize:14,fontFeatureSettings:i.OFF,fontVariationSettings:e.OFF,lineHeight:19,letterSpacing:1.5,isMonospace:!0,typicalHalfwidthCharacterWidth:10,typicalFullwidthCharacterWidth:20,canUseHalfwidthRightwardsArrow:!0,spaceWidth:10,middotWidth:10,wsmiddotWidth:10,maxDigitWidth:10},!0)}}export{E as TestConfiguration};
