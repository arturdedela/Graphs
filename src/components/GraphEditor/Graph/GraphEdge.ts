import { GraphNode } from "./GraphNode";
import { autorun, observable } from "mobx";
import bind from "../../../decorators/bind";
import { IPoint } from "./types";
import { Vector } from "./Vector";

export enum EdgeColor {
    Default = "#000",
    Hover = "#ffdd08"
}

export class GraphEdge {
    public get from() { return this._from; }
    public get to() { return this._to; }
    public get isLoop() { return this._to === this._from; }
    public get hitRegion() { return this._hitRegion; }
    public readonly key: string;
    public color: string = "#000";
    public isDirected: boolean = true;

    private readonly _hitRegionWidth = 5;
    private _path: Path2D;
    private _arrowPath: Path2D;
    private _hitRegion: Path2D;
    @observable private _from: GraphNode;
    @observable private _to: GraphNode;
    @observable private _cp: IPoint;
    @observable private _cp1: IPoint;
    @observable private _cp2: IPoint;

    constructor(
        from: GraphNode,
        to: GraphNode
    ) {
        this._from = from;
        this._to = to;

        this.key = `edge_${this.from.x}:${this.from.y}_${Date.now()}`;
        this.initControlPoint();

        autorun(this.createPath);
    }

    public moveControlPoint(x: number, y: number) {
        this._cp = { x, y };
        if (this.isLoop) {
            this.calcLoopControlPoints();
        }
    }

    public swapDirection() {
        if (this.isLoop) {
            return;
        }

        const tmp = this._to;
        this._to = this._from;
        this._from = tmp;
    }

    public paint(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke(this._path);
        if (this.isDirected) {
            ctx.stroke(this._arrowPath);
        }

        ctx.restore();
    }

    @bind
    private createPath() {
        const { x: cpx, y: cpy } = this._cp;

        this._path = new Path2D();
        this._path.moveTo(this._from.x, this._from.y);

        if (this.isLoop) {
            this._path.bezierCurveTo(this._cp1.x, this._cp1.y, this._cp2.x, this._cp2.y, this._to.x, this._to.y);
        } else {
            this._path.quadraticCurveTo(cpx, cpy, this._to.x, this._to.y);
        }

        if (this.isDirected) {
            this.createDirectionArrow();
        }
        this.createHitRegion();
    }

    private createDirectionArrow() {
        const { x, y } = this._to;
        const cpx = this.isLoop ? this._cp2.x : this._cp.x;
        const cpy = this.isLoop ? this._cp2.y : this._cp.y;
        const v = new Vector(x - cpx, y - cpy);
        v.rotate(Math.PI / 8);
        v.length = 20;

        this._arrowPath = new Path2D();
        this._arrowPath.moveTo(x - v.x, y - v.y);
        this._arrowPath.lineTo(x, y);

        v.rotate(-Math.PI / 4);
        this._arrowPath.lineTo(x - v.x, y - v.y);
    }

    private createHitRegion() {
        this._hitRegion = new Path2D();
        const { x: cpx, y: cpy } = this._cp;

        if (this.isLoop) {
            const { x: cp1x, y: cp1y } = this._cp1;
            const { x: cp2x, y: cp2y } = this._cp2;
            const v1 = new Vector(this._from.x - cp1x, this._from.y - cp1y);
            const v2 = new Vector(this._from.x - cp2x, this._from.y - cp2y);
            const v3 = new Vector(cp1x - this._to.x, cp1y - this._to.y);
            const v4 = new Vector(cp2x - this._to.x, cp2y - this._to.y);
            [v1, v2, v3, v4].forEach(v => {
                v.rotate(Math.PI / 2);
                v.length = this._hitRegionWidth;
            });

            const v5 = new Vector(this._from.x - cpx, this._from.y - cpy);
            v5.length = this._hitRegionWidth * 2;

            this._hitRegion.moveTo(this._from.x - v1.x, this._from.y - v1.y);

            this._hitRegion.bezierCurveTo(
                cp1x - v2.x - v5.x,
                cp1y - v2.y - v5.y,
                cp2x - v3.x - v5.x,
                cp2y - v3.y - v5.y,
                this._to.x - v4.x, this._to.y - v4.y
            );

            this._hitRegion.lineTo(this._to.x + v4.x, this._to.y + v4.y);

            this._hitRegion.bezierCurveTo(
                cp2x + v3.x + v5.x,
                cp2y + v3.y + v5.y,
                cp1x + v2.x + v5.x,
                cp1y + v2.y + v5.y,
                this._from.x + v1.x, this._from.y + v1.y
            );
        } else {
            const v1 = new Vector(this._from.x - cpx, this._from.y - cpy);
            const v2 = new Vector(this._from.x - this._to.x, this._from.y - this._to.y);
            const v3 = new Vector(cpx - this._to.x, cpy - this._to.y);
            [v1, v2, v3].forEach(v => {
                v.rotate(Math.PI / 2);
                v.length = this._hitRegionWidth;
            });

            this._hitRegion.moveTo(this._from.x + v1.x, this._from.y + v1.y);

            this._hitRegion.quadraticCurveTo(cpx + v2.x, cpy + v2.y, this._to.x + v3.x, this._to.y + v3.y);
            this._hitRegion.lineTo(this._to.x - v3.x, this._to.y - v3.y);
            this._hitRegion.quadraticCurveTo(cpx - v2.x, cpy - v2.y, this._from.x - v1.x, this._from.y - v1.y);
        }

        this._hitRegion.closePath();
    }

    private initControlPoint() {
        let incidentCount = 0;
        this._from.incidentEdges.forEach(edge => this._to.incidentEdges.has(edge) && incidentCount++);

        if (this.isLoop) {
            this._cp = {
                x: this._from.x + 4 * this._from.radius * (incidentCount + 1),
                y: this._from.y
            };
            this.calcLoopControlPoints();

            return;
        }

        const v = new Vector(this._from.x - this._to.x, this._from.y - this._to.y);
        v.rotate(Math.PI / 2);
        v.length = 15 * incidentCount;
        const sign = incidentCount % 2 === 0 ? -1 : 1;

        this._cp = {
            x: (this._from.x + this._to.x) / 2 + sign * v.x,
            y: (this._from.y + this._to.y) / 2 + sign * v.y
        };
    }
    
    private calcLoopControlPoints() {
        const { x: cpx, y: cpy } = this._cp;
        const v1 = new Vector(this._from.x - cpx, this._from.y - cpy);
        v1.rotate(Math.PI / 2);
        v1.length = 50;

        this._cp1 = {
            x: cpx - v1.x,
            y: cpy - v1.y
        };

        this._cp2 = {
            x: cpx + v1.x,
            y: cpy + v1.y
        };
    }
}