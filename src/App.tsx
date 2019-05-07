import * as React from "react";
import { Route } from "react-router-dom";
import GraphEditor from "./components/GraphEditor/GraphEditor";
import About from "./components/About/About";
import Footer from "./components/Footer/Footer";


class App extends React.Component {

    public render() {
        return (
            <>
                <Route exact path="/" component={GraphEditor} />
                <Route path="/about" component={About} />
                <Footer/>
            </>
        );
    }
}

export default App;