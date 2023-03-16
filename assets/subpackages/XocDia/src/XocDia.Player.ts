import ActUtils from "../../../scripts/common/ActUtils";
import App from "../../../scripts/common/App";
import Utils from "../../../scripts/common/Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Player extends cc.Component {

    @property(cc.Button)
    btnInvite: cc.Button = null;
    @property(cc.Node)
    info: cc.Node = null;

    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Sprite)
    sprAvatar: cc.Sprite = null;
    @property(cc.Node)
    winCoin: cc.Node = null;
    @property(cc.Node)
    refundCoin: cc.Node = null;
    @property(cc.Node)
    chipsPoint: cc.Node = null;
    @property(cc.Node)
    chipsPoint2: cc.Node = null;
    @property(cc.Node)
    banker: cc.Node = null;

    @property(cc.Node)
    chatEmotion: cc.Node = null;
    @property(cc.Node)
    chatMsg: cc.Node = null;

    private timeoutChat = null;

    public nickname: string = "";
    public avatar: string = "";

    public leave() {
        this.nickname = "";

        if (this.btnInvite) this.btnInvite.node.active = true;
        if (this.info) this.info.active = false;
        this.winCoin.active = false;
        this.refundCoin.active = false;
        this.banker.active = false;
        this.unscheduleAllCallbacks();
    }

    public set(nickname: string, avatar: string, coin: number, isBanker: boolean) {
        this.nickname = nickname;
        this.lblNickname.string = nickname;
        this.sprAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(avatar);
        this.setCoin(coin);
        this.banker.active = isBanker;

        if (this.btnInvite) this.btnInvite.node.active = false;
        if (this.info) this.info.active = true;
    }

    public setCoin(coin: number) {
        this.lblCoin.string = Utils.formatNumber(coin);
    }

    public showWinCoin(coin: number) {
        this.winCoin.active = true;
        ActUtils.showWinEffect(this.winCoin, cc.callFunc(() => {}));

        this.winCoin.getComponentInChildren(cc.Label).string = (coin >= 0 ? "+" : "") + Utils.formatNumber(coin);
        this.scheduleOnce(() => {
            this.winCoin.active = false;
        }, 5);
    }

    public showRefundCoin(coin: number) {
        this.refundCoin.active = true;
        this.refundCoin.getComponentInChildren(cc.Label).string = (coin >= 0 ? "+" : "") + Utils.formatNumber(coin);
        this.scheduleOnce(() => {
            this.refundCoin.active = false;
        }, 4);
    }

    showChatEmotion(content) {
        this.node.children[3].active = true;
        this.chatEmotion.active = true;
        this.chatMsg.active = false;
        this.unschedule(this.timeoutChat);
        // this.chatEmotion.getComponent(sp.Skeleton).setAnimation(0, content, true); // hna comment
        this.chatEmotion.getComponent(sp.Skeleton).setAnimation(0, `emo_${content}`, true);
        this.timeoutChat = () => {
            if(this.chatEmotion && this.chatMsg) {
                this.chatEmotion.active = false;
                this.chatMsg.active = false;
            }
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }

    showChatMsg(content) {
        this.node.children[3].active = true;
        this.chatEmotion.active = false;
        this.chatMsg.active = true;
        this.unschedule(this.timeoutChat);
        this.chatMsg.children[1].getComponent(cc.Label).string = content;
        this.timeoutChat = () => {
            if(this.chatEmotion && this.chatMsg) {
                this.chatEmotion.active = false;
                this.chatMsg.active = false;
            }
        };
        this.scheduleOnce(this.timeoutChat, 3);
    }
}
