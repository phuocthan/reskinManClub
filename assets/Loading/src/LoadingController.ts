import LobbyScene from "../../Lobby/src/Lobby.LobbyScene";
import AlertDialog from "../../scripts/common/AlertDialog";
import Configs from "../../scripts/common/Configs";
import FacebookTracking from "../../scripts/common/FacebookTracking";
import { NativeBridge } from "../../scripts/common/NativeBridge";
import SubpackageDownloader from "../../scripts/common/SubpackageDownloader";
import VersionConfig from "../../scripts/common/VersionConfig";
import Http from "../../scripts/common/Http";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingController extends cc.Component {

    @property(cc.Label)
    lblStatus: cc.Label = null;

    @property(cc.Node)
    loadings: cc.Node = null;

    @property(AlertDialog)
    alertDialog: AlertDialog = null;

    @property(cc.SpriteFrame)
    sprLuckyLuckMini: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sprComPhatWinStar: cc.SpriteFrame = null;

    // hna add
    @property(cc.Node)
    loading1: cc.Node = null;
    @property(cc.Node)
    loadingMain: cc.Node = null;
    @property(cc.Node)
    loading2: cc.Node = null;
    @property(cc.Label)
    logs: cc.Label = null;
    // end hna add


    onLoad() {
        Configs.App.DEVICE_RESOLUTION = cc.director.getWinSize();
        Configs.App.STORAGE_FOLDER = "remote_assets";

        FacebookTracking.logAppOpen();
    }


    start() {
        this.lblStatus.string = "";

        // hna add
        this.loading1.active = false;
        this.loadingMain.active = true;
        this.lblStatus.node.active = true;
        this.alreadyUpToDate();
    }

    alreadyUpToDate() {
        this.lblStatus.string = "Đang vào game ....";
        var _self = this; // hna add

        cc.loader.loadRes("prefabs/Lobby", cc.Prefab, (c, t, item) => {
            this.lblStatus.string = "Đang vào game .... " + (Math.round((0.5 * c / t) * 100)) + "%";
        }, (err, prefab) => {
            LobbyScene.setup(prefab);

            globalThis.Global = {
                TaiXiu: null,
                Slot3x3: null,
                MiniPoker: null,
                BauCua: null,
                CaoThap: null,
                Step: 0,
                TotalTasks: 4
            }

            globalThis.Global.TotalTasks = 4;
            globalThis.Global.Step = 0;

            FacebookTracking.logMiniGameDownloadStart("Slot3x3");
            SubpackageDownloader.downloadSubpackage("Slot3x3", (err, progress) => {
                if (err == "progress") { return; } if (err == "showLoading") { return; }
                if (err) {
                    FacebookTracking.logMiniGameDownloadError("Slot3x3");
                    globalThis.Global.TotalTasks -= 1;
                } else {
                    FacebookTracking.logMiniGameDownloadSuccess("Slot3x3");
                    cc.loader.loadRes("prefabs/Slot3x3", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                        if (err) {
                            FacebookTracking.logMiniGameLoadPrefabError("Slot3x3");
                            globalThis.Global.TotalTasks -= 1;
                        } else {
                            FacebookTracking.logMiniGameLoadPrefabSuccess("Slot3x3");
                            globalThis.Global.Slot3x3 = prefab; globalThis.Global.Step += 1;
                        }
                    });
                }
            });

            FacebookTracking.logMiniGameDownloadStart("MiniPoker");
            SubpackageDownloader.downloadSubpackage("MiniPoker", (err, progress) => {
                if (err == "progress") { return; } if (err == "showLoading") { return; }
                if (err) {
                    FacebookTracking.logMiniGameDownloadError("MiniPoker");
                    globalThis.Global.TotalTasks -= 1;
                } else {
                    FacebookTracking.logMiniGameDownloadSuccess("MiniPoker");
                    cc.loader.loadRes("prefabs/MiniPoker", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                        if (err) {
                            FacebookTracking.logMiniGameLoadPrefabError("MiniPoker");
                            globalThis.Global.TotalTasks -= 1;
                        } else {
                            FacebookTracking.logMiniGameLoadPrefabSuccess("MiniPoker");
                            globalThis.Global.MiniPoker = prefab; globalThis.Global.Step += 1;
                        }
                    });
                }
            });

            FacebookTracking.logMiniGameDownloadStart("BauCua");
            SubpackageDownloader.downloadSubpackage("BauCua", (err, progress) => {
                if (err == "progress") { return; } if (err == "showLoading") { return; }
                if (err) {
                    FacebookTracking.logMiniGameDownloadError("BauCua");
                    globalThis.Global.TotalTasks -= 1;
                } else {
                    FacebookTracking.logMiniGameDownloadSuccess("BauCua");
                    cc.loader.loadRes("prefabs/BauCua", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                        if (err) {
                            FacebookTracking.logMiniGameLoadPrefabError("BauCua");
                            globalThis.Global.TotalTasks -= 1;
                        } else {
                            FacebookTracking.logMiniGameLoadPrefabSuccess("BauCua");
                            globalThis.Global.BauCua = prefab; globalThis.Global.Step += 1;
                        }
                    });
                }
            });

            FacebookTracking.logMiniGameDownloadStart("CaoThap");
            SubpackageDownloader.downloadSubpackage("CaoThap", (err, progress) => {
                if (err == "progress") { return; } if (err == "showLoading") { return; }
                if (err) {
                    FacebookTracking.logMiniGameDownloadError("CaoThap");
                    globalThis.Global.TotalTasks -= 1;
                } else {
                    FacebookTracking.logMiniGameDownloadSuccess("CaoThap");
                    cc.loader.loadRes("prefabs/CaoThap", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
                        if (err) {
                            FacebookTracking.logMiniGameLoadPrefabError("CaoThap");
                            globalThis.Global.TotalTasks -= 1;
                        } else {
                            FacebookTracking.logMiniGameLoadPrefabSuccess("CaoThap");
                            globalThis.Global.CaoThap = prefab; globalThis.Global.Step += 1;
                        }
                    });
                }
            });

            FacebookTracking.logMiniGameDownloadStart("TaiXiu");
            cc.loader.loadResArray(["prefabs/TaiXiuDouble", "prefabs/Lobby/PopupShop", "prefabs/Lobby/PopupCashOut"], cc.Prefab, (c, t, item) => {
                this.lblStatus.string = "Đang vào game .... " + (Math.round((0.5 + 0.3 * (c / t)) * 100)) + "%";
            }, (err, prefabs) => {

                for (let index = 0; index < prefabs.length; index++) {
                    if (prefabs[index].name == "TaiXiuDouble") {
                        globalThis.Global.TaiXiu = prefabs[index];
                        FacebookTracking.logMiniGameDownloadSuccess("TaiXiu");
                    }
                }

                cc.director.preloadScene("Lobby", (c, t, i) => {
                    this.lblStatus.string = "Đang vào game .... " + (Math.round((0.8 + 0.2 * (c / t)) * 100)) + "%";
                }, (err, sceneAsset) => {
                    _self.loading2.active = true; // hna add
                    this.schedule(() => {
                        if (globalThis.Global.Step == globalThis.Global.TotalTasks) {
                            FacebookTracking.logMiniGameDownloadSuccess("Task MiniGames");
                            cc.director.loadScene("Lobby"); // hna comment
                        } else {
                            this.lblStatus.string = "Đang thiết lập tài nguyên : " + globalThis.Global.Step + "/" + globalThis.Global.TotalTasks;
                        }
                    }, 0.1);
                    FacebookTracking.logFinishLoading();
                });
            });
        });

        FacebookTracking.appLaunched();
    }
}