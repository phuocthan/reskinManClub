import cmd from "./Slot2.Cmd";
import Tween from "../../../scripts/common/Tween";
import InPacket from "../../../scripts/networks/Network.InPacket";
import SlotNetworkClient from "../../../scripts/networks/SlotNetworkClient";
import Configs from "../../../scripts/common/Configs";
import Utils from "../../../scripts/common/Utils";
import TrialResults from "./Slot2.TrialResults";
import PopupSelectLine from "./Slot2.PopupSelectLine";
import PopupBonus from "./Slot2.PopupBonus";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import App from "../../../scripts/common/App";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import PopupSetting from "./Slot2.PopupSetting";

const { ccclass, property } = cc._decorator;

@ccclass
export class Slot2Controller extends cc.Component {
    @property([sp.SkeletonData])
    sprSpineItems: sp.SkeletonData[] = [];
    @property([cc.SpriteFrame])
    sprFrameItems: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sprFrameItemsBlur: cc.SpriteFrame[] = [];
    @property(cc.Node)
    columns: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;
    @property(cc.Label)
    lblJackpot: cc.Label = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Label)
    lblWinNow: cc.Label = null;
    @property(cc.Label)
    lblLine: cc.Label = null;
    @property(cc.Label)
    lblBet: cc.Label = null;
    @property(cc.Label)
    lblTotalBet: cc.Label = null;
    @property(cc.Node)
    toast: cc.Node = null;
    @property(cc.Toggle)
    toggleAuto: cc.Toggle = null;
    @property(cc.Toggle)
    toggleBoost: cc.Toggle = null;
    @property(cc.Button)
    btnTrial: cc.Button = null;
    @property(cc.SpriteFrame)
    sprFrameTrial: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sprFrameTrial2: cc.SpriteFrame = null;
    @property(cc.Button)
    btnSpin: cc.Button = null;
    @property(cc.Button)
    btnBack: cc.Button = null;
    @property(cc.Button)
    btnBet: cc.Button = null;
    @property(cc.Button)
    btnLine: cc.Button = null;
    @property(cc.Node)
    linesWin: cc.Node = null;
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
    soundOff: cc.Node = null;
    @property(cc.Node)
    musicOff: cc.Node = null;
    @property({ type: cc.AudioClip })
    musicBackground: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundSpin: cc.AudioClip = null;

    @property(cc.Node)
    popupX2: cc.Node = null;

    // hna add
    @property(cc.Node)
    popupChooseBet: cc.Node = null;
    @property(cc.Node)
    isPlayTrial: cc.Node = null;
    @property(PopupSetting)
    popupSetting: PopupSetting = null;
    @property(sp.Skeleton)
    thongTinSpine: sp.Skeleton = null;
    // @property(sp.Skeleton)
    // stopSpine: sp.Skeleton = null;
    // @property(sp.Skeleton)
    // holdSpine: sp.Skeleton = null;
    // @property(sp.Skeleton)
    // spineSpin: sp.Skeleton = null;
    // end

    private rollStartItemCount = 15;
    private rollAddItemCount = 10;
    private spinDuration = 1.2;
    private addSpinDuration = 0.3;
    private itemHeight = 0;
    private betIdx = 0;
    private listBet = [100, 1000, 10000];
    private listBetLabel = ["100", "1K", "10K"];
    private arrLineSelect = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    private isSpined = true;
    private isTrial = false;
    private mapLine = [
        [5, 6, 7, 8, 9],
        [0, 1, 2, 3, 4],
        [10, 11, 12, 13, 14],
        [5, 6, 2, 8, 9],
        [5, 6, 12, 8, 9],
        [0, 1, 7, 3, 4],
        [10, 11, 7, 13, 14],
        [0, 11, 2, 13, 4],
        [10, 1, 12, 3, 14],
        [5, 1, 12, 3, 9],
        [10, 6, 2, 8, 14],
        [0, 6, 12, 8, 4],
        [5, 11, 7, 3, 9],
        [5, 1, 7, 13, 9],
        [10, 6, 7, 8, 14],
        [0, 6, 7, 8, 4],
        [5, 1, 2, 3, 9],
        [5, 11, 12, 13, 9],
        [10, 11, 7, 3, 4],
        [0, 1, 7, 13, 14]
    ];
    private lastSpinRes = null;

    private musicSlotState = null;
    private soundSlotState = null;
    private remoteMusicBackground = null;

    private lastJackpot = 0;

    // hna add : for spin hold
    private spinCounter = 0;
    private spinTimer = null;
    // end

    // hna add
    lauchSpinTimer() {
        let _this = this;
        this.spinCounter = 0;
        this.spinTimer = setInterval(() => {
            if(_this.spinCounter === 500) {
                // _this.holdSpine.node.active = true;
                // _this.stopSpine.node.active = false;
                // _this.spineSpin.node.active = false;
                _this.spinCounter += 100;
            } else if(_this.spinCounter === 2000) {
                this.toggleAuto.isChecked = true;
                _this.toggleAutoOnCheck();
                // _this.holdSpine.node.active = false;
                // _this.stopSpine.node.active = true;
                // _this.spineSpin.node.active = false;
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
                this.popupX2.active = data.ndv == 1 ? true : false;
            }
        }, this);

        // musicSave :   0 == OFF , 1 == ON
        var musicSave = cc.sys.localStorage.getItem("music_Slot_2");
        if (musicSave != null) {
            this.musicSlotState = parseInt(musicSave);
        } else {
            this.musicSlotState = 1;
            cc.sys.localStorage.setItem("music_Slot_2", "1");
        }

        // soundSave :   0 == OFF , 1 == ON
        var soundSave = cc.sys.localStorage.getItem("sound_Slot_2");
        if (soundSave != null) {
            this.soundSlotState = parseInt(soundSave);
        } else {
            this.soundSlotState = 1;
            cc.sys.localStorage.setItem("sound_Slot_2", "1");
        }

        if (this.musicSlotState == 1) {
            this.remoteMusicBackground = cc.audioEngine.playMusic(this.musicBackground, true);
        }

        this.itemHeight = this.itemTemplate.height;
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let column = this.columns.children[i];
            let count = this.rollStartItemCount + i * this.rollAddItemCount;
            for (let j = 0; j < count; j++) {
                let item = cc.instantiate(this.itemTemplate);
                item.parent = column;
                if (j >= 3 && j < count-3) {
                    item.children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[Utils.randomRangeInt(0, this.sprFrameItemsBlur.length)];
                    item.children[1].active = false;
                } else {
                    item.children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItems[Utils.randomRangeInt(0, this.sprFrameItems.length)];
                    item.children[1].active = false;

                    // hna comment
                    // item.children[0].active = false;
                    // let skeletonData = this.sprSpineItems[Utils.randomRangeInt(0, this.sprSpineItems.length)];
                    // item.children[1].getComponent(sp.Skeleton).skeletonData = skeletonData;
                    // let anims = Object.keys(skeletonData.skeletonJson.animations);
                    // if(anims.length > 0) {
                    //     item.children[1].getComponent(sp.Skeleton).setAnimation(0, anims[0], true);
                    // }
                    // end
                }
            }
        }
        this.itemTemplate.removeFromParent();
        this.itemTemplate = null;

        // hna add : hold spin handle
        this.btnSpin.node.on("touchstart", () => {
            this.lauchSpinTimer();
        });
        this.btnSpin.node.on("touchend", () => {
            if(this.spinCounter < 500) {
                if(this.toggleAuto.isChecked) {
                    this.toggleAuto.isChecked = false;
                    this.toggleAutoOnCheck();
                    // this.holdSpine.node.active = false;
                    // this.stopSpine.node.active = false;
                    // this.spineSpin.node.active = true;
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
                        if(!this.isTrial) {
                            let res = new cmd.ReceiveUpdatePot(data);
                            Tween.numberTo(this.lblJackpot, res.valueRoom, 0.3);
                        }
                    }
                    break;
                case cmd.Code.UPDATE_RESULT:
                    {
                        let res = new cmd.ReceiveResult(data);
                        this.onSpinResult(res);
                    }
                    break;
            }
        }, this);

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
            Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3);
        }
        this.lblTotalBet.string = Utils.formatNumber(this.arrLineSelect.length * this.listBet[this.betIdx]);

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            Tween.numberTo(this.lblCoin, Configs.Login.Coin, 0.3);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
        });

        // hna add
        this.popupChooseBet.active = true;
        // end
    }

    actBet() {
        if (this.isTrial) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        var oldIdx = this.betIdx;
        this.betIdx++;
        if (this.betIdx == this.listBet.length) {
            this.betIdx = 0;
        }
        this.lblBet.string = this.listBetLabel[this.betIdx];
        Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3);
        SlotNetworkClient.getInstance().send(new cmd.SendChangeRoom(oldIdx, this.betIdx));
    }

    actLine() {
        if (this.isTrial) {
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        this.popupSelectLine.show();
    }

    actBack() {
        SlotNetworkClient.getInstance().send(new cmd.SendUnSubcribe(this.betIdx));
        cc.audioEngine.stopAll();
        App.instance.loadScene("Lobby");
    }

    actHidden() {
        this.showToast("Tính năng đang phát triển.");
    }

    actSpin() {
        this.spin();

        if (!this.isTrial) {
            FacebookTracking.spinSlot2Click();
        }
    }

    actTrial() {
        this.isTrial = !this.isTrial;
        this.btnTrial.getComponent(cc.Sprite).spriteFrame = this.isTrial ? this.sprFrameTrial2 : this.sprFrameTrial;
        if (this.isTrial) {
            this.lblLine.string = "20";
            this.lblBet.string = "10.000";
            Tween.numberTo(this.lblTotalBet, 200000, 0.3);

            this.lblCoin.string = Utils.formatNumber(Configs.App.MONEY_TRIAL);
            
            this.lastJackpot = Utils.stringToInt(this.lblJackpot.string);
            Tween.numberTo(this.lblJackpot, Configs.App.JACKPOT_TRIAL, 0.3);

            // hna add
            this.isPlayTrial.active = true;
            // end

            FacebookTracking.spinSlot2Trial();
        } else {
            this.lblLine.string = this.arrLineSelect.length.toString();
            this.lblBet.string = this.listBetLabel[this.betIdx];
            Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3);

            this.lblCoin.string = Utils.formatNumber(Configs.Login.Coin);

            Tween.numberTo(this.lblJackpot, this.lastJackpot, 0.3);

            // hna add
            this.isPlayTrial.active = false;
            // end
        }
        
    }

    actSetting() {
        // this.panelSetting.active = !this.panelSetting.active;
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

        this.popupSetting.show();
    }

    // hna add
    chooseBet(event, bet) {
        cc.log("SLOT2 chooseBet lastBet : ", this.betIdx);
        cc.log("SLOT2 chooseBet newBet : ", bet);
        let lastBet = this.betIdx;
        this.betIdx = parseInt(bet);
        SlotNetworkClient.getInstance().send(new cmd.SendChangeRoom(lastBet, this.betIdx));
        this.popupChooseBet.active = false;
        Tween.numberTo(this.lblTotalBet, this.arrLineSelect.length * this.listBet[this.betIdx], 0.3, (n) => { return Utils.formatLongNumber(n) });
        this.isTrial = true;
        this.actTrial();
    }
    gotoTrial() {
        this.isTrial = false;
        this.actTrial();
        this.popupChooseBet.active = false;
    }
    // end

    toggleAutoOnCheck() {
        if (this.toggleAuto.isChecked && this.isTrial) {
            this.toggleAuto.isChecked = false;
            this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
            return;
        }
        if (this.toggleAuto.isChecked) {
            this.spin();
            this.toggleBoost.interactable = false;

            FacebookTracking.spinSlot2Auto();
        } else {
            this.toggleBoost.interactable = true;
            if (this.isSpined) {
                this.setEnabledAllButtons(true);
            }
        }
    }

    toggleBoostOnCheck() {
        // if (this.toggleBoost.isChecked && this.isTrial) {
        //     this.toggleBoost.isChecked = false;
        //     this.showToast("Tính năng này không hoạt động ở chế độ chơi thử.");
        //     return;
        // }
        if (this.toggleBoost.isChecked) {
            this.spin();
            this.toggleAuto.interactable = false;

            FacebookTracking.spinSlot2Fast();
        } else {
            this.toggleAuto.interactable = true;
            if (this.isSpined) {
                this.setEnabledAllButtons(true);
            }
        }
    }

    settingMusic() {
        this.musicOff.active = !this.musicOff.active;
        if (this.musicOff.active) {
            cc.audioEngine.stop(this.remoteMusicBackground);
            this.musicSlotState = 0;
        } else {
            this.remoteMusicBackground = cc.audioEngine.playMusic(this.musicBackground, true);
            this.musicSlotState = 1;
        }

        cc.sys.localStorage.setItem("music_Slot_2", "" + this.musicSlotState);
    }

    settingSound() {
        this.soundOff.active = !this.soundOff.active;
        if (this.soundOff.active) {
            this.soundSlotState = 0;
        } else {
            this.soundSlotState = 1;
        }
        cc.sys.localStorage.setItem("sound_Slot_2", "" + this.soundSlotState);
    }

    private spin() {
        if (!this.isSpined) return;
        this.isSpined = false;
        this.stopAllEffects();
        this.stopShowLinesWin();
        this.setEnabledAllButtons(false);
        cc.audioEngine.stopAllEffects();
        if (this.soundSlotState == 1) {
            cc.audioEngine.play(this.soundSpin, false, 1);
        }
        if (!this.isTrial) {
            SlotNetworkClient.getInstance().send(new cmd.SendPlay(this.listBet[this.betIdx], this.arrLineSelect.toString()));
            FacebookTracking.spinSlot2();
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

    private setEnabledAllButtons(enabled: boolean) {
        this.btnSpin.interactable = enabled;
        this.btnBack.interactable = enabled;
        this.btnBet.interactable = enabled;
        // this.spineSpin.node.active = enabled; // hna add
        // this.stopSpine.node.active = !enabled; // hna add
        // this.holdSpine.node.active = false; // hna add
        this.btnLine.interactable = enabled;
        this.btnTrial.interactable = enabled;
    }

    private onSpinResult(res: cmd.ReceiveResult | any) {
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

        if (!this.isTrial) {
            let curMoney = Configs.Login.Coin - this.arrLineSelect.length * this.listBet[this.betIdx];
            Tween.numberTo(this.lblCoin, curMoney, 0.3);
            Configs.Login.Coin = res.currentMoney;

            FacebookTracking.spinSlot2Success(this.arrLineSelect.length * this.listBet[this.betIdx]);
        } else {
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
                    if (i === 4) {
                        this.spined();
                    }
                })
            ));
            roll.runAction(cc.sequence(
                cc.delayTime((0.47 + 0.2 * i) * timeScale),
                cc.callFunc(() => {
                    var children = roll.children;

                    // hna comment
                    // let spine0 = children[0].children[1].getComponent(sp.Skeleton);
                    // let spine1 = children[1].children[1].getComponent(sp.Skeleton);
                    // let spine2 = children[2].children[1].getComponent(sp.Skeleton);

                    // spine2.skeletonData = this.sprSpineItems[parseInt(matrix[i])];
                    // spine1.skeletonData = this.sprSpineItems[parseInt(matrix[5 + i])];
                    // spine0.skeletonData = this.sprSpineItems[parseInt(matrix[10 + i])]; 

                    // spine0.setAnimation(0, Object.keys(spine0.skeletonData.skeletonJson.animations)[0], true);
                    // spine1.setAnimation(0, Object.keys(spine1.skeletonData.skeletonJson.animations)[0], true);
                    // spine2.setAnimation(0, Object.keys(spine2.skeletonData.skeletonJson.animations)[0], true);

                    // let spinel1 = children[children.length - 1].children[1].getComponent(sp.Skeleton);
                    // let spinel2 = children[children.length - 2].children[1].getComponent(sp.Skeleton);
                    // let spinel3 = children[children.length - 3].children[1].getComponent(sp.Skeleton);

                    // spinel1.skeletonData = this.sprSpineItems[parseInt(matrix[i])];
                    // spinel2.skeletonData = this.sprSpineItems[parseInt(matrix[5 + i])];
                    // spinel3.skeletonData = this.sprSpineItems[parseInt(matrix[10 + i])]; 

                    // spinel1.setAnimation(0, Object.keys(spinel1.skeletonData.skeletonJson.animations)[0], true);
                    // spinel2.setAnimation(0, Object.keys(spinel2.skeletonData.skeletonJson.animations)[0], true);
                    // spinel3.setAnimation(0, Object.keys(spinel3.skeletonData.skeletonJson.animations)[0], true);
                    // end

                    children[2].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItems[parseInt(matrix[i])];
                    children[1].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItems[parseInt(matrix[5 + i])];;
                    children[0].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItems[parseInt(matrix[10 + i])];;

                    children[children.length - 1].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[parseInt(matrix[i])];
                    children[children.length - 2].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[parseInt(matrix[5 + i])];
                    children[children.length - 3].children[0].getComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[parseInt(matrix[10 + i])];
                })
            ));
        }
    }

    private spined() {
        var successResult = [0, 1, 3, 5, 6];
        switch (this.lastSpinRes.result) {
            case 0://k an
                this.showLineWins();
                break;
            case 1:// thang thuong
                this.thongTinSpine.setAnimation(0, "animation", false); // hna add
                this.showLineWins();
                break;
            case 2:// thang lon
                this.showEffectBigWin(this.lastSpinRes.prize, () => {
                    this.thongTinSpine.setAnimation(0, "animation", false); // hna add
                    this.showLineWins();
                });
                break;
            case 3://jackpot
                this.showEffectJackpot(this.lastSpinRes.prize, () => {
                    this.thongTinSpine.setAnimation(0, "animation", false); // hna add
                    this.showLineWins();
                });
                break;
            case 6://thang sieu lon
                this.showEffectBigWin(this.lastSpinRes.prize, () => {
                    this.thongTinSpine.setAnimation(0, "animation", false); // hna add
                    this.showLineWins();
                });
                break;
            case 5://bonus
                this.showEffectBonus(() => {
                    this.popupBonus.showBonus(this.isTrial ? 100 : this.listBet[this.betIdx], this.lastSpinRes.haiSao, () => {
                        this.thongTinSpine.setAnimation(0, "animation", false); // hna add
                        this.showLineWins();
                    });
                });
                break;
        }
    }

    private stopAllEffects() {
        this.effectJackpot.stopAllActions();
        this.effectJackpot.active = false;
        this.effectBigWin.stopAllActions();
        this.effectBigWin.active = false;
    }

    private showLineWins() {
        this.isSpined = true;
        Tween.numberTo(this.lblWinNow, this.lastSpinRes.prize, 0.3);
        if (!this.isTrial) {
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        } else {
            Tween.numberTo(this.lblCoin, Utils.stringToInt(this.lblCoin.string) + this.lastSpinRes.prize, 0.3);
        }
        if (!this.toggleAuto.isChecked && !this.toggleBoost.isChecked) this.setEnabledAllButtons(true);

        this.linesWin.stopAllActions();
        let linesWin = this.lastSpinRes.linesWin.split(",");
        linesWin = Utils.removeDups(linesWin);
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
                        line.active = true;
                        let mLine = this.mapLine[lineIdx];
                        let countWin = {};
                        let wildId = "1";
                        let itemCount3Win = ["0", "1", "2", "3", "4", "5", "6", "7", "8"];
                        for (let i = 0; i < mLine.length; i++) {
                            let itemId = matrix[mLine[i]];
                            if (countWin.hasOwnProperty(itemId)) {
                                countWin[itemId]++;
                            } else {
                                countWin[itemId] = 1;
                            }
                        }
                        let itemIdTemp = [];
                        if (countWin.hasOwnProperty(wildId)) {
                            itemIdTemp.push(wildId);
                            if (countWin[wildId] < 5) {
                                for (var k in countWin) {
                                    if (k !== wildId) {
                                        countWin[k] += countWin[wildId];
                                    }
                                }
                            }
                        }
                        // console.log(countWin);
                        for (let k in countWin) {
                            if (itemCount3Win.indexOf(k) >= 0 && countWin[k] >= 3) {
                                itemIdTemp.push(k);
                            }
                        }
                        // console.log(itemIdTemp);
                        for (let i = 0; i < mLine.length; i++) {
                            let itemId = mLine[i];
                            let itemIdInMatrix = matrix[mLine[i]];
                            let itemIdNumber = parseInt(itemId.toString());
                            let itemRow = parseInt((itemIdNumber / 5).toString());
                            if (itemIdTemp.indexOf(itemIdInMatrix) >= 0) {
                                rolls[i].children[2 - itemRow].stopAllActions();
                                rolls[i].children[2 - itemRow].runAction(cc.repeatForever(cc.sequence(
                                    cc.scaleTo(0.2, 1.1),
                                    cc.scaleTo(0.2, 1)
                                )));
                            }
                            // console.log("itemId: "+itemId + "itemIdx: "+itemRow);
                        }
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

    private stopShowLinesWin() {
        this.linesWin.stopAllActions();
        for (var i = 0; i < this.linesWin.childrenCount; i++) {
            this.linesWin.children[i].active = false;
        }
        this.stopAllItemEffect();
    }

    private showWinCash(cash: number) {
        this.effectWinCash.stopAllActions();
        this.effectWinCash.active = true;
        let label = this.effectWinCash.getComponentInChildren(cc.Label);
        label.string = "0";
        this.effectWinCash.opacity = 0;
        this.effectWinCash.scaleY = 0;
        this.effectWinCash.runAction(cc.sequence(
            cc.spawn(
                cc.scaleTo(0.3, 1.5),
                cc.fadeIn(0.3),
            ),
            cc.callFunc(() => {
                Tween.numberTo(label, cash, 0.5);
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
        // this.effectBigWin.getComponentInChildren(sp.Skeleton).setAnimation(0, "anim_thanglon", false);
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
        // this.effectJackpot.getComponentInChildren(sp.Skeleton).setAnimation(0, "anianim_nohumation", false);
        let label = this.effectJackpot.getComponentInChildren(cc.Label);
        label.node.active = false;

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
        // this.effectBonus.getComponentInChildren(sp.Skeleton).setAnimation(0, "loop", true); // hna add

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
            }
        }, 3);
    }

    // hna add
    actGoPopupChooseRoom() {
        this.popupChooseBet.active = true;
    }
    // end
}
export default Slot2Controller;