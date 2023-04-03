import cmd from "./TaiXiuMini.Cmd";
import PanelChat from "./TaiXiuMini.PanelChat";
import MiniGame from "../../../../Lobby/src/MiniGame";
import MiniGameNetworkClient from "../../../../scripts/networks/MiniGameNetworkClient";
import InPacket from "../../../../scripts/networks/Network.InPacket";
import Utils from "../../../../scripts/common/Utils";
import Tween from "../../../../scripts/common/Tween";
import Configs from "../../../../scripts/common/Configs";
import BroadcastReceiver from "../../../../scripts/common/BroadcastReceiver";
import App from "../../../../scripts/common/App";
import TaiXiuDoubleController from "../../src/TaiXiuDouble.Controller";
import PopupDetailHistory from "./TaiXiuMini.PopupDetailHistory";
import FacebookTracking from "../../../../scripts/common/FacebookTracking";
import AudioManager from "../../../../scripts/common/Common.AudioManager";

const { ccclass, property } = cc._decorator;

enum BetDoor {
    None, Tai, Xiu
}

@ccclass
export default class TaiXiuMiniController extends cc.Component {

    static instance: TaiXiuMiniController = null;

    @property(cc.Node)
    gamePlay: cc.Node = null;
    @property([cc.SpriteFrame])
    sprDices: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();
    @property(cc.SpriteFrame)
    sprFrameTai: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sprFrameXiu: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sprFrameBtnNan: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sprFrameBtnNan2: cc.SpriteFrame = null;
    @property(cc.Label)
    lblSession: cc.Label = null;
    @property(cc.Label)
    lblRemainTime: cc.Label = null;
    @property(cc.Label)
    lblRemainTime2: cc.Label = null;
    @property(cc.Label)
    lblScore: cc.Label = null;
    @property(cc.Label)
    lblUserTai: cc.Label = null;
    @property(cc.Label)
    lblUserXiu: cc.Label = null;
    @property(cc.Label)
    lblTotalBetTai: cc.Label = null;
    @property(cc.Label)
    lblTotalBetXiu: cc.Label = null;
    @property(cc.Label)
    lblBetTai: cc.Label = null;
    @property(cc.Label)
    lblBetXiu: cc.Label = null;
    @property(cc.Node)
    bntBetTai: cc.Node = null;
    @property(cc.Node)
    bntBetXiu: cc.Node = null;
    @property(cc.Label)
    lblBetedTai: cc.Label = null;
    @property(cc.Label)
    lblBetedXiu: cc.Label = null;
    @property(cc.Sprite)
    dice1: cc.Sprite = null;
    @property(cc.Sprite)
    dice2: cc.Sprite = null;
    @property(cc.Sprite)
    dice3: cc.Sprite = null;
    @property(sp.Skeleton)
    diceAnim: sp.Skeleton = null;
    @property(cc.Node)
    bowl: cc.Node = null;
    @property(cc.Node)
    tai: cc.Node = null;
    @property(cc.Node)
    xiu: cc.Node = null;
    @property(cc.Node)
    btnHistories: cc.Node = null;
    @property(cc.Node)
    nodePanelChat: cc.Node = null;
    @property(cc.Node)
    layoutBet: cc.Node = null;
    @property(cc.Node)
    layoutBet1: cc.Node = null;
    @property(cc.Node)
    layoutBet2: cc.Node = null;
    @property([cc.Button])
    buttonsBet1: Array<cc.Button> = new Array<cc.Button>();
    @property([cc.Button])
    buttonsBet2: Array<cc.Button> = new Array<cc.Button>();
    @property(cc.Label)
    lblToast: cc.Label = null;
    @property(cc.Node)
    lblWinCash: cc.Node = null;
    @property(cc.Node)
    btnNan: cc.Node = null;

    // hna add
    @property(cc.Node)
    betedTaiWrap: cc.Node = null;
    @property(cc.Node)
    betedXiuWrap: cc.Node = null;
    @property(sp.Skeleton)
    dice1Anim: sp.Skeleton = null;
    @property(sp.Skeleton)
    dice2Anim: sp.Skeleton = null;
    @property(sp.Skeleton)
    dice3Anim: sp.Skeleton = null;
    @property(cc.Node)
    lastScoreFX: cc.Node = null;
    @property(cc.Label)
    lblJackPot: cc.Label = null;
    @property({ type: cc.AudioClip })
    soundClick: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundNewGame: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundResult: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundBet: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundWin: cc.AudioClip = null;
    @property(cc.Node)
    effectJackpot: cc.Node = null;
    // end hna

