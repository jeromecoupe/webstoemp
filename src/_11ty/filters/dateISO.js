const { DateTime } = require("luxon");

module.exports = (date) => {
  const jsDate = new Date(date);
  const dt = DateTime.fromJSDate(jsDate);
  return dt.toISO();
};
