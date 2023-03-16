import MiniGame from "../../../Lobby/src/MiniGame";
import MiniGameNetworkClient from "../../../scripts/networks/MiniGameNetworkClient";
import cmd from "./BauCua.Cmd";
import InPacket from "../../../scripts/networks/Network.InPacket";
import ButtonPayBet from "./BauCua.ButtonPayBet";
import Utils from "../../../scripts/common/Utils";
import Configs from "../../../scripts/common/Configs";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import BowlController from "./BauCua.Bowl";
import AudioManager from "../../../scripts/common/Common.AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass("BauCua.ButtonBet")
export class ButtonBet {
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.SpriteFrame)
    sfNormal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfActive: cc.SpriteFrame = null;

    _isActive = false;

    setActive(isActive: boolean) {
        this._isActive = isActive;
        this.button.getComponent(cc.Sprite).spriteFrame = isActive ? this.sfActive : this.sfNormal;
        this.button.interactable = !isActive;
    }
}

@ccclass
export default class BauCuaController extends MiniGame {

    static instance: BauCuaController = null;
    static lastBeted = null;

    @property([cc.SpriteFrame])
    public sprSmallDices: cc.SpriteFrame[] = [];
    @property(cc.Label)
    public lblSession: cc.Label = null;
    @property(cc.Label)
    public lblTime: cc.Label = null;
    @property(cc.Label)
    public lblToast: cc.Label = null;
    @property(cc.Node)
    public lblWinCash: cc.Node = null;
    @property([ButtonBet])
    public buttonBets: ButtonBet[] = [];
    @property([ButtonPayBet])
    public btnPayBets: ButtonPayBet[] = [];
    @property(cc.Node)
    public nodeHistories: cc.Node = null;
    @property(cc.Node)
    public itemHistoryTemplate: cc.Node = null;
    @property(cc.Button)
    public btnConfirm: cc.Button = null;
    @property(cc.Button)
    public btnCancel: cc.Button = null;
    @property(cc.Button)
    public btnReBet: cc.Button = null;
    @property([cc.Label])
    public lblsSoiCau: cc.Label[] = [];
    @property([cc.Node])
    public popups: cc.Node[] = [];

    @property(cc.Node)
    soiCau: cc.Node = null;

    @property(cc.Node)
    hubPopupsGame: cc.Node = null;

    // hna add
    @property(BowlController)
    bowl: BowlController = null;
    @property(cc.Node)
    shadowBG: cc.Node = null;
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundNewGame: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundBet: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundResult: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundWin: cc.AudioClip = null;
    // end

    private readonly listBet = [1000, 5000, 10000, 50000, 100000, 500000, 1000000];
    private roomId = 0;
    private betIdx = 0;
    private isBetting = false;
    private historiesData = [];
    private beted = [0, 0, 0, 0, 0, 0];
    private betting = [0, 0, 0, 0, 0, 0];
    private inited = false;
    private isMove = false;
    private scale = 0.85;
    private curX = 0;
    private curY = 0;

    onLoad() {
        this.gamePlay.on(cc.Node.EventType.TOUCH_START, (event: cc.Event.EventTouch) => {
            this.isMove = false;
            this.reOrder();
        }, this);

        this.gamePlay.on(cc.Node.EventType.TOUCH_MOVE, (event: cc.Event.EventTouch) => {
            var pos = this.gamePlay.position;
            pos.x += event.getDeltaX();
            pos.y += event.getDeltaY();
            this.gamePlay.position = pos;
            this.isMove = true;
        }, this);

        this.gamePlay.on(cc.Node.EventType.TOUCH_END, (event: cc.Event.EventTouch) => {
            let check = false;
            if(Math.abs(this.gamePlay.position.x - this.curX) > 1 || Math.abs(this.gamePlay.position.y - this.curY) > 1) {
                check = true;
            }
            this.curX = this.gamePlay.position.x;
            this.curY = this.gamePlay.position.y;

            if(!this.isMove || !check) {
                this.gamePlay.runAction(cc.sequence(
                    cc.scaleTo(0.2, this.scale),
                    cc.callFunc(() => {
                        
                    })
                ));
                this.shadowBG.active = true;
            }
        }, this);
    }

