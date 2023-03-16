import ShootFishNetworkClient from "../../../scripts/networks/ShootFishNetworkClient";
import Configs from "../../../scripts/common/Configs";
import App from "../../../scripts/common/App";
import Utils from "../../../scripts/common/Utils";
import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import cmd from "./Loto.Cmd";
import ListView from "../../../scripts/customui/listview/ListView";
import ItemHistory from "./Loto.ItemHistory";
import PopupHistory from "./Loto.PopupHistory";
import FacebookTracking from "../../../scripts/common/FacebookTracking";
import MiniGameNetworkClient from "../../../scripts/networks/MiniGameNetworkClient";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmdLobby from "../../../Lobby/src/Lobby.Cmd";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LotoController extends cc.Component {
    public static instance: LotoController = null;

    @property(cc.Label)
    labelUserGold: cc.Label = null;

    // Mode
    @property(cc.Node)
    listModes: cc.Node = null;
    @property(cc.Node)
    contentMode: cc.Node = null;
    @property(cc.Label)
    labelGameGuide: cc.Label = null;
    @property(cc.Node)
    bgGameGuide: cc.Node = null;

    // Location
    @property(cc.Toggle)
    listLocation: cc.Toggle[] = [];

    // Flex
    @property(cc.Toggle)
    listTabs: cc.Toggle[] = [];
    @property(cc.Node)
    contentTabs: cc.Node = null;
    @property(cc.EditBox)
    edtChatInput: cc.EditBox = null;
    @property(cc.Node)
    contentChat: cc.Node = null;
    @property(cc.Prefab)
    prefabItemChat: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollChat: cc.ScrollView = null;

    // Choose Channel
    @property(cc.Label)
    betDate: cc.Label = null;
    @property(cc.Label)
    currentBetChannel: cc.Label = null;
    @property(cc.Node)
    btnBetChannel: cc.Node = null;
    @property(cc.Node)
    betChannel: cc.Node = null;
    @property(cc.Node)
    contentBetChannel: cc.Node = null;
    @property(cc.Prefab)
    prefabItemChannel: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollBetChannel: cc.ScrollView = null;
    @property(cc.Node)
    listBetChannelPositions: cc.Node[] = [];

    @property(PopupHistory)
    popupHistory: PopupHistory = null;

    @property(cc.Node)
    btnTabResultChannel: cc.Node = null;
    @property(cc.Label)
    tabResultDate: cc.Label = null;
    @property(cc.Label)
    currentTabResultChannel: cc.Label = null;
    @property(cc.Node)
    contentTime: cc.Node = null;
    @property(cc.Node)
    arrowDate: cc.Node = null;
    @property([cc.Label])
    labelTabResult: cc.Label[] = [];
    @property(cc.Node)
    bgTabResult1: cc.Node = null;
    @property(cc.Node)
    bgTabResult2: cc.Node = null;

    @property(cc.Node)
    btnCancelChangeChannel: cc.Node = null;

    // Number Selector
    @property(cc.Node)
    numberSelector: cc.Node = null;
    @property(cc.Prefab)
    prefabItemNumber: cc.Prefab = null;
    @property(cc.Label)
    numbersPicked: cc.Label = null;

    public static readonly PREFAB_NUMBER_SELECTOR = "Loto.ItemNumbers";
    public static readonly PREFAB_ITEM_HISOTRY = "Loto.ItemHistory";
    public static readonly PREFAB_ITEM_NEW_BET = "Loto.ItemNewBet";

    @property(cc.EditBox)
    edtBet: cc.EditBox = null;
    @property(cc.Label)
    labelTotalBet: cc.Label = null;
    @property(cc.Label)
    labelWinValue: cc.Label = null;

    @property(cc.Node)
    popupNotify: cc.Node = null;
    @property(cc.Label)
    labelMsg: (cc.Label) = null;

    // Music
    @property({ type: cc.AudioClip })
    musicBackground: cc.AudioClip = null;

    @property(ListView)
    listViewNumber: ListView = null;

    @property(ListView)
    listViewNewBet: ListView = null;

    @property(cc.Node)
    betStoreTabMode: cc.Node = null;
    @property(cc.Node)
    betStoreTabBetting: cc.Node = null;
    @property(cc.Label)
    betStoreGameName: cc.Label = null;

    @property(cc.Label)
    lbCountDown: cc.Label = null;

    public static readonly GAME_CHANNEL_NONE = -1;

    private newBetDataSet = [];

    private sessionDate = "";
    private today = "";

    // Constant
    private GAME_MODE = 1;
    private GAME_LOCATION = 0;
    private GAME_CHANNEL = LotoController.GAME_CHANNEL_NONE;

    private mapChannelTime = {};

    private currentNumPicked = [];
    private currentBetValue = 0; //K
    private currentWinValue = 0; //K

    private numRequest = 0;
    private numRequestCompleted = 0;

    private numRequired = 0;

    private musicSlotState = null;
    private remoteMusicBackground = null;

    private helpCenter = [];
    private currentGameHelp = "";

    private gamesAvailable = null;
    private arrDates = null;

    private isOnTabResult = false;
    private tabResultCurrentChannelId = LotoController.GAME_CHANNEL_NONE;
    private arr3Sessions = null;
    private countBackOnTabResult = 0;

    private listRecentNumberPicks = [];

    onLoad() {
        LotoController.instance = this;
        this.sessionDate = "";
        let date = new Date();
        let day = date.getDate();
        let month = date.getMonth() + 1;
        let year = date.getFullYear();

        this.sessionDate += "" + year;
        this.sessionDate += month < 10 ? "0" + month : month;
        this.sessionDate += day < 10 ? "0" + day : day;

        this.today = (day < 10 ? "0" + day : day) + "/" + (month < 10 ? "0" + month : month) + "/" + year;
        console.log(this.sessionDate);

        console.log("UserId : ", Configs.Login.UserId);
        console.log("SessionKey : ", Configs.Login.SessionKey);
        console.log("UserIdFish : ", Configs.Login.UserIdFish);
        console.log("CoinFish : ", Configs.Login.CoinFish);

        // setup arrDates
        let today = new Date();
        this.arrDates = [today];
        for (let index = 1; index < 7; index++) {
            let yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - index);
            this.arrDates.push(yesterday);
        }
        for (let index = 0; index < this.arrDates.length; index++) {
            let time = this.arrDates[index];
            this.contentTime.children[1].children[index].children[0].getComponent(cc.Label).string = this.formatDate(time);
        }

        this.arr3Sessions = [today];
        for (let index = 1; index < 3; index++) {
            let yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - index);
            this.arr3Sessions.push(yesterday);
        }

        this.listViewNewBet.init([], LotoController.PREFAB_ITEM_NEW_BET);
    }

    start() {
        // musicSave :   0 == OFF , 1 == ON
        var musicSave = cc.sys.localStorage.getItem("musicLoto");
        if (musicSave != null) {
            this.musicSlotState = parseInt(musicSave);
        } else {
            this.musicSlotState = 1;
            cc.sys.localStorage.setItem("musicLoto", "1");
        }

        if (this.musicSlotState == 1) {
            this.remoteMusicBackground = cc.audioEngine.playMusic(this.musicBackground, true);
        }

        this.initNumSelector(1000);

        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            this.labelUserGold.string = Utils.formatNumber(Configs.Login.CoinFish);
        }, this);
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

        ShootFishNetworkClient.getInstance().addListener((route, push) => {
            console.log("LOTO route : ", route);
            console.log("LOTO push : ", push);
            switch (route) {
                case "onLOTO1":
                    console.log("Loto LOTO1 push : ", push);

                    let data = {
                        nickname: push["nickname"],
                        channel: push["channel"],
                        mode: push["mode"],
                        bet: push["cost"],
                        nums: push["number"]
                    };

                    this.listViewNewBet.adapter.addData(data);
                    this.listViewNewBet.notifyUpdate();
                    break;
                case "onLOTO2":
                    console.log("Loto LOTO2 push : ", push);
                    break;
                case "onLOTO3":
                    console.log("Loto LOTO3 push : ", push);
                    break;
                case "onLOTO4":
                    console.log("Loto LOTO4 push : ", push);
                    break;
                case "onLOTO5":
                    console.log("Loto LOTO5 push : ", push);
                    break;
                case "onLOTO6":
                    console.log("Loto LOTO6 push : ", push);
                    break;
                case "onLOTO7":
                    console.log("Loto LOTO7 push : ", push);
                    let itemNewChat = cc.instantiate(this.prefabItemChat);
                    itemNewChat.getComponent('Loto.ItemChat').initItem({
                        nickname: push["nickname"],
                        msg: push["msg"],
                    });
                    this.contentChat.addChild(itemNewChat);
                    this.scrollChat.scrollToBottom(0.2);
                    break;
                case "onLOTO8":
                    console.log("Loto LOTO8 push : ", push);
                    break;
                case "onLOTO9":
                    console.log("Loto LOTO9 push : ", push);
                    let channel = push['channel'];
                    let mode = push['mode'];
                    let on = push['on'];
                    let open = push['open'];
                    let close = push['close'];
                    if (this.gamesAvailable != null) {
                        this.gamesAvailable[(channel * 100) + mode].on = on;
                        this.gamesAvailable[(channel * 100) + mode].open = open;
                        this.gamesAvailable[(channel * 100) + mode].close = close;
                    }
                    break;
                default:
                    break;
            }
        }, this);

        ShootFishNetworkClient.getInstance().addOnClose(() => {
            App.instance.confirmDialog.show3("Bạn bị mất kết nối, bạn có muốn kết nối lại ?", "Kết Nối", (isConfirm) => {
                if (isConfirm) {
                    ShootFishNetworkClient.getInstance().connect();
                }
            });
        }, this);

        // Flex
        this.changeFlexFeatures(this.listTabs[1]);

        // Mode
        App.instance.showLoading(true);

        this.betDate.string = this.today;

        ShootFishNetworkClient.getInstance().checkConnect((isLogined) => {
            if (!isLogined) {
                App.instance.alertDialog.showMsgWithOnDismissed("Kết nối thất bại, vui lòng thử lại.", () => {
                    this.actBack();
                });
                return;
            }

            this.requestGetChatHistory();
            this.requestGetGameAvailable();
            // Lay ket qua cac lan danh truoc xem hom nay co an dc gi k
            this.requestGetCalculateResult();

            this.requestGetNewBetHistory();
        });

        this.actHideBetStoreTabBetting();
        this.lbCountDown.string = "--:--";
    }

    // action
    showListMode() {
        this.listModes.active = !this.listModes.active;
    }

    changeMode(event, groupId) {
        var groupMode = parseInt(groupId);
        console.log("Loto changeMode groupMode : ", groupMode);

        this.resetContentModeState();
        this.contentMode.children[groupMode - 1].active = true;
        this.listModes.children[groupMode - 1].getComponent(cc.Toggle).isChecked = true;

        let arrModesInGroup = [];
        switch (groupMode) {
            case 1:
                arrModesInGroup = [1, 2];
                break;
            case 2:
                arrModesInGroup = [3, 4, 5];
                break;
            case 3:
                arrModesInGroup = [6, 7];
                break;
            case 4:
                arrModesInGroup = [9, 8, 10];
                break;
            case 5:
                arrModesInGroup = [11, 12, 13, 14];
                break;
            case 6:
                arrModesInGroup = [15, 16, 17];
                break;
            case 7:
                arrModesInGroup = [18, 19, 20];
                break;
            case 8:
                arrModesInGroup = [21, 22, 23];
                break;
            default:
                break;
        }

        let arrModeAvailableInLocation = [];
        switch (this.GAME_LOCATION) {
            case cmd.Code.LOTO_LOCATION.MienBac:
                arrModeAvailableInLocation = cmd.Code.LOTO_MODE_BAC;
                break;
            case cmd.Code.LOTO_LOCATION.MienTrung:
                arrModeAvailableInLocation = cmd.Code.LOTO_MODE_TRUNG;
                break;
            case cmd.Code.LOTO_LOCATION.MienNam:
                arrModeAvailableInLocation = cmd.Code.LOTO_MODE_NAM;
                break;
            default:
                break;
        }

        // setup Mode in Group
        let nodeMode = this.contentMode.children[groupMode - 1];
        for (let index = 0; index < arrModesInGroup.length; index++) {
            let findId = arrModeAvailableInLocation.indexOf(arrModesInGroup[index]);
            if (findId != -1) {
                nodeMode.children[index].active = true;
                // Open
            } else {
                // Block
                nodeMode.children[index].active = false;
            }
        }

        var firstModeInGroup = arrModesInGroup[0];
        if (this.GAME_LOCATION == cmd.Code.LOTO_LOCATION.MienTrung && firstModeInGroup == 11) {
            firstModeInGroup = arrModesInGroup[1];
        }
        this.chooseGameMode(firstModeInGroup);
    }

    chooseMode(event, modeId) {
        this.chooseGameMode(modeId);
        this.actShowBetStoreTabBetting();
    }

    chooseGameMode(modeId) {
        console.log("Loto chooseMode : ", modeId);
        this.GAME_MODE = parseInt(modeId);

        this.numRequired = cmd.Code.LOTO_GAME_MODE_NUM_REQUIRE[this.GAME_MODE];
        console.log("Loto chooseMode numRequired : ", this.numRequired);
        this.changeGameGuide();
        this.currentNumPicked = [];
        this.labelTotalBet.string = "0";
        this.edtBet.string = "1000";
        console.log("Loto chooseMode GAME_CHANNEL : ", this.GAME_CHANNEL);
        this.requestGetPayWinRate();
        this.resetNumberSelectorListView();
    }

    chooseLocation(toggle) {
        var index = this.listLocation.indexOf(toggle);
        console.log("Loto chooseLocation locationId : ", index);
        this.GAME_LOCATION = index;

        let firstChannelInLocation = 0;
        switch (this.GAME_LOCATION) {
            case cmd.Code.LOTO_LOCATION.MienBac:
                this.setupGroup(cmd.Code.LOTO_GROUP_BAC);
                firstChannelInLocation = 1;
                break;
            case cmd.Code.LOTO_LOCATION.MienTrung:
                this.setupGroup(cmd.Code.LOTO_GROUP_TRUNG);
                firstChannelInLocation = 2;
                break;
            case cmd.Code.LOTO_LOCATION.MienNam:
                this.setupGroup(cmd.Code.LOTO_GROUP_NAM);
                firstChannelInLocation = 16;
                break;
            default:
                break;
        }

        this.GAME_CHANNEL = LotoController.GAME_CHANNEL_NONE;
        this.changeMode(null, cmd.Code.LOTO_GAME_MODE.BaoLo2So); // Location nao cung dc choi Mode 1
        this.btnBetChannel.children[0].angle = 180;
        this.currentBetChannel.string = "Chọn Đài";
        this.actionCancelBet();

        // this.onBetChannelSelected("0", firstChannelInLocation);
    }

    setupGroup(arrGroupAvailable) {
        for (let index = 0; index < this.listModes.childrenCount; index++) {
            let findId = arrGroupAvailable.indexOf(index + 1);
            if (findId != -1) {
                // Open
                this.listModes.children[index].active = true;
            } else {
                // Block
                this.listModes.children[index].active = false;
            }
        }
    }

    actionCancelBet() {
        this.currentNumPicked = [];
        this.labelTotalBet.string = "0";
        this.labelWinValue.string = "" + (this.currentWinValue * 1000);
        this.edtBet.string = "1000";
        this.resetContentNumberPicked();
        this.chooseGameMode(this.GAME_MODE);
    }

    actionSubmitBet() {
        console.log("LOTO actionSubmitBet GAME_LOCATION : ", this.GAME_LOCATION);
        console.log("LOTO actionSubmitBet GAME_MODE : ", this.GAME_MODE);
        console.log("LOTO actionSubmitBet GAME_CHANNEL : ", this.GAME_CHANNEL);
        console.log("LOTO actionSubmitBet gamesAvailable : ", this.gamesAvailable);

        // kiem tra so luong so can danh cua mode do
        if (this.numRequired == 1) {
            if (this.currentNumPicked.length < 1) {
                let msg_3 = "Bạn cần chọn ít nhất 1 số !";
                this.showPopupNotify(msg_3);
                return;
            }
        } else {
            if (this.currentNumPicked.length !== this.numRequired) {
                let msg_3 = "Bạn cần chọn " + this.numRequired + " số !";
                this.showPopupNotify(msg_3);
                return;
            }
        }

        // Kiem tra thoi gian duoc phep danh
        console.log("LOTO showBetChannel GAME_CHANNEL : ", this.GAME_CHANNEL);
        console.log("LOTO showBetChannel GAME_MODE : ", this.GAME_MODE);

        let field = (this.GAME_CHANNEL * 100) + this.GAME_MODE;
        if (this.gamesAvailable[field].on) {
            // Open -> Check Time
            let currentHour = new Date().getHours();
            let currentMinutes = new Date().getMinutes();

            let openRaw = this.gamesAvailable[field].open.split(":");
            let openHour = parseInt(openRaw[0]);
            let openMinute = parseInt(openRaw[1]);

            let closeRaw = this.gamesAvailable[field].close.split(":");
            let closeHour = parseInt(closeRaw[0]);
            let closeMinute = parseInt(closeRaw[1]);

            let currentTime = (currentHour * 60) + currentMinutes;
            let timeOpen = (openHour * 60) + openMinute;
            let timeClose = (closeHour * 60) + closeMinute;

            if (currentTime > timeOpen && currentTime < timeClose) {
                // Duoc danh
            } else {
                // Khong dc danh
                let msg_3 = cmd.Code.LOTO_GAME_MODE_NAME[this.GAME_MODE] + " - Đài " + cmd.Code.LOTO_CHANNEL_NAME[this.GAME_CHANNEL] +
                    "\nhiện đã hết phiên !" + "\n Phiên từ " + this.gamesAvailable[field].open + " đến " + this.gamesAvailable[field].close;
                this.showPopupNotify(msg_3);
                return;
            }
        } else {
            // Close -> Khong dc danh : case nay se k vao vi bi chan o buoc chooseChannel r
            let msg_3 = cmd.Code.LOTO_GAME_MODE_NAME[this.GAME_MODE] + " - Đài " + cmd.Code.LOTO_CHANNEL_NAME[this.GAME_CHANNEL] +
                "\nhiện đã đóng !";
            this.showPopupNotify(msg_3);
            return;
        }

        let totalBet = 0;
        let betOneTurn = parseInt(this.edtBet.string);
        if (this.numRequired == 1) {
            totalBet = betOneTurn * this.currentBetValue * this.currentNumPicked.length;
        } else {
            totalBet = betOneTurn * this.currentBetValue;
        }
        console.log("Loto actionSubmitBet totalBet : ", totalBet);
        if (Configs.Login.CoinFish >= totalBet) {
            console.log("Loto actionSubmitBet Du tien");
            App.instance.showLoading(true);
            switch (this.numRequired) {
                case 1:
                    this.numRequest = 0;
                    this.numRequestCompleted = this.currentNumPicked.length;
                    for (let index = 0; index < this.currentNumPicked.length; index++) {
                        this.requestPlay(this.currentNumPicked[index], betOneTurn);
                    }
                    break;
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                    this.numRequest = 0;
                    this.numRequestCompleted = 1;
                    this.requestPlay(this.currentNumPicked, betOneTurn);
                    break;
                default:
                    break;
            }

            FacebookTracking.betLoto();
        } else {
            // Khong du tien
            console.log("Loto actionSubmitBet Khong du tien");
            this.showPopupNotify("Không đủ tiền !");
        }
    }

    // Feature Flex
    changeFlexFeatures(toggle) {
        var index = this.listTabs.indexOf(toggle);
        console.log("Loto changeFlexFeatures tabId : ", index);
        this.resetContentTabsState();
        this.contentTabs.children[index].active = true;
        switch (index) {
            case 0: // Chat
                this.scrollChat.scrollToBottom(0.2);
                break;
            case 1:  // New Bet
                this.listViewNewBet.adapter.setDataSet(this.newBetDataSet, LotoController.PREFAB_ITEM_NEW_BET);
                this.listViewNewBet.clearState();
                this.listViewNewBet.notifyUpdate();
                break;
            case 2: // Result
                this.onBetChannelSelected("1", cmd.Code.LOTO_CHANNEL.MIEN_BAC);
                break;
            default:
                break;
        }
    }

    actionSendChat() {
        console.log("Chat msg : ", this.edtChatInput.string);

        let msg = this.edtChatInput.string.trim();
        console.log("Chat msg trim : ", msg);
        if (msg.length > 0) {
            this.requestChat(msg);
            this.edtChatInput.string = "";
        } else {
            this.showPopupNotify("Nội dung chat không được để trống");
        }
    }

    // Choose Bet Channel
    showBetChannel(event, type) {
        this.btnBetChannel.children[0].angle = 180;
        this.btnTabResultChannel.children[0].angle = 180;

        this.btnCancelChangeChannel.active = true;

        if (this.isContentTimeOn()) {
            this.switchContentTime();
        }

        this.betChannel.active = !this.betChannel.active;
        if (type == "0") {// o phan chon cuoc
            this.btnBetChannel.children[0].angle = this.betChannel.active ? 0 : 180;
            this.betChannel.position = this.listBetChannelPositions[0].position;
        } else if (type == "1") { // o phan tab ket qua nho
            this.btnTabResultChannel.children[0].angle = this.betChannel.active ? 0 : 180;
            this.betChannel.position = this.listBetChannelPositions[1].position;
        }

        if (this.contentBetChannel.childrenCount == 0) {
            for (let index = 1; index < 36; index++) { // 0 = NONE
                let info = {
                    name: cmd.Code.LOTO_CHANNEL_NAME[index],
                    id: index,
                    from: type
                };
                let item = cc.instantiate(this.prefabItemChannel);
                item.getComponent("Loto.ItemChannel").initItem(info);
                this.contentBetChannel.addChild(item);
            }
        } else {
            // update field From
            for (let index = 0; index < this.contentBetChannel.childrenCount; index++) {
                this.contentBetChannel.children[index].getComponent("Loto.ItemChannel").updateInfo(type);
            }
        }

        for (let index = 0; index < this.contentBetChannel.childrenCount; index++) {
            this.contentBetChannel.children[index].active = true;
        }

        if (type == "0") {
            let arrChannelAvailableInLocation = [];
            // switch (this.GAME_LOCATION) {
            //     case cmd.Code.LOTO_LOCATION.MienBac:
            //         arrChannelAvailableInLocation = cmd.Code.LOTO_CHANNEL_BAC;
            //         break;
            //     case cmd.Code.LOTO_LOCATION.MienTrung:
            //         arrChannelAvailableInLocation = cmd.Code.LOTO_CHANNEL_TRUNG;
            //         break;
            //     case cmd.Code.LOTO_LOCATION.MienNam:
            //         arrChannelAvailableInLocation = cmd.Code.LOTO_CHANNEL_NAM;
            //         break;
            //     default:
            //         break;
            // }
            arrChannelAvailableInLocation = cmd.Code.LOTO_CHANNEL_BAC.concat(cmd.Code.LOTO_CHANNEL_TRUNG).concat(cmd.Code.LOTO_CHANNEL_NAM);

            console.log("LOTO showBetChannel GAME_CHANNEL : ", this.GAME_CHANNEL);
            console.log("LOTO showBetChannel GAME_MODE : ", this.GAME_MODE);
            console.log("LOTO showBetChannel arrChannelAvailableInLocation : ", arrChannelAvailableInLocation);

            let arrChannelOpenNow = [];
            for (let index = 0; index < arrChannelAvailableInLocation.length; index++) {
                let field = (arrChannelAvailableInLocation[index] * 100) + this.GAME_MODE;
                console.log("LOTO showBetChannel field : ", field);
                console.log("LOTO showBetChannel field.on : ", this.gamesAvailable[field].on);
                if (this.gamesAvailable[field].on) {
                    // Open -> Check Time
                    let currentHour = new Date().getHours();
                    let currentMinutes = new Date().getMinutes();

                    console.log("LOTO showBetChannel currentHour : ", currentHour);
                    console.log("LOTO showBetChannel currentMinutes : ", currentMinutes);

                    let openRaw = this.gamesAvailable[field].open.split(":");
                    let openHour = parseInt(openRaw[0]);
                    let openMinute = parseInt(openRaw[1]);

                    console.log("LOTO showBetChannel openHour substr : ", openRaw[0]);
                    console.log("LOTO showBetChannel openMinute substr : ", openRaw[1]);
                    console.log("LOTO showBetChannel openHour : ", openHour);
                    console.log("LOTO showBetChannel openMinute : ", openMinute);

                    let closeRaw = this.gamesAvailable[field].close.split(":");
                    let closeHour = parseInt(closeRaw[0]);
                    let closeMinute = parseInt(closeRaw[1]);

                    console.log("LOTO showBetChannel closeHour substr : ", closeRaw[0]);
                    console.log("LOTO showBetChannel closeMinute substr : ", closeRaw[1]);
                    console.log("LOTO showBetChannel closeHour : ", closeHour);
                    console.log("LOTO showBetChannel closeMinute : ", closeMinute);

                    let currentTime = (currentHour * 60) + currentMinutes;
                    let timeOpen = (openHour * 60) + openMinute;
                    let timeClose = (closeHour * 60) + closeMinute;

                    console.log("LOTO showBetChannel currentTime : ", currentTime);
                    console.log("LOTO showBetChannel timeOpen : ", timeOpen);
                    console.log("LOTO showBetChannel timeClose : ", timeClose);

                    console.log("LOTO showBetChannel gamesAvailable : ", this.gamesAvailable);

                    if (currentTime > timeOpen && currentTime < timeClose) {
                        console.log("LOTO showBetChannel OK : ", arrChannelAvailableInLocation[index]);
                        arrChannelOpenNow.push(arrChannelAvailableInLocation[index]);
                        this.mapChannelTime[arrChannelAvailableInLocation[index]] = {
                            hours: closeHour,
                            min: closeMinute
                        }
                    }
                } else {
                    // Close
                }
            }
            console.log("LOTO showBetChannel arrChannelOpenNow : ", arrChannelOpenNow);

            let openCount = 0;

            for (let index = 0; index < this.contentBetChannel.childrenCount; index++) {
                let findId = arrChannelOpenNow.indexOf(index + 1);
                if (findId != -1) {
                    // Open
                    this.contentBetChannel.children[index].active = true;
                    openCount++;
                } else {
                    // Block
                    this.contentBetChannel.children[index].active = false;
                }
            }

            if (openCount == 0) {
                this.btnCancelChangeChannel.active = false;
                this.betChannel.active = false;

                this.showPopupNotify("Đã hết giờ đặt cược");
            }
        }
        this.scrollBetChannel.scrollToOffset(cc.v2(0, 0), 0.2);
    }

    startTimer(hours: number, minutes: number, label: cc.Label) {
        let interval;
        let timer = (hours * 60 + minutes) * 60;
        let counter = () => {
            let tm = Math.floor(timer / 60);
            let s = timer - tm * 60;
            let h = Math.floor(tm / 60);
            let m = tm - h * 60;
            let lbHours = h < 10 ? "0" + h : h;
            let lbMinutes = m < 10 ? "0" + m : m;
            let seconds = s < 10 ? "0" + s : s;

            if (label && label.string) {
                label.string = lbHours + ":" + lbMinutes + ":" + seconds;
                if (--timer < 0) {
                    clearInterval(interval);
                    label.string = "--:--";
                }
            } else {
                clearInterval(interval);
            }

        };

        interval = setInterval(counter, 1000);
    }

    onBetChannelSelected(type, channelId) {
        console.log("LotoController onBetChannelSelected : " + JSON.stringify(this.mapChannelTime[channelId]));
        console.log("LotoController onBetChannelSelected type : ", type);
        console.log("LotoController onBetChannelSelected channelId : ", channelId);

        if (this.mapChannelTime[channelId]) {
            let currentHour = new Date().getHours();
            let currentMinutes = new Date().getMinutes();

            let closeHour = this.mapChannelTime[channelId].hours;
            let closeMinutes = this.mapChannelTime[channelId].min;

            if (currentHour * 60 + currentMinutes < closeHour * 60 + closeMinutes) {
                let timeLeft = (closeHour * 60 + closeMinutes) - (currentHour * 60 + currentMinutes);
                let hourLeft = Math.floor(timeLeft / 60);
                let minuteLeft = timeLeft - hourLeft * 60;
                this.lbCountDown.string = "--:--";

                this.startTimer(hourLeft, minuteLeft, this.lbCountDown);
            } else {
                this.lbCountDown.string = "--:--";
            }
        } else {
            this.lbCountDown.string = "--:--";
        }

        this.btnCancelChangeChannel.active = false;
        this.betChannel.active = false;
        if (type == "0") {// o phan chon cuoc
            if (this.getLocationByChannelId(this.GAME_CHANNEL) != this.getLocationByChannelId(channelId)) {
                this.chooseLocation(this.listLocation[this.getLocationByChannelId(channelId)]);
            }

            this.btnBetChannel.children[0].angle = 180;
            this.currentBetChannel.string = cmd.Code.LOTO_CHANNEL_NAME[channelId];
            this.GAME_CHANNEL = channelId;
            this.actionCancelBet();
        } else if (type == "1") { // o phan tab ket qua nho
            this.btnTabResultChannel.children[0].angle = 180;
            this.currentTabResultChannel.string = cmd.Code.LOTO_CHANNEL_NAME[channelId];
            this.tabResultCurrentChannelId = channelId;

            this.isOnTabResult = true;
            this.countBackOnTabResult = 0;
            this.getDataOnTabResult(channelId);
        }
    }

    getDataOnTabResult(channelId) {
        console.log("Loto getDataOnTabResult this.countBackOnTabResult : ", this.countBackOnTabResult);
        console.log("Loto getDataOnTabResult this.arr3Sessions : ", this.arr3Sessions);
        let day = this.arr3Sessions[this.countBackOnTabResult].getDate();
        let month = this.arr3Sessions[this.countBackOnTabResult].getMonth() + 1;
        let year = this.arr3Sessions[this.countBackOnTabResult].getFullYear();
        this.tabResultDate.string = (day < 10 ? "0" + day : day) + "/" + (month < 10 ? "0" + month : month) + "/" + year;

        let sessionSelected = "";
        sessionSelected += "" + year;
        sessionSelected += month < 10 ? "0" + month : month;
        sessionSelected += day < 10 ? "0" + day : day;
        this.requestGetLotoResult(sessionSelected, channelId);
    }

    cancelChangeChannel() {
        this.btnCancelChangeChannel.active = false;
        this.btnBetChannel.children[0].angle = 180;
        this.btnTabResultChannel.children[0].angle = 180;
        this.betChannel.active = false;

        if (this.isContentTimeOn()) {
            this.switchContentTime();
        }
    }

    // Number Selector
    initNumSelector(numCount) {
        this.listViewNumber.init([], LotoController.PREFAB_NUMBER_SELECTOR);
    }

    updateNumSelector(numCount) {
        const SEGMENT_LENGTH = 10;

        let dataSet = [];
        for (let i = 0; i < Math.ceil(numCount / SEGMENT_LENGTH); i++) {
            let dataSubSet = [];
            for (let j = 0; j < SEGMENT_LENGTH; j++) {
                if (i * SEGMENT_LENGTH + j < numCount) {
                    dataSubSet.push({
                        numCount: numCount,
                        value: i * SEGMENT_LENGTH + j,
                        isChecked: false
                    });
                }
            }
            dataSet.push(dataSubSet);
        }

        this.listViewNumber.adapter.setDataSet(dataSet, LotoController.PREFAB_NUMBER_SELECTOR);
        this.listViewNumber.clearState();
        this.listViewNumber.notifyUpdate();
    }

    // Game guide
    changeGameGuide() {
        console.log("LOTO changeGameGuide GAME_MODE : ", this.GAME_MODE);
        console.log("LOTO changeGameGuide GAME_LOCATION : ", this.GAME_LOCATION);
        console.log("LOTO changeGameGuide GAME_CHANNEL : ", this.GAME_CHANNEL);
        this.currentGameHelp = "";
        for (let index = 0; index < this.helpCenter.length; index++) {
            let data = this.helpCenter[index];
            if (data.gameMode == this.GAME_MODE && data.location == this.GAME_LOCATION) {
                this.currentGameHelp = data.help;
            }
        }
        console.log(this.currentGameHelp);
        this.labelGameGuide.string = this.currentGameHelp;
    }

    // State
    resetContentModeState() {
        for (let index = 0; index < this.contentMode.childrenCount; index++) {
            this.contentMode.children[index].active = false;
        }
    }

    resetContentTabsState() {
        for (let index = 0; index < this.contentTabs.childrenCount; index++) {
            this.contentTabs.children[index].active = false;
        }
    }

    resetContentNumberPicked() {
        this.numbersPicked.string = "";
    }

    switchContentTime() {
        console.log("LOTO showContentTime");

        let scaleNow = this.contentTime.scaleY;
        this.contentTime.stopAllActions();
        if (scaleNow < 0.5) {
            this.arrowDate.angle = 0;
            this.contentTime.scaleY = 0;
            this.contentTime.runAction(
                cc.scaleTo(0.2, 1, 1)
            );

            this.btnCancelChangeChannel.active = true;
        } else {
            this.arrowDate.angle = 180;
            this.contentTime.scaleY = 1;
            this.contentTime.runAction(
                cc.scaleTo(0.2, 1, 0)
            );
        }
    }

    isContentTimeOn() {
        return this.contentTime.scaleY > 0;
    }

    chooseTime(event, id) {
        this.btnCancelChangeChannel.active = false;

        console.log("LOTO chooseTime id : ", id);
        console.log("LOTO chooseTime arrDates : ", this.arrDates[parseInt(id)]);
        this.arrowDate.angle = 180;

        this.switchContentTime();

        let time = this.arrDates[parseInt(id)];
        this.tabResultDate.string = this.formatDate(time);
        let session = this.getSession(time);
        console.log("LOTO chooseTime session : ", session);
        this.requestGetLotoResult(session, this.tabResultCurrentChannelId);
    }

    formatDate(date) {
        var month = '' + (date.getMonth() + 1);
        var day = '' + date.getDate();
        var year = date.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [day, month, year].join('/');
    }

    getSession(date) {
        var month = '' + (date.getMonth() + 1);
        var day = '' + date.getDate();
        var year = date.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('');
    }

    showPopupHistory() {
        this.requestGetPlayerRequest();
    }

    showPopupNotify(msg) {
        this.popupNotify.active = true;
        this.labelMsg.string = msg;

        this.popupNotify.scaleY = 0;
        this.popupNotify.runAction(cc.scaleTo(0.25, 1, 1));
    }

    closePopupNotify() {
        this.popupNotify.scaleY = 1;
        this.popupNotify.runAction(cc.sequence(cc.scaleTo(0.25, 1, 0), cc.callFunc(() => {
            this.popupNotify.active = false;
        })));
    }

    onTextChangeBet(event) {
        console.log("LOTO onTextChangeBet event: ", event);
        if (event.length > 0) {
            if (/^[0-9]*$/.test(event) == false) {
                App.instance.alertDialog.showMsg("Tiền cược phải là số dương");
                this.edtBet.string = "1000";
                event = "1000";
            }
            let raw = parseInt(event);
            if (raw < 1000) {
                this.edtBet.string = "1000";
                event = "1000";
            }
            this.edtBet.string = "" + parseInt(event);
        } else {
            this.edtBet.string = "1000";
            event = "1000";
        }
        let delta = parseInt(event);
        if (this.numRequired == 1) {
            this.labelTotalBet.string = "" + (this.currentBetValue * delta * this.currentNumPicked.length);
        } else {
            this.labelTotalBet.string = "" + (this.currentBetValue * delta);
        }
        this.labelWinValue.string = "" + (this.currentWinValue * delta);
    }

    // Request
    requestPlay(num, betOneTurn) {
        console.log("Loto requestPlay number : ", num);
        console.log("Loto requestPlay betOneTurn : ", betOneTurn);
        ShootFishNetworkClient.getInstance().request("LOTO1", {
            "appId": "xxeng",
            "userId": Configs.Login.UserIdFish,
            "number": num,  // số người chơi chọn, có thể là số hoặc mảng số, tùy mode
            "session": this.sessionDate,
            "mode": this.GAME_MODE,
            "channel": this.GAME_CHANNEL,
            "pay": betOneTurn
        }, (res) => {
            console.log("LOTO1 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }

            this.numRequest += 1;
            console.log("LOTO1 numRequest : ", this.numRequest);
            if (this.numRequest == this.numRequestCompleted) {
                this.showPopupNotify("Đặt thành công !");
                FacebookTracking.betLotoSuccess(betOneTurn * this.numRequest);
                // Bet Success -> Can reset
                this.numRequest = 0;
                this.numRequestCompleted = 0;
                this.actionCancelBet();
                App.instance.showLoading(false);
            }

            // Tru tien
            console.log("Loto Bet Success cost : ", res["cost"]);

            Configs.Login.CoinFish = res["cash"];
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

            // do something
        }, this);
    }

    requestGetPayWinRate() {
        console.log("Loto requestGetPayWinRate GAME_MODE : ", this.GAME_MODE);
        console.log("Loto requestGetPayWinRate GAME_CHANNEL : ", this.GAME_CHANNEL);
        if (this.GAME_CHANNEL == -1) {
            // Chua chon Channel
            console.log("Loto requestGetPayWinRate Chua chon Channel");
            this.currentNumPicked = [];
            this.resetContentNumberPicked();
            this.currentBetValue = 0;
            this.currentWinValue = 0;
            this.edtBet.string = "1000";
            this.labelTotalBet.string = "0";
            this.labelWinValue.string = "0";
            return;
        }
        ShootFishNetworkClient.getInstance().request("LOTO2", {
            "mode": this.GAME_MODE,
            "channel": this.GAME_CHANNEL
        }, (res) => {
            console.log("LOTO2 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something
            this.currentNumPicked = [];
            this.resetContentNumberPicked();

            this.currentBetValue = res["payRate"];
            this.currentWinValue = res["winRate"];
            console.log("LOTO2 this.currentBetValue : ", this.currentBetValue);
            this.edtBet.string = "1000";
            this.labelTotalBet.string = "0";
            this.labelWinValue.string = res["winRate"] + "000";
        }, this);
    }

    // Lay theo Session
    requestGetCalculateResult() {
        ShootFishNetworkClient.getInstance().request("LOTO3", {
            "session": this.sessionDate,
        }, (res) => {
            console.log("LOTO3 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something
        }, this);
    }

    // Lay tat ca
    requestGetPlayerRequest() {
        this.popupHistory.show();
    }

    requestGetLotoResult(sessionId, channelId) {
        console.log("Loto requestGetLotoResult sessionId : ", sessionId);
        console.log("Loto requestGetLotoResult channelId : ", channelId);
        ShootFishNetworkClient.getInstance().request("LOTO5", {
            "session": sessionId,
            "channel": channelId
        }, (res) => {
            console.log("LOTO5 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }

            for (let index = 0; index < 9; index++) {
                this.labelTabResult[index].string = "......";
            }

            let resData = res["data"];

            if (resData["channel"] == 0 || resData["session"] == 0) {
                // Chua co ket qua
                if (this.isOnTabResult) {
                    if (this.countBackOnTabResult < 2) {
                        this.countBackOnTabResult += 1;
                        this.getDataOnTabResult(channelId);
                    }
                }
            } else {
                let deltaSpaces = "       ";

                let row_0 = JSON.parse(resData.resultSp);
                let row_1 = JSON.parse(resData.result1);
                let row_2 = JSON.parse(resData.result2);
                let row_3 = JSON.parse(resData.result3);
                let row_4 = JSON.parse(resData.result4);
                let row_5 = JSON.parse(resData.result5);
                let row_6 = JSON.parse(resData.result6);
                let row_7 = JSON.parse(resData.result7);

                if (channelId == cmd.Code.LOTO_CHANNEL_BAC) {
                    this.bgTabResult1.active = true;
                    this.bgTabResult2.active = false;

                    this.labelTabResult[3].node.parent.height = 80;
                    this.labelTabResult[4].node.parent.height = 40;
                    this.labelTabResult[5].node.parent.height = 80;

                    this.labelTabResult[0].string = row_0[0]; // DB         
                    this.labelTabResult[1].string = row_1[0]; // 1st              
                    this.labelTabResult[2].string = row_2[0] + deltaSpaces + row_2[1];
                    this.labelTabResult[3].string = row_3[0] + deltaSpaces + "     " + row_3[1] + deltaSpaces + "    " + row_3[2] + "\n" + row_3[3] + deltaSpaces + "     " + row_3[4] + deltaSpaces + "    " + row_3[5];
                    this.labelTabResult[4].string = row_4[0] + deltaSpaces + row_4[1] + deltaSpaces + row_4[2] + deltaSpaces + row_4[3];
                    this.labelTabResult[5].string = row_5[0] + deltaSpaces + "     " + row_5[1] + deltaSpaces + "     " + row_5[2] + "\n" + row_5[3] + deltaSpaces + "     " + row_5[4] + deltaSpaces + "     " + row_5[5];
                    this.labelTabResult[6].string = row_6[0] + deltaSpaces + "       " + row_6[1] + deltaSpaces + "       " + row_6[2];
                    this.labelTabResult[7].string = row_7[0] + deltaSpaces + "    " + row_7[1] + deltaSpaces + row_7[2] + deltaSpaces + "    " + row_7[3];
                } else {
                    this.bgTabResult1.active = false;
                    this.bgTabResult2.active = true;

                    this.labelTabResult[3].node.parent.height = 40;
                    this.labelTabResult[4].node.parent.height = 80;
                    this.labelTabResult[5].node.parent.height = 40;

                    this.labelTabResult[0].string = row_0[0]; // DB         
                    this.labelTabResult[1].string = row_1[0]; // 1st              
                    this.labelTabResult[2].string = row_2[0];
                    this.labelTabResult[3].string = row_3[0] + deltaSpaces + deltaSpaces + row_3[1];
                    this.labelTabResult[4].string = row_4[4] + deltaSpaces + "    " + row_4[5] + deltaSpaces + " " + row_4[6] + "\n" + row_4[0] + "     " + row_4[1] + "    " + row_4[2] + deltaSpaces + row_4[3];
                    this.labelTabResult[5].string = row_5[0];
                    this.labelTabResult[6].string = row_6[0] + deltaSpaces + "      " + row_6[1] + deltaSpaces + "    " + row_6[2];
                    this.labelTabResult[7].string = row_7[0];
                }

                if (!resData.hasOwnProperty('result8')) {
                    // k co giai 8
                    this.labelTabResult[8].string = "";
                } else {
                    let row_8 = JSON.parse(resData.result8);
                    // Tab Result
                    if (channelId == cmd.Code.LOTO_CHANNEL_BAC) {
                        this.labelTabResult[8].string = row_8[0] + deltaSpaces + row_8[1] + deltaSpaces + row_8[2] + deltaSpaces + row_8[3];
                    } else {
                        this.labelTabResult[8].string = row_8[0];
                    }
                }
            }
        }, this);
    }

    requestGetHelp() {
        ShootFishNetworkClient.getInstance().request("LOTO6", null, (res) => {
            console.log("LOTO6 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }

            // do something
            console.log("LOTO6 : ", res['data']);
            this.helpCenter = res["data"];
            this.changeGameGuide();
        }, this);
    }

    requestChat(msg) {
        console.log("Loto requestChat msg : ", msg);
        ShootFishNetworkClient.getInstance().request("LOTO7", {
            "msg": msg,
        }, (res) => {
            console.log("LOTO7 : ", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something
        }, this);
    }

    requestGetChatHistory() {
        ShootFishNetworkClient.getInstance().request("LOTO8", null, (res) => {
            console.log("LOTO8 :", res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something
            this.contentChat.removeAllChildren(true);
            let arrChat = res["data"];
            for (let index = 0; index < arrChat.length; index++) {
                let item = cc.instantiate(this.prefabItemChat);
                item.getComponent('Loto.ItemChat').initItem({
                    nickname: arrChat[index].nickname,
                    msg: arrChat[index].msg,
                });
                this.contentChat.addChild(item);
            }
            this.scrollChat.scrollToBottom(0.2);
        }, this);
    }

    requestGetGameAvailable() {
        console.log("Start RequestGames");

        ShootFishNetworkClient.getInstance().request("LOTO9", null, (res) => {
            console.log("LOTO9 :");
            console.log(res);

            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }
            // do something
            App.instance.showLoading(false);
            // Neu mode va channel la [] nghia la cho choi Full game

            this.gamesAvailable = res["data"];
            console.log("gamesAvailable : " + JSON.stringify(this.gamesAvailable));

            // Init Game
            this.chooseLocation(this.listLocation[0]);

            this.listLocation[0].isChecked = true;
            this.GAME_LOCATION = cmd.Code.LOTO_LOCATION.MienBac;

            this.requestGetHelp();
            this.requestGetPayWinRate();
        }, this);
    }

    // lay danh sach bet cua cac nguoi cho khac cho tab new bet
    requestGetNewBetHistory() {
        ShootFishNetworkClient.getInstance().request("LOTO10", null, (res) => {
            console.log("LOTO10 :");
            console.log(res);
            if (res["code"] != 200) {
                App.instance.alertDialog.showMsg("Lỗi " + res["code"] + ", không xác định.");
                return;
            }

            let dataSet = [];

            let arrBet = res["data"];
            for (let index = 0; index < arrBet.length; index++) {
                let push = arrBet[index];

                let data = {
                    nickname: push["nickname"],
                    channel: push["channel"],
                    mode: push["mode"],
                    bet: push["cost"],
                    nums: push["number"]
                };

                dataSet.push(data);
            }

            this.listViewNewBet.adapter.setDataSet(dataSet, LotoController.PREFAB_ITEM_NEW_BET);
            this.listViewNewBet.clearState();
            this.listViewNewBet.notifyUpdate();

            this.newBetDataSet = dataSet;
        }, this);
    }

    actBack() {
        if (this.listViewNumber.adapter) {
            this.listViewNumber.adapter.setDataSet([], LotoController.PREFAB_NUMBER_SELECTOR);
        }

        cc.audioEngine.stopAll();
        App.instance.loadScene("Lobby");
    }

    getLocationByChannelId(channelID: number): number {
        if (cmd.Code.LOTO_CHANNEL_BAC.indexOf(channelID) != -1) {
            return cmd.Code.LOTO_LOCATION.MienBac;
        }

        if (cmd.Code.LOTO_CHANNEL_TRUNG.indexOf(channelID) != -1) {
            return cmd.Code.LOTO_LOCATION.MienTrung;
        }

        if (cmd.Code.LOTO_CHANNEL_NAM.indexOf(channelID) != -1) {
            return cmd.Code.LOTO_LOCATION.MienNam;
        }

        return -1;
    }

    actShowBetStoreTabBetting() {
        if (this.GAME_CHANNEL == LotoController.GAME_CHANNEL_NONE) {
            this.showPopupNotify("Bạn cần chọn đài trước");
            return;
        }

        this.betStoreGameName.string = cmd.Code.LOTO_GAME_MODE_NAME[this.GAME_MODE];

        // this.betStoreTabMode.active = false;
        this.betStoreTabBetting.active = true;
        this.betStoreTabBetting.scaleX = 0;
        this.betStoreTabBetting.runAction(cc.sequence(cc.scaleTo(0.25, 1, 1), cc.callFunc(() => {
        })));
    }

    actHideBetStoreTabBetting() {
        this.betStoreTabBetting.active = false;
        this.betStoreTabMode.active = true;
    }

    actShowGuide() {
        this.bgGameGuide.active = true;
        this.bgGameGuide.scaleY = 0;
        this.bgGameGuide.runAction(cc.scaleTo(0.25, 1, 1));
    }

    actHideGuide() {
        this.bgGameGuide.scaleY = 1;
        this.bgGameGuide.runAction(cc.sequence(cc.scaleTo(0.25, 1, 0), cc.callFunc(() => {
            this.bgGameGuide.active = false;
        })));
    }

    actShowNumberSelector() {
        if (this.GAME_CHANNEL == LotoController.GAME_CHANNEL_NONE) {
            let msg = "Vui lòng chọn Đài trước !";
            this.showPopupNotify(msg);
            return;
        }

        this.numberSelector.active = true;
        if (this.listViewNumber.adapter.dataSet.length == 0) {
            this.resetNumberSelectorListView();
        } else {
            this.listViewNumber.clearState();
            this.listViewNumber.notifyUpdate();
        }
    }

    actCancelNumberSelector() {
        this.numberSelector.active = false;
        this.listRecentNumberPicks = [];
    }

    actChooseNumberSelector() {
        let copyCurrentNumPicked = [...this.currentNumPicked];
        for (let i = 0; i < this.listRecentNumberPicks.length; i++) {
            let num = this.listRecentNumberPicks[i].number;
            let isChecked = this.listRecentNumberPicks[i].isChecked;

            let index = copyCurrentNumPicked.indexOf(num);
            if (index != -1 && !isChecked) {
                copyCurrentNumPicked.splice(index, 1);
            }
            if (index == -1 && isChecked) {
                copyCurrentNumPicked.push(num);
            }
        }

        if (this.numRequired > 1) {
            if (copyCurrentNumPicked.length != this.numRequired) {
                let msg_3 = "Bạn phải chọn đúng " + this.numRequired + " số !";
                this.showPopupNotify(msg_3);
                return;
            }
        }

        this.numbersPicked.string = "";
        this.currentNumPicked = copyCurrentNumPicked;
        for (let i = 0; i < this.currentNumPicked.length; i++) {
            this.numbersPicked.string = (this.numbersPicked.string == "") ? this.currentNumPicked[i] : (this.numbersPicked.string + ", " + this.currentNumPicked[i]);
        }

        if (this.numRequired == 1) {
            this.labelTotalBet.string = "" + (this.currentBetValue * parseInt(this.edtBet.string) * this.currentNumPicked.length);
        } else {
            this.labelTotalBet.string = "" + (this.currentBetValue * parseInt(this.edtBet.string));
        }
        this.labelWinValue.string = "" + (this.currentWinValue * parseInt(this.edtBet.string));

        this.numberSelector.active = false;
        for (let i = 0; i < this.listRecentNumberPicks.length; i++) {
            this.listRecentNumberPicks[i].data.isChecked = this.listRecentNumberPicks[i].isChecked;
        }
        this.listRecentNumberPicks = [];
    }

    updateRecentNumberPick(number: number, isChecked: boolean, data: any) {
        let index = this.listRecentNumberPicks.findIndex(n => n.number == number);
        if (index != -1) {
            this.listRecentNumberPicks[index].isChecked = isChecked;
        } else {
            this.listRecentNumberPicks.push({
                number: number,
                isChecked: isChecked,
                data: data
            });
        }
    }

    resetNumberSelectorListView() {
        let numCount = -1;
        switch (this.GAME_MODE) {
            // 1 chu so
            case 6:
            case 7:
                numCount = 10;
                break;
            // 2 chu so
            case 1:
            case 3:
            case 4:
            case 5:
            case 8:
            case 9:
            case 10:
            case 15:
            case 16:
            case 17:
            case 21:
            case 22:
            case 23:
                numCount = 100;
                break;
            // 3 chu so
            case 2:
            case 11:
            case 12:
            case 13:
            case 14:
            case 18:
            case 19:
            case 20:
                numCount = 1000;
                break;
            default:
                break;
        }

        console.log("Loto chooseMode numCount : ", numCount);

        this.updateNumSelector(numCount);
    }
}
