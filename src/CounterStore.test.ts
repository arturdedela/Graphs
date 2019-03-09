import { CounterStore } from "./CounterStore";


describe("Counter store", () => {

    it("Should increment counter", () => {
        const counterStore = new CounterStore();
        counterStore.increment();
        expect(counterStore.counter).toEqual(1);
    });
});