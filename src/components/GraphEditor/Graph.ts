import { GraphNode } from "./GraphNode";
import { GraphEdge } from "./GraphEdge";


export class Graph {
    private _nodes: Map<string, GraphNode> = new Map();
    private _edges: Map<string, GraphEdge> = new Map();

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
        this._nodes.get(key).incidentEdges.forEach(edgeKey => this._edges.delete(edgeKey));
        this._nodes.delete(key);
    }

    public addEdge(fromNodeKey: string, toNodeKey: string) {
        const from = this._nodes.get(fromNodeKey);
        const to = this._nodes.get(toNodeKey);
        const edge = new GraphEdge(from, to);
        this._edges.set(edge.key, edge);

        from.incidentEdges.push(edge.key);
        to.incidentEdges.push(edge.key);
    }

    public getEdge(edgeKey: string) {
        return this._edges.get(edgeKey);
    }


}