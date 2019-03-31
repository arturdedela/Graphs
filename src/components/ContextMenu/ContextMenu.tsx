import * as React from "react";
import { Dropdown, DropdownItemProps } from "semantic-ui-react";
import bind from "../../decorators/bind";
import { observable } from "mobx";
import { observer } from "mobx-react";

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

type ItemClickHandler = (x: number, y: number, data: DropdownItemProps) => void;

interface IContextMenuItems extends Omit<DropdownItemProps, "onClick"> {
    onClick: ItemClickHandler;
}

interface IProps {
    element?: HTMLElement;
    items: IContextMenuItems[];
}

@observer
class ContextMenu extends React.Component<IProps> {
    public static defaultProps = {
        element: document
    };

    @observable private x: number;
    @observable private y: number;
    @observable private opened: boolean;

    public componentDidMount() {
        this.props.element.addEventListener("contextmenu", this.contextMenuHandler);
        document.addEventListener("click", this.hideMenu);
    }

    public componentWillUnmount() {
        this.props.element.removeEventListener("contextmenu", this.contextMenuHandler);
        document.removeEventListener("click", this.hideMenu);
    }

    public render() {
        return (
            <div
                className="ui dropdown"
                style={{
                    position: "absolute",
                    left: this.x,
                    top: this.y
                }}
            >
                <Dropdown.Menu open={this.opened}>
                    {this.props.items.map(({ onClick, ...item }, key) =>
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

        this.x = e.clientX;
        this.y = e.clientY;
        this.opened = true;
    }

    @bind
    private itemClickHandler(callback: ItemClickHandler) {
        return (e: React.MouseEvent, data: DropdownItemProps) => {
            callback(this.x, this.y, data);
            this.hideMenu();
        };
    }
}

export default ContextMenu;
