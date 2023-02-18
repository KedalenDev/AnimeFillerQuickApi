"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressBar = void 0;
const helpers_1 = require("./helpers");
const DEFAULT_OPTIONS = {
    total: 100,
    label: '',
    format: '{label} {bar} {percentage}% - {current}/{total} - {eta}s {info}',
    barCharacter: '█',
    emptyBarCharacter: '░',
    barWidth: 25,
    barCompleteColor: 'green',
    barIncompleteColor: 'white',
    etaFormat: 'ss'
};
class ProgressBar {
    constructor(options) {
        this._hasCalledStart = false;
        this._complete = false;
        this._cursor = {
            x: 0,
            y: 0
        };
        this._lastRenderTime = 0;
        this._listeners = new Map();
        this._options = options ? Object.assign(Object.assign({}, DEFAULT_OPTIONS), options) : DEFAULT_OPTIONS;
        this._total = (options === null || options === void 0 ? void 0 : options.total) || 100;
        this._current = 0;
        const rows = process.stdout.rows || 0;
        const cols = process.stdout.columns || 0;
        this._cursor = {
            x: 0,
            y: 0
        };
    }
    reset(nTotal) {
        this._current = 0;
        this._total = nTotal || this._total;
        this._complete = false;
    }
    setCursor(x, y) {
        this._cursor = {
            x,
            y
        };
    }
    start(newLine = true) {
        //Save cursor position
        process.stdout.write('\x1B7');
        this._hasCalledStart = true;
        if (newLine) {
            process.stdout.write('\n');
            process.stdout.write('\n');
        }
        this._render();
    }
    tick(info) {
        var _a;
        this.increment({ by: 1, info });
        //Send tick event
        (_a = this._listeners.get('tick')) === null || _a === void 0 ? void 0 : _a.forEach(listener => {
            listener({
                current: this._current,
                total: this._total,
                clear: this._clear.bind(this),
                percentage: (this._current / this._total) * 100
            });
        });
    }
    increment({ by, info }) {
        var _a;
        this._current += by || 1;
        //Send increment event
        (_a = this._listeners.get('increment')) === null || _a === void 0 ? void 0 : _a.forEach(listener => {
            listener({
                by: by || 1,
                current: this._current,
                total: this._total,
                percentage: (this._current / this._total) * 100,
                clear: this._clear.bind(this)
            });
        });
        this._render(info);
    }
    _clear(message) {
        process.stdout.clearLine(0);
        if (message) {
            process.stdout.write(`${message}\n`);
        }
    }
    _getBarColor(color) {
        if (this._options.getBarColor) {
            const barInfo = {
                total: this._total,
                current: this._current,
                percentage: (this._current / this._total) * 100
            };
            color = this._options.getBarColor(barInfo);
        }
        switch (color) {
            case 'red':
                return ProgressBar.red;
            case 'green':
                return ProgressBar.green;
            case 'yellow':
                return ProgressBar.yellow;
            case 'blue':
                return ProgressBar.blue;
            case 'magenta':
                return ProgressBar.magenta;
            case 'cyan':
                return ProgressBar.cyan;
            case 'white':
                return ProgressBar.white;
            case 'black':
                return ProgressBar.black;
            default:
                return '';
        }
    }
    _getEta() {
        const eta = (0, helpers_1.calculateEtaInSeconds)(this._lastRenderTime, this._total, this._current);
        this._lastRenderTime = Date.now() / 1000;
        return eta;
    }
    _render(info) {
        //Restore cursor
        var _a;
        if (!this._hasCalledStart) {
            this.start();
            this._hasCalledStart = true;
        }
        if (this._complete) {
            //If we call render we should return;
            return;
        }
        process.stdout.write('\x1B8');
        this._clear();
        //Add render time to array
        //Get current time in ms
        //Clear the line
        const percentage = this._current / this._total;
        const barWidth = this._options.barWidth || 25;
        const barComplete = Math.round(barWidth * percentage);
        const barIncomplete = barWidth - barComplete;
        const barCompleteColor = this._options.barCompleteColor || 'green';
        const barIncompleteColor = this._options.barIncompleteColor || 'white';
        const barCharacter = this._options.barCharacter || DEFAULT_OPTIONS.barCharacter;
        const emptyBarCharacter = this._options.emptyBarCharacter || DEFAULT_OPTIONS.emptyBarCharacter;
        const T_LABEL = this._options.label || '';
        const bar = this._getBarColor(barCompleteColor) + barCharacter.repeat(barComplete) + this._getBarColor(barIncompleteColor) + emptyBarCharacter.repeat(barIncomplete) + '\x1b[0m';
        const label = this._options.label || '';
        const format = this._options.format || `${label} ${bar} {percentage}%`;
        const output = format.replace('{percentage}', (percentage * 100).toFixed(0))
            .replace('{bar}', bar)
            .replace('{label}', T_LABEL)
            .replace('{current}', this._current.toString())
            .replace('{total}', this._total.toString())
            .replace('{eta}', this._getEta())
            .replace('{info}', info ? `| ${info} ` : ``);
        process.stdout.write(`\r${output}`);
        //Check if complete
        if (this._current >= this._total) {
            this._complete = true;
            (_a = this._listeners.get('complete')) === null || _a === void 0 ? void 0 : _a.forEach(listener => {
                listener({
                    current: this._current,
                    total: this._total,
                    percentage: 100,
                    clear: this._clear.bind(this)
                });
            });
        }
    }
    on(event, listener) {
        var _a;
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        if (typeof listener === 'function') {
            (_a = this._listeners.get(event)) === null || _a === void 0 ? void 0 : _a.push(listener);
        }
    }
}
exports.ProgressBar = ProgressBar;
ProgressBar.restoreCursor = "\x1B[?25h";
ProgressBar.saveCursor = "\x1B7";
ProgressBar.black = "\x1b[30m";
ProgressBar.red = "\x1b[31m";
ProgressBar.green = "\x1b[32m";
ProgressBar.yellow = "\x1b[33m";
ProgressBar.blue = "\x1b[34m";
ProgressBar.magenta = "\x1b[35m";
ProgressBar.cyan = "\x1b[36m";
ProgressBar.white = "\x1b[37m";
//# sourceMappingURL=progressBar.js.map