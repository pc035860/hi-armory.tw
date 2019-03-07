const ASSULT_INTERVAL = 19 * 3600;  // 19 hours
const ASSULT_DURATION = 7 * 3600;  // 7 hours

/**
 * calculate assult times with base
 * @param  {number} base    the base assult time in ctime
 * @param  {number} start   starting time of the calculation sequence
 * @param  {number} count   output number of assults
 */
module.exports = function (base) {
  return function calcAssultTime(start, count) {
    let cursor = base;
    while (start > cursor) {
      cursor += ASSULT_INTERVAL;
    }

    // case: assult is happening right now
    if ((cursor - ASSULT_INTERVAL) + ASSULT_DURATION >= start) {
      cursor -= ASSULT_INTERVAL;
    }

    const assults = [];
    for (let i = 0; i < count; i += 1) {
      const assultStart = cursor + (ASSULT_INTERVAL * i);
      const assultEnd = assultStart + ASSULT_DURATION;
      assults.push({
        start: assultStart,
        end: assultEnd
      });
    }
    return assults;
  };
};
