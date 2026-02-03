import { AdjustmentFilter, AdvancedBloomFilter, BackdropBlurFilter, BloomFilter, BulgePinchFilter, ColorMapFilter, ConvolutionFilter, DropShadowFilter, GodrayFilter, GrayscaleFilter, MotionBlurFilter, OutlineFilter, PixelateFilter, RGBSplitFilter, ShockwaveFilter, SimpleLightmapFilter, TwistFilter, ZoomBlurFilter } from "pixi-filters";
import { Application, Assets, BlurFilter, Container, DisplacementFilter, Filter, Graphics, Sprite, Ticker, TickerCallback, TilingSprite } from "pixi.js";
import { Entity, Instance, World, EventEmitter } from "@fractal/shared";
import type { Point } from "@fractal/shared";

export default class Controller{
    private _emitter:EventEmitter = new EventEmitter();
    on(event: string, listener: (...args: any[]) => void){this._emitter.on(event, listener)};
    emit(event: string, ...args: any[]){this._emitter.emit(event, ...args)};
    off(event: string, listener: (...args: any[]) => void){this._emitter.off(event, listener)};
    removeAllListeners(event: string){this._emitter.removeAllListeners(event)};

    private _tileScaleDivisor: number = 20;
    private _keymap: Set<string> = new Set();
    private _buttonmap: Set<number> = new Set();
    private _app: Application = new Application();
    private _camera: Container = new Container();
    private _cameraPosition: Point = {x: 0, y: 0};
    private _cameraBinder: string = ''; // entity id
    private _cameraFriction: number = 5;
    private _debugger: Graphics = new Graphics();
    private _tileSize: number = 0;
    private _instance: Instance;
    private _isClient: boolean = false;
    private _keydownFn: Map<string, (...args: any[]) => void> = new Map();
    private _keyupFn: Map<string, (...args: any[]) => void> = new Map();
    private _keypressedFn: Map<string, (...args: any[]) => void> = new Map();
    private _buttondownFn: Map<number, (...args: any[]) => void> = new Map();
    private _buttonupFn: Map<number, (...args: any[]) => void> = new Map();
    private _buttonpressedFn: Map<number, (...args: any[]) => void> = new Map();
    private _cursorPosition: Point = {x: 0, y: 0};
    private _socket: Socket|null = null;

    constructor(instance: Instance, client:boolean = false){
        this._instance = instance;
        this._isClient = client;
        this.on('initialized', () => {
            this.on('applyFilter', (type:string, opt:any) => {
                this.applyFilter(type, opt);
            })
            this.on('spawn', (entityId:string, opt:any) => {
                this.spawn(entityId, opt);
            })
            this.on('despawn', (entityId) => {
                this.despawn(entityId);
            })
        })
    }

    get app():Application{return this._app}
    get tileSize():number{return this._tileSize}
    get instance():Instance{return this._instance}
    get camera():Container{return this._camera}
    get cameraPosition():Point{return this._cameraPosition}
    
