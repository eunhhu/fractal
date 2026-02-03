import { generateObjectUUID } from "./utils/auth";
import { EventEmitter } from "./utils/features";
import type { Point, Bound } from "./types";

export default abstract class Entity{
    private static registry: Map<string, new (...args:any[]) => Entity> = new Map();
    static register(tag: string, entity: new (...args:any[]) => Entity){
        Entity.registry.set(tag, entity);
    }
    static create(tag: string):Entity {
        const sub = Entity.registry.get(tag);
        if(sub){
            return new sub();
        } else {
            throw new Error(`Entity with tag ${tag} not found`);
        }
    }
    private _emitter:EventEmitter = new EventEmitter();
    on(event: string, listener: (...args: any[]) => void){this._emitter.on(event, listener)};
    emit(event: string, ...args: any[]){this._emitter.emit(event, ...args)};
    off(event: string, listener: (...args: any[]) => void){this._emitter.off(event, listener)};
    removeAllListeners(event: string){this._emitter.removeAllListeners(event)};

    abstract tag: string;
    abstract maxHealth: number;
    abstract dDamage: number;
    abstract dSpeed: number;
    abstract dFriction: number;
    abstract dScale: Point;
    abstract dAnchor: Point;
    abstract dHitbox: Point;
    abstract dCates: string[];

    private readonly _id: string = generateObjectUUID();
    private _health: number = 0;
    private _position: Point = {x: 0, y: 0};
    private _velocity: Point = {x: 0, y: 0};
    private _rotation: number = 0;
    private _scale: Point = {x: 1, y: 1};
    private _cates: string[] = [];
    private _state: string = '';

    constructor(id?:string){
        this._id = id || generateObjectUUID();
        this.initialize()
    }
    private initialize() {
        this._health = this.maxHealth;
        this._cates = this.dCates;
    }
    get id():string{return this._id};
    get health():number{return this._health};
    set health(value:number){this._health = value};
    get position():Point{return this._position};
    set position(value:Point|number[]){
        if(Array.isArray(value)){
            this._position.x = value[0];
            this._position.y = value[1];
        } else {
            this._position = value;
        }
    }
    get velocity():Point{return this._velocity};
    set velocity(value:Point|number[]){
        if(Array.isArray(value)){
            this._velocity.x = value[0];
            this._velocity.y = value[1];
        } else {
            this._velocity = value;
        }
    }
    get rotation():number{return this._rotation};
    set rotation(value:number){this._rotation = value};
    get scale():Point{return this._scale};
    set scale(value:Point|number[]){
        if(Array.isArray(value)){
            this._scale.x = value[0];
            this._scale.y = value[1];
        } else {
            this._scale = value;
        }
    };
    get boundbox():Bound{
        return {
            x: this._position.x - this.dHitbox.x/2,
            y: this._position.y - this.dHitbox.y/2,
            width: this.dHitbox.x,
            height: this.dHitbox.y,
        };
    }

    tick(delta: number){
        const deceleration = 1 - this.dFriction;
        if(this._velocity.x >= this.dSpeed){this._velocity.x = this.dSpeed * this.dFriction;}
        if(this._velocity.x <= -this.dSpeed){this._velocity.x = -this.dSpeed * this.dFriction;}
        if(this._velocity.y >= this.dSpeed){this._velocity.y = this.dSpeed * this.dFriction;}
        if(this._velocity.y <= -this.dSpeed){this._velocity.y = -this.dSpeed * this.dFriction;}
        this._position.x += this._velocity.x * delta/1000;
        this._position.y += this._velocity.y * delta/1000;
        this._velocity.x *= deceleration;
        this._velocity.y *= deceleration;
    }

    getState(){
        return {
            id: this._id,
            tag: this.tag,
            health: this._health,
            position: [this.position.x, this.position.y],
            velocity: [this.velocity.x, this.velocity.y],
            rotation: this.rotation,
            scale: [this.scale.x, this.scale.y],
            cates: this._cates,
            state: this._state,
        }
    }

    setState(_state: Partial<ReturnType<typeof this.getState>>): void {
        if ('health' in _state && _state.health !== undefined) {
            this._health = _state.health;
        }
        if ('position' in _state && _state.position !== undefined) {
            this.position = _state.position;
        }
        if ('velocity' in _state && _state.velocity !== undefined) {
            this.velocity = _state.velocity;
        }
        if ('rotation' in _state && _state.rotation !== undefined) {
            this._rotation = _state.rotation;
        }
        if ('scale' in _state && _state.scale !== undefined) {
            this.scale = _state.scale;
        }
        if ('cates' in _state && _state.cates !== undefined) {
            this._cates = _state.cates;
        }
        if ('state' in _state && _state.state !== undefined) {
            this._state = _state.state;
        }
    }

    move(angle: number){
        this._velocity.x += this.dSpeed * Math.sin(angle) * this.dFriction;
        this._velocity.y += this.dSpeed * Math.cos(angle) * this.dFriction;
    }

    destroy(){
        this.emit('destroy');
    }

    damage(damage: number){
        this.health -= damage;
        if(this.health <= 0){
            this.destroy();
        }
    }
}
