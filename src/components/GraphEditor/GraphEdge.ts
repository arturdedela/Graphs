import { GraphNode } from "./GraphNode";
import { autorun, observable } from "mobx";
import bind from "../../decorators/bind";

export class GraphEdge {
    private _path: Path2D;
    public get path() { return this._path; }

    @observable private readonly _from: GraphNode;
    @observable private readonly _to: GraphNode;

    public get from() {
        return this._from;
    }

    public get to() {
        return this._to;
    }

    constructor(
        from: GraphNode,
        to: GraphNode,
        public isDirected?: boolean,
        public color?: string
    ) {
        this._from = from;
        this._to = to;

        autorun(this.createPath);
    }

    @bind
    private createPath() {
        this._path = new Path2D();
        this._path.moveTo(this._from.x, this._from.y);
        this._path.lineTo(this._to.x, this._to.y);
    }
}