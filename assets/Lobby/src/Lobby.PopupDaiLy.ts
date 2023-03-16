// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import App from "../../scripts/common/App";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import Configs from "../../scripts/common/Configs";
import Dialog from "../../scripts/common/Dialog";
import Http from "../../scripts/common/Http";
import Utils from "../../scripts/common/Utils";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import InPacket from "../../scripts/networks/Network.InPacket";
import cmd from "./Lobby.Cmd";
import PopupOTP from "./Lobby.PopupOTP";

const {ccclass, property} = cc._decorator;

@ccclass("Lobby.PopupDaiLy.Transfer")
export class DaiLyTransfer {
    @property(cc.Node)
    panelContent: cc.Node = null;

    @property(cc.Label)
    lblBalance: cc.Label = null;
    @property(cc.Label)
    lblFee: cc.Label = null;
    @property(cc.Label)
    lblReceive: cc.Label = null;
    @property(cc.Label)
    lblDaiLy: cc.Label = null;
    @property(cc.Label)
    lblNote: cc.Label = null;
    @property(cc.EditBox)
    edbNickname: cc.EditBox = null;
    @property(cc.EditBox)
    edbReNickname: cc.EditBox = null;
    @property(cc.EditBox)
    edbCoinTransfer: cc.EditBox = null;
    @property(cc.EditBox)
    edbNote: cc.EditBox = null;

    @property(cc.EditBox)
    edbOTP: cc.EditBox = null;

    ratioTransfer = Configs.App.SERVER_CONFIG.ratioTransfer;

    start() {
        this.edbCoinTransfer.node.on("editing-did-ended", () => {
            let number = Utils.stringToInt(this.edbCoinTransfer.string);
            this.edbCoinTransfer.string = Utils.formatNumber(number);
            this.lblReceive.string = Utils.formatNumber(Math.round(this.ratioTransfer * number));
        });
        this.edbNickname.node.on("editing-did-ended", () => {
            let nickname = this.edbNickname.string.trim();
            if (nickname != "") {
                App.instance.showLoading(true);
                MiniGameNetworkClient.getInstance().send(new cmd.ReqCheckNicknameTransfer(nickname));
            }
        });
    }

    reset() {
        this.panelContent.active = true;
        this.lblDaiLy.node.active = false;
        this.lblFee.string = "0";
        this.lblBalance.string = Utils.formatNumber(Configs.Login.Coin);
        this.lblReceive.string = "0";
        this.edbNickname.string = "";
        this.edbReNickname.string = "";
        this.edbNote.string = "";
        this.edbCoinTransfer.string = "";
        this.lblNote.string = this.lblNote.string.replace("%s", Math.round((1 - this.ratioTransfer) * 100) + "%");
        this.lblFee.string = Math.round((1 - this.ratioTransfer) * 100) + "%";
    }

    continue() {
        let nickname = this.edbNickname.string.trim();
        let reNickname = this.edbReNickname.string.trim();
        let coin = Utils.stringToInt(this.edbCoinTransfer.string);
        let note = this.edbNote.string.trim();
        if (nickname == "") {
            App.instance.alertDialog.showMsg("Nickname không được để trống.");
            return;
        }
        if (nickname != reNickname) {
            App.instance.alertDialog.showMsg("Hai nickname không giống nhau.");
            return;
        }
        if (note == "") {
            App.instance.alertDialog.showMsg("Lý do chuyển khoản không được để trống.");
            return;
        }
        if (coin < 10000) {
            App.instance.alertDialog.showMsg("Số tiền giao dịch phải lớn hơn hoặc bằng 10.000.");
            return;
        }
        if (coin > Configs.Login.Coin) {
            App.instance.alertDialog.showMsg("Số dư không đủ.");
            return;
        }

        App.instance.confirmDialog.show2("Bạn có chắc chắn muốn chuyển cho\nTài khoản: \"" + nickname + "\" (Không phải Đ.Lý)\nSố tiền: " + this.edbCoinTransfer.string + "\nLý do: " + note, (isConfirm) => {
            if (isConfirm) {
                App.instance.showLoading(true);
                MiniGameNetworkClient.getInstance().send(new cmd.ReqTransferCoin(nickname, coin, note));
            }
        });
    }
}

@ccclass("Lobby.PopupDaiLy.DaiLy")
class DaiLyDaiLy {
    @property(cc.Node)
    node: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;

    start() {

    }

