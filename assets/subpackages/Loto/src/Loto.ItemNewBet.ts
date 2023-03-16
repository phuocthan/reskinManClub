import Utils from "../../../scripts/common/Utils";
import cmd from "./Loto.Cmd";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemNewBet extends cc.Component {
    @property(cc.Label)
    nickname: cc.Label = null;
    @property(cc.Label)
    bet: cc.Label = null;
    @property(cc.Label)
    channel: cc.Label = null;
    @property(cc.Label)
    mode: cc.Label = null;
    @property(cc.Label)
    num: cc.Label = null;

    setData(data) {
        // this.node.getComponent(cc.RichText).string =
        //     "<color=#ffcc00>" + data.nickname + "</c><color=#ffffff> : đã cược </c><color=#ff0000>" + Utils.formatNumber(data.bet)
        //     + " Gold</c><color=#ffffff> tại đài </c><color=#0036ff>" + cmd.Code.LOTO_CHANNEL_NAME[data.channel]
        //     + " </c><color=#ffffff> loại </c><color=#ff0000>" + cmd.Code.LOTO_GAME_MODE_NAME[data.mode] + "</c>"
        //     + "<color=#ffffff> cho số : </c>" + " <color=#00ff9c>" + data.nums + " </c>";

        this.nickname.string = data.nickname;
        this.bet.string = Utils.formatNumber(data.bet);
        this.channel.string =  cmd.Code.LOTO_CHANNEL_NAME[data.channel];
        this.mode.string = cmd.Code.LOTO_GAME_MODE_NAME[data.mode];
        this.num.string = data.nums;
    }
}
