import * as React from "react";
import "./style.scss";
import bind from "../../decorators/bind";
import { GraphNode, NodeColors } from "./Graph/GraphNode";
import { EdgeColor, GraphEdge } from "./Graph/GraphEdge";
import { Graph, IGraphRaw } from "./Graph/Graph";
import CanvasContextMenu, { IMenuItemProps } from "../CanvasContextMenu/CanvasContextMenu";
import { StateHistory } from "./StateHistory";
import {
    Button,
    Checkbox,
    Dropdown,
    Icon,
    Input,
    InputOnChangeData,
    Menu,
    Modal,
    Popup,
    Segment,
    Sidebar
} from "semantic-ui-react";
import { observable } from "mobx";
import { observer } from "mobx-react";

const LEFT_MOUSE_BUTTON = 0;

@observer
class GraphEditor extends React.Component {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private get canvas() { return this.canvasRef.current; }
    private canvasID = "graph-canvas";
    @observable private canvasWidth: number;
    @observable private canvasHeight: number;

    private ctx: CanvasRenderingContext2D;

    private graph = new Graph();
    private graphHistory = new StateHistory<IGraphRaw>();

    private clickedNodeKey: string = "";
    private ctxMenuNodeKey: string = "";

    private newEdge?: GraphEdge;
    private clickedEdgeKey: string = "";
    @observable private hoveredEdge: string = "";
    @observable private weightPopupPosition = { x: 0, y: 0};
    private ctxMenuEdgeKey: string = "";

    @observable private nodeEditing: boolean = true;
    @observable private showAdjacencyMatrix: boolean = false;

    @observable private modalVisible = false;
    private modalInputValue: string;
    private onModalConfirm: () => any;

    @observable private sidebarVisible = false;
    private sidebarTimeout: any;

    public componentDidMount() {
        this.resizeCanvas();

        this.ctx = this.canvas.getContext("2d");

        this.graphHistory.add(this.graph.toObject());
        this.graphHistory.onHistoryChange = this.handleGraphHistoryChange;

        this.redraw();
    }

