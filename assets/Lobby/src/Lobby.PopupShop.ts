import Dialog from "../../scripts/common/Dialog";
import cmd from "./Lobby.Cmd";
import InPacket from "../../scripts/networks/Network.InPacket";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import OldDropdown from "../../scripts/common/Dropdown";
import Configs from "../../scripts/common/Configs";
import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Utils from "../../scripts/common/Utils";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import ShootFishNetworkClient from "../../scripts/networks/ShootFishNetworkClient";
import Dropdown from "../../scripts/customui/CustomUI.Dropdown";
import PopupOTP from "./Lobby.PopupOTP";
import { NativeBridge } from "../../scripts/common/NativeBridge";
import FacebookTracking from "../../scripts/common/FacebookTracking";
import ActUtils from "../../scripts/common/ActUtils";

const { ccclass, property } = cc._decorator;

@ccclass("Lobby.PopupShop.TabGiftCode")
export class TabGiftCode {
    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
}

@ccclass("Lobby.PopupShop.TabNapThe")
export class TabNapThe {
    @property(OldDropdown)
    dropdownAmount: OldDropdown = null;
    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
    @property(cc.EditBox)
    edbSerial: cc.EditBox = null;
    @property(cc.Node)
    itemFactorTemplate: cc.Node = null;

    @property(cc.Label)
    bonus: cc.Label = null;

    @property(cc.Toggle)
    toggleVettel: cc.Toggle = null;
    
    @property(cc.Toggle)
    toggleMobi: cc.Toggle = null;

    @property(cc.Toggle)
    toggleVina: cc.Toggle = null;

    start() {
        this.itemFactorTemplate.active = false;
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapThe.length; i++) {
            let node = cc.instantiate(this.itemFactorTemplate);
            node.parent = this.itemFactorTemplate.parent;
            node.active = true;

            let menhGia = Configs.App.SERVER_CONFIG.listMenhGiaNapThe[i];
            let nhan = Math.ceil(menhGia * Configs.App.SERVER_CONFIG.ratioNapThe);
            node.getChildByName("menhgia").getComponent(cc.Label).string = Utils.formatNumber(menhGia);
            node.getChildByName("khuyenmai").getComponent(cc.Label).string = (Configs.App.SERVER_CONFIG.percentNapThe < 0 ? "" : "+") + Configs.App.SERVER_CONFIG.percentNapThe + "%";
            node.getChildByName("nhan").getComponent(cc.Label).string = Utils.formatNumber(nhan);

            if(Configs.App.SERVER_CONFIG.percentNapThe > 0) {
                this.bonus.string = "+" + Configs.App.SERVER_CONFIG.percentNapThe + "%";
                this.bonus.node.parent.active = true;
            } else {
                this.bonus.string = "";
                this.bonus.node.parent.active = false;
            }

            if(Configs.App.SERVER_CONFIG.listNapTelco) {
                this.toggleVettel.node.active = false;
                this.toggleVina.node.active = false;
                this.toggleMobi.node.active = false;
                if(Configs.App.SERVER_CONFIG.listNapTelco.length > 0) {
                    let arrNode = [this.toggleVettel, this.toggleVina, this.toggleMobi];
                    for(let i = 0; i < Configs.App.SERVER_CONFIG.listNapTelco.length; i++) {
                        arrNode[Configs.App.SERVER_CONFIG.listNapTelco[i]].node.active = true;
                    }
                }
            }
        }

