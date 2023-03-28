import App from "../../scripts/common/App";
import Http from "../../scripts/common/Http";
import Configs from "../../scripts/common/Configs";
import MiniGameNetworkClient from "../../scripts/networks/MiniGameNetworkClient";
import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";
import SPUtils from "../../scripts/common/SPUtils";
import Tween from "../../scripts/common/Tween";
import SlotNetworkClient from "../../scripts/networks/SlotNetworkClient";
import TienLenNetworkClient from "../../scripts/networks/TienLenNetworkClient";
import SamNetworkClient from "../../scripts/networks/SamNetworkClient";
import cmd from "./Lobby.Cmd";
import cmdNetworks from "../../scripts/networks/Network.Cmd";
import InPacket from "../../scripts/networks/Network.InPacket";
import TabsListGame from "./Lobby.TabsListGame";
import PopupTransaction from "./Lobby.PopupTransaction";
import PopupSecurity from "./Lobby.PopupSecurity";
import Utils from "../../scripts/common/Utils";
import ButtonListJackpot from "./Lobby.ButtonListJackpot";
import VersionConfig from "../../scripts/common/VersionConfig";
// import ShootFishNetworkClient from "../../scripts/networks/ShootFishNetworkClient"; // hna comment ban ca
import AudioManager from "../../scripts/common/Common.AudioManager";
import PopupShop from "./Lobby.PopupShop";
import PopupProfile from "./Lobby.PopupProfile";
import PopupCashOut from "./Lobby.PopupCashOut";
import PopupForgetPassword from "./Lobby.PopupForgetPassword";
import PopupUpdateNickname from "./Lobby.PopupUpdateNickname";
import PopupRegister from "./Lobby.PopupRegister";
import PopupLogin from "./Lobby.PopupLogin";
import PopupMailBox from "./Lobby.PopupMailBox";
import PageView from "../../scripts/customui/CustomUI.PageView";
import { NativeBridge } from "../../scripts/common/NativeBridge";
import PopupEvent from "./Lobby.PopupEvent";
import FacebookTracking from "../../scripts/common/FacebookTracking";
import CardGameCmd from "../../scripts/networks/CardGame.Cmd";
import PopupVip from "./Lobby.PopupVip";
import HandleInvite from "./Lobby.HandleInvite";

import cmdTaiXiu from "../../resources/taixiu/TaiXiuMini/src/TaiXiuMini.Cmd";

const { ccclass, property } = cc._decorator;

@ccclass("Lobby.LobbyController.PanelMenu")
class PanelMenu {
    @property(cc.Node)
    node: cc.Node = null;
    @property(cc.Toggle)
    toggleMusic: cc.Toggle = null;
    @property(cc.Toggle)
    toggleSound: cc.Toggle = null;

    @property(cc.Node)
    offMusic: cc.Node = null;

    @property(cc.Node)
    offSound: cc.Node = null;

    @property(cc.Node)
    settingPanel: cc.Node = null;



    start() {
        this.toggleMusic.node.on("toggle", () => {
            SPUtils.setMusicVolumn(this.toggleMusic.isChecked ? 1 : 0);
            this.offMusic.active = !this.toggleMusic.isChecked;
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
        });
        this.toggleSound.node.on("toggle", () => {
            SPUtils.setSoundVolumn(this.toggleSound.isChecked ? 1 : 0);
            this.offSound.active = !this.toggleSound.isChecked;
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
        });
        this.toggleMusic.isChecked = SPUtils.getMusicVolumn() > 0;
        this.offMusic.active = !this.toggleMusic.isChecked;
        this.toggleSound.isChecked = SPUtils.getSoundVolumn() > 0;
        this.offSound.active = !this.toggleSound.isChecked;

        this.node.active = false;
    }

    show() {
        this.node.active = true;
        this.settingPanel.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(0.275),
                cc.moveTo(0.275, cc.v2(0, 0)).easing(cc.easeOut(2.0))
                // cc.moveTo(0.275, cc.v2(this.settingPanel.x, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(0.15, cc.v2(0, 0))
            // cc.moveTo(0.15, cc.v2(Configs.App.DEVICE_RESOLUTION.width/2 - this.settingPanel.width/2, 0))
        ));
        this.settingPanel.scale = 0.5;
        this.settingPanel.active = true;
        cc.tween(this.settingPanel)
        .to(0.15, {scale : 1.1})
        .to(0.1, {scale : 1})
        .start();

    }

    dismiss() {
        this.node.active = false;

        // this.settingPanel.runAction(cc.sequence(
        //     cc.spawn( 
        //         cc.fadeIn(0.275),
        //         cc.moveTo(0.275, cc.v2(this.settingPanel.x, 0)).easing(cc.easeOut(2.0))
        //         ),
        //     cc.moveTo(0.15, cc.v2(Configs.App.DEVICE_RESOLUTION.width/2 - this.settingPanel.width/2 + 500, 0))
        // ));
        // cc.tween(this.settingPanel)
        // .to(0.2, {scale : 0.5}).call( () => {
        //     this.settingPanel.active = false;
        // })
        // .start();
        
    }

    toggle() {
        if (this.node.active) {
            this.dismiss();
        } else {
            this.show();
        }
    }
}

@ccclass
export default class LobbyController extends cc.Component {
    public static instance: LobbyController = null;

