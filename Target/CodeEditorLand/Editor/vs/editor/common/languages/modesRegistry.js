import { Emitter } from "../../../base/common/event.js";
import { Mimes } from "../../../base/common/mime.js";
import * as nls from "../../../nls.js";
import {
  Extensions as ConfigurationExtensions
} from "../../../platform/configuration/common/configurationRegistry.js";
import { Registry } from "../../../platform/registry/common/platform.js";
const Extensions = {
  ModesRegistry: "editor.modesRegistry"
};
class EditorModesRegistry {
  _languages;
  _onDidChangeLanguages = new Emitter();
  onDidChangeLanguages = this._onDidChangeLanguages.event;
  constructor() {
    this._languages = [];
  }
  registerLanguage(def) {
    this._languages.push(def);
    this._onDidChangeLanguages.fire(void 0);
    return {
      dispose: () => {
        for (let i = 0, len = this._languages.length; i < len; i++) {
          if (this._languages[i] === def) {
            this._languages.splice(i, 1);
            return;
          }
        }
      }
    };
  }
  getLanguages() {
    return this._languages;
  }
}
const ModesRegistry = new EditorModesRegistry();
Registry.add(Extensions.ModesRegistry, ModesRegistry);
const PLAINTEXT_LANGUAGE_ID = "plaintext";
const PLAINTEXT_EXTENSION = ".txt";
ModesRegistry.registerLanguage({
  id: PLAINTEXT_LANGUAGE_ID,
  extensions: [PLAINTEXT_EXTENSION],
  aliases: [nls.localize("plainText.alias", "Plain Text"), "text"],
  mimetypes: [Mimes.text]
});
Registry.as(
  ConfigurationExtensions.Configuration
).registerDefaultConfigurations([
  {
    overrides: {
      "[plaintext]": {
        "editor.unicodeHighlight.ambiguousCharacters": false,
        "editor.unicodeHighlight.invisibleCharacters": false
      }
    }
  }
]);
export {
  EditorModesRegistry,
  Extensions,
  ModesRegistry,
  PLAINTEXT_EXTENSION,
  PLAINTEXT_LANGUAGE_ID
};
