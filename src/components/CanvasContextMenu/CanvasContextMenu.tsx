import * as React from "react";
import { Dropdown } from "semantic-ui-react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import bind from "../../decorators/bind";

type ItemClickHandler = (x: number, y: number) => void;

export interface IMenuItemProps {
    text: string;
    onClick: ItemClickHandler;
}

interface IProps {
    canvasID: string;
    chooseItemsBeforeOpen: (e: MouseEvent) => IMenuItemProps[];
}

@observer
class CanvasContextMenu extends React.Component<IProps> {
    @observable private x: number;
    @observable private y: number;
    @observable private opened: boolean;
    private items: IMenuItemProps[];

    public componentDidMount() {
        document.getElementById(this.props.canvasID).addEventListener("contextmenu", this.contextMenuHandler);
        document.addEventListener("click", this.hideMenu);
    }

    public componentWillUnmount() {
        document.getElementById(this.props.canvasID).removeEventListener("contextmenu", this.contextMenuHandler);
        document.removeEventListener("click", this.hideMenu);
    }

    public render() {
        if (!this.opened) {
            return null;
        }

        return (
            <div
                className="ui dropdown"
                style={{
                    position: "absolute",
                    left: this.x,
                    top: this.y
                }}
            >
                <Dropdown.Menu open>
                    {this.items.map(({ onClick, ...item }, key) =>
                        <Dropdown.Item key={key} {...item} onClick={this.itemClickHandler(onClick)} />
                    )}
                </Dropdown.Menu>
            </div>
        );
    }

    @bind
    private hideMenu() {
        this.opened = false;
    }

    @bind
    private contextMenuHandler(e: MouseEvent) {
        e.preventDefault();
        this.items = this.props.chooseItemsBeforeOpen(e);

        this.x = e.clientX;
        this.y = e.clientY;
        this.opened = true;
    }

    @bind
    private itemClickHandler(callback: ItemClickHandler) {
        return () => {
            callback(this.x, this.y);
            this.hideMenu();
        };
    }
}

export default CanvasContextMenu;
