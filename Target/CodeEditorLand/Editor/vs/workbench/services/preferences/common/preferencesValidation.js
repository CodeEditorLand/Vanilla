var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Color } from "../../../../base/common/color.js";
import {
  isObject,
  isString,
  isStringArray,
  isUndefinedOrNull
} from "../../../../base/common/types.js";
import * as nls from "../../../../nls.js";
function canBeType(propTypes, ...types) {
  return types.some((t) => propTypes.includes(t));
}
__name(canBeType, "canBeType");
function isNullOrEmpty(value) {
  return value === "" || isUndefinedOrNull(value);
}
__name(isNullOrEmpty, "isNullOrEmpty");
function createValidator(prop) {
  const type = Array.isArray(prop.type) ? prop.type : [prop.type];
  const isNullable = canBeType(type, "null");
  const isNumeric = (canBeType(type, "number") || canBeType(type, "integer")) && (type.length === 1 || type.length === 2 && isNullable);
  const numericValidations = getNumericValidators(prop);
  const stringValidations = getStringValidators(prop);
  const arrayValidator = getArrayValidator(prop);
  const objectValidator = getObjectValidator(prop);
  return (value) => {
    if (isNullable && isNullOrEmpty(value)) {
      return "";
    }
    const errors = [];
    if (arrayValidator) {
      const err = arrayValidator(value);
      if (err) {
        errors.push(err);
      }
    }
    if (objectValidator) {
      const err = objectValidator(value);
      if (err) {
        errors.push(err);
      }
    }
    if (prop.type === "boolean" && value !== true && value !== false) {
      errors.push(
        nls.localize(
          "validations.booleanIncorrectType",
          'Incorrect type. Expected "boolean".'
        )
      );
    }
    if (isNumeric) {
      if (isNullOrEmpty(value) || typeof value === "boolean" || Array.isArray(value) || isNaN(+value)) {
        errors.push(
          nls.localize(
            "validations.expectedNumeric",
            "Value must be a number."
          )
        );
      } else {
        errors.push(
          ...numericValidations.filter((validator) => !validator.isValid(+value)).map((validator) => validator.message)
        );
      }
    }
    if (prop.type === "string") {
      if (prop.enum && !isStringArray(prop.enum)) {
        errors.push(
          nls.localize(
            "validations.stringIncorrectEnumOptions",
            "The enum options should be strings, but there is a non-string option. Please file an issue with the extension author."
          )
        );
      } else if (isString(value)) {
        errors.push(
          ...stringValidations.filter((validator) => !validator.isValid(value)).map((validator) => validator.message)
        );
      } else {
        errors.push(
          nls.localize(
            "validations.stringIncorrectType",
            'Incorrect type. Expected "string".'
          )
        );
      }
    }
    if (errors.length) {
      return prop.errorMessage ? [prop.errorMessage, ...errors].join(" ") : errors.join(" ");
    }
    return "";
  };
}
__name(createValidator, "createValidator");
function getInvalidTypeError(value, type) {
  if (typeof type === "undefined") {
    return;
  }
  const typeArr = Array.isArray(type) ? type : [type];
  if (!typeArr.some((_type) => valueValidatesAsType(value, _type))) {
    return nls.localize(
      "invalidTypeError",
      "Setting has an invalid type, expected {0}. Fix in JSON.",
      JSON.stringify(type)
    );
  }
  return;
}
__name(getInvalidTypeError, "getInvalidTypeError");
function valueValidatesAsType(value, type) {
  const valueType = typeof value;
  if (type === "boolean") {
    return valueType === "boolean";
  } else if (type === "object") {
    return value && !Array.isArray(value) && valueType === "object";
  } else if (type === "null") {
    return value === null;
  } else if (type === "array") {
    return Array.isArray(value);
  } else if (type === "string") {
    return valueType === "string";
  } else if (type === "number" || type === "integer") {
    return valueType === "number";
  }
  return true;
}
__name(valueValidatesAsType, "valueValidatesAsType");
function toRegExp(pattern) {
  try {
    return new RegExp(pattern, "u");
  } catch (e) {
    try {
      return new RegExp(pattern);
    } catch (e2) {
      console.error(
        nls.localize(
          "regexParsingError",
          "Error parsing the following regex both with and without the u flag:"
        ),
        pattern
      );
      return /.*/;
    }
  }
}
__name(toRegExp, "toRegExp");
function getStringValidators(prop) {
  const uriRegex = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
  let patternRegex;
  if (typeof prop.pattern === "string") {
    patternRegex = toRegExp(prop.pattern);
  }
  return [
    {
      enabled: prop.maxLength !== void 0,
      isValid: /* @__PURE__ */ __name((value) => value.length <= prop.maxLength, "isValid"),
      message: nls.localize(
        "validations.maxLength",
        "Value must be {0} or fewer characters long.",
        prop.maxLength
      )
    },
    {
      enabled: prop.minLength !== void 0,
      isValid: /* @__PURE__ */ __name((value) => value.length >= prop.minLength, "isValid"),
      message: nls.localize(
        "validations.minLength",
        "Value must be {0} or more characters long.",
        prop.minLength
      )
    },
    {
      enabled: patternRegex !== void 0,
      isValid: /* @__PURE__ */ __name((value) => patternRegex.test(value), "isValid"),
      message: prop.patternErrorMessage || nls.localize(
        "validations.regex",
        "Value must match regex `{0}`.",
        prop.pattern
      )
    },
    {
      enabled: prop.format === "color-hex",
      isValid: /* @__PURE__ */ __name((value) => Color.Format.CSS.parseHex(value), "isValid"),
      message: nls.localize(
        "validations.colorFormat",
        "Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA."
      )
    },
    {
      enabled: prop.format === "uri" || prop.format === "uri-reference",
      isValid: /* @__PURE__ */ __name((value) => !!value.length, "isValid"),
      message: nls.localize("validations.uriEmpty", "URI expected.")
    },
    {
      enabled: prop.format === "uri" || prop.format === "uri-reference",
      isValid: /* @__PURE__ */ __name((value) => uriRegex.test(value), "isValid"),
      message: nls.localize("validations.uriMissing", "URI is expected.")
    },
    {
      enabled: prop.format === "uri",
      isValid: /* @__PURE__ */ __name((value) => {
        const matches = value.match(uriRegex);
        return !!(matches && matches[2]);
      }, "isValid"),
      message: nls.localize(
        "validations.uriSchemeMissing",
        "URI with a scheme is expected."
      )
    },
    {
      enabled: prop.enum !== void 0,
      isValid: /* @__PURE__ */ __name((value) => {
        return prop.enum.includes(value);
      }, "isValid"),
      message: nls.localize(
        "validations.invalidStringEnumValue",
        "Value is not accepted. Valid values: {0}.",
        prop.enum ? prop.enum.map((key) => `"${key}"`).join(", ") : "[]"
      )
    }
  ].filter((validation) => validation.enabled);
}
__name(getStringValidators, "getStringValidators");
function getNumericValidators(prop) {
  const type = Array.isArray(prop.type) ? prop.type : [prop.type];
  const isNullable = canBeType(type, "null");
  const isIntegral = canBeType(type, "integer") && (type.length === 1 || type.length === 2 && isNullable);
  const isNumeric = canBeType(type, "number", "integer") && (type.length === 1 || type.length === 2 && isNullable);
  if (!isNumeric) {
    return [];
  }
  let exclusiveMax;
  let exclusiveMin;
  if (typeof prop.exclusiveMaximum === "boolean") {
    exclusiveMax = prop.exclusiveMaximum ? prop.maximum : void 0;
  } else {
    exclusiveMax = prop.exclusiveMaximum;
  }
  if (typeof prop.exclusiveMinimum === "boolean") {
    exclusiveMin = prop.exclusiveMinimum ? prop.minimum : void 0;
  } else {
    exclusiveMin = prop.exclusiveMinimum;
  }
  return [
    {
      enabled: exclusiveMax !== void 0 && (prop.maximum === void 0 || exclusiveMax <= prop.maximum),
      isValid: /* @__PURE__ */ __name((value) => value < exclusiveMax, "isValid"),
      message: nls.localize(
        "validations.exclusiveMax",
        "Value must be strictly less than {0}.",
        exclusiveMax
      )
    },
    {
      enabled: exclusiveMin !== void 0 && (prop.minimum === void 0 || exclusiveMin >= prop.minimum),
      isValid: /* @__PURE__ */ __name((value) => value > exclusiveMin, "isValid"),
      message: nls.localize(
        "validations.exclusiveMin",
        "Value must be strictly greater than {0}.",
        exclusiveMin
      )
    },
    {
      enabled: prop.maximum !== void 0 && (exclusiveMax === void 0 || exclusiveMax > prop.maximum),
      isValid: /* @__PURE__ */ __name((value) => value <= prop.maximum, "isValid"),
      message: nls.localize(
        "validations.max",
        "Value must be less than or equal to {0}.",
        prop.maximum
      )
    },
    {
      enabled: prop.minimum !== void 0 && (exclusiveMin === void 0 || exclusiveMin < prop.minimum),
      isValid: /* @__PURE__ */ __name((value) => value >= prop.minimum, "isValid"),
      message: nls.localize(
        "validations.min",
        "Value must be greater than or equal to {0}.",
        prop.minimum
      )
    },
    {
      enabled: prop.multipleOf !== void 0,
      isValid: /* @__PURE__ */ __name((value) => value % prop.multipleOf === 0, "isValid"),
      message: nls.localize(
        "validations.multipleOf",
        "Value must be a multiple of {0}.",
        prop.multipleOf
      )
    },
    {
      enabled: isIntegral,
      isValid: /* @__PURE__ */ __name((value) => value % 1 === 0, "isValid"),
      message: nls.localize(
        "validations.expectedInteger",
        "Value must be an integer."
      )
    }
  ].filter((validation) => validation.enabled);
}
__name(getNumericValidators, "getNumericValidators");
function getArrayValidator(prop) {
  if (prop.type === "array" && prop.items && !Array.isArray(prop.items)) {
    const propItems = prop.items;
    if (propItems && !Array.isArray(propItems.type)) {
      const withQuotes = /* @__PURE__ */ __name((s) => `'` + s + `'`, "withQuotes");
      return (value) => {
        if (!value) {
          return null;
        }
        let message = "";
        if (!Array.isArray(value)) {
          message += nls.localize(
            "validations.arrayIncorrectType",
            "Incorrect type. Expected an array."
          );
          message += "\n";
          return message;
        }
        const arrayValue = value;
        if (prop.uniqueItems) {
          if (new Set(arrayValue).size < arrayValue.length) {
            message += nls.localize(
              "validations.stringArrayUniqueItems",
              "Array has duplicate items"
            );
            message += "\n";
          }
        }
        if (prop.minItems && arrayValue.length < prop.minItems) {
          message += nls.localize(
            "validations.stringArrayMinItem",
            "Array must have at least {0} items",
            prop.minItems
          );
          message += "\n";
        }
        if (prop.maxItems && arrayValue.length > prop.maxItems) {
          message += nls.localize(
            "validations.stringArrayMaxItem",
            "Array must have at most {0} items",
            prop.maxItems
          );
          message += "\n";
        }
        if (propItems.type === "string") {
          if (!isStringArray(arrayValue)) {
            message += nls.localize(
              "validations.stringArrayIncorrectType",
              "Incorrect type. Expected a string array."
            );
            message += "\n";
            return message;
          }
          if (typeof propItems.pattern === "string") {
            const patternRegex = toRegExp(propItems.pattern);
            arrayValue.forEach((v) => {
              if (!patternRegex.test(v)) {
                message += propItems.patternErrorMessage || nls.localize(
                  "validations.stringArrayItemPattern",
                  "Value {0} must match regex {1}.",
                  withQuotes(v),
                  withQuotes(propItems.pattern)
                );
              }
            });
          }
          const propItemsEnum = propItems.enum;
          if (propItemsEnum) {
            arrayValue.forEach((v) => {
              if (propItemsEnum.indexOf(v) === -1) {
                message += nls.localize(
                  "validations.stringArrayItemEnum",
                  "Value {0} is not one of {1}",
                  withQuotes(v),
                  "[" + propItemsEnum.map(withQuotes).join(", ") + "]"
                );
                message += "\n";
              }
            });
          }
        } else if (propItems.type === "integer" || propItems.type === "number") {
          arrayValue.forEach((v) => {
            const errorMessage = getErrorsForSchema(propItems, v);
            if (errorMessage) {
              message += `${v}: ${errorMessage}
`;
            }
          });
        }
        return message;
      };
    }
  }
  return null;
}
__name(getArrayValidator, "getArrayValidator");
function getObjectValidator(prop) {
  if (prop.type === "object") {
    const { properties, patternProperties, additionalProperties } = prop;
    return (value) => {
      if (!value) {
        return null;
      }
      const errors = [];
      if (isObject(value)) {
        Object.keys(value).forEach((key) => {
          const data = value[key];
          if (properties && key in properties) {
            const errorMessage = getErrorsForSchema(
              properties[key],
              data
            );
            if (errorMessage) {
              errors.push(`${key}: ${errorMessage}
`);
            }
            return;
          }
          if (patternProperties) {
            for (const pattern in patternProperties) {
              if (RegExp(pattern).test(key)) {
                const errorMessage = getErrorsForSchema(
                  patternProperties[pattern],
                  data
                );
                if (errorMessage) {
                  errors.push(`${key}: ${errorMessage}
`);
                }
                return;
              }
            }
          }
          if (additionalProperties === false) {
            errors.push(
              nls.localize(
                "validations.objectPattern",
                "Property {0} is not allowed.\n",
                key
              )
            );
          } else if (typeof additionalProperties === "object") {
            const errorMessage = getErrorsForSchema(
              additionalProperties,
              data
            );
            if (errorMessage) {
              errors.push(`${key}: ${errorMessage}
`);
            }
          }
        });
      } else {
        errors.push(
          nls.localize(
            "validations.objectIncorrectType",
            "Incorrect type. Expected an object."
          )
        );
      }
      if (errors.length) {
        return prop.errorMessage ? [prop.errorMessage, ...errors].join(" ") : errors.join(" ");
      }
      return "";
    };
  }
  return null;
}
__name(getObjectValidator, "getObjectValidator");
function getErrorsForSchema(propertySchema, data) {
  const validator = createValidator(propertySchema);
  const errorMessage = validator(data);
  return errorMessage;
}
__name(getErrorsForSchema, "getErrorsForSchema");
export {
  createValidator,
  getInvalidTypeError
};
//# sourceMappingURL=preferencesValidation.js.map
