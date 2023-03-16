import Dialog from "../../scripts/common/Dialog";
import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import PopupShop from "./Lobby.PopupShop";
import Dropdown from "../../scripts/customui/CustomUI.Dropdown";
import InPacket from "../../scripts/networks/Network.InPacket";
import Utils from "../../scripts/common/Utils";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import cmd from "./Lobby.Cmd";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import PopupOTP from "./Lobby.PopupOTP";
import PopupCardInfo from "./Lobby.PopupCardInfo";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const { ccclass, property } = cc._decorator;

@ccclass("PopupCashout.TabDaiLy")
class TabDaiLy {
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
                        PopupShop.createAndShowTransfer(App.instance.popups, nickname);
                    });
                }
            }
        });
    }
}

@ccclass("PopupCashout.TabBank")
class TabBank {
    @property(cc.Node)
    node: cc.Node = null;
    @property(Dropdown)
    dropdownBank: Dropdown = null;
    @property(cc.EditBox)
    edbAccountName: cc.EditBox = null;
    @property(cc.EditBox)
    edbAccountNumber: cc.EditBox = null;
    @property(Dropdown)
    dropdownCoin: Dropdown = null;

    @property(cc.Node)
    listFactor: cc.Node = null;

    listBanks = [];

    factors = [];

    start() {
        this.factors = Configs.App.SERVER_CONFIG.listMenhGiaRutBank;

        let coinOptions = ["MỆNH GIÁ"];
        for (let i = 0; i < this.factors.length; i++) {
            coinOptions.push(Utils.formatNumber(this.factors[i]));
        }
        this.dropdownCoin.setOptions(coinOptions);

        let itemTemplate = this.listFactor.children[0];
        itemTemplate.active = false;
        for (let i = 0; i < this.factors.length; i++) {
            let value = parseInt("" + (this.factors[i] * Configs.App.SERVER_CONFIG.ratioRutNH));
            let item = cc.instantiate(itemTemplate);
            item.parent = this.listFactor;
            item.getChildByName("Amount").getComponent(cc.Label).string = Utils.formatNumber(this.factors[i]);
            item.getChildByName("Value").getComponent(cc.Label).string = Utils.formatNumber(value);
            item.active = true;
        }
    }

    reloadInfo() {
        let bankOptions = ["CHỌN NGÂN HÀNG"];
        for (let i = 0; i < this.listBanks.length; i++) {
            bankOptions.push(this.listBanks[i].bankName);
        }
        this.dropdownBank.setOptions(bankOptions);
        this.dropdownBank.setValue(0);
    }

    reset() {
        if (this.listBanks.length == 0) {
            Http.get(Configs.App.GATEWAY_URL + "/api/v1/cashout/available-bank", {}, (err, json) => {
                if (err == null) {
                    if (json["code"] == 0) {
                        this.listBanks = json["data"];
                        this.reloadInfo();
                    }
                }
            });
        } else {
            this.reloadInfo();
        }

        this.edbAccountName.string = "";
        this.edbAccountNumber.string = "";
        this.dropdownCoin.setValue(0);
    }

