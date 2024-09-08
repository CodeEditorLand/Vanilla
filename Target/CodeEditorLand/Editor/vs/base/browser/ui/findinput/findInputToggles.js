import * as nls from "../../../../nls.js";
import { Codicon } from "../../../common/codicons.js";
import { getDefaultHoverDelegate } from "../hover/hoverDelegateFactory.js";
import { Toggle } from "../toggle/toggle.js";
const NLS_CASE_SENSITIVE_TOGGLE_LABEL = nls.localize(
  "caseDescription",
  "Match Case"
);
const NLS_WHOLE_WORD_TOGGLE_LABEL = nls.localize(
  "wordsDescription",
  "Match Whole Word"
);
const NLS_REGEX_TOGGLE_LABEL = nls.localize(
  "regexDescription",
  "Use Regular Expression"
);
class CaseSensitiveToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.caseSensitive,
      title: NLS_CASE_SENSITIVE_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
class WholeWordsToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.wholeWord,
      title: NLS_WHOLE_WORD_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
class RegexToggle extends Toggle {
  constructor(opts) {
    super({
      icon: Codicon.regex,
      title: NLS_REGEX_TOGGLE_LABEL + opts.appendTitle,
      isChecked: opts.isChecked,
      hoverDelegate: opts.hoverDelegate ?? getDefaultHoverDelegate("element"),
      inputActiveOptionBorder: opts.inputActiveOptionBorder,
      inputActiveOptionForeground: opts.inputActiveOptionForeground,
      inputActiveOptionBackground: opts.inputActiveOptionBackground
    });
  }
}
export {
  CaseSensitiveToggle,
  RegexToggle,
  WholeWordsToggle
};
