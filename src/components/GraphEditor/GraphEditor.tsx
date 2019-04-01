import * as React from "react";
import "./style.scss";
import bind from "../../decorators/bind";
import ContextMenu from "../ContextMenu/ContextMenu";
import { GraphNode, NodeColors } from "./GraphNode";
import RadioGroup from "../RadioGroup/RadioGroup";
import { GraphEdge } from "./GraphEdge";


enum EditMode {
    Nodes,
    Edges
}

class GraphEditor extends React.Component {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private get canvas() { return this.canvasRef.current; }

    private ctx: CanvasRenderingContext2D;

    private nodes: GraphNode[] = [];
    private activeNode: number = -1;

    private edges: GraphEdge[] = [];
    private newEdge?: GraphEdge;

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
                <ContextMenu
                    element={this.canvas}
                    items={[
                        { text: "Add node", onClick: this.addNode }
                    ]}
                />
                }
            </div>
        );
    }

    @bind
    public redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.nodes.forEach(node => {
            this.ctx.save();

            this.ctx.strokeStyle = node.color;
            this.ctx.strokeText(node.label, node.x - 3, node.y - 15, 20);
            this.ctx.stroke(node.path);

            this.ctx.restore();
        });

        this.edges.forEach((edge) => {
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

        this.nodes.push(new GraphNode(x, y, this.nodes.length.toString()));
        this.redraw();
    }

    @bind
    private getNodeFromCoordinates(x: number, y: number) {
        return this.nodes.findIndex(node => this.ctx.isPointInPath(node.path, x, y));
    }

    @bind
    private getEdgeFromCoordinates(x: number, y: number) {
        return this.edges.findIndex(edge => this.ctx.isPointInStroke(edge.path, x, y));
    }

    @bind
    private canvasMouseDownHandler(e: React.MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.activeNode !== -1) {
            const sameSelectedNode = this.ctx.isPointInPath(this.nodes[this.activeNode].path, x, y);
            if (sameSelectedNode) {
                return;
            }

            this.nodes[this.activeNode].color = NodeColors.Default;
        }

        this.activeNode = this.getNodeFromCoordinates(x, y);

        if (this.activeNode !== - 1) {
            this.nodes[this.activeNode].color = NodeColors.Active;

            if (this.editMode === EditMode.Edges) {
                this.newEdge = new GraphEdge(this.nodes[this.activeNode], new GraphNode(x, y));
            }

            this.redraw();
        }
    }

    @bind
    private canvasMouseMoveHandler(e: React.MouseEvent) {
        if (this.activeNode === -1) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.editMode === EditMode.Nodes) {
            this.nodes[this.activeNode].moveTo(x, y);
        } else {
            this.newEdge.to.moveTo(x, y);
        }

        this.redraw();
    }

    @bind
    private canvasMouseUpHandler(e: React.MouseEvent) {
        if (this.activeNode === -1) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.editMode === EditMode.Edges) {
            const toIndex = this.getNodeFromCoordinates(x, y);

            if (toIndex !== -1) {
                this.edges.push(new GraphEdge(this.newEdge.from, this.nodes[toIndex]));
            }

            this.newEdge = undefined;
        }

        this.nodes[this.activeNode].color = NodeColors.Default;
        this.activeNode = -1;
        this.redraw();
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
