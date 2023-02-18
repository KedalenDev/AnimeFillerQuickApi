import { IProgressBarOptions, EventsArgs, IProgressBar, ProgressBarEvents, BarColors } from "../types";
import { calculateEtaInSeconds, findNextNonWrittenLine } from "./helpers";


const DEFAULT_OPTIONS: IProgressBarOptions = {
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









type ProgressEventListener = (args: EventsArgs) => void;

class ProgressBar implements IProgressBar {
    private static restoreCursor: string = "\x1B[?25h"
    private static saveCursor: string = "\x1B7"
    private static black: string = "\x1b[30m"
    private static red: string = "\x1b[31m"
    private static green: string = "\x1b[32m"
    private static yellow: string = "\x1b[33m"
    private static blue: string = "\x1b[34m"
    private static magenta: string = "\x1b[35m"
    private static cyan: string = "\x1b[36m"
    private static white: string = "\x1b[37m"
    private readonly _options: IProgressBarOptions;
    private _hasCalledStart: boolean = false;
    private _total: number;
    private _current: number;

    private _complete: boolean = false;
    private _cursor: {
        x: number;
        y: number;
    } = {
            x: 0,
            y: 0
        };
    private _lastRenderTime: number = 0;
    private _listeners: Map<ProgressBarEvents, ProgressEventListener[]> = new Map();
    constructor(options?: Partial<IProgressBarOptions>) {
        this._options = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;
        this._total = options?.total || 100;
        this._current = 0;

        const rows = process.stdout.rows || 0;
        const cols = process.stdout.columns || 0;

        this._cursor = {
            x: 0,
            y: 0
        };
    }
    reset(nTotal?:number): void {
        this._current = 0;
        this._total = nTotal || this._total;
        this._complete = false;
    }



    public setCursor(
        x: number,
        y: number,

    ) {

        this._cursor = {
            x,
            y
        };


    }

    public start(newLine:boolean=true){
        //Save cursor position
        process.stdout.write('\x1B7');
    
        this._hasCalledStart = true;
        if(newLine){
            process.stdout.write('\n');
            process.stdout.write('\n');
        }
        this._render();

    }



    public tick(info?: string) {

        this.increment({ by: 1, info });
        //Send tick event
        this._listeners.get('tick')?.forEach(listener => {
            listener({
                current: this._current,
                total: this._total,
                clear: this._clear.bind(this),
                percentage: (this._current / this._total) * 100
            });
        });
    }

    public increment({ by, info }: { by?: number; info?: string }) {
        this._current += by || 1;
        //Send increment event
        this._listeners.get('increment')?.forEach(listener => {
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

    private _clear(message?: string) {
   
        process.stdout.clearLine(0);
        if (message) {
            process.stdout.write(`${message}\n`);
        }
    }

    private _getBarColor(color: BarColors) {


        if (this._options.getBarColor) {
            const barInfo = {
                total: this._total,
                current: this._current,
                percentage: (this._current / this._total) * 100
            }
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

    private _getEta() {


        const eta = calculateEtaInSeconds(this._lastRenderTime, this._total, this._current);
        this._lastRenderTime = Date.now() / 1000;
        return eta;


    }

    private _render(info?: string) {


        
        //Restore cursor
        
        if(!this._hasCalledStart){
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
        const barCharacter = this._options.barCharacter || DEFAULT_OPTIONS.barCharacter!;
        const emptyBarCharacter = this._options.emptyBarCharacter || DEFAULT_OPTIONS.emptyBarCharacter!;




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
            this._listeners.get('complete')?.forEach(listener => {
                listener({
                    current: this._current,
                    total: this._total,
                    percentage: 100,
                    clear: this._clear.bind(this)
                });
            });
        }

    }

    on(event: ProgressBarEvents, listener: ProgressEventListener) {
        if (!this._listeners.has(event)) {
            this._listeners.set(event, []);
        }
        if (typeof listener === 'function') {
            this._listeners.get(event)?.push(listener);
        }
    }
}




export { ProgressBar, IProgressBarOptions };