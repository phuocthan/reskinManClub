import Dialog from "../../../../scripts/common/Dialog";
import Configs from "../../../../scripts/common/Configs";
import Http from "../../../../scripts/common/Http";
import App from "../../../../scripts/common/App";
import Utils from "../../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

namespace taixiumini {
    @ccclass
    export class PopupJackpot extends Dialog {
        @property(cc.Node)
        itemTemplate: cc.Node = null;
        @property(cc.Node)
        overviewNode: cc.Node = null;
        @property(cc.Node)
        detailNode: cc.Node = null;
        @property(cc.Node)
        itemDetailTemplate: cc.Node = null;

        private items = new Array<cc.Node>();
        private itemsDetail = new Array<cc.Node>();
        private listOverview = [];
        private page = 1;

        show() {
            super.show();

            for (let i = 0; i < this.items.length; i++) {
                this.items[i].active = false;
            }
            if (this.itemTemplate != null) this.itemTemplate.active = false;
        }

        dismiss() {
            super.dismiss();
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].active = false;
            }
            this.node.destroy();
        }

        _onShowed() {
            super._onShowed();
            this.loadData();
        }

        goToNextPage() {
            cc.audioEngine.play(this.soundClickBtn, false, 1);
            this.page = this.page + 1;
            this.loadData();
        }

        goToPrevPage() {
            cc.audioEngine.play(this.soundClickBtn, false, 1);
            this.page = this.page - 1 > 1 ? this.page - 1 : 1;
            this.loadData();
        }

        showDetail(idx) {
            cc.audioEngine.play(this.soundClickBtn, false, 1);
            this.overviewNode.active = false;
            this.detailNode.active = true;

            if (this.itemsDetail.length == 0) {
                for (var i = 0; i < this.listOverview[idx]["dt"].length; i++) {
                    let item2 = cc.instantiate(this.itemDetailTemplate);
                    item2.parent = this.itemDetailTemplate.parent;
                    this.itemsDetail.push(item2);
                }
                this.itemDetailTemplate.destroy();
                this.itemDetailTemplate = null;
            }

            this.detailNode.getChildByName('lblDate').getComponent(cc.Label).string = this.listOverview[idx].t;
            
            this.listOverview[idx]["dt"].sort((a,b) => (a.pz > b.pz) ? -1 : ((b.pz > a.pz) ? 1 : 0));
            for (let i = 0; i < this.listOverview[idx]["dt"].length; i++) {
                let item = this.itemsDetail[i];
                if (i < this.listOverview[idx]["dt"].length) {
                    let itemData = this.listOverview[idx]["dt"][i];
                    item.getChildByName("bg").opacity = i % 2 == 0 ? 10 : 0;
                    item.getChildByName("lblRank").getComponent(cc.Label).string = (i + 1).toString();
                    item.getChildByName("lblAccount").getComponent(cc.Label).string = itemData["nn"];
                    item.getChildByName("lblPrize").getComponent(cc.Label).string = Utils.formatNumber(itemData["pz"]);
                    item.active = true;
                } else {
                    item.active = false;
                }
            }
        }

        backToOverview() {
            cc.audioEngine.play(this.soundClickBtn, false, 1);
            this.overviewNode.active = true;
            this.detailNode.active = false;
        }

        private loadData() {
            App.instance.showLoading(true);
            let _this = this;
            Http.get(Configs.App.API, { "c": 142, "p": _this.page }, (err, res) => {
                App.instance.showLoading(false);
                if (err != null) return;
                if (res["success"]) {
                    this.overviewNode.getChildByName('pageInfo').getChildByName('lblPage').getComponent(cc.Label).string = this.page + "/" + res["totalPages"];
                    this.overviewNode.active = true;
                    this.detailNode.active = false;
                    if (this.items.length == 0) {
                        for (var i = 0; i < 10; i++) {
                            let item = cc.instantiate(this.itemTemplate);
                            item.parent = this.itemTemplate.parent;
                            this.items.push(item);
                        }
                        this.itemTemplate.destroy();
                        this.itemTemplate = null;
                    }

                    this.listOverview = res["jackpotTX"] ? res["jackpotTX"] : [];

                    for (let i = 0; i < this.items.length; i++) {
                        let item = this.items[i];
                        if (i < res["jackpotTX"].length) {
                            let itemData = res["jackpotTX"][i];
                            item.getChildByName("bg").opacity = i % 2 == 0 ? 10 : 0;
                            item.getChildByName("lblTime").getComponent(cc.Label).string = itemData["t"];
                            item.getChildByName("lblPrize").getComponent(cc.Label).string = Utils.formatNumber(itemData["tp"]);
                            if(itemData["d"] == 1) {
                                item.getChildByName("lblDetail").getChildByName('Tai').active = true;
                                item.getChildByName("lblDetail").getChildByName('Xiu').active = false;
                            } else {
                                item.getChildByName("lblDetail").getChildByName('Tai').active = false;
                                item.getChildByName("lblDetail").getChildByName('Xiu').active = true;
                            }
                            // item.getChildByName("lblWin").getComponent(cc.Label).string = Utils.formatNumber(itemData["money"]);
                            item.active = true;

                            item.getChildByName("lblDetail").getChildByName('btnDetail').on("click", () => {
                                _this.showDetail(i);
                            });
                        } else {
                            item.active = false;
                        }
                    }
                }
            });
        }
    }

}

export default taixiumini.PopupJackpot;