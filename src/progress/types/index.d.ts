import { AnimeGenre, IRelated } from "src/schema/anime";


export type ProgressBarEvents = 'tick' | 'increment' | 'complete' | 'error';

export type EventsArgs = {
    total: number;
    current: number;
    by?: number;
    percentage: number;
    clear: (message?:string) => void;
}


export type MultiProgressBarEventListener = (id: string, args: EventsArgs) => void;

export interface IMultiProgressBar {
    create(
        id: string,
        options: IProgressBarOptions,
    ): void;



    remove(
        id: string,
    ): void;

    tick(
        id: string,
        info?: string,
    ): void;

    increment(
        { id, by, info }: { id: string; by?: number; info?: string },
    ): void;

    reset(
        id: string,
        newToal?: number,
    ): void;

    on(
        event: ProgressBarEvents,
        listener: MultiProgressBarEventListener,
    ): void;

}

export type BarColors = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'black';
export type TimeFormat = 'ss' | 'mm' | 'hh';

export interface IProgressBarOptions {
    total?: number;
    label?: string;
    format?: string;
    barCharacter?: string;
    emptyBarCharacter?: string;
    barWidth?: number;
    barCompleteColor?: BarColors;
    barIncompleteColor?: BarColors;
    etaFormat?: TimeFormat;
    getBarColor?: (barInfo: {
        total: number;
        current: number;
        percentage: number;
    }) => BarColors;
}

export interface IProgressBar {
    tick(
        label?: string,
    ): void;
    increment({
        by,
        label
    }: {
        by?: number;
        label?: string;
    }): void;
    reset(
        newToal?: number,
    ): void;
}


declare class ProgressBar implements IProgressBar {
    tick(label?: string | undefined): void;
    increment({ by, label }: { by?: number | undefined; label?: string | undefined; }): void;
    reset(
        newToal?: number | undefined,
    ): void;
}

declare class MultiProgressBar implements IMultiProgressBar {
    create(id: string, options: IProgressBarOptions): void;
    remove(id: string): void;
    tick(id: string, info?: string | undefined): void;
    increment({ id, by, info }: { id: string; by?: number | undefined; info?: string | undefined; }): void;
    on(event: ProgressBarEvents, listener: MultiProgressBarEventListener): void;
    reset(id: string, newTotal?:number): void;
}