    submit() {
        let ddBankValue = this.dropdownBank.getValue();
        let accountName = this.edbAccountName.string.trim();
        let accountNumber = this.edbAccountNumber.string.trim();
        let ddCoinValue = this.dropdownCoin.getValue();

        if (ddBankValue == 0) {
            App.instance.showToast("Vui lòng chọn ngân hàng.");
            return;
        }
        if (accountName.length == 0) {
            App.instance.showToast("Tên tài khoản không được để trống.");
            return;
        }
        if (accountNumber.length == 0) {
            App.instance.showToast("Số tài khoản không được để trống.");
            return;
        }
        if (ddCoinValue == 0) {
            App.instance.showToast("Vui lòng chọn mệnh giá");
            return;
        }
        App.instance.confirmDialog.show2("Tất cả các thông tin bạn điền là chính xác?", (isConfirm) => {
            if (isConfirm) {
                App.instance.showLoading(true);
                Http.get(Configs.App.PAY_URL + "/bank/buy", {
                    "acc_name": accountName,
                    "acc_no": accountNumber,
                    "bank_code": this.listBanks[ddBankValue - 1].code,
                    "value": this.factors[ddCoinValue - 1]
                }, (err, json) => {
                    App.instance.showLoading(false);
                    if (err != null) {
                        App.instance.alertDialog.showMsg("Thao tác không thành công, vui lòng thử lại sau.");
                        return;
                    }

                    if(json.hasOwnProperty("message")) {
                        App.instance.alertDialog.showMsg(json["message"]);
                    } else {
                        App.instance.alertDialog.showMsg(json["Giao dịch thất bại, vui lòng liên hệ quản trị viên để được giúp đỡ!"]);
                    }

                    // switch (json["code"]) {
                    //     case 0:
                    //         App.instance.alertDialog.showMsg("Hệ thống đã tiếp nhận và xử lý.");
                    //         Configs.Login.Coin = json["currentMoney"];
                    //         BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    //         break;
                    //     case 400:
                    //         App.instance.alertDialog.showMsg("Dữ liệu gửi lên không hợp lệ.");
                    //         break;
                    //     case -11:
                    //         App.instance.alertDialog.showMsg("Mệnh giá gửi lên không hợp lệ.");
                    //         break;
                    //     case -10:
                    //         App.instance.alertDialog.showMsg("Số dư không đủ.");
                    //         break;
                    //     case -99:
                    //         App.instance.alertDialog.showMsg("Tài khoản của bạn không được mở tính năng này, liên hệ cskh để được hỗ trợ.");
                    //         break;
                    //     default:
                    //         App.instance.alertDialog.showMsg("Thao tác không thành công, vui lòng thử lại sau.");
                    //         break;
                    // }
                }, {
                    "Nickname": Configs.Login.Nickname,
                    "Authorization": Configs.Login.AccessToken
                });
            }
        });
    }
}

@ccclass("PopupCashout.TabCard")
class TabCard {
    @property(cc.Node)
    node: cc.Node = null;
    @property(Dropdown)
    dropdownTelco: Dropdown = null;
    @property(Dropdown)
    dropdownAmount: Dropdown = null;

    @property(cc.Node)
    listFactor: cc.Node = null;

    @property(cc.Toggle)
    toggleVettel: cc.Toggle = null;
    
    @property(cc.Toggle)
    toggleMobi: cc.Toggle = null;

    @property(cc.Toggle)
    toggleVina: cc.Toggle = null;

    private readonly startIdxAmount = 0;

    start() {
        let telcoValues = ["CHỌN NHÀ MẠNG"];
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listTenNhaMang.length; i++) {
            telcoValues.push(Configs.App.SERVER_CONFIG.listTenNhaMang[i]);
        }
        this.dropdownTelco.setOptions(telcoValues);
        this.dropdownTelco.setOnValueChange((idx) => {
            this.dropdownAmount.setValue(0);
        });
        this.dropdownTelco.setValue(0);

