import * as React from "react";
import { observer } from "mobx-react";
import { lazyInject } from "../../IoC";
import { CounterStore } from "./CounterStore";


@observer
class Counter extends React.Component {
    @lazyInject(CounterStore)
    public counterStore: CounterStore;

    public render() {
        return (
            <div>
                <p>Counter: {this.counterStore.counter}</p>
                <button onClick={this.counterStore.increment}>Increment</button>
            </div>
        );
    }
}

export default Counter;
