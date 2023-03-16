import ActUtils from "../../../scripts/common/ActUtils";
import App from "../../../scripts/common/App";
import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Node)
    btnInvite: cc.Node = null;
    @property(cc.Node)
    avatar: cc.Node = null;
    @property(cc.Node)
    cardReady: cc.Node = null;
    @property(cc.Node)
    cardReal: cc.Node = null;
    @property(cc.Label)
    userName: cc.Label = null;
    @property(cc.Label)
    userGold: cc.Label = null;
    @property(cc.Node)
    owner: cc.Node = null;
    @property(cc.Node)
    cardsName: cc.Node = null;
    @property(cc.Node)
    actionViewer: cc.Node = null;
    @property(cc.Node)
    actionThinking: cc.Node = null;
    @property(cc.Node)
    actionWin: cc.Node = null;
    @property(cc.Label)
    goldWin: cc.Label = null;
    @property(cc.Node)
    actionLose: cc.Node = null;
    @property(cc.Label)
    goldLose: cc.Label = null;
    @property(cc.Node)
    actionXepXong: cc.Node = null;
    @property(cc.Node)
    actionDangXep: cc.Node = null;
    @property(cc.Node)
    notify: cc.Node = null;
    @property(cc.Node)
    chatEmotion: cc.Node = null;
    @property(cc.Node)
    chatMsg: cc.Node = null;
    @property(cc.Node)
    shadowAvatar: cc.Node = null;
    @property(cc.SpriteFrame)
    spriteCardBack: cc.SpriteFrame = null;
    @property(cc.Node)
    actionGoldSoChi: cc.Node = null;

    @property(cc.Node)
    nodeAvatar: cc.Node = null;
    @property(cc.Node)
    nodeInfo: cc.Node = null;
    @property(cc.Node)
    nodeChat: cc.Node = null;
    @property(cc.Node)
    nodeCard: cc.Node = null;
    @property(cc.Node)
    nodeResult: cc.Node = null;
    @property(cc.Node)
    nodeAction: cc.Node = null;
    

    private timeoutNotify = null;
    private timeoutShowCardName = null;
    private timeoutChat = null;

    start() {

    }

    showChatEmotion(content) {
        this.nodeChat.active = true;
        this.chatEmotion.active = true;
        this.chatMsg.active = false;
        this.unschedule(this.timeoutChat);
        // this.chatEmotion.getComponent(sp.Skeleton).setAnimation(0, content, true); // hna comment
        this.chatEmotion.getComponent(sp.Skeleton).setAnimation(0, `emo_${content}`, true);
        this.timeoutChat = () => {
            this.chatEmotion.active = false;
            this.chatMsg.active = false;
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showChatMsg(content) {
        this.nodeChat.active = true;
        this.chatEmotion.active = false;
        this.chatMsg.active = true;
        this.unschedule(this.timeoutChat);
        this.chatMsg.children[1].getComponent(cc.Label).string = content;
        this.timeoutChat = () => {
            this.chatEmotion.active = false;
            this.chatMsg.active = false;
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showBtnInvite(state) {
        this.btnInvite.active = state;
    }

    setOwner(state) {
        this.owner.active = state;
    }

    setAvatar(avatar) {
        this.nodeAvatar.active = true;
        this.avatar.getComponent(cc.Sprite).spriteFrame = App.instance.getAvatarSpriteFrame(avatar);
    }

    setIsViewer(state) {
        this.shadowAvatar.active = state;
    }

    setName(data) {
        this.nodeInfo.active = true;
        this.userName.string = data;
    }

    scaleCardReal(state) {
        this.cardReal.scale = state;
    }

    showCardReady(state) {
        this.nodeCard.active = true;
        this.cardReady.active = state;
    }

    showCardReal(state) {
        this.nodeCard.active = true;
        this.scaleCardReal(1);
        this.cardReal.active = state;
    }

    prepareToTransform() {
        for (let index = 0; index < 13; index++) {
            this.prepareCardReal(index);
        }
    }

    prepareCardReal(pos) {
        this.cardReal.children[pos].runAction(cc.scaleTo(0, 0, 1));
    }

    transformToCardReal(cardPos, spriteCard, seatId) {
        this.nodeCard.active = true;
        this.cardReal.active = true;
        if (seatId == 0) {
            this.cardReal.children[cardPos].children[1].getComponent(cc.Sprite).spriteFrame = spriteCard;

            this.cardReady.children[cardPos].runAction(
                cc.sequence(
                    cc.scaleTo(0.15, 0, 1),
                    cc.callFunc(() => {

                    })
                )
            );
            this.cardReal.children[cardPos].runAction(
                cc.sequence(
                    cc.delayTime(0.15),  // 2
                    cc.scaleTo(0.15, 1, 1),
                    cc.callFunc(() => {

                    })
                )
            );
        } else {
            this.cardReal.children[cardPos].children[0].getComponent(cc.Sprite).spriteFrame = spriteCard;
            this.cardReal.children[cardPos].runAction(
                cc.sequence(
                    cc.scaleTo(0.15, 1, 1),
                    cc.callFunc(() => {

                    })
                )
            );
        }
    }

    showCardName(img) {
        this.cardsName.active = true;
        this.cardsName.getComponent(cc.Sprite).spriteFrame = img;
        clearTimeout(this.timeoutShowCardName);
        this.timeoutShowCardName = this.scheduleOnce(() => {
            this.cardsName.active = false;
        }, 4.5);
    }

    setGold(data) {
        // this.actionViewer.active = false;
        this.actionThinking.active = false;

        this.showGold(true);
        this.userGold.string = this.formatGold(data);
    }

    setCardReal(data, index) {
        this.cardReal.children[index].children[1].getComponent(cc.Sprite).spriteFrame = data;
    }

    showPlayCountdown() {
        this.nodeAction.active = true;
        this.actionThinking.active = true;
        this.processThinking(0);
        // 1 = Full | 0 = Empty
    }

    hidePlayCountdown() {
        this.actionThinking.active = false;
    }

    processThinking(rate) {
        cc.log("MauBinh_Player processThinking rate : ", rate);
        this.actionThinking.getComponent(cc.Sprite).fillRange = rate;
    }

    showGold(state) {
        this.nodeInfo.children[1].active = state;
    }

    prepareFxAction() {
        // this.showGold(false);
        this.nodeAction.active = true;
        this.resetAction();
    }

    // Fx Action
    playFxViewer() {
        this.prepareFxAction();
        this.actionViewer.active = true;
    }

    playFxDangXep() {
        this.prepareFxAction();
        this.actionDangXep.active = true;
        this.actionXepXong.active = false;
    }

    playFxXepXong() {
        this.prepareFxAction();
        this.actionDangXep.active = false;
        this.actionXepXong.active = true;
    }

    playFxSoChiTotal(bg, img) {
        this.nodeResult.active = true;
        this.nodeResult.children[3].active = true;
        this.nodeResult.children[3].children[0].getComponent(cc.Sprite).spriteFrame = bg;
        this.nodeResult.children[3].children[1].getComponent(cc.Sprite).spriteFrame = img;
        this.nodeResult.children[3].getComponent(cc.Animation).play();
    }

    playFxResultGeneral(seatId: number, typeBg: cc.SpriteFrame, typeText: cc.SpriteFrame, isSoChi: number) {
        this.nodeResult.active = true;
        this.nodeResult.children[3].active = true;
        if (seatId == 0) {
            this.nodeResult.children[3].y = isSoChi == 0 ? 0 : 90;
            this.nodeResult.children[3].scale = isSoChi == 0 ? 1 : 0.5;
        }

        this.nodeResult.children[3].children[0].getComponent(cc.Sprite).spriteFrame = typeBg;
        this.nodeResult.children[3].children[1].getComponent(cc.Sprite).spriteFrame = typeText;
        this.nodeResult.children[3].getComponent(cc.Animation).play();
    }

    playFxCompareChi(id, bg, img) {
        cc.log("MauBinh_Player playFxCompareChi id : ", id);
        this.nodeResult.active = true;
        this.nodeResult.children[id - 1].active = true;
        this.nodeResult.children[id - 1].children[0].getComponent(cc.Sprite).spriteFrame = bg;
        this.nodeResult.children[id - 1].children[1].getComponent(cc.Sprite).spriteFrame = img;
        this.nodeResult.children[id - 1].getComponent(cc.Animation).play();
    }

    playFxGoldSoChi(goldChi) {
        cc.log("MauBinh_Player playFxGoldSoChi goldChi : ", goldChi);
        if (goldChi >= 0) {
            this.actionGoldSoChi.active = true;
            this.actionGoldSoChi.children[1].getComponent(cc.Label).string = "+" + goldChi + " Chi";
        } else if (goldChi < 0) {
            this.actionGoldSoChi.active = true;
            this.actionGoldSoChi.children[1].getComponent(cc.Label).string = goldChi + " Chi";
        }
        this.scheduleOnce(() => {
            this.actionGoldSoChi.active = false;
        }, 2.5);
    }

    playFxWinSoChi(result) {
        cc.log("MauBinh_Player playFxWinSoChi result : ", result);
        this.nodeAction.active = true;
        this.actionWin.active = true;
        this.actionWin.children[1].active = true;
        this.goldWin.string = "+" + result + " Chi";
        this.scheduleOnce(() => {
            this.nodeAction.active = false;
        }, 2);
    }

    playFxLoseSoChi(result) {
        cc.log("MauBinh_Player playFxLoseSoChi result : ", result);
        this.nodeAction.active = true;
        this.actionLose.active = true;
        this.actionLose.children[1].active = true;
        this.goldLose.string = result + " Chi";
        this.scheduleOnce(() => {
            this.nodeAction.active = false;
        }, 2);
    }

    fxWin(playerInfo) {
        cc.log("MauBinh_Player playFxWin playerInfo : ", playerInfo);
        this.nodeAction.active = true;
        this.actionLose.active = false;
        this.actionWin.active = true;
        this.actionWin.children[1].active = true;
        this.goldWin.node.stopAllActions();
        this.fxGoldChange(0, playerInfo.moneyChange, this.goldWin.node);
        if (playerInfo.money != -1) {
            this.setGold(this.formatGold(playerInfo.money));
        }
        ActUtils.showWinEffect(this.actionWin, cc.callFunc(() => {}));
        this.scheduleOnce(() => {
            this.actionWin.active = false;
            this.nodeAction.active = false;
        }, 5);
    }

    fxLose(playerInfo) {
        cc.log("MauBinh_Player playFxLose playerInfo : ", playerInfo);
        this.nodeAction.active = true;
        this.actionWin.active = false;
        this.actionLose.active = true;
        this.actionLose.children[1].active = true;
        this.goldLose.node.stopAllActions();
        this.fxGoldChange(0, playerInfo.moneyChange, this.goldLose.node);
        if (playerInfo.money != -1) {
            this.setGold(this.formatGold(playerInfo.money));
        }
        ActUtils.showWinEffect(this.actionLose, cc.callFunc(() => {}));
        this.scheduleOnce(() => {
            this.actionLose.active = false;
            this.nodeAction.active = false;
        }, 5);
    }

    shadowCardReady(state) {
        for (let index = 0; index < 13; index++) {
            this.cardReady.children[index].color = state ? cc.Color.GRAY : cc.Color.WHITE;
        }
    }

    shadowCardReal(state) {
        for (let index = 0; index < 13; index++) {
            this.cardReal.children[index].children[0].color = state ? cc.Color.GRAY : cc.Color.WHITE;
        }
    }

    shadowCard(index, state) {
        this.cardReal.children[index].children[1].color = state ? cc.Color.GRAY : cc.Color.WHITE;
    }

    setCardWin(pos, state) {
        this.cardReal.children[pos].children[0].color = state ? cc.Color.WHITE : cc.Color.GRAY;
    }

    // notify
    showNotify(content) {
        this.notify.active = true;
        this.notify.children[1].getComponent(cc.Label).string = content;
        clearTimeout(this.timeoutNotify);
        this.timeoutNotify = setTimeout(() => {
            this.notify.active = false;
        }, 1500);
    }

    // reset
    resetResultGame() {
        for (let index = 0; index < 4; index++) {
            this.nodeResult.children[index].active = false;
        }
    }

    resetResultChi(chiId) {
        this.nodeResult.children[chiId - 1].active = false;
    }

    resetAction() {
        for (let index = 0; index < this.nodeAction.childrenCount; index++) {
            this.nodeAction.children[index].active = false;
        }
    }

    resetMatchHistory(seatId) {
        // card
        this.resetCardReady(seatId);
        this.resetCardReal(seatId);
        this.nodeCard.active = false;

        // Info
        this.showGold(true);
        this.cardsName.active = false;

        // Action
        this.resetAction();
    }

    resetCardReady(seatId) {
        if (seatId == 0) {
            for (let index = 0; index < 13; index++) {
                this.cardReady.children[index].scale = 1;
            }
        }
        this.cardReady.active = false;
        // this.shadowCardReady(false);
    }

    resetCardReal(seatId) {
        this.cardReal.active = false;
        for (let index = 0; index < 13; index++) {
            this.cardReal.children[index].children[seatId == 0 ? 1 : 0].getComponent(cc.Sprite).spriteFrame = this.spriteCardBack;
        }
        this.shadowCardReal(false);
    }

    resetPlayerInfo(seatId) {
        // Hide node Lv1
        for (let index = 0; index < this.node.childrenCount; index++) {
            this.node.children[index].active = false;
        }

        // reset card
        for (let index = 0; index < 13; index++) {
            this.cardReal.children[index].children[seatId == 0 ? 1 : 0].getComponent(cc.Sprite).spriteFrame = this.spriteCardBack;
        }

        this.cardReady.active = false;
        this.cardReal.active = false;

        this.cardsName.active = false;

        // reset Action
        this.actionViewer.active = false;
        this.actionThinking.active = false;
        this.actionWin.active = false;
        this.actionLose.active = false;

        // reset Viewer
        this.setIsViewer(true);
    }

    fxGoldChange(goldStart, goldEnd, node) {
        var goldAdd = goldEnd - goldStart;
        node.getComponent(cc.Label).string = this.formatGold(goldStart);

        var steps = 10;
        var deltaGoldAdd = Math.floor(goldAdd / steps);

        var rep = cc.repeat(
            cc.sequence(
                cc.delayTime(0.05),
                cc.callFunc(() => {
                    goldStart += deltaGoldAdd;
                    node.getComponent(cc.Label).string = (goldAdd > 0 ? "+" : "") + this.formatGold(goldStart);
                }),
            ), steps);
        var seq = cc.sequence(rep, cc.callFunc(() => {
            goldStart = goldEnd;
            node.getComponent(cc.Label).string = (goldAdd > 0 ? "+" : "") + this.formatGold(goldStart);
        }));
        node.runAction(seq);
    }

    formatGold(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // update (dt) {}
}
