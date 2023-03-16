import Utils from "../../../scripts/common/Utils";
import App from "../../../scripts/common/App";
import Res from "./TienLen.Res";
import Card from "./TienLen.Card";
import Configs from "../../../scripts/common/Configs";
import ActUtils from "../../../scripts/common/ActUtils";
import Sticker from "../../../scripts/customui/CustomUI.Sticker";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Player extends cc.Component {
    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Sprite)
    avatar: cc.Sprite = null;
    @property(cc.Sprite)
    card: cc.Sprite = null;
    @property(cc.Label)
    lblCardRemain: cc.Label = null;
    @property(cc.Sprite)
    timeRemain: cc.Sprite = null;
    @property(cc.Label)
    lbStatus: cc.Label = null;
    @property(cc.Node)
    cardLine: cc.Node = null;
    @property(cc.Node)
    chatEmotion: cc.Node = null;
    @property(cc.Node)
    chatMsg: cc.Node = null;
    @property(cc.Node)
    animThang: cc.Node = null;
    @property(cc.Node)
    animThua: cc.Node = null;
    @property(cc.Label)
    lblCoinChange: cc.Label = null;
    @property(cc.Node)
    owner: cc.Node = null;
    @property(cc.Node)
    watching: cc.Node = null;
    @property(cc.Prefab)
    stickerPrb: cc.Prefab = null;
    @property(cc.Node)
    chatSticker: cc.Node = null;

    private timeoutChat = null;

    ingame = false;
    active = false;
    chairLocal = -1;
    chairInServer = -1;
    type = 1;
    cards = [];
    state = 0;
    status = -1;
    info = null;

    runRemain = null;

    private sticker: Sticker = null;

    onLoad() {
        let sticker = cc.instantiate(this.stickerPrb);
        this.chatSticker.addChild(sticker);
        this.sticker = sticker.getComponent(Sticker);
    }

    setPlayerInfo(info) {
        this.lblNickname.string = info.nickName;
        this.setCoin(info.money);
        console.log("TienLenAvatar " + info.avatar);
        if(info.nickName == Configs.Login.Nickname) {
            this.avatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
        } else {
            this.avatar.spriteFrame = App.instance.getAvatarSpriteFrame(info.avatar);
        }
        this.avatar.node.setContentSize(Configs.App.AVATAR_SIZE_TLMN);
        this.node.active = true;

        this.active = true;
        this.info = info;
    }

    setOwner(isOwner: boolean) {
        this.owner.active = isOwner;
    }

    setFirstCard(index) {
        this.card.spriteFrame = Res.getInstance().getCardFace(index);
        this.card.node.active = true;
        this.card.node.children[0].active = false;
        this.lblCardRemain.node.active = false;
    }

    offFirstCard() {
        this.card.node.active = false;
        this.card.spriteFrame = Res.getInstance().getCardFace(52);
        this.card.node.children[0].active = false;
        this.lblCardRemain.node.active = false;
    }

    setCardRemain(cardSize) {
        if (cardSize == 0) {
            this.card.node.active = false;
            return;
        }
        this.card.node.active = true;
        this.card.spriteFrame = Res.getInstance().getCardFace(52);
        this.card.node.children[0].active = true;
        this.lblCardRemain.node.active = true;
        this.lblCardRemain.string = cardSize;
    }

    setTimeRemain(remain = 0) {
        if (remain === 0) {
            clearInterval(this.runRemain);
            this.timeRemain.fillRange = 0;
            this.timeRemain.node.parent.active = false;
            return;
        } else {
            var refresh = 100;
            var step = refresh / remain / 1000;
            var sefl = this;
            var change = function() {
                if (!sefl || !sefl.timeRemain)
                    return;
                if (sefl.timeRemain.fillRange <= 0) {
                    clearInterval(sefl.runRemain);
                    sefl.timeRemain.fillRange = 0;
                    sefl.timeRemain.node.parent.active = false;
                    return;
                }
                sefl.timeRemain.fillRange -= step;
            }
            this.timeRemain.fillRange = 1;
            this.runRemain = setInterval(change, refresh);
            this.timeRemain.node.parent.active = true;
        }
    }

    setStatus(status) {
        if(!status)
            return;

        var stt = status.toUpperCase();
        this.lbStatus.string = stt;

        this.lbStatus.unscheduleAllCallbacks();
        this.lbStatus.scheduleOnce(() => {
            this.lbStatus.string = "";
        }, 2.5);
    }

    setWatching() {
        this.watching.active = true;
    }

    unsetWatching() {
        this.watching.active = false;
    }

    setStatusWin() { 
        let origin = this.lblCoinChange.node.position;
        this.lblCoinChange.node.opacity = 0;
        this.lblCoinChange.node.y = origin.y - 150;

        this.lblCoinChange.node.active = true;
        this.lblCoinChange.node.runAction(cc.spawn(
            cc.fadeIn(0.6),
            cc.moveTo(0.6, origin) 
        ));
    }

    setCoin(coin) {
        this.lblCoin.string = Utils.formatNumber(coin);
    }

    setCoinChange(change) {
        console.log("setCoinChange: " + change);

        if (change == 0)
            return;
        else if (change > 0) {
            this.lblCoinChange.string = "+" + Utils.formatNumber(change);
            this.setStatusWin();
         } else {
            this.lblCoinChange.string = Utils.formatNumber(change);
            this.setStatusWin();
         }
    }

    setAnimThangThua(change) {
        if (change == 0)
            return;
        else if (change > 0) {
            this.showAnimThang(change);
         } else {
            this.showAnimThua(change);
         }
    }

    setLeaveRoom() {
        this.node.active = false;
        this.active = false;
        this.info = null;
    }

    setCardLine(cards) {
        cards.forEach(card => {
            var item = cc.instantiate(Res.getInstance().getCardItem());
            item.parent = this.cardLine;
            item.removeComponent(cc.Button);
            item.getComponent(Card).setCardData(card);
        });
    }

    clearCardLine() {
        this.cardLine.removeAllChildren();
    }

    showChatMsg(content) {
        this.chatSticker.active = false;
        this.chatEmotion.active = false;
        this.chatMsg.active = true;
        this.unschedule(this.timeoutChat);
        this.chatMsg.children[1].getComponent(cc.Label).string = content;
        this.timeoutChat = (() => {
            this.chatEmotion.active = false;
            this.chatMsg.active = false;
            this.chatSticker.active = false;
        });
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showChatEmotion(content) {
        this.chatSticker.active = false;
        this.chatEmotion.active = true;
        this.chatMsg.active = false;
        this.unschedule(this.timeoutChat);
        this.chatEmotion.getComponent(sp.Skeleton).setAnimation(0, `emo_${content}`, true);
        this.timeoutChat = () => {
            this.chatEmotion.active = false;
            this.chatMsg.active = false;
            this.chatSticker.active = false;
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showChatSticker(content) {
        this.chatSticker.active = true;
        this.chatEmotion.active = false;
        this.chatMsg.active = false;
        this.unschedule(this.timeoutChat);
        this.sticker.setSticker(content);
        this.timeoutChat = () => {
            this.chatEmotion.active = false;
            this.chatMsg.active = false;
            this.chatSticker.active = false;
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showAnimThang(money: number) {
        if(this.animThang) {
            this.animThang.active = true;
            this.animThang.getComponentInChildren(cc.Label).string = "+" + Utils.formatNumber(money);
            ActUtils.showWinEffect(this.animThang, cc.callFunc(() => {
                this.animThang.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.35, 1.1), cc.scaleTo(0.25, 1))));
            }))
        }
    }

    showAnimThua(money: number) {
        if(this.animThua) {
            this.animThua.active = true;
            this.animThua.getComponentInChildren(cc.Label).string = "" + Utils.formatNumber(money);
            ActUtils.showWinEffect(this.animThua, cc.callFunc(() => {
                this.animThua.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.35, 1.1), cc.scaleTo(0.25, 1))));
            }))
        }
    }

    cleanAnimThangThua() {
        if(this.animThang) {
            this.animThang.stopAllActions();
            this.animThang.active = false;
        }

        if(this.animThua) {
            this.animThua.stopAllActions();
            this.animThua.active = false;
        }
    }

    cleanLabelCoinChange() {
        if(this.lblCoinChange) {
            this.lblCoinChange.node.active = false;
        }
    }
}


