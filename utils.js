'use strict';

const readline = require('readline');
const { dashes } = require('./spinners');

const VALID_STATUSES = ['succeed', 'fail', 'spinning', 'non-spinnable', 'stopped'];
const VALID_COLORS = ['black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright'];

function purgeSpinnerOptions(options) {
  const { text, status } = options;
  const opts = { text, status };
  const colors = colorOptions(options);

  if (!VALID_STATUSES.includes(status)) delete opts.status;
  if (typeof text !== 'string') delete opts.text;

  return { ...colors, ...opts };
}

function purgeSpinnersOptions({ spinner, disableSpins, ...others }) {
  const colors = colorOptions(others);
  const spinOption = typeof disableSpins === 'boolean' ? { disableSpins } : {};
  if (process.platform === 'win32') {
    spinner = dashes;
  }

  return isValidSpinner(spinner) ? { ...colors, ...spinOption, spinner } : { ...colors, ...spinOption };
}

function isValidSpinner(spinner = {}) {
  const { interval, frames } = spinner;
  return typeof spinner === 'object' && Array.isArray(frames) && frames.length > 0 && typeof interval === 'number';
}

function colorOptions({ color, succeedColor, failColor, spinnerColor }) {
  const colors = { color, succeedColor, failColor, spinnerColor };
  Object.keys(colors).forEach(key => {
    if (!VALID_COLORS.includes(colors[key])) delete colors[key];
  });

  return colors;
}

function breakText(text, prefixLength) {
  const columns = process.stderr.columns || 95;
  return text.length  >= columns - prefixLength
    ? `${text.substring(0, columns - prefixLength - 1)}\n${breakText(text.substring(columns - prefixLength - 1, text.length), 0)}`
    : text;
}

function getLinesLength(text, prefixLength) {
  return text
    .split('\n')
    .map((line, index) => index === 0 ? line.length + prefixLength : line.length);
}

function writeStream(stream, output, rawLines) {
  stream.write(output);
  readline.moveCursor(stream, 0, -rawLines.length);
}

function cleanStream(stream, rawLines) {
  rawLines.forEach((lineLength, index) => {
    readline.moveCursor(stream, lineLength, index);
    readline.clearLine(stream, 1);
    readline.moveCursor(stream, -lineLength, -index);
  });
  readline.moveCursor(stream, 0, rawLines.length);
  readline.clearScreenDown(stream);
  readline.moveCursor(stream, 0, -rawLines.length);
}

module.exports = {
  purgeSpinnersOptions,
  purgeSpinnerOptions,
  colorOptions,
  breakText,
  getLinesLength,
  writeStream,
  cleanStream,
}
