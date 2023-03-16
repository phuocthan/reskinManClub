import Dialog from "../../scripts/common/Dialog";
import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import PopupShop from "./Lobby.PopupShop";
import InPacket from "../../scripts/networks/Network.InPacket";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import cmd from "./Lobby.Cmd";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import PopupOTP from "./Lobby.PopupOTP";
import PopupCardInfo from "./Lobby.PopupCardInfo";

const { ccclass, property } = cc._decorator;

@ccclass("PopupMailBox.TabMailBox")
class TabMailBox {
    @property(cc.Node)
    node: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;
    @property(cc.Label)
    lblContent: cc.Label = null;
    @property(cc.Label)
    lblEmpty: cc.Label = null;
    @property(cc.Label)
    lblPage: cc.Label = null;
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;

    private lastData: any[] = null;
    private page: number = 1;
    private maxPage: number = 1;

    start() {

    }

    reset() {
        for (let i = 0; i < this.itemTemplate.parent.childrenCount; i++) {
            this.itemTemplate.parent.children[i].active = false;
        }
        this.page = 1;
        this.maxPage = 1;
        this.lblPage.string = this.page + "/" + this.maxPage;
        this.loadData();
    }

    private getItem(): cc.Node {
        let item: cc.Node = null;
        for (let i = 0; i < this.itemTemplate.parent.childrenCount; i++) {
            let node = this.itemTemplate.parent.children[i];
            if (node != this.itemTemplate && !node.active) {
                item = node;
                break;
            }
        }
        if (item == null) {
            item = cc.instantiate(this.itemTemplate);
            item.parent = this.itemTemplate.parent;
        }
        item.active = true;
        item.setSiblingIndex(item.parent.childrenCount - 1);
        return item;
    }

    private loadData() {
        App.instance.showLoading(true);
        this.lblEmpty.string = "loading...";
        this.lblContent.string = "";
        //c=405&nn=" + a + "&p=" + b + "&at=" + c
        Http.get(Configs.App.API, { "c": 405, "nn": Configs.Login.Nickname, "p": this.page }, (err, res) => {
            App.instance.showLoading(false);
            for (let i = 0; i < this.itemTemplate.parent.childrenCount; i++) {
                this.itemTemplate.parent.children[i].active = false;
            }

            if (err != null) return;
            if (res["success"]) {
                this.lblEmpty.string = "";
                this.maxPage = Number(res["totalPages"]);
                this.lblPage.string = this.page + "/" + this.maxPage;

                this.lastData = res["transactions"];
                for (let i = 0; i < this.lastData.length; i++) {
                    let itemData = this.lastData[i];
                    let item = this.getItem();
                    item.getChildByName("selected").active = false;
                    item.getChildByName("title").getComponent(cc.Label).string = itemData["title"];
                    item.getChildByName("time").getComponent(cc.Label).string = itemData["createTime"];
                    item.getChildByName("notread").active = itemData["status"] == 0;
                    item.off("click");
                    item.on("click", () => {
                        cc.audioEngine.play(this.soundClickBtn, false, 1);
                        this.selectItem(i);
                    });
                }
                // if (this.lastData.length > 0) {
                //     this.lblTitle.string = this.lastData[0]["title"];
                //     this.lblContent.string = this.lastData[0]["content"];
                // }
            } else {
                this.lblEmpty.string = "Không có thư.";
            }
        });
    }

    private readMail(mailId: string) {
        Http.get(Configs.App.API, { "c": 404, "mid": mailId }, (err, res) => {
            if (err != null) return;
            Configs.Login.MailCount -= 1;
            BroadcastReceiver.send(BroadcastReceiver.UPDATE_MAIL_COUNT);
        });
    }

    private selectItem(idx: number) {
        if (this.lastData == null) return;
        for (let i = 0; i < this.lastData.length; i++) {
            this.itemTemplate.parent.children[i + 1].getChildByName("selected").active = i == idx;
            if (i == idx) {
                this.itemTemplate.parent.children[i + 1].getChildByName("notread").active = false;
            }
        }
        let mail = this.lastData[idx];
        this.lblContent.string = mail["content"];
        if (mail["status"] == 0) {
            mail["status"] = 1;
            this.readMail(mail["mail_id"]);

        }
    }

