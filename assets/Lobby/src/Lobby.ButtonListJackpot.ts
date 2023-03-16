import cmd from "./Lobby.Cmd";
import Tween from "../../scripts/common/Tween";
import FacebookTracking from "../../scripts/common/FacebookTracking";
import App from "../../scripts/common/App";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonListJackpot extends cc.Component {

    @property(cc.Node)
    button: cc.Node = null;
    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    samurai: cc.Node = null;
    @property(cc.Node)
    khobau: cc.Node = null;
    @property(cc.Node)
    daphu: cc.Node = null;
    @property(cc.Node)
    duongdua: cc.Node = null;
    @property(cc.Node)
    minipoker: cc.Node = null;
    @property(cc.Node)
    skyforce: cc.Node = null;

    private buttonClicked = true;
    private buttonMoved = cc.Vec2.ZERO;
    private animate = false;

    public static lastRes: cmd.ResUpdateJackpots = null;

    onLoad() {
        this.container.active = false;

        this.button.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.buttonClicked = true;
            this.buttonMoved = cc.Vec2.ZERO;
        }, this);

        this.button.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.buttonMoved = this.buttonMoved.add(event.getDelta());
            if (this.buttonClicked) {
                if (Math.abs(this.buttonMoved.x) > 30 || Math.abs(this.buttonMoved.y) > 30) {
                    let pos = this.node.position;
                    pos.x += this.buttonMoved.x;
                    pos.y += this.buttonMoved.y;
                    this.node.position = pos;
                    this.buttonClicked = false;
                }
            } else {
                let pos = this.node.position;
                pos.x += event.getDeltaX();
                pos.y += event.getDeltaY();
                this.node.position = pos;
            }
        }, this);

        this.button.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.buttonClicked) {
                this.toggleShowPanel();
            }
        }, this);

        this.updateJackpot();
    }

    private toggleShowPanel() {
        if (this.animate) return;
        this.animate = true;
        if (!this.container.active) {
            this.container.stopAllActions();
            this.container.active = true;
            this.container.scaleY = 0;
            this.container.runAction(cc.sequence(
                cc.scaleTo(0.2, 1).easing(cc.easeBackOut()),
                cc.callFunc(() => {
                    this.animate = false;
                })
            ));

            FacebookTracking.logTopHu();
        } else {
            this.container.stopAllActions();
            this.container.runAction(cc.sequence(
                cc.scaleTo(0.2, 1, 0).easing(cc.easeBackIn()),
                cc.callFunc(() => {
                    this.container.active = false;
                    this.animate = false;
                })
            ));
        }
    }

    setData(res: cmd.ResUpdateJackpots) {
        ButtonListJackpot.lastRes = res;
        this.updateJackpot();

        console.log("ResUpdateJackpots: " + JSON.stringify(res)); 
        console.log("ResMsg: " + res.message);

        if(res.message) {
            App.instance.alertDialog.showMsg(res.message);
        }
    }

    updateJackpot(duration: number = 4) {
        if (ButtonListJackpot.lastRes == null) return;

        Tween.numberTo(this.samurai.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.khoBau100, duration);
        Tween.numberTo(this.khobau.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.NDV100, duration);
        Tween.numberTo(this.daphu.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.Avengers100, duration);
        Tween.numberTo(this.duongdua.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.Vqv100, duration);
        Tween.numberTo(this.minipoker.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.miniPoker100, duration);
        Tween.numberTo(this.skyforce.getComponentsInChildren(cc.Label)[1], ButtonListJackpot.lastRes.pokeGo100, duration);

        Tween.numberTo(this.samurai.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.khoBau1000, duration);
        Tween.numberTo(this.khobau.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.NDV1000, duration);
        Tween.numberTo(this.daphu.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.Avengers1000, duration);
        Tween.numberTo(this.duongdua.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.Vqv1000, duration);
        Tween.numberTo(this.minipoker.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.miniPoker1000, duration);
        Tween.numberTo(this.skyforce.getComponentsInChildren(cc.Label)[2], ButtonListJackpot.lastRes.pokeGo1000, duration);

        Tween.numberTo(this.samurai.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.khoBau10000, duration);
        Tween.numberTo(this.khobau.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.NDV10000, duration);
        Tween.numberTo(this.daphu.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.Avengers10000, duration);
        Tween.numberTo(this.duongdua.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.Vqv10000, duration);
        Tween.numberTo(this.minipoker.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.miniPoker10000, duration);
        Tween.numberTo(this.skyforce.getComponentsInChildren(cc.Label)[3], ButtonListJackpot.lastRes.pokeGo10000, duration);
    }
}