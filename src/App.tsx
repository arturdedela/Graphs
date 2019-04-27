import * as React from "react";
import { Route } from "react-router-dom";
import { Container } from "semantic-ui-react";
import GraphEditor from "./components/GraphEditor/GraphEditor";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";


class App extends React.Component {

    public render() {
        return (
            <>
                <Navbar/>

                <Container style={{ marginTop: "4em" }}>
                    <Route exact path="/" component={GraphEditor} />
                    <Route path="/about" component={About} />
                </Container>

                <Footer/>
            </>
        );
    }
}

export default App;