    public nextPage() {
        if (this.page < this.maxPage) {
            this.page++;
            this.loadData();
        }
    }

    public prevPage() {
        if (this.page > 1) {
            this.page--;
            this.loadData();
        }
    }
}

@ccclass("PopupMailBox.TabNews")
class TabNews {
    @property(cc.Node)
    node: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;
    @property(cc.Label)
    lblTitle: cc.Label = null;
    @property(cc.Label)
    lblContent: cc.Label = null;

    start() {

    }

    reset() {

    }

    private getItem(): cc.Node {
        let item = null;
        for (let i = 0; i < this.itemTemplate.parent.childrenCount; i++) {
            let node = this.itemTemplate.parent.children[i];
            if (node != this.itemTemplate && !node.active) {
                item = node;
                break;
            }
        }
        if (item == null) {
            item = cc.instantiate(this.itemTemplate);
            item.parent = this.itemTemplate.parent;
        }
        item.active = true;
        return item;
    }

    private loadData() {
        App.instance.showLoading(true);
        Http.get(Configs.App.API, { "c": 401 }, (err, res) => {
            App.instance.showLoading(false);
            if (err != null) return;
            if (res["success"]) {
                for (let i = 0; i < res["transactions"].length; i++) {
                    let itemData = res["transactions"][i];
                    let nickname = itemData["nickName"];
                    let item = this.getItem();
                    item.getChildByName("bg").opacity = i % 2 == 0 ? 10 : 0;
                    item.getChildByName("No.").getComponent(cc.Label).string = (i + 1).toString();
                    item.getChildByName("Fullname").getComponent(cc.Label).string = itemData["fullName"];
                    item.getChildByName("Nickname").getComponent(cc.Label).string = nickname;
                    item.getChildByName("Phone").getComponent(cc.Label).string = itemData["mobile"];
                    item.getChildByName("Phone").color = cc.Color.WHITE;
                    item.getChildByName("Phone").off("click");
                    if (itemData["mobile"] && itemData["mobile"].trim().length > 0 && itemData["mobile"].trim()[0] != "0") {
                        item.getChildByName("Phone").color = cc.Color.CYAN;
                        item.getChildByName("Phone").on("click", () => {
                            App.instance.openTelegram(itemData["mobile"]);
                        });
                    }
                    item.getChildByName("Address").getComponent(cc.Label).string = itemData["address"];
                    item.getChildByName("BtnFacebook").off("click");
                    item.getChildByName("BtnFacebook").on("click", () => {
                        cc.sys.openURL(itemData["facebook"]);
                    });
                    item.getChildByName("BtnTransfer").off("click");
                    item.getChildByName("BtnTransfer").on("click", () => {
                        PopupShop.createAndShowTransfer(App.instance.popups, nickname);
                    });
                }
            }
        });
    }
}

@ccclass
export default class PopupMailBox extends Dialog {

