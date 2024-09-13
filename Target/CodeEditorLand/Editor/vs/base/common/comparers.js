var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { Lazy } from "./lazy.js";
import { sep } from "./path.js";
const intlFileNameCollatorBaseNumeric = new Lazy(() => {
  const collator = new Intl.Collator(void 0, { numeric: true, sensitivity: "base" });
  return {
    collator,
    collatorIsNumeric: collator.resolvedOptions().numeric
  };
});
const intlFileNameCollatorNumeric = new Lazy(() => {
  const collator = new Intl.Collator(void 0, { numeric: true });
  return {
    collator
  };
});
const intlFileNameCollatorNumericCaseInsensitive = new Lazy(() => {
  const collator = new Intl.Collator(void 0, { numeric: true, sensitivity: "accent" });
  return {
    collator
  };
});
function compareFileNames(one, other, caseSensitive = false) {
  const a = one || "";
  const b = other || "";
  const result = intlFileNameCollatorBaseNumeric.value.collator.compare(a, b);
  if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && a !== b) {
    return a < b ? -1 : 1;
  }
  return result;
}
__name(compareFileNames, "compareFileNames");
function compareFileNamesDefault(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileNamesDefault, "compareFileNamesDefault");
function compareFileNamesUpper(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileNamesUpper, "compareFileNamesUpper");
function compareFileNamesLower(one, other) {
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  one = one || "";
  other = other || "";
  return compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileNamesLower, "compareFileNamesLower");
