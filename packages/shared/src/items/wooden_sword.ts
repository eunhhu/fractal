import Item from "~/item";

export class WoodenSword extends Item{
    static tag: string = 'wooden_sword';
    tag: string = WoodenSword.tag;
    dDamage: number = 10;
    dCriticalChance: number = 0.1;
    dCriticalDamage: number = 2;
    dKnockback: number = 0.5;
    dCooldown: number = 500;
    dCates: string[] = [];
    constructor(){
        super();
    }
    static {Item.register(WoodenSword.tag, WoodenSword);}
    tick(delta: number): void {
        // cooldown
        this.restCooldown -= delta;
        if(this.restCooldown < 0){
            this.restCooldown = 0;
        }
        // main interaction
        if(this.mainDown && this.restCooldown <= 0){
            this.mainInteraction();
            this.restCooldown = this.dCooldown;
        }
    }
    mainInteraction(): void {
        this.emit('attack', this.dDamage);
    }
}