        let amountValues = ["CHỌN MỆNH GIÁ"];
        for (let i = this.startIdxAmount; i < Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe.length; i++) {
            amountValues.push(Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaMuaThe[Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe[i]]));
        }
        this.dropdownAmount.setOptions(amountValues);
        this.dropdownAmount.setValue(0);

        let itemTemplate = this.listFactor.children[0];
        itemTemplate.active = false;
        for (let i = this.startIdxAmount; i < Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe.length; i++) {
            let value = parseInt("" + (Configs.App.SERVER_CONFIG.listMenhGiaMuaThe[Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe[i]] * Configs.App.SERVER_CONFIG.ratioMuaThe));
            let item = cc.instantiate(itemTemplate);
            item.parent = this.listFactor;
            item.getChildByName("Amount").getComponent(cc.Label).string = Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaMuaThe[Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe[i]]);
            item.getChildByName("Value").getComponent(cc.Label).string = Utils.formatNumber(value);
            item.active = true;
        }

        if(Configs.App.SERVER_CONFIG.listRutTelco) {
            this.toggleVettel.node.active = false;
            this.toggleVina.node.active = false;
            this.toggleMobi.node.active = false;
            if(Configs.App.SERVER_CONFIG.listRutTelco.length > 0) {
                let arrNode = [this.toggleVettel, this.toggleVina, this.toggleMobi];
                for(let i = 0; i < Configs.App.SERVER_CONFIG.listRutTelco.length; i++) {
                    arrNode[Configs.App.SERVER_CONFIG.listRutTelco[i]].node.active = true;
                }
            }
        }
    }

    reset() {
        this.dropdownTelco.setValue(0);
        this.dropdownAmount.setValue(0);
    }

    submit() {
        if (this.getTelco() < 0) {
            App.instance.showToast("Vui lòng chọn nhà mạng.");
            return;
        }

        if (this.dropdownAmount.getValue() == 0) {
            App.instance.showToast("Vui lòng chọn mệnh giá.");
            return;
        }

        let ddTelcoValue = this.getTelco();
        let ddAmountValue = Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe[this.dropdownAmount.getValue()-1];
        
        App.instance.showLoading(true, 60);

        // MiniGameNetworkClient.getInstance().send(new cmd.ReqBuyCard(
        //     Configs.App.SERVER_CONFIG.listIdNhaMang[ddTelcoValue - 1],
        //     Configs.App.SERVER_CONFIG.listIdMenhGiaMuaThe[ddAmountValue - 1 + this.startIdxAmount],
        //     1)
        // );

        Http.get(Configs.App.PAY_URL + "/card/buy", {
            "tc": ddTelcoValue,
            "v": ddAmountValue
        }, (err, json) => {
            App.instance.showLoading(false);
            if (err != null) {
                App.instance.alertDialog.showMsg("Thao tác không thành công, vui lòng thử lại sau.");
                return;
            }

            if(json.hasOwnProperty("message")) {
                App.instance.alertDialog.showMsg(json["message"]);
            } else {
                App.instance.alertDialog.showMsg("Giao dịch thất bại, vui lòng liên hệ quản trị viên để được giúp đỡ!");
            }
        }, {
            "Nickname": Configs.Login.Nickname,
            "Authorization": Configs.Login.AccessToken
        });
    }

    getTelco(): number {
        if(this.toggleVettel.isChecked)
            return 0;

        if(this.toggleVina.isChecked)
            return 1;

        if(this.toggleMobi.isChecked)
            return 2;

        return -1;
    }
}

@ccclass("PopupCashout.TabViDienTu")
class TabViDienTu {
    @property(cc.Node)
    node: cc.Node = null;

    @property(cc.EditBox)
    edbPhone: cc.EditBox = null;
    @property(cc.EditBox)
    edbName: cc.EditBox = null;
    @property(Dropdown)
    dropdownAmount: Dropdown = null;
    @property(cc.Button)
    btnSubmit: cc.Button = null;

    @property(cc.Node)
    listFactor: cc.Node = null;

    private factors = [];

    start() {
        this.factors = Configs.App.SERVER_CONFIG.listMenhGiaRutMomo;

        let options = ["MỆNH GIÁ"];
        for (let i = 0; i < this.factors.length; i++) {
            options.push(Utils.formatNumber(this.factors[i]));
        }
        this.dropdownAmount.setOptions(options);
        this.dropdownAmount.setValue(0);

        let itemTemplate = this.listFactor.children[0];
        itemTemplate.active = false;
        for (let i = 0; i < this.factors.length; i++) {
            let value = parseInt("" + (this.factors[i] * Configs.App.SERVER_CONFIG.ratioRutMomo));
            let item = cc.instantiate(itemTemplate);
            item.parent = this.listFactor;
            item.getChildByName("Amount").getComponent(cc.Label).string = Utils.formatNumber(this.factors[i]);
            item.getChildByName("Value").getComponent(cc.Label).string = Utils.formatNumber(value);
            item.active = true;
        }
        this.btnSubmit.node.on("click", () => {
            this.submit();
        });
    }

