import * as React from "react";
import "./style.scss";
import bind from "../../decorators/bind";
import ContextMenu from "../ContextMenu/ContextMenu";
import { GraphNode, NodeColors } from "./GraphNode";
import RadioGroup from "../RadioGroup/RadioGroup";
import { GraphEdge } from "./GraphEdge";
import { Graph } from "./Graph";


enum EditMode {
    Nodes,
    Edges
}

class GraphEditor extends React.Component {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private get canvas() { return this.canvasRef.current; }

    private ctx: CanvasRenderingContext2D;

    private graph = new Graph();

    private activeNode?: string;
    private ctxMenuNodeString: string = "";

    private newEdge?: GraphEdge;
    private ctxMenuEdgeString: string = "";

    private editMode: EditMode = EditMode.Nodes;

    public componentDidMount() {
        this.ctx = this.canvas.getContext("2d");

        // Now we have canvasRef, render ContextMenu
        this.forceUpdate();
    }

    public render() {
        return (
            <div>
                <canvas
                    ref={this.canvasRef}
                    width={900}
                    height={500}
                    className="canvas"
                    onMouseDown={this.canvasMouseDownHandler}
                    onMouseMove={this.canvasMouseMoveHandler}
                    onMouseUp={this.canvasMouseUpHandler}
                />

                <span>Edit mode:</span>
                <RadioGroup
                    radioClassName="mode-radio"
                    options={[
                        { label: "Nodes", value: EditMode.Nodes },
                        { label: "Edges", value: EditMode.Edges }
                    ]}
                    initialChecked={this.editMode}
                    onChange={this.changeEditMode}
                />

                {this.canvas &&
                <>
                <ContextMenu
                    element={this.canvas}
                    beforeOpen={this.isNodeContextMenu}
                    items={[
                        { text: "Delete", onClick: this.deleteNode }
                    ]}
                />
                <ContextMenu
                    element={this.canvas}
                    beforeOpen={this.isEdgeContextMenu}
                    items={[
                        { text: "Change weight", onClick: this.addNode }
                    ]}
                />
                <ContextMenu
                    element={this.canvas}
                    items={[
                        { text: "Add node", onClick: this.addNode }
                    ]}
                />
                </>
                }
            </div>
        );
    }

    @bind
    public redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.graph.nodes.forEach(node => {
            this.ctx.save();

            this.ctx.strokeStyle = node.color;
            this.ctx.strokeText(node.label, node.x - 3, node.y - 15, 20);
            this.ctx.stroke(node.path);

            this.ctx.restore();
        });

        this.graph.edges.forEach((edge) => {
            this.ctx.save();

            this.ctx.strokeStyle = edge.color;
            this.ctx.stroke(edge.path);

            this.ctx.restore();
        });

        if (this.newEdge) {
            this.ctx.stroke(this.newEdge.path);
        }
    }

    @bind
    private changeEditMode(mode: EditMode) {
        this.editMode = mode;
    }

    @bind
    private addNode(clientX: number, clientY: number) {
        const { x, y } = this.clientToCanvas(clientX, clientY);

        this.graph.addNode(x, y);
        this.redraw();
    }

    @bind
    private deleteNode() {
        this.graph.removeNode(this.ctxMenuNodeString);
        this.redraw();
    }

    @bind
    private getNodeFromCoordinates(x: number, y: number) {
        const node = this.graph.nodes.find(n => this.ctx.isPointInPath(n.path, x, y));

        return node ? node.key : "";
    }

    @bind
    private getEdgeFromCoordinates(x: number, y: number) {
        const edge = this.graph.edges.find(e => this.ctx.isPointInStroke(e.path, x, y));

        return edge ? edge.key : "";
    }

    @bind
    private canvasMouseDownHandler(e: React.MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.activeNode) {
            const sameSelectedNode = this.ctx.isPointInPath(this.graph.getNode(this.activeNode).path, x, y);
            if (sameSelectedNode) {
                return;
            }

            this.graph.getNode(this.activeNode).color = NodeColors.Default;
        }

        this.activeNode = this.getNodeFromCoordinates(x, y);

        if (this.activeNode) {
            this.graph.getNode(this.activeNode).color = NodeColors.Active;

            if (this.editMode === EditMode.Edges) {
                this.newEdge = new GraphEdge(this.graph.getNode(this.activeNode), new GraphNode(x, y));
            }

            this.redraw();
        }
    }

    @bind
    private canvasMouseMoveHandler(e: React.MouseEvent) {
        if (!this.activeNode) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.editMode === EditMode.Nodes) {
            this.graph.getNode(this.activeNode).moveTo(x, y);
        } else {
            this.newEdge.to.moveTo(x, y);
        }

        this.redraw();
    }

    @bind
    private canvasMouseUpHandler(e: React.MouseEvent) {
        if (!this.activeNode) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.editMode === EditMode.Edges) {
            const toNode = this.getNodeFromCoordinates(x, y);

            if (toNode) {
                this.graph.addEdge(this.activeNode, toNode);
            }

            this.newEdge = undefined;
        }

        this.graph.getNode(this.activeNode).color = NodeColors.Default;
        this.activeNode = "";
        this.redraw();
    }

    @bind
    private isNodeContextMenu(e: MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        this.ctxMenuNodeString = this.getNodeFromCoordinates(x, y);
        if (this.ctxMenuNodeString) {
            e.stopImmediatePropagation();
        }

        return !!this.ctxMenuNodeString;
    }

    @bind
    private isEdgeContextMenu(e: MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        this.ctxMenuEdgeString = this.getEdgeFromCoordinates(x, y);
        if (this.ctxMenuEdgeString) {
            e.stopImmediatePropagation();
        }

        return !!this.ctxMenuEdgeString;
    }

    @bind
    private clientToCanvas(clientX: number, clientY: number) {
        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        return { x, y };
    }
}

export default GraphEditor;
