import * as React from "react";
import { Container } from "semantic-ui-react";
import GraphEditor from "./components/GraphEditor/GraphEditor";


class App extends React.Component {

    public render() {
        return (
            <Container>
                <GraphEditor/>
            </Container>
        );
    }
}

export default App;