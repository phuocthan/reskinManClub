import Play from "./ShootFish.Play";
import App from "../../../scripts/common/App";
import Configs from "../../../scripts/common/Configs";
import PopupCoinTransfer from "./ShootFish.PopupCoinTransfer";
import Utils from "../../../scripts/common/Utils";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import MiniGameNetworkClient from "../../../scripts/networks/MiniGameNetworkClient";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmd from "../../../Lobby/src/Lobby.Cmd";
import ShootFishNetworkClient from "../../../scripts/networks/ShootFishNetworkClient";
import AudioManager from "../../../scripts/common/Common.AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Lobby extends cc.Component {

    public static instance: Lobby = null;

    @property(cc.Node)
    playNode: cc.Node = null;
    @property(cc.Label)
    lblBalance: cc.Label = null;
    @property(PopupCoinTransfer)
    popupCoinTransfer: PopupCoinTransfer = null;
    @property({type: cc.AudioClip})
    clipBgm: cc.AudioClip = null;
    @property({type: cc.AudioClip})
    clipClick: cc.AudioClip = null;

    private play: Play = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        Lobby.instance = this;

        this.play = this.playNode.getComponent(Play);
        this.play.node.active = false;

        this.lblBalance.string = Utils.formatNumber(Configs.Login.CoinFish);

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            this.lblBalance.string = Utils.formatNumber(Configs.Login.CoinFish);
        }, this);

        ShootFishNetworkClient.getInstance().checkConnect((isLogined) => {
            if (!isLogined) {
                App.instance.alertDialog.showMsgWithOnDismissed("Đăng nhập thất bại, vui lòng thử lại.", () => {
                    this.actBack();
                });
                return;
            }
            Play.SERVER_CONFIG = Configs.Login.FishConfigs;
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
            if (Configs.Login.CoinFish <= 0) {
                App.instance.confirmDialog.show3("Tiền trong Bắn Cá của bạn đã hết, bạn có muốn chuyển tiền vào không?", "Có", (isConfirm) => {
                    if (isConfirm) {
                        this.popupCoinTransfer.show();
                    }
                });
            }
        });

        ShootFishNetworkClient.getInstance().addOnClose(() => {
            // App.instance.showErrLoading("Mất kết nối, đang thử kết nối lại...");
            App.instance.confirmDialog.show3("Bạn bị mất kết nối, bạn có muốn kết nối lại ?", "Kết Nối", (isConfirm) => {
                if(isConfirm) {
                    ShootFishNetworkClient.getInstance().connect();
                }
            });
        }, this);

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inPacket = new InPacket(data);
            switch (inPacket.getCmdId()) {
                case cmd.Code.GET_MONEY_USE: {
                    let res = new cmd.ResGetMoneyUse(data);
                    Configs.Login.Coin = res.moneyUse;
                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    break;
                }
            }
        }, this);

        AudioManager.getInstance().playBackgroundMusic(this.clipBgm);
    }

    actBack() {
        // NetworkClient.getInstance().close();
        AudioManager.getInstance().playEffect(this.clipClick);
        App.instance.loadScene("Lobby");
    }

    actHonors() {

    }

    actRoom1() {
        this.show(false);
        AudioManager.getInstance().playEffect(this.clipClick);
        this.play.show(true, 1);
    }

    actRoom2() {
        this.show(false);
        AudioManager.getInstance().playEffect(this.clipClick);
        this.play.show(true, 2);
    }

    actRoom3() {
        this.show(false);
        AudioManager.getInstance().playEffect(this.clipClick);
        this.play.show(true, 3);
    }

    public show(isShow: boolean) {
        this.node.active = isShow;
        this.node.getChildByName("bg").getComponent("BgResizer").forceUpdateSize();
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
    }
}
