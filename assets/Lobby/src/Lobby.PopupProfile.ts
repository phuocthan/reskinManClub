import Dialog from "../../scripts/common/Dialog";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import Utils from "../../scripts/common/Utils";
import Configs from "../../scripts/common/Configs";
import Http from "../../scripts/common/Http";
import App from "../../scripts/common/App";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import cmd from "./Lobby.Cmd";
import InPacket from "../../scripts/networks/Network.InPacket";
import PopupShop from "./Lobby.PopupShop";
import PopupChangeAvatar from "./Lobby.PopupChangeAvatar";
import LobbyController from "./Lobby.LobbyController";
import PopupChangePassword from "./Lobby.PopupChangePassword";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const { ccclass, property } = cc._decorator;

@ccclass("Lobby.PopupProfile.TabProfile")
export class TabProfile {
    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Label)
    lblVipPoint: cc.Label = null;
    @property(cc.Label)
    lblVipPointPercent: cc.Label = null;
    @property(cc.Label)
    lblVipName: cc.Label = null;
    @property(cc.Slider)
    sliderVipPoint: cc.Slider = null;
    @property(cc.Sprite)
    spriteProgressVipPoint: cc.Sprite = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Label)
    lblBirthday: cc.Label = null;
    @property(cc.Label)
    lblIP: cc.Label = null;
    @property(cc.Label)
    lblJoinDate: cc.Label = null;
    @property(cc.Sprite)
    spriteAvatar: cc.Sprite = null;

    @property(cc.Label)
    displayName: cc.Label = null;
    @property(cc.Label)
    userName: cc.Label = null;
    @property(cc.Label)
    phoneNumber: cc.Label = null;
    @property(cc.Label)
    verifyPhoneBtnLabel: cc.Label = null;
    @property(cc.Button)
    btnVerifyPhone: cc.Button = null;

    // hna add
    @property(cc.Label)
    moneyValue: cc.Label = null;
    @property(cc.Node)
    verifyPhoneNode: cc.Node = null;
    @property(cc.Label)
    lblId: cc.Label = null;
    // end
}


@ccclass("Lobby.PopupProfile.TabVip")
export class TabVip {
    @property(cc.Label)
    lblVipPointName: cc.Label = null;
    @property(cc.Label)
    lblVipPoint: cc.Label = null;
    @property(cc.Label)
    lblTotalVipPoint: cc.Label = null;
    @property(cc.Label)
    lblVipPointNextLevel: cc.Label = null;
    @property(cc.Sprite)
    spriteProgressVipPoint: cc.Sprite = null;
    @property(cc.Node)
    items: cc.Node = null;
    @property(cc.Node)
    continueOTP: cc.Node = null;
    @property(cc.EditBox)
    edbOTP: cc.EditBox = null;
    @property(cc.Toggle)
    toggleAppOTP: cc.Toggle = null;

