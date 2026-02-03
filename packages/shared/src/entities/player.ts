import Entity from "../entity";
import Item from "../item";
import type { Point, IEquipment } from "../types";

export default class Player extends Entity{
    static tag: string = 'player';
    tag: string = Player.tag;
    maxHealth: number = 100;
    dDamage: number = 10;
    dSpeed: number = 5;
    dFriction: number = 0.3;
    dScale: Point = {x: 1, y: 2};
    dAnchor: Point = {x: 0.5, y: 0.75};
    dHitbox: Point = {x: 1, y: 1};
    dCates: string[] = ['attackable', 'player'];

    team: string = '';
    headSlot: Item | null = null;
    bodySlot: Item | null = null;
    legsSlot: Item | null = null;
    mainWeapon: Item | null = null;
    subWeapon: Item | null = null;
    constructor(uid:string){super(uid)}
    static {Entity.register(Player.tag, Player);}

    equip(equipments: IEquipment[]){
        equipments.forEach(equipment => {
            switch(equipment.slot){
                case 64:
                    this.headSlot = Item.create(equipment.tag)
                    break;
                case 65:
                    this.bodySlot = Item.create(equipment.tag)
                    break;
                case 66:
                    this.legsSlot = Item.create(equipment.tag)
                    break;
                case 0:
                    this.mainWeapon = Item.create(equipment.tag)
                    break;
                case 1:
                    this.subWeapon = Item.create(equipment.tag)
                    break;
            }
        });
    }
}
