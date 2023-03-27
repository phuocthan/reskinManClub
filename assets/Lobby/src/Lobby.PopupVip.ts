import Dialog from "../../scripts/common/Dialog";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import Utils from "../../scripts/common/Utils";
import Configs from "../../scripts/common/Configs";
import Http from "../../scripts/common/Http";
import App from "../../scripts/common/App";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import cmd from "./Lobby.Cmd";
import InPacket from "../../scripts/networks/Network.InPacket";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const {ccclass, property} = cc._decorator;

@ccclass("Lobby.PopupVip.TabVip")
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
}
@ccclass
export default class PopupVip extends Dialog {

    private static instance: PopupVip = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupVip", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupVip);
                    this.instance.show();
                });
            } else {
                this.instance.show();
            }
        }
    }

    public static isShowing() {
        if(PopupVip.instance && PopupVip.instance.node.active) {
            return true;
        } else {
            return false;
        }
    }

    @property(TabVip)
    tabVip: TabVip = null;

    @property(cc.Node)
    contentVip: cc.Node = null;

    start() {  
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
                        Configs.Login.mobile = res.mobile;
                    } 
                    break;
                }
            }
        }, this);
    }

    show() {
        super.showRight();
        this.getVipPointInfo();
        this.tabVip.continueOTP.active = false;
        MiniGameNetworkClient.getInstance().send(new cmd.ReqGetSecurityInfo());

        this.contentVip.active = false;
        setTimeout(() => {
            if(this.contentVip) {
                this.contentVip.active = true;
                this.contentVip.runAction( cc.fadeIn(0.5));
            }   
        }, 300);
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
            for (let i = 0; i < this.tabVip.items.childrenCount; i++) {
                let item = this.tabVip.items.children[i];
                if (i < res["ratioList"].length) {
                    item.getChildByName("lblVipPoint").getComponent(cc.Label).string = Utils.formatNumber(Configs.Login.VipPoint);
                    item.getChildByName("lblCoin").getComponent(cc.Label).string = Utils.formatNumber(Configs.Login.VipPoint * res["ratioList"][i]);
                    item.getChildByName("btnReceive").active = res["ratioList"][i] > 0;
                    item.getChildByName("btnReceive").getComponent(cc.Button).interactable = i == Configs.Login.getVipPointIndex() && Configs.Login.VipPoint > 0;
                    item.getChildByName("btnReceive").off("click");
                    item.getChildByName("btnReceive").on("click", () => {
                        if(Configs.Login.mobile) {
                            App.instance.confirmDialog.show2("Bạn có chắc chắn muốn nhận thưởng vippoint\nTương ứng với cấp Vippoint hiện tại bạn nhận được :\n" + Utils.formatNumber(Configs.Login.VipPoint * res["ratioList"][i]) + " Xu", (isConfirm) => {
                                if (isConfirm) {
                                    App.instance.showLoading(true);
                                    MiniGameNetworkClient.getInstance().send(new cmd.ReqExchangeVipPoint());
                                }
                            });
                        } else {
                            App.instance.confirmDialog.show2("Bạn chưa xác minh số điện thoại, bạn có muốn xác minh luôn không?", (isConfirm) => {
                                if(isConfirm) {
                                    cc.sys.openURL(Configs.App.LINK_TELE_VERIFY_PHONE + "?start=" + Configs.Login.AccessToken + "-" + Configs.Login.Nickname);
                                    FacebookTracking.logOpenVerify();
                                    this.dismiss();
                                }
                            });
                        }
                    });
                    item.active = true;
                } else {
                    item.active = false;
                }
            }

            this.tabVip.lblVipPointName.string = Configs.Login.getVipPointName();
            this.tabVip.lblVipPoint.string = Utils.formatNumber(Configs.Login.VipPoint);
            this.tabVip.lblTotalVipPoint.string = Utils.formatNumber(Configs.Login.VipPointSave);
            this.tabVip.lblVipPointNextLevel.string = Utils.formatNumber(Configs.Login.getVipPointNextLevel());

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
            // Configs.Login.VipPoint = 1000;
            let delta = (Configs.Login.VipPoint - vipPointStartLevel) / (vipPointNextLevel - vipPointStartLevel);
            // console.log("delta: " + delta);
            this.tabVip.spriteProgressVipPoint.fillRange = vipPointIdx * (1 / 6) + delta * (1 / 6);
        });
    }
}
