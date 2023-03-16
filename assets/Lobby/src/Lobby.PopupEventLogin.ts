import Dialog from "../../scripts/common/Dialog";
import Configs from "../../scripts/common/Configs";
import App from "../../scripts/common/App";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupEventLogin extends Dialog {

    private static instance: PopupEventLogin = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupEventLogin", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupEventLogin);
                    this.instance.show();
                });
            } else {
                this.instance.show();
            }
        }
    }

    public actOpen() {
        App.instance.openTelegram(Configs.App.getLinkTelegram());
    }
}
