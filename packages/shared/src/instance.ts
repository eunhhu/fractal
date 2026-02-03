import Entity from "./entity";
import Structure from "./structure";
import World from "./world";
import TestMap from "./worlds/testMap";
import Projectile from "./projectile";
import { EventEmitter } from "./utils/features";
import { boundColBound, circleColBound, pointColBound } from "./utils/vector";

export default class Instance{
    private _emitter:EventEmitter = new EventEmitter();
    on(event: string, listener: (...args: any[]) => void){this._emitter.on(event, listener)};
    emit(event: string, ...args: any[]){this._emitter.emit(event, ...args)};
    off(event: string, listener: (...args: any[]) => void){this._emitter.off(event, listener)};
    removeAllListeners(event: string){this._emitter.removeAllListeners(event)};

    // configures
    private readonly _waitingTime = 10000;

    // static properties
    private _id: string; // room's uuid
    private _ownerId: string; // room's owner uuid
    private _world: World = new TestMap();

    // dynamic properties
    private _players: IUser[]; // array of IUser
    private _entities: Entity[] = [];
    private _structures: Structure[] = [];
    private _projectiles: Projectile[] = [];
    private _startedTime: number = Date.now(); // Date.now()
    private _state: 'waiting'|'running' = 'waiting';
    private _wave: number = 0;
    private _leftWaitingCooldown: number = Date.now(); // Date.now()
    private _coreHealth: number = 1000;
    private _lastState: DynamicState = {
        wave: this._wave,
        leftWaitingCooldown: this._leftWaitingCooldown,
        state: this._state,
        coreHealth: this._coreHealth,
    };
    private _lastEntities: KeystringAny[] = [];
    private _lastProjectiles: KeystringAny[] = [];
    private _lastStructures: KeystringAny[] = [];

    constructor(id: string, players: IUser[], ownerId:string){
        this._id = id;
        this._players = players;
        this._ownerId = ownerId;
    }
    get id():string{return this._id};
    get maxWave():number{return this._world.waves.length};
    get entities():Entity[]{return this._entities};
    get structures():Structure[]{return this._structures};
    get projectiles():Projectile[]{return this._projectiles};
    get world():World{return this._world};
    get startedTime():number{return this._startedTime};
    get time():number{return Date.now() - this._startedTime};
    get state():'waiting'|'running'{return this._state};
    get wave():number{return this._wave};
    get leftWaitingCooldown():number{return this._leftWaitingCooldown};

    tick(delta: number){
        // tick entities
        this._entities.forEach(entity => entity.tick(delta));
        // tick structures
        this._structures.forEach(structure => structure.tick(delta));
        // tick projectiles
        this._projectiles.forEach(projectile => projectile.tick(delta));

        if(this._state === 'waiting'){
            const _leftTime:number = this._waitingTime + this._leftWaitingCooldown - Date.now()
            if(_leftTime <= 0){
                this._state = 'running'
            }
        } else {
        }
    }

    update(_updater:Updater){
        const _set = _updater.$set;
        if(_set) Object.keys(_set).forEach(key => {
            this.setState(key, _set[key])
        })
        const _setObj = _updater.$setObj;
        if(_setObj) {
            Object.keys(_setObj).forEach(uid => {
                this.getEntity(uid)?.setState(_setObj[uid])
                this.getProjectile(uid)?.setState(_setObj[uid])
                this.getStructure(uid)?.setState(_setObj[uid])
            })
        }
        const _addObj = _updater.$addObj;
        const _delObj = _updater.$delObj;
        if(_delObj) {
            Object.keys(_delObj).forEach(uid => {
                this.despawnEntityById(uid)
                this.despawnProjectileById(uid)
                this.despawnStructureById(uid)
            })
        }
    }
    setState(key:string, value:any){
        switch(key){
            case 'wave':{
                this._wave = value;
                break;
            };
            case 'leftWaitingCooldown':{
                this._leftWaitingCooldown = value;
                break;
            };
            case 'state':{
                this._state = value;
                break;
            }
            case 'coreHealth':{
                this._coreHealth = value;
                break;
            }
        }
    }

    damagePoint(point: Point, damage: number, cates: string[] = []){
        this._entities.filter(e => cates.some(category => e.dCates.includes(category))).forEach(entity => {
            if(pointColBound(point, entity.boundbox)){
                entity.damage(damage);
            }
        });
    }

    damageZone(bound:Bound, damage: number, cates: string[] = []){
        this._entities.filter(e => cates.some(category => e.dCates.includes(category))).forEach(entity => {
            if(boundColBound(bound, entity.boundbox)){
                entity.damage(damage);
            }
        });
    }

    damageArc(circle:Circle, damage: number, cates: string[] = []){
        this._entities.filter(e => cates.some(category => e.dCates.includes(category))).forEach(entity => {
            if(circleColBound(circle, entity.boundbox)){
                entity.damage(damage);
            }
        });
    }

    // get dynamic state includes only changed properties
    getDynamicState():DynamicState{
        const state: DynamicState = {
            wave: this._wave,
            leftWaitingCooldown: this._leftWaitingCooldown,
            state: this._state,
            coreHealth: this._coreHealth,
        }
        const diff = Object.keys(state).reduce((acc:any, key) => {
            if(this._lastState[key as keyof DynamicState] !== state[key as keyof DynamicState]){
                acc[key as keyof DynamicState] = state[key as keyof DynamicState];
            }
            return acc;
        }, {});
        this._lastState = state;
        return diff;
    }

    getUpdater():Updater{
        return {
            $set: this.getDynamicState(),
        }
    }

    spawnEntity(entity: Entity){this._entities.push(entity)}
    despawnEntity(entity: Entity){this._entities = this._entities.filter(e => e !== entity)}
    despawnEntityById(entityId: string){this._entities = this._entities.filter(e => e.id !== entityId)}
    getEntity(id: string){return this._entities.find(e => e.id === id)}
    spawnProjectile(projectile: Projectile){this._projectiles.push(projectile)}
    despawnProjectile(projectile: Projectile){this._projectiles = this._projectiles.filter(p => p !== projectile)}
    despawnProjectileById(projectileId: string){this._projectiles = this._projectiles.filter(p => p.id !== projectileId)}
    getProjectile(id: string){return this._projectiles.find(p => p.id === id)}
    spawnStructure(structure: Structure){this._structures.push(structure)}
    despawnStructure(structure: Structure){this._structures = this._structures.filter(s => s !== structure)}
    despawnStructureById(structureId: string){this._structures = this._structures.filter(s => s.id !== structureId)}
    getStructure(id: string){return this._structures.find(s => s.id === id)}

    command(_command:string){
        const prefix = _command.split(' ')[0]
    }
}