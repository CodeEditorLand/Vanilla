export declare function clamp(value: number, min: number, max: number): number;
export declare function rot(index: number, modulo: number): number;
export declare class Counter {
    private _next;
    getNext(): number;
}
export declare class MovingAverage {
    private _n;
    private _val;
    update(value: number): number;
    get value(): number;
}
export declare class SlidingWindowAverage {
    private _n;
    private _val;
    private readonly _values;
    private _index;
    private _sum;
    constructor(size: number);
    update(value: number): number;
    get value(): number;
}
/** Returns whether the point is within the triangle formed by the following 6 x/y point pairs */
export declare function isPointWithinTriangle(x: number, y: number, ax: number, ay: number, bx: number, by: number, cx: number, cy: number): boolean;