function compareFileNamesUnicode(one, other) {
  one = one || "";
  other = other || "";
  if (one === other) {
    return 0;
  }
  return one < other ? -1 : 1;
}
__name(compareFileNamesUnicode, "compareFileNamesUnicode");
function compareFileExtensions(one, other) {
  const [oneName, oneExtension] = extractNameAndExtension(one);
  const [otherName, otherExtension] = extractNameAndExtension(other);
  let result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneExtension, otherExtension);
  if (result === 0) {
    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && oneExtension !== otherExtension) {
      return oneExtension < otherExtension ? -1 : 1;
    }
    result = intlFileNameCollatorBaseNumeric.value.collator.compare(oneName, otherName);
    if (intlFileNameCollatorBaseNumeric.value.collatorIsNumeric && result === 0 && oneName !== otherName) {
      return oneName < otherName ? -1 : 1;
    }
  }
  return result;
}
__name(compareFileExtensions, "compareFileExtensions");
function compareFileExtensionsDefault(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileExtensionsDefault, "compareFileExtensionsDefault");
function compareFileExtensionsUpper(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareCaseUpperFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileExtensionsUpper, "compareFileExtensionsUpper");
function compareFileExtensionsLower(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one);
  const otherExtension = extractExtension(other);
  const collatorNumeric = intlFileNameCollatorNumeric.value.collator;
  const collatorNumericCaseInsensitive = intlFileNameCollatorNumericCaseInsensitive.value.collator;
  return compareAndDisambiguateByLength(collatorNumericCaseInsensitive, oneExtension, otherExtension) || compareCaseLowerFirst(one, other) || compareAndDisambiguateByLength(collatorNumeric, one, other);
}
__name(compareFileExtensionsLower, "compareFileExtensionsLower");
function compareFileExtensionsUnicode(one, other) {
  one = one || "";
  other = other || "";
  const oneExtension = extractExtension(one).toLowerCase();
  const otherExtension = extractExtension(other).toLowerCase();
  if (oneExtension !== otherExtension) {
    return oneExtension < otherExtension ? -1 : 1;
  }
  if (one !== other) {
    return one < other ? -1 : 1;
  }
  return 0;
}
__name(compareFileExtensionsUnicode, "compareFileExtensionsUnicode");
const FileNameMatch = /^(.*?)(\.([^.]*))?$/;
function extractNameAndExtension(str, dotfilesAsNames = false) {
  const match = str ? FileNameMatch.exec(str) : [];
  let result = [match && match[1] || "", match && match[3] || ""];
  if (dotfilesAsNames && (!result[0] && result[1] || result[0] && result[0].charAt(0) === ".")) {
    result = [result[0] + "." + result[1], ""];
  }
  return result;
}
__name(extractNameAndExtension, "extractNameAndExtension");
function extractExtension(str) {
  const match = str ? FileNameMatch.exec(str) : [];
  return match && match[1] && match[1].charAt(0) !== "." && match[3] || "";
}
__name(extractExtension, "extractExtension");
function compareAndDisambiguateByLength(collator, one, other) {
  const result = collator.compare(one, other);
  if (result !== 0) {
    return result;
  }
  if (one.length !== other.length) {
    return one.length < other.length ? -1 : 1;
  }
  return 0;
}
__name(compareAndDisambiguateByLength, "compareAndDisambiguateByLength");
function startsWithLower(string) {
  const character = string.charAt(0);
  return character.toLocaleUpperCase() !== character ? true : false;
}
__name(startsWithLower, "startsWithLower");
function startsWithUpper(string) {
  const character = string.charAt(0);
  return character.toLocaleLowerCase() !== character ? true : false;
}
__name(startsWithUpper, "startsWithUpper");
function compareCaseLowerFirst(one, other) {
  if (startsWithLower(one) && startsWithUpper(other)) {
    return -1;
  }
  return startsWithUpper(one) && startsWithLower(other) ? 1 : 0;
}
__name(compareCaseLowerFirst, "compareCaseLowerFirst");
function compareCaseUpperFirst(one, other) {
  if (startsWithUpper(one) && startsWithLower(other)) {
    return -1;
  }
  return startsWithLower(one) && startsWithUpper(other) ? 1 : 0;
}
__name(compareCaseUpperFirst, "compareCaseUpperFirst");
function comparePathComponents(one, other, caseSensitive = false) {
  if (!caseSensitive) {
    one = one && one.toLowerCase();
    other = other && other.toLowerCase();
  }
  if (one === other) {
    return 0;
  }
  return one < other ? -1 : 1;
}
__name(comparePathComponents, "comparePathComponents");
function comparePaths(one, other, caseSensitive = false) {
  const oneParts = one.split(sep);
  const otherParts = other.split(sep);
  const lastOne = oneParts.length - 1;
  const lastOther = otherParts.length - 1;
  let endOne, endOther;
  for (let i = 0; ; i++) {
    endOne = lastOne === i;
    endOther = lastOther === i;
    if (endOne && endOther) {
      return compareFileNames(oneParts[i], otherParts[i], caseSensitive);
    } else if (endOne) {
      return -1;
    } else if (endOther) {
      return 1;
    }
    const result = comparePathComponents(oneParts[i], otherParts[i], caseSensitive);
    if (result !== 0) {
      return result;
    }
  }
}
__name(comparePaths, "comparePaths");
function compareAnything(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();
  const prefixCompare = compareByPrefix(one, other, lookFor);
  if (prefixCompare) {
    return prefixCompare;
  }
  const elementASuffixMatch = elementAName.endsWith(lookFor);
  const elementBSuffixMatch = elementBName.endsWith(lookFor);
  if (elementASuffixMatch !== elementBSuffixMatch) {
    return elementASuffixMatch ? -1 : 1;
  }
  const r = compareFileNames(elementAName, elementBName);
  if (r !== 0) {
    return r;
  }
  return elementAName.localeCompare(elementBName);
}
__name(compareAnything, "compareAnything");
function compareByPrefix(one, other, lookFor) {
  const elementAName = one.toLowerCase();
  const elementBName = other.toLowerCase();
  const elementAPrefixMatch = elementAName.startsWith(lookFor);
  const elementBPrefixMatch = elementBName.startsWith(lookFor);
  if (elementAPrefixMatch !== elementBPrefixMatch) {
    return elementAPrefixMatch ? -1 : 1;
  } else if (elementAPrefixMatch && elementBPrefixMatch) {
    if (elementAName.length < elementBName.length) {
      return -1;
    }
    if (elementAName.length > elementBName.length) {
      return 1;
    }
  }
  return 0;
}
__name(compareByPrefix, "compareByPrefix");
export {
  compareAnything,
  compareByPrefix,
  compareFileExtensions,
  compareFileExtensionsDefault,
  compareFileExtensionsLower,
  compareFileExtensionsUnicode,
  compareFileExtensionsUpper,
  compareFileNames,
  compareFileNamesDefault,
  compareFileNamesLower,
  compareFileNamesUnicode,
  compareFileNamesUpper,
  comparePaths
};
//# sourceMappingURL=comparers.js.map