    // @property(PopupDetailHistory)
    // popupDetailHistory: PopupDetailHistory = null;

    @property(cc.Sprite)
    vongXoayTai: sp.Skeleton = null;
    @property(cc.Sprite)
    vongXoayXiu: cc.Sprite = null;

    @property(cc.Node)
    vongXoay: cc.Node = null;

    @property(cc.Node)
    hubPopupsGame: cc.Node = null;


    @property([cc.Node])
    public popups: cc.Node[] = [];

    private isBetting = false;
    private remainTime = 0;
    private canBet = true;
    private betedTai = 0;
    private betedXiu = 0;
    private referenceId = 0;
    private betingValue = -1;
    private betingDoor = BetDoor.None;
    private isOpenBowl = false;
    private lastWinCash = 0;
    private lastWinJackpot = 0;
    private lastScore = 0;
    private isNan = false;
    histories = [];
    private isCanChat = true;
    private panelChat: PanelChat = null;
    private readonly maxBetValue = 999999999;
    private listBets = [1000, 10000, 50000, 100000, 500000, 1000000, 5000000, 10000000];
    private readonly bowlStartPos = cc.v2(0, -69);

    onLoad() {
        TaiXiuMiniController.instance = this;
    }

    start() {
        MiniGameNetworkClient.getInstance().addListener((data: Uint8Array) => {
            if (!this.node.active) return;
            let inpacket = new InPacket(data);

            // hna add : setup position chat panel & scale
            this.panelChat.node.x = Configs.App.DEVICE_RESOLUTION.width/2 - this.panelChat.node.width/2;
            // if(Configs.App.DEVICE_RESOLUTION.width/Configs.App.DEVICE_RESOLUTION.height < 2) {
            //     this.gamePlay.scaleX = 0.75;
            //     this.gamePlay.scaleY = 0.75;
            // }
            // end
            switch (inpacket.getCmdId()) {

                case cmd.Code.GAME_INFO: {
                    let res = new cmd.ReceiveGameInfo(data);
                    this.stopWin();
                    this.bowl.active = false;
                    if (res.bettingState) {
                        this.isBetting = true;
                        // this.dice1.node.active = false;
                        // this.dice2.node.active = false;
                        // this.dice3.node.active = false;
                        this.lblRemainTime.node.active = true;
                        this.lblRemainTime.string = res.remainTime < 10 ? "0" + res.remainTime : "" + res.remainTime;
                        this.lblRemainTime2.node.parent.active = false;
                        // this.lblScore.node.parent.active = false; // hna comment
                        this.lblScore.string = ""; // hna add
                        this.lblScore.node.parent.stopAllActions(); // hna add
                        this.lblScore.node.parent.scaleX = 1; // hna add
                        this.lblScore.node.parent.scaleY = 1; // hna add
                    } else {
                        this.lastScore = res.dice1 + res.dice2 + res.dice3;
                        this.isBetting = false;
                        // this.dice1.node.active = true;
                        // this.dice1.spriteFrame = this.sprDices[res.dice1];
                        // this.dice2.node.active = true;
                        // this.dice2.spriteFrame = this.sprDices[res.dice2];
                        // this.dice3.node.active = true;
                        // this.dice3.spriteFrame = this.sprDices[res.dice3];
                        this.lblRemainTime.node.active = false;
                        this.lblRemainTime2.node.parent.active = true;
                        this.lblRemainTime2.string = "00:" + (res.remainTime < 10 ? "0" + res.remainTime : "" + res.remainTime);
                        this.showResult();
                    }
                    this.diceAnim.node.active = false;
                    Tween.numberTo(this.lblTotalBetTai, res.potTai, 0.3);
                    Tween.numberTo(this.lblTotalBetXiu, res.potXiu, 0.3);
                    this.betedTai = res.betTai;
                    this.lblBetedTai.string = Utils.formatNumber(this.betedTai);
                    this.betedXiu = res.betXiu;
                    this.lblBetedXiu.string = Utils.formatNumber(this.betedXiu);
                    this.referenceId = res.referenceId;
                    this.lblSession.string = "#" + res.referenceId;
                    this.remainTime = res.remainTime;
                    break;
                }
                case cmd.Code.UPDATE_TIME: {
                    let res = new cmd.ReceiveUpdateTime(data);
                    if (res.bettingState) {
                        this.isBetting = true;
                        this.lblRemainTime.node.active = true;
                        this.lblRemainTime.string = res.remainTime < 10 ? "0" + res.remainTime : "" + res.remainTime;
                        this.lblRemainTime2.node.parent.active = false;
                        // this.lblScore.node.parent.active = false; // hna comment
                        this.lblScore.string = ""; // hna add
                        this.lblScore.node.parent.stopAllActions(); // hna add
                        this.lblScore.node.parent.scaleX = 1; // hna add
                        this.lblScore.node.parent.scaleY = 1; // hna add
                    } else {
                        this.isBetting = false;
                        this.lblRemainTime.node.active = false;
                        this.lblRemainTime2.node.parent.active = true;
                        this.lblRemainTime2.string = (res.remainTime < 10 ? "0" + res.remainTime : "" + res.remainTime);
                        this.layoutBet.active = false;
                        this.lblBetTai.string = "";
                        this.bntBetTai.active = true;
                        this.lblBetXiu.string = "";
                        this.bntBetXiu.active = true;
                        if (res.remainTime < 5 && this.isNan && !this.isOpenBowl) {
                            this.bowl.active = false;
                            this.showResult();
                            this.showWinCash();
                            this.isOpenBowl = true;
                        }
                    }
                    Tween.numberTo(this.lblTotalBetTai, res.potTai, 0.3);
                    Tween.numberTo(this.lblTotalBetXiu, res.potXiu, 0.3);
                    this.lblUserTai.string = Utils.formatNumber(res.numBetTai);
                    this.lblUserXiu.string = Utils.formatNumber(res.numBetXiu);

                    // hna add : show Jackpot
                    Tween.numberTo(this.lblJackPot, res.pot, 0.3);
                    // end
                    break;
                }
                case cmd.Code.DICES_RESULT: {
                    let res = new cmd.ReceiveDicesResult(data);
                    this.lastScore = res.dice1 + res.dice2 + res.dice3;
                    this.lblRemainTime.node.active = false;
                    this.dice1.spriteFrame = this.sprDices[res.dice1];
                    this.dice2.spriteFrame = this.sprDices[res.dice2];
                    this.dice3.spriteFrame = this.sprDices[res.dice3];

                    // hna comment
                    // this.diceAnim.node.active = true;
                    // console.log("result");
                    // this.diceAnim.setAnimation(0, "animation", false);
                    // this.diceAnim.setCompleteListener(() => {
                    //     this.diceAnim.node.active = false;
                    //     this.dice1.node.active = true;
                    //     this.dice2.node.active = true;
                    //     this.dice3.node.active = true;

                    //     console.log("ohhhhhhhhhhhhhhhh: " + this.isNan);
                    //     if (!this.isNan) {
                    //         this.showResult();
                    //     } else {
                    //         this.bowl.position = this.bowlStartPos;
                    //         this.bowl.active = true;
                    //     }
                    // });
                    // end

                    // hna add
                    this.dice1Anim.node.active = true;
                    this.dice2Anim.node.active = true;
                    this.dice3Anim.node.active = true;
                    this.dice1Anim.setAnimation(0, `R1_F${res.dice1}`, false);
                    this.dice2Anim.setAnimation(0, `R2_F${res.dice2}`, false);
                    this.dice3Anim.setAnimation(0, `R3_F${res.dice3}`, false);

                    // hna add
                    if (this.isNan) {
                        this.scheduleOnce(() => {
                            this.bowl.position = this.bowlStartPos;
                            this.bowl.active = true;
                        }, 1.5);
                    }
                    // end

                    this.dice1Anim.setCompleteListener(() => {
                        // this.dice1Anim.node.active = false;
                        this.dice1Anim.setAnimation(0, `R1_ENDF${res.dice1}`, false);
                        this.dice2Anim.setAnimation(0, `R2_ENDF${res.dice2}`, false);
                        this.dice3Anim.setAnimation(0, `R3_ENDF${res.dice3}`, false);
                        // this.dice1.node.active = true;
                        // this.dice2.node.active = true;
                        // this.dice3.node.active = true;

                        console.log("ohhhhhhhhhhhhhhhh: " + this.isNan);
                        if (!this.isNan) {
                            this.showResult();
                        }
                        // else {
                        //     this.scheduleOnce(() => {
                        //         this.bowl.position = this.bowlStartPos;
                        //         this.bowl.active = true;
                        //     }, 0.5);
                        // }
                    });
                    // end

                    // this.scheduleOnce(() => {
                    //     this.diceAnim.node.active = true;
                    //     this.scheduleOnce(() => {
                    //         this.diceAnim.active = false;
                    //         this.dice1.node.active = true;
                    //         this.dice2.node.active = true;
                    //         this.dice3.node.active = true;

                    //         if (!this.isNan) {
                    //             this.showResult();
                    //         } else {
                    //             this.bowl.position = this.bowlStartPos;
                    //             this.bowl.active = true;
                    //         }
                    //     }, 0.95);
                    // }, 1.1);

                    if (this.histories.length >= 100) {
                        this.histories.slice(0, 1);
                    }
                    this.histories.push({
                        "session": this.referenceId,
                        "dices": [
                            res.dice1,
                            res.dice2,
                            res.dice3
                        ]
                    });
                    break;
                }
                case cmd.Code.RESULT: {
                    let res = new cmd.ReceiveResult(data);
                    // console.log(res);
                    Configs.Login.Coin = res.currentMoney;
                    this.lastWinCash = res.totalMoney;
                    if (!this.bowl.active) {
                        if (res.totalMoney > 0) this.showWinCash();
                    }
                    break;
                }
                case cmd.Code.TAI_XIU_NO_HU: {
                    let res = new cmd.ReceiveResult(data);
                    // console.log(res);
                    Configs.Login.Coin = res.currentMoney;
                    this.lastWinJackpot = res.totalMoney;
                    if (!this.bowl.active) {
                        if (res.totalMoney > 0) this.showWinJackpot();
                    }
                    break;
                }
                case cmd.Code.TAI_XIU_CAN_BAN: {
                    this.showToast("Tài Xỉu: Cân Cửa");
                    break;
                }
                case cmd.Code.NEW_GAME: {
                    this.showToast("Bắt đầu phiên mới.");
                    AudioManager.getInstance().playEffect(this.soundNewGame);
                    let res = new cmd.ReceiveNewGame(data);
                    this.diceAnim.node.active = false;
                    this.dice1.node.active = false;
                    this.dice2.node.active = false;
                    this.dice3.node.active = false;
                    this.lblTotalBetTai.string = "0";
                    this.lblTotalBetXiu.string = "0";
                    this.lblBetedTai.string = "0";
                    this.lblBetedXiu.string = "0";
                    this.lblUserTai.string = "(0)";
                    this.lblUserXiu.string = "(0)";
                    this.referenceId = res.referenceId;
                    this.lblSession.string = "#" + res.referenceId;
                    this.betingValue = -1;
                    this.betingDoor = BetDoor.None;
                    this.betedTai = 0;
                    this.betedXiu = 0;
                    this.isOpenBowl = false;
                    this.lastWinCash = 0;

                    // hna add
                    this.lastWinJackpot = 0;
                    this.bntBetTai.active = true;
                    this.bntBetXiu.active = true;
                    this.betedTaiWrap.active = false;
                    this.betedXiuWrap.active = false;
                    this.dice1Anim.node.active = false;
                    this.dice2Anim.node.active = false;
                    this.dice3Anim.node.active = false;
                    this.lblBetedTai.node.active = false;
                    this.lblBetedXiu.node.active = false;

                    this.tai.getComponent(sp.Skeleton).setAnimation(0, `loop_TAI`, true);
                    this.xiu.getComponent(sp.Skeleton).setAnimation(0, `loop_XIU`, true);
                    this.tai.children[0].active = this.xiu.children[0].active = false;

                    // end
                    this.stopWin();
                    break;
                }
                case cmd.Code.HISTORIES: {
                    let res = new cmd.ReceiveHistories(data);
                    var his = res.data.split(",");
                    for (var i = 0; i < his.length; i++) {
                        this.histories.push({
                            "session": this.referenceId - his.length / 3 + parseInt("" + ((i + 1) / 3)) + (this.isBetting ? 0 : 1),
                            "dices": [
                                parseInt(his[i]),
                                parseInt(his[++i]),
                                parseInt(his[++i])
                            ]
                        });
                    }
                    this.updateBtnHistories();
                    break;
                }
                case cmd.Code.LOG_CHAT: {
                    let res = new cmd.ReceiveLogChat(data);
                    // console.log(res);
                    var msgs = JSON.parse(res.message);
                    for (var i = 0; i < msgs.length; i++) {
                        this.panelChat.addMessage(msgs[i]["u"], msgs[i]["m"]);
                    }
                    this.panelChat.scrollToBottom();
                    break;
                }
                case cmd.Code.SEND_CHAT: {
                    let res = new cmd.ReceiveSendChat(data);
                    switch (res.error) {
                        case 0:
                            this.panelChat.addMessage(res.nickname, res.message);
                            break;
                        case 2:
                            this.panelChat.addNotificationMessage(res.message ? res.message : "Vip Point của bạn phải trên 3VP để có thể chat!");
                            break;
                        case 3:
                            this.showToast("Tạm thời bạn bị cấm Chat!");
                            break;
                        case 4:
                            this.showToast("Nội dung chat quá dài.");
                            break;
                        default:
                            this.showToast("Bạn không thể chat vào lúc này.");
                            break;
                    }
                    // console.log(res);
                    break;
                }
                case cmd.Code.BET: {
                    AudioManager.getInstance().playEffect(this.soundBet);
                    let res = new cmd.ReceiveBet(data);
                    switch (res.result) {
                        case 0:
                            switch (this.betingDoor) {
                                case BetDoor.Tai:
                                    this.betedTai += this.betingValue;
                                    this.lblBetedTai.string = Utils.formatNumber(this.betedTai);
                                    break;
                                case BetDoor.Xiu:
                                    this.betedXiu += this.betingValue;
                                    this.lblBetedXiu.string = Utils.formatNumber(this.betedXiu);
                                    break;
                            }
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

                            FacebookTracking.betTaiXiuSuccess(this.betingValue);

                            this.betingValue = -1;
                            this.showToast("Đặt cược thành công.");
                            break;
                        case 2:
                            this.betingValue = -1;
                            this.showToast("Hết thời gian cược.");
                            break;
                        case 3:
                            this.betingValue = -1;
                            this.showToast("Số dư không đủ vui lòng nạp thêm.");
                            break;
                        case 4:
                            this.betingValue = -1;
                            this.showToast("Số tiền cược không hợp lệ.");
                            break;
                        default:
                            this.betingValue = -1;
                            this.showToast("Đặt cược không thành công.");
                            break;
                    }
                    break;
                }
                default:
                    // console.log(inpacket.getCmdId());
                    break;
            }
        }, this);
        for (let i = 0; i < this.buttonsBet1.length; i++) {
            let btn = this.buttonsBet1[i];
            let value = this.listBets[i];
            let strValue = value + "";
            if (value >= 1000000) {
                strValue = (value / 1000000) + "M";
            } else if (value >= 1000) {
                strValue = (value / 1000) + "K";
            }
            btn.getComponentInChildren(cc.Label).string = strValue;
            btn.node.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClick);
                if (this.betingDoor === BetDoor.None) return;
                let lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
                let number = Utils.stringToInt(lblBet.string) + value;
                if (number > this.maxBetValue) number = this.maxBetValue;
                lblBet.string = Utils.formatNumber(number);
            });
        }
        for (let i = 0; i < this.buttonsBet2.length; i++) {
            let btn = this.buttonsBet2[i];
            let value = btn.getComponentInChildren(cc.Label).string;
            btn.node.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClick);
                if (this.betingDoor === BetDoor.None) return;
                let lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
                let number = Utils.stringToInt(lblBet.string + value);
                if (number > this.maxBetValue) number = this.maxBetValue;
                lblBet.string = Utils.formatNumber(number);
            });
        }

        this.bowl.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            var pos = this.bowl.position;
            pos.x += event.getDeltaX();
            pos.y += event.getDeltaY();
            this.bowl.position = pos;

            let distance = Utils.v2Distance(pos, this.bowlStartPos);
            // console.log(distance);
            if (Math.abs(distance) > 220) {
                this.bowl.active = false;
                this.isOpenBowl = true;
                this.showResult();
                this.showWinCash();
            }
        }, this);

        this.vongXoayTai.node.runAction(cc.repeatForever(cc.rotateBy(0.5, 360)));
        this.vongXoayXiu.node.runAction(cc.repeatForever(cc.rotateBy(0.5, 360)));
    }

    show() {
        App.instance.buttonMiniGame.showTimeTaiXiu(false);
        this.layoutBet.active = false;
        this.lblToast.node.parent.active = false;
        this.lblWinCash.active = false;
        this.layoutBet.active = false;
        this.diceAnim.node.active = false;
        this.bowl.active = false;
        this.dice1.node.active = false;
        this.dice2.node.active = false;
        this.dice3.node.active = false;

        // hna add
        this.bntBetTai.active = true;
        this.bntBetXiu.active = true;
        this.betedTaiWrap.active = false;
        this.betedXiuWrap.active = false;
        // end
        MiniGameNetworkClient.getInstance().send(new cmd.SendScribe());
        this.showChat();
        // this.lastWinJackpot = 1000000;
        // this.showWinJackpot();
    }

    showChat() {
        this.panelChat = this.nodePanelChat.getComponent(PanelChat);
        this.panelChat.show(true);
    }

    dismiss() {
        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].active = false;
        }
        this.panelChat.show(false);
        // MiniGameNetworkClient.getInstance().send(new cmd.SendUnScribe()); 
    }

    unsubScribe() {
        MiniGameNetworkClient.getInstance().send(new cmd.SendUnScribe());
    }

    actClose() {
        AudioManager.getInstance().playEffect(this.soundClick);
        TaiXiuDoubleController.instance.dismiss();
    }

    actChat() {
        AudioManager.getInstance().playEffect(this.soundClick);
        this.panelChat.show(!this.panelChat.node.active);
    }

    actBetTai() {
        AudioManager.getInstance().playEffect(this.soundClick);
        if (!this.isBetting) {
            this.showToast("Chưa đến thời gian đặt cược.");
            return;
        }
        if (this.betingValue >= 0) {
            this.showToast("Bạn thao tác quá nhanh.");
            return;
        }
        console.log("---------------------- this.betedXiu", this.betedXiu)
        if (this.betedXiu > 0) {
            this.showToast("Bạn không thể đặt 2 cửa.");
            return;
        }
        this.betingDoor = BetDoor.Tai;
        this.lblBetTai.string = "0";
        this.bntBetTai.active = false;
        this.lblBetXiu.string = "";
        this.bntBetXiu.active = true;
        this.layoutBet.active = true;
        this.layoutBet1.active = true;
        this.layoutBet2.active = false;

        // hna add
        this.bntBetTai.active = false;
        this.betedTaiWrap.active = true;
        // end
    }

    actBetXiu() {
        AudioManager.getInstance().playEffect(this.soundClick);
        if (!this.isBetting) {
            this.showToast("Chưa đến thời gian đặt cược.");
            return;
        }
        if (this.betingValue >= 0) {
            this.showToast("Bạn thao tác quá nhanh.");
            return;
        }
        if (this.betedTai > 0) {
            this.showToast("Bạn không thể đặt 2 cửa.");
            return;
        }
        this.betingDoor = BetDoor.Xiu;
        this.lblBetXiu.string = "0";
        this.bntBetXiu.active = false;
        this.lblBetTai.string = "";
        this.bntBetTai.active = true;
        this.layoutBet.active = true;
        this.layoutBet1.active = true;
        this.layoutBet2.active = false;

        // hna add
        this.bntBetXiu.active = false;
        this.betedXiuWrap.active = true;
        // end
    }

    actOtherNumber() {
        this.layoutBet1.active = false;
        this.layoutBet2.active = true;
    }

    actAgree() {
        AudioManager.getInstance().playEffect(this.soundClick);
        if (this.betingValue >= 0 || !this.canBet) {
            this.showToast("Bạn thao tác quá nhanh.");
            return;
        }
        if (this.betingDoor === BetDoor.None) return;
        var lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
        this.betingValue = Utils.stringToInt(lblBet.string);
        this.betingDoor = this.betingDoor;
        MiniGameNetworkClient.getInstance().send(new cmd.SendBet(this.referenceId, this.betingValue, this.betingDoor == BetDoor.Tai ? 1 : 0, this.remainTime));
        lblBet.string = "0";

        // hna add
        if(this.betingDoor === BetDoor.Tai) {
            this.lblBetedTai.node.active = true;
        } else if(this.betingDoor === BetDoor.Xiu) {
            this.lblBetedXiu.node.active = true;
        }
        // end 

        this.canBet = false;
        this.scheduleOnce(function () {
            this.canBet = true;
        }, 1);

        FacebookTracking.betTaiXiu();
    }

    actCancel() {
        AudioManager.getInstance().playEffect(this.soundClick);
        this.lblBetXiu.string = "";
        this.bntBetXiu.active = true;
        this.lblBetTai.string = "";
        this.bntBetTai.active = true;
        this.betingDoor = BetDoor.None;
        this.layoutBet.active = false;

        // hna add
        this.bntBetTai.active = true;
        this.bntBetXiu.active = true;
        this.betedTaiWrap.active = false;
        this.betedXiuWrap.active = false;
        // end
    }

    actBtnGapDoi() {
        AudioManager.getInstance().playEffect(this.soundClick);
        if (this.betingDoor === BetDoor.None) return;
        var lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
        var number = Utils.stringToInt(lblBet.string) * 2;
        if (number > this.maxBetValue) number = this.maxBetValue;
        lblBet.string = Utils.formatNumber(number);
    }

    actBtnAllIn() {
        AudioManager.getInstance().playEffect(this.soundClick);
        if (this.betingDoor === BetDoor.None) return;
        var lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
        lblBet.string = Utils.formatNumber(Configs.Login.Coin);
    }

    actBtnDelete() {
        if (this.betingDoor === BetDoor.None) return;
        var lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
        var number = "" + Utils.stringToInt(lblBet.string);
        number = number.substring(0, number.length - 1);
        number = Utils.formatNumber(Utils.stringToInt(number));
        lblBet.string = number;
    }

    actBtn000() {
        if (this.betingDoor === BetDoor.None) return;
        var lblBet = this.betingDoor === BetDoor.Tai ? this.lblBetTai : this.lblBetXiu;
        var number = Utils.stringToInt(lblBet.string + "000");
        if (number > this.maxBetValue) number = this.maxBetValue;
        lblBet.string = Utils.formatNumber(number);
    }

    actNan() {
        this.isNan = !this.isNan;
        this.btnNan.getComponent(cc.Sprite).spriteFrame = this.isNan ? this.sprFrameBtnNan2 : this.sprFrameBtnNan;
    }

    private showResult() {
        AudioManager.getInstance().playEffect(this.soundResult);
        this.lblScore.node.parent.active = true;
        // hna add
        // this.lastScore >= 11 ? this.lblScore.node.color = cc.Color.BLACK.fromHEX("#ffffff") : cc.Color.BLACK.fromHEX("#240107");
        // end
        
        // this.lblScore.string = "" + this.lastScore;
        if (this.lastScore >= 11) {
            // hna comment
            // this.tai.runAction(cc.repeatForever(cc.spawn(
            //     cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.3, 1)),
            //     cc.sequence(cc.tintTo(0.3, 255, 255, 0), cc.tintTo(0.3, 255, 255, 255))
            // )));
            // end

            // hna add
            this.lblScore.node.color = cc.Color.BLACK.fromHEX("#ffffff");
            this.lblScore.string = "" + this.lastScore;
            // this.tai.getComponent(sp.Skeleton).setAnimation(0, `win_TAI`, true);
            // this.xiu.getComponent(sp.Skeleton).setAnimation(0, `fade_XIU`, true);
            this.tai.children[0].active = true;
            this.tai.children[0].getComponent(sp.Skeleton).setAnimation(0, `animation`, true);
            this.xiu.children[0].active = false
            // end

            // this.vongXoayTai.node.active = true; // hna comment
        } else {
            // hna comment
            // this.xiu.runAction(cc.repeatForever(cc.spawn(
            //     cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.3, 1)),
            //     cc.sequence(cc.tintTo(0.3, 255, 255, 0), cc.tintTo(0.3, 255, 255, 255))
            // )));
            // end

            // hna add
            this.lblScore.node.color = cc.Color.BLACK.fromHEX("#240107");
            this.lblScore.string = "" + this.lastScore;
            // this.xiu.getComponent(sp.Skeleton).setAnimation(0, `win_XIU`, true);
            // this.tai.getComponent(sp.Skeleton).setAnimation(0, `fade_TAI`, true);
            this.xiu.children[0].active = true;
            this.xiu.children[0].getComponent(sp.Skeleton).setAnimation(0, `animation`, true);
            this.tai.children[0].active = false
            // end

            // this.vongXoayXiu.node.active = true; // hna comment
        }
        this.updateBtnHistories();

        this.vongXoay.active = false;
    }

    private stopWin() {
        this.tai.children[0].active = this.xiu.children[0].active = false;
        this.tai.stopAllActions();
        // this.tai.runAction(cc.spawn(cc.scaleTo(0.3, 1), cc.tintTo(0.3, 255, 255, 255))); // hna comment

        this.xiu.stopAllActions();
        // this.xiu.runAction(cc.spawn(cc.scaleTo(0.3, 1), cc.tintTo(0.3, 255, 255, 255))); // hna comment

        this.vongXoayTai.node.active = false;
        this.vongXoayXiu.node.active = false;

        // this.vongXoay.active = true; // hna comment
        this.vongXoay.active = false;
    }

    showToast(message: string) {
        this.lblToast.string = message;
        let parent = this.lblToast.node.parent;
        parent.stopAllActions();
        parent.active = true;
        parent.opacity = 255;

        // hna comment
        // parent.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(2), cc.fadeOut(0.2), cc.callFunc(() => {
        //     parent.active = false;
        // })));
        // end

        // hna add
        parent.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2)
        );
        this.scheduleOnce(() => {
            if(parent) {
                // hna add
                parent.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2 + 150)
                );
                // end
            }
        }, 3);
        // end
    }

    private showWinCash() {
        if (this.lastWinCash <= 0) return;
        AudioManager.getInstance().playEffect(this.soundWin);
        this.lblWinCash.stopAllActions();
        this.lblWinCash.active = true;
        this.lblWinCash.scale = 0;
        this.lblWinCash.position = cc.Vec2.ZERO;
        Tween.numberTo(this.lblWinCash.getChildByName("prize").getComponent(cc.Label), this.lastWinCash, 0.5, (n) => { return "+" + Utils.formatNumber(n) });
        this.lblWinCash.runAction(cc.sequence(
            cc.scaleTo(0.5, 1),
            cc.delayTime(2),
            cc.moveBy(1, cc.v2(0, 60)),
            cc.callFunc(() => {
                this.lblWinCash.active = false;
            })
        ));
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
    }

    private showWinJackpot() {
        if (this.lastWinJackpot <= 0) return;
        AudioManager.getInstance().playEffect(this.soundWin);
        this.effectJackpot.stopAllActions();
        this.effectJackpot.active = true;
        this.effectJackpot.position = cc.Vec2.ZERO;
        Tween.numberTo(this.effectJackpot.getChildByName("prize").getComponent(cc.Label), this.lastWinJackpot, 0.5, (n) => { return "" + Utils.formatNumber(n) });
        this.effectJackpot.getChildByName("prize").runAction(cc.sequence(
            cc.scaleTo(0.5, 1),
            cc.delayTime(7),
            cc.moveBy(1, cc.v2(0, 60)),
            cc.callFunc(() => {
                this.effectJackpot.active = false;
                this.effectJackpot.getChildByName("prize").active = false;
            })
        ));
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
    }

    updateBtnHistories() {
        let histories = this.histories.slice();
        if (histories.length > this.btnHistories.childrenCount) {
            histories.splice(0, histories.length - this.btnHistories.childrenCount);
        }
        let idx = histories.length - 1;
        for (var i = this.btnHistories.childrenCount - 1; i >= 0; i--) {
            if (idx >= 0) {
                let _idx = idx;
                var score = histories[idx]["dices"][0] + histories[idx]["dices"][1] + histories[idx]["dices"][2];
                this.btnHistories.children[i].getComponent(cc.Sprite).spriteFrame = score >= 11 ? this.sprFrameTai : this.sprFrameXiu;
                this.btnHistories.children[i].off("click");
                this.btnHistories.children[i].on("click", (e, b) => {
                    AudioManager.getInstance().playEffect(this.soundClick);
                    cc.loader.loadRes("prefabs/PopupTaiXiu/PopupDetailHistory", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                        let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupDetailHistory");
                        this.hubPopupsGame.addChild(popup.node);
                        popup.showDetail(histories[_idx]["session"]);
                    });
                    console.log(this.histories[_idx]);
                });
                this.btnHistories.children[i].active = true;
            } else {
                this.btnHistories.children[i].active = false;
            }
            idx--;
        }

        // hna add
        // this.lastScoreFX.active = true;
        this.btnHistories.children[this.btnHistories.childrenCount - 1].runAction(cc.repeatForever(cc.spawn(
            cc.sequence(cc.scaleTo(0.3, 1.2), cc.scaleTo(0.3, 1)),
            cc.sequence(cc.tintTo(0.3, 255, 255, 255), cc.tintTo(0.3, 255, 255, 255))
        )));
        // end
    }

    sendChat(message: string) {
        let _this = this;
        if (!_this.isCanChat) {
            this.showToast("Bạn thao tác quá nhanh.");
            return;
        }
        _this.isCanChat = false;
        this.scheduleOnce(function () {
            _this.isCanChat = true;
        }, 1);
        var req = new cmd.SendChat(unescape(encodeURIComponent(message)));
        MiniGameNetworkClient.getInstance().send(req);
    }

    // Popup
    showPopupRank() {
        AudioManager.getInstance().playEffect(this.soundClick);
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupHonors", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupHonors");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupGuide() {
        AudioManager.getInstance().playEffect(this.soundClick);
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupGuide", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("Dialog");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupHistory() {
        AudioManager.getInstance().playEffect(this.soundClick);
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupHistory", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupHistory");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupSoiCau() {
        AudioManager.getInstance().playEffect(this.soundClick);
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupSoiCau", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupSoiCau");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupThanhDu() {
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupThanhDu", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupThanhDu");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupJackpot() {
        AudioManager.getInstance().playEffect(this.soundClick);
        cc.loader.loadRes("prefabs/PopupTaiXiu/PopupJackpot", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("TaiXiuMini.PopupJackpot");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }
}