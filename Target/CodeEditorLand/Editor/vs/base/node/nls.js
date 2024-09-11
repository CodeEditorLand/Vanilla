var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import * as path from "path";
import * as fs from "fs";
import * as perf from "../common/performance.js";
const module = { exports: {} };
(function() {
  const isESM = true;
  function factory(path2, fs2, perf2) {
    async function exists(path3) {
      try {
        await fs2.promises.access(path3);
        return true;
      } catch {
        return false;
      }
    }
    __name(exists, "exists");
    function touch(path3) {
      const date = /* @__PURE__ */ new Date();
      return fs2.promises.utimes(path3, date, date);
    }
    __name(touch, "touch");
    async function getLanguagePackConfigurations(userDataPath) {
      const configFile = path2.join(userDataPath, "languagepacks.json");
      try {
        return JSON.parse(await fs2.promises.readFile(configFile, "utf-8"));
      } catch (err) {
        return void 0;
      }
    }
    __name(getLanguagePackConfigurations, "getLanguagePackConfigurations");
    function resolveLanguagePackLanguage(languagePacks, locale) {
      try {
        while (locale) {
          if (languagePacks[locale]) {
            return locale;
          }
          const index = locale.lastIndexOf("-");
          if (index > 0) {
            locale = locale.substring(0, index);
          } else {
            return void 0;
          }
        }
      } catch (error) {
        console.error("Resolving language pack configuration failed.", error);
      }
      return void 0;
    }
    __name(resolveLanguagePackLanguage, "resolveLanguagePackLanguage");
    function defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath) {
      perf2.mark("code/didGenerateNls");
      return {
        userLocale,
        osLocale,
        resolvedLanguage: "en",
        defaultMessagesFile: path2.join(nlsMetadataPath, "nls.messages.json"),
        // NLS: below 2 are a relic from old times only used by vscode-nls and deprecated
        locale: userLocale,
        availableLanguages: {}
      };
    }
    __name(defaultNLSConfiguration, "defaultNLSConfiguration");
    async function resolveNLSConfiguration2({ userLocale, osLocale, userDataPath, commit, nlsMetadataPath }) {
      perf2.mark("code/willGenerateNls");
      if (process.env["VSCODE_DEV"] || userLocale === "pseudo" || userLocale.startsWith("en") || !commit || !userDataPath) {
        return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
      }
      try {
        const languagePacks = await getLanguagePackConfigurations(userDataPath);
        if (!languagePacks) {
          return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
        }
        const resolvedLanguage = resolveLanguagePackLanguage(languagePacks, userLocale);
        if (!resolvedLanguage) {
          return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
        }
        const languagePack = languagePacks[resolvedLanguage];
        const mainLanguagePackPath = languagePack?.translations?.["vscode"];
        if (!languagePack || typeof languagePack.hash !== "string" || !languagePack.translations || typeof mainLanguagePackPath !== "string" || !await exists(mainLanguagePackPath)) {
          return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
        }
        const languagePackId = `${languagePack.hash}.${resolvedLanguage}`;
        const globalLanguagePackCachePath = path2.join(userDataPath, "clp", languagePackId);
        const commitLanguagePackCachePath = path2.join(globalLanguagePackCachePath, commit);
        const languagePackMessagesFile = path2.join(commitLanguagePackCachePath, "nls.messages.json");
        const translationsConfigFile = path2.join(globalLanguagePackCachePath, "tcf.json");
        const languagePackCorruptMarkerFile = path2.join(globalLanguagePackCachePath, "corrupted.info");
        if (await exists(languagePackCorruptMarkerFile)) {
          await fs2.promises.rm(globalLanguagePackCachePath, { recursive: true, force: true, maxRetries: 3 });
        }
        const result = {
          userLocale,
          osLocale,
          resolvedLanguage,
          defaultMessagesFile: path2.join(nlsMetadataPath, "nls.messages.json"),
          languagePack: {
            translationsConfigFile,
            messagesFile: languagePackMessagesFile,
            corruptMarkerFile: languagePackCorruptMarkerFile
          },
          // NLS: below properties are a relic from old times only used by vscode-nls and deprecated
          locale: userLocale,
          availableLanguages: { "*": resolvedLanguage },
          _languagePackId: languagePackId,
          _languagePackSupport: true,
          _translationsConfigFile: translationsConfigFile,
          _cacheRoot: globalLanguagePackCachePath,
          _resolvedLanguagePackCoreLocation: commitLanguagePackCachePath,
          _corruptedFile: languagePackCorruptMarkerFile
        };
        if (await exists(commitLanguagePackCachePath)) {
          touch(commitLanguagePackCachePath).catch(() => {
          });
          perf2.mark("code/didGenerateNls");
          return result;
        }
        const [
          ,
          nlsDefaultKeys,
          nlsDefaultMessages,
          nlsPackdata
        ] = await Promise.all([
          fs2.promises.mkdir(commitLanguagePackCachePath, { recursive: true }),
          JSON.parse(await fs2.promises.readFile(path2.join(nlsMetadataPath, "nls.keys.json"), "utf-8")),
          JSON.parse(await fs2.promises.readFile(path2.join(nlsMetadataPath, "nls.messages.json"), "utf-8")),
          JSON.parse(await fs2.promises.readFile(mainLanguagePackPath, "utf-8"))
        ]);
        const nlsResult = [];
        let nlsIndex = 0;
        for (const [moduleId, nlsKeys] of nlsDefaultKeys) {
          const moduleTranslations = nlsPackdata.contents[moduleId];
          for (const nlsKey of nlsKeys) {
            nlsResult.push(moduleTranslations?.[nlsKey] || nlsDefaultMessages[nlsIndex]);
            nlsIndex++;
          }
        }
        await Promise.all([
          fs2.promises.writeFile(languagePackMessagesFile, JSON.stringify(nlsResult), "utf-8"),
          fs2.promises.writeFile(translationsConfigFile, JSON.stringify(languagePack.translations), "utf-8")
        ]);
        perf2.mark("code/didGenerateNls");
        return result;
      } catch (error) {
        console.error("Generating translation files failed.", error);
      }
      return defaultNLSConfiguration(userLocale, osLocale, nlsMetadataPath);
    }
    __name(resolveNLSConfiguration2, "resolveNLSConfiguration");
    return {
      resolveNLSConfiguration: resolveNLSConfiguration2
    };
  }
  __name(factory, "factory");
  if (!isESM && typeof define === "function") {
    define(["path", "fs", "vs/base/common/performance"], function(path2, fs2, perf2) {
      return factory(path2, fs2, perf2);
    });
  } else if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = factory(path, fs, perf);
  } else {
    throw new Error("vs/base/node/nls defined in UNKNOWN context (neither requirejs or commonjs)");
  }
})();
const resolveNLSConfiguration = module.exports.resolveNLSConfiguration;
export {
  resolveNLSConfiguration
};
//# sourceMappingURL=nls.js.map
