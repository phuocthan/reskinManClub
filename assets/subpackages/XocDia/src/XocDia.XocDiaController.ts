// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
import Lobby from "./XocDia.Lobby";
import Play from "./XocDia.Play";
import XocDiaNetworkClient from "./XocDia.XocDiaNetworkClient";
import App from "../../../scripts/common/App";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmdNetwork from "../../../scripts/networks/Network.Cmd";
import Configs from "../../../scripts/common/Configs";
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";

const { ccclass, property } = cc._decorator;

@ccclass
export default class XocDiaController extends cc.Component {
    public static instance: XocDiaController = null;

    @property(cc.Node)
    noteLobby: cc.Node = null;
    @property(cc.Node)
    nodePlay: cc.Node = null;

    public lobby: Lobby = null;
    public play: Play = null;

    onLoad() {
        XocDiaController.instance = this;
        this.lobby = this.noteLobby.getComponent(Lobby);
        this.play = this.nodePlay.getComponent(Play);
    }

    start() {
        this.lobby.init();
        this.play.init();

        this.lobby.node.active = true;
        this.play.node.active = false;

        App.instance.showErrLoading("Đang kết nối ...");
        XocDiaNetworkClient.getInstance().addOnOpen(() => {
            App.instance.showErrLoading("Đang đăng nhập...");
            XocDiaNetworkClient.getInstance().send(new cmdNetwork.SendLogin(Configs.Login.Nickname, Configs.Login.AccessToken));
        }, this);
        XocDiaNetworkClient.getInstance().addOnClose(() => {
            App.instance.loadScene("Lobby");
        }, this);
        XocDiaNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmdNetwork.Code.LOGIN:
                    App.instance.showLoading(false);
                    this.lobby.actRefesh();
                    break;
                case CardGameCmd.Code.GET_INFO_INVITE: {
                    let res = new CardGameCmd.ReceivedGetInfoInvite(data);
                    cc.log(res);
                    this.play.showPopupInvite(res);
                    break;
                }
                case CardGameCmd.Code.INVITE: {
                    let res = new CardGameCmd.ReceivedInvite(data);
                    cc.log(res);
                    this.play.showPopupAcceptInvite(res);
                    break;
                }
            }
        }, this);
        XocDiaNetworkClient.getInstance().connect();
    }

    public showLobby() {
        this.lobby.show();
        this.play.node.active = false;
    }
}
