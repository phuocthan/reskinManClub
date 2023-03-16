import Dialog from "../../scripts/common/Dialog";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import App from "../../scripts/common/App";
import InPacket from "../../scripts/networks/Network.InPacket";
import cmd from "./Lobby.Cmd";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import Configs from "../../scripts/common/Configs";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupOTP extends Dialog {

    private static instance: PopupOTP = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupOTP", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupOTP);
                    this.instance.show();
                });
            } else {
                this.instance.show();
            }
        }
    }

    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
    @property([cc.Label])
    lblContainsBotOTPs: cc.Label[] = [];

    start() {
        for (let i = 0; i < this.lblContainsBotOTPs.length; i++) {
            let lbl = this.lblContainsBotOTPs[i];
            lbl.string = lbl.string.replace("$bot_otp", "@" + Configs.App.getLinkTelegram());
        }

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.GET_OTP: {
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
                    App.instance.showLoading(false);
                    let res = new cmd.ResSendOTP(data);
                    console.log(res);
                    if (res.error != 0) {
                        switch (res.error) {
                            case 0:
                                this.dismiss();
                                break;
                            case 1:
                            case 2:
                                App.instance.alertDialog.showMsg("Giao dịch thất bại!");
                                this.dismiss();
                                break;
                            case 3:
                                App.instance.alertDialog.showMsg("Mã xác thực không chính xác, vui lòng thử lại!");
                                break;
                            case 4:
                                App.instance.alertDialog.showMsg("Mã OTP đã hết hạn!");
                                break;
                            default:
                                App.instance.alertDialog.showMsg("Lỗi " + res.error + ". Không xác định.");
                                this.dismiss();
                                break;
                        }
                        return;
                    }
                    this.dismiss();
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
                            App.instance.alertDialog.showMsg("Để nhận giftcode vui lòng đăng ký bảo mật.");
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
    }

    show() {
        super.show();
        this.edbCode.string = "";
    }

    actSubmit() {
        let otp = this.edbCode.string.trim();
        if (otp == "") {
            App.instance.alertDialog.showMsg("Mã OTP không được để trống.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqSendOTP(otp, 0));
    }

    actGetOTP() {
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqGetOTP());
    }

    actTelegram() {
        App.instance.openTelegram();
    }
}
