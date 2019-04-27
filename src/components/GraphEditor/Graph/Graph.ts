import { GraphNode, IGraphNodeRaw } from "./GraphNode";
import { GraphEdge, IGraphEdgeRaw } from "./GraphEdge";

export interface IGraphRaw {
    nodes: IGraphNodeRaw[];
    edges: IGraphEdgeRaw[];
}

export class Graph {
    public static fromObject(o: IGraphRaw): Graph {
        const graph = new Graph();
        graph._nodes = new Map(o.nodes.map(node => [node.key, GraphNode.fromObject(node)]));
        graph._edges = new Map(o.edges.map(edge => {
            const from = graph._nodes.get(edge.fromNodeKey);
            const to = graph._nodes.get(edge.toNodeKey);

            return [edge.key, GraphEdge.fromObject(edge, from, to)];
        }));

        return graph;
    }

    private _nodes: Map<string, GraphNode> = new Map();
    private _edges: Map<string, GraphEdge> = new Map();

    public toJSON() {
        return {
            nodes: this.nodes,
            edges: this.edges
        };
    }

    public toObject(): IGraphRaw {
        return JSON.parse(JSON.stringify(this));
    }

    public get nodes() {
        return [...this._nodes.values()];
    }

    public get edges() {
        return [...this._edges.values()];
    }

    public addNode(x: number, y: number, label: string = this.nodes.length.toString()) {
        const node = new GraphNode(x, y, label);
        this._nodes.set(node.key, node);
    }

    public getNode(nodeKey: string) {
        return this._nodes.get(nodeKey);
    }

    public removeNode(key: string) {
        this._nodes.get(key).incidentEdges.forEach(edgeKey => this.removeEdge(edgeKey));
        this._nodes.delete(key);
    }

    public addEdge(fromNodeKey: string, toNodeKey: string) {
        const from = this._nodes.get(fromNodeKey);
        const to = this._nodes.get(toNodeKey);
        const edge = new GraphEdge(from, to);
        this._edges.set(edge.key, edge);

        from.incidentEdges.add(edge.key);
        to.incidentEdges.add(edge.key);
    }

    public getEdge(edgeKey: string) {
        return this._edges.get(edgeKey);
    }

    public removeEdge(edgeKey: string) {
        const { from, to } = this.getEdge(edgeKey);
        from.incidentEdges.delete(edgeKey);
        to.incidentEdges.delete(edgeKey);
        this._edges.delete(edgeKey);
    }

    public paint(ctx: CanvasRenderingContext2D) {

        this._nodes.forEach(node => {
            ctx.save();

            ctx.strokeStyle = node.color;
            ctx.strokeText(node.label, node.x - 3, node.y - 15, 20);
            ctx.stroke(node.path);

            ctx.restore();
        });

        this._edges.forEach(edge => edge.paint(ctx));
    }
}