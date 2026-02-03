import Entity from "../entity";
import type { Point } from "../types";

export default class Heartsping extends Entity{
    static tag: string = 'heartsping';
    tag: string = Heartsping.tag;
    maxHealth: number = 100;
    dDamage: number = 10;
    dSpeed: number = 1;
    dFriction: number = 0.3;
    dScale: Point = {x: 1, y: 1};
    dAnchor: Point = {x: 0.5, y: 0.5};
    dHitbox: Point = {x: 1, y: 1};
    dCates: string[] = ['attackable', 'enemy'];

    _target: Entity | null = null;
    _path: Point[] = [];
    _attackRange: number = 0.3;
    _attackCooldown: number = 1;
    _attackTimer: number = 0;
    constructor(){
        super();
    }
    static {Entity.register(Heartsping.tag, Heartsping);}

    tick(delta: number): void {
        super.tick(delta);
        this.AI(delta);
        if(this._attackTimer > 0){
            this._attackTimer -= delta;
        }
    }

    AI(delta:number): void {
        if(this._target){
            const dx = this._target.position.x - this.position.x;
            const dy = this._target.position.y - this.position.y;
            const angle = Math.atan2(dy, dx);
            this.move(angle)
            const distance = Math.sqrt(Math.pow(this.position.x - this._target.position.x, 2) + Math.pow(this.position.y - this._target.position.y, 2));
            if(distance < this._attackRange){
                this.attack(this._target);
            }
        }
    }

    attack(_target:Entity): void {
        if(this._attackTimer > 0){return;}
        _target.health -= this.dDamage;
        this._attackTimer = this._attackCooldown;
    }
}