    reset() {
        this.edbPhone.string = "";
        this.edbName.string = "";
        this.dropdownAmount.setValue(0);
    }

    private submit() {
        let ddAmountValue = this.dropdownAmount.getValue();
        let accountName = this.edbName.string.trim();
        let accountPhone = this.edbPhone.string.trim();

        if (ddAmountValue == 0) {
            App.instance.showToast("Vui lòng chọn mệnh giá.");
            return;
        }
        if (accountName.length == 0) {
            App.instance.showToast("Tên tài khoản không được để trống.");
            return;
        }
        if (accountPhone.length == 0) {
            App.instance.showToast("Số điện thoại không được để trống.");
            return;
        }
        let coin = this.factors[ddAmountValue - 1];
        App.instance.confirmDialog.show2("Tất cả các thông tin bạn điền là chính xác?", (isConfirm) => {
            if (isConfirm) {
                App.instance.showLoading(true);
                Http.get(Configs.App.PAY_URL + "/mm/buy", {
                    "n": accountName,
                    "p": accountPhone,
                    "v": coin
                }, (err, json) => {
                    App.instance.showLoading(false);
                    if (err != null) {
                        App.instance.alertDialog.showMsg("Thao tác không thành công, vui lòng thử lại sau.");
                        return;
                    }

                    if(json.hasOwnProperty("message")) {
                        App.instance.alertDialog.showMsg(json["message"]);
                    } else {
                        App.instance.alertDialog.showMsg(json["Giao dịch thất bại, vui lòng liên hệ quản trị viên để được giúp đỡ!"]);
                    }

                    // switch (json["code"]) {
                    //     case 0:
                    //         App.instance.alertDialog.showMsg("Hệ thống đã tiếp nhận và xử lý.");
                    //         Configs.Login.Coin = json["currentMoney"];
                    //         BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    //         break;
                    //     case 1:
                    //         App.instance.alertDialog.showMsg("Giao dịch thất bại");
                    //         break;
                    //     case 2:
                    //         App.instance.alertDialog.showMsg("Error: 2. Giao dịch thất bại");
                    //         break;
                    //     case 400:
                    //         App.instance.alertDialog.showMsg("Dữ liệu gửi lên không hợp lệ.");
                    //         break;
                    //     case -10:
                    //         App.instance.alertDialog.showMsg("Số dư không đủ.");
                    //         break;
                    //     case -11:
                    //         App.instance.alertDialog.showMsg("Mệnh giá gửi lên không hợp lệ.");
                    //         break;
                    //     case -12:
                    //         App.instance.alertDialog.showMsg("Quá số lần giao dịch trong ngày.");
                    //         break;
                    //     case -99:
                    //         App.instance.alertDialog.showMsg("Tài khoản của bạn không được mở tính năng này, liên hệ cskh để được hỗ trợ.");
                    //         break;
                    //     default:
                    //         App.instance.alertDialog.showMsg("Thao tác không thành công, vui lòng thử lại sau.");
                    //         break;
                    // }
                }, {
                    "Nickname": Configs.Login.Nickname,
                    "Authorization": Configs.Login.AccessToken
                });
            }
        });
    }
}

@ccclass("PopupCashout.TabBitCoin")
class TabBitCoin {
    @property(cc.Node)
    node: cc.Node = null;

    start() {
    }

    reset() {
    }

    submit() {

    }
}

