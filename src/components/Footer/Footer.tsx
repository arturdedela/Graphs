import * as React from "react";
import { Container, List, Segment } from "semantic-ui-react";
import { Link } from "react-router-dom";

class Footer extends React.Component {

    public render() {
        return (
            <Segment inverted vertical style={{ margin: "5em 0em 0em", padding: "2em 0em" }}>
                <Container textAlign="center">

                    <List horizontal inverted divided link size="small">
                        <List.Item as="a" href="https://github.com/arturdedela" target="_blank">
                            ©2019 Artur Dedela
                        </List.Item>
                        <List.Item as={Link} to="/about">
                            About
                        </List.Item>
                    </List>
                </Container>
            </Segment>
        );
    }
}

export default Footer;
