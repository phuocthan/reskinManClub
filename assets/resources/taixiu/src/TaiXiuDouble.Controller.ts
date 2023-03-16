import MiniGame from "../../../Lobby/src/MiniGame";
import TaiXiuMiniController from "../TaiXiuMini/src/TaiXiuMini.TaiXiuMiniController";
import TX2NetworkClient from "../../../scripts/networks/TX2NetworkClient";
import App from "../../../scripts/common/App";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import MiniGameNetworkClient from "../../../scripts/networks/MiniGameNetworkClient";
import VersionConfig from "../../../scripts/common/VersionConfig";

const { ccclass, property } = cc._decorator;

@ccclass
export default class TaiXiuDoubleController extends MiniGame {

    static instance: TaiXiuDoubleController = null;

    @property(TaiXiuMiniController)
    taiXiu1Node: cc.Node = null;
    @property(cc.Node)
    bg: cc.Node = null;

    // @property(cc.Node)
    // taiXiu2Node: cc.Node = null; 

    @property(cc.Node)
    btnSwitch: cc.Node = null;

    taiXiu1: TaiXiuMiniController = null;
    // taiXiu2: TaiXiuMini2Controller = null;

    private isShowTX1 = true;
    private isMove = false;
    private curX = 0;
    private curY = 0;


    public onLoad() {
        // super.onLoad();
        this.taiXiu1 = this.taiXiu1Node.getComponent(TaiXiuMiniController);
        // this.taiXiu2 = this.taiXiu2Node.getComponent(TaiXiuMini2Controller);
        TaiXiuDoubleController.instance = this;

        this.btnSwitch.active = true;

        this.taiXiu1.gamePlay.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.isMove = false;
            this.reOrder();
        }, this);

        this.taiXiu1.gamePlay.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            var pos = this.gamePlay.position;
            pos.x += event.getDeltaX();
            pos.y += event.getDeltaY();
            this.gamePlay.position = pos;
            this.isMove = true;
        }, this);

        this.taiXiu1.gamePlay.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            let check = false;
            if(Math.abs(this.gamePlay.position.x - this.curX) > 1 || Math.abs(this.gamePlay.position.y - this.curY) > 1) {
                check = true;
            }
            this.curX = this.gamePlay.position.x;
            this.curY = this.gamePlay.position.y;
            if(!this.isMove || !check) {
                this.gamePlay.runAction(cc.sequence(
                    cc.scaleTo(0.2, 1),
                    cc.callFunc(() => {
                        
                    })
                ));
                this.bg.active = true;
            }
        }, this);
    }

    public start() {
        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, () => {
            if (!this.node.active) return;
            this.dismiss();
            this.taiXiu1.unsubScribe(); 
        }, this);

        MiniGameNetworkClient.getInstance().addOnClose(() => {
            if (!this.node.active) return;
            this.dismiss();
            this.taiXiu1.unsubScribe();
        }, this);

        TX2NetworkClient.getInstance().addOnClose(() => {
            if (!this.node.active) return;
            this.dismiss();
            this.taiXiu1.unsubScribe();
        }, this);
    }

    public show() {
        super.show();

        this.isShowTX1 = true;
        this.bg.active = true;

        TX2NetworkClient.getInstance().checkConnect(() => {
            // this.taiXiu2.show();
            this.checkShow();
        });

        MiniGameNetworkClient.getInstance().checkConnect(() => {
            this.taiXiu1.show();
            this.checkShow();
        });
        App.instance.buttonMiniGame.showTimeTaiXiu(false);
        this.checkShow();
    }

    public dismiss() {
        super.dismiss();
        App.instance.buttonMiniGame.showTimeTaiXiu(true);
        this.taiXiu1.dismiss();
    }

    private checkShow() {
        if (this.isShowTX1) {
            this.taiXiu1.gamePlay.scale = 1;
            this.taiXiu1.gamePlay.position = cc.v2(-150, 0);
            this.taiXiu1.nodePanelChat.active = true;
            this.taiXiu1.node.setSiblingIndex(1);

            // this.taiXiu2.gamePlay.scale = 0.5;
            // this.taiXiu2.gamePlay.position = cc.v2(-405, 234);
            // this.taiXiu2.nodePanelChat.active = false;
            // this.taiXiu2.layoutBet.active = false;
        } else {
            // this.taiXiu2.gamePlay.scale = 1;
            // this.taiXiu2.gamePlay.position = cc.Vec2.ZERO;
            // this.taiXiu2.nodePanelChat.active = true;
            // this.taiXiu2.node.setSiblingIndex(1);

            this.taiXiu1.gamePlay.scale = 0.5;
            this.taiXiu1.gamePlay.position = cc.v2(-405, 234);
            this.taiXiu1.nodePanelChat.active = false;
            this.taiXiu1.layoutBet.active = false;
        }
    }

    public actSwitch() {
        // hna add
        return;
        // end
        // this.isShowTX1 = !this.isShowTX1;
        // this.checkShow();
    }

    public actSmallView() {
        this.gamePlay.runAction(cc.sequence(
            cc.scaleTo(0.2, 0.5),
            cc.callFunc(() => {
                
            })
        ));
        // this.taiXiu1.gamePlay.scale = 0.5;
        this.bg.active = false;
    }
}
