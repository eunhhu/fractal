import Entity from "../entity";
import type { Point } from "../types";

export default class Gogoping extends Entity{
    static tag: string = 'gogoping';
    tag: string = Gogoping.tag;
    maxHealth: number = 100;
    dDamage: number = 10;
    dSpeed: number = 1;
    dFriction: number = 0.3;
    dScale: Point = {x: 1, y: 1};
    dAnchor: Point = {x: 0.5, y: 0.5};
    dHitbox: Point = {x: 1, y: 1};
    dCates: string[] = ['attackable', 'enemy'];
    constructor(){
        super();
    }
    static {Entity.register(Gogoping.tag, Gogoping);}
}
