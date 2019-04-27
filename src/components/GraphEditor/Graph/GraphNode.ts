import { observable } from "mobx";

export enum NodeColors {
    Default = "#000",
    Active = "#f83"
}

export interface IGraphNodeRaw {
    x: number;
    y: number;
    r: number;
    label: string;
    color: string;
    key: string;
    incidentEdges: string[];
}

export class GraphNode {
    public static fromObject(o: IGraphNodeRaw): GraphNode {
        const node = new GraphNode(o.x, o.y, o.label, o.key);
        node.setRadius(o.r);
        node.color = o.color;
        node.incidentEdges = new Set(o.incidentEdges);

        return node;
    }

    public readonly key: string;
    public label?: string;
    public color: string = NodeColors.Default;

    public incidentEdges: Set<string> = new Set();

    private _path: Path2D;
    public get path() { return this._path; }

    @observable private _x: number;
    public get x() { return this._x; }

    @observable private _y: number;
    public get y() { return this._y; }

    @observable private _r: number = 12;
    public get radius() { return this._r; }

    constructor(x: number, y: number, label?: string, key?: string) {
        this._x = x;
        this._y = y;
        this.label = label;

        this.key = key || `node_${x}:${y}_${Date.now()}`;

        this.createPath();
    }

    public toJSON() {
        return {
            x: this._x,
            y: this._y,
            r: this.radius,
            label: this.label,
            color: this.color,
            key: this.key,
            incidentEdges: [...this.incidentEdges.values()]
        };
    }

    public setRadius(r: number) {
        this._r = r;
        this.createPath();
    }

    public moveTo(x: number, y: number) {
        this._x = x;
        this._y = y;
        this.createPath();
    }

    private createPath() {
        this._path = new Path2D();
        this._path.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
    }
}