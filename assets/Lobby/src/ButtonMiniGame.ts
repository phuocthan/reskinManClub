import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import InPacket from "../../scripts/networks/Network.InPacket";
import App from "../../scripts/common/App";
import cmd from "./Lobby.Cmd";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonMiniGame extends cc.Component {

    @property(cc.Label)
    labelTime: cc.Label = null;

    @property(cc.Node)
    button: cc.Node = null;

    @property(cc.Node)
    panel: cc.Node = null;

    @property(cc.Node)
    container: cc.Node = null;

    @property(cc.Node)
    bgColor: cc.Node = null;
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;

    private buttonClicked = true;
    private buttonMoved = cc.Vec2.ZERO;

    private isActing = false;

    onLoad() {
        this.panel.active = false;
        this.button.active = false;
        this.labelTime.string = "00";

        this.button.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.buttonClicked = true;
            this.buttonMoved = cc.Vec2.ZERO;
        }, this);

        this.button.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.buttonMoved = this.buttonMoved.add(event.getDelta());
            if (this.buttonClicked) {
                if (Math.abs(this.buttonMoved.x) > 30 || Math.abs(this.buttonMoved.y) > 30) {
                    let pos = this.button.position;
                    pos.x += this.buttonMoved.x;
                    pos.y += this.buttonMoved.y;
                    this.button.position = pos;
                    this.buttonClicked = false;
                }
            } else {
                let pos = this.button.position;
                pos.x += event.getDeltaX();
                pos.y += event.getDeltaY();
                this.button.position = pos;
            }
        }, this);

        this.button.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            if (this.buttonClicked) {
                this.actButton();
            }
        }, this);

        MiniGameNetworkClient.getInstance().addListener((data: Uint8Array) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.UPDATE_TIME_BUTTON:
                    {
                        let res = new cmd.ReceiveUpdateTimeButton(data);
                        this.labelTime.string = res.remainTime > 9 ? res.remainTime.toString() : "0" + res.remainTime;
                    }
                    break;
            }
        }, this);
    }

    show() {
        this.panel.active = false;
        this.button.active = true;
        this.labelTime.string = "00";
    }

    hidden() {
        this.panel.active = false;
        this.button.active = false;
    }

    showTimeTaiXiu(isShow: boolean) {
        // console.log(isShow);
        this.labelTime.node.parent.active = isShow;
    }

    actButton() {
        if(this.isActing)
            return;

        this.isActing = true;
        this.panel.active = true;
        this.bgColor.active = true;

        let delay = 0.2;
        let animDuration = 0.4;

        this.button.runAction(cc.sequence(cc.fadeOut(delay), cc.callFunc(() => {
            this.button.active = false;
        })));

        this.panel.position = this.button.position;
        this.panel.scale = 0;
        this.panel.rotation = 0;
        this.panel.opacity = 0;
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.panel.runAction(cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.moveTo(animDuration, cc.v2(0, 0)).easing(cc.easeInOut(3)),
                cc.scaleTo(animDuration, 1).easing(cc.easeInOut(3)),
                cc.rotateBy(animDuration, -360).easing(cc.easeInOut(3)),
                cc.fadeIn(animDuration).easing(cc.easeInOut(3))
            ),
            cc.callFunc(() => {
                this.isActing = false;
            })
        ));

        FacebookTracking.logBtnMiniGame();
    }

    actHidden() {
        if(this.isActing)
            return;

        this.isActing = true;
            
        let delay = 0.2;
        let animDuration = 0.8;

        this.panel.position = cc.v2(0, 0);
        this.panel.scale = 1;
        this.panel.opacity = 255;
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.panel.runAction(cc.sequence(
            cc.spawn(
                cc.moveTo(animDuration, this.button.position).easing(cc.easeIn(6)),
                cc.fadeOut(animDuration).easing(cc.easeIn(6)),
                cc.scaleTo(animDuration, 0).easing(cc.easeIn(2)),
                cc.rotateBy(animDuration, 360).easing(cc.easeIn(2))
            ),
            cc.callFunc(() => {
                this.panel.active = false;
                this.button.active = true;
                this.bgColor.active = false;

                this.button.runAction(cc.fadeIn(delay));

                this.isActing = false;
            })
        ));
    }

    actTaiXiu() {
        App.instance.openGameTaiXiuMini();
        this.actHidden();
    }

    actMiniPoker() {
        App.instance.openGameMiniPoker();
        this.actHidden();
    }

    actSlot3x3() {
        App.instance.openGameSlot3x3();
        this.actHidden();
    }

    actCaoThap() {
        App.instance.openGameCaoThap();
        this.actHidden();
    }

    actBauCua() {
        App.instance.openGameBauCua();
        this.actHidden();
    }

    actChimDien(){
        App.instance.alertDialog.showMsg("Game sắp ra mắt.");
        this.actHidden();
    }

    actOanTuTi(){
        App.instance.openGameOanTuTi();
        this.actHidden();
    }
}