    private static instance: PopupMailBox = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupMailBox", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupMailBox);
                    this.instance.show();
                });
            } else {
                this.instance.show();
            }
        }
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    @property(TabMailBox)
    tabMailBox: TabMailBox = new TabMailBox();
    @property(TabNews)
    tabNews: TabNews = new TabNews();

    private tabSelectedIdx = 0;

    start() {
        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("click", () => {
                this.tabSelectedIdx = i;
                this.onTabChanged();
            });
        }

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {
                case cmd.Code.BUY_CARD:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ResBuyCard(data);
                        switch (res.error) {
                            case 0:
                                PopupOTP.createAndShow(App.instance.popups);
                                break;
                            case 1:
                                App.instance.alertDialog.showMsg("Mất kết nối đến server!");
                                break;
                            case 2:
                                App.instance.alertDialog.showMsg("Tài khoản hiện đang bị cấm đổi thưởng!");
                                break;
                            case 3:
                                App.instance.alertDialog.showMsg("Tài khoản không đủ số dư khả dụng!");
                                break;
                            case 9:
                                App.instance.alertDialog.showMsg("Để thực hiện chức năng đổi thẻ, tài khoản cần đăng ký bảo mật! Bạn có muốn đăng ký bảo mật luôn không?");
                                break;
                            case 10:
                                App.instance.alertDialog.showMsg("Chức năng này sẽ hoạt động sau 24h kích hoạt bảo mật thành công!");
                                break;
                            case 20:
                                App.instance.alertDialog.showMsg("Mức đổi vượt quá hạn mức trong ngày của tài khoản. Vui lòng đợi đến hôm sau để thực hiện lại giao dịch!");
                                break;
                            case 21:
                                App.instance.alertDialog.showMsg("Không thể đổi quá hạn mức trong ngày của hệ thống. Vui lòng đợi đến hôm sau để thực hiện lại giao dịch!");
                                break;
                            default:
                                App.instance.alertDialog.showMsg("Lỗi " + res.error + ". vui lòng thử lại sau.");
                                break;
                        }
                    }
                    break;
                case cmd.Code.BUY_CARD_RESULT:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ResBuyCardResult(data);
                        switch (res.error) {
                            case 0:
                                Configs.Login.Coin = res.currentMoney;
                                BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                                let resJson = JSON.parse(res.softpin)[0];
                                let telco = resJson["provider"];
                                let amount = resJson["amount"];
                                let code = resJson["pin"];
                                let serial = resJson["serial"];
                                PopupCardInfo.createAndShow(App.instance.popups, telco, amount, code, serial);
                                break;
                            case 1:
                                App.instance.alertDialog.showMsg("Kết nối mạng không ổn định. Vui lòng thử lại sau!");
                                break;
                            case 2:
                                App.instance.alertDialog.showMsg("Tài khoản hiện đang bị cấm đổi thưởng!");
                                break;
                            case 3:
                                App.instance.alertDialog.showMsg("Tài khoản không đủ số dư khả dụng!");
                                break;
                            case 9:
                                App.instance.alertDialog.showMsg("Để thực hiện chức năng đổi thẻ, tài khoản cần đăng ký bảo mật! Bạn có muốn đăng ký bảo mật luôn không?");
                                break;
                            case 10:
                                App.instance.alertDialog.showMsg("Chức năng này sẽ hoạt động sau 24h kích hoạt bảo mật thành công!");
                                break;
                            case 20:
                                App.instance.alertDialog.showMsg("Mức đổi vượt quá hạn mức trong ngày của tài khoản. Vui lòng đợi đến hôm sau để thực hiện lại giao dịch!");
                                break;
                            case 21:
                                App.instance.alertDialog.showMsg("Không thể đổi quá hạn mức trong ngày của hệ thống. Vui lòng đợi đến hôm sau để thực hiện lại giao dịch!");
                                break;
                            case 22:
                                App.instance.alertDialog.showMsg("Số lượng thẻ đổi đã quá hạn mức. Bạn vui lòng quay trở lại sau!");
                                break;
                            case 30:
                                App.instance.alertDialog.showMsg("Giao dịch đang chờ xử lý!");
                                break;
                            default:
                                App.instance.alertDialog.showMsg("Lỗi " + res.error + ". vui lòng thử lại sau.");
                                break;
                        }
                    }
                    break;
            }
        }, this);

        this.tabMailBox.start();
        this.tabNews.start();
    }

    show(idx = 0) {
        super.show();

        this.tabSelectedIdx = idx;
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
    }

    // hna add
    public static hidePopup() {
        if(this.instance) {
            this.instance.hide();
        }
    }
    hide() {
        super.dismiss();
    }
    // end

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = i == this.tabSelectedIdx;
        }
        for (let j = 0; j < this.tabs.toggleItems.length; j++) {
            this.tabs.toggleItems[j].node.getComponentInChildren(cc.Label).node.color = j == this.tabSelectedIdx ? cc.Color.YELLOW : cc.Color.WHITE;
        }
        switch (this.tabSelectedIdx) {
            case 0:
                this.tabMailBox.reset();
                break;
            case 1:
                this.tabNews.reset();
                break;
        }
    }

    public mailBoxNextPage() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.tabMailBox.nextPage();
    }

    public mailBoxPrevPage() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.tabMailBox.prevPage();
    }
}
