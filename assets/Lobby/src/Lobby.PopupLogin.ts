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
export default class PopupLogin extends Dialog {

    private static instance: PopupLogin = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupLogin", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupLogin);
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
    edbCaptcha: cc.EditBox = null;
    @property(cc.Sprite)
    sprCaptcha: cc.Sprite = null;

    private captchaId: string = "";

    show() {
        super.show();
        this.refreshCaptcha();
    }

    public actLogin() {
        let username = this.edbUsername.string.trim();
        let password = this.edbPassword.string;

        if (username.length == 0) {
            App.instance.alertDialog.showMsg("Tên đăng nhập không được để trống.");
            return;
        }

        if (password.length == 0) {
            App.instance.alertDialog.showMsg("Mật khẩu không được để trống.");
            return;
        }

        App.instance.showLoading(true);
        Http.get(Configs.App.API, { c: 3, un: username, pw: md5(password), "utm_campaign": NativeBridge.getPackageName(), "utm_medium": NativeBridge.getPackageName() }, (err, res) => {
            LobbyController.instance.onLogin(err, res, username, password);
            if (err == null && res && parseInt(res["errorCode"]) == 0) {
                FacebookTracking.logLoginBtn();
                this.dismiss();
            }
        });

        Configs.Login.IsLoginFB = false;
        FacebookTracking.logHitLoginButton();
    }

    public actRegister() {
        console.log("open register");
        this.dismiss();
        LobbyController.instance.actRegister();
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
