const calculateEtaInSeconds = (lastTime: number, total: number, current: number) => {
    const now = Date.now() / 1000;
    const diff = now - lastTime;

    //Get average time per tick
    const distanceLeft = total - current;

    const eta = distanceLeft * diff;

    //Convert to seconds
    return eta.toFixed(2);
}




const findNextNonWrittenLine = () => new Promise((resolve) => {
    const termcodes = { cursorGetPosition: '\u001b[6n' };

    process.stdin.setEncoding('utf8');
    process.stdin.setRawMode(true);

    const readfx = function () {
        const buf = process.stdin.read();
        const str = JSON.stringify(buf); // "\u001b[9;1R"
        const regex = /\[(.*)/g;
        const xy = regex.exec(str)![0].replace(/\[|R"/g, '').split(';');
        const pos = { rows: xy[0], cols: xy[1] };
        process.stdin.setRawMode(false);
        resolve(pos);
    }

    process.stdin.once('readable', readfx);
    process.stdout.write(termcodes.cursorGetPosition);
});

export { calculateEtaInSeconds, findNextNonWrittenLine }