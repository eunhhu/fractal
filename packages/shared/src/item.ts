import { generateObjectUUID } from "./utils/auth";
import { EventEmitter } from "./utils/features";

export default abstract class Item{
    private static registry: Map<string, new () => Item> = new Map();
    static register(tag: string, item: new () => Item){
        Item.registry.set(tag, item);
    }
    static create(tag: string):Item {
        const sub = Item.registry.get(tag);
        if(sub){
            return new sub();
        } else {
            throw new Error(`Item with tag ${tag} not found`);
        }
    }
    private _emitter:EventEmitter = new EventEmitter();
    on(event: string, listener: (...args: any[]) => void){this._emitter.on(event, listener)};
    emit(event: string, ...args: any[]){this._emitter.emit(event, ...args)};
    off(event: string, listener: (...args: any[]) => void){this._emitter.off(event, listener)};
    removeAllListeners(event: string){this._emitter.removeAllListeners(event)};

    abstract readonly tag: string;
    // 공격형 아이템 속성 (대개)
    abstract dDamage: number; // amount
    abstract dCriticalChance: number; // float
    abstract dCriticalDamage: number; // float (multiplier)
    abstract dKnockback: number; // amount
    abstract dCooldown: number; // ms
    abstract dCates: string[];
    
    private readonly _id: string = generateObjectUUID();
    private _mainDown: boolean = false;
    private _subDown: boolean = false;
    private _restCooldown: number = Date.now();
    private _cates: string[] = [];
    constructor(){this.initialize()}
    private initialize() {
    }
    get id():string{return this._id};
    get mainDown():boolean{return this._mainDown};
    set mainDown(value: boolean){this._mainDown = value};
    get subDown():boolean{return this._subDown};
    set subDown(value: boolean){this._subDown = value};
    get restCooldown():number{return Date.now() - this._restCooldown};
    set restCooldown(value: number){this._restCooldown = Date.now() - this.dCooldown + value};

    tick(delta: number){}
    mainInteraction(){}
    subInteraction(){}

    getState() {
        return {
            id: this._id,
            tag: this.tag,
            mainDown: this._mainDown,
            subDown: this._subDown,
            restCooldown: this._restCooldown,
            cates: this._cates,
        }
    }

    setState(_state: Partial<ReturnType<typeof this.getState>>): void {
        if ('mainDown' in _state && _state.mainDown !== undefined) {
            this._mainDown = _state.mainDown;
        }
        if ('subDown' in _state && _state.subDown !== undefined) {
            this._subDown = _state.subDown;
        }
        if ('restCooldown' in _state && _state.restCooldown !== undefined) {
            this._restCooldown = _state.restCooldown;
        }
        if ('cates' in _state && _state.cates !== undefined) {
            this._cates = _state.cates;
        }
    }
}