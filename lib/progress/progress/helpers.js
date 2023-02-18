"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findNextNonWrittenLine = exports.calculateEtaInSeconds = void 0;
const calculateEtaInSeconds = (lastTime, total, current) => {
    const now = Date.now() / 1000;
    const diff = now - lastTime;
    //Get average time per tick
    const distanceLeft = total - current;
    const eta = distanceLeft * diff;
    //Convert to seconds
    return eta.toFixed(2);
};
exports.calculateEtaInSeconds = calculateEtaInSeconds;
const findNextNonWrittenLine = () => new Promise((resolve) => {
    const termcodes = { cursorGetPosition: '\u001b[6n' };
    process.stdin.setEncoding('utf8');
    process.stdin.setRawMode(true);
    const readfx = function () {
        const buf = process.stdin.read();
        const str = JSON.stringify(buf); // "\u001b[9;1R"
        const regex = /\[(.*)/g;
        const xy = regex.exec(str)[0].replace(/\[|R"/g, '').split(';');
        const pos = { rows: xy[0], cols: xy[1] };
        process.stdin.setRawMode(false);
        resolve(pos);
    };
    process.stdin.once('readable', readfx);
    process.stdout.write(termcodes.cursorGetPosition);
});
exports.findNextNonWrittenLine = findNextNonWrittenLine;
//# sourceMappingURL=helpers.js.map