import{Event as i}from"../../../../base/common/event.js";import{AccessibilitySupport as s}from"../../common/accessibility.js";class n{onDidChangeScreenReaderOptimized=i.None;onDidChangeReducedMotion=i.None;isScreenReaderOptimized(){return!1}isMotionReduced(){return!1}alwaysUnderlineAccessKeys(){return Promise.resolve(!1)}setAccessibilitySupport(e){}getAccessibilitySupport(){return s.Unknown}alert(e){}status(e){}}export{n as TestAccessibilityService};