import * as React from "react";

import "./App.scss";
import Counter from "./components/Counter/Counter";


class App extends React.Component {

    public render() {
        return (
            <div>
                <h1>React-Mobx-Typescript</h1>
                <Counter />
            </div>
        );
    }
}

export default App;