type vec2 = [number, number];
type vec3 = [number, number, number];
type vec4 = [number, number, number, number];

interface IEffect{
    type: string;
    options: any;
    duration: number;
}

interface IEnvironment{
    idx: number;
    position: Point;
    scale: Point;
    hitboxScale: Point;
    isCollidable: boolean;
}

interface Point{
    x: number;
    y: number;
}

interface IWaveEnemy{
    tag: string; // Entity tag
    amount: number;
    spawn: number; // spawnZone index
    interval: number; // ms
}

interface IWave{
    enemies:IWaveEnemy[];
    interval: number; // ms
}

interface Bound{
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Line{
    start: Point;
    end: Point;
}

interface Circle{
    x: number;
    y: number;
    radius: number;
}

interface DynamicState{
    wave?: number;
    leftWaitingCooldown?: number;
    state?: 'waiting'|'running';
    coreHealth?: number;
}

interface Updater{
    $set?:{[key:string]:any};
    $setObj?:{[key:string]:{}}; // state modifer
    $addObj?:{[key:string]:{}};
    $delObj?:string[]; // object's uuid
}

type KeystringAny = {[key:string]:any};
type KeystringString = {[key:string]:string};
type KeystringNumber = {[key:string]:number};
type KeystringBoolean = {[key:string]:boolean};