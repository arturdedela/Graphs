import * as React from "react";
import "./style.scss";
import bind from "../../decorators/bind";
import { GraphNode, NodeColors } from "./Graph/GraphNode";
import RadioGroup from "../RadioGroup/RadioGroup";
import { EdgeColor, GraphEdge } from "./Graph/GraphEdge";
import { Graph, IGraphRaw } from "./Graph/Graph";
import CanvasContextMenu, { IMenuItemProps } from "../CanvasContextMenu/CanvasContextMenu";
import { StateHistory } from "./StateHistory";
import { Button } from "semantic-ui-react";

const LEFT_MOUSE_BUTTON = 0;

enum EditMode {
    Nodes,
    Edges
}

class GraphEditor extends React.Component {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private get canvas() { return this.canvasRef.current; }
    private canvasID = "graph-canvas";

    private ctx: CanvasRenderingContext2D;

    private graph = new Graph();
    private graphHistory = new StateHistory<IGraphRaw>();

    private clickedNodeKey: string = "";
    private ctxMenuNodeKey: string = "";

    private newEdge?: GraphEdge;
    private clickedEdgeKey: string = "";
    private hoveredEdge: string = "";
    private ctxMenuEdgeKey: string = "";

    private editMode: EditMode = EditMode.Nodes;

    public componentDidMount() {
        this.ctx = this.canvas.getContext("2d");

        this.graphHistory.add(this.graph.toObject());
        this.graphHistory.onHistoryChange = this.handleGraphHistoryChange;

        this.redraw();
    }

    public render() {
        return (
            <div>
                <canvas
                    ref={this.canvasRef}
                    id={this.canvasID}
                    width={1080}
                    height={500}
                    className="canvas"
                    onMouseDown={this.canvasMouseDownHandler}
                    onMouseMove={this.canvasMouseMoveHandler}
                    onMouseUp={this.canvasMouseUpHandler}
                    onMouseOut={this.canvasMouseUpHandler}
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

                <Button onClick={this.graphHistory.back}>Back</Button>
                <Button onClick={this.graphHistory.forward}>Forward</Button>

                <CanvasContextMenu
                    canvasID={this.canvasID}
                    chooseItemsBeforeOpen={this.chooseContextMenu}
                />
            </div>
        );
    }

    @bind
    private redraw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.graph.paint(this.ctx);

        if (this.newEdge) {
            this.newEdge.paint(this.ctx);
        }
    }

    @bind
    private handleGraphHistoryChange(state: IGraphRaw) {
        this.graph = Graph.fromObject(state);
        this.redraw();
    }

    @bind
    private changeEditMode(mode: EditMode) {
        this.editMode = mode;
    }

    @bind
    private addNode(clientX: number, clientY: number) {
        const { x, y } = this.clientToCanvas(clientX, clientY);

        this.graph.addNode(x, y);

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private deleteNode() {
        this.graph.removeNode(this.ctxMenuNodeKey);

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private toggleEdgeDirection() {
        const edge = this.graph.getEdge(this.ctxMenuEdgeKey);
        edge.isDirected = !edge.isDirected;

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private changeEdgeDirection() {
        this.graph.getEdge(this.ctxMenuEdgeKey).swapDirection();

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private deleteEdge() {
        this.graph.removeEdge(this.ctxMenuEdgeKey);
        this.hoveredEdge = "";

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private getNodeFromCoordinates(x: number, y: number) {
        const node = this.graph.nodes.find(n => this.ctx.isPointInPath(n.path, x, y));

        return node ? node.key : "";
    }

    @bind
    private getEdgeFromCoordinates(x: number, y: number) {
        const edge = this.graph.edges.find(e => this.ctx.isPointInPath(e.hitRegion, x, y));

        return edge ? edge.key : "";
    }

    @bind
    private canvasMouseDownHandler(e: React.MouseEvent) {
        if (e.button !== LEFT_MOUSE_BUTTON) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.clickedNodeKey) {
            this.graph.getNode(this.clickedNodeKey).color = NodeColors.Default;
        }

        this.clickedNodeKey = this.getNodeFromCoordinates(x, y);

        if (this.clickedNodeKey) {
            if (this.editMode === EditMode.Nodes) {
                this.graph.getNode(this.clickedNodeKey).color = NodeColors.Active;
            }
            else if (this.editMode === EditMode.Edges) {
                this.newEdge = new GraphEdge(this.graph.getNode(this.clickedNodeKey), new GraphNode(x, y));
            }
        }

        if (this.editMode === EditMode.Edges) {
            this.clickedEdgeKey = this.getEdgeFromCoordinates(x, y);
        }

        this.redraw();
    }

    @bind
    private canvasMouseMoveHandler(e: React.MouseEvent) {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.clickedEdgeKey) {
            this.graph.getEdge(this.clickedEdgeKey).moveControlPoint(x, y);
        }
        else if (this.clickedNodeKey) {
            if (this.editMode === EditMode.Nodes) {
                this.graph.getNode(this.clickedNodeKey).moveTo(x, y);
            } else {
                this.newEdge.to.moveTo(x, y);
            }
        }
        else if (this.editMode === EditMode.Edges) {
            if (this.hoveredEdge) {
                this.graph.getEdge(this.hoveredEdge).color = EdgeColor.Default;
            }

            this.hoveredEdge = this.getEdgeFromCoordinates(x, y);
            if (this.hoveredEdge) {
                this.graph.getEdge(this.hoveredEdge).color = EdgeColor.Hover;
            }
        } else {
            return;
        }

        this.redraw();
    }

    @bind
    private canvasMouseUpHandler(e: React.MouseEvent) {
        if (this.clickedEdgeKey) {
            this.clickedEdgeKey = "";
            this.graphHistory.add(this.graph.toObject());
        }

        if (!this.clickedNodeKey) {
            return;
        }

        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        if (this.editMode === EditMode.Edges) {
            const toNode = this.getNodeFromCoordinates(x, y);

            if (toNode) {
                this.graph.addEdge(this.clickedNodeKey, toNode);
            }

            this.newEdge = undefined;
        }

        this.graph.getNode(this.clickedNodeKey).color = NodeColors.Default;
        this.clickedNodeKey = "";

        this.graphHistory.add(this.graph.toObject());
        this.redraw();
    }

    @bind
    private chooseContextMenu(e: MouseEvent): IMenuItemProps[] {
        const { x, y } = this.clientToCanvas(e.clientX, e.clientY);

        this.ctxMenuNodeKey = this.getNodeFromCoordinates(x, y);
        if (this.ctxMenuNodeKey) {
            return [
                { text: "Delete", onClick: this.deleteNode }
            ];
        }

        this.ctxMenuEdgeKey = this.getEdgeFromCoordinates(x, y);
        if (this.ctxMenuEdgeKey) {
            const { isDirected } = this.graph.getEdge(this.ctxMenuEdgeKey);
            const edgeMenu: IMenuItemProps[] = [];
            if (isDirected) {
                edgeMenu.push(
                    { text: "Make undirected", onClick: this.toggleEdgeDirection },
                    { text: "Change direction", onClick: this.changeEdgeDirection }
                );
            } else {
                edgeMenu.push(
                    { text: "Make directed", onClick: this.toggleEdgeDirection }
                );
            }
            edgeMenu.push({ text: "Delete", onClick: this.deleteEdge });

            return edgeMenu;
        }

        return [
            { text: "Add node", onClick: this.addNode }
        ];
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
