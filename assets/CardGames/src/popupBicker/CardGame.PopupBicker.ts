import Configs from "../../../scripts/common/Configs";
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";
import CardGameNetworkClient from "../../../scripts/networks/CardGameNetworkClient";
import NetworkClient from "../../../scripts/networks/Network.NetworkClient";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardGame_PopupBicker extends cc.Component {
    @property(cc.Node)
    bgPopup: cc.Node = null;
    @property(cc.Node)
    listEmoj: cc.Node = null;

    private fromPos: number = -1;
    private toPos: number = -1;
    private gameId: number = -1;
    private networkClient: CardGameNetworkClient = null;

    setAdaptiveUI(playerPos) {
        let type = 0;
        if (playerPos.x < -300) {
            // Left
            type = 0;
        } else if (playerPos.x > -300 && playerPos.x < 300) {
            // Center
            type = 3;
        } else {
            // Right
            type = 2;
        }

        switch (type) {
            case 0:  // 0
                this.node.x += 150;
                this.bgPopup.position = cc.v2(-10, 0);
                this.bgPopup.angle = 0;
                this.listEmoj.width = 120;
                break;
            case 1:  // 90
                this.bgPopup.position = cc.v2(0, -10);
                this.bgPopup.angle = 90;
                this.listEmoj.width = 250;
                break;
            case 2:
                this.node.x -= 150;
                this.bgPopup.position = cc.v2(10, 0);
                this.bgPopup.angle = 180;
                this.listEmoj.width = 120;
                break;
            case 3:
                this.node.y -= 150;
                this.bgPopup.position = cc.v2(0, 10);
                this.bgPopup.angle = -90;
                this.listEmoj.width = 250;
                break;
            default:
                break;
        }
    }

    setConfig(gameId: number, networkClient: CardGameNetworkClient, from: number, to: number) {
        this.fromPos = from;
        this.toPos = to;
        this.gameId = gameId;
        this.networkClient = networkClient;
    }

    actSelectBicker(event, data) {
        cc.log("CardGame_selectBicker data : ", data);
        this.selectBicker(parseInt(data));
    }

    selectBicker(id) {
        if(!this.networkClient)
            return;

        this.node.active = false;
        let dataMsg = {
            "fromPos": this.fromPos,
            "toPos": this.toPos,
            "idBicker": id
        }
        let msg = "chatBicker_" + JSON.stringify(dataMsg);
        switch (this.gameId) {
            case Configs.GameId.TLMN:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.Sam:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.BaCay:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.BaiCao:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.Lieng:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.MauBinh:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            case Configs.GameId.Poker:
                this.networkClient.send(new CardGameCmd.SendChatRoom(0, msg));
                break;
            default:
                break;
        }
    }
}
