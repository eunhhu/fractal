import World from "~/world";

export default class TestMap extends World{
    static tag: string = 'testMap';
    tag: string = TestMap.tag;
    maxWave: number = 2;
    width: number = 8;
    height: number = 8;
    background: string = '/assets/sbpack/Wispy/Wispy_Sky-Night_03-512x512.png';
    tileAssets: string[] = [
        '/assets/ttpack/Dirt/Dirt_17-512x512.png',
        '/assets/ttpack/Dirt/Dirt_18-512x512.png',
        '/assets/ttpack/Dirt/Dirt_19-512x512.png',
        '/assets/ttpack/Dirt/Dirt_20-512x512.png'
    ];
    tileMap: number[][] = [
        [0, 1, 2, 3, 2, 3, 2, 3],
        [1, 1, 2, 3, 2, 3, 2, 3],
        [0, 0, 1, 0, 2, 3, 2, 3],
        [2, 3, 2, 1, 1, 3, 2, 3],
        [2, 3, 2, 0, 1, 0, 2, 3],
        [2, 3, 2, 3, 1, 0, 0, 3],
        [2, 3, 2, 3, 2, 3, 1, 3],
        [2, 3, 2, 3, 2, 3, 1, 0],
    ];
    effects: IEffect[] = [];
    envAssets: string[] = [];
    environments: IEnvironment[] = [];
    entityAssets: string[] = [
        '/assets/test/heartsping.webp',
        '/assets/test/gogoping.webp',
        '/assets/test/romi.png',
    ];
    playerSpawn: Bound = {
        x: 0,
        y: 0,
        width: 1,
        height: 1,
    };
    enemySpawn: Bound[] = [
        {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
        },
        {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
        },
        {
            x: 0,
            y: 0,
            width: 1,
            height: 1,
        },
    ];
    waves: IWave[] = [
        {
            enemies: [
                {
                    tag: 'fox',
                    amount: 5,
                    spawn: 0,
                    interval: 100,
                },
                {
                    tag: 'wolf',
                    amount: 5,
                    spawn: 1,
                    interval: 100,
                },
            ],
            interval: 100,
        },
        {
            enemies: [
                {
                    tag: 'fox',
                    amount: 10,
                    spawn: 0,
                    interval: 100,
                },
                {
                    tag: 'wolf',
                    amount: 10,
                    spawn: 1,
                    interval: 100,
                },
            ],
            interval: 100,
        }
    ];
    corePosition: Point = {
        x: 4,
        y: 4,
    };
    constructor(){
        super();
    }
    static {World.register(TestMap.tag, TestMap);}
}