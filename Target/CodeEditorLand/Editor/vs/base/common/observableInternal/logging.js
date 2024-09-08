let globalObservableLogger;
function setLogger(logger) {
  globalObservableLogger = logger;
}
function getLogger() {
  return globalObservableLogger;
}
class ConsoleObservableLogger {
  indentation = 0;
  textToConsoleArgs(text) {
    return consoleTextToArgs([
      normalText(repeat("|  ", this.indentation)),
      text
    ]);
  }
  formatInfo(info) {
    if (!info.hadValue) {
      return [
        normalText(` `),
        styled(formatValue(info.newValue, 60), {
          color: "green"
        }),
        normalText(` (initial)`)
      ];
    }
    return info.didChange ? [
      normalText(` `),
      styled(formatValue(info.oldValue, 70), {
        color: "red",
        strikeThrough: true
      }),
      normalText(` `),
      styled(formatValue(info.newValue, 60), {
        color: "green"
      })
    ] : [normalText(` (unchanged)`)];
  }
  handleObservableChanged(observable, info) {
    console.log(
      ...this.textToConsoleArgs([
        formatKind("observable value changed"),
        styled(observable.debugName, { color: "BlueViolet" }),
        ...this.formatInfo(info)
      ])
    );
  }
  changedObservablesSets = /* @__PURE__ */ new WeakMap();
  formatChanges(changes) {
    if (changes.size === 0) {
      return void 0;
    }
    return styled(
      " (changed deps: " + [...changes].map((o) => o.debugName).join(", ") + ")",
      { color: "gray" }
    );
  }
  handleDerivedCreated(derived) {
    const existingHandleChange = derived.handleChange;
    this.changedObservablesSets.set(derived, /* @__PURE__ */ new Set());
    derived.handleChange = (observable, change) => {
      this.changedObservablesSets.get(derived).add(observable);
      return existingHandleChange.apply(derived, [observable, change]);
    };
  }
  handleDerivedRecomputed(derived, info) {
    const changedObservables = this.changedObservablesSets.get(derived);
    console.log(
      ...this.textToConsoleArgs([
        formatKind("derived recomputed"),
        styled(derived.debugName, { color: "BlueViolet" }),
        ...this.formatInfo(info),
        this.formatChanges(changedObservables),
        {
          data: [
            {
              fn: derived._debugNameData.referenceFn ?? derived._computeFn
            }
          ]
        }
      ])
    );
    changedObservables.clear();
  }
  handleFromEventObservableTriggered(observable, info) {
    console.log(
      ...this.textToConsoleArgs([
        formatKind("observable from event triggered"),
        styled(observable.debugName, { color: "BlueViolet" }),
        ...this.formatInfo(info),
        { data: [{ fn: observable._getValue }] }
      ])
    );
  }
  handleAutorunCreated(autorun) {
    const existingHandleChange = autorun.handleChange;
    this.changedObservablesSets.set(autorun, /* @__PURE__ */ new Set());
    autorun.handleChange = (observable, change) => {
      this.changedObservablesSets.get(autorun).add(observable);
      return existingHandleChange.apply(autorun, [observable, change]);
    };
  }
  handleAutorunTriggered(autorun) {
    const changedObservables = this.changedObservablesSets.get(autorun);
    console.log(
      ...this.textToConsoleArgs([
        formatKind("autorun"),
        styled(autorun.debugName, { color: "BlueViolet" }),
        this.formatChanges(changedObservables),
        {
          data: [
            {
              fn: autorun._debugNameData.referenceFn ?? autorun._runFn
            }
          ]
        }
      ])
    );
    changedObservables.clear();
    this.indentation++;
  }
  handleAutorunFinished(autorun) {
    this.indentation--;
  }
  handleBeginTransaction(transaction) {
    let transactionName = transaction.getDebugName();
    if (transactionName === void 0) {
      transactionName = "";
    }
    console.log(
      ...this.textToConsoleArgs([
        formatKind("transaction"),
        styled(transactionName, { color: "BlueViolet" }),
        { data: [{ fn: transaction._fn }] }
      ])
    );
    this.indentation++;
  }
  handleEndTransaction() {
    this.indentation--;
  }
}
function consoleTextToArgs(text) {
  const styles = new Array();
  const data = [];
  let firstArg = "";
  function process(t) {
    if ("length" in t) {
      for (const item of t) {
        if (item) {
          process(item);
        }
      }
    } else if ("text" in t) {
      firstArg += `%c${t.text}`;
      styles.push(t.style);
      if (t.data) {
        data.push(...t.data);
      }
    } else if ("data" in t) {
      data.push(...t.data);
    }
  }
  process(text);
  const result = [firstArg, ...styles];
  result.push(...data);
  return result;
}
function normalText(text) {
  return styled(text, { color: "black" });
}
function formatKind(kind) {
  return styled(padStr(`${kind}: `, 10), { color: "black", bold: true });
}
function styled(text, options = {
  color: "black"
}) {
  function objToCss(styleObj) {
    return Object.entries(styleObj).reduce(
      (styleString, [propName, propValue]) => {
        return `${styleString}${propName}:${propValue};`;
      },
      ""
    );
  }
  const style = {
    color: options.color
  };
  if (options.strikeThrough) {
    style["text-decoration"] = "line-through";
  }
  if (options.bold) {
    style["font-weight"] = "bold";
  }
  return {
    text,
    style: objToCss(style)
  };
}
function formatValue(value, availableLen) {
  switch (typeof value) {
    case "number":
      return "" + value;
    case "string":
      if (value.length + 2 <= availableLen) {
        return `"${value}"`;
      }
      return `"${value.substr(0, availableLen - 7)}"+...`;
    case "boolean":
      return value ? "true" : "false";
    case "undefined":
      return "undefined";
    case "object":
      if (value === null) {
        return "null";
      }
      if (Array.isArray(value)) {
        return formatArray(value, availableLen);
      }
      return formatObject(value, availableLen);
    case "symbol":
      return value.toString();
    case "function":
      return `[[Function${value.name ? " " + value.name : ""}]]`;
    default:
      return "" + value;
  }
}
function formatArray(value, availableLen) {
  let result = "[ ";
  let first = true;
  for (const val of value) {
    if (!first) {
      result += ", ";
    }
    if (result.length - 5 > availableLen) {
      result += "...";
      break;
    }
    first = false;
    result += `${formatValue(val, availableLen - result.length)}`;
  }
  result += " ]";
  return result;
}
function formatObject(value, availableLen) {
  let result = "{ ";
  let first = true;
  for (const [key, val] of Object.entries(value)) {
    if (!first) {
      result += ", ";
    }
    if (result.length - 5 > availableLen) {
      result += "...";
      break;
    }
    first = false;
    result += `${key}: ${formatValue(val, availableLen - result.length)}`;
  }
  result += " }";
  return result;
}
function repeat(str, count) {
  let result = "";
  for (let i = 1; i <= count; i++) {
    result += str;
  }
  return result;
}
function padStr(str, length) {
  while (str.length < length) {
    str += " ";
  }
  return str;
}
export {
  ConsoleObservableLogger,
  getLogger,
  setLogger
};
