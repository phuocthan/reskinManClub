import cmd from "./Slot3x3.Cmd";
import MiniGame from "../../../Lobby/src/MiniGame";
import Utils from "../../../scripts/common/Utils";
import InPacket from "../../../scripts/networks/Network.InPacket";
import MiniGameNetworkClient from "../../../scripts/networks/MiniGameNetworkClient";
import Tween from "../../../scripts/common/Tween";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import Configs from "../../../scripts/common/Configs";
import App from "../../../scripts/common/App";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import AudioManager from "../../../scripts/common/Common.AudioManager";

const { ccclass, property } = cc._decorator;

@ccclass("Slot3x3.ButtonBet")
export class ButtonBet {
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.Node)
    select: cc.Node = null;
    @property(cc.SpriteFrame)
    sfNormal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfActive: cc.SpriteFrame = null;

    _isActive = false;

    setActive(isActive: boolean) {
        this._isActive = isActive;
        this.button.getComponent(cc.Sprite).spriteFrame = isActive ? this.sfActive : this.sfNormal;
        this.button.interactable = !isActive;
        this.select.active = isActive;
    }
}

@ccclass
export default class Slot3x3Controller extends MiniGame {
    @property([sp.SkeletonData])
    sprSpineItems: sp.SkeletonData[] = [];
    // @property([cc.SpriteFrame])
    // sprFrameItems: cc.SpriteFrame[] = [];
    @property([cc.SpriteFrame])
    sprFrameItemsBlur: cc.SpriteFrame[] = [];
    @property([ButtonBet])
    buttonBets: ButtonBet[] = [];
    @property(cc.Node)
    columns: cc.Node = null;
    @property(cc.Node)
    linesWin: cc.Node = null;
    @property(cc.Button)
    btnSpin: cc.Button = null;
    @property(cc.Button)
    btnLine: cc.Button = null;
    @property(cc.Label)
    lblLine: cc.Label = null;
    @property(cc.Button)
    btnClose: cc.Button = null;
    @property(cc.Button)
    btnAuto: cc.Button = null;
    @property(cc.SpriteFrame)
    sfAuto0: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfAuto1: cc.SpriteFrame = null;
    @property(cc.Button)
    btnBoost: cc.Button = null;
    @property(cc.SpriteFrame)
    sfBoost0: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfBoost1: cc.SpriteFrame = null;
    @property(cc.Label)
    lblJackpot: cc.Label = null;
    @property(cc.Node)
    lblWinCash: cc.Node = null;
    @property(cc.Label)
    lblToast: cc.Label = null;
    @property(cc.Node)
    effectJackpot: cc.Node = null;
    @property(cc.Node)
    effectBigWin: cc.Node = null;
    @property([cc.Node])
    public popups: cc.Node[] = [];

    @property(cc.Node)
    hubPopupsGame: cc.Node = null;
    @property(cc.Node)
    shadowBG: cc.Node = null;

    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;
    @property({ type: cc.AudioClip })
    soundWin: cc.AudioClip = null;

    private numItemInColumn = 20; // 15
    private spinDuration = 1.2;
    private addSpinDuration = 0.3;
    private itemHeight = 0;
    private betIdx = 0;
    private listBet = [100, 1000, 10000];
    private arrLineSelect = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    private isSpined = true;
    private isBoost = false;
    private isAuto = false;
    private isCanChangeBet = true;
    private lastSpinRes: cmd.ReceiveSpin = null;

