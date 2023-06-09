import Dialog from "../../../scripts/common/Dialog";
import App from "../../../scripts/common/App";
import ShootFishNetworkClient from "../../../scripts/networks/ShootFishNetworkClient";
import Configs from "../../../scripts/common/Configs";
import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupHistory extends Dialog {
    @property(cc.Label)
    lblPage: cc.Label = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;

    private page: number = 1;
    private maxPage: number = 1;
    private items = new Array<cc.Node>();

    private data: any = null;

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
    }

    _onShowed() {
        super._onShowed();
        this.page = 1;
        this.maxPage = 1;
        this.lblPage.string = this.page + "/" + this.maxPage;
        this.loadData();
    }

    actNextPage() {
        if (this.page < this.maxPage) {
            this.page++;
            this.lblPage.string = this.page + "/" + this.maxPage;
            this.loadDataLocal();
        }
    }

    actPrevPage() {
        if (this.page > 1) {
            this.page--;
            this.lblPage.string = this.page + "/" + this.maxPage;
            this.loadDataLocal();
        }
    }

    private loadData() {
        App.instance.showLoading(true);
        ShootFishNetworkClient.getInstance().request("OTT3", {
            "userId": Configs.Login.UserIdFish
        }, (res) => {
            console.log(res);
            App.instance.showLoading(false);
            if (res["code"] != 200) return;

            if (this.items.length == 0) {
                for (var i = 0; i < 10; i++) {
                    let item = cc.instantiate(this.itemTemplate);
                    item.parent = this.itemTemplate.parent;
                    this.items.push(item);
                }
                this.itemTemplate.destroy();
                this.itemTemplate = null;
            }

            this.data = res["data"];
            this.maxPage = Math.ceil(this.data.length / 10);
            this.page = 1;
            this.loadDataLocal();
        }, this);
    }

    private loadDataLocal() {
        if (this.data == null) return;
        this.lblPage.string = this.page + "/" + this.maxPage;
        let startIdx = (this.page - 1) * 10;
        let count = 10;
        if (startIdx + count > this.data.length) count = this.data.length - startIdx;
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            if (i < count) {
                let itemData = this.data[startIdx + i];
                item.getChildByName("bg").opacity = i % 2 == 0 ? 10 : 0;
                item.getChildByName("Session").getComponent(cc.Label).string = itemData["Id"];
                item.getChildByName("Time").getComponent(cc.Label).string = itemData["GameTime"];
                if (itemData["Nickname1"] == Configs.Login.Nickname) {
                    item.getChildByName("Choice").getComponent(cc.Label).string = this.getChoiceName(itemData["Choice1"]);
                    item.getChildByName("OtherPlayer").getComponent(cc.Label).string = itemData["Nickname2"];
                    let result = "Hoà";
                    if (itemData["Result"] == 1) {
                        item.getChildByName("Receive").getComponent(cc.Label).string = "+" + Utils.formatNumber(itemData["CashChange1"]);
                        result = "Thắng"
                    } else if (itemData["Result"] == 2) {
                        item.getChildByName("Receive").getComponent(cc.Label).string = Utils.formatNumber(-itemData["Blind"]);
                        result = "Thua"
                    } else {
                        item.getChildByName("Receive").getComponent(cc.Label).string = "+" + Utils.formatNumber(itemData["Blind"]);
                    }
                    item.getChildByName("Result").getComponent(cc.Label).string = result;
                } else {
                    item.getChildByName("Choice").getComponent(cc.Label).string = this.getChoiceName(itemData["Choice2"]);
                    item.getChildByName("OtherPlayer").getComponent(cc.Label).string = itemData["Nickname1"];
                    let result = "Hoà";
                    if (itemData["Result"] == 2) {
                        item.getChildByName("Receive").getComponent(cc.Label).string = "+" + Utils.formatNumber(itemData["CashChange2"]);
                        result = "Thắng"
                    } else if (itemData["Result"] == 1) {
                        item.getChildByName("Receive").getComponent(cc.Label).string = Utils.formatNumber(-itemData["Blind"]);
                        result = "Thua"
                    } else {
                        item.getChildByName("Receive").getComponent(cc.Label).string = "+" + Utils.formatNumber(itemData["Blind"]);
                    }
                    item.getChildByName("Result").getComponent(cc.Label).string = result;
                }
                item.getChildByName("Bet").getComponent(cc.Label).string = Utils.formatNumber(itemData["Blind"]);
                item.active = true;
            } else {
                item.active = false;
            }
        }
    }

    //selectValue: 0: kéo, 1: bao, 2: búa
    private getChoiceName(choice: number) {
        switch (choice) {
            case 0:
                return "Kéo";
            case 1:
                return "Bao";
            case 2:
                return "Búa";
        }
    }
}