    getVipPointInfo() {
        App.instance.showLoading(true);
        Http.get(Configs.App.API, { "c": 126, "nn": Configs.Login.Nickname }, (err, res) => {
            App.instance.showLoading(false);
            if (err != null) {
                return;
            }
            if (!res["success"]) {
                App.instance.alertDialog.showMsg("Lỗi kết nối, vui lòng thử lại.");
                return;
            }
            Configs.Login.VipPoint = res["vippoint"];
            Configs.Login.VipPointSave = res["vippointSave"];
            // console.log("Configs.Login.VipPointSave: " + Configs.Login.VipPointSave);
            // console.log("Configs.Login.VipPoint: " + Configs.Login.VipPoint);
            // Configs.Login.VipPoint = 45000;
            // ratioList
            for (let i = 0; i < this.items.childrenCount; i++) {
                let item = this.items.children[i];
                if (i < res["ratioList"].length) {
                    item.getChildByName("lblVipPoint").getComponent(cc.Label).string = Utils.formatNumber(Configs.Login.VipPoint);
                    item.getChildByName("lblCoin").getComponent(cc.Label).string = Utils.formatNumber(Configs.Login.VipPoint * res["ratioList"][i]);
                    item.getChildByName("btnReceive").active = res["ratioList"][i] > 0;
                    item.getChildByName("btnReceive").getComponent(cc.Button).interactable = i == Configs.Login.getVipPointIndex() && Configs.Login.VipPoint > 0;
                    item.getChildByName("btnReceive").getComponentInChildren(cc.Label).node.color = i == Configs.Login.getVipPointIndex() ? cc.Color.YELLOW : cc.Color.GRAY;
                    item.getChildByName("btnReceive").off("click");
                    item.getChildByName("btnReceive").on("click", () => {
                        App.instance.confirmDialog.show2("Bạn có chắc chắn muốn nhận thưởng vippoint\nTương ứng với cấp Vippoint hiện tại bạn nhận được :\n" + Utils.formatNumber(Configs.Login.VipPoint * res["ratioList"][i]) + " Xu", (isConfirm) => {
                            if (isConfirm) {
                                App.instance.showLoading(true);
                                MiniGameNetworkClient.getInstance().send(new cmd.ReqExchangeVipPoint());
                            }
                        });
                    });
                    item.active = true;
                } else {
                    item.active = false;
                }
            }

            this.lblVipPointName.string = Configs.Login.getVipPointName();
            this.lblVipPoint.string = Utils.formatNumber(Configs.Login.VipPoint);
            this.lblTotalVipPoint.string = Utils.formatNumber(Configs.Login.VipPointSave);
            this.lblVipPointNextLevel.string = Utils.formatNumber(Configs.Login.getVipPointNextLevel());

            let VipPoints = [80, 800, 4500, 8600, 50000, 1000000];
            let vipPointIdx = 0;
            for (let i = VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > VipPoints[i]) {
                    vipPointIdx = i + 1;
                    break;
                }
            }

            let vipPointNextLevel = VipPoints[0];
            for (let i = VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > VipPoints[i]) {
                    if (i == VipPoints.length - 1) {
                        vipPointNextLevel = VipPoints[i];
                        break;
                    }
                    vipPointNextLevel = VipPoints[i + 1];
                    break;
                }
            }

            let vipPointStartLevel = 0;
            for (let i = VipPoints.length - 1; i >= 0; i--) {
                if (Configs.Login.VipPoint > VipPoints[i]) {
                    vipPointStartLevel = VipPoints[i];
                    break;
                }
            }
            // console.log("Configs.Login.VipPoint: " + Configs.Login.VipPoint);
            // console.log("vipPointNextLevel: " + vipPointNextLevel);
            // console.log("vipPointStartLevel: " + vipPointStartLevel);
            // console.log("vipPointIdx: " + vipPointIdx);
            let delta = (Configs.Login.VipPoint - vipPointStartLevel) / (vipPointNextLevel - vipPointStartLevel);
            // console.log("delta: " + delta);
            this.spriteProgressVipPoint.fillRange = vipPointIdx * (1 / 6) + delta * (1 / 6);
        });
    }


}
@ccclass
export default class PopupProfile extends Dialog {