    @property(cc.Node)
    panelNotLogin: cc.Node = null;
    @property(cc.Node)
    panelLogined: cc.Node = null;
    @property(cc.Node)
    topBarLogined: cc.Node = null;
    @property(PanelMenu)
    panelMenu: PanelMenu = null;
    @property(cc.Sprite)
    sprAvatar: cc.Sprite = null;
    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Label)
    lblVipPoint: cc.Label = null;
    @property(cc.Slider)
    sliderVipPoint: cc.Slider = null;
    @property(cc.Label)
    lblVipPointName: cc.Label = null;
    @property(cc.Sprite)
    spriteProgressVipPoint: cc.Sprite = null;
    @property(cc.Label)
    lblCoin: cc.Label = null;
    @property(cc.Label)
    lblCoinFish: cc.Label = null;
    @property(ButtonListJackpot)
    buttonListJackpot: ButtonListJackpot = null;
    @property(cc.Node)
    panelSupport: cc.Node = null;
    @property(PageView)
    bannerPageView: PageView = null;
    @property(cc.Label)
    lblMailCount: cc.Label = null;

    @property(TabsListGame)
    tabsListGame: TabsListGame = null;

    @property(cc.Node)
    popups: cc.Node = null;

    @property({ type: cc.AudioClip })
    clipBgm: cc.AudioClip = null;

    @property(cc.Node)
    topBar: cc.Node = null;
    @property(cc.Node)
    botBar: cc.Node = null;

    @property(cc.Node)
    centerMask: cc.Node = null;
    @property(cc.Node)
    centerNode: cc.Node = null;
    @property(cc.Node)
    tabs: cc.Node = null;
    @property(cc.Node)
    listGame: cc.Node = null;

    @property(cc.Node)
    iconCoinNormal: cc.Node = null;
    @property(cc.Node)
    iconCoinFish: cc.Node = null;

    // hna add
    @property(cc.Sprite)
    circleRotateLeft: cc.Sprite = null;
    @property(cc.Sprite)
    circleRotateRight: cc.Sprite = null;
    @property(cc.Node)
    btnMail: cc.Node = null;
    @property(cc.Node)
    btnSetting: cc.Node = null;
    @property(cc.Node)
    popupEventMailbox: cc.Node = null;
    @property(cc.Node)
    popupEventMailboxContents: cc.Node = null;
    @property(cc.Node)
    popupMailboxActive: cc.Node = null;
    @property(cc.Node)
    popupEventActive: cc.Node = null;
    @property({ type: cc.AudioClip })
    soundClickBtn: cc.AudioClip = null;
    // end hna add

    private listMarquees: any[] = [];

    private readonly durationChangePage = 3;
    private curDurationChangePage = 3;

    private handleInvite: HandleInvite = null;

    countDownloadingMiniGame: number = 0;

    onLoad() {
        LobbyController.instance = this;
        this.setupCenterElementPosition();

        this.lblMailCount.node.parent.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.5, 1.35),
            cc.scaleTo(0.25, 1)
        )));
        
        // hna add
        this.circleRotateLeft.node.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(1, 90),
            cc.rotateTo(1, 180),
            cc.rotateTo(1, 270),
            cc.rotateTo(1, 360)
        )));
        this.circleRotateRight.node.runAction(cc.repeatForever(cc.sequence(
            cc.rotateTo(1, 90),
            cc.rotateTo(1, 180),
            cc.rotateTo(1, 270),
            cc.rotateTo(1, 360)
        )));
        // end hna add
    }

    setupCenterElementPosition() {
        this.centerNode.width = Configs.App.DEVICE_RESOLUTION.width;
        // this.tabs.x = -this.centerNode.width / 2; // hna comment
        // this.tabs.x = -this.tabs.width * this.tabs.scaleX / 2; // hna add
        // this.bannerPageView.node.x = this.tabs.x + this.tabs.width + this.bannerPageView.node.width / 2; // hna comment
        this.bannerPageView.node.x = -this.centerNode.width / 2 + this.bannerPageView.node.width / 2 + 30; // hna add
        this.listGame.x = this.bannerPageView.node.x + this.bannerPageView.node.width / 2 + 20;
        // this.centerMask.width = Configs.App.DEVICE_RESOLUTION.width - this.bannerPageView.node.width - this.tabs.width; // hna comment
        this.centerMask.width = Configs.App.DEVICE_RESOLUTION.width - this.bannerPageView.node.width; // hna add

        // hna add : align
        // this.panelMenu.settingPanel.x = Configs.App.DEVICE_RESOLUTION.width/2 -  this.panelMenu.settingPanel.width/2;
        
        
        this.topBar.getChildByName('Topbar').height = this.topBar.getChildByName('Topbar').height * this.centerNode.width/this.topBar.getChildByName('Topbar').width;
        this.topBar.getChildByName('Topbar').width = this.centerNode.width;

        // this.botBar.scaleX = Configs.App.DEVICE_RESOLUTION.width/this.botBar.width;
        // this.botBar.scaleY = Configs.App.DEVICE_RESOLUTION.width/this.botBar.width;
        this.botBar.y = -Configs.App.DEVICE_RESOLUTION.height/2 + this.botBar.height * this.botBar.scaleY/2;

        this.buttonListJackpot.node.x = -this.centerNode.width/2 + this.buttonListJackpot.node.width/2;

        // this.btnMail.x = -this.centerNode.width / 2 + this.btnMail.width * this.botBar.scaleY/2 + 25;
        // this.btnSetting.x = Configs.App.DEVICE_RESOLUTION.width/2 - this.btnSetting.width * this.botBar.scaleY/2 - 25;
        
        // end hna add
    }

    initSpine() {
        let delay = 0;

        // game icons

        let sorted = this.tabsListGame.itemGames;
        sorted.sort((a, b) => {
            let posA = a.node.parent.convertToWorldSpaceAR(a.node.position);
            let posB = b.node.parent.convertToWorldSpaceAR(b.node.position);

            return posA.x - posB.x;
        });

        for (let i = 0; i < sorted.length; i++) {
            let item = sorted[i];

            let ske = item.getComponentInChildren(sp.Skeleton);
            if(!ske) continue;
            ske.paused = true;
            item.node.scale = 0;
            item.node.opacity = 0;

            item.node.runAction(cc.sequence(cc.delayTime(delay + (i < 5 ? 0.15 : 0.25) * i), cc.callFunc(() => {
                ske.paused = false;
            }), cc.spawn(cc.scaleTo(0.75, 1, 1), cc.fadeIn(0.75))));
        }

        // topbar and botbar

        let topY = this.topBar.y;
        let botY = this.botBar.y;
        this.topBar.setPosition(cc.v2(this.topBar.x, topY + this.topBar.height));
        this.botBar.setPosition(cc.v2(this.botBar.x, botY - this.botBar.height));

        this.topBar.opacity = 0;
        this.botBar.opacity = 0;

        this.topBar.runAction(cc.sequence(cc.spawn(cc.moveTo(1.5, cc.v2(this.topBar.x, topY)), cc.fadeIn(1.5)), cc.callFunc(() => {

        })));

        this.botBar.runAction(cc.sequence(cc.spawn(cc.moveTo(1.5, cc.v2(this.botBar.x, botY)), cc.fadeIn(1.5)), cc.callFunc(() => {

        })));
    }

    start() {
        console.log("CPName: " + VersionConfig.CPName);
        console.log("VersionName: " + VersionConfig.VersionName);

        this.getConfigCommon();

        this.lblCoin.node.parent.active = true;
        this.lblCoinFish.node.parent.active = false;

        this.panelMenu.start();

        BroadcastReceiver.register(BroadcastReceiver.UPDATE_NICKNAME_SUCCESS, (data) => {
            if (!Configs.Login.IsLoginFB) {
                // this.edbUsername.string = data["username"];
                // this.edbPassword.string = data["password"];
                this.onLogin(null, data, data["username"], data["password"]);
            } else {
                this.onLogin(null, data, "", "");
            }
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            Tween.numberTo(this.lblCoin, Configs.Login.Coin, 0.3);
            Tween.numberTo(this.lblCoinFish, Configs.Login.CoinFish, 0.3);
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_SWITCH_COIN, (coin: number) => {
            if (coin == Configs.Login.CoinFish) {
                this.actSwitchToCoinFish();
            }
            if (coin == Configs.Login.Coin) {
                this.actSwitchToCoinNormal();
            }
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.USER_INFO_UPDATED, () => {
            this.lblNickname.string = Configs.Login.Nickname;
            this.sprAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
            // this.sprAvatar.node.setContentSize(Configs.App.AVATAR_SIZE_SMALL); hna comment
            this.sprAvatar.node.setContentSize(Configs.App.AVATAR_SIZE_TLMN); // hna add
            this.lblVipPoint.string = "Vip: " + Utils.formatNumber(Configs.Login.VipPoint) + "/" + Utils.formatNumber(Configs.Login.getVipPointNextLevel());
            this.sliderVipPoint.progress = Math.min(Configs.Login.VipPoint / Configs.Login.getVipPointNextLevel(), 1);
            this.spriteProgressVipPoint.fillRange = this.sliderVipPoint.progress;
            this.lblVipPointName.string = Configs.Login.getVipPointName();
            Tween.numberTo(this.lblCoin, Configs.Login.Coin, 0.3);
            Tween.numberTo(this.lblCoinFish, Configs.Login.CoinFish, 0.3);
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.USER_LOGOUT, (data) => {
            Configs.Login.clear();
            this.panelNotLogin.active = true;
            this.panelLogined.active = false;
            this.topBarLogined.active = false;
            // this.edbUsername.string = SPUtils.getUserName();
            // this.edbPassword.string = SPUtils.getUserPass();
            MiniGameNetworkClient.getInstance().close();
            SlotNetworkClient.getInstance().close();
            TienLenNetworkClient.getInstance().close();
            // ShootFishNetworkClient.getInstance().close();  // hna comment ban ca
            App.instance.buttonMiniGame.hidden();

            SPUtils.setAccessToken("");
            SPUtils.setNickName("");
            SPUtils.setFbToken("");
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.UPDATE_MAIL_COUNT, () => {
            this.lblMailCount.node.parent.active = Configs.Login.MailCount > 0;
            this.lblMailCount.string = Configs.Login.MailCount.toString();
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_REQUEST_UPDATE_MARQUEE, () => {
            BroadcastReceiver.send(BroadcastReceiver.ON_UPDATE_MARQUEE, this.listMarquees);
        }, this);

        BroadcastReceiver.register(BroadcastReceiver.ON_GO_INVITE, (data: CardGameCmd.ReceivedInvite) => {
            if (data.maxPlayer == 2) {
                this.actGameTLMNSolo();
            } else {
                this.actGoToTLMN();
            }
            TienLenNetworkClient.INVITER = data.inviter;
        }, this);

        Configs.App.getServerConfig();
        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inPacket = new InPacket(data);
            switch (inPacket.getCmdId()) {
                case cmd.Code.NOTIFY_MARQUEE: {
                    let res = new cmd.ResNotifyMarquee(data);
                    let resJson = JSON.parse(res.message);

                    this.listMarquees = [];
                    for (let i = 0; i < (resJson["entries"].length < 5 ? resJson["entries"].length : 5); i++) {
                        let e = resJson["entries"][i];

                        let marqueeData = {
                            game: "",
                            win: "",
                            money: ""
                        }

                        marqueeData.game = Configs.GameId.getGameName(e["g"]);
                        marqueeData.win = e["n"] + " thắng ";
                        marqueeData.money = Utils.formatNumber(e["m"]);

                        this.listMarquees.push(marqueeData);

                        BroadcastReceiver.send(BroadcastReceiver.ON_UPDATE_MARQUEE, this.listMarquees);
                    }
                    break;
                }
                case cmd.Code.UPDATE_JACKPOTS: {
                    let res = new cmd.ResUpdateJackpots(data);
                    // console.log("All Jackpot res : ", res);
                    this.buttonListJackpot.setData(res);
                    break;
                }
                case cmd.Code.GET_SECURITY_INFO: {
                    if (!PopupProfile.isShowing() && !PopupVip.isShowing()) {
                        let res = new cmd.ResGetSecurityInfo(data);
                        if (res.mobile) {
                            Configs.Login.mobile = res.mobile;
                            // this.showPopupEvent(); // hna comment
                            this.actEventMailBox(); // hna add
                        } else {
                            // this.actShowNpc(); // hna comment
                            this.actEventMailBox(); // hna add
                        }

                        this.scheduleOnce(() => {
                            App.instance.openGameTaiXiuMini();
                        }, 2.5);
                    }
                    break;
                }
                case cmdTaiXiu.Code.GAME_INFO: {
                    let res = new cmdTaiXiu.ReceiveGameInfo(data);
                    BroadcastReceiver.send(BroadcastReceiver.ON_UPDATE_TAXIU_ITEM, {
                        potTai: res.potTai,
                        potXiu: res.potXiu
                    })
                    break;
                }
                case cmdTaiXiu.Code.UPDATE_TIME: {
                    let res = new cmdTaiXiu.ReceiveUpdateTime(data);
                    BroadcastReceiver.send(BroadcastReceiver.ON_UPDATE_TAXIU_ITEM, {
                        potTai: res.potTai,
                        potXiu: res.potXiu,
                        jackpotTX: res.pot
                    })
                    break;
                }
                case cmdTaiXiu.Code.NEW_GAME: {
                    BroadcastReceiver.send(BroadcastReceiver.ON_UPDATE_TAXIU_ITEM, {
                        potTai: 0,
                        potXiu: 0
                    })
                    break;
                }
            }
        }, this);
        this.buttonListJackpot.updateJackpot(0.3);

        SlotNetworkClient.getInstance().addListener((data) => {
            let inPacket = new InPacket(data);
            switch (inPacket.getCmdId()) {
                case cmd.Code.UPDATE_JACKPOT_SLOTS: {
                    //{"ndv":{"100":{"p":673620,"x2":0},"1000":{"p":6191000,"x2":0},"10000":{"p":73540000,"x2":0}},"kb":{"100":{"p":503160,"x2":0},"1000":{"p":5044400,"x2":0},"10000":{"p":51398000,"x2":0}},"vqv":{"100":{"p":509480,"x2":0},"1000":{"p":5013000,"x2":0},"10000":{"p":50852000,"x2":0}},"sah":{"100":{"p":502890,"x2":0},"1000":{"p":6932010,"x2":0},"10000":{"p":55193700,"x2":0}}}
                    let res = new cmd.ResUpdateJackpotSlots(data);
                    let resJson = JSON.parse(res.pots);

                    cc.log("LOBBY Jackpot Slot : ", resJson);

                    let aud = resJson["aud"];
                    if (typeof aud == "object") {
                        this.tabsListGame.updateItemJackpots("audition", aud["100"]["p"], aud["100"]["x2"] == 1, aud["1000"]["p"], aud["1000"]["x2"] == 1, aud["10000"]["p"], aud["10000"]["x2"] == 1, aud["5000"]["p"], aud["5000"]["x2"] == 1);
                    }

                    let kb = resJson["kb"];
                    this.tabsListGame.updateItemJackpots("khobau", kb["100"]["p"], kb["100"]["x2"] == 1, kb["1000"]["p"], kb["1000"]["x2"] == 1, kb["10000"]["p"], kb["10000"]["x2"] == 1, null, null);

                    let ndv = resJson["ndv"];
                    this.tabsListGame.updateItemJackpots("nudiepvien", ndv["100"]["p"], ndv["100"]["x2"] == 1, ndv["1000"]["p"], ndv["1000"]["x2"] == 1, ndv["10000"]["p"], ndv["10000"]["x2"] == 1, null, null);

                    let sah = resJson["sah"];
                    this.tabsListGame.updateItemJackpots("sieuanhhung", sah["100"]["p"], sah["100"]["x2"] == 1, sah["1000"]["p"], sah["1000"]["x2"] == 1, sah["10000"]["p"], sah["10000"]["x2"] == 1, null, null);

                    let spa = resJson["spa"];
                    if (typeof spa == "object") {
                        this.tabsListGame.updateItemJackpots("spartans", spa["100"]["p"], spa["100"]["x2"] == 1, spa["1000"]["p"], spa["1000"]["x2"] == 1, spa["10000"]["p"], spa["10000"]["x2"] == 1, spa["5000"]["p"], spa["5000"]["x2"] == 1);
                    }

                    let vqv = resJson["vqv"];
                    this.tabsListGame.updateItemJackpots("vuongquocvin", vqv["100"]["p"], vqv["100"]["x2"] == 1, vqv["1000"]["p"], vqv["1000"]["x2"] == 1, vqv["10000"]["p"], vqv["10000"]["x2"] == 1, null, null);

                    let minipoker = resJson["minipoker"];
                    if (typeof minipoker == "object") {
                        this.tabsListGame.updateItemJackpots("MiniPoker", minipoker["100"]["p"], minipoker["100"]["x2"] == 1, minipoker["1000"]["p"], minipoker["1000"]["x2"] == 1, minipoker["10000"]["p"], minipoker["10000"]["x2"] == 1, null, null);
                    }

                    let pokego = resJson["pokego"];
                    if (typeof pokego == "object") {
                        this.tabsListGame.updateItemJackpots("Slot3x3", pokego["100"]["p"], pokego["100"]["x2"] == 1, pokego["1000"]["p"], pokego["1000"]["x2"] == 1, pokego["10000"]["p"], pokego["10000"]["x2"] == 1, null, null);
                    }

                    BroadcastReceiver.send(BroadcastReceiver.ON_X2_SLOT, {
                        kb: kb["100"]["x2"], // Samurai
                        ndv: ndv["100"]["x2"], // Tho San Kho Bau
                        sah: sah["100"]["x2"], // Vuong Quoc Dap Hu
                        vqv: vqv["100"]["x2"] // Vinh Quang
                    })

                    break;
                }
            }
        }, this);

         // hna comment ban ca
        // ShootFishNetworkClient.getInstance().addListener((route, data) => {
        //     console.log(route);
        //     switch (route) {
        //         case "OnUpdateJackpot":
        //             // cc.log("LOBBY Jackpot Fish : ", data["14"]);
        //             // cc.log("LOBBY Jackpot Fish : ", data["24"]);
        //             // cc.log("LOBBY Jackpot Fish : ", data["34"]);
        //             this.tabsListGame.updateItemJackpots("shootfish", data["14"], false, data["24"], false, data["34"], false, null, null);
        //             break;
        //     }
        // }, this);

        AudioManager.getInstance().playBackgroundMusic(this.clipBgm);

        this.lblMailCount.node.parent.active = false;
        this.bannerPageView.onTouchMove = () => {
            this.curDurationChangePage = this.durationChangePage;
        }

        //this.initSDKBOX(); // hna comment

        // this.edbUsername.string = SPUtils.getUserName();
        // this.edbPassword.string = SPUtils.getUserPass();

        Configs.Login.AccessToken = SPUtils.getAccessToken();
        Configs.Login.Nickname = SPUtils.getNickName();

        // hna add : get x3 nap
        this.getX3Info();
        // end

        if (!Configs.Login.IsLogin) {
            if (Configs.Login.AccessToken) {
                this.initSpine();
                this.scheduleOnce(() => {
                    this.actLoginToken();
                }, 1.5);
            } else {
                this.initSpine();
            }

            this.panelNotLogin.active = true;
            this.panelLogined.active = false;
            this.topBarLogined.active = false;
            App.instance.buttonMiniGame.hidden();

            //fake jackpot
            this.tabsListGame.updateItemJackpots("nudiepvien", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("khobau", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, null, null, false);
            this.tabsListGame.updateItemJackpots("sieuanhhung", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("audition", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, Utils.randomRangeInt(5000, 7000) * 5000, false);
            this.tabsListGame.updateItemJackpots("spartans", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, Utils.randomRangeInt(5000, 7000) * 5000, false);
            this.tabsListGame.updateItemJackpots("vuongquocvin", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("shootfish", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("CaoThap", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("Slot3x3", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
            this.tabsListGame.updateItemJackpots("MiniPoker", Utils.randomRangeInt(5000, 7000) * 100, false, Utils.randomRangeInt(5000, 7000) * 1000, false, Utils.randomRangeInt(5000, 7000) * 10000, false, null, null);
        } else {
            this.panelNotLogin.active = false;
            this.panelLogined.active = true;
            this.topBarLogined.opacity = 0;
            this.topBarLogined.active = true;
            cc.tween(this.topBarLogined)
            .delay(1)
            .to(0.25, { opacity : 255})
            .start();
            this.topBarLogined.active = true;
            BroadcastReceiver.send(BroadcastReceiver.USER_INFO_UPDATED);
            SlotNetworkClient.getInstance().sendCheck(new cmd.ReqSubcribeHallSlot());
            MiniGameNetworkClient.getInstance().send(new cmd.ReqSubcribeJackpots());
            MiniGameNetworkClient.getInstance().sendCheck(new cmdNetworks.ReqGetMoneyUse());

            this.schedule(this.getMailNotRead, 10);
        }

        //this.initOneSignal(); // hna comment

        PopupShop.createAndShow(null);
        PopupCashOut.createAndShow(null);

        this.setStateIconSpine(true);
    }

    initOneSignal() {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox.PluginOneSignal == "undefined") {
            cc.log("OneSignal is not defined");
            return;
        }

        sdkbox.PluginOneSignal.init();
    }

    initSDKBOX() {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox == "undefined") {
            console.log("SDKBOX is not defined");
            return;
        }

        if (typeof sdkbox.PluginFacebook == "undefined") {
            console.log("Facebook is not defined");
            return;
        }

        var self = this;

        sdkbox.PluginFacebook.setListener({
            onLogin: function (isLogin, msg) {
                console.log("SDKBOX FB " + sdkbox.PluginFacebook.getAccessToken());
                SPUtils.setFbToken(sdkbox.PluginFacebook.getAccessToken());
                if (isLogin) {
                    Configs.Login.AccessToken = sdkbox.PluginFacebook.getAccessToken();
                    Http.get(Configs.App.API, { "c": 3, "un": "", "pw": "", "appid": NativeBridge.getPackageName(), "s": "fb", "utm_campaign": NativeBridge.getPackageName(), "utm_medium": NativeBridge.getPackageName() }, (err, json) => {
                        if (err) {
                            console.log(err);
                            App.instance.alertDialog.showMsg("Đã có sự cố xảy ra, vui lòng liên hệ admin");
                            return;
                        }

                        if (json["success"]) {
                            self.onLogin(null, json, "", "");
                            FacebookTracking.logLoginFB();
                        } else {
                            if (json["errorCode"] == "2001") {
                                PopupUpdateNickname.createAndShow(self.popups, "", "");
                                FacebookTracking.logRegisterFB();
                            } else {
                                App.instance.alertDialog.showMsg("Đã có lỗi xảy ra, vui lòng liên hệ admin!");
                            }
                        }
                    });
                } else {
                    App.instance.alertDialog.showMsg(msg);
                }
            },
            onAPI: function (tag, data) { },
            onSharedSuccess: function (data) { },
            onSharedFailed: function (data) { },
            onSharedCancel: function () { },
            onPermission: function (isLogin, msg) { }
        });
    }

    actLoginFacebook() {
        if (!cc.sys.isNative)
            return;

        if (typeof sdkbox == "undefined") {
            console.log("SDKBOX is not defined");
            return;
        }

        if (typeof sdkbox.PluginFacebook == "undefined") {
            console.log("Facebook is not defined");
            return;
        }

        console.log("Facebook Start Login");

        sdkbox.PluginFacebook.logout();
        sdkbox.PluginFacebook.login();

        Configs.Login.IsLoginFB = true;

        FacebookTracking.logHitLoginFb();
    }

    update(dt) {
        if (this.curDurationChangePage > 0) {
            this.curDurationChangePage = Math.max(0, this.curDurationChangePage - dt);
            if (this.curDurationChangePage == 0) {
                this.curDurationChangePage = this.durationChangePage;
                this.bannerPageView.scrollToNextIndex();
            }
        }

        // console.log("FPS: " + (1/dt));
    }

    onDestroy() {
        SlotNetworkClient.getInstance().send(new cmd.ReqUnSubcribeHallSlot());
    }

    getConfigCommon() {
        Http.get(Configs.App.API, { "c": 129 }, (err, json) => {
            if (err != null) {
                return;
            }

            Configs.App.LINK_TELE_VERIFY_PHONE = json["botTele"];
            Configs.App.LINK_SUPPORT = json["hotline"];
            Configs.App.LINK_FACEBOOK = json["facebook"];
            Configs.App.LINK_TELE_GROUP = json["teleChanel"];
            Configs.App.LIST_LEFT_NOTIFY_LOBBY = json["list_left_notify_lobby"];
            Configs.App.X3_GUIDE_CONTENT = json["x3_guide"];
            // Configs.Login.IsShowEvent = json["isShowEvent"] == 0; // hna comment

            if (json["events"]) {
                Configs.App.EVENTS = json["events"];
            }

            MiniGameNetworkClient.getInstance().send(new cmd.ReqGetSecurityInfo());
        });

        FacebookTracking.logPurchase();
    }

    // hna add : tien trinh x3 nap
    getX3Info() {
        Http.get(Configs.App.PAY_URL + '/x3_info', { "nickname": Configs.Login.Nickname }, (err, json) => {
            if (err != null) {
                return;
            }

            Configs.App.X3PROGRESS = json;
        });
    }
    // end

    onEvenBtnClick() {
        this.actEventMailBox();
        // this.actClickEvent();
    }

    onMailBtnClick() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showLoading(true);
        PopupMailBox.hidePopup();
        PopupEvent.hidePopup();
        this.popupEventMailbox.active = true;

        let popupContainer = this.popupEventMailbox.getChildByName('Container');
        popupContainer.x = 0;
        popupContainer.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(0.275),
                cc.moveTo(0.275, cc.v2(0, 0)).easing(cc.easeOut(2.0))
                // cc.moveTo(0.275, cc.v2(popupContainer.x, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(0.15, cc.v2(0, 0))
            // cc.moveTo(0.15, cc.v2(Configs.App.DEVICE_RESOLUTION.width/2 - popupContainer.width/2, 0))
        ));
        popupContainer.scale = 0.5;
        cc.tween(popupContainer)
        .to(0.15, {scale : 1.1})
        .to(0.1, {scale : 1})
        .start();


        // this.popupMailboxActive.active = false;
        this.popupMailboxActive.active = true;

        Http.get(Configs.App.PAY_URL + '/x3_info', { "nickname": Configs.Login.Nickname }, (err, json) => {
            App.instance.showLoading(false);
            if (err != null) {
                return;
            }
            App.instance.showLoading(false);

            Configs.App.X3PROGRESS = json;
            
            PopupMailBox.createAndShow(this.popupEventMailboxContents);
            this.actClickMailBox();
            
        });

        

        FacebookTracking.logMail();

        // this.actEventMailBox();
        // this.actClickMailBox();
    }
    
    actLogin_bk(): void {
        // console.log("actLogin");
        // let username = this.edbUsername.string.trim();
        // let password = this.edbPassword.string;

        // if (username.length == 0) {
        //     App.instance.alertDialog.showMsg("Tên đăng nhập không được để trống.");
        //     return;
        // }

        // if (password.length == 0) {
        //     App.instance.alertDialog.showMsg("Mật khẩu không được để trống.");
        //     return;
        // }

        // App.instance.showLoading(true);
        // Http.get(Configs.App.API, { c: 3, un: username, pw: md5(password), "utm_campaign": NativeBridge.getPackageName(), "utm_medium": NativeBridge.getPackageName() }, (err, res) => {
        //     this.onLogin(err, res, username, password);
        //     if (err == null && res && parseInt(res["errorCode"]) == 0) {
        //         FacebookTracking.logLoginBtn();
        //     }
        // });

        // Configs.Login.IsLoginFB = false;

        // FacebookTracking.logHitLoginButton();
    }

    actLogin(): void {
        PopupLogin.createAndShow(this.popups);
        Configs.Login.IsLoginFB = false;
    }

    actLoginToken() {
        App.instance.showLoading(true);
        Http.get(Configs.App.API, { "c": 2, "nn": Configs.Login.Nickname, "utm_campaign": NativeBridge.getPackageName(), "utm_medium": NativeBridge.getPackageName() }, (err, res) => {
            if (SPUtils.getUserName()) {
                Configs.Login.IsLoginFB = false;
            } else {
                Configs.Login.IsLoginFB = true;
            }
            if (err == null && parseInt(res["errorCode"]) != 0) {
                console.log("Login Bằng Token Không Thành Công");
                App.instance.showLoading(false);
            } else {
                LobbyController.instance.onLogin(err, res, SPUtils.getUserName(), SPUtils.getUserPass());
                if (err == null && res && parseInt(res["errorCode"]) == 0) {
                    FacebookTracking.logLoginToken();
                }
            }
        });
    }

    showPopupEvent() {
        if (Configs.Login.IsShowEvent) {
            PopupEvent.createAndShow(App.instance.popups);
        }
    }

    onLogin(err, res, username, password) {
        App.instance.showLoading(false);
        if (err != null) {
            App.instance.alertDialog.showMsg("Đăng nhập không thành công, vui lòng kiểm tra lại kết nối.");
            return;
        }
        // console.log(res);
        switch (parseInt(res["errorCode"])) {
            case 0:
                // console.log("Đăng nhập thành công.");
                Configs.Login.AccessToken = res["accessToken"];
                Configs.Login.SessionKey = res["sessionKey"];
                Configs.Login.Username = username;
                Configs.Login.Password = password;
                Configs.Login.IsLogin = true;
                var userInfo = JSON.parse(base64.decode(Configs.Login.SessionKey));
                Configs.Login.Nickname = userInfo["nickname"];
                Configs.Login.Avatar = userInfo["avatar"];
                Configs.Login.Coin = userInfo["vinTotal"];
                Configs.Login.LuckyWheel = userInfo["luckyRotate"];
                Configs.Login.IpAddress = userInfo["ipAddress"];
                Configs.Login.CreateTime = userInfo["createTime"];
                Configs.Login.Birthday = userInfo["birthday"];
                Configs.Login.Birthday = userInfo["birthday"];
                Configs.Login.VipPoint = userInfo["vippoint"];
                Configs.Login.VipPointSave = userInfo["vippointSave"];

                SPUtils.setAccessToken(Configs.Login.AccessToken);
                SPUtils.setNickName(Configs.Login.Nickname);

                this.panelNotLogin.active = false;
                this.panelLogined.active = true;
                this.topBarLogined.opacity = 0;
                this.topBarLogined.active = true;
                cc.tween(this.topBarLogined)
                .delay(1)
                .to(0.25, { opacity : 255})
                .start();

                SPUtils.setUserName(Configs.Login.Username);
                SPUtils.setUserPass(Configs.Login.Password);
                App.instance.buttonMiniGame.show();
                this.schedule(this.getMailNotRead, 10);

                BroadcastReceiver.send(BroadcastReceiver.USER_INFO_UPDATED);

                this.scheduleOnce(() => {
                    MiniGameNetworkClient.getInstance().checkConnect(() => {
                        MiniGameNetworkClient.getInstance().send(new cmd.ReqSubcribeJackpots());
                        this.getConfigCommon();
                    });
                }, 0.3);

                this.scheduleOnce(() => {
                    SlotNetworkClient.getInstance().sendCheck(new cmd.ReqSubcribeHallSlot());
                }, 0.6);

                 // hna comment ban ca
                // this.scheduleOnce(() => {
                //     ShootFishNetworkClient.getInstance().checkConnect(() => {
                //         BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                //     });
                // }, 0.9);

                this.scheduleOnce(() => {
                    TienLenNetworkClient.getInstance().checkConnect(() => { });
                }, 1.2);
                break;
            case 1007:
                App.instance.alertDialog.showMsg("Thông tin đăng nhập không hợp lệ.");
                break;
            case 2001:
                PopupUpdateNickname.createAndShow(this.popups, username, password);
                break;
            default:
                App.instance.alertDialog.showMsg("Đăng nhập không thành công vui lòng thử lại sau.");
                break;
        }
    }

    actRegister() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        PopupRegister.createAndShow(this.popups);
        Configs.Login.IsLoginFB = false;
    }

    actMenu() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.panelMenu.toggle();
    }

    actHideMenu() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.panelMenu.dismiss();
    }

    actShowMenu() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.panelMenu.show();
    }

    actDaiLy() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        Configs.App.getServerConfigNapRut(rs => {
            if(rs) {
                PopupCashOut.createAndShow(this.popups);
            } else {
                App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
            }
        });

        // if (Configs.App.IS_GOT_CONFIG) {
        //     PopupCashOut.createAndShow(this.popups);
        // } else {
        //     Configs.App.getServerConfig();

        //     App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
        // }
    }

    actGiftCode() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        if (Configs.App.IS_GOT_CONFIG) {
            PopupShop.createAndShowGiftCode(this.popups);
        } else {
            Configs.App.getServerConfig();

            App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
        }
    }

    actOtp() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        cc.sys.openURL(Configs.App.LINK_TELE_VERIFY_PHONE + "?start=" + Configs.Login.AccessToken + "-" + Configs.Login.Nickname);
        FacebookTracking.logOpenVerify();
    }

    actTransaction() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupTransaction.createAndShow(this.popups);

        FacebookTracking.logLSGD();
    }

    actSecurity() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupSecurity.createAndShow(this.popups);
    }

    actMailBox() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupMailBox.createAndShow(this.popups);

        FacebookTracking.logMail();
    }

    // hna add
    actEventMailBox() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showLoading(true);
        PopupMailBox.hidePopup();
        PopupEvent.hidePopup();
        this.popupEventMailbox.active = true;

        let popupContainer = this.popupEventMailbox.getChildByName('Container');
        popupContainer.x = 0;
        popupContainer.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(0.275),
                cc.moveTo(0.275, cc.v2(0, 0)).easing(cc.easeOut(2.0))
                // cc.moveTo(0.275, cc.v2(popupContainer.x, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(0.15, cc.v2(0, 0))
            // cc.moveTo(0.15, cc.v2(Configs.App.DEVICE_RESOLUTION.width/2 - popupContainer.width/2, 0))
        ));
        popupContainer.scale = 0.5;
        cc.tween(popupContainer)
        .to(0.15, {scale : 1.1})
        .to(0.1, {scale : 1})
        .start();

        this.popupMailboxActive.active = false;
        this.popupEventActive.active = true;

        Http.get(Configs.App.PAY_URL + '/x3_info', { "nickname": Configs.Login.Nickname }, (err, json) => {
            App.instance.showLoading(false);
            if (err != null) {
                return;
            }
            App.instance.showLoading(false);

            Configs.App.X3PROGRESS = json;
            
            PopupEvent.createAndShow(this.popupEventMailboxContents);
            
        });

        

        FacebookTracking.logMail();
    }
    actClickMailBox() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupEvent.hidePopup();
        this.popupMailboxActive.active = true;
        this.popupEventActive.active = false;
        PopupMailBox.createAndShow(this.popupEventMailboxContents);

        FacebookTracking.logMail();
    }
    actClickEvent() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupMailBox.hidePopup();
        this.popupMailboxActive.active = false;
        this.popupEventActive.active = true;
        PopupEvent.createAndShow(this.popupEventMailboxContents);
    }
    actHideEventMailBox() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        this.popupEventMailbox.active = false;

        let popupContainer = this.popupEventMailbox.getChildByName('Container');
        popupContainer.runAction(cc.sequence(
            cc.spawn( 
                cc.fadeIn(0.275),
                cc.moveTo(0.275, cc.v2(popupContainer.x, 0)).easing(cc.easeOut(2.0))
                ),
            cc.moveTo(0.15, cc.v2(Configs.App.DEVICE_RESOLUTION.width/2 - popupContainer.width/2 + 1500, 0))
        ));
    }
    // end

    actForgetPassword() {
        PopupForgetPassword.createAndShow(this.popups);
    }

    actVQMM() {
        App.instance.alertDialog.showMsg("Chức năng sắp ra mắt");
        return;
    }

    actEvent() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        cc.sys.openURL(Configs.App.LINK_EVENT);
    }

    actDownload() {
        cc.sys.openURL(Configs.App.LINK_DOWNLOAD);
    }

    actFanpage() {
        cc.sys.openURL(Configs.App.getLinkFanpage());

        FacebookTracking.logFanpage();
    }

    actTelegram() {
        App.instance.openTelegram(Configs.App.getLinkTelegramGroup());
    }

    actAppOTP() {
        App.instance.openTelegram();
    }

    actSupportOnline() {
        cc.sys.openURL(Configs.App.LINK_SUPPORT);
    }

    actSupport() {
        // this.panelSupport.active = !this.panelSupport.active;

        // if (this.panelSupport.active) {
        //     this.panelSupport.stopAllActions();
        //     this.panelSupport.scale = 1;
        //     this.panelSupport.runAction(cc.sequence(
        //         cc.scaleTo(0.2, 0).easing(cc.easeBackIn()),
        //         cc.callFunc(() => {
        //             this.panelSupport.active = false;
        //         })
        //     ));
        // } else {
        //     this.panelSupport.stopAllActions();
        //     this.panelSupport.active = true;
        //     this.panelSupport.scale = 0;
        //     this.panelSupport.runAction(cc.sequence(
        //         cc.scaleTo(0.2, 1).easing(cc.easeBackOut()),
        //         cc.callFunc(() => {
        //         })
        //     ));
        // }

        cc.sys.openURL(Configs.App.LINK_SUPPORT);

        FacebookTracking.logHotLine();
    }

    actVerifyTeleOtp() {
        cc.sys.openURL(Configs.App.LINK_TELE_VERIFY_PHONE);
    }

    actOpenEvent() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        PopupEvent.createAndShow(this.popups);
    }

    actBack() {
        this.panelMenu.node.active = false;

        App.instance.confirmDialog.show3("Bạn có muốn đăng xuất khỏi tài khoản?", "ĐĂNG XUẤT", (isConfirm) => {
            console.log("isConfirmisConfirm", isConfirm)
            if (isConfirm) {
                BroadcastReceiver.send(BroadcastReceiver.USER_LOGOUT);
                FacebookTracking.logLogout();
            }
        });
    }

    public actSwitchCoin() {
        if (this.lblCoin.node.parent.active) {
            this.lblCoin.node.parent.active = false;
            this.lblCoinFish.node.parent.active = true;

            this.iconCoinNormal.active = false;
            this.iconCoinFish.active = true;
        } else {
            this.lblCoin.node.parent.active = true;
            this.lblCoinFish.node.parent.active = false;

            this.iconCoinNormal.active = true;
            this.iconCoinFish.active = false;
        }
    }

    actSwitchToCoinFish() {
        this.lblCoin.node.parent.active = false;
        this.lblCoinFish.node.parent.active = true;

        this.iconCoinNormal.active = false;
        this.iconCoinFish.active = true;
    }

    actSwitchToCoinNormal() {
        this.lblCoin.node.parent.active = true;
        this.lblCoinFish.node.parent.active = false;

        this.iconCoinNormal.active = true;
        this.iconCoinFish.active = false;
    }

    actGameTaiXiu() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.openGameTaiXiuMini();
    }

    actGameBauCua() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        this.countDownloadingMiniGame += 1;
        this.setStateIconSpine(false);
        App.instance.openGameBauCua();
    }

    actGameCaoThap() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        this.countDownloadingMiniGame += 1;
        this.setStateIconSpine(false);
        App.instance.openGameCaoThap();
    }

    actGameSlot3x3() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        this.countDownloadingMiniGame += 1;
        this.setStateIconSpine(false);
        App.instance.openGameSlot3x3();
    }

    actGameMiniPoker() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        this.countDownloadingMiniGame += 1;
        this.setStateIconSpine(false);
        App.instance.openGameMiniPoker();
    }

    actGameOanTuTi() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        this.countDownloadingMiniGame += 1;
        this.setStateIconSpine(false);
        App.instance.openGameOanTuTi();
    }

    actGameTaLa() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.alertDialog.showMsg("Sắp ra mắt.");
    }

    actGoToSlot1() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot1", "Slot1");
        });
    }

    actGoToSlot2() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot2", "Slot2", this.tabsListGame.getItemGame("nudiepvien").circleProgress);
        });
    }

    actGoToSlot3() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot3", "Slot3");
        });
    }

    actGoToSlot4() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot4", "Slot4", this.tabsListGame.getItemGame("vuongquocvin").circleProgress);
        });
    }

    actGoToSlot5() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // if (VersionConfig.CPName == VersionConfig.CP_NAME_88KING || VersionConfig.CPName == VersionConfig.CP_NAME_MARBLES99) {
        //     App.instance.alertDialog.showMsg("Sắp ra mắt.");
        //     return;
        // }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot5", "Slot5", this.tabsListGame.getItemGame("khobau").circleProgress);
        });
    }

    actGoToSlot6() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // if (VersionConfig.CPName == VersionConfig.CP_NAME_88KING || VersionConfig.CPName == VersionConfig.CP_NAME_MARBLES99) {
        //     App.instance.alertDialog.showMsg("Sắp ra mắt.");
        //     return;
        // }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot6", "Slot6");
        });
    }

    actGoToSlot7() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // if (VersionConfig.CPName == VersionConfig.CP_NAME_88KING || VersionConfig.CPName == VersionConfig.CP_NAME_MARBLES99) {
        //     App.instance.alertDialog.showMsg("Sắp ra mắt.");
        //     return;
        // }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot7", "Slot7");
        });
    }

    actGoToSlot8() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // if (VersionConfig.CPName == VersionConfig.CP_NAME_88KING || VersionConfig.CPName == VersionConfig.CP_NAME_MARBLES99) {
        //     App.instance.alertDialog.showMsg("Sắp ra mắt.");
        //     return;
        // }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot8", "Slot8");
        });
    }

    actGoToSlot9() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // if (VersionConfig.CPName == VersionConfig.CP_NAME_88KING || VersionConfig.CPName == VersionConfig.CP_NAME_MARBLES99) {
        //     App.instance.alertDialog.showMsg("Sắp ra mắt.");
        //     return;
        // }
        App.instance.showErrLoading("Đang kết nối ...");
        SlotNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("Slot9", "Slot9", this.tabsListGame.getItemGame("sieuanhhung").circleProgress);
        });
    }

    actDev() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
    }

    actGoToShootFish() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("ShootFish", "ShootFish", this.tabsListGame.getItemGame("shootfish").circleProgress);
    }

    actGotoLoto() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // return; // hna add
        App.instance.loadSceneInSubpackage("Loto", "Loto", this.tabsListGame.getItemGame("Loto").circleProgress);
    }

    actGoToXocDia() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // App.instance.alertDialog.showMsg("Sắp ra mắt.");
        // return;
        App.instance.loadSceneInSubpackage("XocDia", "XocDia", this.tabsListGame.getItemGame("XocDia").circleProgress);
    }

    actAddCoin() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        Configs.App.getServerConfigNapRut(rs => {
            if(rs) {
                PopupShop.createAndShowShop(App.instance.popups);
            } else {
                App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
            }
        });

        // if (Configs.App.IS_GOT_CONFIG) {
        //     PopupShop.createAndShowShop(App.instance.popups);
        // } else {
        //     Configs.App.getServerConfig();

        //     App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
        // }
    }

    actSafeBoxClick() {
        this.notReadyYet();
    }

    onHonorClick() {

    }

    onMissionClick() {

    }

    notReadyYet() {
        App.instance.showToast("Tính năng này chưa sẵn sàng!");
    }

    actAddCoinCard() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        if (Configs.App.IS_GOT_CONFIG) {
            PopupShop.createAndShowCard(App.instance.popups);
        } else {
            Configs.App.getServerConfig();

            App.instance.showToast("Kết nối không thành công, vui lòng thử lại sau");
        }
    }

    actProfile() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        PopupProfile.createAndShow(this.popups);
    }

    accExchange() {
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        PopupShop.createAndShowTransfer(App.instance.popups);
    }

    actGoToTLMN() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        // App.instance.alertDialog.showMsg("Sắp ra mắt.");
        // return;

        App.instance.showErrLoading("Đang kết nối ...");
        TienLenNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            TienLenNetworkClient.IS_SOLO = false;
            App.instance.loadSceneInSubpackage("TienLen", "TienLen", this.tabsListGame.getItemGame("TienLen").circleProgress);
        });
    }

    actGameTLMNSolo() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }

        App.instance.showErrLoading("Đang kết nối ...");
        TienLenNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            TienLenNetworkClient.IS_SOLO = true;
            App.instance.loadSceneInSubpackage("TienLen", "TienLen", this.tabsListGame.getItemGame("TienLenSolo").circleProgress);
        });
    }

    actGoToSam() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.showErrLoading("Đang kết nối ...");
        SamNetworkClient.getInstance().checkConnect(() => {
            App.instance.showLoading(false);
            App.instance.loadSceneInSubpackage("TienLen", "Sam", this.tabsListGame.getItemGame("Sam").circleProgress);
        });
    }

    actGoToBaCay() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("BaCay", "BaCay", this.tabsListGame.getItemGame("BaCay").circleProgress);
    }

    actGoToBaiCao() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("BaiCao", "BaiCao", this.tabsListGame.getItemGame("BaiCao").circleProgress);
    }

    actGoToXiDach() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("XiDzach", "XiDzach", this.tabsListGame.getItemGame("XiDach").circleProgress);
    }

    actGoToLieng() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("Lieng", "Lieng", this.tabsListGame.getItemGame("Lieng").circleProgress);
    }

    actGoToPoker() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("Poker", "Poker", this.tabsListGame.getItemGame("Poker").circleProgress);
    }

    actGoToMauBinh() {
        AudioManager.getInstance().playEffect(this.soundClickBtn);
        if (!Configs.Login.IsLogin) {
            // App.instance.alertDialog.showMsg("Bạn chưa đăng nhập."); // hna comment
            LobbyController.instance.actLogin(); // hna add
            return;
        }
        App.instance.loadSceneInSubpackage("MauBinh", "MauBinh", this.tabsListGame.getItemGame("MauBinh").circleProgress);
    }

    actPay() {
        cc.sys.openURL(Configs.App.PAY_URL);
    }

    private getMailNotRead() {
        Http.get(Configs.App.API, { "c": 405, "nn": Configs.Login.Nickname, "p": 1 }, (err, res) => {
            if (err != null) return;
            if (res["success"]) {
                Configs.Login.MailCount = res["mailNotRead"];
                BroadcastReceiver.send(BroadcastReceiver.UPDATE_MAIL_COUNT);
            }
        });
    }

    actShowNpc() {
        App.instance.actShowNpc();
    }

    actVippoint() {
        PopupVip.createAndShow(this.popups);
    }

    checkPopupOpen(): boolean {
        let lobbyPopups = this.popups.children;
        for (let i = 0; i < lobbyPopups.length; i++) {
            if (lobbyPopups[i].active)
                return true;
        }

        if (this.panelMenu.node.active)
            return true;

        if (this.buttonListJackpot.container.active)
            return true;

        return false;
    }

    setStateIconSpine(isPlay) {
        // for (let index = 0; index < this.tabsListGame.arrSpines.length; index++) {
        //     this.tabsListGame.arrSpines[index].paused = !isPlay;
        // }
    }

    public playMusicBackground() {
        console.log("PLAYYYYYYYYYYYYYYYYYYYYYYY ^^^^^^^^^^^^")
        // let volume = this.panelMenu.toggleMusic.isChecked ? 0 : 1;
        AudioManager.getInstance().playBackgroundMusic(this.clipBgm);
        // cc.audioEngine.play(this.clipBgm, true, volume);
    }
}