import { observable, action } from "mobx";
import { provide } from "../../IoC";

@provide.singleton()
export class CounterStore {
    @observable public counter: number = 0;

    @action.bound
    public increment() {
        this.counter++;
    }
}