    public render() {
        return (
            <div>
                <Sidebar.Pushable as={Segment}>
                    <Sidebar
                        id="canvas-sidebar"
                        as={Menu}
                        animation="scale down"
                        onHide={this.hideSideBar}
                        direction="top"
                        visible={this.sidebarVisible}
                        width="wide"
                        onMouseLeave={this.timeoutSidebarHide}
                        onMouseEnter={this.clearHideTimeout}
                    >
                        <Dropdown item text="File">
                            <Dropdown.Menu>
                                <Dropdown.Item>Open</Dropdown.Item>
                                <Dropdown.Item onClick={this.saveCanvasImage}>Save</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <Dropdown item text="Export as">
                            <Dropdown.Menu>
                                <Dropdown.Item>Adjacency matrix</Dropdown.Item>
                                <Dropdown.Item>Incidence matrix</Dropdown.Item>
                                <Dropdown.Item>List of edges and nodes</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>

                        <Menu.Menu position="right">
                            <Menu.Item>
                                <Checkbox toggle label="Adjacency matrix" onClick={this.toggleAdjacencyMatrix}  />
                            </Menu.Item>
                            <Menu.Item>
                                <Button toggle active={this.nodeEditing} color="orange" onClick={this.toggleEditMode}>
                                    {this.nodeEditing ? "Nodes" : "Edges"}
                                </Button>
                            </Menu.Item>

                            <Menu.Item as="a" onClick={this.graphHistory.back}>
                                <Icon name="step backward"/>
                                Undo
                            </Menu.Item>
                            <Menu.Item as="a" onClick={this.graphHistory.forward}>
                                <Icon name="step forward" />
                                Redo
                            </Menu.Item>
                        </Menu.Menu>
                    </Sidebar>

                    <div className="sidebar-area" onMouseEnter={this.showSideBar}>
                        <Icon name="chevron down" style={{ margin: "0 auto", display: "block" }} />
                    </div>
                    <Sidebar.Pusher>
                        <canvas
                            ref={this.canvasRef}
                            id={this.canvasID}
                            width={this.canvasWidth}
                            height={this.canvasHeight}
                            className="canvas"
                            onMouseDown={this.canvasMouseDownHandler}
                            onMouseMove={this.canvasMouseMoveHandler}
                            onMouseUp={this.canvasMouseUpHandler}
                            onMouseOut={this.canvasMouseUpHandler}
                        />
                    </Sidebar.Pusher>
                </Sidebar.Pushable>

                {this.hoveredEdge &&
                <Popup
                    trigger={
                        <span
                            style={{
                                position: "absolute",
                                left: this.weightPopupPosition.x,
                                top: this.weightPopupPosition.y
                            }}
                        />
                    }
                    position="top center"
                    content={`Weight: ${this.graph.getEdge(this.hoveredEdge).weight}`}
                    open
                />
                }

                <Modal open={this.modalVisible} size="mini" onClose={this.hideModal}>
                    <Modal.Header>Enter value</Modal.Header>
                    <Modal.Content>
                        <Input onChange={this.handleModalInputChange} />
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.hideModal}>Cancel</Button>
                        <Button
                            positive
                            icon="checkmark"
                            labelPosition="right"
                            content="Confirm"
                            onClick={this.handleModalConfirm}
                        />
                    </Modal.Actions>
                </Modal>

                <CanvasContextMenu
                    canvasID={this.canvasID}
                    chooseItemsBeforeOpen={this.chooseContextMenu}
                />
            </div>
        );
    }

    private showModal = () => this.modalVisible = true;
    private hideModal = () => this.modalVisible = false;

    @bind
    private handleModalInputChange(e: React.ChangeEvent, data: InputOnChangeData) {
        this.modalInputValue = data.value;
    }

    private openModalWithCallback(onConfirm: () => any) {
        this.hoveredEdge = "";
        this.showModal();
        this.onModalConfirm = onConfirm;
    }

    @bind
    private handleModalConfirm() {
        this.hideModal();
        this.onModalConfirm();
    }

    private showSideBar = () => this.sidebarVisible = true;
    private hideSideBar = () => this.sidebarVisible = false;

    @bind
    private timeoutSidebarHide() {
        this.sidebarTimeout = setTimeout(this.hideSideBar, 400);
    }

    @bind
    private clearHideTimeout() {
        clearTimeout(this.sidebarTimeout);
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
    private resizeCanvas() {
        const { width } = this.canvas.parentElement.getBoundingClientRect();
        this.canvasWidth = width;
        this.canvasHeight = window.innerHeight - 107; // minus footerSize
    }

    @bind
    private handleGraphHistoryChange(state: IGraphRaw) {
        this.graph = Graph.fromObject(state);
        this.redraw();
    }

    @bind
    private toggleEditMode() {
        this.nodeEditing = !this.nodeEditing;
    }

    @bind
    private toggleAdjacencyMatrix() {
        this.showAdjacencyMatrix = !this.showAdjacencyMatrix;
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
    private changeEdgeWeight() {
        this.graph.getEdge(this.ctxMenuEdgeKey).weight = parseInt(this.modalInputValue, 10);

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
            if (this.nodeEditing) {
                this.graph.getNode(this.clickedNodeKey).color = NodeColors.Active;
            }
            else {
                this.newEdge = new GraphEdge(this.graph.getNode(this.clickedNodeKey), new GraphNode(x, y));
            }
        }

        if (!this.nodeEditing) {
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
            if (this.nodeEditing) {
                this.graph.getNode(this.clickedNodeKey).moveTo(x, y);
            } else {
                this.newEdge.to.moveTo(x, y);
            }
        }
        else if (!this.nodeEditing) {
            if (this.hoveredEdge) {
                this.graph.getEdge(this.hoveredEdge).color = EdgeColor.Default;
            }

            this.hoveredEdge = this.getEdgeFromCoordinates(x, y);
            if (this.hoveredEdge) {
                this.weightPopupPosition = { x, y };
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

        if (!this.nodeEditing) {
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
            edgeMenu.push({ text: "Change weight", onClick: () => this.openModalWithCallback(this.changeEdgeWeight) });
            edgeMenu.push({ text: "Delete", onClick: this.deleteEdge });

            return edgeMenu;
        }

        return [
            { text: "Add node", onClick: this.addNode }
        ];
    }

    @bind
    private saveCanvasImage() {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL();
        link.download = "graph.png";
        link.click();
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
