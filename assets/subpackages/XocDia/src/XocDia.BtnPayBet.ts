import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BtnPayBet extends cc.Component {

    @property(cc.Label)
    lblTotalBet: cc.Label = null;
    @property(cc.Label)
    lblMyBet: cc.Label = null;
    @property(cc.Node)
    active: cc.Node = null;

    private myBetVal = 0;

    public reset() {
        this.lblTotalBet.string = "";
        this.lblMyBet.string = "";
        this.myBetVal = 0;
        this.active.active = false;

        // hna add
        this.lblTotalBet.node.parent.active = false;
        this.lblMyBet.node.parent.active = false;
        // end
    }

    // hna add
    public hideLblBet() {
        this.lblTotalBet.node.parent.active = false;
        this.lblMyBet.node.parent.active = false;
    }
    // end

    public setTotalBet(coin: number) {
        // hna add
        this.lblTotalBet.node.parent.active = true;
        // end
        this.lblTotalBet.string = coin > 0 ? Utils.formatLongNumber(coin) : "";
    }

    public setMyBet(coin: number) {
        // hna add
        this.lblMyBet.node.parent.active = true;
        // end
        this.lblMyBet.string = coin > 0 ? Utils.formatLongNumber(coin) : "";
        this.myBetVal = coin;
    }

    public addMyBet(coin: number) {
        // hna add
        this.lblMyBet.node.parent.active = true;
        // end
        this.myBetVal += coin;
        this.lblMyBet.string = coin > 0 ? Utils.formatLongNumber(this.myBetVal) : "";
    }
}