    // hna add
    private popupLine = null;
    private isMove = false;
    private scale = 1;
    private curX = 0;
    private curY = 0;
    // end

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
        this.itemHeight = 120;  // height / 3
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let column = this.columns.children[i];
            let count = this.numItemInColumn;
            for (let j = 0; j < count; j++) {
                let aNode = new cc.Node();
                aNode.height = this.itemHeight;
                let aChild = new cc.Node();
                if (j >= 3 && j < count - 3) {
                    let randomId = Utils.randomRangeInt(0, this.sprFrameItemsBlur.length);
                    aChild.addComponent(cc.Sprite).spriteFrame = this.sprFrameItemsBlur[randomId];
                    aChild.getComponent(cc.Sprite).sizeMode = cc.Sprite.SizeMode.RAW;
                    aChild.getComponent(cc.Sprite).trim = false;
                    aChild.scale = randomId == 5 ? 0.8 : 1;
                } else {
                    aChild.addComponent(sp.Skeleton).skeletonData = this.sprSpineItems[Utils.randomRangeInt(0, this.sprSpineItems.length)];
                    // aChild.getComponent(sp.Skeleton).setAnimation(0, "animation", true);  // sao no k play luon ??
                }
                aNode.addChild(aChild);
                aNode.parent = column;
            }
        }

        for (let i = 0; i < this.columns.childrenCount; i++) {
            let count = this.numItemInColumn;
            for (let j = 0; j < count; j++) {
                if (j < 3) {
                    // this.columns.children[i].children[j].children[0].getComponent(sp.Skeleton).setAnimation(0, "animation", true); // hna comment
                    this.columns.children[i].children[j].children[0].getComponent(sp.Skeleton).setAnimation(0, "idle", true);
                }
            }
        }

        for (let i = 0; i < this.buttonBets.length; i++) {
            var btn = this.buttonBets[i];
            btn.setActive(i == this.betIdx);
            btn.button.node.on("click", () => {
                AudioManager.getInstance().playEffect(this.soundClickBtn);
                if (!this.isCanChangeBet) {
                    this.showToast("Bạn thao tác quá nhanh.");
                    return;
                }
                let oldIdx = this.betIdx;
                this.betIdx = i;
                for (let i = 0; i < this.buttonBets.length; i++) {
                    this.buttonBets[i].setActive(i == this.betIdx);
                }
                this.isCanChangeBet = false;
                this.scheduleOnce(() => {
                    this.isCanChangeBet = true;
                }, 1);
                MiniGameNetworkClient.getInstance().send(new cmd.SendChangeRoom(oldIdx, this.betIdx));
            });
        }

        this.btnAuto.node.on("click", () => {
            AudioManager.getInstance().playEffect(this.soundClickBtn);
            this.isAuto = !this.isAuto;
            if (this.isAuto) {
                if (this.isSpined) this.spin();
                this.btnBoost.interactable = false;
                this.btnAuto.getComponent(cc.Sprite).spriteFrame = this.sfAuto1;

                FacebookTracking.spinSkyForceAuto();
            } else {
                this.btnBoost.interactable = true;
                this.btnAuto.getComponent(cc.Sprite).spriteFrame = this.sfAuto0;
                if (this.isSpined) {
                    this.setEnabledAllButtons(true);
                }
            }
        });

        this.btnBoost.node.on("click", () => {
            AudioManager.getInstance().playEffect(this.soundClickBtn);
            this.isBoost = !this.isBoost;
            if (this.isBoost) {
                if (this.isSpined) this.spin();
                this.btnAuto.interactable = false;
                this.btnBoost.getComponent(cc.Sprite).spriteFrame = this.sfBoost1;

                FacebookTracking.spinSkyForceFast();
            } else {
                this.btnAuto.interactable = true;
                this.btnBoost.getComponent(cc.Sprite).spriteFrame = this.sfBoost0;
                if (this.isSpined) {
                    this.setEnabledAllButtons(true);
                }
            }
        });

        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, () => {
            if (!this.node.active) return;
            this.dismiss();
        }, this);

        MiniGameNetworkClient.getInstance().addOnClose(() => {
            if (!this.node.active) return;
            this.dismiss();
        }, this);

        MiniGameNetworkClient.getInstance().addListener((data: Uint8Array) => {
            if (!this.node.active) return;
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.UPDATE_JACKPOT: {
                    let res = new cmd.ReceiveUpdateJackpot(data);
                    Tween.numberTo(this.lblJackpot, res.value, 1.5);
                    break;
                }
                case cmd.Code.SPIN: {
                    let res = new cmd.ReceiveSpin(data);
                    this.onSpinResult(res);
                    break;
                }
            }
        }, this);
    }

    show() {
        if (this.node.active) {
            this.reOrder();
            return;
        }
        super.show();
        this.shadowBG.active = true;
        this.lblToast.node.parent.active = false;
        this.lblWinCash.parent.active = false;

        for (let i = 0; i < this.linesWin.childrenCount; i++) {
            this.linesWin.children[i].active = false;
        }

        this.isSpined = true;
        this.isCanChangeBet = true;
        this.betIdx = 0;
        for (let i = 0; i < this.buttonBets.length; i++) {
            this.buttonBets[i].setActive(i == this.betIdx);
        }

        MiniGameNetworkClient.getInstance().send(new cmd.SendScribe(this.betIdx));
    }

    dismiss() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        super.dismiss();
        for (let i = 0; i < this.popups.length; i++) {
            this.popups[i].active = false;
        }
        MiniGameNetworkClient.getInstance().send(new cmd.SendUnScribe(this.betIdx));
    }

    actSpin() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.spin();

        FacebookTracking.spinSkyForceClick();
    }

    private spin() {
        if (!this.isSpined) {
            this.showToast("Bạn thao tác quá nhanh.");
            return;
        }
        this.isSpined = false;
        this.stopAllEffects();
        this.stopShowLinesWin();
        this.setEnabledAllButtons(false);
        for (var i = 0; i < this.buttonBets.length; i++) {
            this.buttonBets[i].button.interactable = false;
        }
        MiniGameNetworkClient.getInstance().send(new cmd.SendSpin(this.listBet[this.betIdx], this.arrLineSelect.toString()));

        FacebookTracking.spinSkyForce();
    }

    private setEnabledAllButtons(isEnabled: boolean) {
        this.btnSpin.interactable = isEnabled;
        this.btnClose.interactable = isEnabled;
        this.btnLine.interactable = isEnabled;
    }

    private showToast(message: string) {
        this.lblToast.string = message;
        let parent = this.lblToast.node.parent;
        parent.stopAllActions();
        parent.active = true;
        parent.opacity = 255;
        // parent.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(2), cc.fadeOut(0.2), cc.callFunc(() => {
        //     parent.active = false;
        // })));

        // hna add
        parent.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2 - this.gamePlay.y)
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
    }

    private onSpinResult(res: cmd.ReceiveSpin) {
        // console.log(res);
        var _this = this;

        var resultSuccess = [0, 1, 2, 3, 4, 5, 6];
        if (resultSuccess.indexOf(res.result) < 0) {
            this.scheduleOnce(function () {
                this.isSpined = true;
            }, 1);
            this.setEnabledAllButtons(true);
            for (var i = 0; i < this.buttonBets.length; i++) {
                this.buttonBets[i].button.interactable = true;
            }

            this.isAuto = false;
            this.btnAuto.interactable = true;
            this.btnAuto.getComponent(cc.Sprite).spriteFrame = this.sfAuto0;

            this.isBoost = false;
            this.btnBoost.interactable = true;
            this.btnBoost.getComponent(cc.Sprite).spriteFrame = this.sfBoost0;

            switch (res.result) {
                case 102:
                    this.showToast("Số dư không đủ vui lòng nạp thêm.");
                    break;
                default:
                    this.showToast("Có lỗi xảy ra, vui lòng thử lại sau.");
                    break;
            }
            return;
        }

        Configs.Login.Coin -= this.listBet[this.betIdx] * this.arrLineSelect.length;
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        Configs.Login.Coin = res.currentMoney;

        FacebookTracking.spinSkyForceSuccess(this.listBet[this.betIdx] * this.arrLineSelect.length);
        FacebookTracking.spinSkyForceBet(this.listBet[this.betIdx]);

        this.lastSpinRes = res;
        let matrix = res.matrix.split(",");
        let timeScale = this.isBoost ? 0.5 : 1;
        for (let i = 0; i < this.columns.childrenCount; i++) {
            let roll = this.columns.children[i];
            let step1Pos = this.itemHeight * 0.3;
            let step2Pos = -this.itemHeight * roll.childrenCount + this.itemHeight * 3 - this.itemHeight * 0.3;
            let step3Pos = -this.itemHeight * roll.childrenCount + this.itemHeight * 3;
            roll.runAction(cc.sequence(
                cc.delayTime(0.2 * i * timeScale),
                cc.moveTo(0.2 * timeScale, cc.v2(roll.getPosition().x, step1Pos)).easing(cc.easeQuadraticActionOut()),
                cc.moveTo((this.spinDuration + this.addSpinDuration * i) * timeScale, cc.v2(roll.getPosition().x, step2Pos)).easing(cc.easeQuadraticActionInOut()),
                cc.moveTo(0.2 * timeScale, cc.v2(roll.getPosition().x, step3Pos)).easing(cc.easeQuadraticActionIn()),
                cc.callFunc(() => {
                    roll.setPosition(cc.v2(roll.getPosition().x, 0));
                    if (i === this.columns.childrenCount - 1) {
                        _this.spined();
                    }
                })
            ));
            roll.runAction(cc.sequence(
                cc.delayTime((0.7 + 0.2 * i) * timeScale),
                cc.callFunc(() => {
                    let children = roll.children;


                    let spine0 = children[0].children[0].getComponent(sp.Skeleton);
                    let spine1 = children[1].children[0].getComponent(sp.Skeleton);
                    let spine2 = children[2].children[0].getComponent(sp.Skeleton);
                    
                    spine2.skeletonData = this.sprSpineItems[parseInt(matrix[i])];
                    spine1.skeletonData = this.sprSpineItems[parseInt(matrix[3 + i])];
                    spine0.skeletonData = this.sprSpineItems[parseInt(matrix[6 + i])];

                    spine0.setAnimation(0, Object.keys(spine0.skeletonData.skeletonJson.animations)[1], true);
                    spine1.setAnimation(0, Object.keys(spine1.skeletonData.skeletonJson.animations)[1], true);
                    spine2.setAnimation(0, Object.keys(spine2.skeletonData.skeletonJson.animations)[1], true);

                    let spinel1 = children[children.length - 1].children[0].getComponent(sp.Skeleton);
                    let spinel2 = children[children.length - 2].children[0].getComponent(sp.Skeleton);
                    let spinel3 = children[children.length - 3].children[0].getComponent(sp.Skeleton);

                    spinel1.skeletonData = this.sprSpineItems[parseInt(matrix[i])];
                    spinel2.skeletonData = this.sprSpineItems[parseInt(matrix[3 + i])];
                    spinel3.skeletonData = this.sprSpineItems[parseInt(matrix[6 + i])];

                    spinel1.setAnimation(0, Object.keys(spinel1.skeletonData.skeletonJson.animations)[1], true);
                    spinel2.setAnimation(0, Object.keys(spinel2.skeletonData.skeletonJson.animations)[1], true);
                    spinel3.setAnimation(0, Object.keys(spinel3.skeletonData.skeletonJson.animations)[1], true);
                })
            ));
        }
    }

    private spined() {
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        this.isSpined = true;
        if (!this.isAuto && !this.isBoost) this.setEnabledAllButtons(true);
        switch (this.lastSpinRes.result) {
            case 0://k an
                this.showLineWins();
                break;
            case 1:// thang thuong
                this.showLineWins();
                break;
            case 2:// thang lon
                this.showEffectBigWin(this.lastSpinRes.prize, () => this.showLineWins());
                break;
            case 3://jackpot
            case 4:
                this.showEffectJackpot(this.lastSpinRes.prize, () => this.showLineWins());
                break;
            case 6://thang sieu lon
                this.showEffectBigWin(this.lastSpinRes.prize, () => this.showLineWins());
                break;
        }
    }

    private showEffectBigWin(cash: number, cb: () => void) {
        AudioManager.getInstance().playEffect(this.soundWin);
        this.effectBigWin.stopAllActions();
        this.effectBigWin.active = true;
        let label = this.effectBigWin.getComponentInChildren(cc.Label);
        label.string = "";

        this.effectBigWin.opacity = 0;
        this.effectBigWin.scale = 0;
        this.effectBigWin.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.75, 1).easing(cc.easeBounceOut()), cc.fadeIn(0.75)),
            cc.callFunc(() => {
                Tween.numberTo(label, cash, 1);
            }),
            cc.delayTime(3),
            cc.callFunc(() => {
                this.effectBigWin.active = false;
                if (cb != null) cb();
            })
        ));
    }

    private showEffectJackpot(cash: number, cb: () => void = null) {
        AudioManager.getInstance().playEffect(this.soundWin);
        this.effectJackpot.stopAllActions();
        this.effectJackpot.active = true;
        let label = this.effectJackpot.getComponentInChildren(cc.Label);
        label.string = "";

        this.effectJackpot.opacity = 0;
        this.effectJackpot.scale = 0;
        this.effectJackpot.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.75, 1).easing(cc.easeBounceOut()), cc.fadeIn(0.75)),
            cc.callFunc(() => {
                Tween.numberTo(label, cash, 1);
            }),
            cc.delayTime(3),
            cc.callFunc(() => {
                this.effectJackpot.active = false;
                if (cb != null) cb();
            })
        ));
    }

    private showWinCash(coin: number) {
        AudioManager.getInstance().playEffect(this.soundWin);
        let parent = this.lblWinCash.parent;
        let label = this.lblWinCash.getComponent(cc.Label);
        parent.stopAllActions();
        parent.active = true;
        label.string = "0";
        parent.opacity = 0;
        parent.runAction(cc.sequence(
            cc.fadeIn(0.3),
            cc.callFunc(() => {
                Tween.numberTo(label, coin, 0.5);
            }),
            cc.delayTime(1.5),
            cc.fadeOut(0.3),
            cc.callFunc(() => {
                parent.active = false;
            })
        ));
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
        this.stopAllItemEffect();
    }

    private stopAllItemEffect() {
        for (var i = 0; i < this.columns.childrenCount; i++) {
            var children = this.columns.children[i].children;
            children[0].stopAllActions();
            children[1].stopAllActions();
            children[2].stopAllActions();

            children[0].runAction(cc.scaleTo(0.1, 1));
            children[1].runAction(cc.scaleTo(0.1, 1));
            children[2].runAction(cc.scaleTo(0.1, 1));
        }
    }

    private showLineWins() {
        this.linesWin.stopAllActions();
        var linesWin = this.lastSpinRes.linesWin.split(",");
        var linesWinChildren = this.linesWin.children;
        for (var i = 0; i < linesWinChildren.length; i++) {
            linesWinChildren[i].active = linesWin.indexOf("" + (i + 1)) >= 0;
        }
        var actions = [];
        if (this.lastSpinRes.prize > 0) {
            this.showWinCash(this.lastSpinRes.prize);
            actions.push(cc.delayTime(1.5));
            actions.push(cc.callFunc(function () {
                for (var i = 0; i < linesWinChildren.length; i++) {
                    linesWinChildren[i].active = false;
                }
            }));
        }
        actions.push(cc.delayTime(0.5));
        actions.push(cc.callFunc(() => {
            this.isSpined = true;
            if (this.isBoost || this.isAuto) {
                this.spin();
            } else {
                this.setEnabledAllButtons(true);
                for (var i = 0; i < this.buttonBets.length; i++) {
                    this.buttonBets[i].button.interactable = true;
                }
            }
        }));
        this.linesWin.runAction(cc.sequence.apply(null, actions));
    }

    // Popup
    showPopupRank() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        cc.loader.loadRes("prefabs/PopupSlot3x3/PopupHonors", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("Slot3x3.PopupHonors");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupGuide() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        cc.loader.loadRes("prefabs/PopupSlot3x3/PopupGuide", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("Dialog");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupHistory() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        cc.loader.loadRes("prefabs/PopupSlot3x3/PopupHistory", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            let popup = cc.instantiate(prefab).getComponent("Slot3x3.PopupHistory");
            this.hubPopupsGame.addChild(popup.node);
            popup.show();
        });
    }

    showPopupLines() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        let _this = this;
        cc.loader.loadRes("prefabs/PopupSlot3x3/PopupSelectLine", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            if(!_this.popupLine) {
                _this.popupLine = cc.instantiate(prefab).getComponent("Slot3x3.PopupSelectLine");
                _this.hubPopupsGame.addChild(_this.popupLine.node);
            }
            
            _this.popupLine.show();
            _this.popupLine.onSelectedChanged = (lines) => {
                this.arrLineSelect = lines;
                this.lblLine.string = this.arrLineSelect.length.toString();
            }
        });
    }

    actSmallView() {
        this.gamePlay.runAction(cc.sequence(
            cc.scaleTo(0.2, 0.6),
            cc.callFunc(() => {
                
            })
        ));
        this.shadowBG.active = false;
    }
}
