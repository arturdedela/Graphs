
export class Vector {
    constructor(public x: number, public y: number) {}

    public get length() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }

    public set length(l: number) {
        const curLength = this.length;
        this.x = this.x / curLength * l;
        this.y = this.y / curLength * l;
    }

    public rotate(angle: number) {
        const curX = this.x;
        const curY = this.y;

        const { cos, sin } = Math;
        this.x = curX * cos(angle) - curY * sin(angle);
        this.y = curX * sin(angle) + curY * cos(angle);

        return this;
    }
}