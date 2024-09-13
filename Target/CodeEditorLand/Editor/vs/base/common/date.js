var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
import { localize } from "../../nls.js";
const minute = 60;
const hour = minute * 60;
const day = hour * 24;
const week = day * 7;
const month = day * 30;
const year = day * 365;
function fromNow(date, appendAgoLabel, useFullTimeWords, disallowNow) {
  if (typeof date !== "number") {
    date = date.getTime();
  }
  const seconds = Math.round(((/* @__PURE__ */ new Date()).getTime() - date) / 1e3);
  if (seconds < -30) {
    return localize(
      "date.fromNow.in",
      "in {0}",
      fromNow((/* @__PURE__ */ new Date()).getTime() + seconds * 1e3, false)
    );
  }
  if (!disallowNow && seconds < 30) {
    return localize("date.fromNow.now", "now");
  }
  let value;
  if (seconds < minute) {
    value = seconds;
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords ? localize(
          "date.fromNow.seconds.singular.ago.fullWord",
          "{0} second ago",
          value
        ) : localize(
          "date.fromNow.seconds.singular.ago",
          "{0} sec ago",
          value
        );
      } else {
        return useFullTimeWords ? localize(
          "date.fromNow.seconds.plural.ago.fullWord",
          "{0} seconds ago",
          value
        ) : localize(
          "date.fromNow.seconds.plural.ago",
          "{0} secs ago",
          value
        );
      }
    } else if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.seconds.singular.fullWord",
        "{0} second",
        value
      ) : localize("date.fromNow.seconds.singular", "{0} sec", value);
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.seconds.plural.fullWord",
        "{0} seconds",
        value
      ) : localize("date.fromNow.seconds.plural", "{0} secs", value);
    }
  }
  if (seconds < hour) {
    value = Math.floor(seconds / minute);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords ? localize(
          "date.fromNow.minutes.singular.ago.fullWord",
          "{0} minute ago",
          value
        ) : localize(
          "date.fromNow.minutes.singular.ago",
          "{0} min ago",
          value
        );
      } else {
        return useFullTimeWords ? localize(
          "date.fromNow.minutes.plural.ago.fullWord",
          "{0} minutes ago",
          value
        ) : localize(
          "date.fromNow.minutes.plural.ago",
          "{0} mins ago",
          value
        );
      }
    } else if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.minutes.singular.fullWord",
        "{0} minute",
        value
      ) : localize("date.fromNow.minutes.singular", "{0} min", value);
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.minutes.plural.fullWord",
        "{0} minutes",
        value
      ) : localize("date.fromNow.minutes.plural", "{0} mins", value);
    }
  }
  if (seconds < day) {
    value = Math.floor(seconds / hour);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords ? localize(
          "date.fromNow.hours.singular.ago.fullWord",
          "{0} hour ago",
          value
        ) : localize(
          "date.fromNow.hours.singular.ago",
          "{0} hr ago",
          value
        );
      } else {
        return useFullTimeWords ? localize(
          "date.fromNow.hours.plural.ago.fullWord",
          "{0} hours ago",
          value
        ) : localize(
          "date.fromNow.hours.plural.ago",
          "{0} hrs ago",
          value
        );
      }
    } else if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.hours.singular.fullWord",
        "{0} hour",
        value
      ) : localize("date.fromNow.hours.singular", "{0} hr", value);
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.hours.plural.fullWord",
        "{0} hours",
        value
      ) : localize("date.fromNow.hours.plural", "{0} hrs", value);
    }
  }
  if (seconds < week) {
    value = Math.floor(seconds / day);
    if (appendAgoLabel) {
      return value === 1 ? localize(
        "date.fromNow.days.singular.ago",
        "{0} day ago",
        value
      ) : localize(
        "date.fromNow.days.plural.ago",
        "{0} days ago",
        value
      );
    } else {
      return value === 1 ? localize("date.fromNow.days.singular", "{0} day", value) : localize("date.fromNow.days.plural", "{0} days", value);
    }
  }
  if (seconds < month) {
    value = Math.floor(seconds / week);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords ? localize(
          "date.fromNow.weeks.singular.ago.fullWord",
          "{0} week ago",
          value
        ) : localize(
          "date.fromNow.weeks.singular.ago",
          "{0} wk ago",
          value
        );
      } else {
        return useFullTimeWords ? localize(
          "date.fromNow.weeks.plural.ago.fullWord",
          "{0} weeks ago",
          value
        ) : localize(
          "date.fromNow.weeks.plural.ago",
          "{0} wks ago",
          value
        );
      }
    } else if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.weeks.singular.fullWord",
        "{0} week",
        value
      ) : localize("date.fromNow.weeks.singular", "{0} wk", value);
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.weeks.plural.fullWord",
        "{0} weeks",
        value
      ) : localize("date.fromNow.weeks.plural", "{0} wks", value);
    }
  }
  if (seconds < year) {
    value = Math.floor(seconds / month);
    if (appendAgoLabel) {
      if (value === 1) {
        return useFullTimeWords ? localize(
          "date.fromNow.months.singular.ago.fullWord",
          "{0} month ago",
          value
        ) : localize(
          "date.fromNow.months.singular.ago",
          "{0} mo ago",
          value
        );
      } else {
        return useFullTimeWords ? localize(
          "date.fromNow.months.plural.ago.fullWord",
          "{0} months ago",
          value
        ) : localize(
          "date.fromNow.months.plural.ago",
          "{0} mos ago",
          value
        );
      }
    } else if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.months.singular.fullWord",
        "{0} month",
        value
      ) : localize("date.fromNow.months.singular", "{0} mo", value);
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.months.plural.fullWord",
        "{0} months",
        value
      ) : localize("date.fromNow.months.plural", "{0} mos", value);
    }
  }
  value = Math.floor(seconds / year);
  if (appendAgoLabel) {
    if (value === 1) {
      return useFullTimeWords ? localize(
        "date.fromNow.years.singular.ago.fullWord",
        "{0} year ago",
        value
      ) : localize(
        "date.fromNow.years.singular.ago",
        "{0} yr ago",
        value
      );
    } else {
      return useFullTimeWords ? localize(
        "date.fromNow.years.plural.ago.fullWord",
        "{0} years ago",
        value
      ) : localize(
        "date.fromNow.years.plural.ago",
        "{0} yrs ago",
        value
      );
    }
  } else if (value === 1) {
    return useFullTimeWords ? localize(
      "date.fromNow.years.singular.fullWord",
      "{0} year",
      value
    ) : localize("date.fromNow.years.singular", "{0} yr", value);
  } else {
    return useFullTimeWords ? localize("date.fromNow.years.plural.fullWord", "{0} years", value) : localize("date.fromNow.years.plural", "{0} yrs", value);
  }
}
__name(fromNow, "fromNow");
function fromNowByDay(date, appendAgoLabel, useFullTimeWords) {
  if (typeof date !== "number") {
    date = date.getTime();
  }
  const todayMidnightTime = /* @__PURE__ */ new Date();
  todayMidnightTime.setHours(0, 0, 0, 0);
  const yesterdayMidnightTime = new Date(todayMidnightTime.getTime());
  yesterdayMidnightTime.setDate(yesterdayMidnightTime.getDate() - 1);
  if (date > todayMidnightTime.getTime()) {
    return localize("today", "Today");
  }
  if (date > yesterdayMidnightTime.getTime()) {
    return localize("yesterday", "Yesterday");
  }
  return fromNow(date, appendAgoLabel, useFullTimeWords);
}
__name(fromNowByDay, "fromNowByDay");
function getDurationString(ms, useFullTimeWords) {
  const seconds = Math.abs(ms / 1e3);
  if (seconds < 1) {
    return useFullTimeWords ? localize("duration.ms.full", "{0} milliseconds", ms) : localize("duration.ms", "{0}ms", ms);
  }
  if (seconds < minute) {
    return useFullTimeWords ? localize("duration.s.full", "{0} seconds", Math.round(ms) / 1e3) : localize("duration.s", "{0}s", Math.round(ms) / 1e3);
  }
  if (seconds < hour) {
    return useFullTimeWords ? localize(
      "duration.m.full",
      "{0} minutes",
      Math.round(ms / (1e3 * minute))
    ) : localize(
      "duration.m",
      "{0} mins",
      Math.round(ms / (1e3 * minute))
    );
  }
  if (seconds < day) {
    return useFullTimeWords ? localize(
      "duration.h.full",
      "{0} hours",
      Math.round(ms / (1e3 * hour))
    ) : localize("duration.h", "{0} hrs", Math.round(ms / (1e3 * hour)));
  }
  return localize("duration.d", "{0} days", Math.round(ms / (1e3 * day)));
}
__name(getDurationString, "getDurationString");
function toLocalISOString(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0") + "T" + String(date.getHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + (date.getMilliseconds() / 1e3).toFixed(3).slice(2, 5) + "Z";
}
__name(toLocalISOString, "toLocalISOString");
export {
  fromNow,
  fromNowByDay,
  getDurationString,
  toLocalISOString
};
//# sourceMappingURL=date.js.map
