import Dialog from "../../scripts/common/Dialog";
import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import Utils from "../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupTransaction extends Dialog {

    private static instance: PopupTransaction = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node, idx: number = 0) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupTransaction", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupTransaction);
                    this.instance.show(idx);
                });
            } else {
                this.instance.show(idx);
            }
        }
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Label)
    lblPage: cc.Label = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;

    private page: number = 1;
    private maxPage: number = 1;
    private items = new Array<cc.Node>();
    private tabSelectedIdx = 0;

    start() {
        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("click", () => {
                this.tabSelectedIdx = i;
                // this.updateTabsTitleColor();

                this.page = 1;
                this.loadData();
            });
        }
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

    show(idx = 0) {
        super.showRight(false, true);

        this.tabSelectedIdx = idx;
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;

        for (let i = 0; i < this.items.length; i++) {
            this.items[i].active = false;
        }
        if (this.itemTemplate != null) this.itemTemplate.active = false;
    }

    actNextPage() {
        if (this.page < this.maxPage) {
            this.page++;
            this.lblPage.string = this.page + "/" + this.maxPage;
            this.loadData();
        } else {
            App.instance.showToast(Configs.LANG.CANT_ACT);
        }
    }

    actPrevPage() {
        if (this.page > 1) {
            this.page--;
            this.lblPage.string = this.page + "/" + this.maxPage;
            this.loadData();
        } else {
            App.instance.showToast(Configs.LANG.CANT_ACT);
        }
    }

    private updateTabsTitleColor() {
        for (let j = 0; j < this.tabs.toggleItems.length; j++) {
            this.tabs.toggleItems[j].node.getComponentInChildren(cc.Label).node.color = j == this.tabSelectedIdx ? cc.Color.YELLOW : cc.Color.WHITE;
        }
    }

    private loadData() {
        App.instance.showLoading(true);
        let params = null;
        switch (this.tabSelectedIdx) {
            case 0:
                params = { "c": 302, "nn": Configs.Login.Nickname, "mt": Configs.App.MONEY_TYPE, "p": this.page };
                break;
            case 1:
                params = { "c": 302, "nn": Configs.Login.Nickname, "mt": 3, "p": this.page };
                break;
            case 2:
                params = { "c": 302, "nn": Configs.Login.Nickname, "mt": 5, "p": this.page };
                break;
        }
        
        Http.get(Configs.App.API, params, (err, res) => {
            App.instance.showLoading(false);
            if (err != null) return;
            if (res["success"]) {
                if(res["transactions"].length == 0) {
                    App.instance.showToast(Configs.LANG.ALERT_EMPTY);
                }

                if (this.items.length == 0) {
                    for (var i = 0; i < 10; i++) {
                        let item = cc.instantiate(this.itemTemplate);
                        item.parent = this.itemTemplate.parent;
                        this.items.push(item);
                    }
                    this.itemTemplate.destroy();
                    this.itemTemplate = null;
                }

                this.maxPage = res["totalPages"];
                this.lblPage.string = this.page + "/" + this.maxPage;
                for (let i = 0; i < this.items.length; i++) {
                    let item = this.items[i];
                    if (i < res["transactions"].length) {
                        let itemData = res["transactions"][i]; 

                        if(itemData["serviceName"].includes("Siêu Anh Hùng")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Siêu Anh Hùng", "Bigcity Boy");
                        }
                        if(itemData["serviceName"].includes("Tho Dan")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Tho Dan", "M.I.B Slots");
                        }
                        if(itemData["serviceName"].includes("Nữ điệp viên")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Nữ điệp viên", "Diablo");
                        }
                        if(itemData["serviceName"].includes("Nữ Điệp Viên")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Nữ Điệp Viên", "Diablo");
                        }
                        if(itemData["serviceName"].includes("Kho Báu")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Kho Báu", "Burning Race");
                        }
                        if(itemData["serviceName"].includes("Kim Cuong")) {
                            itemData["serviceName"] = itemData["serviceName"].replace("Kim Cuong", "Man Slots");
                        }

                        if(itemData["description"].includes("Siêu Anh Hùng")) {
                            itemData["description"] = itemData["description"].replace("Siêu Anh Hùng", "Bigcity Boy");
                        }
                        if(itemData["description"].includes("Tho Dan")) {
                            itemData["description"] = itemData["description"].replace("Tho Dan", "M.I.B Slots");
                        }
                        if(itemData["description"].includes("Nữ Điệp Viên")) {
                            itemData["description"] = itemData["description"].replace("Nữ Điệp Viên", "Diablo");
                        }
                        if(itemData["description"].includes("Kho Báu")) {
                            itemData["description"] = itemData["description"].replace("Kho Báu", "Burning Race");
                        }
                        if(itemData["description"].includes("Kim Cuong")) {
                            itemData["description"] = itemData["description"].replace("Kim Cuong", "Man Slots");
                        }

                        item.getChildByName("bg").opacity = i % 2 == 0 ? 10 : 0;
                        // item.getChildByName("Trans").getComponent(cc.Label).string = itemData["transId"];
                        item.getChildByName("Time").getComponent(cc.Label).string = itemData["transactionTime"];
                        item.getChildByName("Service").getComponent(cc.Label).string = itemData["serviceName"];
                        item.getChildByName("Coin").getComponent(cc.Label).string = (itemData["moneyExchange"] > 0 ? "+" : "") + Utils.formatNumber(itemData["moneyExchange"]);
                        item.getChildByName("Balance").getComponent(cc.Label).string = Utils.formatNumber(itemData["currentMoney"]);
                        item.getChildByName("Desc").getComponent(cc.Label).string = itemData["description"];
                        item.active = true;
                    } else {
                        item.active = false;
                    }
                }
            }
        });
    }
}