@ccclass("PopupCashout.TabIPay")
class TabIPay {
    @property(cc.Node)
    node: cc.Node = null;
    @property(cc.Button)
    icon: cc.Button = null;

    start() {
        this.icon.node.on("click", ()=>{
            cc.sys.openURL(Configs.App.PAY_URL);
        })
    }

    reset() {
    }

    submit() {

    }
}

@ccclass
export default class PopupCashOut extends Dialog {
    private static instance: PopupCashOut = null;
    private static initing: boolean = false;
    
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            // if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupCashOut", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    this.instance = go.getComponent(PopupCashOut);
                    if(parent) {
                        go.parent = parent;
                        this.instance.show();
                    }
                });
            // } else {
            //     if(parent) {
            //         this.instance.node.parent = parent; 
            //         this.instance.show();
            //     }
            // }
        }
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    @property(TabDaiLy)
    tabDaiLy: TabDaiLy = new TabDaiLy();
    @property(TabBank)
    tabBank: TabBank = new TabBank();
    @property(TabCard)
    tabCard: TabCard = new TabCard();
    @property(TabViDienTu)
    tabViDienTu: TabViDienTu = new TabViDienTu();
    @property(TabBitCoin)
    tabBitCoin: TabBitCoin = new TabBitCoin();
    @property(TabIPay)
    tabIPay: TabIPay = new TabIPay();

    private tabSelectedIdx = 0;

    start() {
        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("click", () => {
                cc.audioEngine.play(this.soundClickBtn, false, 1);
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

        this.tabDaiLy.start();
        this.tabBank.start();
        this.tabCard.start();
        this.tabViDienTu.start();
        this.tabBitCoin.start();
        this.tabIPay.start();

        if(Configs.App.SERVER_CONFIG.isOpenRutThe) {
            this.tabs.toggleItems[1].node.active = true;
        } else {
            this.tabs.toggleItems[1].node.active = false;
        }

        if(Configs.App.SERVER_CONFIG.isOpenRutMomo) {
            this.tabs.toggleItems[2].node.active = true;
        } else {
            this.tabs.toggleItems[2].node.active = false;
        }

        if(Configs.App.SERVER_CONFIG.isOpenRutBank) {
            this.tabs.toggleItems[3].node.active = true;
        } else {
            this.tabs.toggleItems[3].node.active = false;
        }

        for(let i=0; i<this.tabs.toggleItems.length; i++) {
            if(this.tabs.toggleItems[i].node.active) {
                this.tabSelectedIdx = i;
                break;
            }
        }

        this.tabBank.reset();
    }

    show() {
        super.showRight();
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = false;
            this.tabs.toggleItems[i].node.children[0].active = true;
            this.tabs.toggleItems[i].node.children[1].active = false;
        }

        FacebookTracking.logOpenWithdraw(); 
    }

    _onShowed() {
        super._onShowed();
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
    }

    public actBankSubmit() {
        this.tabBank.submit();
    }

    public actCardSubmit() {
        this.tabCard.submit();
    }

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            let isActive = (i == this.tabSelectedIdx);

            this.tabs.toggleItems[i].node.children[0].active = !isActive;
            this.tabs.toggleItems[i].node.children[1].active = isActive;
            let tabContent = this.tabContents.children[i];

            if(isActive) {
                this.scheduleOnce(() => {
                    tabContent.active = true;
                    tabContent.opacity = 0;
                    tabContent.runAction(cc.fadeIn(0.2));
                }, 0.05);
            } else {
                tabContent.active = false;
            }
        }

        switch (this.tabSelectedIdx) {
            case 0:
                this.tabDaiLy.reset();
                break;
            case 1:
                this.tabBank.reset();
                break;
            case 2:
                this.tabCard.reset();
                break;
            case 3:
                this.tabViDienTu.reset();
                break;
            case 4:
                this.tabBitCoin.reset();
                break;
        }
    }
}
