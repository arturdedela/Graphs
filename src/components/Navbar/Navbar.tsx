import * as React from "react";
import { Container, Menu } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Navbar extends React.Component {

    public render() {
        return (
            <Menu fixed="top" inverted>
                <Container>
                    <Menu.Item header>
                        Graphs
                    </Menu.Item>
                    <Menu.Item as={Link} to="/">Editor</Menu.Item>
                </Container>
            </Menu>
        );
    }
}

export default Navbar;
