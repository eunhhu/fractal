import { generateObjectUUID } from "./utils/auth";
import { EventEmitter } from "./utils/features";
import { pointColBound } from "./utils/vector";

export default abstract class Projectile{
    private static registry: Map<string, new (...args:any[]) => Projectile> = new Map();
    static register(tag: string, projectile: new (...args:any[]) => Projectile){
        Projectile.registry.set(tag, projectile);
    }
    static create(tag: string):Projectile {
        const sub = Projectile.registry.get(tag);
        if(sub){
            return new sub();
        } else {
            throw new Error(`Projectile with tag ${tag} not found`);
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
    abstract dCates: string[];

    private readonly _id: string = generateObjectUUID();
    private _health: number = 0;
    private _damage: number = 0;
    private _position: Point = {x: 0, y: 0};
    private _velocity: Point = {x: 0, y: 0};
    private _rotation: number = 0;
    private _scale: Point = {x: 1, y: 1};
    private _cates: string[] = [];
    private _state: string = '';
    constructor(){this.initialize()}
    private initialize() {
        this._health = this.maxHealth;
        this._damage = this.dDamage;
    }
    get id(): string { return this._id; }
    get health(): number { return this._health; }
    set health(value: number) { this._health = value; }
    get damage(): number { return this._damage; }
    set damage(value: number) { this._damage = value; }
    get position(): Point { return this._position; }
    set position(value: Point | number[]) {
        if (Array.isArray(value)) {
            this._position.x = value[0];
            this._position.y = value[1];
        } else {
            this._position = value;
        }
    }
    get velocity(): Point { return this._velocity; }
    set velocity(value: Point | number[]) {
        if (Array.isArray(value)) {
            this._velocity.x = value[0];
            this._velocity.y = value[1];
        } else {
            this._velocity = value;
        }
    }
    get rotation(): number { return this._rotation; }
    set rotation(value: number) { this._rotation = value; }
    get scale(): Point { return this._scale; }
    set scale(value: Point | number[]) {
        if (Array.isArray(value)) {
            this._scale.x = value[0];
            this._scale.y = value[1];
        } else {
            this._scale = value;
        }
    }

    tick(delta: number){
        if(this.health <= 0) {
            this.health = 0;
            this.destroy();
        }
    }

    getState() {
        return {
            id: this._id,
            tag: this.tag,
            health: this._health,
            damage: this._damage,
            position: [this._position.x, this._position.y],
            velocity: [this._velocity.x, this._velocity.y],
            rotation: this._rotation,
            scale: [this._scale.x, this._scale.y],
            cates: this._cates,
            state: this._state,
        }
    }

    setState(_state: Partial<ReturnType<typeof this.getState>>): void {
        if ('health' in _state && _state.health !== undefined) {
            this._health = _state.health;
        }
        if ('damage' in _state && _state.damage !== undefined) {
            this._damage = _state.damage;
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

    isColliding(bound: Bound):boolean{
        return pointColBound(this._position, bound);
    }

    destroy(){
        this.emit("destroy");
    }
}
