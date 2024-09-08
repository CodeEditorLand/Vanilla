import { exec } from "child_process";
import { isWindows } from "../common/platform.js";
const windowsTerminalEncodings = {
  "437": "cp437",
  // United States
  "850": "cp850",
  // Multilingual(Latin I)
  "852": "cp852",
  // Slavic(Latin II)
  "855": "cp855",
  // Cyrillic(Russian)
  "857": "cp857",
  // Turkish
  "860": "cp860",
  // Portuguese
  "861": "cp861",
  // Icelandic
  "863": "cp863",
  // Canadian - French
  "865": "cp865",
  // Nordic
  "866": "cp866",
  // Russian
  "869": "cp869",
  // Modern Greek
  "936": "cp936",
  // Simplified Chinese
  "1252": "cp1252"
  // West European Latin
};
function toIconvLiteEncoding(encodingName) {
  const normalizedEncodingName = encodingName.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
  const mapped = JSCHARDET_TO_ICONV_ENCODINGS[normalizedEncodingName];
  return mapped || normalizedEncodingName;
}
const JSCHARDET_TO_ICONV_ENCODINGS = {
  ibm866: "cp866",
  big5: "cp950"
};
const UTF8 = "utf8";
async function resolveTerminalEncoding(verbose) {
  let rawEncodingPromise;
  const cliEncodingEnv = process.env["VSCODE_CLI_ENCODING"];
  if (cliEncodingEnv) {
    if (verbose) {
      console.log(
        `Found VSCODE_CLI_ENCODING variable: ${cliEncodingEnv}`
      );
    }
    rawEncodingPromise = Promise.resolve(cliEncodingEnv);
  } else if (isWindows) {
    rawEncodingPromise = new Promise((resolve) => {
      if (verbose) {
        console.log('Running "chcp" to detect terminal encoding...');
      }
      exec("chcp", (err, stdout, stderr) => {
        if (stdout) {
          if (verbose) {
            console.log(`Output from "chcp" command is: ${stdout}`);
          }
          const windowsTerminalEncodingKeys = Object.keys(
            windowsTerminalEncodings
          );
          for (const key of windowsTerminalEncodingKeys) {
            if (stdout.indexOf(key) >= 0) {
              return resolve(windowsTerminalEncodings[key]);
            }
          }
        }
        return resolve(void 0);
      });
    });
  } else {
    rawEncodingPromise = new Promise((resolve) => {
      if (verbose) {
        console.log(
          'Running "locale charmap" to detect terminal encoding...'
        );
      }
      exec("locale charmap", (err, stdout, stderr) => resolve(stdout));
    });
  }
  const rawEncoding = await rawEncodingPromise;
  if (verbose) {
    console.log(`Detected raw terminal encoding: ${rawEncoding}`);
  }
  if (!rawEncoding || rawEncoding.toLowerCase() === "utf-8" || rawEncoding.toLowerCase() === UTF8) {
    return UTF8;
  }
  return toIconvLiteEncoding(rawEncoding);
}
export {
  resolveTerminalEncoding
};
