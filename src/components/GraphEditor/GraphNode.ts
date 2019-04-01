import { observable } from "mobx";

export enum NodeColors {
    Default = "#000",
    Active = "#f83"
}

export class GraphNode {
    public readonly key: string;
    public label?: string;
    public color?: string;

    public incidentEdges: string[] = [];

    private _path: Path2D;
    public get path() { return this._path; }

    @observable private _x: number;
    public get x() { return this._x; }

    @observable private _y: number;
    public get y() { return this._y; }

    constructor(x: number, y: number, label?: string, color: string = NodeColors.Default) {
        this._x = x;
        this._y = y;
        this.color = color;
        this.label = label;

        this.key = `node_${x}:${y}_${Date.now()}`;

        this.createPath();
    }

    public toJSON(): string {
        return JSON.stringify({
            x: this._x,
            y: this._y
        });
    }

    public moveTo(x: number, y: number) {
        this._x = x;
        this._y = y;
        this.createPath();
    }

    private createPath() {
        this._path = new Path2D();
        this._path.arc(this._x, this._y, 12, 0, 2 * Math.PI);
    }
}