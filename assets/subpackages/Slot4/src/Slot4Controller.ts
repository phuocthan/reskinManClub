import cmd from './Slot4Cmd';
import SlotNetworkClient from '../../../scripts/networks/SlotNetworkClient';
import InPacket from "../../../scripts/networks/Network.InPacket";
import Tween from "../../../scripts/common/Tween";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import App from "../../../scripts/common/App";
import Configs from "../../../scripts/common/Configs";
import Utils from "../../../scripts/common/Utils";
import Slot4ChooseLine from './Slot4ChooseLine';
import Slot4TrialResult from './Slot4TrialResult';
import AlertDialog from '../../../scripts/common/AlertDialog';
import SpinControl from '../../../scripts/common/SpinControl';
import PopupBonus from './Slot4.PopupBonus';
import Slot4Icon from './Slot4Icon';
import FacebookTracking from '../../../scripts/common/FacebookTracking';
import PopupSetting from "./Slot4.PopupSetting";


const { ccclass, property } = cc._decorator;

@ccclass
export default class Slot4Controller extends cc.Component {
    @property
    numberOfItemInCol: number = 20;

    @property(cc.Prefab)
    iconPrefab: cc.Prefab = null;

    @property(cc.Node)
    colParent: cc.Node = null;

    @property([cc.Color])
    pickLineColor: cc.Color[] = []; // 0: inactive, 1: active

    @property(cc.Label)
    jackpotLabel: cc.Label = null;

    @property(cc.Label)
    moneyLabel: cc.Label = null;

    @property(cc.Label)
    currentBetLabel: cc.Label = null;
    @property(cc.Label)
    totalLineLabel: cc.Label = null;

    @property(cc.Button)
    btnSpin: cc.Button = null;
    @property(cc.Toggle)
    toggleAuto: cc.Toggle = null;
    @property(cc.Toggle)
    toggleFast: cc.Toggle = null;
    @property(cc.Toggle)
    toggleTrial: cc.Toggle = null;

    @property(cc.Button)
    btnBack: cc.Button = null;

    //win
    @property(cc.Node)
    winNormalBg: cc.Node = null;
    @property(cc.Node)
    bonusNode: cc.Node = null;
    @property(cc.Node)
    bigWinNode: cc.Node = null;
    @property(cc.Node)
    jackpotNode: cc.Node = null;

    @property(cc.Label)
    winLabel: cc.Label = null;

    //line win
    @property(cc.Node)
    lineWinParent: cc.Node = null;

    //show result
    @property(cc.Label)
    totalWinLabel: cc.Label = null;
    @property(cc.Label)
    totalBetLabel: cc.Label = null;

    //choose line
    @property(Slot4ChooseLine)
    chooseLineScript: Slot4ChooseLine = null;
    @property(cc.Node)
    chooseLinePanel: cc.Node = null;

    @property(cc.Node)
    popupChooseBet: cc.Node = null;
    @property(cc.Label)
    labelRoom100: cc.Label = null;
    @property(cc.Label)
    labelRoom1k: cc.Label = null;
    @property(cc.Label)
    labelRoom5k: cc.Label = null;
    @property(cc.Label)
    labelRoom10k: cc.Label = null;
    @property(cc.Node)
    popupGuide: cc.Node = null;

    @property(cc.Node)
    musicOff: cc.Node = null;
    @property({ type: cc.AudioClip })
    musicBackground: cc.AudioClip[] = [];

    @property({ type: cc.AudioClip })
    soundSpinMis: cc.AudioClip = null;
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
    soundSpin: cc.AudioClip = null;

    @property(SpinControl)
    spinControl: SpinControl = null;

    @property(PopupBonus)
    popupBonus: PopupBonus = null;

    @property(cc.Node)
    toast: cc.Node = null;

    @property(cc.Button)
    btnLine: cc.Button = null;
    @property(cc.Button)
    btnBet: cc.Button = null;

    @property(cc.Node)
    popupX2: cc.Node = null;