    start() {
        BauCuaController.instance = this;

        this.itemHistoryTemplate.active = false;

        for (let i = 0; i < this.buttonBets.length; i++) {
            var btn = this.buttonBets[i];
            btn.setActive(i == this.betIdx);
            btn.button.node.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClickBtn);
                this.betIdx = i;
                for (let i = 0; i < this.buttonBets.length; i++) {
                    this.buttonBets[i].setActive(i == this.betIdx);
                }
            });
        }

        for (let i = 0; i < this.btnPayBets.length; i++) {
            this.btnPayBets[i].node.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClickBtn);
                this.betting[i] += this.listBet[this.betIdx];
                // this.btnPayBets[i].lblBeted.node.color = cc.Color.RED;
                // this.btnPayBets[i].lblBeted.string = this.moneyToK(this.betting[i] + this.beted[i]);
                // console.log(i);
                // this.btnPayBets[i].setBeted(this.moneyToK(this.betting[i] + this.beted[i])); // hna comment
                this.actConfirm(); // hna add
            });
        }

        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, () => {
            if (!this.node.active) return;
            this.dismiss();
        }, this);

        MiniGameNetworkClient.getInstance().addOnClose(() => {
            if (!this.node.active) return;
            this.dismiss();
        }, this);

        MiniGameNetworkClient.getInstance().addListener((data) => {
            if (!this.node.active) return;
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.INFO: {
                    this.inited = true;

                    let res = new cmd.ReceiveInfo(data);

                    // console.log(res);
                    this.isBetting = res.bettingState;
                    this.lblSession.string = "#" + res.referenceId;
                    this.lblTime.string = this.longToTime(res.remainTime);


                    let totalBets = res.potData.split(",");
                    let beted = res.betData.split(",");
                    for (let i = 0; i < this.btnPayBets.length; i++) {
                        let btnPayBet = this.btnPayBets[i];
                        // btnPayBet.lblTotal.string = this.moneyToK(parseInt(totalBets[i])); // hna comment
                        // btnPayBet.lblBeted.string = this.moneyToK(parseInt(beted[i])); // hna comment

                        // hna add
                        btnPayBet.setTotal(this.moneyToK(parseInt(totalBets[i])));
                        btnPayBet.setBeted(this.moneyToK(parseInt(beted[i])));
                        // end

                        btnPayBet.active.active = false;
                        btnPayBet.setSpriteIdle();
                        btnPayBet.button.interactable = this.isBetting;
                        btnPayBet.lblFactor.node.active = false;
                        this.beted[i] = parseInt(beted[i]);

                        // hna comment
                        // if(parseInt(beted[i]) > 0) {
                        //     btnPayBet.sprBeted.active = true;
                        // } else {
                        //     btnPayBet.sprBeted.active = false;
                        // }
                        // end
                    }

                    if (!this.isBetting) {
                        this.btnPayBets[res.dice1].active.active = true;
                        this.btnPayBets[res.dice1].setSpriteResult();
                        this.btnPayBets[res.dice2].active.active = true;
                        this.btnPayBets[res.dice2].setSpriteResult();
                        this.btnPayBets[res.dice3].active.active = true;
                        this.btnPayBets[res.dice3].setSpriteResult();

                        console.log("DICE_RESULT " + res.dice1 + " - " + res.dice2 + " - " + res.dice3);
                        res.xValue = 1;

                        if(res.dice1 == res.dice2) {
                            res.xPot = res.dice1;
                            res.xValue = 2;
                        }
                        if(res.dice1 == res.dice3) {
                            res.xPot = res.dice1;
                            res.xValue = 2;
                        }
                        if(res.dice3 == res.dice2) {
                            res.xPot = res.dice3;
                            res.xValue = 2;
                        }
                        if((res.dice1 == res.dice2) && (res.dice2 == res.dice3)) {
                            res.xPot = res.dice1;
                            res.xValue = 3;
                        }

                        if (res.xValue > 1) {
                            this.btnPayBets[res.xPot].lblFactor.node.active = true;
                            this.btnPayBets[res.xPot].lblFactor.string = "x" + res.xValue;
                        }
                    }

                    if(this.isBetting) {
                        // this.vongXoay.active = true;
                        this.bowl.setBowlIdle();
                    } else {
                        // this.vongXoay.active = false;
                        this.bowl.hideSpine();
                    }

                    if (res.lichSuPhien != "") {
                        let histories = res.lichSuPhien.split(",");
                        for (let i = 0; i < histories.length; i++) {
                            this.addHistory([
                                parseInt(histories[i]),
                                parseInt(histories[++i]),
                                parseInt(histories[++i])
                            ]);
                            ++i;
                            ++i;
                        }
                        this.caculatorSoiCau();
                    }
                    break;
                }
                case cmd.Code.START_NEW_GAME: {
                    let res = new cmd.ReceiveNewGame(data);
                    // console.log(res);
                    AudioManager.getInstance().playEffect(this.soundNewGame);
                    this.showToast("Bắt đầu phiên mới.");
                    this.lblSession.string = "#" + res.referenceId;
                    for (let i = 0; i < this.btnPayBets.length; i++) {
                        let btnPayBet = this.btnPayBets[i];
                        btnPayBet.lblBeted.string = "0"; // hna comment
                        // btnPayBet.lblBeted.node.color = cc.Color.WHITE; // hna comment
                        btnPayBet.lblTotal.string = "0"; // hna comment
                        btnPayBet.active.active = false;
                        btnPayBet.setSpriteIdle();
                        btnPayBet.button.interactable = true;
                        btnPayBet.lblFactor.node.active = false;
                        // btnPayBet.sprBeted.active = false;
                        btnPayBet.reset(); // hna add
                    }
                    this.beted = [0, 0, 0, 0, 0, 0];
                    this.betting = [0, 0, 0, 0, 0, 0];
                    this.btnConfirm.interactable = true;
                    this.btnCancel.interactable = true;
                    this.btnReBet.interactable = true;

                    // hna add
                    this.bowl.setBowlNewGame();
                    // end

                    // this.vongXoay.active = true;
                    break;
                }
                case cmd.Code.UPDATE: {
                    let res = new cmd.ReceiveUpdate(data);
                    // console.log(res);
                    this.lblTime.string = this.longToTime(res.remainTime);

                    this.isBetting = res.bettingState == 1;
                    let totalBets = res.potData.split(",");
                    for (let i = 0; i < this.btnPayBets.length; i++) {
                        let btnPayBet = this.btnPayBets[i];
                        // btnPayBet.lblTotal.string = this.moneyToK(parseInt(totalBets[i])); // hna comment
                        btnPayBet.setTotal(this.moneyToK(parseInt(totalBets[i]))); // hna add
                        if (this.isBetting) {
                            btnPayBet.active.active = false;
                            btnPayBet.setSpriteIdle();
                            btnPayBet.lblFactor.node.active = false;
                        } else {
                            btnPayBet.button.interactable = false;
                            // btnPayBet.lblBeted.string = this.moneyToK(this.beted[i]); // hna comment
                            btnPayBet.setBeted(this.moneyToK(this.beted[i]));
                            // btnPayBet.lblBeted.node.color = cc.Color.WHITE;
                        }
                    }
                    break;
                }
                case cmd.Code.RESULT: {
                    let res = new cmd.ReceiveResult(data);
                    console.log("BauCua RESULT:" + JSON.stringify(res));
                    AudioManager.getInstance().playEffect(this.soundResult);
                    this.spin(() => {
                        
                        this.bowl.setResult(res.dice1, res.dice2, res.dice3);

                        for (let i = 0; i < this.btnPayBets.length; i++) {
                            let btnPayBet = this.btnPayBets[i];
                            btnPayBet.active.active = false;
                            btnPayBet.setSpriteIdle();
                        }

                        this.scheduleOnce(() => {
                            this.btnPayBets[res.dice1].active.active = true;
                            this.btnPayBets[res.dice1].setSpriteResult();
                            this.btnPayBets[res.dice2].active.active = true;
                            this.btnPayBets[res.dice2].setSpriteResult();
                            this.btnPayBets[res.dice3].active.active = true;
                            this.btnPayBets[res.dice3].setSpriteResult();
                        }, 1.5);
                        

                        console.log("DICE_RESULT " + res.dice1 + " - " + res.dice2 + " - " + res.dice3);
                        res.xValue = 1;

                        if(res.dice1 == res.dice2) {
                            res.xPot = res.dice1;
                            res.xValue = 2;
                        }
                        if(res.dice1 == res.dice3) {
                            res.xPot = res.dice1;
                            res.xValue = 2;
                        }
                        if(res.dice3 == res.dice2) {
                            res.xPot = res.dice3;
                            res.xValue = 2;
                        }
                        if((res.dice1 == res.dice2) && (res.dice2 == res.dice3)) {
                            res.xPot = res.dice1;
                            res.xValue = 3;
                        }

                        if (res.xValue > 1) {
                            this.btnPayBets[res.xPot].lblFactor.node.active = true;
                            this.btnPayBets[res.xPot].lblFactor.string = "x" + res.xValue;
                        }

                        this.addHistory([res.dice1, res.dice2, res.dice3]);
                        this.caculatorSoiCau();
                    });

                    // this.vongXoay.active = false;
                    break;
                }
                case cmd.Code.PRIZE: {
                    let res = new cmd.ReceivePrize(data);
                    // console.log(res);
                    //show win coin
                    AudioManager.getInstance().playEffect(this.soundWin);
                    Configs.Login.Coin = res.currentMoney;
                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    this.lblWinCash.stopAllActions();
                    this.lblWinCash.position = cc.v2(-26, -16);
                    this.lblWinCash.opacity = 0;
                    this.lblWinCash.getChildByName("prize").getComponent(cc.Label).string = "+" + Utils.formatNumber(res.prize);
                    this.lblWinCash.active = true;
                    this.lblWinCash.runAction(cc.sequence(
                        cc.spawn(cc.fadeIn(0.2), cc.moveBy(2, cc.v2(0, 100))),
                        cc.fadeOut(0.15),
                        cc.callFunc(() => {
                            this.lblWinCash.active = false;
                        })
                    ));
                    break;
                }
                case cmd.Code.BET: {
                    let res = new cmd.ReceiveBet(data);
                    // console.log(res);
                    switch (res.result) {
                        case 100:
                            this.showToast("Đặt cược thất bại.");
                            break;
                        case 101:
                            this.showToast("Chưa tới thời gian đặt cược.");
                            break;
                        case 102:
                            this.showToast("Số dư không đủ.");
                            break;
                    }
                    
                    this.btnConfirm.interactable = true;
                    this.btnCancel.interactable = true;
                    this.btnReBet.interactable = true;
                    
                    if (res.result != 1) {
                        break;
                    }
                    Configs.Login.Coin = res.currentMoney;
                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    for (let i = 0; i < this.btnPayBets.length; i++) {
                        if(this.betting[i] > 0) {
                            // this.btnPayBets[i].sprBeted.active = true;
                            FacebookTracking.betBauCuaSuccess(this.betting[i]);
                        }

                        this.beted[i] += this.betting[i];
                        this.betting[i] = 0;

                        let btnPayBet = this.btnPayBets[i];
                        // btnPayBet.lblBeted.string = this.moneyToK(this.beted[i]);
                        // btnPayBet.lblBeted.node.color = cc.Color.WHITE;

                        btnPayBet.setBeted(this.moneyToK(this.beted[i]));
                    }
                    BauCuaController.lastBeted = this.beted;
                    this.showToast("Đặt cược thành công.");
                    break;
                }
            }
        }, this);
    }

    private spin(cb: () => void) {
        cb();
        // for (let i = 0; i < this.btnPayBets.length; i++) {
        //     let btnPayBet = this.btnPayBets[i];
        //     btnPayBet.active.active = true;
        // }
        // let idx = 0;
        // let count = 24;
        // this.schedule(() => {
        //     for (let i = 0; i < this.btnPayBets.length; i++) {
        //         let btnPayBet = this.btnPayBets[i];
        //         btnPayBet.active.active = i != idx;
        //     }
        //     idx++;
        //     count--;
        //     if (idx == this.btnPayBets.length - 1) {
        //         idx = 0;
        //     }
        //     if (count == 0) {
        //         cb();
        //     }
        // }, 0.07, count - 1, 0);
    }

    private longToTime(time: number): string {
        let m = parseInt((time / 60).toString());
        let s = time % 60;
        // return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
        return (s < 10 ? "0" : "") + s;
    }

    private moneyToK(money: number): string {
        if (money < 100000) {
            return Utils.formatNumber(money);
        }
        money = parseInt((money / 1000).toString());
        return Utils.formatNumber(money) + "K";
    }

    private addHistory(dices: Array<number>) {
        if (this.itemHistoryTemplate.parent.childrenCount > 20) {
            this.itemHistoryTemplate.parent.children[1].removeFromParent();
            this.historiesData.splice(0, 1);
        }
        this.historiesData.push(dices);
        let item = cc.instantiate(this.itemHistoryTemplate);
        item.parent = this.itemHistoryTemplate.parent;
        item.active = true;
        item.getChildByName("dice1").getComponent(cc.Sprite).spriteFrame = this.sprSmallDices[dices[0]];
        item.getChildByName("dice2").getComponent(cc.Sprite).spriteFrame = this.sprSmallDices[dices[1]];
        item.getChildByName("dice3").getComponent(cc.Sprite).spriteFrame = this.sprSmallDices[dices[2]];
    }

    private caculatorSoiCau() {
        let counts = [0, 0, 0, 0, 0, 0];
        for (let i = 0; i < this.historiesData.length; i++) {
            let dices = this.historiesData[i];
            for (let j = 0; j < 3; j++) {
                counts[dices[j]]++;
            }
        }
        for (let i = 0; i < this.lblsSoiCau.length; i++) {
            this.lblsSoiCau[i].string = counts[i].toString();
        }
    }

    private showToast(message: string) {
        this.lblToast.string = message;
        let parent = this.lblToast.node.parent;
        parent.stopAllActions();
        parent.active = true;
        // parent.opacity = 0;

        // hna add
        parent.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2)
        );
        // end

        this.scheduleOnce(() => {
            if(parent) {
                // hna add
                parent.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2 + 100)
                );
                // end
                // this.notifier.active = false; // hna comment
            }
        }, 3);

        // parent.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(2), cc.fadeOut(0.2), cc.callFunc(() => {
        //     parent.active = false;
        // })));
    }

    actSoiCau() {
        this.nodeHistories.active = !this.nodeHistories.active;
    }

    actCancel() {
        if (!this.inited) return;
        for (let i = 0; i < this.btnPayBets.length; i++) {
            let btnPayBet = this.btnPayBets[i];
            btnPayBet.lblBeted.node.color = cc.Color.WHITE;
            btnPayBet.lblBeted.string = this.moneyToK(this.beted[i]);
            this.betting[i] = 0;
        }
    }

    actConfirm() {
        if (!this.inited) return;
        if (!this.isBetting) {
            this.showToast("Chưa đến thời gian đặt cược.");
            return;
        }
        let total = 0;
        for (let i = 0; i < this.betting.length; i++) {
            total += this.betting[i];
        }
        if (total <= 0) {
            this.showToast("Bạn chưa đặt cửa.");
            return;
        }
        MiniGameNetworkClient.getInstance().send(new cmd.SendBet(this.betting.toString()));
        this.btnConfirm.interactable = false;
        this.btnCancel.interactable = false;
        this.btnReBet.interactable = false;

        FacebookTracking.betBauCua();
    }

    actReBet() {
        if (!this.inited) return;
        if (!this.isBetting) {
            this.showToast("Chưa đến thời gian đặt cược.");
            return;
        }
        if (BauCuaController.lastBeted == null) {
            this.showToast("Bạn chưa đặt cược trước đó.");
            return;
        }
        let totalBeted = 0;
        for (let i = 0; i < this.beted.length; i++) {
            totalBeted += this.beted[i];
        }
        if (totalBeted > 0) {
            this.showToast("Bạn chỉ có thể đặt lại cho lần cược đầu tiên.");
            return;
        }
        this.betting = BauCuaController.lastBeted;
        MiniGameNetworkClient.getInstance().send(new cmd.SendBet(BauCuaController.lastBeted.toString()));
        this.btnConfirm.interactable = false;
        this.btnCancel.interactable = false;
        this.btnReBet.interactable = false;
    }

    show() {
        if (this.node.active) {
            this.reOrder();
            return;
        }
        super.show(this.scale);
        this.shadowBG.active = true;
        this.inited = false;
        this.lblToast.node.parent.active = false;
        this.lblWinCash.active = false;
        this.betIdx = 0;
        this.betting = [0, 0, 0, 0, 0, 0];
        this.beted = [0, 0, 0, 0, 0, 0];
        this.historiesData = [];

        this.nodeHistories.active = true;
        this.nodeHistories.getComponent(cc.ScrollView).scrollToTop(0);

        for (let i = 0; i < this.buttonBets.length; i++) {
            this.buttonBets[i].setActive(i == this.betIdx);
        }
        for (let i = 0; i < this.btnPayBets.length; i++) {
            let btnPayBet = this.btnPayBets[i];
            btnPayBet.lblBeted.string = "0";
            // btnPayBet.lblBeted.node.color = cc.Color.WHITE;
            btnPayBet.lblTotal.string = "0";
            btnPayBet.lblFactor.node.active = false;
            btnPayBet.active.active = true;
            btnPayBet.setSpriteResult();
            btnPayBet.button.interactable = false;
            btnPayBet.reset(); // hna add
        }

        MiniGameNetworkClient.getInstance().send(new cmd.SendScribe(this.roomId));
    }

    dismiss() {
        super.dismiss();
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].active = false;
        }
        for (let i = 1; i < this.itemHistoryTemplate.parent.childrenCount; i++) {
            this.itemHistoryTemplate.parent.children[i].destroy();
        }
        MiniGameNetworkClient.getInstance().send(new cmd.SendUnScribe(this.roomId));
    }

    actShowSoiCau() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.soiCau.stopAllActions();

        if(!this.soiCau.active) {
            this.soiCau.active = true;
            this.soiCau.x = -this.soiCau.width;
            this.soiCau.runAction(cc.moveTo(0.5, cc.v2(0, this.soiCau.y)));
        } else {
            this.soiCau.x = 0;
            this.soiCau.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-this.soiCau.width, this.soiCau.y)), cc.callFunc(() => {
                this.soiCau.active = false;
            })));
        }
    } 

        // Popup
        showPopupRank() {
            AudioManager.getInstance().playEffect(this.soundClickBtn);
            cc.loader.loadRes("prefabs/PopupBauCua/PopupHonors", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                let popup = cc.instantiate(prefab).getComponent("BauCua.PopupHonors");
                this.hubPopupsGame.addChild(popup.node);
                popup.show();
            });
        }
    
        showPopupGuide() {
            AudioManager.getInstance().playEffect(this.soundClickBtn);
            cc.loader.loadRes("prefabs/PopupBauCua/PopupGuide", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                let popup = cc.instantiate(prefab).getComponent("Dialog");
                this.hubPopupsGame.addChild(popup.node);
                popup.show();
            });
        }
    
        showPopupHistory() {
            AudioManager.getInstance().playEffect(this.soundClickBtn);
            cc.loader.loadRes("prefabs/PopupBauCua/PopupHistory", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                let popup = cc.instantiate(prefab).getComponent("BauCua.PopupHistory");
                this.hubPopupsGame.addChild(popup.node);
                popup.show();
            });
        }

        actSmallView() {
            this.gamePlay.runAction(cc.sequence(
                cc.scaleTo(0.2, 0.5),
                cc.callFunc(() => {
                    
                })
            ));
            this.shadowBG.active = false;
        }
}
