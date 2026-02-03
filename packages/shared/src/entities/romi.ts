import Entity from "~/entity";

export default class Romi extends Entity{
    static tag: string = 'romi';
    tag: string = Romi.tag;
    maxHealth: number = 100;
    dDamage: number = 10;
    dSpeed: number = 10;
    dFriction: number = 0.3;
    dScale: Point = {x: 2, y: 2};
    dAnchor: Point = {x: 0.5, y: 0.5};
    dHitbox: Point = {x: 2, y: 2};
    dCates: string[] = ['attackable', 'enemy'];
    constructor(){
        super();
    }
    static {Entity.register(Romi.tag, Romi);}
}
