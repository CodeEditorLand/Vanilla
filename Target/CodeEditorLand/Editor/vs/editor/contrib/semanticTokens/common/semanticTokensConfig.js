const r="editor.semanticHighlighting";function m(e,t,o){const i=o.getValue(r,{overrideIdentifier:e.getLanguageId(),resource:e.uri})?.enabled;return typeof i=="boolean"?i:t.getColorTheme().semanticHighlighting}export{r as SEMANTIC_HIGHLIGHTING_SETTING_ID,m as isSemanticColoringEnabled};
