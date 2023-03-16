import MauBinhController from "./MauBinh.Controller";
import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemRoom extends cc.Component {

    @property(cc.Label)
    labelBet: cc.Label = null;
    @property(cc.Label)
    labelBetMin: cc.Label = null;
    @property(cc.Label)
    labelNumPlayers: cc.Label = null;
    @property(cc.Sprite)
    progressNumPlayers: cc.Sprite = null;

    // hna add
    @property(cc.SpriteFrame)
    bgLevel1: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    bgLevel2: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    bgLevel3: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    bgLevel4: cc.SpriteFrame = null;
    // end

    private roomInfo = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    initItem(info) {
        this.roomInfo = info;

        this.labelBet.string = Utils.formatNumber(info["moneyBet"]);
        this.labelBetMin.string = Utils.formatNumber(info["requiredMoney"]);
        this.labelNumPlayers.string = info["userCount"] + "/" + info["maxUserPerRoom"];
        this.progressNumPlayers.fillRange = info["userCount"] / info["maxUserPerRoom"];
    }

    chooseRoom() {
        MauBinhController.instance.joinRoom(this.roomInfo);
    }

    // update (dt) {}
}
