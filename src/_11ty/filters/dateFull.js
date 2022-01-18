const { DateTime } = require("luxon");

module.exports = (date, locale = "en") => {
  const jsDate = new Date(date);
  const dt = DateTime.fromJSDate(jsDate);
  return dt.setLocale(locale).toLocaleString(DateTime.DATE_FULL);
};
