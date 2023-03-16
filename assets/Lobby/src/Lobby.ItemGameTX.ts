import ItemGame from "./Lobby.ItemGame";
import Utils from "../../scripts/common/Utils";
import Random from "../../scripts/common/Random";
import Tween from "../../scripts/common/Tween";
import Configs from "../../scripts/common/Configs";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemGameTX extends ItemGame {
    @property(cc.Label)
    lblTai: cc.Label = null;
    @property(cc.Label)
    lblXiu: cc.Label = null;
    @property(cc.Label)
    lblJackpot: cc.Label = null;

    private tai = 0;
    private xiu = 0;
    private maxTai = 0;
    private maxXiu = 0;
    private updateNextTai = 0;
    private updateNextXiu = 0;
    private jackpot = 0;
    private maxJackpot = 0;
    private updateNextJackpot = 0;

    start() {

        // Viewer
        if (!Configs.Login.IsLogin) { 
            let scale = 1000;
            this.tai = Utils.randomRangeInt(5000 * scale, 6000 * scale);
            this.maxTai = this.tai + Utils.randomRangeInt(2000 * scale, 5000 * scale);
            Tween.numberTo(this.lblTai, this.tai, 1);
            this.updateNextTai = Utils.randomRangeInt(3, 10);

            this.xiu = Utils.randomRangeInt(5000 * scale, 6000 * scale);
            this.maxXiu = this.xiu + Utils.randomRangeInt(2000 * scale, 5000 * scale);
            Tween.numberTo(this.lblXiu, this.xiu, 1);
            this.updateNextXiu = Utils.randomRangeInt(3, 10);

            this.jackpot = Utils.randomRangeInt(5000 * scale, 6000 * scale);
            this.maxJackpot = this.jackpot + Utils.randomRangeInt(2000 * scale, 5000 * scale);
            Tween.numberTo(this.lblJackpot, this.jackpot, 1);
            this.updateNextJackpot = Utils.randomRangeInt(3, 10);
        } else { 
            // Players
        }

        BroadcastReceiver.register(BroadcastReceiver.ON_UPDATE_TAXIU_ITEM, (data) => {
            if(Configs.Login.IsLogin) {
                Tween.numberTo(this.lblTai, data.potTai, 1);
                Tween.numberTo(this.lblXiu, data.potXiu, 1);
                Tween.numberTo(this.lblJackpot, isNaN(data.jackpotTX) ? 0 : data.jackpotTX, 1);
            }
        }, this);
    }

    update(dt: number) {
        if (!Configs.Login.IsLogin) {
            if (this.updateNextTai > 0) {
                this.updateNextTai -= dt;
                if (this.updateNextTai < 0) {
                    this.updateNextTai = Utils.randomRangeInt(3, 10);

                    let scale = 1000;
                    this.tai += Utils.randomRangeInt(0.5 * scale, 0.7 * scale);
                    if (this.tai > this.maxTai) {
                        this.tai = 5000 * scale;
                        this.maxTai = this.tai + Utils.randomRangeInt(2000 * scale, 5000 * scale);
                    }
                    Tween.numberTo(this.lblTai, this.tai, 1);
                    this.lblTai.string = Utils.formatNumber(this.tai);
                }
            }

            if (this.updateNextXiu > 0) {
                this.updateNextXiu -= dt;
                if (this.updateNextXiu < 0) {
                    this.updateNextXiu = Utils.randomRangeInt(3, 10);

                    let scale = 1000;
                    this.xiu += Utils.randomRangeInt(0.5 * scale, 0.7 * scale);
                    if (this.xiu > this.maxXiu) {
                        this.xiu = 5000 * scale;
                        this.maxXiu = this.xiu + Utils.randomRangeInt(2000 * scale, 5000 * scale);
                    }
                    Tween.numberTo(this.lblXiu, this.xiu, 1);
                    this.lblXiu.string = Utils.formatNumber(this.xiu);
                }
            }

            if (this.updateNextJackpot > 0) {
                this.updateNextJackpot -= dt;
                if (this.updateNextJackpot < 0) {
                    this.updateNextJackpot = Utils.randomRangeInt(3, 10);

                    let scale = 1000;
                    this.jackpot += Utils.randomRangeInt(5 * scale, 7 * scale);
                    if (this.jackpot > this.maxJackpot) {
                        this.jackpot = 5000 * scale;
                        this.maxJackpot = this.jackpot + Utils.randomRangeInt(2000 * scale, 4000 * scale);
                    }
                    Tween.numberTo(this.lblJackpot, this.jackpot, 1);
                    this.lblJackpot.string = Utils.formatNumber(this.jackpot);
                }
            }
        }
    }
}
