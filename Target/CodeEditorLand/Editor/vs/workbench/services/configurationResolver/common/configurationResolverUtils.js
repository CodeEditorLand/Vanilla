import * as nls from "../../../../nls.js";
function applyDeprecatedVariableMessage(schema) {
  schema.pattern = schema.pattern || "^(?!.*\\$\\{(env|config|command)\\.)";
  schema.patternErrorMessage = schema.patternErrorMessage || nls.localize(
    "deprecatedVariables",
    "'env.', 'config.' and 'command.' are deprecated, use 'env:', 'config:' and 'command:' instead."
  );
}
export {
  applyDeprecatedVariableMessage
};
