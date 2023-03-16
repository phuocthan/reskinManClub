// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import PopupAcceptInviteLobby from "../../CardGames/src/invite/CardGame.PopupAcceptInviteLobby";
import App from "../../scripts/common/App";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import Configs from "../../scripts/common/Configs";
import FacebookTracking from "../../scripts/common/FacebookTracking";
import CardGameCmd from "../../scripts/networks/CardGame.Cmd";
import InPacket from "../../scripts/networks/Network.InPacket";
import TienLenNetworkClient from "../../scripts/networks/TienLenNetworkClient";
import LobbyController from "./Lobby.LobbyController";

const {ccclass, property} = cc._decorator;

class Queue<T> {
    _store: T[] = [];
    push(val: T) {
        this._store.push(val);
    }
    pop(): T | undefined {
      return this._store.shift();
    }
    isEmpty(): boolean {
        return this._store.length == 0;
    }
    size(): number {
        return this._store.length;
    }
    clear() {
        this._store = [];
    }
    first(): T {
        return this._store[0];
    }
    check(t: T): boolean {
        return this._store.indexOf(t) >= 0;
    }
}

@ccclass
export default class HandleInvite extends cc.Component {
    @property(cc.Node)
    popupAccepInvite: cc.Node = null;
    @property(cc.Button)
    btnInviter: cc.Button = null;
    @property(cc.Node)
    bobble: cc.Node = null;
    @property(cc.Label)
    inviteCount: cc.Label = null;
    @property(sp.Skeleton)
    spineInvite: sp.Skeleton = null;

    private inviteQueue: Queue<Function> = new Queue();
    private isBlockInvite: boolean = false;
    private target = null;
    private lastInviter: string = "";

    start() {
        BroadcastReceiver.register(BroadcastReceiver.ON_ENTER_GAME_SCENE, (data) => {
            if(data.sceneName != "TienLen" && TienLenNetworkClient.getInstance().isConnected()) {
                TienLenNetworkClient.getInstance().close();
            }
            this.clearInviteQueue(); 
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_LEAVE_GAME_SCENE, (data) => {
            if(data.sceneName == "Lobby" && Configs.Login.IsLogin && !Configs.Login.isMuteInvite) {
                TienLenNetworkClient.getInstance().checkConnect(() => {});
            }
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_MUTE_INVITE, () => {
            this.clearInviteQueue();
            if(TienLenNetworkClient.getInstance().isConnected()) {
                TienLenNetworkClient.getInstance().close();
            }
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_GO_INVITE, (data: CardGameCmd.ReceivedInvite) => {
            this.clearInviteQueue();
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, () => {
            this.clearInviteQueue();
        }, this);

        this.btnInviter.node.x = -Configs.App.DEVICE_RESOLUTION.width/2 + 110;
        this.btnInviter.node.on(cc.Node.EventType.TOUCH_START, () => {
        });
        this.btnInviter.node.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            this.btnInviter.node.x += event.getDeltaX();
            this.btnInviter.node.y += event.getDeltaY();
        });
        this.btnInviter.node.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            this.showInviteInQueue();
        });

        this.schedule(() => {
            if(this.target) {
                if(this.inviteQueue.check(this.target)) {
                    this.inviteQueue.pop();
                    this.updateInviteCount();
                }
            }
            if(this.inviteQueue.size() > 0) {
                this.target = this.inviteQueue.first();
            }
        }, 7, cc.macro.REPEAT_FOREVER);

        this.updateInviteCount();

        TienLenNetworkClient.getInstance().addListener((data) => {
            let inPacket = new InPacket(data);
            switch (inPacket.getCmdId()) {
                case CardGameCmd.Code.INVITE: {
                    let res = new CardGameCmd.ReceivedInvite(data);
                    this.onInvite(res);
                    break;
                }
            }
        }, this);
    }

    public onInvite(res: CardGameCmd.ReceivedInvite) {
        if(res.inviter == this.lastInviter) {
            return;
        }

        let onShowAcceptInvite = () => {
            PopupAcceptInviteLobby.instance.reloadData(res);
        }

        if(this.node && this.node.activeInHierarchy && Configs.Login.IsLogin) {
            if(!App.instance.checkPopupOpen() && !App.instance.checkMiniGameOpen() && !LobbyController.instance.checkPopupOpen() && !this.isBlockInvite) {
                PopupAcceptInviteLobby.createAndShow(this.popupAccepInvite, onShowAcceptInvite, "Tiến Lên Miền Nam");

                this.isBlockInvite = true;
                this.scheduleOnce(() => {
                    this.isBlockInvite = false;
                }, 4);

                this.lastInviter = res.inviter;
            } else {
                if(this.inviteQueue.size() > 2) {
                    this.clearInviteQueue();
                }

                this.inviteQueue.push(onShowAcceptInvite);
                this.updateInviteCount();
                this.notifyNewInvite();
            }
        }
    }

    updateInviteCount() {
        let inviteCountValue = this.inviteQueue.size();
        this.inviteCount.string = "" + inviteCountValue;

        if(inviteCountValue == 0) {
            this.spineInvite.setAnimation(0, "thachdau_bt", true);
            this.btnInviter.node.active = false;
        } else {
            this.spineInvite.setAnimation(0, "thachdau_active", true);
            this.btnInviter.node.active = true;
        }
    }

    showInviteInQueue() {
        if(!this.inviteQueue.isEmpty()) {
            let inviteOnShow = this.inviteQueue.pop();
            this.updateInviteCount();
            PopupAcceptInviteLobby.createAndShow(this.popupAccepInvite, inviteOnShow, "Tiến Lên Miền Nam");

            this.isBlockInvite = true;
            this.scheduleOnce(() => {
                this.isBlockInvite = false;
            }, 3);

            FacebookTracking.logInviteNotifyClick();
        } else {
            App.instance.showToast("Bạn chưa có lời mời chơi nào");
        }
    }

    clearInviteQueue() {
        this.inviteQueue.clear();
        this.updateInviteCount();
    }

    notifyNewInvite() {
        this.bobble.active = true;
        this.btnInviter.unscheduleAllCallbacks();
        this.btnInviter.scheduleOnce(() => {
            this.hideNotifyNewInvite();
        }, 2);

        FacebookTracking.logInviteNotify();
    }

    hideNotifyNewInvite() {
        this.bobble.active = false;
    }
}
