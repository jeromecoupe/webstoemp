const { DateTime } = require("luxon");

module.exports = (date, format, locale = "en") => {
  const jsDate = new Date(date);
  const dt = DateTime.fromJSDate(jsDate);
  return dt.setLocale(locale).toFormat(format);
};