        this.edbCode.node.on("editing-did-ended", () => {
            FacebookTracking.logAddToCard();
        });
    }

    reset() {
        let listMenhGia = ["Chọn mệnh giá"];
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapThe.length; i++) {
            listMenhGia.push(Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaNapThe[i]));
        }
        this.dropdownAmount.setOptions(listMenhGia);
        this.resetForm();
    }

    resetForm() {
        this.dropdownAmount.setValue(0);
        this.edbCode.string = "";
        this.edbSerial.string = "";
    }

    submit() {
        let ddTelcoValue = this.getTelco();
        let ddAmountValue = this.dropdownAmount.getValue();
        let code = this.edbCode.string.trim();
        let serial = this.edbSerial.string.trim();
        if (ddTelcoValue < 0 || ddTelcoValue > 2) {
            App.instance.showToast("Vui lòng chọn nhà mạng.");
            return;
        }
        if (ddAmountValue == 0) {
            App.instance.showToast("Vui lòng chọn mệnh giá.");
            return;
        }
        if (code == "" || parseInt(code) <= 0 || isNaN(parseInt(code))) {
            App.instance.showToast("Mã thẻ không hợp lệ.");
            return;
        }
        if (serial == "" || parseInt(serial) <= 0 || isNaN(parseInt(serial))) {
            App.instance.showToast("Mã serial không hợp lệ.");
            return;
        }
        let telcoId = Configs.App.SERVER_CONFIG.listIdNhaMang[ddTelcoValue];
        let amount = Configs.App.SERVER_CONFIG.listMenhGiaNapThe[ddAmountValue - 1].toString();

        App.instance.showLoading(true);
        // MiniGameNetworkClient.getInstance().send(new cmd.ReqDepositCard(telcoId, serial, code, amount));

        Http.post(Configs.App.PAY_URL + "/api8", {
            "tc": telcoId,
            "sr": serial,
            "pn": code, 
            "v": amount,
            "pl": NativeBridge.getPlatform()
        }, (err, json) => {
            App.instance.showLoading(false);
            if (err != null) {
                App.instance.alertDialog.showMsg("Nạp thẻ không thành công, vui lòng thử lại sau.");
                return;
            }

            if(json.hasOwnProperty("message")) {
                App.instance.alertDialog.showMsg(json["message"]);
            } else {
                App.instance.alertDialog.showMsg("Giao dịch thất bại, vui lòng liên hệ quản trị viên để được giúp đỡ");
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

@ccclass("Lobby.PopupShop.TabTransfer")
export class TabTransfer {
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

@ccclass("Lobby.PopupShop.TabCard")
export class TabCard {
    @property(OldDropdown)
    dropdownAmount: OldDropdown = null;
    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
    @property(cc.Node)
    itemFactorTemplate: cc.Node = null;

    start() {
        this.itemFactorTemplate.active = false;
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapThe.length; i++) {
            let node = cc.instantiate(this.itemFactorTemplate);
            node.parent = this.itemFactorTemplate.parent;
            node.active = true;

            let menhGia = Configs.App.SERVER_CONFIG.listMenhGiaNapThe[i];
            let nhan = Math.ceil(menhGia * Configs.App.SERVER_CONFIG.ratioNapThe);
            node.getChildByName("menhgia").getComponent(cc.Label).string = Utils.formatNumber(menhGia);
            node.getChildByName("khuyenmai").getComponent(cc.Label).string = "0%";
            node.getChildByName("nhan").getComponent(cc.Label).string = Utils.formatNumber(nhan);
        }
    }

    reset() {
        let listMenhGia = ["Chọn mệnh giá"];
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapThe.length; i++) {
            listMenhGia.push(Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaNapThe[i]));
        }
        this.dropdownAmount.setOptions(listMenhGia);
        this.resetForm();
    }

    resetForm() {
        this.dropdownAmount.setValue(0);
        this.edbCode.string = "";
    }

    submit() {
        let ddAmountValue = this.dropdownAmount.getValue();
        let code = this.edbCode.string.trim();
        if (ddAmountValue == 0) {
            App.instance.alertDialog.showMsg("Vui lòng chọn mệnh giá.");
            return;
        }
        if (code == "" || parseInt(code) <= 0 || isNaN(parseInt(code))) {
            App.instance.alertDialog.showMsg("Mã thẻ không hợp lệ.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqInsertGiftcode(code));
    }
}

@ccclass("Lobby.PopupShop.TabBitCoin")
export class TabBitCoin {
    @property(cc.EditBox)
    edbAddress: cc.EditBox = null;
    @property(OldDropdown)
    dropdownMoneyType: OldDropdown = null;

    private readonly moneyTypes = ["", "BTC", "LTC", "ETH", "TUSD", "USDC", "USDT.ERC20"];
    private readonly moneyTypesName = ["Chọn loại tiền", "BTC", "LTC", "ETH", "TUSD", "USDC", "USDT"];
    private address = "";

    start(component: cc.Component) {
        this.edbAddress.node.on("editing-did-ended", () => {
            this.edbAddress.string = this.address;
        });
        this.dropdownMoneyType.setOptions(this.moneyTypesName);
        this.dropdownMoneyType.setOnValueChange((idx) => {
            this.edbAddress.string = "";
            if (idx == 0) {
                this.edbAddress.placeholder = "Vui lòng chọn loại tiền.";
                return;
            }
            this.edbAddress.placeholder = "Đang tải...";
            App.instance.showLoading(true);
            ShootFishNetworkClient.getInstance().request("getbtcaddress", {
                "coin": this.moneyTypes[idx]
            }, (res) => {
                App.instance.showLoading(false);
                console.log(res);
                if (res["code"] == 200) {
                    this.address = res["data"]["result"]["address"];
                    Configs.Login.BitcoinToken = this.edbAddress.string = this.address;
                } else {
                    this.edbAddress.placeholder = "Lỗi rồi, vui lòng thử lại sau.";
                }
            }, component);
        });
        this.dropdownMoneyType.setValue(0);
        this.edbAddress.string = "";
        this.edbAddress.placeholder = "Vui lòng chọn loại tiền.";
        // if (Configs.Login.BitcoinToken == "") {
        //     this.edbAddress.string = "";
        //     this.edbAddress.placeholder = "Đang tải...";
        //     App.instance.showLoading(true);
        //     ShootFishNetworkClient.getInstance().request("getbtcaddress", null, (res) => {
        //         App.instance.showLoading(false);
        //         console.log(res);
        //         if (res["code"] == 200) {
        //             this.address = res["data"]["result"]["address"];
        //             Configs.Login.BitcoinToken = this.edbAddress.string = this.address;
        //         } else {
        //             this.edbAddress.placeholder = "Lỗi rồi, vui lòng thử lại sau.";
        //         }
        //     }, component);
        // } else {
        //     this.edbAddress.string = Configs.Login.BitcoinToken;
        // }
        // Http.get("http://149.28.138.254:8080/bancaapi/getbtcaddress/" + Configs.Login.UserIdFish, null, (res) => {
        //     App.instance.showLoading(false);
        //     console.log(res);
        //     if (res["code"] == 200) {
        //         this.address = res["data"]["result"]["address"];
        //         this.edbAddress.string = this.address;
        //     } else {
        //         this.edbAddress.placeholder = "Lỗi rồi, vui lòng thử lại sau.";
        //     }
        // });
    }
}

@ccclass("Lobby.PopupShop.TabViDienTu")
export class TabViDienTu {
    @property(Dropdown)
    dropdownVi: Dropdown = null;
    @property(cc.EditBox)
    edbName: cc.EditBox = null;
    @property(cc.EditBox)
    edbPhone: cc.EditBox = null;
    @property(cc.EditBox)
    edbContent: cc.EditBox = null;

    @property(cc.Node)
    toggleMomo: cc.Node = null;
    @property(cc.Node)
    toggleViettel: cc.Node = null;
    @property(cc.Node)
    toggleZalo: cc.Node = null;

    @property(cc.Label)
    activeAccount: cc.Label = null;

    @property(cc.Node)
    listFactor: cc.Node = null;

    @property(cc.Label)
    bonus: cc.Label = null;

    data: any = null;
    
    accViettelPay: any = null;
    accZaloPay: any = null;
    accMomo: any = null;

    currentPhone: string = "";
    currentName: string = "";

    @property(Dropdown)
    dropdownAmount: Dropdown = null;

    private factors = [];

    start() {
        this.factors = Configs.App.SERVER_CONFIG.listMenhGiaNapMomo;

        this.edbName.node.on("editing-did-ended", () => {
            this.fixInfo();
        });
        this.edbPhone.node.on("editing-did-ended", () => {
            this.fixInfo();
        });
        this.edbContent.node.on("editing-did-ended", () => {
            this.fixInfo();
        });
        this.dropdownVi.setOptions(["MoMo"]);

        let itemTemplate = this.listFactor.children[0];
        itemTemplate.active = false;
        for (let i = 0; i < this.factors.length; i++) {
            let value = parseInt("" + (this.factors[i] * Configs.App.SERVER_CONFIG.ratioNapMomo));
            let item = cc.instantiate(itemTemplate);
            item.parent = this.listFactor;
            item.getChildByName("Amount").getComponent(cc.Label).string = Utils.formatNumber(this.factors[i]);
            item.getChildByName("Percent").getComponent(cc.Label).string = "+" + Configs.App.SERVER_CONFIG.percentNapMomo + "%";
            item.getChildByName("Value").getComponent(cc.Label).string = Utils.formatNumber(value);
            item.active = true;

            if(Configs.App.SERVER_CONFIG.percentNapMomo > 0) {
                this.bonus.string = "+" + Configs.App.SERVER_CONFIG.percentNapMomo + "%";
                this.bonus.node.parent.active = true;
            } else {
                this.bonus.string = "";
                this.bonus.node.parent.active = false;
            }
        }

        let listMenhGia = ["Chọn mệnh giá"];
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapMomo.length; i++) {
            listMenhGia.push(Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaNapMomo[i]));
        }
        this.dropdownAmount.setOptions(listMenhGia);
        this.dropdownAmount.setValue(0);
        let _this = this;
        this.dropdownAmount.setOnValueChange(idx => {
            _this.reset();
        });
    }

    reset() {
        this.toggleMomo.active = false;
        this.toggleViettel.active = false;
        this.toggleZalo.active = false;
        App.instance.showLoading(true);

        if(this.dropdownAmount.getValue() == 0) {
            App.instance.showLoading(false);
            this.edbName.string = "";
            this.edbPhone.string = "";
            this.currentName = "";
            this.currentPhone = "";
            this.activeAccount.string = "";
            this.edbContent.string = "";
            return;
        };

        // if (this.data == null) {
            // Http.get(Configs.App.GATEWAY_URL + "/api/v1/topup/list-payment-wallet", {}, (err, json) => {
            //     if (err == null) {
            //         if (json["code"] == 200) {
            //             this.data = json;
            //             this.reloadInfo();
            //         }
            //     }
            //     this.dropdownVi.setValue(0);
            // });
            Http.get(Configs.App.PAY_URL + "/gt2listMomo", {"v" : Configs.App.SERVER_CONFIG.listMenhGiaNapMomo[this.dropdownAmount.getValue() - 1]}, (err, json) => {
                App.instance.showLoading(false);
                if (err == null) {
                    if (json["code"] == 1) {
                        this.data = json;
                        this.reloadInfo2();
                    }
                }
            }, {
                "Nickname": Configs.Login.Nickname,
                "Authorization": Configs.Login.AccessToken
            });
        // } else {
        //     App.instance.showLoading(false);
        //     this.reloadInfo2();
        // }
        this.dropdownVi.setValue(0);
    }

    openMomo() {
        if (cc.sys.os == cc.sys.OS_IOS) {
            cc.sys.openURL(encodeURI("https://apps.apple.com/vn/app/v%C3%AD-momo-n%E1%BA%A1p-ti%E1%BB%81n-thanh-to%C3%A1n/id918751511?l=vi"));
        } else {
            cc.sys.openURL(encodeURI("https://play.google.com/store/apps/details?id=com.mservice.momotransfer"));
        }
    }

    private reloadInfo2() {
        if (this.data == null) return;
        let account = this.data["data"];
        if(!account) return;
        if(account["type"] == "MOMO") {
            this.accMomo = account;
            this.toggleMomo.active = true;
        }
        if(account["type"] == "VIETTELPAY") {
            this.accViettelPay = account;
            this.toggleViettel.active = true;
        }
        if(account["type"] == "ZALOPAY") {
            this.accZaloPay = account;
            this.toggleZalo.active = true;
        }

        if(this.toggleMomo.active) {
            this.chooseAcc(this.toggleMomo);
        } else if(this.toggleViettel.active) {
            this.chooseAcc(this.toggleViettel);
        } else if(this.toggleZalo.active) {
            this.chooseAcc(this.toggleZalo);
        }
    }

    private reloadInfo() {
        if (this.data == null) return;
        let accounts = this.data["data"]["accounts"];
        if(!accounts) return;

        for(let i=0; i<accounts.length; i++) {
            let acc = accounts[i];
            if(acc["type"] == "MOMO") {
                this.accMomo = acc;
                this.toggleMomo.active = true;
            }
            if(acc["type"] == "VIETTELPAY") {
                this.accViettelPay = acc;
                this.toggleViettel.active = true;
            }
            if(acc["type"] == "ZALOPAY") {
                this.accZaloPay = acc;
                this.toggleZalo.active = true;
            }
        }

        if(this.toggleMomo.active) {
            this.chooseAcc(this.toggleMomo);
        } else if(this.toggleViettel.active) {
            this.chooseAcc(this.toggleViettel);
        } else if(this.toggleZalo.active) {
            this.chooseAcc(this.toggleZalo);
        }

        this.edbContent.string = Configs.Login.Nickname;
    }

    chooseAcc(toggle: cc.Node) {
        this.toggleMomo.children[0].active = false;
        this.toggleViettel.children[0].active = false;
        this.toggleZalo.children[0].active = false; 
        this.activeAccount.string = "";

        if(toggle == this.toggleMomo) {
            this.toggleMomo.children[0].active = true;
            this.edbName.string = this.accMomo["phoneName"] ? this.accMomo["phoneName"].split(" | ")[0] : "";
            this.edbPhone.string = this.accMomo["phoneNum"];
            this.currentName = this.accMomo["phoneName"] ? this.accMomo["phoneName"].split(" | ")[0] : "";
            this.currentPhone = this.accMomo["phoneNum"];
            this.activeAccount.string = "MOMO";
            this.edbContent.string = this.accMomo["code"];
        }
        if(toggle == this.toggleViettel) {
            this.toggleViettel.children[0].active = true;
            this.edbName.string = this.accViettelPay["name"];
            this.edbPhone.string = this.accViettelPay["phone"];
            this.currentName = this.accViettelPay["name"];
            this.currentPhone = this.accViettelPay["phone"];
            this.activeAccount.string = "VIETTEL PAY";
        }
        if(toggle == this.toggleZalo) {
            this.toggleZalo.children[0].active = true;
            this.edbName.string = this.accZaloPay["name"];
            this.edbPhone.string = this.accZaloPay["phone"];
            this.currentName = this.accZaloPay["name"];
            this.currentPhone = this.accZaloPay["phone"];
            this.activeAccount.string = "ZALO PAY";
        }
    }

    private fixInfo() {
        this.edbName.string = this.currentName;
        this.edbPhone.string = this.currentPhone;
    }
}

@ccclass("Lobby.PopupShop.TabBank")
export class TabBank {
    @property(Dropdown)
    dropdownBank: Dropdown = null;
    @property(cc.EditBox)
    edbAccountName: cc.EditBox = null;
    @property(cc.EditBox)
    edbAccountNumber: cc.EditBox = null;
    @property(cc.EditBox)
    edbContent: cc.EditBox = null;

    @property(cc.Node)
    listFactor: cc.Node = null;

    @property(cc.Label)
    bonus: cc.Label = null;

    @property(cc.Button)
    btnCopies: cc.Button[] = [];

    @property(Dropdown)
    dropdownAmount: Dropdown = null;

    data: any = null;
    dataAccount: any = null;
    bankOptions = null;
    amountOptions = null;
    bankSelected = null;
    amountSelected = null;

    private factors = [];

    start() {
        this.factors = Configs.App.SERVER_CONFIG.listMenhGiaNapBank;

        this.edbAccountName.node.on("editing-did-ended", () => {
            this.reloadInfo2();
        });
        this.edbAccountNumber.node.on("editing-did-ended", () => {
            this.reloadInfo2();
        });
        this.edbContent.node.on("editing-did-ended", () => {
            this.reloadInfo2();
        });

        let _this = this;

        this.dropdownBank.setOptions(["CHỌN NGÂN HÀNG"]);
        this.dropdownBank.setOnValueChange((idx) => {
            _this.bankSelected = idx;
            if (idx == 0) {
                _this.reset();
            } else {
                _this.getAccount();
            }
        });

        let itemTemplate = this.listFactor.children[0];
        itemTemplate.active = false;
        for (let i = 0; i < this.factors.length; i++) {
            let value = parseInt("" + (this.factors[i] * Configs.App.SERVER_CONFIG.ratioNapTienNH));
            let item = cc.instantiate(itemTemplate);
            item.parent = this.listFactor;
            item.getChildByName("Amount").getComponent(cc.Label).string = Utils.formatNumber(this.factors[i]);
            item.getChildByName("Percent").getComponent(cc.Label).string = "+" + Configs.App.SERVER_CONFIG.percentNapBank + "%";
            item.getChildByName("Value").getComponent(cc.Label).string = Utils.formatNumber(value);
            item.active = true;

            if(Configs.App.SERVER_CONFIG.percentNapBank > 0) {
                this.bonus.string = "+" + Configs.App.SERVER_CONFIG.percentNapBank + "%";
                this.bonus.node.parent.active = true;
            } else {
                this.bonus.string = "";
                this.bonus.node.parent.active = false;
            }
        }

        _this.getListBank();

        let listMenhGia = ["Chọn mệnh giá"];
        let listMenhGiaValue = ["Chọn mệnh giá"];
        for (let i = 0; i < Configs.App.SERVER_CONFIG.listMenhGiaNapBank.length; i++) {
            listMenhGia.push(Utils.formatNumber(Configs.App.SERVER_CONFIG.listMenhGiaNapBank[i]));
            listMenhGiaValue.push(Configs.App.SERVER_CONFIG.listMenhGiaNapBank[i]);
        }
        this.amountOptions = listMenhGiaValue;
        this.dropdownAmount.setOptions(listMenhGia);
        this.dropdownAmount.setValue(0);
        this.dropdownAmount.setOnValueChange(idx => {
            _this.amountSelected = idx;
            if(idx == 0) {
                _this.reset();
            } else {
                _this.getAccount();
            }
        });
    }

    reset() {
        this.edbAccountName.string = "";
        this.edbAccountNumber.string = "";
        this.edbContent.string = "";
                
        for(let i=0; i<this.btnCopies.length; i++) {
            this.btnCopies[i].node.active = false;
        }
    }

    submit() {

    }

    private reloadInfoBank() {
        if (this.data == null) return;
        let accountsData: Array<any> = this.data["data"];
        let options = ["CHỌN NGÂN HÀNG"];
        let optionsValue = ["CHỌN NGÂN HÀNG"];
        if(!accountsData) return;
        for (let i = 0; i < accountsData.length; i++) {
            options.push(accountsData[i]["name"]);
            optionsValue.push(accountsData[i]["code"])
        }
        this.bankOptions = optionsValue;
        this.dropdownBank.setOptions(options);
    }

    private getAccount() {
        let bankCode = this.bankOptions[this.bankSelected];
        let amount = this.amountOptions[this.amountSelected];
        if(!bankCode || !amount) return;
        App.instance.showLoading(true);
        Http.get(Configs.App.PAY_URL + "/gt2listBank", {"type": "account", "bankCode": bankCode, "v": amount}, (err, json) => {
            App.instance.showLoading(false);
            App.instance.showLoading(false);
            if (err == null) {
                if (json["code"] == 1) {
                    this.dataAccount = json;
                    this.reloadInfoAccount();
                }
            }
        }, {
            "Nickname": Configs.Login.Nickname,
            "Authorization": Configs.Login.AccessToken
        });
    }

    private getListBank() {
        App.instance.showLoading(true);
        Http.get(Configs.App.PAY_URL + "/gt2listBank", {"type": "list"}, (err, json) => {
            App.instance.showLoading(false);
            if (err == null) {
                if (json["code"] == 1) {
                    this.data = json;
                    this.reloadInfoBank();
                }
            }
        }, {
            "Nickname": Configs.Login.Nickname,
            "Authorization": Configs.Login.AccessToken
        });
    }

    private reloadInfoAccount() {
        let accountData = this.dataAccount;
        this.edbAccountName.string = accountData["data"]["phoneName"] ? accountData["data"]["phoneName"].split(" | ")[0] : "";
        this.edbAccountNumber.string = accountData["data"]["phoneNum"];
        this.edbContent.string = accountData["data"]["code"];

        for(let i=0; i<this.btnCopies.length; i++) {
            this.btnCopies[i].node.active = true;
        }
    }

    private reloadInfo2() {
        if (this.data == null || this.dropdownBank.getValue() == 0) {
            this.edbAccountName.string = "";
            this.edbAccountNumber.string = "";
            this.edbContent.string = "";
        } else {
            let accountData = this.data["content"][this.dropdownBank.getValue() - 1];
            this.edbAccountName.string = accountData["accName"];
            this.edbAccountNumber.string = accountData["accNum"];
            this.edbContent.string = Configs.Login.Nickname;
        }
    }
}

@ccclass("PopupShop.TabIPay")
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
export default class PopupShop extends Dialog {
    private static tabSelectedIdx = 0;
    private static instance: PopupShop;
    private static initing: boolean = false;

    public static createAndShow(parent: cc.Node, nickname: string = null) {
        if (!this.initing) {
            // if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupShop", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    this.instance = go.getComponent(PopupShop);
                    if(parent) {
                        go.parent = parent;
                        this.instance.show(nickname);
                    }
                });
            // } else {
            //     if(parent) {
            //         this.instance.node.parent = parent; 
            //         this.instance.show(nickname);
            //     }
            // }
        }
    }

    public static createAndShowShop(parent: cc.Node) {
        if(Configs.App.SERVER_CONFIG.isOpenNapMomo) {
            this.tabSelectedIdx = 1;
        } else
        if(Configs.App.SERVER_CONFIG.isOpenNapBank) {
            this.tabSelectedIdx = 2;
        } else
        if(Configs.App.SERVER_CONFIG.isOpenNapThe) {
            this.tabSelectedIdx = 0;
        }

        this.createAndShow(parent);
        
        FacebookTracking.logOpenPopupNap();
    }

    public static createAndShowTransfer(parent: cc.Node, nickname: string = null) {
        PopupShop.tabSelectedIdx = 4; 
        this.createAndShow(parent, nickname);
    }

    public static createAndShowGiftCode(parent: cc.Node) {
        PopupShop.tabSelectedIdx = 3; 
        this.createAndShow(parent);

        FacebookTracking.logOpenGiftCode();
    }

    public static createAndShowCard(parent: cc.Node) {
        PopupShop.tabSelectedIdx = 0; 
        this.createAndShow(parent);

        FacebookTracking.logOpenPopupNap();
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    @property(TabNapThe)
    tabNapThe: TabNapThe = null;
    @property(TabTransfer)
    tabTransfer: TabTransfer = null;
    @property(TabCard)
    tabCard: TabCard = null;
    @property(TabBitCoin)
    tabBitCoin: TabBitCoin = new TabBitCoin();
    @property(TabViDienTu)
    tabViDienTu: TabViDienTu = new TabViDienTu();
    @property(TabBank)
    tabBank: TabBank = new TabBank();
    @property(TabIPay)
    tabIPay: TabIPay = new TabIPay();
    @property([cc.Label])
    lblContainsBotOTPs: cc.Label[] = [];
    @property(TabGiftCode)
    tabGiftCode: TabGiftCode = new TabGiftCode();

    @property(cc.Button)
    btnSupport: cc.Button = null;

    private isLockBtnNapThe: boolean = false;

    start() {
        for (let i = 0; i < this.lblContainsBotOTPs.length; i++) {
            let lbl = this.lblContainsBotOTPs[i];
            lbl.string = lbl.string.replace("$bot_otp", "@" + Configs.App.getLinkTelegram());
        }

        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("toggle", () => {
                cc.audioEngine.play(this.soundClickBtn, false, 1);
                PopupShop.tabSelectedIdx = i;
                this.onTabChanged();
            });
        }

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {
                case cmd.Code.DEPOSIT_CARD: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResDepositCard(data);
                    switch (res.error) {
                        case 0:
                            App.instance.alertDialog.showMsg("Nạp thẻ thành công.");
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            break;
                        case 30:
                            this.tabNapThe.resetForm();
                            App.instance.alertDialog.showMsg("Hệ thống đã ghi nhận giao dịch, vui lòng chờ hệ thống xử lý.");
                            break;
                        case 31:
                            App.instance.alertDialog.showMsg("Thẻ đã được sử dụng.");
                            break;
                        case 32:
                            App.instance.alertDialog.showMsg("Thẻ đã bị khóa.");
                            break;
                        case 33:
                            App.instance.alertDialog.showMsg("Thẻ chưa được kích hoạt.");
                            break;
                        case 34:
                            App.instance.alertDialog.showMsg("Thẻ đã hết hạn sử dụng.");
                            break;
                        case 35:
                            App.instance.alertDialog.showMsg("Mã thẻ không đúng.");
                            break;
                        case 36:
                            App.instance.alertDialog.showMsg("Số serial không đúng.");
                            break;
                        case 8:
                            App.instance.alertDialog.showMsg("Tài khoản đã bị khóa nạp thẻ do nạp sai quá nhiều lần! Thời gian khóa nạp thẻ còn lại: " + this.longToTime(res.timeFail));
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". Không xác định.");
                            break;
                    }
                    break;
                }
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
                        0 == res.code ? (App.instance.alertDialog.showMsg("Nạp thành công!"), this.tabNapThe.resetForm(), FacebookTracking.logPurchase())
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

                            FacebookTracking.logGotGiftCode();
                            break;
                    }
                    break;
                }
            }
        }, this);

        this.tabNapThe.start();
        this.tabTransfer.start();
        this.tabCard.start();
        this.tabViDienTu.start();
        this.tabBank.start();
        this.tabIPay.start();

        if(Configs.App.SERVER_CONFIG.isOpenNapThe) {
            this.tabs.toggleItems[0].node.active = true;
        } else {
            this.tabs.toggleItems[0].node.active = false;
        }

        if(Configs.App.SERVER_CONFIG.isOpenNapMomo) {
            this.tabs.toggleItems[1].node.active = true;
        } else {
            this.tabs.toggleItems[1].node.active = false;
        }

        if(Configs.App.SERVER_CONFIG.isOpenNapBank) {
            this.tabs.toggleItems[2].node.active = true;
        } else {
            this.tabs.toggleItems[2].node.active = false;
        }

        this.tabBank.reset();
        this.tabViDienTu.reset();

        ActUtils.bubble(this.btnSupport.node);
    }

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            let isActive = (i == PopupShop.tabSelectedIdx);

            this.tabs.toggleItems[i].node.children[0].active = !isActive;
            this.tabs.toggleItems[i].node.children[1].active = isActive;
            let tabContent = this.tabContents.children[i];

            // if(isActive) {
            //     this.scheduleOnce(() => {
            //         tabContent.active = true;
            //         tabContent.opacity = 0;
            //         tabContent.runAction(cc.fadeIn(0.2));
            //     }, 0.05);
            // } else {
            //     tabContent.active = false;
            // }
            tabContent.active = isActive
        }

        switch (PopupShop.tabSelectedIdx) {
            case 0:
                this.tabNapThe.reset();
                break;
            case 1:
                this.tabViDienTu.reset();
                break;
            case 2:
                this.tabBank.reset();
                break;
            case 5:
                break;
        }
    }

    private longToTime(l: number): string {
        return (l / 60) + " giờ " + (l % 60) + " phút";
    }

    show(nickname: string = null) {
        super.showRight();

        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = false;
            this.tabs.toggleItems[i].node.children[0].active = true;
            this.tabs.toggleItems[i].node.children[1].active = false;
        }
        
        if (typeof nickname == "string") {
            this.tabTransfer.edbNickname.string = this.tabTransfer.edbReNickname.string = nickname;
            App.instance.showLoading(true);
            MiniGameNetworkClient.getInstance().send(new cmd.ReqCheckNicknameTransfer(nickname));
        }
    }

    _onShowed() {
        super._onShowed();
        this.tabs.toggleItems[PopupShop.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
    }

    actSubmitNapThe() {
        if(!this.isLockBtnNapThe) {
            this.tabNapThe.submit();

            this.isLockBtnNapThe = true;
            this.scheduleOnce(() => {
                this.isLockBtnNapThe = false; 
            }, 1);
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

    actOpenMomo() {
        this.tabViDienTu.openMomo();
    }

    actSubmitCard() {
        this.tabCard.submit();
    }

    copyMomoName() {
        NativeBridge.copyToClipBoard(this.tabViDienTu.edbName.string);
        this.showToastCopied();
    }

    copyMomoPhone() {
        NativeBridge.copyToClipBoard(this.tabViDienTu.edbPhone.string);
        this.showToastCopied();
        FacebookTracking.logAddToCard();
    }

    copyMomoContent() {
        NativeBridge.copyToClipBoard(this.tabViDienTu.edbContent.string);
        this.showToastCopied();
    }

    copyBankName() {
        NativeBridge.copyToClipBoard(this.tabBank.edbAccountName.string);
        this.showToastCopied();
    }

    copyBankNumber() {
        NativeBridge.copyToClipBoard(this.tabBank.edbAccountNumber.string);
        this.showToastCopied();

        FacebookTracking.logAddToCard();
    }

    copyBankContent() {
        NativeBridge.copyToClipBoard(this.tabBank.edbContent.string);
        this.showToastCopied();
    }

    actSubmitGiftCode() {
        let code = this.tabGiftCode.edbCode.string.trim();
        if (code == "") {
            App.instance.alertDialog.showMsg("Mã quà tặng không được để trống.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqInsertGiftcode(code));

        FacebookTracking.logHitGiftCode();
    }

    showToastCopied() {
        App.instance.showToast("Đã copy vào clipboard", 1);
    }

    actOpenSupport() {
        cc.sys.openURL(Configs.App.LINK_SUPPORT);
    }

    actToggleViDienTu(event, data) {
        if(data == "MOMO") {
            this.tabViDienTu.chooseAcc(this.tabViDienTu.toggleMomo);
        }
        if(data == "VIETTELPAY") {
            this.tabViDienTu.chooseAcc(this.tabViDienTu.toggleViettel);
        }
        if(data == "ZALOPAY") {
            this.tabViDienTu.chooseAcc(this.tabViDienTu.toggleZalo);
        }
    }
}
