import*as a from"../../../../nls.js";function n(e){e.pattern=e.pattern||"^(?!.*\\$\\{(env|config|command)\\.)",e.patternErrorMessage=e.patternErrorMessage||a.localize("deprecatedVariables","'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead.")}export{n as applyDeprecatedVariableMessage};
