import Dialog from "../../scripts/common/Dialog";
import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import { NativeBridge } from "../../scripts/common/NativeBridge";
import FacebookTracking from "../../scripts/common/FacebookTracking";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupUpdateNickname extends Dialog {

    private static instance: PopupUpdateNickname = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node, username: string = null, password: string = null) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupUpdateNickname", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupUpdateNickname);
                    if (username != null || password != null) {
                        this.instance.show2(username, password);
                    } else {
                        this.instance.show();
                    }
                });
            } else {
                if (username != null || password != null) {
                    this.instance.show2(username, password);
                } else {
                    this.instance.show();
                }
            }
        }
    }

    @property(cc.EditBox)
    edbNickname: cc.EditBox = null;

    private username: string = "";
    private password: string = "";

    show() {
        super.show();
        this.edbNickname.string = "";
    }

    show2(username: string, password: string) {
        this.show();
        this.username = username;
        this.password = password;
    }

    public actUpdate() {
        let _this = this;
        let nickname = this.edbNickname.string.trim();

        if (nickname.length == 0) {
            App.instance.alertDialog.showMsg("Tên hiển thị không được để trống.");
            return;
        }

        let params = {};
        if(!Configs.Login.IsLoginFB) {
            params = { "c": 5, "un": _this.username, "pw": md5(_this.password), "nn": nickname };
        } else {
            params = { "c": 5, "un": "", "pw": "", "nn": nickname, "appid": NativeBridge.getPackageName(), "s": "fb" };
        }

        App.instance.showLoading(true);
        Http.get(Configs.App.API, params, (err, res) => {
            App.instance.showLoading(false);
            if (err != null) {
                App.instance.alertDialog.showMsg("Xảy ra lỗi, vui lòng thử lại sau!");
                return;
            }
            // console.log(res);
            if (!res["success"]) {
                switch (parseInt(res["errorCode"])) {
                    case 1001:
                        App.instance.alertDialog.showMsg("Mất kết nối đến Server!");
                        break;
                    case 1005:
                        App.instance.alertDialog.showMsg("Tài khoản không tồn tại.");
                        break;
                    case 1007:
                        App.instance.alertDialog.showMsg("Mật khẩu không chính xác.");
                        break;
                    case 1109:
                        App.instance.alertDialog.showMsg("Tài khoản đã bị khóa.");
                        break;
                    case 106:
                        App.instance.alertDialog.showMsg("Tên hiển thị không hợp lệ.");
                        break;
                    case 1010:
                    case 1013:
                        App.instance.alertDialog.showMsg("Tên hiển thị đã tồn tại.");
                        break;
                    case 1011:
                        App.instance.alertDialog.showMsg("Tên hiển thị khôn được trùng với tên đăng nhập.");
                        break;
                    case 116:
                        App.instance.alertDialog.showMsg("Không chọn tên hiển thị nhạy cảm.");
                        break;
                    case 1114:
                        App.instance.alertDialog.showMsg("Hệ thống đang bảo trì. Vui lòng quay trở lại sau!");
                        break;
                    default:
                        App.instance.alertDialog.showMsg("Xảy ra lỗi, vui lòng thử lại sau!");
                        break;
                }
                return;
            }
            _this.dismiss();

            res["username"] = _this.username;
            res["password"] = _this.password;
            BroadcastReceiver.send(BroadcastReceiver.UPDATE_NICKNAME_SUCCESS, res);
            
            FacebookTracking.logRegisterSuccess();
        });
    }
}
