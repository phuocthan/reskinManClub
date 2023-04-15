import Dialog from "../../../scripts/common/Dialog";
import Tween from "../../../scripts/common/Tween";
import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export class PopupBonus extends Dialog {
    @property(cc.Node)
    items: cc.Node = null;
    @property(cc.Node)
    special: cc.Node = null;
    @property(cc.Node)
    itemSpecial: cc.Node = null;
    @property(cc.Label)
    lblTotal: cc.Label = null;
    @property(cc.Label)
    lblSpecial: cc.Label = null;
    @property([cc.SpriteFrame])
    sprFramesFactor: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sprFramesSpecialOpened: cc.SpriteFrame[] = [];

    private left = 0;
    private onFinished: () => void = null;
    private dataBonus: Array<number> = [];
    private factors: number[] = [];
    private totalCoin = 0;
    private cbAutoClose: Function = null;

    start() {
        for (let i = 0; i < this.items.childrenCount; i++) {
            let node = this.items.children[i];
            node["btn"] = node.getChildByName("btn").getComponent(cc.Button);
            node["coin"] = node.getChildByName("coin");
            node["label"] = node.getChildByName("coin").getChildByName("label").getComponent(cc.Label);

            node["btn"].node.on("click", () => {
                var value = this.dataBonus[this.dataBonus.length - this.left];
                node.getChildByName("btn").getComponent(sp.Skeleton).setAnimation(0, 'mosach', false);
                node.getChildByName("btn").getComponent(sp.Skeleton).addAnimation(0, 'idle_sachmo', true);
                setTimeout ( () => {
                    node["coin"].active = true;
                    node["label"].string = "0";
                    Tween.numberTo(node["label"], value, 0.3);
    
                    this.totalCoin += value;
                    Tween.numberTo(this.lblTotal, this.totalCoin, 0.3);
    
                    this.left--;
                    if (this.left <= 0) {
                        for (let i = 0; i < this.items.childrenCount; i++) {
                            this.items.children[i]["btn"].interactable = false;
                        }
                        this.scheduleOnce(() => {
                            this.showSpecial();
                        }, 1.5);
                    }
    
                    this.unschedule(this.cbAutoClose);
                }, 500)
            });
        }
        for (let i = 0; i < this.itemSpecial.childrenCount; i++) {
            let node = this.itemSpecial.children[i];
            node["btn"] = node.getChildByName("btn").getComponent(cc.Button);
            node["icon"] = node.getChildByName("icon").getComponent(cc.Sprite);
            node["btn"].node.on("click", () => {
                let factorOtherIdx = 0;
                for (let j = 0; j < this.itemSpecial.childrenCount; j++) {
                    let node2 = this.itemSpecial.children[j];
                    node2["btn"].interactable = false;
                    // node2["icon"].node.active = true;
                    if (j == i) {
                        console.log('this.factors[0] - 1this.factors[0] - 1', this.factors[0] - 1)
                        // node2["btn"].node.active = false;
                        node2["btn"].node.getComponent(sp.Skeleton).setAnimation(0, 'symbolFx', false);
                        // node2["btn"].node.getComponent(sp.Skeleton).addAnimation(0, 'fade', true);
                        node2["icon"].spriteFrame = this.sprFramesFactor[this.factors[0] - 1];
                    } else {
                        factorOtherIdx++;
                        node2["icon"].spriteFrame = this.sprFramesFactor[this.factors[factorOtherIdx] - 1];
                        node2["btn"].node.getComponent(sp.Skeleton).setAnimation(0, 'fade', true);
                    }

                    setTimeout( () => {
                        node2["icon"].node.active = true;
                    }, 500)
                    // node2["btn"].getComponent(cc.Sprite).spriteFrame = this.sprFramesSpecialOpened[1]; // hna comment
                }
                this.totalCoin *= this.factors[0];
                Tween.numberTo(this.lblTotal, this.totalCoin, 0.3);
                // this.lblSpecial.string = Utils.formatNumber(this.totalCoin) + " x " + this.factors[0] + " = " + Utils.formatNumber(this.totalCoin * this.factors[0]);
                this.hidden();
            });
        }
    }

    showBonus(bonus: string, onFinished: () => void) {
        console.log('@@@ show Bonus ',bonus)
        super.show();
        this.special.active = false;
        this.items.active = true;
        
        for (let i = 0; i < this.items.childrenCount; i++) {
            let node = this.items.children[i];
            let btn = node.getChildByName("btn").getComponent(cc.Button);
            btn.node.active = true;
            btn.getComponent(sp.Skeleton).setAnimation(0, 'idle_sachdong', true);
            btn.interactable = true;
            // node.getChildByName("icon").active = false;
            node.getChildByName("coin").active = false;
        }
        this.onFinished = onFinished;
        let arrBonus = bonus.split(",");
        this.dataBonus = [];
        for (let i = 0; i < arrBonus.length - 2; i++) {
            this.dataBonus.push(Number(arrBonus[i]));
        }
        this.left = this.dataBonus.length;

        let factor = Number(arrBonus[arrBonus.length - 2]);
        this.factors.length = 0;
        this.factors.push(factor);
        for (let i = 1; i <= 3; i++) {
            if (i != factor) {
                this.factors.push(i);
            }
        }
        this.lblTotal.string = "0";
        this.totalCoin = 0;
        this.cbAutoClose = () => {
            this.dismiss();
            this.onFinished();
        };
        this.scheduleOnce(this.cbAutoClose, 10);
    }

    private showSpecial() {
        this.items.active = false;

        for (let i = 0; i < this.itemSpecial.childrenCount; i++) {
            let node = this.itemSpecial.children[i];
            // node["btn"].getComponent(cc.Sprite).spriteFrame = this.sprFramesSpecialOpened[0]; // hna comment
            let btn = node.getChildByName("btn").getComponent(cc.Button);
            btn.node.active = true;
            btn.interactable = true;
            btn.getComponent(sp.Skeleton).setAnimation(0, 'idle', true);
            node.getChildByName("icon").active = false;
            node.getChildByName("icon").active = false;
        }
        this.lblSpecial.string = "";
        this.special.active = true;
    }

    hidden() {
        this.scheduleOnce(() => {
            this.dismiss();
            this.onFinished();
        }, 2);
    }
}
export default PopupBonus;