import cmd from "./Loto.Cmd";
import Utils from "../../../scripts/common/Utils";
const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemHistory extends cc.Component {
    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Label)
    labelTime: cc.Label = null;
    @property(cc.Label)
    labelMode: cc.Label = null;
    @property(cc.Label)
    labeChannel: cc.Label = null;
    @property(cc.Label)
    labelNums: cc.Label = null;
    @property(cc.Label)
    labelBet: cc.Label = null;
    @property(cc.Label)
    labelWin: cc.Label = null;
    @property(cc.Label)
    labelResult: cc.Label = null;
    @property(cc.Button)
    btnDetail: cc.Button = null;

    private showDetailFunc: Function = null;
    private detailResult: string = null;

    setData(data) {
        this.bg.active = data.index % 2 == 0 ? false : true;
        this.labelTime.string = data.timePlay.split(" ")[0];
        this.labelMode.string = cmd.Code.LOTO_GAME_MODE_NAME[data.gameMode];
        this.labeChannel.string = cmd.Code.LOTO_CHANNEL_NAME[data.channel];

        cc.log("Loto ItemHistory row : ", data);
        // Co 3 dang : 1 so, 1 string, 1 mang so
        if (typeof data.number == "string" || typeof data.number == "number") {
            this.labelNums.string = data.number;
        } else {
            for (let index = 0; index < data.number.length; index++) {
                if (index == 0) {
                    this.labelNums.string += "";
                } else if (index % 5 == 0) {
                    this.labelNums.string += "\n";
                } else {
                    this.labelNums.string += ", ";
                }
                this.labelNums.string += data.number[index];
            }
        }

        this.labelBet.string = Utils.formatNumber(data.pay * data.payRate);
        this.labelWin.string = Utils.formatNumber(data.win);

        this.btnDetail.node.active = false;
        this.showDetailFunc = data.showDetailFunc;

        if (data.status == 0) {
            this.labelResult.string = "Chờ kết quả ...";
        } else if (data.status == 1) {
            if (typeof data.winNumber == "string" || typeof data.winNumber == "number") {
                this.labelResult.string = data.winNumber;
            } else {
                let result = "";
                let multiLineResults = "";
                for (let index = 0; index < data.winNumber.length; index++) {
                    if (index == 0) {
                        multiLineResults += "";
                    } else if (index % 5 == 0) {
                        multiLineResults += "\n";
                    } else {
                        multiLineResults += ", ";
                    }

                    multiLineResults += data.winNumber[index];
                    if(index < 5) {
                        result += data.winNumber[index] + " ";
                    } else if(index == 5) {
                        result += "...";
                    }
                }

                this.labelResult.string = result;

                if(data.winNumber.length > 0) {
                    this.btnDetail.node.active = true;
                }

                this.detailResult = multiLineResults;
            }
        } else if (data.status == 2) {
            this.labelResult.string = "Hủy";
        } else {
            this.labelResult.string = "Lỗi";
        }
    }

    onShowDetail() {
        if(this.showDetailFunc) {
            this.showDetailFunc(this.detailResult);
        }
    }
}
