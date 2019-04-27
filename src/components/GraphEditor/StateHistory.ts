import bind from "../../decorators/bind";

export class StateHistory<T = any> {
    public onHistoryChange?: (currentState: T) => void;

    private _history: T[] = [];
    private i: number = 0;

    constructor(private historyLength: number = 10) {}

    public add(state: T) {
        if (this._history.length >= this.historyLength) {
            this._history = this._history.slice(1);
        }
        this._history = this._history.slice(0, this.i + 1);

        this._history.push(state);
        this.i = this._history.length - 1;
    }

    public get current() {
        return this._history[this.i];
    }

    public get canForward() {
        return this.i < this._history.length - 1;
    }

    @bind
    public forward(): T {
        if (this.canForward) {
            ++this.i;
            if (this.onHistoryChange) {
                this.onHistoryChange(this._history[this.i]);
            }
        }

        return this._history[this.i];
    }

    public get canBack() {
        return this.i > 0;
    }

    @bind
    public back(): T {
        if (this.canBack) {
            --this.i;
            if (this.onHistoryChange) {
                this.onHistoryChange(this._history[this.i]);
            }
        }

        return this._history[this.i];
    }
}