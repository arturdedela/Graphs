
export enum NodeColors {
    Default = "#000",
    Active = "#f83"
}

export class GraphNode {
    public label?: string;
    public color?: string;

    private _path: Path2D;
    public get path() { return this._path; }

    public get x() { return this._x; }
    public get y() { return this._y; }

    constructor(private _x: number, private _y: number, label?: string, color: string = NodeColors.Default) {
        this.color = color;
        this.label = label;

        this.createPath();
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