    async init(window: Window){
        await this._app.init({
            backgroundColor: 0xabcdef,
            resizeTo: window,
        })
        this.addTicker((ticker) => this.tick(ticker.deltaMS));
        this.resize();
        this._app.stage.addChild(this._camera);
        await Assets.load([
            "/assets/entities/player.svg",
            this._instance.world.background,
            ...this._instance.world.tileAssets,
            ...this._instance.world.envAssets,
        ]);
        this.emit('initialized');
        this.applyWorld(this._instance.world);
    }
    applyWorld(world: World){
        // background
        const background = new TilingSprite(Assets.get(world.background));
        background.label = "background";
        background.zIndex = -1000; 
        background.setSize(innerWidth, innerHeight);
        this._app.stage.addChild(background);
        // tile
        const worldContainer = new Container();
        worldContainer.label = "world";
        worldContainer.zIndex = -999;
        world.tileMap.forEach((row, i) => {
            row.forEach((num, j) => {
                const url = world.tileAssets[num]
                if(url){
                    const sprite = new TilingSprite(Assets.get(url));
                    sprite.setSize(this._tileSize, this._tileSize);
                    sprite.anchor.set(0.5, 0.5);
                    sprite.position.set(j * this._tileSize, i * this._tileSize);
                    sprite.label = `${i}-${j}`;
                    worldContainer.addChild(sprite);
                }
            })
        })
        // environment

        // apply
        this._camera.addChild(worldContainer);
        this._app.stage.filters = [...world.effects.map(effect => this.makeFilter(effect.type, effect.options))];
    }
    bindToCamera(entity: Entity){this._cameraBinder = entity.id;}
    bindToCameraById(entityId: string){this._cameraBinder = entityId;}
    isKeydown(key: string):boolean{return this._keymap.has(key)}
    isButtondown(button: number):boolean{return this._buttonmap.has(button)}
    resize(){
        const screenWidth = innerWidth, screenHeight = innerHeight;
        this._camera.position.set(screenWidth / 2, screenHeight / 2);
        this._tileSize = Math.max(screenWidth * (9/16) / this._tileScaleDivisor, screenHeight / this._tileScaleDivisor);
        this.getBackground()?.setSize(screenWidth, screenHeight);
        this.getChild("world")?.children.forEach((sprite) => {
            sprite.setSize(this._tileSize, this._tileSize);
            const [x, y] = sprite.label.split("-").map(Number);
            sprite.position.set(x * this._tileSize, y * this._tileSize);
        });
    };
    addResizeEvent(element: Window){element.addEventListener("resize", this.resize.bind(this))}
    removeResizeEvent(element: Window){element.removeEventListener("resize", this.resize.bind(this))}
    keydown(e: KeyboardEvent){
        this._keymap.add(e.key);
        if(this._keydownFn.has(e.key)) this._keydownFn.get(e.key)?.call(this, e);
    }
    keyup(e: KeyboardEvent){
        this._keymap.delete(e.key);
        if(this._keyupFn.has(e.key)) this._keyupFn.get(e.key)?.call(this, e);
    }
    updateCursorPos(e: MouseEvent){
        this._cursorPosition.x = (e.offsetX - innerWidth / 2 + this._cameraPosition.x * this._tileSize) / this._tileSize;
        this._cursorPosition.y = (e.offsetY - innerHeight / 2 + this._cameraPosition.y * this._tileSize) / this._tileSize;
    }
    buttondown(e: MouseEvent){
        this._buttonmap.add(e.button);
        this.updateCursorPos(e);
        if(this._buttondownFn.has(e.button)) this._buttondownFn.get(e.button)?.call(this, {...this._cursorPosition});
    }
    buttonup(e: MouseEvent){
        this._buttonmap.delete(e.button);
        this.updateCursorPos(e);
        if(this._buttonupFn.has(e.button)) this._buttonupFn.get(e.button)?.call(this, {...this._cursorPosition});
    }
    mousemove(e: MouseEvent){
        this.updateCursorPos(e);
    }
    addKeydownEvent(element: Document){element.addEventListener("keydown", this.keydown.bind(this))}
    removeKeydownEvent(element: Document){element.removeEventListener("keydown", this.keydown.bind(this))}
    addKeyupEvent(element: Document){element.addEventListener("keyup", this.keyup.bind(this))}
    removeKeyupEvent(element: Document){element.removeEventListener("keyup", this.keyup.bind(this))}
    addButtondownEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.addEventListener("mousedown", this.buttondown.bind(this))}
    removeButtondownEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.removeEventListener("mousedown", this.buttondown.bind(this))}
    addButtonupEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.addEventListener("mouseup", this.buttonup.bind(this))}
    removeButtonupEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.removeEventListener("mouseup", this.buttonup.bind(this))}
    addMousemoveEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.addEventListener("mousemove", this.mousemove.bind(this))}
    removeMousemoveEvent(canvas: HTMLCanvasElement = this._app.canvas){canvas.removeEventListener("mousemove", this.mousemove.bind(this))}
    addTicker(fn: TickerCallback<any>, context?: any, priority?: number):Ticker{return this._app.ticker.add(fn, context, priority)}
    destroy(){
        this._keymap.clear()
        this._app.destroy()
    }

    tick(delta: number){
        // sort children
        this._camera.children.forEach(sprite => {
            if(sprite.label === "world") return;
            sprite.zIndex = sprite.y;
        });
        this._camera.sortChildren();
        // is client instance
        if(this._isClient){
            this._instance.tick(delta);
        } else {
            this._instance.update({});
        }
        // update entities
        this._instance.entities.forEach(entity => {
            const sprite = this.getChild(entity.id);
            if(sprite){
                sprite.position.set(entity.position.x * this._tileSize, entity.position.y * this._tileSize);
                sprite.rotation = entity.rotation;
                sprite.setSize(
                    this._tileSize * entity.dScale.x * entity.scale.x,
                    this._tileSize * entity.dScale.y * entity.scale.y
                );
            }
        });
        // keypressed
        this._keymap.forEach(key => {
            if(this._keypressedFn.has(key)) this._keypressedFn.get(key)?.call(this);
        });
        // buttonpressed
        this._buttonmap.forEach(button => {
            if(this._buttonpressedFn.has(button)) this._buttonpressedFn.get(button)?.call(this, this._cursorPosition);
        });
        // camera follow
        if(this._cameraBinder){
            const entity = this._instance.getEntity(this._cameraBinder);
            if(entity){
                const dx = entity.position.x - this._cameraPosition.x;
                const dy = entity.position.y - this._cameraPosition.y;
                this._cameraPosition.x += dx / (delta/this._cameraFriction);
                this._cameraPosition.y += dy / (delta/this._cameraFriction);
            }
        }
        // camera
        this._camera.pivot.set(
            this._cameraPosition.x * this._tileSize,
            this._cameraPosition.y * this._tileSize
        );
        // animate filters
        if(Array.isArray(this._app.stage.filters)){
            this._app.stage.filters.forEach(filter => {
                if(
                    filter instanceof ShockwaveFilter ||
                    filter instanceof GodrayFilter
                ){
                    filter.time += delta/1000;
                }
            });
        }
    }
    spawn(entityId: string, opt:any, _category:string = 'entities', _extender: string = 'svg'){
        const _sprite = new Sprite(Assets.get(`/assets/${_category}/${opt.tag}.${_extender}`));
        _sprite.anchor.set(opt.dAnchor.x, opt.dAnchor.y);
        _sprite.position.set(opt.position.x, opt.position.y);
        _sprite.rotation = opt.rotation;
        _sprite.setSize(
            this._tileSize * opt.dScale.x * opt.scale.x,
            this._tileSize * opt.dScale.y * opt.scale.y
        );
        _sprite.label = entityId;
        this._camera.addChild(_sprite);
    }
    despawn(entityId: string){
        const sprite = this.getChild(entityId);
        if(sprite){
            this._camera.removeChild(sprite);
            sprite.destroy();
        }
    }
    getBackground():TilingSprite|null{return this._app.stage.getChildByLabel("background") as TilingSprite}
    getChild(label: string):Container|Sprite|null{return this._camera.getChildByLabel(label);}
    onKeydown(key: string, callback: (...args: any[]) => void){this._keydownFn.set(key, callback);}
    onKeyup(key: string, callback: (...args: any[]) => void){this._keyupFn.set(key, callback);}
    onKeypress(key: string, callback: (...args: any[]) => void){this._keypressedFn.set(key, callback);}
    offKeydown(key: string){this._keydownFn.delete(key);}
    offKeyup(key: string){this._keyupFn.delete(key);}
    offKeypress(key: string){this._keypressedFn.delete(key);}
    onButtondown(button: number, callback: (pos:Point, ...args: any[]) => void){this._buttondownFn.set(button, callback);}
    onButtonup(button: number, callback: (pos:Point, ...args: any[]) => void){this._buttonupFn.set(button, callback);}
    onButtonpress(button: number, callback: (pos:Point, ...args: any[]) => void){this._buttonpressedFn.set(button, callback);}
    offButtondown(button: number){this._buttondownFn.delete(button);}
    offButtonup(button: number){this._buttonupFn.delete(button);}
    offButtonpress(button: number){this._buttonpressedFn.delete(button);}

    applyFilter(type:string, options:any){
        if(Array.isArray(this._app.stage.filters)){
            this._app.stage.filters = [...this._app.stage.filters, this.makeFilter(type, options)];
        }
    }
    makeFilter(type: string, options: any):Filter{
        switch(type){
            case 'blur':
                return new BlurFilter(options);
            case 'colorMatrix':
                return new ColorMapFilter(options);
            case 'displacement':
                return new DisplacementFilter(options);
            case 'dropShadow':
                return new DropShadowFilter(options);
            case 'outline':
                return new OutlineFilter(options);
            case 'pixelate':
                return new PixelateFilter(options);
            case 'shockwave':
                return new ShockwaveFilter(options);
            case 'twist':
                return new TwistFilter(options);
            case 'godray':
                return new GodrayFilter(options);
            case 'bloom':
                return new BloomFilter(options);
            case 'advancedBloom':
                return new AdvancedBloomFilter(options);
            case 'adjustment':
                return new AdjustmentFilter(options);
            case 'backdropBlur':
                return new BackdropBlurFilter(options);
            case 'bulgePinch':
                return new BulgePinchFilter(options);
            case 'convolution':
                return new ConvolutionFilter(options);
            case 'grayscale':
                return new GrayscaleFilter();
            case 'motionBlur':
                return new MotionBlurFilter(options);
            case 'rgbSplit':
                return new RGBSplitFilter(options);
            case 'simpleLightmap':
                return new SimpleLightmapFilter(options);
            case 'zoomBlur':
                return new ZoomBlurFilter(options);
            default:
                return new Filter(options);
        }
    }
}