import Dialog from "../../scripts/common/Dialog";
import App from "../../scripts/common/App";
import Utils from "../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupCardInfo extends Dialog {

    private static instance: PopupCardInfo = null;
    private static initing: boolean = false;
    public static createAndShow(parent: cc.Node, telco: string, amount: string, code: string, serial: string) {
        if (!this.initing) {
            if (this.instance == null || this.instance.node == null) {
                this.initing = true;
                App.instance.loadPrefab("Lobby/PopupCardInfo", (err, prefab) => {
                    this.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    this.instance = go.getComponent(PopupCardInfo);
                    this.instance.show(telco, amount, code, serial);
                });
            } else {
                this.instance.show(telco, amount, code, serial);
            }
        }
    }

    @property(cc.Label)
    lblTelco: cc.Label = null;
    @property(cc.Label)
    lblAmount: cc.Label = null;
    @property(cc.EditBox)
    edbCode: cc.EditBox = null;
    @property(cc.EditBox)
    edbSerial: cc.EditBox = null;

    private code = "";
    private serial = "";

    start() {
        this.edbCode.node.on("editing-did-ended", () => {
            this.edbCode.string = this.code;
        });
        this.edbSerial.node.on("editing-did-ended", () => {
            this.edbSerial.string = this.serial;
        });
    }

    show(telco: string = "", amount: string = "", code: string = "", serial: string = "") {
        super.show();
        this.code = code;
        this.serial = serial;

        this.lblTelco.string = telco;
        this.lblAmount.string = Utils.formatNumber(Number(amount));
        this.edbCode.string = code;
        this.edbSerial.string = serial;
    }
}