    private static instance: PopupProfile = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node, idx: number = 0) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupProfile", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupProfile);
                    this.instance.show(idx);
                });
            } else {
                this.instance.show(idx);
            }
        }
    }

    public static isShowing() {
        if(PopupProfile.instance && PopupProfile.instance.node.active) {
            return true;
        } else {
            return false;
        }
    }

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    @property(TabProfile)
    tabProfile: TabProfile = null;
    @property(TabVip)
    tabVip: TabVip = null;

    private tabSelectedIdx = 0;

    start() {
        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("click", () => {
                this.tabSelectedIdx = i;
                this.onTabChanged();
            });
        }

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            if (!this.node.active) return;
            this.tabProfile.lblCoin.string = Utils.formatNumber(Configs.Login.Coin);
            this.tabProfile.moneyValue.string = Utils.formatNumber(Configs.Login.Coin);
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.USER_INFO_UPDATED, () => {
            if (!this.node.active) return;
            this.tabProfile.spriteAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
        }, this);

        MiniGameNetworkClient.getInstance().addListener((data) => {
            if (!this.node.active) return;
            let inpacket = new InPacket(data);
            // console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {
                case cmd.Code.EXCHANGE_VIP_POINT: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResExchangeVipPoint(data);
                    switch (res.error) {
                        case 0:
                            this.tabVip.continueOTP.active = true;
                            this.tabVip.edbOTP.string = "";
                            App.instance.alertDialog.showMsg("Vui lòng nhấn \"Lấy OTP\" hoặc nhận OTP qua APP OTP, và nhập để tiếp tục.");
                            break;
                        case 1:
                            App.instance.alertDialog.showMsg("Hệ thống đang tạm thời gián đoạn!");
                            break;
                        case 2:
                            App.instance.alertDialog.showMsg("Chức năng này chỉ áp dụng cho những tài khoản đã đăng ký bảo mật SMS PLUS");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". Không xác định.");
                            break;
                    }
                    break;
                }
                case cmd.Code.RESULT_EXCHANGE_VIP_POINT: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResResultExchangeVipPoint(data);
                    switch (res.error) {
                        case 0:
                            this.tabVip.continueOTP.active = false;
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            App.instance.alertDialog.showMsg("Chúc mừng bạn đã nhận được: \n" + Utils.formatNumber(res.moneyAdd) + " Xu");
                            break;
                        case 1:
                            App.instance.alertDialog.showMsg("Hệ thống đang tạm thời gián đoạn!");
                            break;
                        case 2:
                            App.instance.alertDialog.showMsg("Chức năng này chỉ áp dụng cho những tài khoản đã đăng ký bảo mật SMS PLUS");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". Không xác định.");
                            break;
                    }
                    break;
                }
                case cmd.Code.GET_OTP: {
                    if (!this.node.active) return;
                    App.instance.showLoading(false);
                    let res = new cmd.ResGetOTP(data);
                    // console.log(res);
                    if (res.error == 0) {
                        App.instance.alertDialog.showMsg("Mã OTP đã được gửi đi!");
                    } else if (res.error == 30) {
                        App.instance.alertDialog.showMsg("Mỗi thao tác lấy SMS OTP phải cách nhau ít nhất 5 phút!");
                    } else {
                        App.instance.alertDialog.showMsg("Thao tác không thành công vui lòng thử lại sau!");
                    }
                    break;
                }
                case cmd.Code.SEND_OTP: {
                    let res = new cmd.ResSendOTP(data);
                    // console.log(res);
                    App.instance.showLoading(false);
                    switch (res.error) {
                        case 0:
                            break;
                        case 1:
                        case 2:
                            App.instance.alertDialog.showMsg("Giao dịch thất bại!");
                            break;
                        case 77:
                        case 3:
                            App.instance.alertDialog.showMsg("Mã xác thực không chính xác, vui lòng thử lại!");
                            break;
                        case 4:
                            App.instance.alertDialog.showMsg("Mã OTP đã hết hạn!");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("Lỗi " + res.error + ". Không xác định.");
                            break;
                    }
                    break;
                }
                case cmd.Code.GET_SECURITY_INFO: {
                    let res = new cmd.ResGetSecurityInfo(data);
                    if(res.mobile) {
                        this.tabProfile.phoneNumber.string = res.mobile;
                        this.tabProfile.verifyPhoneBtnLabel.string = "Cập Nhật SDT";
                        Configs.Login.mobile = res.mobile;

                        // hna add
                        this.tabProfile.verifyPhoneNode.getChildByName('active').active = true;
                        this.tabProfile.verifyPhoneNode.getChildByName('deactive').active = false;
                        // end
                    } else {
                        this.tabProfile.phoneNumber.string = "Kích hoạt SĐT";
                        this.tabProfile.verifyPhoneBtnLabel.string = "Xác Thực SDT";

                        // hna add
                        this.tabProfile.verifyPhoneNode.getChildByName('active').active = false;
                        this.tabProfile.verifyPhoneNode.getChildByName('deactive').active = true;
                        // end
                    }
                    this.tabProfile.btnVerifyPhone.node.active = true;
                    break;
                }
            }
        }, this);
    }

    initProfileInfo() {
        this.tabProfile.displayName.string = Configs.Login.Nickname;
        // hna add
        if(Configs.Login.Nickname) {
            if(Configs.Login.Nickname.length > 10) {
                this.tabProfile.displayName.fontSize = 16;
            } else {
                this.tabProfile.displayName.fontSize = 20;
            }
        }
        // end
        this.tabProfile.userName.string = Configs.Login.Username;
        this.tabProfile.phoneNumber.string = "";
        this.tabProfile.btnVerifyPhone.node.active = false;

        MiniGameNetworkClient.getInstance().send(new cmd.ReqGetSecurityInfo());
    }

    goToVerifyPhoneNumber() {
        cc.sys.openURL(Configs.App.LINK_TELE_VERIFY_PHONE + "?start=" + Configs.Login.AccessToken + "-" + Configs.Login.Nickname);
        this.dismiss();

        FacebookTracking.logOpenVerify();
    }

    show(idx: number = 0) {
        super.showRight();

        this.tabSelectedIdx = idx;
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
    }

    actShowAddCoin() {
        this.dismiss();
        PopupShop.createAndShowShop(App.instance.popups);
    }

    actContinueExchangeVipPoint() {
        let otp = this.tabVip.edbOTP.string.trim();
        if (otp.length == 0) {
            App.instance.alertDialog.showMsg("Mã OTP không được bỏ trống.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqSendOTP(otp, this.tabVip.toggleAppOTP.isChecked ? 1 : 0));
    }

    actGetOTP() {
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqGetOTP());
    }

    actChangeAvatar() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        PopupChangeAvatar.createAndShow(LobbyController.instance.popups)
    }

    actChangePassword() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        PopupChangePassword.createAndShow(LobbyController.instance.popups)
    }

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = i == this.tabSelectedIdx;
        }
        for (let j = 0; j < this.tabs.toggleItems.length; j++) {
            this.tabs.toggleItems[j].node.getComponentInChildren(cc.Label).node.color = j == this.tabSelectedIdx ? cc.Color.YELLOW : cc.Color.WHITE;
        }
        switch (this.tabSelectedIdx) {
            case 0:
                this.tabProfile.lblNickname.string = Configs.Login.Nickname;
                this.tabProfile.lblCoin.string = Utils.formatNumber(Configs.Login.Coin);
                this.tabProfile.lblBirthday.string = Configs.Login.Birthday == "" ? "Chưa cập nhật" : Configs.Login.Birthday;
                this.tabProfile.lblIP.string = Configs.Login.IpAddress;
                this.tabProfile.lblVipPoint.string = "Vip Point: " + Utils.formatLongNumber(Math.floor(Configs.Login.VipPoint)) + "/" + Utils.formatLongNumber(Math.floor(Configs.Login.getVipPointNextLevel()));
                this.tabProfile.lblJoinDate.string = Configs.Login.CreateTime;
                this.tabProfile.lblVipName.string = Configs.Login.getVipPointName();
                this.tabProfile.sliderVipPoint.progress = Math.min(Configs.Login.VipPoint / Configs.Login.getVipPointNextLevel(), 1);
                this.tabProfile.spriteProgressVipPoint.fillRange = this.tabProfile.sliderVipPoint.progress;
                this.tabProfile.lblVipPointPercent.string = Math.floor(this.tabProfile.sliderVipPoint.progress * 100) + "%";
                this.tabProfile.spriteAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);

                // hna add
                this.tabProfile.moneyValue.string = Utils.formatNumber(Configs.Login.Coin);
                this.tabProfile.lblId.string = "ID: " + Configs.Login.UserId;
                // end

                this.initProfileInfo();
                break;
            case 1:
                this.tabVip.getVipPointInfo();
                this.tabVip.continueOTP.active = false;
                break;
        }
    }

    actLogout() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        this.dismiss();
        LobbyController.instance.actBack();
    }

    actHistory() {
        this.dismiss();
        LobbyController.instance.actTransaction();
    }

    actGroupChat() {
        LobbyController.instance.actFanpage();
    }
    actVipPoint() {
        cc.audioEngine.play(this.soundClickBtn, false, 1);
        LobbyController.instance.actVippoint();
    }
}
