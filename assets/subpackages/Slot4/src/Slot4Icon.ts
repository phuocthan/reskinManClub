
const { ccclass, property } = cc._decorator;

@ccclass
export default class Slot4Icon extends cc.Component {
    @property(cc.SpriteFrame)
    sprIcons: cc.SpriteFrame[] = [];

    @property(cc.Node)
    nodeIcon: cc.Node = null;
    @property(cc.Node)
    fxJackpot: cc.Node = null;
    @property(cc.Node)
    fxBonus: cc.Node = null;
    @property(cc.Node)
    fxFree: cc.Node = null;

    // @property(cc.Node)
    // icon1: cc.Node = null;
    // @property(cc.Node)
    // icon2: cc.Node = null;
    // @property(cc.Node)
    // icon3: cc.Node = null;
    // @property(cc.Node)
    // icon4: cc.Node = null;

    // hna
    @property(cc.Node)
    icon1: cc.Node = null;
    @property(cc.Node)
    icon2: cc.Node = null;
    @property(cc.Node)
    icon3: cc.Node = null;
    @property(cc.Node)
    icon4: cc.Node = null;
    // end

    private animation: cc.Animation;

    onLoad() {
        this.animation = this.getComponent(cc.Animation);
    }

    start() {

    }

    setSprite(sprIndex: number) {
        this.nodeIcon.active = true;
        this.fxJackpot.active = false;
        this.fxBonus.active = false;
        this.fxFree.active = false;
        this.icon1.active = false;
        this.icon2.active = false;
        this.icon3.active = false;
        this.icon4.active = false;

        this.nodeIcon.getComponent(cc.Sprite).spriteFrame = this.sprIcons[sprIndex];
        this.nodeIcon.setContentSize(cc.size(150, 150));
    }

    setSpine(id) {
        this.fxJackpot.active = false;
        this.fxBonus.active = false;
        this.fxFree.active = false;
        this.icon1.active = false;
        this.icon2.active = false;
        this.icon3.active = false;
        this.icon4.active = false;

        switch (parseInt(id)) {
            case 0:
                this.fxJackpot.active = true;
                break;
            case 1:
                this.fxBonus.active = true;
                break;
            case 2:
                this.fxFree.active = true;
                break;
            case 3:
                this.icon1.active = true;
                break;
            case 4:
                this.icon2.active = true;
                break;
            case 5:
                this.icon3.active = true;
                break;
            case 6:
                this.icon4.active = true;
                break;
            default:
                break;
        }
    }

    scale() {
        if (this.nodeIcon.active) {
            this.animation.play();
        }
    }
}
