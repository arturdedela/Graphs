import * as React from "react";
import "./style.scss";
import bind from "../../decorators/bind";
import ContextMenu from "../ContextMenu/ContextMenu";
import { GraphNode, NodeColors } from "./GraphNode";


class GraphEditor extends React.Component {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private get canvas() { return this.canvasRef.current; }

    private ctx: CanvasRenderingContext2D;

    private nodes: GraphNode[] = [];
    private activeNode: number = -1;

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
            this.ctx.beginPath();

            this.ctx.strokeStyle = node.color;
            this.ctx.strokeText(node.label, node.x - 3, node.y - 15, 20);

            this.ctx.stroke(node.path);
            this.ctx.restore();
        });
    }

    @bind
    private addNode(clientX: number, clientY: number) {
        const { x, y } = this.clientToCanvas(clientX, clientY);

        this.nodes.push(new GraphNode(x, y, this.nodes.length.toString()));
        this.redraw();
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

        this.activeNode = this.nodes.findIndex(node => this.ctx.isPointInPath(node.path, x, y));

        if (this.activeNode !== - 1) {
            this.nodes[this.activeNode].color = NodeColors.Active;

            this.redraw();
        }
    }

    @bind
    private canvasMouseMoveHandler(e: React.MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.activeNode !== - 1) {
            this.nodes[this.activeNode].moveTo(x, y);
            this.redraw();
        }
    }

    @bind
    private canvasMouseUpHandler(e: React.MouseEvent) {
        if (this.activeNode !== -1) {
            this.nodes[this.activeNode].color = NodeColors.Default;
            this.activeNode = -1;
            this.redraw();
        }
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
