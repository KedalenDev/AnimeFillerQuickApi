"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiProgressBar = void 0;
const progressBar_1 = require("./progressBar");
class MultiProgressBar {
    constructor() {
        this._progressBars = new Map();
        this._listeners = new Map();
    }
    reset(id, total) {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }
        progressBar.reset(total);
    }
    _findProgressBar(id) {
        return this._progressBars.get(id);
    }
    create(id, options) {
        const progressBar = this._findProgressBar(id);
        if (progressBar) {
            throw new Error(`Progress bar with id ${id} already exists`);
        }
        this._progressBars.set(id, new progressBar_1.ProgressBar(options));
        const bar = this._findProgressBar(id);
        //Subscribe to all events
        bar === null || bar === void 0 ? void 0 : bar.setCursor(0, this._progressBars.size - 1);
    }
    remove(id) {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }
        this._progressBars.delete(id);
    }
    tick(id, info) {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }
        progressBar.tick(info);
    }
    increment({ id, by, info }) {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }
        progressBar.increment({ by, info });
    }
    on(event, listener) {
        const listeners = this._listeners.get(event) || [];
        listeners.push(listener);
        this._listeners.set(event, listeners);
        this._progressBars.forEach((progressBar, id) => {
            progressBar.on(event, (args) => {
                listener(id, args);
            });
        });
    }
}
exports.MultiProgressBar = MultiProgressBar;
//# sourceMappingURL=mutliBar.js.map