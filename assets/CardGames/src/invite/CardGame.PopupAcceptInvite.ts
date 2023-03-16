import App from "../../../scripts/common/App";
import Configs from "../../../scripts/common/Configs";
// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import Dialog from "../../../scripts/common/Dialog";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import Utils from "../../../scripts/common/Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupAcceptInvite extends Dialog {
    @property(cc.Label)
    user: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    title: cc.Label = null;

    public static instance: PopupAcceptInvite;
    private static initing: boolean = false;

    public static createAndShow(parent: cc.Node, onShow: Function = () => {}, name: string = "") {
        if(Configs.Login.isMuteInvite)
            return;

        if (!PopupAcceptInvite.initing) {
            if (PopupAcceptInvite.instance == null || this.instance.node == null) {
                PopupAcceptInvite.initing = true;
                App.instance.loadPrefab("cardgame/PopupAcceptInvite", (err, prefab) => {
                    PopupAcceptInvite.initing = false;
                    if (err != null) {
                        App.instance.alertDialog.showMsg(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    PopupAcceptInvite.instance = go.getComponent(PopupAcceptInvite);
                    PopupAcceptInvite.instance.show();
                    PopupAcceptInvite.instance.setName(name);
                    onShow();
                });
            } else {
                PopupAcceptInvite.instance.node.parent = parent;
                PopupAcceptInvite.instance.show();
                onShow();
            }
        }
    }

    private listener: Function = null;

    public reloadData(user: string, bet: number) {
        this.user.string = user;
        this.bet.string = Utils.formatNumber(bet);
    }

    setName(name: string) {
        this.title.string = name;
    }

    onBtnCancelClick() {
        PopupAcceptInvite.instance.dismiss();
    }

    onBtnCacelAll() {
        Configs.Login.isMuteInvite = true;
        PopupAcceptInvite.instance.dismiss();

        FacebookTracking.logInviteCancelRoom();
    }

    onBtnGoClick() {
        if(this.listener)
            this.listener();

        PopupAcceptInvite.instance.dismiss();

        FacebookTracking.logInviteAcceptRoom();
    }

    public setListener(listener: () => void) {
        this.listener = listener;
    }
}