    // hna add
    @property(sp.Skeleton)
    chooseLineSpine: sp.Skeleton = null;
    @property(PopupSetting)
    popupSetting: PopupSetting = null;
    @property(cc.Node)
    isTrialSpr: cc.Node = null;
    @property(sp.Skeleton)
    stopSpine: sp.Skeleton = null;
    @property(sp.Skeleton)
    holdSpine: sp.Skeleton = null;
    @property(sp.Skeleton)
    spineSpin: sp.Skeleton = null;
    // end

    private static readonly TOTAL_ITEM = 7;

    private listCol: cc.Node[] = [];                //list 5 col
    private listActiveItem: cc.Node[] = [];         //list 15 item nhin thay tren man hinh

    private TIME_COL_FINISH: number = 2;
    private TIME_DELAY_BETWEEN_COL: number = 0.3;
    private TIME_DELAY_SHOW_LINE: number = 1;
    private SPEED: number = 1;

    private betId = 0;
    private listBet = [100, 1000, 10000];
    private listBetString = ["100", "1K", "10K"];
    private arrLineSelected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    private isTrial: Boolean = false;
    private isSpining: Boolean = false;
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

    private musicSlotState = null;
    private remoteMusicBackground = null;

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
            var musicId = this.randomBetween(0, 1);
            this.remoteMusicBackground = cc.audioEngine.playMusic(this.musicBackground[musicId], true);
            this.musicSlotState = 1;
        }

        cc.sys.localStorage.setItem("music_Slot_4", "" + this.musicSlotState);
    }

    // hna add
    lauchSpinTimer() {
        let _this = this;
        this.spinCounter = 0;
        this.spinTimer = setInterval(() => {
            if(_this.spinCounter === 500) {
                _this.holdSpine.node.active = true;
                _this.stopSpine.node.active = false;
                _this.spineSpin.node.active = false;
                _this.spinCounter += 100;
            } else if(_this.spinCounter === 2000) {
                this.toggleAuto.isChecked = true;
                _this.setAutoSpin();
                _this.holdSpine.node.active = false;
                _this.stopSpine.node.active = true;
                _this.spineSpin.node.active = false;
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
                this.popupX2.active = data.vqv == 1 ? true : false;
            }
        }, this);
        // musicSave :   0 == OFF , 1 == ON
        var musicSave = cc.sys.localStorage.getItem("music_Slot_4");
        if (musicSave != null) {
            this.musicSlotState = parseInt(musicSave);
        } else {
            this.musicSlotState = 1;
            cc.sys.localStorage.setItem("music_Slot_4", "1");
        }

        if (this.musicSlotState == 0) {
            this.musicOff.active = true;
        } else {
            this.musicOff.active = false;
        }

        if (this.musicSlotState == 1) {
            var musicId = this.randomBetween(0, 1);
            this.remoteMusicBackground = cc.audioEngine.playMusic(this.musicBackground[musicId], true);
        }

        this.init();

        // hna add : hold spin handle
        this.btnSpin.node.on("touchstart", () => {
            this.lauchSpinTimer();
        });
        this.btnSpin.node.on("touchend", () => {
            if(this.spinCounter < 500) {
                if(this.toggleAuto.isChecked) {
                    this.toggleAuto.isChecked = false;
                    this.setAutoSpin();
                    this.holdSpine.node.active = false;
                    this.stopSpine.node.active = false;
                    this.spineSpin.node.active = true;
                } else {
                    this.spinClick();
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
            console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {
                case cmd.Code.UPDATE_POT:
                    {
                        if(this.isTrial) {
                            return;
                        }

                        let res = new cmd.ReceiveUpdatePot(data);
                        Tween.numberTo(this.labelRoom100, res.valueRoom1, 0.3);
                        Tween.numberTo(this.labelRoom1k, res.valueRoom2, 0.3);
                        Tween.numberTo(this.labelRoom10k, res.valueRoom3, 0.3);
                        switch (this.betId) {
                            case 0:
                                Tween.numberTo(this.jackpotLabel, res.valueRoom1, 0.3);
                                break;
                            case 1:
                                Tween.numberTo(this.jackpotLabel, res.valueRoom2, 0.3);
                                break;
                            case 2:
                                Tween.numberTo(this.jackpotLabel, res.valueRoom3, 0.3);
                                break;
                        }
                    }
                    break;
                case cmd.Code.UPDATE_RESULT:
                    {
                        let res = new cmd.ReceiveResult(data);
                        this.spinResult(res);
                    }
                    break;
            }
        }, this);

        SlotNetworkClient.getInstance().send(new cmd.SendSubcribe(this.betId));

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            Tween.numberTo(this.moneyLabel, Configs.Login.Coin, 0.3);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
        });

        this.currentBetLabel.string = Utils.formatNumber(this.listBet[this.betId]);

        this.chooseLineScript.onSelectedChanged = (lines) => {
            this.arrLineSelected = lines;
            cc.log("SLOT4 chooseLines : ", lines);
            // this.totalLineLabel.string = lines.length.toString(); hna comment

            // hna add
            this.chooseLineSpine.setAnimation(0, `num_${lines.length.toString()}`, true);
            // end
            Tween.numberTo(this.totalBetLabel, lines.length * this.listBet[this.betId], 0.3);
        }

        this.popupChooseBet.active = true;
    }

    init() {
        //declare 5 col
        this.listCol = [];
        for (let i = 0; i < this.colParent.childrenCount; i++) {
            let col = this.colParent.children[i];
            this.listCol.push(col);
        }
        this.randomFirst();
    }

    /**
     * random 15 icon, theo hang ngang
     */
    randomFirst() {
        for (let i = 0; i < this.listCol.length; i++) {
            for (let j = 0; j < this.numberOfItemInCol; j++) {
                let icon = cc.instantiate(this.iconPrefab);
                icon.parent = this.listCol[i];
                let randomSprite = this.randomBetween(0, Slot4Controller.TOTAL_ITEM - 1);

                icon.getComponent(Slot4Icon).setSpine(randomSprite);
                // icon.setPosition(cc.v2(0, (this.listCol[i].height/2 + icon.height/2 - j*(icon.height)))); // hna comment
                icon.setPosition(cc.v2(0, (this.listCol[i].height/2 + icon.height/2 - (j+1)*(icon.height)))); // hna add
            }
        }
    }

    /**
     * random between, min, max included
     */
    randomBetween(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    spinClick() {
        if (!this.isTrial && Configs.Login.Coin < this.listBet[this.betId] * this.arrLineSelected.length) {
            App.instance.alertDialog.showMsg("Số dư không đủ");
            return;
        }
        if (this.toggleAuto.isChecked || this.toggleFast.isChecked) {

        } else {
            if (this.musicSlotState == 1) {
                cc.audioEngine.play(this.soundClick, false, 1);
            }

            if (!this.isTrial) {
                FacebookTracking.spinSlot4Click();
            }
        }

        //hide effect
        this.hideWinEffect();
        this.hideLineWin(true);
        this.setButtonEnable(false);
        // this.setButtonAuto(false);
        // this.setButtonFlash(false);

        if (!this.isTrial) {
            SlotNetworkClient.getInstance().send(new cmd.SendPlay(this.arrLineSelected.toString()));
            FacebookTracking.spinSlot4();
        } else {
            var rIdx = Utils.randomRangeInt(0, Slot4TrialResult.results.length);
            this.spinResult(Slot4TrialResult.results[rIdx]);
        }
    }

    spinEffect(matrix: Array<number>) {

        cc.log("GGGGG : ", matrix);

        //set vi tri cac col ve 0
        // for (let i = 0; i < this.listCol.length; i++) {
        //     this.listCol[i].position = cc.v2(this.listCol[i].position.x, 0);
        // }

        //move item
        // for (let i = 0; i < this.listCol.length; i++) {
        //     let col = this.listCol[i];
        //     let newPos = cc.v2(col.position.x, -1668);
        //     let moveAction1 = cc.moveTo(0.1, cc.v2(col.position.x, 20));
        //     let moveAction2 = cc.moveTo(this.TIME_COL_FINISH * this.SPEED, newPos);

        //     col.runAction(cc.sequence(
        //         cc.delayTime(this.TIME_DELAY_BETWEEN_COL * i * this.SPEED),
        //         moveAction1,
        //         moveAction2,
        //         cc.callFunc(() => {
        //             //set item, roi move ve 0
        //             // col.position = cc.v2(col.position.x, 0);
        //             console.log(col.position.y);
        //         })
        //     ));
        // }

        //add cac node vao 1 list rieng de? show win line
        // this.listActiveItem = [];
        // //set icon cho cac item o cuoi
        // for (let i = 0; i < 3; i++) {
        //     for (let j = 0; j < 5; j++) {
        //         let indexInCol = this.numberOfItemInCol - 1 - i;
        //         let col = this.listCol[j];
        //         let item = col.children[indexInCol];
        //         let sprite = matrix[i * 5 + j];

        //         item.getComponent("Slot4Icon").setSpine(sprite);

        //         this.listActiveItem.push(item);
        //     }
        // }

        // this.node.runAction(cc.sequence(
        //     cc.delayTime(this.TIME_COL_FINISH * this.SPEED + this.TIME_DELAY_BETWEEN_COL * this.SPEED * (this.listCol.length-1)),
        //     cc.callFunc(() => {
        //         //set lai icon cho cac item o dau hang
        //         for (let i = 0; i < 3; i++) {
        //             for (let j = 0; j < 5; j++) {
        //                 let indexInCol = 2 - i;
        //                 let col = this.listCol[j];
        //                 let item = col.children[indexInCol];
        //                 let sprite = matrix[i * 5 + j];

        //                 item.getComponent("Slot4Icon").setSpine(sprite);
        //             }
        //         }
        //     })
        // ));

        let NUMBER_ICON_PER_COL = 3;

        this.listActiveItem = [];
        for(let i=0; i<this.listCol.length*NUMBER_ICON_PER_COL; i++) {
            this.listActiveItem.push(null);
        }

        for(let i=0; i<this.listCol.length; i++) {
            this.scheduleOnce(() => {
                this.spinControl.spinCol(this.listCol[i], this.listCol[i].children, 0, 0.25, this.TIME_COL_FINISH * this.SPEED, (sortedIcons: cc.Node[]) => {
                    for(let j=0; j<NUMBER_ICON_PER_COL; j++) {
                        let item = sortedIcons[sortedIcons.length - 1 - j];

                        this.listActiveItem[j * this.listCol.length + i] = item;
                        let sprite = matrix[j * this.listCol.length + i];
                        console.log("this.listActiveItemthis.listActiveItem", this.listActiveItem)
                        item.getComponent(Slot4Icon).setSpine(sprite);
                    }
                });
            }, this.TIME_DELAY_BETWEEN_COL * this.SPEED * i); 
        }
    }

    spinResult(res: cmd.ReceiveResult | any) {
        console.log(res);
        this.isSpining = true;

        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundSpin, false, 1);
        }

        let that = this;
        let successResult = [0, 1, 2, 3, 5, 6];
        let result = res.result;
        if (successResult.indexOf(result) === -1) {
            //fail
            if (result === 102) {
                //khong du tien
                console.log("so du khong du");
                App.instance.alertDialog.showMsg("Số dư tài khoản không đủ");
            } else {
                console.log("co loi xay ra");
            }
            this.setButtonEnable(true);
            return;
        }

        //set icon
        let matrix = res.matrix.split(",");
        this.spinEffect(matrix);

        if (!this.isTrial) {
            //tru tien
            let currentMoney = Configs.Login.Coin - this.arrLineSelected.length * this.listBet[this.betId];
            Tween.numberTo(this.moneyLabel, currentMoney, 0.3);
            Configs.Login.Coin = res.currentMoney;

            FacebookTracking.spinSlot4Success(this.arrLineSelected.length * this.listBet[this.betId]);
        } else {
            Tween.numberTo(this.moneyLabel, Utils.stringToInt(this.moneyLabel.string) - this.arrLineSelected.length * this.listBet[this.betId], 0.3);
        }

        //xong spin effect
        this.node.runAction(cc.sequence(
            cc.delayTime(this.TIME_COL_FINISH * this.SPEED + this.TIME_DELAY_BETWEEN_COL * this.SPEED * this.listCol.length),
            cc.callFunc(() => {
                let isHasWinEffect = (result == 2 || result == 3 || result == 5 || result == 6) ? true : false;

                that.setButtonEnable(true);
                if(result != 5) {
                    that.showWinEffect(res.prize, res.currentMoney, result);
                }
                if (this.toggleFast.isChecked) {
                    that.spinFinish(true);
                } else {
                    if (res.linesWin !== "") {
                        if(result == 5) {
                            this.popupBonus.showBonus(this.isTrial ? 100 : this.listBet[this.betId], res.haiSao, () => {
                                that.showLineWin(res.linesWin.split(","), isHasWinEffect);
                                that.showWinEffect(res.prize, res.currentMoney, result);
                            });
                        } else {
                            that.showLineWin(res.linesWin.split(","), isHasWinEffect);
                        }
                    } else that.spinFinish(false);
                }

            })
        ));
    }

    spinFinish(hasDelay: boolean) {
        this.isSpining = false;
        var that = this;
        this.node.runAction(
            cc.sequence(
                cc.delayTime(hasDelay ? 2 : 0),
                cc.callFunc(() => {
                    if (that.toggleAuto.isChecked || that.toggleFast.isChecked) {
                        that.spinClick();
                    } else {
                        that.setButtonEnable(true);
                        that.setButtonAuto(true);
                        that.setButtonFlash(true);
                    }
                })
            )
        )

    }

    showWinEffect(prize: number, currentMoney: number, result: number) {
        //res.result == 5 //bonus
        //res.result == 0 //khong an
        //res.result == 1 //thang thuong
        //res.result == 2 //thang lon
        //res.result == 3 //no hu
        //res.result == 6 //thang cuc lon
        if (prize > 0) {
            if (result == 5) {
                //bonus
                if (this.musicSlotState == 1) {
                    cc.audioEngine.play(this.soundBonus, false, 1);
                }
                this.bonusNode.active = true;

                let label = this.bonusNode.getComponentInChildren(cc.Label);
                label.string = "";

                this.bonusNode.opacity = 0;
                this.bonusNode.scaleY = 0;
                this.bonusNode.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBounceInOut()), cc.fadeIn(0.5)),
                    cc.callFunc(() => {
                        Tween.numberTo(label, prize, 0.3);

                        let skeBonus = this.bonusNode.getComponentInChildren(sp.Skeleton);
                        if(skeBonus) {
                            skeBonus.paused = false;
                        }
                    })
                ));
            } else if (result == 2 || result == 6) {
                //thang lon                
                if (this.musicSlotState == 1) {
                    cc.audioEngine.play(this.soundBigWin, false, 1);
                }
                this.bigWinNode.active = true;

                let label = this.bigWinNode.getComponentInChildren(cc.Label);
                label.string = "";

                this.bigWinNode.opacity = 0;
                this.bigWinNode.scaleY = 0;
                this.bigWinNode.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBounceInOut()), cc.fadeIn(0.5)),
                    cc.callFunc(() => {
                        Tween.numberTo(label, prize, 0.3);

                        let skeBigWin = this.bigWinNode.getComponentInChildren(sp.Skeleton);
                        if(skeBigWin) {
                            skeBigWin.paused = false;
                        }
                    })
                ));
            } else if (result == 3) {
                //no hu
                if (this.musicSlotState == 1) {
                    cc.audioEngine.play(this.soundJackpot, false, 1);
                }
                this.jackpotNode.active = true;

                let label = this.jackpotNode.getComponentInChildren(cc.Label);
                label.string = "";

                this.jackpotNode.opacity = 0;
                this.jackpotNode.scaleY = 0;
                this.jackpotNode.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBounceInOut()), cc.fadeIn(0.5)),
                    cc.callFunc(() => {
                        Tween.numberTo(label, prize, 0.3);

                        let skeJackpot = this.jackpotNode.getComponentInChildren(sp.Skeleton);
                        if(skeJackpot) {
                            skeJackpot.paused = false;
                        }
                    })
                ));
            } else {
                if (this.musicSlotState == 1) {
                    cc.audioEngine.play(this.soundSpinWin, false, 1);
                }
                this.winNormalBg.active = true;

                this.winNormalBg.opacity = 0;
                this.winNormalBg.scaleY = 0;
                this.winNormalBg.runAction(cc.sequence(
                    cc.spawn(cc.scaleTo(0.5, 1).easing(cc.easeBounceOut()), cc.fadeIn(0.5)),
                    cc.callFunc(() => {
                        Tween.numberTo(this.winLabel, prize, 0.3);
                    })
                ));
            }
        } else {
            // K an
            if (this.musicSlotState == 1) {
                cc.audioEngine.play(this.soundSpinMis, false, 1);
            }
        }
        Tween.numberTo(this.totalWinLabel, prize, 0.3);
        Tween.numberTo(this.totalBetLabel, this.arrLineSelected.length * this.listBet[this.betId], 0.3);

        if (!this.isTrial) {
            Tween.numberTo(this.moneyLabel, currentMoney, 0.3);
        } else {
            Tween.numberTo(this.moneyLabel, Utils.stringToInt(this.moneyLabel.string) + prize, 0.3); 
        }

    }

    hideWinEffect() {
        this.winNormalBg.active = false;
        this.winNormalBg.stopAllActions();
        this.winLabel.string = "0";

        this.jackpotNode.active = false;
        this.jackpotNode.stopAllActions();

        this.bigWinNode.active = false;
        this.bigWinNode.stopAllActions();

        this.bonusNode.active = false;
        this.bonusNode.stopAllActions();

        let skeBigWin = this.bigWinNode.getComponentInChildren(sp.Skeleton);
        if(skeBigWin) {
            skeBigWin.paused = true;
        }

        let skeJackpot = this.jackpotNode.getComponentInChildren(sp.Skeleton);
        if(skeJackpot) {
            skeJackpot.paused = true;
        }

        let skeBonus = this.bonusNode.getComponentInChildren(sp.Skeleton);
        if(skeBonus) {
            skeBonus.paused = true;
        }
    }

    showLineWin(lines: Array<number>, isHasWinEffect: boolean) {
        if (lines.length == 0) return;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            let lineNode = this.lineWinParent.children[line - 1];
            lineNode.active = true;
        }

        let that = this;
        //hide all line
        this.lineWinParent.runAction(
            cc.sequence(
                cc.delayTime(isHasWinEffect ? 5 : 3),
                cc.callFunc(() => {
                    that.hideWinEffect();
                    that.hideLineWin(false);
                })
            )
        );

        this.lineWinParent.runAction(
            cc.sequence(
                cc.delayTime(isHasWinEffect ? 5 : 3),
                cc.callFunc(() => {
                    //active line one by one
                    for (let i = 0; i < lines.length; i++) {
                        let line = lines[i];
                        let lineNode = this.lineWinParent.children[line - 1];
                        this.lineWinParent.runAction(
                            cc.sequence(
                                cc.delayTime(i * this.TIME_DELAY_SHOW_LINE),
                                cc.callFunc(() => {
                                    lineNode.active = true;
                                    let mapLineArr = that.mapLine[line - 1];
                                    for (let i = 0; i < mapLineArr.length; i++) {
                                        let node = this.listActiveItem[mapLineArr[i]];
                                        node.getComponent(Slot4Icon).scale();
                                    }
                                }),
                                cc.delayTime(this.TIME_DELAY_SHOW_LINE),
                                cc.callFunc(() => {
                                    lineNode.active = false;
                                    if (i == lines.length - 1)
                                        that.spinFinish(false);
                                })
                            )

                        );
                    }
                })
            )
        );

    }

    hideLineWin(stopAction: boolean) {
        if (stopAction) this.lineWinParent.stopAllActions();
        this.lineWinParent.children.forEach(element => {
            element.active = false;
        });
    }

    setButtonEnable(active: boolean) {
        if(this.toggleFast.isChecked || this.toggleAuto.isChecked) {
            return;
        } 

        this.btnSpin.interactable = active;
        this.btnBack.interactable = active;
        this.btnLine.interactable = active;
        this.btnBet.interactable = active;
        this.spineSpin.node.active = active; // hna add
        this.stopSpine.node.active = !active; // hna add
        this.holdSpine.node.active = false; // hna add
        this.setButtonAuto(active);
        this.setButtonFlash(active);
    }

    setButtonAuto(active: boolean) {
        this.toggleAuto.interactable = active;
        this.toggleAuto.node.children[0].color = active ? cc.Color.WHITE : cc.Color.GRAY;
    }

    setButtonFlash(active: boolean) {
        this.toggleFast.interactable = active;
        this.toggleFast.node.children[0].color = active ? cc.Color.WHITE : cc.Color.GRAY;
    }

    changeBet() {
        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.popupChooseBet.active = !this.popupChooseBet.active;
    }

    chooseBet(event, bet) {
        cc.log("SLOT4 chooseBet lastBet : ", this.betId);
        cc.log("SLOT4 chooseBet newBet : ", bet);
        let lastBet = this.betId;
        this.betId = parseInt(bet);
        SlotNetworkClient.getInstance().send(new cmd.SendChangeRoom(lastBet, this.betId));
        this.currentBetLabel.string = Utils.formatNumber(this.listBet[this.betId]);
        this.popupChooseBet.active = false;
        this.isTrial = false;
        this.isTrialSpr.active = false;
        Tween.numberTo(this.totalBetLabel, this.arrLineSelected.length * this.listBet[this.betId], 0.3);

        this.moneyLabel.string = Utils.formatNumber(Configs.Login.Coin);
    }

    playTrial() {
        this.isTrial = true;
        this.betId = 2;
        this.popupChooseBet.active = false;

        this.totalBetLabel.string = Utils.formatNumber(200000);
        this.currentBetLabel.string = Utils.formatNumber(10000);

        this.moneyLabel.string = Utils.formatNumber(Configs.App.MONEY_TRIAL);
        this.jackpotLabel.string = Utils.formatNumber(Configs.App.JACKPOT_TRIAL);

        this.isTrialSpr.active = true;

        FacebookTracking.spinSlot4Trial();
    }

    showGuide() {
        this.popupGuide.active = true;
    }

    closeGuide() {
        this.popupGuide.active = false;
    }

    showChooseLine() {
        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.chooseLineScript.show();
    }
    //#endregion

    changeSpeed() {
        if(this.isTrial) {
            this.showToast(Configs.LANG.ALERT_SLOT_TRIAL);
            this.toggleFast.isChecked = false;
            return;
        }

        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        this.SPEED = this.toggleFast.isChecked ? 0.5 : 1;
        this.setButtonAuto(!this.toggleFast.isChecked);
        if (this.toggleFast.isChecked && !this.isSpining) {
            this.spinClick();

            FacebookTracking.spinSlot4Fast();
        }

        this.btnBack.interactable = !this.toggleFast.isChecked;
        this.btnSpin.interactable = !this.toggleFast.isChecked;
        this.btnBet.interactable = !this.toggleFast.isChecked;
        this.btnLine.interactable = !this.toggleFast.isChecked; 
    }

    setAutoSpin() {
        if(this.isTrial) {
            this.showToast(Configs.LANG.ALERT_SLOT_TRIAL);
            this.toggleAuto.isChecked = false;
            return;
        }

        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        cc.log("Slot 4 setAutoSpin toggleAuto : ", this.toggleAuto.isChecked);
        cc.log("Slot 4 setAutoSpin isSpining : ", this.isSpining);
        this.setButtonFlash(!this.toggleAuto.isChecked);
        if (this.toggleAuto.isChecked && !this.isSpining) {
            this.spinClick();

            FacebookTracking.spinSlot4Auto();
        }

        this.btnBack.interactable = !this.toggleAuto.isChecked;
        this.btnSpin.interactable = !this.toggleAuto.isChecked;
        this.btnBet.interactable = !this.toggleAuto.isChecked;
        this.btnLine.interactable = !this.toggleAuto.isChecked; 
    }

    cannotChooseRoom5K() {
        App.instance.alertDialog.showMsg("Mức cược 5K hiện đang bảo trì !");
    }

    changeMode() {
        this.isTrial = this.toggleTrial.isChecked;
    }

    actBack() {
        if (this.musicSlotState == 1) {
            cc.audioEngine.play(this.soundClick, false, 1);
        }
        cc.audioEngine.stopAll();
        SlotNetworkClient.getInstance().send(new cmd.SendUnSubcribe(this.betId));
        App.instance.loadScene("Lobby");
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
    actSetting() {
        this.popupSetting.show();
    }
    // end

    // hna add
    actGoPopupChooseRoom() {
        this.popupChooseBet.active = true;
    }
    // end
}
