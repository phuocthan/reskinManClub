import SamPlayer from "./Sam.Player"
import SamCmd from "./Sam.Cmd";
import Room from "./Sam.Room";
import SamNetworkClient from "../../../../scripts/networks/SamNetworkClient";
import InGame from "../../src/TienLen.InGame";
import SamHelper from "./Sam.Helper";
import PopupAcceptInvite from "../../../../CardGames/src/invite/CardGame.PopupAcceptInvite";
import CardGameCmd from "../../../../scripts/networks/CardGame.Cmd";
import Configs from "../../../../scripts/common/Configs";
import CardGame_BickerController from "../../../../CardGames/src/popupBicker/CardGame.BickerController";

const {ccclass, property} = cc._decorator;

@ccclass
export default class SamInGame extends InGame {
    public static instance: SamInGame = null;

    public static readonly TYPE_BAO_SAM = 2;
    public static readonly TYPE_CHAN_SAM = 3;

    @property({
        type: SamPlayer,
        override: true
    })
    players: SamPlayer[] = [];

    onLoad () {
        SamInGame.instance = this;
        this.initRes();
    }

    actLeaveRoom() {
        SamNetworkClient.getInstance().send(new SamCmd.SendRequestLeaveGame());

        if(this.isPlaying) {
            this.showToast("Vui lòng chờ hết ván để thoát game!");
        } else {
            this.showToast("Đã đăng ký rời bàn");
        }
    }
 
    userLeaveRoom(data) {
        var chair = this.convertChair(data.chair);
        this.players[chair].setLeaveRoom();
        if (chair == 0) {
            this.show(false);
            Room.instance.show(true);
            Room.instance.refreshRoom();

            this.bickerPopup.removeAllChildren(true);
            this.bickerCanon.removeAllChildren(true);
        } else {
            CardGame_BickerController.getInstance().isNeedHide(chair);
        }
    }

    chiaBai(data) {
        super.chiaBai(data);
        this.setActiveButtons(["bt_sam", "bt_huy_sam"], [true, true]);
        this.players.forEach(p => {
            if (p.active)
                p.setTimeRemain(data.timeBaoSam);
        });
    }

    sendSubmitTurn(cardSelected) {
        SamNetworkClient.getInstance().send(new SamCmd.SendDanhBai(!1, cardSelected));
    }

    sendPassTurn() {
        SamNetworkClient.getInstance().send(new SamCmd.SendBoLuot(!0));
    }

    actBaoSam() {
        SamNetworkClient.getInstance().send(new SamCmd.SendBaoSam());
    }

    actHuyBaoSam() {
        SamNetworkClient.getInstance().send(new SamCmd.SendHuyBaoSam());
    }

    onBaoSam(data) {
        var chair = this.convertChair(data.chair);
        var p = this.players[chair];
        p.setTimeRemain(0);
        p.setStatus("BÁO SÂM");
        if (data.chair == this.myChair)
            this.setActiveButtons(["bt_sam", "bt_huy_sam"], [false, false]);
    }

    onHuyBaoSam(data) {
        var chair = this.convertChair(data.chair);
        var p = this.players[chair];
        p.setTimeRemain(0);
        p.setStatus("HUỶ SÂM");
        if (data.chair == this.myChair)
            this.setActiveButtons(["bt_sam", "bt_huy_sam"], [false, false]);
    }

    onQuyetDinhSam(data) {
        this.setActiveButtons(["bt_sam", "bt_huy_sam"], [false, false]);
        if (data.isSam) {
            var chair = this.convertChair(data.chair);
            var p = this.players[chair];
            if (p.active)
                this.showToast(p.info.nickName + " được quyền báo sâm");
        }
    }

    getNetWorkClient() {
        return SamNetworkClient.getInstance();
    }

    getGameId() {
        return Configs.GameId.Sam;
    }

    getMaxPlayer() {
        return 4;
    }

    showEffect(cards: number[], type: number = null) {
        if(this.effect) {
            let isShowEffect = false;
            this.effect.active = true;

            if(type) {
                if(type == SamInGame.TYPE_BAO_SAM) {
                    this.effect.getComponentInChildren(cc.Sprite).spriteFrame = this.effectSpriteFrames[0];
                    isShowEffect = true;
                } 
                if(type == SamInGame.TYPE_CHAN_SAM) {
                    this.effect.getComponentInChildren(cc.Sprite).spriteFrame = this.effectSpriteFrames[1];
                    isShowEffect = true;
                } 
                if(type == SamInGame.TYPE_TOI_TRANG) {
                    this.effect.getComponentInChildren(cc.Sprite).spriteFrame = this.effectSpriteFrames[2];
                    isShowEffect = true;
                } 
            } else {
                if(SamHelper.kiemTraTuQuy(cards)) {
                    this.effect.getComponentInChildren(cc.Sprite).spriteFrame = this.effectSpriteFrames[3];
                    isShowEffect = true;
                }
            }           

            let schedule = () => {
                if(this.effect) {
                    this.effect.getComponentInChildren(cc.Sprite).spriteFrame = null;
                    this.effect.stopAllActions();
                    this.effect.active = false;
                }
            }

            console.log("TienLenHelper " + JSON.stringify(cards) + " : " + isShowEffect);
            this.unschedule(schedule);
            this.effect.stopAllActions();
            this.effect.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.2), cc.scaleTo(0.3, 1))))

            if(isShowEffect) {
                this.scheduleOnce(schedule, 3);
            } else {
                this.effect.stopAllActions();
                this.effect.active = false;
            }
        }
    }

    showPopupAcceptInvite(acceptData: CardGameCmd.ReceivedInvite) {
        PopupAcceptInvite.createAndShow(this.popups, () => {
            PopupAcceptInvite.instance.reloadData(acceptData.inviter, acceptData.bet);

            PopupAcceptInvite.instance.setListener(() => {
                this.getNetWorkClient().send(new CardGameCmd.SendAcceptInvite(acceptData.inviter));
            });
        }, "Sâm Lốc");
    }
}
