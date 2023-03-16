import AlertDialog from "../common/AlertDialog";
import ConfirmDialog from "../common/ConfirmDialog";
import SubpackageDownloader from "./SubpackageDownloader";
import BroadcastReceiver from "./BroadcastReceiver";
import MiniGameNetworkClient from "../networks/MiniGameNetworkClient";
import Configs from "./Configs";
import MiniGame from "../../Lobby/src/MiniGame";
import ButtonMiniGame from "../../Lobby/src/ButtonMiniGame";
import InPacket from "../networks/Network.InPacket";
import cmd from "../networks/Network.Cmd";
import LobbyController from "../../Lobby/src/Lobby.LobbyController";
import FacebookTracking from "./FacebookTracking";
import CircleProgress from "../../Lobby/src/Lobby.CircleProgress";

const { ccclass, property } = cc._decorator;

@ccclass
export default class App extends cc.Component {
    static instance: App = null;

    @property
    designResolution: cc.Size = new cc.Size(1280, 720);

    @property(cc.Node)
    loading: cc.Node = null;
    @property(cc.Node)
    loadingIcon: cc.Node = null;
    @property(cc.Label)
    loadingLabel: cc.Label = null;

    @property(AlertDialog)
    alertDialog: AlertDialog = null;

    @property(ConfirmDialog)
    confirmDialog: ConfirmDialog = null;

    @property([cc.SpriteFrame])
    sprFrameAvatars: Array<cc.SpriteFrame> = new Array<cc.SpriteFrame>();

    @property(cc.Node)
    buttonMiniGameNode: cc.Node = null;

    @property(cc.Node)
    miniGame: cc.Node = null;

    @property(cc.Node)
    popups: cc.Node = null;

    @property(cc.Node)
    loadingFullBg: cc.Node = null;

    @property(cc.Node)
    toast: cc.Node = null;

    @property(cc.Label)
    toastLabel: cc.Label = null;

    // @property(cc.ProgressBar)
    // loadingFullprogressBar: cc.ProgressBar = null;

    @property(cc.Node)
    npc: cc.Node = null;

    @property(cc.Node)
    loadingMask: cc.Node = null;

    public buttonMiniGame: ButtonMiniGame;

    private lastWitdh: number = 0;
    private lastHeight: number = 0;

    private timeOutLoading: any = null;
    private isFisrtNetworkConnected = false;

    private subpackageLoaded: Object = {};

    private taiXiuDouble: MiniGame = null;
    private miniPoker: MiniGame = null;
    private caoThap: MiniGame = null;
    private bauCua: MiniGame = null;
    private slot3x3: MiniGame = null;
    private oanTuTi: MiniGame = null;

    private miniDismissListener: Function = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        console.log("App onLoad");
        if (App.instance != null) {
            this.node.destroy();
            return;
        }
        App.instance = this;
        cc.game.addPersistRootNode(App.instance.node);
        // cc.debug.setDisplayStats(true);

