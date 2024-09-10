import{keybindingLabelBackground as F,keybindingLabelBorder as b,keybindingLabelBottomBorder as p,keybindingLabelForeground as f,asCssVariable as e,widgetShadow as n,buttonForeground as v,buttonSeparator as m,buttonBackground as x,buttonHoverBackground as O,buttonSecondaryForeground as C,buttonSecondaryBackground as A,buttonSecondaryHoverBackground as L,buttonBorder as W,progressBarBackground as h,inputActiveOptionBorder as V,inputActiveOptionForeground as w,inputActiveOptionBackground as H,editorWidgetBackground as D,editorWidgetForeground as T,contrastBorder as l,checkboxBorder as P,checkboxBackground as M,checkboxForeground as E,problemsErrorIconForeground as G,problemsWarningIconForeground as R,problemsInfoIconForeground as K,inputBackground as q,inputForeground as N,inputBorder as j,textLinkForeground as z,inputValidationInfoBorder as J,inputValidationInfoBackground as Q,inputValidationInfoForeground as U,inputValidationWarningBorder as X,inputValidationWarningBackground as Y,inputValidationWarningForeground as Z,inputValidationErrorBorder as _,inputValidationErrorBackground as $,inputValidationErrorForeground as ee,listFilterWidgetBackground as oe,listFilterWidgetNoMatchesOutline as re,listFilterWidgetOutline as te,listFilterWidgetShadow as ne,badgeBackground as ie,badgeForeground as de,breadcrumbsBackground as ue,breadcrumbsForeground as le,breadcrumbsFocusForeground as c,breadcrumbsActiveSelectionForeground as ce,activeContrastBorder as t,listActiveSelectionBackground as a,listActiveSelectionForeground as s,listActiveSelectionIconForeground as ae,listDropOverBackground as se,listFocusAndSelectionOutline as ge,listFocusBackground as Se,listFocusForeground as Be,listFocusOutline as ye,listHoverBackground as g,listHoverForeground as S,listInactiveFocusBackground as ke,listInactiveFocusOutline as Ie,listInactiveSelectionBackground as Fe,listInactiveSelectionForeground as be,listInactiveSelectionIconForeground as pe,tableColumnsBorder as fe,tableOddRowsBackgroundColor as ve,treeIndentGuidesStroke as me,asCssVariableWithDefault as xe,editorWidgetBorder as Oe,focusBorder as Ce,pickerGroupForeground as Ae,quickInputListFocusBackground as Le,quickInputListFocusForeground as We,quickInputListFocusIconForeground as he,selectBackground as Ve,selectBorder as we,selectForeground as He,selectListBackground as De,treeInactiveIndentGuidesStroke as Te,menuBorder as Pe,menuForeground as Me,menuBackground as Ee,menuSelectionForeground as Ge,menuSelectionBackground as Re,menuSelectionBorder as Ke,menuSeparatorBackground as qe,scrollbarShadow as B,scrollbarSliderActiveBackground as Ne,scrollbarSliderBackground as je,scrollbarSliderHoverBackground as ze,listDropBetweenBackground as Je,radioActiveBackground as Qe,radioActiveForeground as Ue,radioInactiveBackground as Xe,radioInactiveForeground as Ye,radioInactiveBorder as Ze,radioInactiveHoverBackground as _e,radioActiveBorder as $e}from"../common/colorRegistry.js";import{Color as eo}from"../../../base/common/color.js";function r(o,I){const i={...I};for(const d in o){const u=o[d];i[d]=u!==void 0?e(u):void 0}return i}const oo={keybindingLabelBackground:e(F),keybindingLabelForeground:e(f),keybindingLabelBorder:e(b),keybindingLabelBottomBorder:e(p),keybindingLabelShadow:e(n)};function qo(o){return r(o,oo)}const ro={buttonForeground:e(v),buttonSeparator:e(m),buttonBackground:e(x),buttonHoverBackground:e(O),buttonSecondaryForeground:e(C),buttonSecondaryBackground:e(A),buttonSecondaryHoverBackground:e(L),buttonBorder:e(W)};function No(o){return r(o,ro)}const to={progressBarBackground:e(h)};function jo(o){return r(o,to)}const y={inputActiveOptionBorder:e(V),inputActiveOptionForeground:e(w),inputActiveOptionBackground:e(H)},zo={activeForeground:e(Ue),activeBackground:e(Qe),activeBorder:e($e),inactiveForeground:e(Ye),inactiveBackground:e(Xe),inactiveBorder:e(Ze),inactiveHoverBackground:e(_e)};function Jo(o){return r(o,y)}const no={checkboxBackground:e(M),checkboxBorder:e(P),checkboxForeground:e(E)};function Qo(o){return r(o,no)}const io={dialogBackground:e(D),dialogForeground:e(T),dialogShadow:e(n),dialogBorder:e(l),errorIconForeground:e(G),warningIconForeground:e(R),infoIconForeground:e(K),textLinkForeground:e(z)};function Uo(o){return r(o,io)}const k={inputBackground:e(q),inputForeground:e(N),inputBorder:e(j),inputValidationInfoBorder:e(J),inputValidationInfoBackground:e(Q),inputValidationInfoForeground:e(U),inputValidationWarningBorder:e(X),inputValidationWarningBackground:e(Y),inputValidationWarningForeground:e(Z),inputValidationErrorBorder:e(_),inputValidationErrorBackground:e($),inputValidationErrorForeground:e(ee)};function Xo(o){return r(o,k)}const Yo={listFilterWidgetBackground:e(oe),listFilterWidgetOutline:e(te),listFilterWidgetNoMatchesOutline:e(re),listFilterWidgetShadow:e(ne),inputBoxStyles:k,toggleStyles:y},uo={badgeBackground:e(ie),badgeForeground:e(de),badgeBorder:e(l)};function Zo(o){return r(o,uo)}const lo={breadcrumbsBackground:e(ue),breadcrumbsForeground:e(le),breadcrumbsHoverForeground:e(c),breadcrumbsFocusForeground:e(c),breadcrumbsFocusAndSelectionForeground:e(ce)};function _o(o){return r(o,lo)}const co={listBackground:void 0,listInactiveFocusForeground:void 0,listFocusBackground:e(Se),listFocusForeground:e(Be),listFocusOutline:e(ye),listActiveSelectionBackground:e(a),listActiveSelectionForeground:e(s),listActiveSelectionIconForeground:e(ae),listFocusAndSelectionOutline:e(ge),listFocusAndSelectionBackground:e(a),listFocusAndSelectionForeground:e(s),listInactiveSelectionBackground:e(Fe),listInactiveSelectionIconForeground:e(pe),listInactiveSelectionForeground:e(be),listInactiveFocusBackground:e(ke),listInactiveFocusOutline:e(Ie),listHoverBackground:e(g),listHoverForeground:e(S),listDropOverBackground:e(se),listDropBetweenBackground:e(Je),listSelectionOutline:e(t),listHoverOutline:e(t),treeIndentGuidesStroke:e(me),treeInactiveIndentGuidesStroke:e(Te),treeStickyScrollBackground:void 0,treeStickyScrollBorder:void 0,treeStickyScrollShadow:e(B),tableColumnsBorder:e(fe),tableOddRowsBackgroundColor:e(ve)};function $o(o){return r(o,co)}const ao={selectBackground:e(Ve),selectListBackground:e(De),selectForeground:e(He),decoratorRightForeground:e(Ae),selectBorder:e(we),focusBorder:e(Ce),listFocusBackground:e(Le),listInactiveSelectionIconForeground:e(he),listFocusForeground:e(We),listFocusOutline:xe(t,eo.transparent.toString()),listHoverBackground:e(g),listHoverForeground:e(S),listHoverOutline:e(t),selectListBorder:e(Oe),listBackground:void 0,listActiveSelectionBackground:void 0,listActiveSelectionForeground:void 0,listActiveSelectionIconForeground:void 0,listFocusAndSelectionBackground:void 0,listDropOverBackground:void 0,listDropBetweenBackground:void 0,listInactiveSelectionBackground:void 0,listInactiveSelectionForeground:void 0,listInactiveFocusBackground:void 0,listInactiveFocusOutline:void 0,listSelectionOutline:void 0,listFocusAndSelectionForeground:void 0,listFocusAndSelectionOutline:void 0,listInactiveFocusForeground:void 0,tableColumnsBorder:void 0,tableOddRowsBackgroundColor:void 0,treeIndentGuidesStroke:void 0,treeInactiveIndentGuidesStroke:void 0,treeStickyScrollBackground:void 0,treeStickyScrollBorder:void 0,treeStickyScrollShadow:void 0};function er(o){return r(o,ao)}const so={shadowColor:e(n),borderColor:e(Pe),foregroundColor:e(Me),backgroundColor:e(Ee),selectionForegroundColor:e(Ge),selectionBackgroundColor:e(Re),selectionBorderColor:e(Ke),separatorColor:e(qe),scrollbarShadow:e(B),scrollbarSliderBackground:e(je),scrollbarSliderHoverBackground:e(ze),scrollbarSliderActiveBackground:e(Ne)};function or(o){return r(o,so)}export{lo as defaultBreadcrumbsWidgetStyles,ro as defaultButtonStyles,no as defaultCheckboxStyles,uo as defaultCountBadgeStyles,io as defaultDialogStyles,Yo as defaultFindWidgetStyles,k as defaultInputBoxStyles,oo as defaultKeybindingLabelStyles,co as defaultListStyles,so as defaultMenuStyles,to as defaultProgressBarStyles,zo as defaultRadioStyles,ao as defaultSelectBoxStyles,y as defaultToggleStyles,_o as getBreadcrumbsWidgetStyles,No as getButtonStyles,Qo as getCheckboxStyles,Zo as getCountBadgeStyle,Uo as getDialogStyle,Xo as getInputBoxStyle,qo as getKeybindingLabelStyles,$o as getListStyles,or as getMenuStyles,jo as getProgressBarStyles,er as getSelectBoxStyles,Jo as getToggleStyles};
