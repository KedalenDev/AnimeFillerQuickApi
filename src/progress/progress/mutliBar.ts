import { EventsArgs, IMultiProgressBar, MultiProgressBarEventListener, ProgressBarEvents } from "../types";
import { IProgressBarOptions, ProgressBar } from "./progressBar";







class MultiProgressBar implements IMultiProgressBar {
    reset(id: string, total?:number): void {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }

        progressBar.reset(total);
    }


    private _progressBars: Map<string, ProgressBar> = new Map();

    private _listeners: Map<ProgressBarEvents, MultiProgressBarEventListener[]> = new Map();
    private _findProgressBar(id: string): ProgressBar | undefined {
        return this._progressBars.get(id);
    }

    create(id: string, options: IProgressBarOptions): void {
        const progressBar = this._findProgressBar(id);
        if (progressBar) {
            throw new Error(`Progress bar with id ${id} already exists`);
        }

        this._progressBars.set(id, new ProgressBar(options));

        const bar = this._findProgressBar(id);

        //Subscribe to all events

        

        bar?.setCursor(0, 
            this._progressBars.size - 1,
            )
    }

    remove(id: string): void {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }

        this._progressBars.delete(id);
    }
    tick(id: string, info?: string | undefined): void {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }

        progressBar.tick(info);
    }
    increment({ id, by, info }: { id: string; by?: number | undefined; info?: string | undefined; }): void {
        const progressBar = this._findProgressBar(id);
        if (!progressBar) {
            throw new Error(`Progress bar with id ${id} does not exist`);
        }

        progressBar.increment({ by, info });
    }

    on(event: ProgressBarEvents, listener: MultiProgressBarEventListener): void {
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


export { MultiProgressBar }