        this.buttonMiniGame = this.buttonMiniGameNode.getComponent(ButtonMiniGame);

        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, () => {

        }, this);
    }

    start() {
        this.updateSize();
        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inPacket = new InPacket(data); cmd
            // console.log(inPacket.getCmdId());
            switch (inPacket.getCmdId()) {
                case cmd.Code.GET_MONEY_USE: {
                    let res = new cmd.ResGetMoneyUse(data);
                    // console.log(res);
                    Configs.Login.Coin = res.moneyUse;
                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                    break;
                }
            }
        }, this);

        this.miniDismissListener = () => {

        }
    }

    showLoadingFull(game: string = 'default') {
        this.loadingFullBg.getChildByName('Slot2').active = false;
        this.loadingFullBg.getChildByName('Slot4').active = false;
        this.loadingFullBg.getChildByName('Slot5').active = false;
        this.loadingFullBg.getChildByName('Slot9').active = false;

        switch(game) {
            case 'Slot4':
                this.loadingFullBg.active = true;
                this.loadingFullBg.getChildByName('Slot4').active = true;
                this.loadingFullBg.runAction(cc.fadeIn(0.4));
                break;
            case 'Slot9':
                // let _this = this;
                // this.loadingMask.color = new cc.Color(0, 0, 0);
                // this.loadingMask.opacity = 0;
                // this.loadingMask.active = true;
                // this.loadingMask.runAction(cc.sequence(
                //     cc.fadeIn(0.4),
                //     cc.callFunc(() => {
                //         _this.loadingMask.opacity = 0;
                //         _this.loadingMask.active = false;
                //         _this.loadingFullBg.active = true;
                //         _this.loadingFullBg.getChildByName('Slot9').active = true;
                //         _this.loadingFullBg.getChildByName('Slot9').runAction(cc.fadeIn(1.0));
                //     })
                // ));
                this.loadingFullBg.active = true;
                this.loadingFullBg.getChildByName('Slot9').active = true;
                this.loadingFullBg.runAction(cc.fadeIn(0.4));
                break;
            case 'Slot2':
                this.loadingFullBg.active = true;
                this.loadingFullBg.getChildByName('Slot2').active = true;
                this.loadingFullBg.runAction(cc.fadeIn(0.4));
                break;
            case 'Slot5':
                this.loadingFullBg.active = true;
                this.loadingFullBg.getChildByName('Slot5').active = true;
                this.loadingFullBg.runAction(cc.fadeIn(0.4));
                break;
            default:
                this.loadingFullBg.active = true;
                // this.loadingFullprogressBar.progress = 0;

                this.loadingFullBg.runAction(cc.fadeIn(0.4));
        }
    }

    hideLoadingFull() {
        this.loadingFullBg.runAction(cc.sequence(cc.fadeOut(0.2), cc.callFunc(() => {
            this.loadingFullBg.active = false;
        })));
    }

    showLoadingFullUpdate(percent: number) {
        // this.loadingFullprogressBar.progress = percent;
    }

    showLoading(isShow: boolean, timeOut: number = 15) {
        this.loadingLabel.string = "Đang tải...";
        if (this.timeOutLoading != null) clearTimeout(this.timeOutLoading);
        if (isShow) {
            if (timeOut > 0) {
                this.timeOutLoading = setTimeout(() => {
                    this.showLoading(false);
                    App.instance.showToast("Quá thời gian!");
                }, timeOut * 1000);
            }
            this.loading.active = true;
        } else {
            this.loading.active = false;
        }
        this.loadingIcon.stopAllActions();
        this.loadingIcon.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
    }

    showErrLoading(msg?: string) {
        this.showLoading(true, 10);
        this.loadingLabel.string = msg ? msg : "Mất kết nối, đang thử lại...";
    }

    update(dt: number) {
        this.updateSize();
    }

    updateSize() {
        var frameSize = cc.view.getFrameSize();
        if (this.lastWitdh !== frameSize.width || this.lastHeight !== frameSize.height) {

            this.lastWitdh = frameSize.width;
            this.lastHeight = frameSize.height;

            var newDesignSize = cc.Size.ZERO;
            if (this.designResolution.width / this.designResolution.height > frameSize.width / frameSize.height) {
                newDesignSize = cc.size(this.designResolution.width, this.designResolution.width * (frameSize.height / frameSize.width));
            } else {
                newDesignSize = cc.size(this.designResolution.height * (frameSize.width / frameSize.height), this.designResolution.height);
            }
            // cc.log("update node size: " + newDesignSize);
            this.node.setContentSize(newDesignSize);
            this.node.setPosition(cc.v2(newDesignSize.width / 2, newDesignSize.height / 2));
        }
    }

    getAvatarSpriteFrame(avatar: string): cc.SpriteFrame {
        let avatarInt = parseInt(avatar);
        if (isNaN(avatarInt) || avatarInt < 0 || avatarInt >= this.sprFrameAvatars.length) {
            return this.sprFrameAvatars[0];
        }
        return this.sprFrameAvatars[avatarInt];
    }

    loadScene(sceneName: string) {
        cc.director.preloadScene(sceneName, (c, t, item) => {
            this.showErrLoading("Đang tải..." + parseInt("" + ((c / t) * 100)) + "%");
        }, (err, sceneAsset) => {
            this.showLoading(false);
            cc.director.loadScene(sceneName, function() {
                if(sceneName == "Lobby") {
                    LobbyController.instance.playMusicBackground();
                }
            });

            BroadcastReceiver.send(BroadcastReceiver.ON_LEAVE_GAME_SCENE, {
                sceneName: sceneName
            });
        });
    }

    loadSceneInSubpackage(subpackageName: string, sceneName: string, circleProgress?: CircleProgress) {
        if (circleProgress && circleProgress.node.active) {
            FacebookTracking.openGameInactive(subpackageName);
            return;
        }

        if (!this.subpackageLoaded.hasOwnProperty(subpackageName) || !this.subpackageLoaded[subpackageName]) {
            circleProgress ? circleProgress.startProgress() : console.log("NULL PROGRESS: " + subpackageName);
            SubpackageDownloader.downloadSubpackage(subpackageName, (err, progress) => {
                if (err == "progress") {
                    circleProgress ? circleProgress.setPercent(progress) : console.log("");
                    return;
                }
                if (err == "showLoading") {
                    this.showLoadingFull(subpackageName);
                    FacebookTracking.openGameWithHotUpdatePass(subpackageName);
                    return;
                }

                circleProgress ? circleProgress.endProgress() : console.log("NULL PROGRESS: " + subpackageName);

                if (err) {
                    this.confirmDialog.show4(err, "Hủy", "Thử Lại", (isConfirm: boolean) => {
                        if (isConfirm) {
                            App.instance.loadSceneInSubpackage(subpackageName, sceneName, circleProgress);
                        }
                    });
                    this.hideLoadingFull();

                    FacebookTracking.openGameErrorPopup(subpackageName);
                    return;
                }

                if (sceneName == "") {
                    return;
                }

                this.subpackageLoaded[subpackageName] = true;

                cc.director.preloadScene(sceneName, (c, t, item) => {
                    this.showLoadingFullUpdate(c / t);
                }, (err, sceneAsset) => {
                    this.hideLoadingFull();
                    cc.director.loadScene(sceneName);

                    if (sceneAsset) {
                        BroadcastReceiver.send(BroadcastReceiver.ON_ENTER_GAME_SCENE, {
                            sceneName: sceneName
                        });

                        FacebookTracking.openGameSuccess(subpackageName);
                        FacebookTracking.openGameWithHotUpdateSuccess(subpackageName);
                    }
                });
            });

            FacebookTracking.openGameWithHotUpdate(subpackageName);
        } else {
            if (sceneName == "") {
                return;
            }

            this.showLoadingFull();

            cc.director.preloadScene(sceneName, (c, t, item) => {
                this.showLoadingFullUpdate(c / t);
            }, (err, sceneAsset) => {
                this.hideLoadingFull();
                cc.director.loadScene(sceneName);

                if (sceneAsset) {
                    BroadcastReceiver.send(BroadcastReceiver.ON_ENTER_GAME_SCENE, {
                        sceneName: sceneName
                    });

                    FacebookTracking.openGameSuccess(subpackageName);
                }
            });
        }

        FacebookTracking.openGame(subpackageName);
    }

    loadPrefabInSubpackage(subpackageName: string, prefabPath: string, onLoaded: (err: string, prefab: cc.Prefab) => void, circleProgress?: CircleProgress) {
        if (circleProgress && circleProgress.node.active) {
            FacebookTracking.openGameInactive(subpackageName);
            return;
        }

        if (!this.subpackageLoaded.hasOwnProperty(subpackageName) || !this.subpackageLoaded[subpackageName]) {
            circleProgress ? circleProgress.startProgress() : console.log("NULL PROGRESS: " + subpackageName);
            SubpackageDownloader.downloadSubpackage(subpackageName, (err, progress) => {
                if (err == "progress") {
                    circleProgress ? circleProgress.setPercent(progress) : console.log("");
                    return;
                }
                if (err == "showLoading") {
                    FacebookTracking.openGameWithHotUpdatePass(subpackageName);
                    return;
                }

                circleProgress ? circleProgress.endProgress() : console.log("NULL PROGRESS: " + subpackageName);

                if (err) {
                    this.confirmDialog.show4(err, "Hủy", "Thử Lại", (isConfirm: boolean) => {
                        if (isConfirm) {
                            App.instance.loadPrefabInSubpackage(subpackageName, prefabPath, onLoaded, circleProgress);
                        }
                    });

                    FacebookTracking.openGameErrorPopup(subpackageName);
                    return;
                }

                this.subpackageLoaded[subpackageName] = true;

                cc.loader.loadRes(prefabPath, cc.Prefab, (c, t, item) => {
                    this.showErrLoading("Đang tải..." + parseInt("" + ((c / t) * 100)) + "%");
                }, (err, prefab) => {
                    this.showLoading(false);
                    onLoaded(err == null ? null : err.message, prefab);

                    if (prefab) {
                        FacebookTracking.openGameSuccess(subpackageName);
                        FacebookTracking.openGameWithHotUpdateSuccess(subpackageName);
                    }
                });
            });

            FacebookTracking.openGameWithHotUpdate(subpackageName);
        } else {
            this.showLoading(true, -1);
            cc.loader.loadRes(prefabPath, cc.Prefab, (c, t, item) => {
                this.showErrLoading("Đang tải..." + parseInt("" + ((c / t) * 100)) + "%");
            }, (err, prefab) => {
                this.showLoading(false);
                onLoaded(err == null ? null : err.message, prefab);

                if (prefab) {
                    FacebookTracking.openGameSuccess(subpackageName);
                }
            });
        }

        FacebookTracking.openGame(subpackageName);
    }

    loadPrefab(prefabPath: string, onLoaded: (error: string, prefab: cc.Prefab) => void) {
        this.showErrLoading("Đang tải...");
        cc.loader.loadRes("prefabs/" + prefabPath, cc.Prefab, (c, t, item) => {
            this.showErrLoading("Đang tải..." + parseInt("" + ((c / t) * 100)) + "%");
        }, (err, prefab) => {
            this.showLoading(false);
            onLoaded(err == null ? null : err.message, prefab);
        });
    }

    openGameBauCua() {
        this.showLoading(true, 10);
        MiniGameNetworkClient.getInstance().checkConnect(() => {
            if (globalThis.Global.BauCua != null) {
                if (this.bauCua == null) {
                    let node = cc.instantiate(globalThis.Global.BauCua);
                    node.parent = this.miniGame;
                    node.active = false;
                    this.bauCua = node.getComponent(MiniGame);
                    this.bauCua.setDismissLestener(this.miniDismissListener);
                }
                this.bauCua.show();
                FacebookTracking.logMiniGameOpenSuccess("BauCua");
                this.showLoading(false);
            } else {
                FacebookTracking.logMiniGameNeedRedownload("BauCua");
                this.showLoading(false);
                App.instance.loadPrefabInSubpackage("BauCua", "prefabs/BauCua", (err, prefab) => {
                    MiniGameNetworkClient.getInstance().checkConnect(() => {
                        globalThis.Global.BauCua = prefab;
                        if (prefab != null) {
                            if (this.bauCua == null) {
                                let node = cc.instantiate(prefab);
                                node.parent = this.miniGame;
                                node.active = false;
                                this.bauCua = node.getComponent(MiniGame);
                                this.bauCua.setDismissLestener(this.miniDismissListener);
                            }
                            this.bauCua.show();
                        } else {
                            console.log(err);
                        }
                    });
                }, LobbyController.instance.tabsListGame.getItemGame("BauCua").circleProgress);
            }
        });
    }

    openGameSlot3x3() {
        this.showLoading(true, 10);
        MiniGameNetworkClient.getInstance().checkConnect(() => {
            if (globalThis.Global.Slot3x3 != null) {
                if (this.slot3x3 == null) {
                    let node = cc.instantiate(globalThis.Global.Slot3x3);
                    node.parent = this.miniGame;
                    node.active = false;
                    this.slot3x3 = node.getComponent(MiniGame);
                    this.slot3x3.setDismissLestener(this.miniDismissListener);
                }
                this.slot3x3.show();
                FacebookTracking.logMiniGameOpenSuccess("Slot3x3");
                this.showLoading(false);
            } else {
                FacebookTracking.logMiniGameNeedRedownload("Slot3x3");
                this.showLoading(false);
                App.instance.loadPrefabInSubpackage("Slot3x3", "prefabs/Slot3x3", (err, prefab) => {
                    MiniGameNetworkClient.getInstance().checkConnect(() => {
                        globalThis.Global.Slot3x3 = prefab;
                        if (prefab != null) {
                            if (this.slot3x3 == null) {
                                let node = cc.instantiate(prefab);
                                node.parent = this.miniGame;
                                node.active = false;
                                this.slot3x3 = node.getComponent(MiniGame);
                                this.slot3x3.setDismissLestener(this.miniDismissListener);
                            }
                            this.slot3x3.show();
                        } else {
                            console.log(err);
                        }
                    });
                }, LobbyController.instance.tabsListGame.getItemGame("Slot3x3").circleProgress);
            }
        });
    }

    openGameTaiXiuMini() {
        // App.instance.loadPrefabInSubpackage("TaiXiuDouble", "prefabs/TaiXiuDouble", (err, prefab) => {
        //     MiniGameNetworkClient.getInstance().checkConnect(() => {
        //         if (prefab != null) {
        //             if (this.taiXiuDouble == null) {
        //                 let node = cc.instantiate(prefab);
        //                 node.parent = this.miniGame;
        //                 node.active = false;
        //                 this.taiXiuDouble = node.getComponent(MiniGame);
        //             }
        //             this.taiXiuDouble.show();
        //         } else {
        //             console.log(err);
        //         }
        //     });
        // });

        MiniGameNetworkClient.getInstance().checkConnect(() => {
            if (globalThis.Global.TaiXiu != null) {
                if (this.taiXiuDouble == null) {
                    let node = cc.instantiate(globalThis.Global.TaiXiu);
                    node.parent = this.miniGame;
                    node.active = false;
                    this.taiXiuDouble = node.getComponent(MiniGame);
                    this.taiXiuDouble.setDismissLestener(this.miniDismissListener);
                }
                this.taiXiuDouble.show();
                FacebookTracking.logMiniGameOpenSuccess("TaiXiu");
            } else {
                FacebookTracking.logMiniGameNeedRedownload("TaiXiu");
                console.log("taiXiuDouble err");
            }
        });
    }

    openGameMiniPoker() {
        this.showLoading(true, 10);
        MiniGameNetworkClient.getInstance().checkConnect(() => {
            if (globalThis.Global.MiniPoker != null) {
                if (this.miniPoker == null) {
                    let node = cc.instantiate(globalThis.Global.MiniPoker);
                    node.parent = this.miniGame;
                    node.active = false;
                    this.miniPoker = node.getComponent(MiniGame);
                    this.miniPoker.setDismissLestener(this.miniDismissListener);
                }
                this.miniPoker.show();
                FacebookTracking.logMiniGameOpenSuccess("MiniPoker");
                this.showLoading(false);
            } else {
                FacebookTracking.logMiniGameNeedRedownload("MiniPoker");
                this.showLoading(false);
                App.instance.loadPrefabInSubpackage("MiniPoker", "prefabs/MiniPoker", (err, prefab) => {
                    MiniGameNetworkClient.getInstance().checkConnect(() => {
                        globalThis.Global.MiniPoker = prefab;
                        if (prefab != null) {
                            if (this.miniPoker == null) {
                                let node = cc.instantiate(prefab);
                                node.parent = this.miniGame;
                                node.active = false;
                                this.miniPoker = node.getComponent(MiniGame);
                                this.miniPoker.setDismissLestener(this.miniDismissListener);
                            }
                            this.miniPoker.show();
                        } else {
                            console.log(err);
                        }
                    });
                }, LobbyController.instance.tabsListGame.getItemGame("MiniPoker").circleProgress);
            }
        });
    }

    openGameCaoThap() {
        this.showLoading(true, 10);
        MiniGameNetworkClient.getInstance().checkConnect(() => {
            if (globalThis.Global.CaoThap != null) {
                if (this.caoThap == null) {
                    let node = cc.instantiate(globalThis.Global.CaoThap);
                    node.parent = this.miniGame;
                    node.active = false;
                    this.caoThap = node.getComponent(MiniGame);
                    this.caoThap.setDismissLestener(this.miniDismissListener);
                }
                this.caoThap.show();
                FacebookTracking.logMiniGameOpenSuccess("CaoThap");
                this.showLoading(false);
            } else {
                FacebookTracking.logMiniGameNeedRedownload("CaoThap");
                this.showLoading(false);
                App.instance.loadPrefabInSubpackage("CaoThap", "prefabs/CaoThap", (err, prefab) => {
                    MiniGameNetworkClient.getInstance().checkConnect(() => {
                        globalThis.Global.CaoThap = prefab;
                        if (prefab != null) {
                            if (this.caoThap == null) {
                                let node = cc.instantiate(prefab);
                                node.parent = this.miniGame;
                                node.active = false;
                                this.caoThap = node.getComponent(MiniGame);
                                this.caoThap.setDismissLestener(this.miniDismissListener);
                            }
                            this.caoThap.show();
                        } else {
                            console.log(err);
                        }
                    });
                }, LobbyController.instance.tabsListGame.getItemGame("CaoThap").circleProgress);
            }
        });
    }

    openGameOanTuTi() {
        // this.alertDialog.showMsg("Sắp ra măt.");
        // return;
        App.instance.loadPrefabInSubpackage("OanTuTi", "prefabs/OanTuTi", (err, prefab) => {
            MiniGameNetworkClient.getInstance().checkConnect(() => {
                if (prefab != null) {
                    if (this.oanTuTi == null) {
                        let node = cc.instantiate(prefab);
                        node.parent = this.miniGame;
                        node.active = false;
                        this.oanTuTi = node.getComponent(MiniGame);
                        this.oanTuTi.setDismissLestener(this.miniDismissListener);
                    }
                    this.oanTuTi.show();
                    this.playIconGameAnimation();
                } else {
                    console.log(err);
                }
            });
        }, LobbyController.instance.tabsListGame.getItemGame("OanTuTi").circleProgress);
    }

    public openTelegram(name: string = null) {
        if (name == null) {
            name = Configs.App.getLinkTelegram();
        }
        let url = "http://www.telegram.me/" + name;
        if (cc.sys.isNative) {
            url = "tg://resolve?domain=" + name;
        }
        cc.sys.openURL(url);
    }

    public preloadScene(sceneName, onProgress?, onLoaded?) {
        let director: any = cc.director;
        let info = director._getSceneUuid(sceneName);
        if (info) {
            director.emit((<any>cc.Director).EVENT_BEFORE_SCENE_LOADING, sceneName);
            cc.loader.load({ uuid: info.uuid, type: 'uuid' }, onProgress == null ? null : function (c, t, item) {
                if (onProgress) onProgress(c, t, item);
            }, function (error, asset) {
                if (error) {
                    (<any>cc).errorID(1215, sceneName, error.message);
                }
                if (onLoaded) {
                    onLoaded(error, asset);
                }
            });
        }
        else {
            var error = 'Can not preload the scene "' + sceneName + '" because it is not in the build settings.';
            if (onLoaded) onLoaded(new Error(error));
            cc.error('preloadScene: ' + error);
        }
    }

    showToast(msg: string, duration: number = 3) {
        this.toast.stopAllActions();
        this.toast.active = true;
        this.toastLabel.string = msg;

        // this.scheduleOnce(() => {
        //     this.toast.active = false;
        //     this.toastLabel.string = "";
        // }, duration);

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

    actShowNpc() {
        this.npc.active = true;
        this.npc.scaleY = 0;
        this.npc.runAction(cc.scaleTo(0.25, 1, 1));
    }

    actHideNpc() {
        this.npc.scaleY = 1;
        this.npc.runAction(cc.sequence(cc.scaleTo(0.25, 1, 0), cc.callFunc(() => {
            this.npc.active = false;
            if (LobbyController && LobbyController.instance) {
                LobbyController.instance.showPopupEvent();
            }
        })));
    }

    actVerifyPhone() {
        this.actHideNpc();
        cc.sys.openURL(Configs.App.LINK_TELE_VERIFY_PHONE + "?start=" + Configs.Login.AccessToken + "-" + Configs.Login.Nickname);
        FacebookTracking.logOpenVerify();
    }

    checkPopupOpen(): boolean {
        let popups = this.popups.children;
        for (let i = 0; i < popups.length; i++) {
            if (popups[i].active)
                return true;
        }

        if (this.buttonMiniGame.panel.active)
            return true;

        if (this.alertDialog.node.active)
            return true;

        if (this.confirmDialog.node.active)
            return true;

        return false;
    }

    checkMiniGameOpen(): boolean {
        let minigames = this.miniGame.children;
        for (let i = 0; i < minigames.length; i++) {
            if (minigames[i].active)
                return true;
        }

        return false;
    }

    playIconGameAnimation() {
        // if (LobbyController.instance) {
        //     LobbyController.instance.countDownloadingMiniGame -= 1;
        //     if (LobbyController.instance.countDownloadingMiniGame < 1) {
        //         LobbyController.instance.setStateIconSpine(true);
        //     }
        // }
    }
}
