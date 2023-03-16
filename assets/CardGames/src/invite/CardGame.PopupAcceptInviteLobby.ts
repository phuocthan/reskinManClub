import App from "../../../scripts/common/App";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
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
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupAcceptInviteLobby extends Dialog {
    @property(cc.Label)
    user: cc.Label = null;

    @property(cc.Label)
    bet: cc.Label = null;

    @property(cc.Label)
    title: cc.Label = null;

    public static instance: PopupAcceptInviteLobby;
    private static initing: boolean = false;

    public static createAndShow(parent: cc.Node, onShow: Function = () => {}, name: string = "") {
        if(Configs.Login.isMuteInvite)
            return;

        if (!PopupAcceptInviteLobby.initing) {
            if (PopupAcceptInviteLobby.instance == null || this.instance.node == null) {
                PopupAcceptInviteLobby.initing = true;
                App.instance.loadPrefab("cardgame/PopupAcceptInviteLobby", (err, prefab) => {
                    PopupAcceptInviteLobby.initing = false;
                    if (err != null) {
                        App.instance.showToast(err);
                        return;
                    }
                    let go = cc.instantiate(prefab);
                    go.parent = parent;
                    PopupAcceptInviteLobby.instance = go.getComponent(PopupAcceptInviteLobby);
                    PopupAcceptInviteLobby.instance.show();
                    PopupAcceptInviteLobby.instance.setName(name);
                    onShow();
                });
            } else {
                PopupAcceptInviteLobby.instance.show();
                onShow();
            }
        }
    }

    res: CardGameCmd.ReceivedInvite = null;

    public reloadData(res: CardGameCmd.ReceivedInvite) {
        console.log("resssssssssssss##########", res)
        this.res = res;
        this.user.string = res.inviter;
        this.bet.string = Utils.formatNumber(res.bet);

        FacebookTracking.logInviteShowLobby();
    }

    setName(name: string) {
        this.title.string = name;
    }

    onBtnCancelClick() {
        this.clear();

        FacebookTracking.logInviteCloseLobby();
    }

    onBtnCacelAll() {
        Configs.Login.isMuteInvite = true;
        this.clear();

        BroadcastReceiver.send(BroadcastReceiver.ON_MUTE_INVITE);

        FacebookTracking.logInviteCancelLobby();
    }

    onBtnGoClick() {
        BroadcastReceiver.send(BroadcastReceiver.ON_GO_INVITE, this.res);

        this.clear();
        FacebookTracking.logInviteAcceptLobby();
    }

    clear() {
        PopupAcceptInviteLobby.instance.dismiss();
    }
}
