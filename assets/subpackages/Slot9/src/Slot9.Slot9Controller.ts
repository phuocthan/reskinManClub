import Utils from "../../../scripts/common/Utils";
import SlotNetworkClient from "../../../scripts/networks/SlotNetworkClient";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmd from "./Slot9.Cmd";
import Tween from "../../../scripts/common/Tween";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import App from "../../../scripts/common/App";
import Configs from "../../../scripts/common/Configs";
import PopupSelectLine from "./Slot9.PopupSelectLine";
import PopupBonus from "./Slot9.PopupBonus";
import TrialResults from "./Slot9.TrialResults";
import AudioManager from "../../../scripts/common/Common.AudioManager";
import SPUtils from "../../../scripts/common/SPUtils";
import ButtonListJackpot from "../../../Lobby/src/Lobby.ButtonListJackpot";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import PopupSetting from "./Slot9.PopupSetting";
import LobbyController from "../../../Lobby/src/Lobby.LobbyController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Slot9Controller extends cc.Component {

    @property([sp.SkeletonData])
    sprFrameItems: sp.SkeletonData[] = [];

    // @property([cc.SpriteFrame])
    // sprFrameSrpites: cc.SpriteFrame[] = [];

    // @property([cc.SpriteFrame])
    // sprFrameItemsBlur: cc.SpriteFrame[] = [];

    @property(cc.Node)
    columns: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;
    @property(cc.Node)
    linesWin: cc.Node = null;
    @property(cc.Node)
    iconWildColumns: cc.Node = null;

    @property(cc.Label)
    lblJackpot: cc.Label = null;
    @property(cc.Label)
    lblBet: cc.Label = null;
    @property(cc.Label)
    lblLine: cc.Label = null;
    @property(cc.Label)
    lblTotalBet: cc.Label = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Label)
    lblWinNow: cc.Label = null;
    @property(cc.Label)
    lblFreeSpinCount: cc.Label = null;

    @property(cc.Toggle)
    toggleAuto: cc.Toggle = null;
    @property(cc.Toggle)
    toggleBoost: cc.Toggle = null;
    @property(cc.Toggle)
    toggleTrial: cc.Toggle = null;

    @property(cc.Button)
    btnSpin: cc.Button = null;
    @property(sp.Skeleton)
    spineSpine: sp.Skeleton = null;
    @property(cc.Button)
    btnBack: cc.Button = null;
    // @property(cc.Button) // hna comment
    // btnBet: cc.Button = null; // hna comment
    @property(cc.Button)
    btnLine: cc.Button = null;

    @property(cc.Node)
    toast: cc.Node = null;

    @property(cc.Node)
    panelSetting: cc.Node = null;

    @property(cc.Node)
    effectWinCash: cc.Node = null;
    @property(cc.Node)
    effectBigWin: cc.Node = null;
    @property(cc.Node)
    effectJackpot: cc.Node = null;
    @property(cc.Node)
    effectBonus: cc.Node = null;

    @property(PopupSelectLine)
    popupSelectLine: PopupSelectLine = null;
    @property(PopupBonus)
    popupBonus: PopupBonus = null;

    @property(cc.Node)
    popupChooseBet: cc.Node = null;
    @property(cc.Label)
    labelRoom100: cc.Label = null;
    @property(cc.Label)
    labelRoom1k: cc.Label = null;
    @property(cc.Label)
    labelRoom10k: cc.Label = null;

    @property(cc.Node)
    soundOff: cc.Node = null;
    @property(cc.Node)
    musicOff: cc.Node = null;

    @property({ type: cc.AudioClip })
    musicBackground: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundSpinWin: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundBigWin: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundJackpot: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundBonus: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundClick: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundSpinStart: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundSpinWild: cc.AudioClip = null;

    @property(cc.Node)
    isTrial: cc.Node = null;

    @property(cc.Node)
    popupX2: cc.Node = null;

    @property(PopupSetting)
    popupSetting: PopupSetting = null;

    private rollStartItemCount = 15;
    private rollAddItemCount = 10;
    private spinDuration = 1.2;
    private addSpinDuration = 0.3;
    private itemHeight = 0;
    private betIdx = 0;
    private listBet = [100, 1000, 10000];
    private listBetLabel = ["100", "1.000", "10.000"];
    private arrLineSelect = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
    private isSpined = true;
    private readonly wildItemId = 2;
    private readonly mapLine = [
        [5, 6, 7, 8, 9],//1
        [0, 1, 2, 3, 4],//2
        [10, 11, 12, 13, 14],//3
        [0, 6, 12, 8, 4],//4
        [10, 6, 2, 8, 14],//5
        [5, 1, 2, 3, 9],//6
        [5, 11, 12, 13, 9],//7
        [0, 1, 7, 13, 14],//8
        [10, 11, 7, 3, 4],//9
        [5, 11, 7, 3, 9],//10
        [5, 1, 7, 13, 9],//11
        [0, 6, 7, 8, 4],//12
        [10, 6, 7, 8, 14],//13
        [0, 6, 2, 8, 4],//14
        [10, 6, 12, 8, 14],//15
        [5, 6, 2, 8, 9],//16
        [5, 6, 12, 8, 9],//17
        [0, 1, 12, 3, 4],//18
        [10, 11, 2, 13, 14],//19
        [0, 11, 12, 13, 4],//20
        [10, 1, 2, 3, 14],//21
        [5, 11, 2, 13, 9],//22
        [5, 1, 12, 3, 9],//23
        [0, 11, 2, 13, 4],//24
        [10, 1, 12, 3, 14]//25
    ];
    private lastSpinRes: cmd.ReceivePlay = null;
    private columnsWild = [];

    private musicSlotState = null;
    private soundSlotState = null;
    private remoteMusicBackground = null;

    private currentJackpotReal = 0;

    // hna add : for spin hold
    private spinCounter = 0;
    private spinTimer = null;
    // end

    settingMusic() {
        this.musicOff.active = !this.musicOff.active;
        if (this.musicOff.active) {
            cc.audioEngine.stop(this.remoteMusicBackground);
            this.musicSlotState = 0;
        } else {
            this.remoteMusicBackground = AudioManager.getInstance().playBackgroundMusic(this.musicBackground);
            this.musicSlotState = 1;
        }
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        cc.sys.localStorage.setItem("music_Slot_9", "" + this.musicSlotState);
    }

    settingSound() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.soundOff.active = !this.soundOff.active;
        if (this.soundOff.active) {
            this.soundSlotState = 0;
        } else {
            this.soundSlotState = 1;
        }
        cc.sys.localStorage.setItem("sound_Slot_9", "" + this.soundSlotState);
    }

    // hna add
    lauchSpinTimer() {
        let _this = this;
        this.spinCounter = 0;
        this.spinTimer = setInterval(() => {
            if(_this.spinCounter === 500) {
                _this.btnSpin.node.getChildByName("hold").active = true;
                _this.spinCounter += 100;
            } else if(_this.spinCounter === 2000) {
                this.toggleAuto.isChecked = true;
                _this.toggleAutoOnCheck();
                _this.btnSpin.node.getChildByName("hold").active = false;
                clearInterval(_this.spinTimer);
            } else {
                _this.spinCounter += 100;
            }
        }, 100);
    }
    // end

    start() {
        BroadcastReceiver.register(BroadcastReceiver.ON_X2_SLOT, (data) => {
            if (Configs.Login.IsLogin) {
                this.popupX2.active = data.sah == 1 ? true : false;
            }
        }, this);

        // musicSave :   0 == OFF , 1 == ON
        var musicSave = cc.sys.localStorage.getItem("music_Slot_9");
        if (musicSave != null) {
            this.musicSlotState = parseInt(musicSave);
        } else {
            this.musicSlotState = 1;
            cc.sys.localStorage.setItem("music_Slot_9", "1");
        }
        if (this.musicSlotState == 1) {
            this.musicOff.active = false;
        } else {
            this.musicOff.active = true;
        }

        // soundSave :   0 == OFF , 1 == ON
        var soundSave = cc.sys.localStorage.getItem("sound_Slot_9");
        if (soundSave != null) {
            this.soundSlotState = parseInt(soundSave);
        } else {
            this.soundSlotState = 1;
            cc.sys.localStorage.setItem("sound_Slot_9", "1");
        }
        if (this.soundSlotState == 1) {
            this.soundOff.active = false;
        } else {
            this.soundOff.active = true;
        }

        if (this.musicSlotState == 1) {
            this.remoteMusicBackground = AudioManager.getInstance().playBackgroundMusic(this.musicBackground);
        }

        this.itemHeight = this.itemTemplate.height;
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let column = this.columns.children[i];
            let count = this.rollStartItemCount + i * this.rollAddItemCount;
            for (let j = 0; j < count; j++) {
                let item = cc.instantiate(this.itemTemplate);
                item.parent = column;

                let randItem = Utils.randomRangeInt(0, this.sprFrameItems.length);
                item.children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[randItem];
                item.children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[randItem].skeletonJson.animations)[0], true);
                // if (j >= 3) {
                //     // item.children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[randItem].skeletonJson.animations)[0], false);
                //     item.children[2].getComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[randItem];
                // } else {
                //     // item.children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[randItem];
                //     item.children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[randItem].skeletonJson.animations)[0], true);
                // }
            }
        }
        this.itemTemplate.removeFromParent();
        this.itemTemplate = null;

        // hna add
        // this.btnSpin.node.on("mousedown", () => {
        //     this.lauchSpinTimer();
        // });
        // this.btnSpin.node.on("mouseup", () => {
        //     if(this.spinCounter < 500) {
        //         if(this.toggleAuto.isChecked) {
        //             this.toggleAuto.isChecked = false;
        //             this.toggleAutoOnCheck();
        //         } else {
        //             this.actSpin();
        //         }
        //     }
        //     clearInterval(this.spinTimer);
        //     this.spinCounter = 0;
        // });

        this.btnSpin.node.on("touchstart", () => {
            this.lauchSpinTimer();
        });
        this.btnSpin.node.on("touchend", () => {
            if(this.spinCounter < 500) {
                if(this.toggleAuto.isChecked) {
                    this.toggleAuto.isChecked = false;
                    this.toggleAutoOnCheck();
                } else {
                    this.actSpin();
                }
            }
            clearInterval(this.spinTimer);
            this.spinCounter = 0;
        });
        // end

        SlotNetworkClient.getInstance().addOnClose(() => {
            this.actBack();
        }, this);

        SlotNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.UPDATE_POT:
                    {
                        if (this.toggleTrial.isChecked)
                            return;

                        // let res = new cmd.ReceiveUpdatePot(data);
                        // Tween.numberTo(this.lblJackpot, res.jackpot, 0.3);
                        // console.log(res.jackpot);

                        let res = new cmd.ReceiveUpdatePot(data);

                        // fake data
                        if (ButtonListJackpot.lastRes && ButtonListJackpot.lastRes.Avengers1000) {
                            res.valueRoom2 = ButtonListJackpot.lastRes.Avengers1000;
                        }
                        if (ButtonListJackpot.lastRes && ButtonListJackpot.lastRes.Avengers10000) {
                            res.valueRoom3 = ButtonListJackpot.lastRes.Avengers10000;
                        }

                        Tween.numberTo(this.labelRoom100, res.valueRoom1, 0.3);
                        Tween.numberTo(this.labelRoom1k, res.valueRoom2, 0.3);
                        Tween.numberTo(this.labelRoom10k, res.valueRoom3, 0.3);
                        switch (this.betIdx) {
                            case 0:
                                Tween.numberTo(this.lblJackpot, res.valueRoom1, 0.3);
                                this.currentJackpotReal = res.valueRoom1;
                                break;
                            case 1:
                                Tween.numberTo(this.lblJackpot, res.valueRoom2, 0.3);
                                this.currentJackpotReal = res.valueRoom2;
                                break;
                            case 2:
                                Tween.numberTo(this.lblJackpot, res.valueRoom3, 0.3);
                                this.currentJackpotReal = res.valueRoom3;
                                break;
                        }
                    }
                    break;
                case cmd.Code.PLAY:
                    {
                        let res = new cmd.ReceivePlay(data);
                        // console.log(res);
                        this.onSpinResult(res);
                    }
                    break;
            }

        }, this);

        console.log("Slot3Controller started");

        SlotNetworkClient.getInstance().send(new cmd.SendSubcribe(this.betIdx));
        this.stopShowLinesWin();
        this.toast.active = false;
        this.effectWinCash.active = false;
        this.effectJackpot.active = false;
        this.effectBigWin.active = false;
        this.panelSetting.active = false;
        this.popupSelectLine.onSelectedChanged = (lines) => {
            this.arrLineSelect = lines;
            this.lblLine.string = this.arrLineSelect.length.toString();
            Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3, (n) => { return Utils.formatLongNumber(n) });
        }
        this.lblTotalBet.string = Utils.formatLongNumber((this.arrLineSelect.length * this.listBet[this.betIdx]));


        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            Tween.numberTo(this.lblCoin, Configs.Login.Coin, 0.3);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
        });
        console.log("Slot3Controller started");

        // hna add
        this.popupChooseBet.active = true;
        // end
    }

    showToast(msg: string) {
        this.toast.getComponentInChildren(cc.Label).string = msg;
        this.toast.stopAllActions();
        this.toast.active = true;
        // this.toast.runAction(cc.sequence(cc.delayTime(2), cc.callFunc(() => {
        //     this.toast.active = false;
        // })));


        // hna add
        this.toast.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.toast.height/2)
        );
        // end

        this.scheduleOnce(() => {
            if(this.toast) {
                // hna add
                this.toast.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.toast.height/2 + 150)
                );
                // end
                // this.notifier.active = false; // hna comment
            }
        }, 3);
    }

    private moneyToK(money: number): string {
        // if (money < 10000) {
        //     return money.toString();
        // }
        // money = parseInt((money / 1000).toString());
        return money.toString();
    }

    private setEnabledAllButtons(enabled: boolean) {
        this.btnSpin.interactable = enabled;
        this.spineSpine.node.active = enabled;
        this.btnBack.interactable = enabled;
        // this.btnBet.interactable = enabled; // hna comment
        this.btnLine.interactable = enabled;
        this.toggleTrial.interactable = enabled;
    }

    private stopAllEffects() {
        this.effectJackpot.stopAllActions();
        this.effectJackpot.active = false;
        this.effectBigWin.stopAllActions();
        this.effectBigWin.active = false;
    }

    private stopShowLinesWin() {
        this.linesWin.stopAllActions();
        for (var i = 0; i < this.linesWin.childrenCount; i++) {
            this.linesWin.children[i].active = false;
        }
        for (var i = 0; i < this.iconWildColumns.childrenCount; i++) {
            this.iconWildColumns.children[i].active = false;
        }
        this.stopAllItemEffect();
    }

    private stopAllItemEffect() {
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let children = this.columns.children[i].children;
            children[0].stopAllActions();
            children[1].stopAllActions();
            children[2].stopAllActions();

            children[0].runAction(cc.scaleTo(0.1, 1));
            children[1].runAction(cc.scaleTo(0.1, 1));
            children[2].runAction(cc.scaleTo(0.1, 1));
        }
    }

    actSpin() {
        this.spin();
        if (!this.toggleTrial.isChecked) {
            FacebookTracking.spinSlot9Click();
        }
    }

    private spin() {
        if (!this.isSpined) return;
        this.isSpined = false;
        this.stopAllEffects();
        this.stopShowLinesWin();
        this.setEnabledAllButtons(false);
        if (this.soundSlotState == 1) {
            AudioManager.getInstance().playEffect(this.soundSpinStart);
        }
        if (!this.toggleTrial.isChecked) {
            SlotNetworkClient.getInstance().send(new cmd.SendPlay(this.arrLineSelect.toString()));
            FacebookTracking.spinSlot9();
        } else {
            var rIdx = Utils.randomRangeInt(0, TrialResults.results.length);
            this.onSpinResult(TrialResults.results[rIdx]);
        }
    }

    private stopSpin() {
        for (var i = 0; i < this.columns.childrenCount; i++) {
            var roll = this.columns.children[i];
            roll.stopAllActions();
            roll.setPosition(cc.v2(roll.getPosition().x, 0));
        }
    }

    private showLineWins() {
        this.isSpined = true;
        Tween.numberTo(this.lblWinNow, this.lastSpinRes.prize, 0.3);

        if (!this.toggleTrial.isChecked) {
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        } else {
            Tween.numberTo(this.lblCoin, Utils.stringToInt(this.lblCoin.string) + this.lastSpinRes.prize, 0.3);
        }

        if (!this.toggleAuto.isChecked && !this.toggleBoost.isChecked) this.setEnabledAllButtons(true);

        this.linesWin.stopAllActions();
        let linesWin = this.lastSpinRes.linesWin.split(",");
        linesWin = Utils.removeDups(linesWin);
        for (let i = 0; i < linesWin.length; i++) {
            if (linesWin[i] == "0") {
                linesWin.splice(i, 1);
                i--;
            }
        }
        let matrix = this.lastSpinRes.matrix.split(",");
        let linesWinChildren = this.linesWin.children;
        let rolls = this.columns.children;
        let actions = [];
        for (let i = 0; i < linesWinChildren.length; i++) {
            linesWinChildren[i].active = linesWin.indexOf("" + (i + 1)) >= 0;;
        }
        if (this.lastSpinRes.prize > 0) {
            this.showWinCash(this.lastSpinRes.prize);
            actions.push(cc.delayTime(1.5));
            actions.push(cc.callFunc(function () {
                for (let i = 0; i < linesWinChildren.length; i++) {
                    linesWinChildren[i].active = false;
                }
            }));
            actions.push(cc.delayTime(0.3));
            if (!this.toggleBoost.isChecked) {
                for (let i = 0; i < linesWin.length; i++) {
                    let lineIdx = parseInt(linesWin[i]) - 1;
                    let line = linesWinChildren[lineIdx];
                    actions.push(cc.callFunc(() => {
                        // console.log("================: " + lineIdx);
                        line.active = true;
                        let mLine = this.mapLine[lineIdx];
                        let countItemWin = 0;
                        let fisrtItemId = matrix[mLine[0]];
                        for (let j = 0; j < mLine.length; j++) {
                            let itemId = matrix[mLine[j]];
                            if (fisrtItemId == itemId || parseInt(itemId) == this.wildItemId || this.columnsWild.indexOf(j) >= 0) {
                                // console.log("==" + itemId + " j:" + j);
                                countItemWin++;
                            } else {
                                break;
                            }
                        }
                        for (let j = 0; j < countItemWin; j++) {
                            let itemRow = parseInt((mLine[j] / 5).toString());
                            rolls[j].children[2 - itemRow].stopAllActions();
                            rolls[j].children[2 - itemRow].runAction(cc.repeatForever(cc.sequence(
                                cc.scaleTo(0.2, 1.1),
                                cc.scaleTo(0.2, 1)
                            )));
                        }
                        // console.log("lineIdx: " + lineIdx + "fisrtItemId: " + fisrtItemId + " countItemWin: " + countItemWin);
                    }));
                    actions.push(cc.delayTime(1));
                    actions.push(cc.callFunc(() => {
                        line.active = false;
                        this.stopAllItemEffect();
                    }));
                    actions.push(cc.delayTime(0.1));
                }
            }
        }
        if (actions.length == 0) {
            actions.push(cc.callFunc(() => {
                //fixed call cc.sequence.apply
            }))
        }
        actions.push(cc.callFunc(() => {
            if (this.toggleBoost.isChecked || this.toggleAuto.isChecked) {
                this.spin();
            }
        }));
        this.linesWin.runAction(cc.sequence.apply(null, actions));
    }

    private showWinCash(cash: number) {
        this.effectWinCash.stopAllActions();
        this.effectWinCash.active = true;
        let label = this.effectWinCash.getComponentInChildren(cc.Label);
        label.string = "0";

        this.effectWinCash.opacity = 0;
        this.effectWinCash.scaleY = 0;
        this.effectWinCash.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.75, 1).easing(cc.easeBounceInOut()), cc.fadeIn(0.75)),
            cc.callFunc(() => {
                Tween.numberTo(label, cash, 1);
            }),
            cc.delayTime(1.5),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                this.effectWinCash.active = false;
            })
        ));
    }

    private showEffectBigWin(cash: number, cb: () => void) {
        this.effectBigWin.stopAllActions();
        this.effectBigWin.active = true;
        // this.effectBigWin.getComponentInChildren(sp.Skeleton).setAnimation(0, "anim_thanglonwukong", false);
        let label = this.effectBigWin.getComponentInChildren(cc.Label);
        label.node.active = false;

        this.effectBigWin.opacity = 0;
        this.effectBigWin.scale = 0;
        this.effectBigWin.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(1, 1.5).easing(cc.easeBounceInOut()), cc.fadeIn(1)),
            cc.callFunc(() => {
                label.string = "";
                label.node.active = true;
                Tween.numberTo(label, cash, 1);
            }),
            cc.delayTime(3),
            cc.callFunc(() => {
                this.effectBigWin.active = false;
                this.effectBigWin.stopAllActions();
                if (cb != null) cb();
            })
        ));
    }

    private showEffectJackpot(cash: number, cb: () => void = null) {
        this.effectJackpot.stopAllActions();
        this.effectJackpot.active = true;
        // this.effectJackpot.getComponentInChildren(sp.Skeleton).setAnimation(0, "anim_nohuwukong", false);
        let label = this.effectJackpot.getComponentInChildren(cc.Label);
        label.node.active = false;

        // this.effectJackpot.runAction(cc.sequence(
        //     cc.delayTime(1),
        //     cc.callFunc(() => {
        //         label.string = "";
        //         label.node.active = true;
        //         Tween.numberTo(label, cash, 1);
        //         this.effectJackpot.getComponentInChildren(sp.Skeleton).setAnimation(0, "avenger_jackpot", false);
        //     }),
        //     cc.delayTime(1.5),
        //     cc.callFunc(() => {
        //         this.effectJackpot.getComponentInChildren(sp.Skeleton).setAnimation(0, "disappear", false);
        //     }),
        //     cc.delayTime(1),
        //     cc.callFunc(() => {
        //         this.effectJackpot.active = false;
        //         if (cb != null) cb();
        //     })
        // ));

        this.effectJackpot.opacity = 0;
        this.effectJackpot.scale = 0;
        this.effectJackpot.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(1, 1.5).easing(cc.easeBounceInOut()), cc.fadeIn(1)),
            cc.callFunc(() => {
                label.string = "";
                label.node.active = true;
                Tween.numberTo(label, cash, 1);
            }),
            cc.delayTime(3),
            cc.callFunc(() => {
                this.effectJackpot.active = false;
                this.effectJackpot.stopAllActions();
                if (cb != null) cb();
            })
        ));
    }

    private showEffectBonus(cb: () => void) {
        this.effectBonus.stopAllActions();
        this.effectBonus.active = true;
        // this.effectBonus.getComponentInChildren(sp.Skeleton).setAnimation(0, "anim_bonuswukong", false);

        this.effectBonus.opacity = 0;
        this.effectBonus.scale = 0;
        this.effectBonus.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(1, 1.5).easing(cc.easeBounceInOut()), cc.fadeIn(1)),
            cc.delayTime(3),
            cc.callFunc(() => {
                this.effectBonus.active = false;
                this.effectBonus.stopAllActions();
                if (cb != null) cb();
            })
        ));
    }

    private onSpinResult(res: cmd.ReceivePlay | any) {
        this.stopSpin();

        var successResult = [0, 1, 2, 3, 5, 6];
        //res.result == 5 //bonus
        //res.result == 0 //khong an
        //res.result == 1 //thang thuong
        //res.result == 2 //thang lon
        //res.result == 3 //no hu
        //res.result == 6 //thang cuc lon
        if (successResult.indexOf(res.result) === -1) {
            this.isSpined = true;

            this.toggleAuto.isChecked = false;
            this.toggleAuto.interactable = true;
            this.toggleBoost.isChecked = false;
            this.toggleBoost.interactable = true;


            this.setEnabledAllButtons(true);
            switch (res.result) {
                case 102:
                    this.showToast("Số dư không đủ, vui lòng nạp thêm.");
                    break;
                default:
                    this.showToast("Có lỗi sảy ra, vui lòng thử lại.");
                    break;
            }
            return;
        }
        this.lastSpinRes = res;
        this.columnsWild.length = 0;

        if (!this.toggleTrial.isChecked && !this.lastSpinRes.isFree) {
            let curMoney = Configs.Login.Coin - this.arrLineSelect.length * this.listBet[this.betIdx];
            Tween.numberTo(this.lblCoin, curMoney, 0.3);
            Configs.Login.Coin = res.currentMoney;

            FacebookTracking.spinSlot9Success(this.arrLineSelect.length * this.listBet[this.betIdx]);
            FacebookTracking.spinSlot9Bet(this.listBet[this.betIdx]);
        }
        if (this.toggleTrial.isChecked) {
            Tween.numberTo(this.lblCoin, Utils.stringToInt(this.lblCoin.string) - this.arrLineSelect.length * this.listBet[2], 0.3);
        }

        let matrix = res.matrix.split(",");
        let timeScale = this.toggleBoost.isChecked ? 0.5 : 1;
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let roll = this.columns.children[i];
            let step1Pos = this.itemHeight * 0.3;
            let step2Pos = -this.itemHeight * roll.childrenCount + this.itemHeight * 3 - this.itemHeight * 0.3;
            let step3Pos = -this.itemHeight * roll.childrenCount + this.itemHeight * 3;
            roll.runAction(cc.sequence(
                cc.delayTime(0.2 * i * timeScale),
                cc.moveTo(0.2 * timeScale, cc.v2(roll.position.x, step1Pos)).easing(cc.easeQuadraticActionOut()),
                cc.moveTo((this.spinDuration + this.addSpinDuration * i) * timeScale, cc.v2(roll.position.x, step2Pos)).easing(cc.easeQuadraticActionInOut()),
                cc.moveTo(0.2 * timeScale, cc.v2(roll.position.x, step3Pos)).easing(cc.easeQuadraticActionIn()),
                cc.callFunc(() => {
                    roll.setPosition(cc.v2(roll.position.x, 0));
                    if (i == 4) {
                        //find columns wild
                        for (let j = 0; j < matrix.length; j++) {
                            if (parseInt(matrix[j]) == this.wildItemId) {
                                let c = j % 5;
                                if (this.columnsWild.indexOf(c) == -1) this.columnsWild.push(c);
                            }
                        }
                        //replace wild items in columns
                        for (let j = 0; j < this.columnsWild.length; j++) {
                            let c = this.columnsWild[j];
                            let children = this.columns.children[c].children;
                            // children[2].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[this.wildItemId];
                            // children[1].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[this.wildItemId];
                            // children[0].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[this.wildItemId];

                            children[2].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[this.wildItemId];
                            children[1].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[this.wildItemId];
                            children[0].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[this.wildItemId];

                            children[2].children[1].getComponent(sp.Skeleton).setAnimation(1, Object.keys(this.sprFrameItems[this.wildItemId].skeletonJson.animations)[0], true);
                            children[1].children[1].getComponent(sp.Skeleton).setAnimation(1, Object.keys(this.sprFrameItems[this.wildItemId].skeletonJson.animations)[0], true);
                            children[0].children[1].getComponent(sp.Skeleton).setAnimation(1, Object.keys(this.sprFrameItems[this.wildItemId].skeletonJson.animations)[0], true);

                            this.iconWildColumns.children[c].active = true;
                            if (this.soundSlotState == 1) {
                                AudioManager.getInstance().playEffect(this.soundSpinWild);
                            }
                        }
                        if (this.columnsWild.length > 0) {
                            roll.runAction(cc.sequence(
                                cc.delayTime(1), // 2.6
                                // cc.callFunc(() => {
                                //     for (let i = 0; i < this.iconWildColumns.childrenCount; i++) {
                                //         this.iconWildColumns.children[i].active = false;
                                //     }
                                // }),
                                cc.delayTime(0.1),
                                cc.callFunc(() => {
                                    this.spined();
                                })
                            ));
                        } else {
                            this.spined();
                        }
                    }
                })
            ));
            roll.runAction(cc.sequence(
                cc.delayTime((0.47 + 0.2 * i) * timeScale),
                cc.callFunc(() => {
                    var children = roll.children;
                    // children[2].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[i])];
                    // children[1].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[5 + i])];
                    // children[0].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[10 + i])];

                    // children[children.length - 1].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[i])];
                    // children[children.length - 2].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[5 + i])];
                    // children[children.length - 3].children[1].getComponent(cc.Sprite).spriteFrame = this.sprFrameSrpites[parseInt(matrix[10 + i])];

                    children[2].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[i])];
                    children[1].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[5 + i])];
                    children[0].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[10 + i])];

                    children[2].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[i])].skeletonJson.animations)[0], true);
                    children[1].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[5 + i])].skeletonJson.animations)[0], true);
                    children[0].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[10 + i])].skeletonJson.animations)[0], true);

                    children[children.length - 1].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[i])];
                    children[children.length - 2].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[5 + i])];
                    children[children.length - 3].children[1].getComponent(sp.Skeleton).skeletonData = this.sprFrameItems[parseInt(matrix[10 + i])];

                    children[children.length - 1].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[i])].skeletonJson.animations)[0], false);
                    children[children.length - 2].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[5 + i])].skeletonJson.animations)[0], false);
                    children[children.length - 3].children[1].getComponent(sp.Skeleton).setAnimation(0, Object.keys(this.sprFrameItems[parseInt(matrix[10 + i])].skeletonJson.animations)[0], false);
                })
            ));
        }
    }

    private spined() {
        this.lblFreeSpinCount.string = this.lastSpinRes.freeSpin.toString();

        var successResult = [0, 1, 3, 5, 6];
        switch (this.lastSpinRes.result) {
            case 0://k an
                // AudioManager.getInstance().playEffect(this.soundSpinMis);
                this.showLineWins();
                break;
            case 1:// thang thuong
                if (this.soundSlotState == 1) {
                    AudioManager.getInstance().playEffect(this.soundSpinWin);
                }
                this.showLineWins();
                break;
            case 2:// thang lon
                if (this.soundSlotState == 1) {
                    AudioManager.getInstance().playEffect(this.soundBigWin);
                }
                this.showEffectBigWin(this.lastSpinRes.prize, () => {
                    this.showLineWins();
                });
                break;
            case 3://jackpot
                if (this.soundSlotState == 1) {
                    AudioManager.getInstance().playEffect(this.soundJackpot);
                }
                this.showEffectJackpot(this.lastSpinRes.prize, () => {
                    this.showLineWins();
                });
                break;
            case 6://thang sieu lon
                if (this.soundSlotState == 1) {
                    AudioManager.getInstance().playEffect(this.soundBigWin);
                }
                this.showEffectBigWin(this.lastSpinRes.prize, () => {
                    this.showLineWins();
                });
                break;
            case 5://bonus
                if (this.soundSlotState == 1) {
                    AudioManager.getInstance().playEffect(this.soundBonus);
                }
                this.showEffectBonus(() => {
                    this.popupBonus.showBonus(this.lastSpinRes.haiSao, () => {
                        this.showLineWins();
                    });
                });
                break;
        }
    }

    actBack() {
        SlotNetworkClient.getInstance().send(new cmd.SendUnSubcribe(this.betIdx));
        cc.audioEngine.stopAll();
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        App.instance.loadScene("Lobby");
    }

    actHidden() {
        this.showToast("Tính năng đang phát triển.");
    }

    actBet() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        if (this.toggleTrial.isChecked) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        this.betIdx++;
        if (this.betIdx >= this.listBet.length) {
            this.betIdx = 0;
        }
        SlotNetworkClient.getInstance().send(new cmd.SendChangeRoom(this.betIdx, this.betIdx));
        this.lblBet.string = this.listBetLabel[this.betIdx];
        Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3, (n) => { return Utils.formatLongNumber(n) });
    }

    changeBet() {
        this.popupChooseBet.active = !this.popupChooseBet.active;
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
    }

    chooseBet(event, bet) {
        cc.log("SLOT9 chooseBet lastBet : ", this.betIdx);
        cc.log("SLOT9 chooseBet newBet : ", bet);
        let lastBet = this.betIdx;
        this.betIdx = parseInt(bet);
        SlotNetworkClient.getInstance().send(new cmd.SendChangeRoom(lastBet, this.betIdx));
        this.popupChooseBet.active = false;
        Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3, (n) => { return Utils.formatLongNumber(n) });
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.isTrial.active = false; // hna add
        this.toggleTrial.isChecked = false;
        this.toggleTrialOnCheck();
    }

    nextBet() {
        if (this.toggleTrial.isChecked) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }

        if (this.betIdx >= this.listBet.length - 1) {
            this.betIdx = 0;
        } else {
            this.betIdx++;
        }

        this.chooseBet(null, this.betIdx);
    }

    previousBet() {
        if (this.toggleTrial.isChecked) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }

        if (this.betIdx <= 0) {
            this.betIdx = this.listBet.length - 1;
        } else {
            this.betIdx--;
        }

        this.chooseBet(null, this.betIdx);
    }

    actLine() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        if (this.toggleTrial.isChecked) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        this.popupSelectLine.show();
    }

    actSetting() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.popupSetting.show();
    }

    actSetting1() {
        this.panelSetting.active = !this.panelSetting.active;
        if (this.musicSlotState == 0) {
            this.musicOff.active = true;
        } else {
            this.musicOff.active = false;
        }

        if (this.soundSlotState == 0) {
            this.soundOff.active = true;
        } else {
            this.soundOff.active = false;
        }

        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
    }

    toggleTrialOnCheck() {
        if (this.toggleTrial.isChecked) {
            this.toggleTrial.node.children[0].active = false;

            this.lblLine.string = "25";

            this.lblTotalBet.string = Utils.formatLongNumber(250000);
            this.lblBet.string = Utils.formatLongNumber(10000);

            this.lblCoin.string = Utils.formatNumber(Configs.App.MONEY_TRIAL);
            this.lblJackpot.string = Utils.formatNumber(Configs.App.JACKPOT_TRIAL);

            FacebookTracking.spinSlot9Trial();
        } else {
            this.toggleTrial.node.children[0].active = true;

            this.lblLine.string = this.arrLineSelect.length.toString();
            this.lblBet.string = Utils.formatLongNumber(this.listBet[this.betIdx]);
            Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3, (n) => Utils.formatLongNumber(n));

            this.lblCoin.string = Utils.formatNumber(Configs.Login.Coin);

            this.lblJackpot.string = Utils.formatNumber(this.currentJackpotReal);
        }
    }

    toggleAutoOnCheck() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        if (this.toggleAuto.isChecked && this.toggleTrial.isChecked) {
            this.toggleAuto.isChecked = false;
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        if (this.toggleAuto.isChecked) {
            this.spin();
            this.toggleBoost.interactable = false;

            FacebookTracking.spinSlot9Auto();
        } else {
            this.toggleBoost.interactable = true;
            if (this.isSpined) {
                this.setEnabledAllButtons(true);
            }
        }
    }

    toggleBoostOnCheck() {
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        if (this.toggleBoost.isChecked && this.toggleTrial.isChecked) {
            this.toggleBoost.isChecked = false;
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        if (this.toggleBoost.isChecked) {
            this.spin();
            this.toggleAuto.interactable = false;

            FacebookTracking.spinSlot9Fast();
        } else {
            this.toggleAuto.interactable = true;
            if (this.isSpined) {
                this.setEnabledAllButtons(true);
            }
        }
    }

    playTrial() {
        this.toggleTrial.isChecked = true;
        this.isTrial.active = true; // hna add
        this.toggleTrialOnCheck();
        this.popupChooseBet.active = false;
    }

    // hna add
    actGoPopupChooseRoom() {
        this.popupChooseBet.active = true;
    }
    // end
}
