import * as React from "react";
import { CounterStore } from "../CounterStore";
import { shallow } from "enzyme";
import Counter from "../Counter";

describe("Counter", () => {

    describe("Component", () => {
        it("Should render without errors", () => {
            const counter = shallow(<Counter />);

            expect(counter).toHaveLength(1);
        });
    });

    describe("Store", () => {
        it("Should increment counter", () => {
            const counterStore = new CounterStore();
            counterStore.increment();
            expect(counterStore.counter).toEqual(1);
        });
    });

});