import Dialog from "../../scripts/common/Dialog";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import App from "../../scripts/common/App";
import Utils from "../../scripts/common/Utils";
import PopupUpdateNickname from "./Lobby.PopupUpdateNickname";
import LobbyController from "./Lobby.LobbyController";
import { NativeBridge } from "../../scripts/common/NativeBridge";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupRegister extends Dialog {

    private static instance: PopupRegister = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupRegister", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupRegister);
                    this.instance.show();
                });
            } else {
                this.instance.show();
            }
        }
    }

    @property(cc.EditBox)
    edbUsername: cc.EditBox = null;
    @property(cc.EditBox)
    edbPassword: cc.EditBox = null;
    @property(cc.EditBox)
    edbRePassword: cc.EditBox = null;
    @property(cc.EditBox)
    edbCaptcha: cc.EditBox = null;
    @property(cc.Sprite)
    sprCaptcha: cc.Sprite = null;

    private captchaId: string = "";

    show() {
        super.show();
        this.refreshCaptcha();
    }

    public actRegister() {
        let username = this.edbUsername.string.trim();
        let password = this.edbPassword.string;
        let rePassword = this.edbRePassword.string;
        let captcha = this.edbCaptcha.string;

        if (username.length == 0) {
            App.instance.alertDialog.showMsg("Tên đăng nhập không được để trống.");
            return;
        }

        if (password.length == 0) {
            App.instance.alertDialog.showMsg("Mật khẩu không được để trống.");
            return;
        }

        if (password != rePassword) {
            App.instance.alertDialog.showMsg("Hai mật khẩu không khớp.");
            return;
        }

        // if (captcha.length == 0) {
        //     App.instance.alertDialog.showMsg("Mã xác thực không được để trống.");
        //     return;
        // }

        App.instance.showLoading(true);
        let reqParams = { "c": 1, "un": username, "pw": md5(password), "cp": captcha, "cid": this.captchaId };
        if (cc.sys.isNative && cc.sys.os == cc.sys.OS_IOS) {
            reqParams["utm_source"] = "IOS";
            reqParams["utm_medium"] = "IOS";
            reqParams["utm_term"] = "IOS";
            reqParams["utm_content"] = "IOS";
            reqParams["utm_campaign"] = "IOS";
        } else if (cc.sys.isNative && cc.sys.os == cc.sys.OS_ANDROID) {
            reqParams["utm_source"] = NativeBridge.getPackageName();
            reqParams["utm_medium"] = NativeBridge.getPackageName();
            reqParams["utm_term"] = NativeBridge.getPackageName();
            reqParams["utm_content"] = NativeBridge.getPackageName();
            reqParams["utm_campaign"] = NativeBridge.getPackageName();
        }
        
        console.log("reqParams: " + JSON.stringify(reqParams));

        Http.get(Configs.App.API, reqParams, (err, res) => {
            App.instance.showLoading(false);
            if (err != null) {
                App.instance.alertDialog.showMsg("Xảy ra lỗi, vui lòng thử lại sau!");
                return;
            }
            // console.log(res);
            if (!res["success"]) {
                switch (parseInt(res["errorCode"])) {
                    case 1001:
                        App.instance.alertDialog.showMsg("Kết nối mạng không ổn định, vui lòng thử lại sau.");
                        this.refreshCaptcha();
                        break;
                    case 101:
                        App.instance.alertDialog.showMsg("Tên đăng nhập không hợp lệ.");
                        this.refreshCaptcha();
                        break;
                    case 1006:
                        App.instance.alertDialog.showMsg("Tài khoản đã tồn tại.");
                        this.refreshCaptcha();
                        break;
                    case 102:
                        App.instance.alertDialog.showMsg("Mật khẩu không hợp lệ.");
                        this.refreshCaptcha();
                        break;
                    case 108:
                        App.instance.alertDialog.showMsg("Mật khẩu không được trùng với tên đăng nhập.");
                        this.refreshCaptcha();
                        break;
                    case 115:
                        App.instance.alertDialog.showMsg("Mã xác nhận không chính xác.");
                        break;
                    case 1114:
                        App.instance.alertDialog.showMsg("Hệ thống đang bảo trì. Vui lòng quay trở lại sau!");
                        this.refreshCaptcha();
                        break;
                    default:
                        App.instance.alertDialog.showMsg("Xảy ra lỗi, vui lòng thử lại sau!");
                        break;
                }
                return;
            }
            this.dismiss();
            PopupUpdateNickname.createAndShow(LobbyController.instance.popups, username, password);
        });
        
        FacebookTracking.logRegister();
    }

    public refreshCaptcha() {
        var _this = this;
        Http.get(Configs.App.API, { "c": 124 }, (err, res) => {
            if (err != null) {
                App.instance.alertDialog.showMsg("Xảy ra lỗi, vui lòng thử lại sau!");
                return;
            }
            _this.captchaId = res["id"];
            Utils.loadSpriteFrameFromBase64(res["img"], (sprFrame) => {
                _this.sprCaptcha.spriteFrame = sprFrame;
            });
        });
    }
}
