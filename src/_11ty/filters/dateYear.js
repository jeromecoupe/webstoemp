const { DateTime } = require("luxon");

module.exports = (date) => {
  const jsDate = new Date(date);
  const fullYear = jsDate.getFullYear();
  return fullYear;
};
