import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import cmd from "./XocDia.Cmd";
import Player from "./XocDia.Player";
import Random from "../../../scripts/common/Random";
import Configs from "../../../scripts/common/Configs";
import XocDiaController from "./XocDia.XocDiaController";
import BtnPayBet from "./XocDia.BtnPayBet";
import XocDiaNetworkClient from "./XocDia.XocDiaNetworkClient";
import InPacket from "../../../scripts/networks/Network.InPacket";
import TimeUtils from "../../../scripts/common/TimeUtils";
import PanelPayDoor from "./XocDia.PanelPayDoor";
import App from "../../../scripts/common/App";
import BtnBet from "./XocDia.BtnBet";
import Utils from "../../../scripts/common/Utils";
import BankerControl from "./XocDia.BankerControl";
import PopupInvite from "../../../CardGames/src/invite/CardGame.PopupInvite";
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";
import PopupAcceptInvite from "../../../CardGames/src/invite/CardGame.PopupAcceptInvite";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import AudioManager from "../../../scripts/common/Common.AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Play extends cc.Component {
    @property(Player)
    mePlayer: Player = null;
    @property([Player])
    players: Player[] = [];
    @property([BtnPayBet])
    btnPayBets: BtnPayBet[] = [];
    @property(sp.Skeleton)
    dealer: sp.Skeleton = null;
    @property(cc.Node)
    dealerHandPoint: cc.Node = null;
    @property(sp.Skeleton)
    bowl: sp.Skeleton = null;
    @property([cc.SpriteFrame])
    sprChipSmalls: cc.SpriteFrame[] = [];
    @property(cc.Node)
    chips: cc.Node = null;
    @property(cc.Node)
    chipTemplate: cc.Node = null;
    // @property(cc.Sprite)
    // sprProgressTime: cc.Sprite = null;
    @property(PanelPayDoor)
    panelPayDoor: PanelPayDoor = null;
    @property(cc.Label)
    lblHistoryOdd: cc.Label = null;
    @property(cc.Label)
    lblHistoryEven: cc.Label = null;
    @property(cc.SpriteFrame)
    sfOdd: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfEven: cc.SpriteFrame = null;
    @property(cc.Node)
    lblHistoryItems: cc.Node = null;
    @property(cc.Button)
    btnLamCai: cc.Button = null;
    @property(cc.Button)
    btnHuyLamCai: cc.Button = null;
    @property(BankerControl)
    bankerControl: BankerControl = null;

    @property(cc.Node)
    notifier: cc.Node = null;
    @property(cc.Label)
    notifyLabel: cc.Label = null;

    // UI Chat
    @property(cc.Node)
    UI_Chat: cc.Node = null;
    @property(cc.EditBox)
    edtChatInput: cc.EditBox = null;

    @property(cc.Label)
    counterLabel: cc.Label = null;
    @property(cc.Node)
    counter: cc.Node = null;

    @property(cc.Node)
    panelBack: cc.Node = null;

    @property(cc.Node)
    popups: cc.Node = null;

    @property(cc.Node)
    btnBetTemplate: cc.Node = null;
    @property(cc.Node)
    betMask: cc.Node = null;
    @property([cc.SpriteFrame])
    sprChipActives: cc.SpriteFrame[] = [];

    @property(cc.Node)
    popupGuide: cc.Node = null;

    // hna add
    @property(cc.Label)
    lblTime: cc.Label = null;
    @property(cc.Node)
    UI_SoiCau: cc.Node = null;
    @property(cc.Label)
    lblPopupHistoryOdd: cc.Label = null;
    @property(cc.Label)
    lblPopupHistoryEven: cc.Label = null;
    @property({ type: cc.AudioClip })
    soundXoc: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundMoBat: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundWin: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundBet: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;
    // end

    private inited = false;
    private roomId = 0;

    private chipsInDoors: any = {};
    private lastBowlStateName = "";
    private curTime = 0;
    private gameState = 0;
    private readonly listBets = [1000, 5000, 10000, 50000, 100000, 200000, 500000, 1000000, 2000000, 5000000];
    private betIdx = 0;
    private isBanker = false;
    private banker = "";

    private btnBets: BtnBet[] = [];
    private isMovingBet: boolean = false;
    private lastUpdateTime = TimeUtils.currentTimeMillis();

    public static readonly BET_LEFT_ZERO = -200;
    public static readonly BET_SPACE = 100;
    public static readonly BET_ACTIVE_SCALE = 1.05;
    public static readonly BET_NORMAL_SCALE = 0.7;
    public static readonly BET_ANIM_DURATION = 0.25;

    public static readonly COUNTER = "COUNTER";

    start() {
        for (let i = 0; i < this.btnPayBets.length; i++) {
            let btn = this.btnPayBets[i];
            btn.node.on("click", () => {
                if (this.gameState != 2) {
                    console.log("Khong phai thoi gian dat cuoc");
                    return;
                }

                // hna comment
                // if (i >= 2 && this.banker == "") {
                //     App.instance.alertDialog.showMsg("Không thể đặt vị khi chưa có người chơi làm cái.");
                //     return;
                // }
                // end

                if (this.isBanker) {
                    App.instance.alertDialog.showMsg("Bạn đang làm cái.");
                    return;
                }
                XocDiaNetworkClient.getInstance().send(new cmd.SendPutMoney(i, this.listBets[this.betIdx]));
            });
        }

        this.betIdx = 2;
        for (let i = 0; i < this.listBets.length; i++) {
            let btnBet = cc.instantiate(this.btnBetTemplate);
            this.betMask.addChild(btnBet);
            let btnBetComp = btnBet.getComponent(BtnBet);
            btnBet.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClickBtn);
                if(btnBetComp.idx == this.betIdx + 1) {
                    this.actNextPageBet();
                } 
                if(btnBetComp.idx == this.betIdx + 2) {
                    this.actNextPageBet();
                    this.scheduleOnce(() => {
                        this.actNextPageBet();
                    }, Play.BET_ANIM_DURATION);
                } 
                if(btnBetComp.idx == this.betIdx - 1) {
                    this.actPrevPageBet();
                } 
                if(btnBetComp.idx == this.betIdx - 2) {
                    this.actPrevPageBet();
                    this.scheduleOnce(() => {
                        this.actPrevPageBet();
                    }, Play.BET_ANIM_DURATION);
                }          
            });
            btnBet.x = Play.BET_LEFT_ZERO + i*Play.BET_SPACE;
            btnBetComp.label.string = Utils.formatNumberMin(this.listBets[i]);
            btnBetComp.active.getComponent(cc.Sprite).spriteFrame = this.sprChipActives[i];
            btnBetComp.idx = i;
            this.btnBets.push(btnBetComp);

            if(i == this.betIdx) {
                btnBet.scale = Play.BET_ACTIVE_SCALE;
            } else {
                btnBet.scale = Play.BET_NORMAL_SCALE;
            }
        }
        this.btnBetTemplate.active = false;

        // hna add
        this.btnPayBets.forEach(e => e.hideLblBet());
        // end
    }

    update(dt) {
        if (this.curTime > 0) {
            let timeLeft = Math.max(0, this.curTime - TimeUtils.currentTimeMillis());
            // this.sprProgressTime.fillRange = timeLeft / 30000; // hna comment

            // hna add
            this.lblTime.string = Math.round(timeLeft / 1000).toString();
            // end

            if (timeLeft == 0) {
                this.curTime = 0;
            }
        }

        let t = TimeUtils.currentTimeMillis();
        if (t - this.lastUpdateTime > 2000) {
            console.log("on resume");
            this.node.stopAllActions();
            App.instance.showLoading(true);
            XocDiaNetworkClient.getInstance().send(new cmd.SendJoinRoomById(this.roomId));
        }
        this.lastUpdateTime = t;
    }

    public init() {
        if (this.inited) return;
        this.inited = true;

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            if (!this.node.active) return;
            this.mePlayer.setCoin(Configs.Login.Coin);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        XocDiaNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.JOIN_ROOM_SUCCESS:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceiveJoinRoomSuccess(data);
                        this.show(res);
                    }
                    break;
                case cmd.Code.USER_JOIN_ROOM_SUCCESS:
                    {
                        let res = new cmd.ReceiveUserJoinRoom(data);
                        console.log(res);
                        let player = this.getRandomEmptyPlayer();
                        if (player != null) {
                            player.set(res.nickname, res.avatar, res.money, false);
                        } else {
                            this.counterLabel.string = "" + (Utils.stringToInt(this.counterLabel.string) + 1);
                        }
                    }
                    break;
                case cmd.Code.USER_OUT_ROOM:
                    {
                        let res = new cmd.ReceiveUserOutRoom(data);
                        console.log(res);
                        let player = this.getPlayer(res.nickname);
                        if (player != null) {
                            player.leave();
                        } else if(Utils.stringToInt(this.counterLabel.string) > 0) {
                            this.counterLabel.string = "" + (Utils.stringToInt(this.counterLabel.string) - 1);
                        }
                    }
                    break;
                case cmd.Code.QUIT_ROOM:
                    {
                        let res = new cmd.ReceiveLeavedRoom(data);
                        console.log(res);
                        let msg = "";
                        switch (res.reason) {
                            case 1:
                                msg = "Bạn không đủ tiền để tham gia phòng!";
                                break;
                            case 2:
                                msg = "Hệ thống đang tạm thời bảo trì!";
                                break;
                            case 5:
                                msg = "Bạn bị mời ra khỏi phòng vì quá lâu không tương tác!";
                                break;
                            case 6:
                                msg = "Nhà cái đã kick bạn ra khỏi phòng!";
                                break;
                        }
                        
                        // this.node.active = false;
                        // XocDiaController.instance.lobby.show();

                        if(msg) {
                            App.instance.alertDialog.show3(msg, () => {
                                XocDiaNetworkClient.getInstance().close();
                                App.instance.loadScene("lobby");
                            });
                        } else {
                            XocDiaNetworkClient.getInstance().close();
                            App.instance.loadScene("lobby");
                        }
                    }
                    break;
                case cmd.Code.DANG_KY_THOAT_PHONG:
                    {
                        let res = new cmd.ReceiveLeaveRoom(data);
                        console.log(res);
                        if (res.bRegis) {
                            this.showToast("Đã đăng ký rời phòng.");
                        } else {
                            this.showToast("Đã huỷ đăng ký rời phòng.");
                        }
                    }
                    break;
                case cmd.Code.ACTION_IN_GAME:
                    {
                        let res = new cmd.ReceiveActionInGame(data);
                        console.log(res);
                        let msg = "";
                        this.gameState = res.action;
                        switch (res.action) {
                            case 1://bat dau van moi
                                msg = "Bắt đầu ván mới";
                                // this.sprProgressTime.node.parent.active = false; // hna comment

                                // hna add
                                this.lblTime.node.parent.active = false;
                                cc.audioEngine.stopAllEffects();
                                AudioManager.getInstance().playEffect(this.soundXoc);
                                // end
                                break;
                            case 2://bat dau dat cua
                                msg = "Bắt đầu đặt cửa";
                                // this.sprProgressTime.node.parent.active = true; // hna comment
                                // hna add
                                this.lblTime.node.parent.active = true;
                                // end
                                this.curTime = TimeUtils.currentTimeMillis() + res.time * 1000;
                                break;
                            case 3://bat dau ban cua
                                msg = "Chuẩn bị mở bát";
                                // this.sprProgressTime.node.parent.active = false; // hna comment
                                // hna add
                                this.lblTime.node.parent.active = false;
                                // end
                                break;
                            case 4://nha cai can tien, hoan tien
                                msg = "Nhà cái cân tiền, hoàn tiền";
                                // this.sprProgressTime.node.parent.active = false; // hna comment
                                // hna add
                                this.lblTime.node.parent.active = false;
                                // end
                                break;
                            case 5://bat dau hoan tien
                                msg = "Bắt đầu hoàn tiền";
                                // this.sprProgressTime.node.parent.active = false; // hna comment
                                // hna add
                                this.lblTime.node.parent.active = false;
                                // end
                                break;
                            case 6://bat dau tra thuong
                                msg = "Bắt đầu trả thưởng";
                                // this.sprProgressTime.node.parent.active = false; // hna comment
                                // hna add
                                this.lblTime.node.parent.active = false;
                                // end
                                break;
                        }
                        if (msg != "") {
                            this.dealer.setAnimation(0, "noti", false);
                            this.dealer.addAnimation(0, "cho", true);
                            // let label = this.dealer.getComponentInChildren(cc.Label);
                            // label.string = msg;
                            // label.node.active = false;
                            // this.scheduleOnce(() => {
                            //     label.node.active = true;
                            //     this.scheduleOnce(() => {
                            //         label.node.active = false;
                            //     }, 0.9);
                            // }, 0.3);

                            this.showToast(msg);
                        }
                    }
                    break;
                case cmd.Code.START_GAME:
                    {
                        let res = new cmd.ReceiveStartGame(data);
                        console.log(res);

                        if (res.banker != "" && res.banker != Configs.Login.Nickname && this.isBanker) {
                            App.instance.alertDialog.showMsg("Bạn không đủ tiền để tiếp tục làm cái!");
                        }

                        this.banker = res.banker;
                        this.isBanker = this.banker == Configs.Login.Nickname;

                        for (let i = 0; i < this.players.length; i++) {
                            let player = this.players[i];
                            player.banker.active = player.nickname != "" && player.nickname == this.banker;
                        }

                        // if (this.isBanker) {
                        //     this.btnHuyLamCai.node.active = true;
                        //     this.btnLamCai.node.active = false;
                        // } else {
                        //     this.btnLamCai.node.active = true;
                        //     this.btnHuyLamCai.node.active = false;
                        // }

                        this.btnPayBets.forEach(e => e.reset());
                        this.clearChips();

                        switch (this.lastBowlStateName) {
                            case "4 trang mo":
                                this.bowl.setAnimation(0, "4 trang up", false);
                                break;
                            case "4 do mo":
                                this.bowl.setAnimation(0, "4 do up", false);
                                break;
                            case "3 do 1 trang mo":
                                this.bowl.setAnimation(0, "3 do 1 trang up", false);
                                break;
                            case "3 trang 1 do mo":
                                this.bowl.setAnimation(0, "3 trang 1 do up", false);
                                break;
                            case "2 trang 2 do mo":
                                this.bowl.setAnimation(0, "2 trang 2 do up", false);
                                break;
                            default:
                                this.bowl.setAnimation(0, "bat up", false);
                                break;
                        }
                        this.bowl.addAnimation(0, "lac bat", false);
                        this.bowl.addAnimation(0, "bat up", false);

                        FacebookTracking.logCountXocDia();
                    }
                    break;
                case cmd.Code.PUT_MONEY:
                    {
                        let res = new cmd.ReceivePutMoney(data);
                        console.log(res);

                        AudioManager.getInstance().playEffect(this.soundBet);

                        let btnPayBet = this.btnPayBets[res.potId];
                        btnPayBet.setTotalBet(res.potMoney);

                        if (res.nickname == Configs.Login.Nickname) {
                            switch (res.error) {
                                case 0:
                                    break;
                                case 1:
                                    App.instance.alertDialog.showMsg("Bạn không đủ tiền!");
                                    return;
                                case 2:
                                    App.instance.alertDialog.showMsg("Không thể đặt quá hạn mức của cửa!");
                                    return;
                                default:
                                    App.instance.alertDialog.showMsg("Lỗi " + res.error + ", không xác định.");
                                    return;
                            }
                            btnPayBet.addMyBet(res.betMoney);
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                        }

                        let name: string = "";
                        let positon: cc.Vec2 = null;
                        let player = this.getPlayer(res.nickname);
                        if (player != null) {
                            player.setCoin(res.currentMoney);
                            name = player.nickname;
                            positon = player.node.position;
                        } else {
                            name = Play.COUNTER;
                            positon = this.counter.position;
                        }

                        if(!cc.game.isPaused()) {
                            let listCoin = this.convertMoneyToChipMoney(res.betMoney);
                            for (let i = 0; i < listCoin.length; i++) {
                                let chip = this.getChip(listCoin[i]);
                                chip.name = name;
                                chip.position = positon;
                                if (!this.chipsInDoors.hasOwnProperty(res.potId)) {
                                    this.chipsInDoors[res.potId] = [];
                                }
                                this.chipsInDoors[res.potId].push(chip);

                                let position = btnPayBet.node.position.clone();
                                position.x += Random.rangeInt(-btnPayBet.node.width / 2 + 50, btnPayBet.node.width / 2 - 50);
                                position.y += Random.rangeInt(-btnPayBet.node.height / 2 + 60, btnPayBet.node.height / 2 - 20);
                                chip.runAction(cc.moveTo(0.5, position).easing(cc.easeSineOut()));
                            }
                        }

                        if(res.nickname == Configs.Login.Nickname) {
                            FacebookTracking.betXocDiaSuccess(res.betMoney);

                        }
                    }
                    break;
                case cmd.Code.BANKER_SELL_GATE:
                    {
                        let res = new cmd.ReceiveBankerSellGate(data);
                        console.log(res);

                        if (res.action != 1) {
                            this.panelPayDoor.show(res.action, res.moneySell);
                        }
                    }
                    break;
                case cmd.Code.BUY_GATE:
                    {
                        let res = new cmd.ReceiveBuyGate(data);
                        console.log(res);

                        if (res.nickname == Configs.Login.Nickname) {
                            let msg = "";
                            switch (res.error) {
                                case 0:
                                    //nothing
                                    break;
                                case 1:
                                    msg = "Bạn không đủ tiền để mua cửa!";
                                    break;
                                case 2:
                                    msg = "Nhà cái đã bán cửa xong!";
                                    break;
                                default:
                                    msg = "Lỗi " + res.error + ", không xác định.";
                                    break;
                            }
                            if (msg != "") {
                                App.instance.alertDialog.showMsg(msg);
                                break;
                            }
                        }
                        this.panelPayDoor.addUser(res.nickname, res.moneyBuy, res.rmMoneySell);
                    }
                    break;
                case cmd.Code.REFUN_MONEY:
                    {
                        let res = new cmd.ReceiveRefunMoney(data);
                        console.log(res);

                        this.panelPayDoor.node.active = false;
                        this.bankerControl.node.active = false;

                        for (let i = 0; i < res.playerInfosRefun.length; i++) {
                            let rfData = res.playerInfosRefun[i];
                            let player = this.getPlayer(rfData["nickname"]);
                            if (player != null) {
                                player.showRefundCoin(rfData["moneyRefund"]);
                                player.setCoin(rfData["currentMoney"]);
                            }
                            if (rfData["nickname"] == Configs.Login.Nickname) {
                                Configs.Login.Coin = rfData["currentMoney"];
                                BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            }
                        }

                        for (let i = 0; i < res.potID.length; i++) {
                            let potData = res.potID[i];
                            this.btnPayBets[i].setTotalBet(potData["totalMoney"]);
                        }
                    }
                    break;
                case cmd.Code.FINISH_GAME:
                    {
                        let res = new cmd.ReceiveFinishGame(data);
                        console.log(res);

                        this.panelPayDoor.node.active = false;
                        this.bankerControl.node.active = false;

                        // hna add 
                        cc.audioEngine.stopAllEffects();
                        AudioManager.getInstance().playEffect(this.soundMoBat);
                        // end

                        for (let i = 0; i < res.playerInfoWin.length; i++) {
                            let playerData = res.playerInfoWin[i];
                            if (playerData["nickname"] == Configs.Login.Nickname) {
                                Configs.Login.Coin = playerData["currentMoney"];
                                BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                                break;
                            }
                        }

                        let countRed = 0;
                        let countWhite = 0;
                        for (let i = 0; i < res.diceIDs.length; i++) {
                            if (res.diceIDs[i] == 1) countRed++;
                            else countWhite++;
                        }
                        let isChan = (res.diceIDs[0] + res.diceIDs[1] + res.diceIDs[2] + res.diceIDs[3]) % 2 == 0;
                        let isLe3do1trang = countRed - countWhite == 2;
                        let isLe3trang1do = countWhite - countRed == 2;
                        let isChan4do = countRed - countWhite == 4;
                        let isChan4trang = countWhite - countRed == 4;
                        let doorWins = [];
                        if (isChan) {
                            doorWins.push(0);
                            this.btnPayBets[0].active.active = true;
                            if (isChan4do) {
                                doorWins.push(2);
                                this.btnPayBets[2].active.active = true;

                                this.lastBowlStateName = "4 do mo";
                                this.bowl.setAnimation(0, this.lastBowlStateName, false);
                            } else if (isChan4trang) {
                                doorWins.push(3);
                                this.btnPayBets[3].active.active = true;

                                this.lastBowlStateName = "4 trang mo";
                                this.bowl.setAnimation(0, this.lastBowlStateName, false);
                            } else {
                                this.lastBowlStateName = "2 trang 2 do mo";
                                this.bowl.setAnimation(0, this.lastBowlStateName, false);
                            }
                        } else {
                            doorWins.push(1);
                            this.btnPayBets[1].active.active = true;
                            if (isLe3do1trang) {
                                doorWins.push(5);
                                this.btnPayBets[5].active.active = true;

                                this.lastBowlStateName = "3 do 1 trang mo";
                                this.bowl.setAnimation(0, this.lastBowlStateName, false);
                            } else if (isLe3trang1do) {
                                doorWins.push(4);
                                this.btnPayBets[4].active.active = true;

                                this.lastBowlStateName = "3 trang 1 do mo";
                                this.bowl.setAnimation(0, this.lastBowlStateName, false);
                            }
                        }

                        let chipsWithNickname: any = {};
                        for (let k in this.chipsInDoors) {
                            let doorId = parseInt(k);
                            let chips: Array<cc.Node> = this.chipsInDoors[doorId];
                            if (doorWins.indexOf(doorId) == -1) {
                                let btnPayBet = this.btnPayBets[doorId];
                                let position = btnPayBet.node.position.clone();
                                position.y -= 10;
                                let positionAdd = position.clone();
                                for (let i = 0; i < chips.length; i++) {
                                    chips[i].runAction(cc.moveTo(0.5, position).easing(cc.easeSineOut()));
                                }
                                this.scheduleOnce(() => {
                                    let node = new cc.Node();
                                    node.parent = this.chips;
                                    node.opacity = 0;
                                    for (let i = 0; i < chips.length; i++) {
                                        chips[i].parent = node;
                                        chips[i].position = positionAdd;
                                        positionAdd.y += 3;
                                    }
                                    node.runAction(cc.sequence(
                                        cc.fadeIn(0.1),
                                        cc.delayTime(0.3),
                                        cc.spawn(
                                            cc.scaleTo(0.5, 0),
                                            cc.moveTo(0.5, this.dealerHandPoint.position)
                                        ),
                                        cc.fadeOut(0.1),
                                        cc.callFunc(() => {
                                            for (let i = 0; i < chips.length; i++) {
                                                chips[i].parent = this.chips;
                                                chips[i].opacity = 255;
                                                chips[i].active = false;
                                            }
                                            node.destroy();
                                        })
                                    ))
                                }, 0.8);
                            } else {
                                for (let i = 0; i < chips.length; i++) {
                                    let chip = chips[i];
                                    let nickname = chip.name;
                                    if (!chipsWithNickname.hasOwnProperty(nickname)) {
                                        chipsWithNickname[nickname] = [];
                                    }
                                    chipsWithNickname[nickname].push(chip);
                                }
                            }
                        }

                        this.scheduleOnce(() => {
                            for (let k in chipsWithNickname) {
                                let player = this.getPlayer(k);
                                if (player != null || k == Play.COUNTER) {
                                    let chips = chipsWithNickname[k];
                                    // let positionAdd = player ? player.chipsPoint.position.clone() : cc.v2(this.counter.position.x, this.counter.position.y - 150);
                                    // let positionAdd2 = player ? player.chipsPoint2.position.clone() : cc.v2(this.counter.position.x + 20, this.counter.position.y - 150);;
                                    let positionAdd = this.getPlayer(Configs.Login.Nickname).chipsPoint.position.clone();
                                    let positionAdd2 = this.getPlayer(Configs.Login.Nickname).chipsPoint2.position.clone();
                                    let playerPosition = player ? player.node.position : this.counter.position;
                                    for (let i = 0; i < chips.length; i++) {
                                        let chip: cc.Node = chips[i];
                                        chip.runAction(cc.sequence(
                                            cc.moveTo(0.5, positionAdd).easing(cc.easeSineOut()),
                                            cc.delayTime(1 + (chips.length * 0.03 - i * 0.03)),
                                            cc.moveTo(0.5, playerPosition).easing(cc.easeSineOut()),
                                            cc.callFunc(() => {
                                                chip.active = false;
                                            })
                                        ));

                                        let dealerChip = this.getChip(0);
                                        dealerChip.getComponent(cc.Sprite).spriteFrame = chip.getComponent(cc.Sprite).spriteFrame;
                                        dealerChip.opacity = 0;
                                        dealerChip.position = this.dealerHandPoint.position;
                                        dealerChip.runAction(cc.sequence(
                                            cc.delayTime(0.5),
                                            cc.fadeIn(0.2),
                                            cc.moveTo(0.5, positionAdd2).easing(cc.easeSineOut()),
                                            cc.delayTime(0.3 + (chips.length * 0.03 - i * 0.03)),
                                            cc.moveTo(0.5, playerPosition).easing(cc.easeSineOut()),
                                            cc.callFunc(() => {
                                                dealerChip.active = false;
                                            })
                                        ));

                                        positionAdd.y += 3;
                                        positionAdd2.y += 3;
                                    }
                                }
                            }
                        }, 1.5);

                        this.scheduleOnce(() => {
                            for (let i = 0; i < res.playerInfoWin.length; i++) {
                                let playerData = res.playerInfoWin[i];
                                let player = this.getPlayer(playerData["nickname"]);
                                if (player != null) {
                                    if(player["nickname"] == Configs.Login.Nickname) {
                                        AudioManager.getInstance().playEffect(this.soundWin);
                                    }
                                    player.showWinCoin(playerData["moneyWin"]);
                                    player.setCoin(playerData["currentMoney"]);
                                }
                            }
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                        }, 3);

                        if (this.isBanker) {
                            AudioManager.getInstance().playEffect(this.soundWin);
                            this.mePlayer.showWinCoin(res.moneyBankerExchange);
                            this.mePlayer.setCoin(res.moneyBankerAfter);
                            Configs.Login.Coin = res.moneyBankerAfter;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                        }

                        XocDiaNetworkClient.getInstance().send(new cmd.CmdSendGetCau());
                    }
                    break;
                case cmd.Code.SOI_CAU:
                    {
                        let res = new cmd.ReceiveGetCau(data);
                        console.log(res);

                        this.lblHistoryOdd.string = Utils.formatNumber(res.totalOdd);
                        this.lblHistoryEven.string = Utils.formatNumber(res.totalEven);
                        // hna add
                        this.lblPopupHistoryOdd.string = Utils.formatNumber(res.totalOdd);
                        this.lblPopupHistoryEven.string = Utils.formatNumber(res.totalEven);
                        // end
                        for (let i = 0; i < this.lblHistoryItems.childrenCount; i++) {
                            if (i < res.arrayCau.length) {
                                this.lblHistoryItems.children[i].getComponent(cc.Sprite).spriteFrame = res.arrayCau[i] == 0 ? this.sfEven : this.sfOdd;
                                this.lblHistoryItems.children[i].active = true;
                            } else {
                                this.lblHistoryItems.children[i].active = false;
                            }

                            this.lblHistoryItems.children[this.lblHistoryItems.childrenCount - 1].runAction(cc.repeatForever(cc.spawn(
                                cc.sequence(cc.scaleTo(0.3, 1.3), cc.scaleTo(0.3, 1)),
                                cc.sequence(cc.tintTo(0.3, 255, 255, 255), cc.tintTo(0.3, 255, 255, 255))
                            )));
                        }
                    }
                    break;
                case cmd.Code.ORDER_BANKER:
                    {
                        let res = new cmd.ReceiveOrderBanker(data);
                        console.log(res);
                        switch (res.error) {
                            case 0:
                                break;
                            case 1:
                                App.instance.alertDialog.showMsg("Bạn cần " + Utils.formatNumber(res.moneyRequire) + " Xu để làm cái!");
                                this.btnLamCai.node.active = true;
                                break;
                            default:
                                App.instance.alertDialog.showMsg("Lỗi " + res.error + ", không xác định.");
                                this.btnLamCai.node.active = true;
                                break;
                        }
                    }
                    break;
                case cmd.Code.HUY_LAM_CAI:
                    {
                        let res = new cmd.ReceiveCancelBanker(data);
                        console.log(res);
                        if (res.bDestroy && this.isBanker) {
                            App.instance.alertDialog.showMsg("Đăng ký huỷ làm cái thành công.");
                        }
                    }
                    break;
                case cmd.Code.INFO_GATE_SELL:
                    {
                        let res = new cmd.ReceiveInfoGateSell(data);
                        console.log(res);
                        this.bankerControl.show(res.moneyOdd, res.moneyEven);
                    }
                    break;
                case cmd.Code.INFO_MONEY_AFTER_BANKER_SELL:
                    {
                        let res = new cmd.ReceiveInfoMoneyAfterBankerSell(data);
                        console.log(res);
                    }
                    break;
                case cmd.Code.CHAT_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChatRoom(data);
                        cc.log("XocDia CHAT_ROOM res : ", JSON.stringify(res));

                        let chair = res["chair"];
                        let isIcon = res["isIcon"];
                        let content = res["content"];
                        let nickname = res["nickname"];

                        if (isIcon) {
                            // Chat Icon
                            let player = this.getPlayer(nickname);
                            if (player) {
                                player.showChatEmotion(content);
                            }
                        } else {
                            // Chat Msg
                            let player = this.getPlayer(nickname);
                            if (player) {
                                player.showChatMsg(content);
                            }
                        }
                    }
                    break;
                default:
                    console.log("inpacket.getCmdId(): " + inpacket.getCmdId());
                    break;
            }
        }, this);
    }

    private showToast(notice: string) {
        this.notifier.active = true;
        this.notifyLabel.string = notice;

        // hna add
        this.notifier.stopAllActions();
        this.notifier.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.notifier.height/2)
        );
        // end

        this.scheduleOnce(() => {
            if(this.notifier) {
                // hna add
                this.notifier.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.notifier.height/2 + 100)
                );
                // end
                // this.notifier.active = false; // hna comment
            }
        }, 3);
    }

    private resetView() {
        this.mePlayer.leave();
        this.players.forEach(e => e.leave());
        this.btnPayBets.forEach(e => e.reset());

        this.dealer.setAnimation(0, "cho", true);
        this.dealer.getComponentInChildren(cc.Label).node.active = false;
        this.bowl.setAnimation(0, "bat up", false);
        this.clearChips();

        // this.sprProgressTime.node.parent.active = false; // hna comment

        // hna add
        this.lblTime.string = '';
        this.lblTime.node.parent.active = false;
        // end

        this.curTime = 0;
        this.panelPayDoor.node.active = false;
        this.bankerControl.node.active = false;
    }

    private getRandomEmptyPlayer(): Player {
        let emptyPlayers = new Array<Player>();
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].nickname == "") emptyPlayers.push(this.players[i]);
        }
        if (emptyPlayers.length > 0) {
            return emptyPlayers[Random.rangeInt(0, emptyPlayers.length)];
        }
        return null;
    }

    private getPlayer(nickname: string): Player {
        console.log("getPlayer: " + nickname);
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.nickname != "" && player.nickname == nickname) return player;
        }
        return null;
    }

    private listChip: cc.Node[] = [];
    private getChip(coin: number): cc.Node {
        let ret: cc.Node = null;
        for (let i = 0; i < this.listChip.length; i++) {
            if (!this.listChip[i].active) {
                ret = this.listChip[i];
                break;
            }
        }
        if (ret == null) {
            ret = cc.instantiate(this.chipTemplate);
            ret.parent = this.chips;
            this.listChip.push(ret);
        }
        let chipIdx = 0;
        for (let i = 0; i < this.listBets.length; i++) {
            if (this.listBets[i] == coin) {
                chipIdx = i;
                break;
            }
        }
        // chipIdx -= this.pageBet * this.betIdx;
        ret.getComponent(cc.Sprite).spriteFrame = this.sprChipSmalls[chipIdx];
        ret.opacity = 255;
        ret.active = true;
        ret.setSiblingIndex(this.chips.childrenCount - 1);
        return ret;
    }

    private clearChips() {
        this.chipTemplate.active = false;
        for (let i = 0; i < this.listChip.length; i++) {
            this.listChip[i].active = false;
        }
        this.chipsInDoors = {};
    }

    private convertMoneyToChipMoney(coin: number): Array<number> {
        let ret = new Array<number>();
        let _coin = coin;
        let minCoin = this.listBets[0];
        let counter = 0;
        while (_coin >= minCoin || counter < 15) {
            for (let i = this.listBets.length; i >= 0; i--) {
                if (_coin >= this.listBets[i]) {
                    ret.push(this.listBets[i]);
                    _coin -= this.listBets[i];
                    break;
                }
            }
            counter++;
        }
        return ret;
    }

    public show(data: cmd.ReceiveJoinRoomSuccess) {
        this.node.active = true;
        this.panelBack.active = false;
        this.resetView();
        this.roomId = data.roomId;
        this.lastUpdateTime = TimeUtils.currentTimeMillis();

        Configs.Login.Coin = data.money;
        this.isBanker = data.banker;
        this.banker = "";
        // if (this.isBanker) {
        //     this.btnHuyLamCai.node.active = true;
        //     this.btnLamCai.node.active = false;
        //     this.banker = Configs.Login.Nickname;
        // } else {
        //     this.btnLamCai.node.active = true;
        //     this.btnHuyLamCai.node.active = false;
        // }

        this.mePlayer.set(Configs.Login.Nickname, Configs.Login.Avatar, Configs.Login.Coin, data.banker);
        for (let i = 0; i < data.playerInfos.length; i++) {
            let playerData = data.playerInfos[i];
            let player = this.getRandomEmptyPlayer();
            if (player != null) {
                player.set(playerData["nickname"], playerData["avatar"], playerData["money"], playerData["banker"]);
                if (playerData["banker"]) {
                    this.banker = playerData["nickname"];
                }
            } else {
                break;
            }
        }

        let count = data.playerCount - this.players.length;
        this.counterLabel.string = count > 0 ? Utils.formatNumber(count) : "0";

        for (let i = 0; i < data.potID.length; i++) {
            let potData = data.potID[i];
            let btnPayBet = this.btnPayBets[i];
            btnPayBet.setTotalBet(potData["totalMoney"]);
            btnPayBet.setMyBet(potData["moneyBet"]);
        }

        this.gameState = data.gameState;
        let msg = "";
        switch (this.gameState) {
            case 1://bat dau van moi
                msg = "Bắt đầu ván mới";
                break;
            case 2://bat dau dat cua
                {
                    msg = "Bắt đầu đặt cửa";
                    // this.sprProgressTime.node.parent.active = true; // hna comment
                    this.curTime = TimeUtils.currentTimeMillis() + data.countTime * 1000;
                    
                    // hna add
                    this.lblTime.node.parent.active = true;
                    // end
                }
                break;
            case 3://bat dau ban cua
                {
                    if (this.isBanker) {
                        this.bankerControl.show(data.moneyPurchaseOdd, data.moneyPurchaseEven);
                    } else {
                        msg = "Chuẩn bị mở bát";
                        if (data.purchaseStatus != 1) {
                            this.panelPayDoor.show(data.purchaseStatus, data.moneyRemain);
                        }
                        for (let i = 0; i < data.list_buy_gate.length; i++) {
                            let playerData = data.list_buy_gate[i];
                            this.panelPayDoor.addUser(playerData["nickname"], playerData["money"], data.moneyRemain);
                        }
                    }
                }
                break;
            case 4://nha cai can tien, hoan tien
                msg = "Nhà cái cân tiền, hoàn tiền";
                break;
            case 5://bat dau hoan tien
                msg = "Bắt đầu hoàn tiền";
                break;
            case 6://bat dau tra thuong
                msg = "Bắt đầu trả thưởng";
                break;
        }
        if (msg != "") {
            this.dealer.setAnimation(0, "noti", false);
            this.dealer.addAnimation(0, "cho", true);
            // let label = this.dealer.getComponentInChildren(cc.Label);
            // label.string = msg;
            // label.node.active = false;
            // this.scheduleOnce(() => {
            //     label.node.active = true;
            //     this.scheduleOnce(() => {
            //         label.node.active = false;
            //     }, 0.9);
            // }, 0.3);

            this.showToast(msg);
        }

        XocDiaNetworkClient.getInstance().send(new cmd.CmdSendGetCau());
    }

    public actBack() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        XocDiaNetworkClient.getInstance().send(new cmd.SendLeaveRoom());
    }

    public actNextPageBet(){
        AudioManager.getInstance().playEffect(this.soundMoBat);
        if(this.isMovingBet)
            return;

        if((this.betIdx + 1) < this.listBets.length) {
            this.isMovingBet = true;

            for(let i=0; i<this.btnBets.length; i++) {
                let btnBet = this.btnBets[i];
                btnBet.node.runAction(cc.sequence(cc.moveTo(Play.BET_ANIM_DURATION, cc.v2(btnBet.node.x - Play.BET_SPACE, btnBet.node.y)), cc.callFunc(() => {
                    this.isMovingBet = false;
                })));

                if(this.betIdx == (i - 1)) {
                    btnBet.node.runAction(cc.scaleTo(Play.BET_ANIM_DURATION, Play.BET_ACTIVE_SCALE));
                }

                if(this.betIdx == i) {
                    btnBet.node.runAction(cc.scaleTo(Play.BET_ANIM_DURATION, Play.BET_NORMAL_SCALE));
                }
            }
            
            this.betIdx++;
        } else {
            this.showToast(Configs.LANG.CANT_ACT);
        }
    }

    public actPrevPageBet(){
        AudioManager.getInstance().playEffect(this.soundMoBat);
        if(this.isMovingBet)
            return;

        if(this.betIdx > 0) {
            this.isMovingBet = true;
            
            for(let i=0; i<this.btnBets.length; i++) {
                let btnBet = this.btnBets[i];
                btnBet.node.runAction(cc.sequence(cc.moveTo(Play.BET_ANIM_DURATION, cc.v2(btnBet.node.x + Play.BET_SPACE, btnBet.node.y)), cc.callFunc(() => {
                    this.isMovingBet = false;
                })));

                if(this.betIdx == (i + 1)) {
                    btnBet.node.runAction(cc.scaleTo(Play.BET_ANIM_DURATION, Play.BET_ACTIVE_SCALE));
                }

                if(this.betIdx == i) {
                    btnBet.node.runAction(cc.scaleTo(Play.BET_ANIM_DURATION, Play.BET_NORMAL_SCALE));
                }
            }

            this.betIdx--;
        } else {
            this.showToast(Configs.LANG.CANT_ACT);
        }
    }

    public actBuyGate() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        XocDiaNetworkClient.getInstance().send(new cmd.SendBuyGate(this.panelPayDoor.coin));
    }

    public actOrderBanker() {
        this.btnLamCai.node.active = false;
        XocDiaNetworkClient.getInstance().send(new cmd.SendOrderBanker());
    }

    public actCancelBanker() {
        this.btnHuyLamCai.node.active = false;
        XocDiaNetworkClient.getInstance().send(new cmd.SendCancelBanker());
    }

    onInviteClick() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        XocDiaNetworkClient.getInstance().send(new CardGameCmd.SendGetInfoInvite());
    }

    showPopupInvite(inviteData: CardGameCmd.ReceivedGetInfoInvite) {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        PopupInvite.createAndShow(this.popups, () => {
            let dataList = [];
            for(var i=0; i<inviteData.listUserName.length; i++) {
                dataList.push({
                    name: inviteData.listUserName[i],
                    coin: inviteData.listUserMoney[i],
                    isCheck: true,
                    dataSet: dataList
                });
            }
            PopupInvite.instance.reloadData(dataList);

            PopupInvite.instance.setListener((listNickNames) => {
                XocDiaNetworkClient.getInstance().send(new CardGameCmd.SendInvite(listNickNames));
            });
        });
    }

    showPopupAcceptInvite(acceptData: CardGameCmd.ReceivedInvite) {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        PopupAcceptInvite.createAndShow(this.popups, () => {
            PopupAcceptInvite.instance.reloadData(acceptData.inviter, acceptData.bet);

            PopupAcceptInvite.instance.setListener(() => {
                XocDiaNetworkClient.getInstance().send(new CardGameCmd.SendAcceptInvite(acceptData.inviter));
            });
        }, "Xóc Đĩa");
    }

    showUIChat() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.UI_Chat.active = true;
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2, this.UI_Chat.y)
        );
    }

    closeUIChat() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2 + this.UI_Chat.width + 100, this.UI_Chat.y)
        );
    }

    // hna add
    showUISoiCau() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.UI_SoiCau.active = true;
        this.UI_SoiCau.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2, this.UI_SoiCau.y)
        );
    }
    closeUISoiCau() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.UI_SoiCau.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2 + this.UI_SoiCau.width + 100, this.UI_SoiCau.y)
        );
    }
    // end

    chatEmotion(event, id) {
        cc.log("BaCay chatEmotion id : ", id);
        XocDiaNetworkClient.getInstance().send(new cmd.SendChatRoom(1, id));
        this.closeUIChat();
    }

    chatMsg() {
        if (this.edtChatInput.string.trim().length > 0) {
            XocDiaNetworkClient.getInstance().send(new cmd.SendChatRoom(0, this.edtChatInput.string));
            this.edtChatInput.string = "";
            this.closeUIChat();
        }
    }

    showBackPanel() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        if(this.panelBack.active)
            if(this.panelBack.getNumberOfRunningActions() == 0) {
                this.hideBackPanel();
                return;
            } else {
                return;
            }

        this.panelBack.stopAllActions();            
        this.panelBack.active = true;
        this.panelBack.x = -this.panelBack.width;

        // hna comment
        // this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(0, this.panelBack.y)), cc.callFunc(() => {
            
        // })));
        // end
        this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-Configs.App.DEVICE_RESOLUTION.width/2 + this.panelBack.width, this.panelBack.y)), cc.callFunc(() => {
            
        })));
    }

    hideBackPanel() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        if(this.panelBack.getNumberOfRunningActions() > 0)
            return;

        this.panelBack.stopAllActions();
        this.panelBack.x = 0;
        // hna comment
        // this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-this.panelBack.width, this.panelBack.y)), cc.callFunc(() => {
        //     this.panelBack.active = false;
        // })));
        // end
        this.panelBack.active = false;
    }

    actSetting() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.showToast(Configs.LANG.COOMING_SOON);
    }

    actShowGuide() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.popupGuide.active = true;
    }

    actHideGuide() {
        AudioManager.getInstance().playEffect(this.soundMoBat);
        this.popupGuide.active = false;
    }
}