    reset() {
        for (let i = 0; i < this.itemTemplate.parent.childrenCount; i++) {
            this.itemTemplate.parent.children[i].active = false;
        }
        this.loadData();
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
                        PopupDaiLy.createAndShowTransfer(App.instance.popups, nickname);
                    });
                }
            }
        });
    }
}

@ccclass("Lobby.PopupDaiLy.GiftCode")
export class DaiLyGiftCode {
    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
}

@ccclass
export default class PopupDaiLy extends Dialog {

    private static tabSelectedIdx = 0;
    private static instance: PopupDaiLy;
    private static initing: boolean = false;

    private static createAndShow(parent: cc.Node, nickname: string = null) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupDaiLy", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupDaiLy);
                    this.instance.show(nickname);
                });
            } else {
                this.instance.show(nickname);
            }
        }
    }

    public static createAndShowTransfer(parent: cc.Node, nickname: string = null) {
        PopupDaiLy.tabSelectedIdx = 0; 
        this.createAndShow(parent, nickname);
    }

    public static createAndShowGiftCode(parent: cc.Node) {
        PopupDaiLy.tabSelectedIdx = 2; 
        this.createAndShow(parent);
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    @property(DaiLyTransfer)
    tabTransfer: DaiLyTransfer = null;
    @property(DaiLyGiftCode)
    tabGiftCode: DaiLyGiftCode = new DaiLyGiftCode();
    @property(DaiLyDaiLy)
    tabDaiLy: DaiLyDaiLy = null;
    @property([cc.Label])
    lblContainsBotOTPs: cc.Label[] = [];

    start() {
        for (let i = 0; i < this.lblContainsBotOTPs.length; i++) {
            let lbl = this.lblContainsBotOTPs[i];
            lbl.string = lbl.string.replace("$bot_otp", "@" + Configs.App.getLinkTelegram());
        }

        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("toggle", () => {
                PopupDaiLy.tabSelectedIdx = i;
                this.onTabChanged();
            });
        }

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {              
                case cmd.Code.CHECK_NICKNAME_TRANSFER: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResCheckNicknameTransfer(data);
                    // console.log(res);
                    if (res.error == 0) {
                        this.tabTransfer.edbNickname.string = this.tabTransfer.edbReNickname.string = "";
                        App.instance.alertDialog.showMsg("Tài khoản không tồn tại.");
                        break;
                    }
                    this.tabTransfer.lblDaiLy.node.active = res.type == 1 || res.type == 2;
                    this.tabTransfer.lblFee.string = res.fee + "%";
                    this.tabTransfer.ratioTransfer = (100 - res.fee) / 100;
                    break;
                }
                case cmd.Code.TRANSFER_COIN: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResTransferCoin(data);
                    // console.log(res);
                    switch (res.error) {
                        case 0:
                            PopupOTP.createAndShow(App.instance.popups);
                            break;
                        case 2:
                            App.instance.alertDialog.showMsg("Số tiền tối thiểu là 10.000.");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("Chức năng chỉ dành cho những tài khoản đăng ký bảo mật SMS PLUS.");
                            break;
                        case 4:
                            App.instance.alertDialog.showMsg("Số dư không đủ.");
                            break;
                        case 5:
                            App.instance.alertDialog.showMsg("Tài khoản bị cấm chuyển tiền.");
                            break;
                        case 6:
                            App.instance.alertDialog.showMsg("Nickname nhận không tồn tại.");
                            break;
                        case 10:
                            App.instance.alertDialog.showMsg("Chức năng bảo mật sẽ tự động kích hoạt sau 24h kể từ thời điểm đăng ký thành công!");
                            break;
                        case 11:
                            App.instance.alertDialog.showMsg("Bạn chỉ được chuyển cho Đại lý tổng trong khoảng tiền quy định!");
                            break;
                        case 22:
                            App.instance.alertDialog.showMsg("Tài khoản chưa đủ điều kiện để chuyển tiền.");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". vui lòng thử lại sau.");
                            break;
                    }
                    break;
                }
                case cmd.Code.RESULT_TRANSFER_COIN: {
                    if (!this.node.active) return;
                    App.instance.showLoading(false);
                    let res = new cmd.ResResultTransferCoin(data);
                    // console.log(res);
                    switch (res.error) {
                        case 0:
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            App.instance.alertDialog.showMsg("Giao dịch chuyển khoản thành công!");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". vui lòng thử lại sau.");
                            break;
                    }
                    this.tabTransfer.reset();
                    break;
                }
                case cmd.Code.RESULT_UPDATE_MONEY: {
                    let res = new cmd.ResUpdateMoney(data);
                    if(res.currentMoney > 0) {
                        Configs.Login.Coin = res.currentMoney;
                        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    }

                    if(res.code != 100) {
                        0 == res.code ? App.instance.alertDialog.showMsg("Nạp thẻ thành công!")
                        : 1 == res.code
                        ?App.instance.alertDialog.showMsg("Kết nối mạng không ổn định, vui lòng thử lại sau!")
                        : 30 == res.code
                        ?App.instance.alertDialog.showMsg("Hệ thống đã ghi nhận giao dịch, vui lòng chờ hệ thống xử lý!")
                        : 31 == res.code
                        ?App.instance.alertDialog.showMsg("Thẻ đã được sử dụng!")
                        : 32 == res.code
                        ?App.instance.alertDialog.showMsg("Thẻ đã bị khóa!")
                        : 33 == res.code
                        ?App.instance.alertDialog.showMsg("Thẻ chưa được kích hoạt!")
                        : 34 == res.code
                        ?App.instance.alertDialog.showMsg("Thẻ đã hết hạn sử dụng!")
                        : 35 == res.code
                        ?App.instance.alertDialog.showMsg("Mã thẻ không đúng!")
                        : 36 == res.code
                        ?App.instance.alertDialog.showMsg("Số serial không đúng!")
                        : 21 == res.code
                        ?App.instance.alertDialog.showMsg("Đã có sự cố xảy ra, vui lòng liên hệ admin để được giúp đỡ!")
                        : 22 == res.code
                        ?App.instance.alertDialog.showMsg("Thẻ sai hoặc đã được sử dụng!")
                        : 8 == res.code &&
                        App.instance.alertDialog.showMsg("Tài khoản đã bị khóa nạp thẻ do nạp sai quá nhiều lần!");
                    }
                    break;
                }
                case cmd.Code.INSERT_GIFTCODE: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResInsertGiftcode(data);
                    switch (res.error) {
                        case 0:
                            App.instance.alertDialog.showMsg("Mã Giftcode không chính xác. Vui lòng kiểm tra lại!");
                            break;
                        case 1:
                            App.instance.alertDialog.showMsg("Mã Giftcode đã được sử dụng.");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("Để nhận giftcode vui lòng xác thực số điện thoại.");
                            break;
                        case 4:
                        case 5:
                        case 6:
                            App.instance.alertDialog.showMsg("Giftcode đã nhập không hợp lệ.");
                            break;
                        case 2:
                            Configs.Login.Coin = res.currentMoneyVin;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            App.instance.alertDialog.showMsg("Nhận thưởng thành công.");
                            break;
                    }
                    break;
                }
            }
        }, this);

        this.tabTransfer.start();
        this.tabDaiLy.start();
    }

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = (i == PopupDaiLy.tabSelectedIdx);
            this.tabs.toggleItems[i].node.children[0].active = !(i == PopupDaiLy.tabSelectedIdx);
        }

        switch (PopupDaiLy.tabSelectedIdx) {
            case 0:
                this.tabTransfer.reset();
                break;
            case 1:
                this.tabDaiLy.reset();
                break;
        }
    }

    show(nickname: string = null) {
        super.show();
        
        this.tabs.toggleItems[PopupDaiLy.tabSelectedIdx].isChecked = true;
        this.onTabChanged();

        if (typeof nickname == "string") {
            this.tabTransfer.edbNickname.string = this.tabTransfer.edbReNickname.string = nickname;
            App.instance.showLoading(true);
            MiniGameNetworkClient.getInstance().send(new cmd.ReqCheckNicknameTransfer(nickname));
        }
    }

    actContinueTransfer() {
        this.tabTransfer.continue();
    }

    actSubmitTransfer() {
        let otp = this.tabTransfer.edbOTP.string.trim();
        if (otp.length == 0) {
            App.instance.alertDialog.showMsg("Mã xác thực không được bỏ trống.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqSendOTP(otp, 0));
    }

    actSubmitGiftCode() {
        let code = this.tabGiftCode.edbCode.string.trim();
        if (code == "") {
            App.instance.alertDialog.showMsg("Mã quà tặng không được để trống.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqInsertGiftcode(code));
    }
}