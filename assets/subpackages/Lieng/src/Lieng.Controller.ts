import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import Utils from "../../../scripts/common/Utils";

import App from "../../../scripts/common/App";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmdNetwork from "../../../scripts/networks/Network.Cmd";
import Configs from "../../../scripts/common/Configs";
import cmd from "./Lieng.Cmd";

import LiengNetworkClient from "./Lieng.NetworkClient";
import CardUtils from "./Lieng.CardUtil"
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";
import PopupInvite from "../../../CardGames/src/invite/CardGame.PopupInvite";
import PopupAcceptInvite from "../../../CardGames/src/invite/CardGame.PopupAcceptInvite";
import FacebookTracking from "../../../scripts/common/FacebookTracking";

var configPlayer = [  // 9 Players
    // {
    //     seatId: 0,
    //     playerId: -1,
    //     playerPos: -1,
    //     isViewer: true
    // }
];

// defaultPlayerPos[0 -> 8][0] = player_pos of me
let defaultPlayerPos = [ // 9 players
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 0],
    [2, 3, 4, 5, 6, 7, 8, 0, 1],
    [3, 4, 5, 6, 7, 8, 0, 1, 2],
    [4, 5, 6, 7, 8, 0, 1, 2, 3],
    [5, 6, 7, 8, 0, 1, 2, 3, 4],
    [6, 7, 8, 0, 1, 2, 3, 4, 5],
    [7, 8, 0, 1, 2, 3, 4, 5, 6],
    [8, 0, 1, 2, 3, 4, 5, 6, 7],
]

const { ccclass, property } = cc._decorator;

@ccclass
export default class LiengController extends cc.Component {

    public static instance: LiengController = null;

    // UI Rooms
    @property(cc.Node)
    UI_ChooseRoom: cc.Node = null;
    @property(cc.Label)
    labelNickName: cc.Label = null;
    @property(cc.Label)
    labelCoin: cc.Label = null;
    @property(cc.Sprite)
    sprAvatar: cc.Sprite = null;
    @property(cc.Node)
    contentListRooms: cc.Node = null;
    @property(cc.Prefab)
    prefabItemRoom: cc.Prefab = null;
    @property(cc.ScrollView)
    scrollListRoom: cc.ScrollView = null;
    @property(cc.EditBox)
    edtFindRoom: cc.EditBox = null;
    @property(cc.Toggle)
    btnHideRoomFull: cc.Toggle = null;

    public isInitedUIRoom = false;

    // UI Playing
    @property(cc.Node)
    UI_Playing: cc.Node = null;
    @property(cc.Node)
    meCards: cc.Node = null;
    @property(cc.Node)
    groupPlayers: cc.Node = null;
    @property(cc.SpriteFrame)
    spriteCards: cc.SpriteFrame[] = [];
    @property(cc.SpriteFrame)
    spriteCardBack: cc.SpriteFrame = null;
    @property(cc.Node)
    matchPot: cc.Node = null;
    @property(cc.Label)
    labelMatchPot: cc.Label = null;
    @property(cc.Node)
    cardsDeal: cc.Node = null;
    @property(cc.Node)
    cardsCenter: cc.Node = null;
    @property(cc.Node)
    btnBet: cc.Node = null;
    @property(cc.Node)
    btnOpenCard: cc.Node = null;
    @property(cc.Button)
    btnLeaveRoom: cc.Button = null;
    @property(cc.Node)
    hubChips: cc.Node = null;
    @property(cc.Label)
    labelRoomId: cc.Label = null;
    @property(cc.Label)
    labelRoomBet: cc.Label = null;
    @property(cc.Node)
    actionBetting: cc.Node = null;
    @property(cc.Node)
    betChooseValue: cc.Node = null;
    @property(cc.Node)
    betChooseValueTarget: cc.Node = null;
    @property(sp.Skeleton)
    FxDealer: sp.Skeleton = null;
    @property(cc.Node)
    btnActions: cc.Node = null;
    @property(cc.Node)
    btnLatBai: cc.Node = null;

    @property(cc.Node)
    popupBuyIn: cc.Node = null;
    @property(cc.Label)
    labelBuyInMin: cc.Label = null;
    @property(cc.Label)
    labelBuyInMax: cc.Label = null;
    @property(cc.EditBox)
    edtBuyIn: cc.EditBox = null;
    @property(cc.Toggle)
    toggleAutoBuyIn: cc.Toggle = null;

    @property(cc.Node)
    FxMeCardName: cc.Node = null;
    @property([cc.SpriteFrame])
    spriteCardNames: cc.SpriteFrame[] = [];

    // Notify
    @property(cc.Node)
    notifyTimeStart: cc.Node = null;
    @property(cc.Node)
    notifyTimeEnd: cc.Node = null;
    @property(cc.Node)
    notifyTimeBet: cc.Node = null;

    // UI Chat
    @property(cc.Node)
    UI_Chat: cc.Node = null;
    @property(cc.EditBox)
    edtChatInput: cc.EditBox = null;

    @property(cc.Node)
    popupGuide: cc.Node = null;
    @property(cc.Node)
    popupLatBai: cc.Node = null;
    @property(cc.Node)
    latBaiSelector: cc.Node = null;

    @property(cc.Node)
    popups: cc.Node = null;

    // Popup
    @property(cc.Node)
    toast: cc.Node = null;
    @property(cc.Label)
    labelToast: cc.Label = null;

    @property(cc.Button)
    btnRefresh: cc.Button = null;

    @property(cc.Node)
    panelBack: cc.Node = null;
    private seatOwner = null;
    private currentRoomBet = null;

    private gameState = null;

    private minutes = null;
    private seconds = null;


    private timeAutoStart = null;
    private timeEnd = null;
    private timeBet = null;
    private timeThinking = null;
    private intervalWaitting = null;
    private intervalEnd = null;
    private intervalBetting = null;
    private intervalThinking = null;

    private currentCard = null;
    private numCardOpened = 0;

    // bet
    private arrBetValue = [];
    private arrBetPos = [-140, -70, 0, 70, 140];
    private currentBetSelectedIndex = 0;

    private currentMatchPotValue = 0;
    private timeoutChiaBaiDone = null;

    private minCashIn = null;
    private maxCashIn = null;

    private currentMaxBet = 0;
    private currentRaiseMin = 0;
    private currentRaiseValue = 0;
    private currentRaiseStep = 0;
    private currentMeBet = 0;
    private lastMeBet = 0;

    private currentPrivateCardList = [];

    private roomMinBuyIn = 0;
    private roomMaxBuyIn = 0;

    private isFolded = false;

    private arrBaiLat = [];

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        LiengController.instance = this;

        this.seatOwner = -1;

        this.initConfigPlayer();
    }

    start() {
        this.showUIRooms();

        App.instance.showErrLoading("Đang kết nối tới server...");
        LiengNetworkClient.getInstance().addOnOpen(() => {
            App.instance.showErrLoading("Đang đăng nhập...");
            LiengNetworkClient.getInstance().send(new cmdNetwork.SendLogin(Configs.Login.Nickname, Configs.Login.AccessToken));
        }, this);
        LiengNetworkClient.getInstance().addOnClose(() => {
            App.instance.loadScene("Lobby");
        }, this);
        LiengNetworkClient.getInstance().connect();
    }

    // Request UI Room
    joinRoom(info) {
        cc.log("Lieng joinRoom roomInfo : ", info);
        App.instance.showLoading(true);
        LiengNetworkClient.getInstance().send(new cmd.SendJoinRoomById(info["id"]));
    }

    refeshListRoom() {
        LiengNetworkClient.getInstance().send(new cmd.SendGetListRoom());
        this.btnRefresh.interactable = false;
    }

    findRoomId() {
        cc.log("Lieng findRoomId id : ", this.edtFindRoom.string);
        let text = this.edtFindRoom.string.trim();
        if (text.length > 0) {
            let idFind = parseInt(text);
            for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
                let roomItem = this.contentListRooms.children[index].getComponent("Lieng.ItemRoom");
                if (roomItem.roomInfo["id"] != idFind) {
                    this.contentListRooms.children[index].active = false;
                }
            }
        } else {
            for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
                this.contentListRooms.children[index].active = true;
            }
        }
    }

    hideRoomFull() {
        if (this.btnHideRoomFull.isChecked) {
            for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
                let roomItem = this.contentListRooms.children[index].getComponent("Lieng.ItemRoom");
                if (roomItem.roomInfo["userCount"] == roomItem.roomInfo["maxUserPerRoom"]) {
                    this.contentListRooms.children[index].active = false;
                }
            }
        } else {
            for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
                this.contentListRooms.children[index].active = true;
            }
        }
    }

    showUIRooms() {
        this.UI_ChooseRoom.active = true;
        if (this.isInitedUIRoom) {
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        } else {
            this.isInitedUIRoom = true;
            this.labelNickName.string = Configs.Login.Nickname;
            this.sprAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
            this.sprAvatar.node.setContentSize(Configs.App.AVATAR_SIZE_SMALL);
            BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
                this.labelCoin.string = Utils.formatNumber(Configs.Login.Coin);
            }, this);
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);

            this.setupListener();
        }
    }

    closeUIRoom() {
        this.UI_ChooseRoom.active = false;
    }

    createRoom() {
        cc.log("Lieng createRoom");
    }

    playingNow() {
        cc.log("Lieng playingNow");
        let arrRoomOkMoney = [];
        for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
            let roomItem = this.contentListRooms.children[index].getComponent("Lieng.ItemRoom");
            if (roomItem.roomInfo["requiredMoney"] < Configs.Login.Coin) {
                arrRoomOkMoney.push(index);
            }
        }

        cc.log("Lieng playingNow arrRoomOkMoney : ", arrRoomOkMoney);

        if (arrRoomOkMoney.length > 0) {
            let roomCrowed = arrRoomOkMoney[0];
            cc.log("Lieng playingNow roomCrowed start : ", roomCrowed);
            for (let index = 0; index < arrRoomOkMoney.length; index++) {
                let roomItem = this.contentListRooms.children[arrRoomOkMoney[index]].getComponent("Lieng.ItemRoom");
                let roomItemCrowed = this.contentListRooms.children[roomCrowed].getComponent("Lieng.ItemRoom");
                cc.log("Lieng playingNow ------------------------------------------");
                cc.log("Lieng playingNow roomItem : ", roomItem.roomInfo["userCount"]);
                cc.log("Lieng playingNow roomItemCrowed : ", roomItemCrowed.roomInfo["userCount"]);
                if (roomItem.roomInfo["userCount"] > roomItemCrowed.roomInfo["userCount"]) {
                    roomCrowed = arrRoomOkMoney[index];
                    cc.log("Lieng playingNow roomCrowed update : ", roomCrowed);
                }
            }
            cc.log("Lieng playingNow roomCrowed end : ", roomCrowed);
            let roomChoosed = this.contentListRooms.children[roomCrowed].getComponent("Lieng.ItemRoom");
            cc.log("Lieng playingNow roomCrowed end roomInfo : ", roomChoosed.roomInfo);
            this.joinRoom(roomChoosed.roomInfo);
        } else {
            App.instance.alertDialog.showMsg("Không đủ tiền tham gia\nbất kỳ phòng nào !");
        }
    }

    // Chat
    showUIChat() {
        this.UI_Chat.active = true;
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2, this.UI_Chat.y)
        );
    }

    closeUIChat() {
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width/2 + this.UI_Chat.width + 150, this.UI_Chat.y)
        );
    }

    chatEmotion(event, id) {
        cc.log("Lieng chatEmotion id : ", id);
        LiengNetworkClient.getInstance().send(new cmd.SendChatRoom(1, id));
        this.closeUIChat();
    }

    chatMsg() {
        if (this.edtChatInput.string.trim().length > 0) {
            LiengNetworkClient.getInstance().send(new cmd.SendChatRoom(0, this.edtChatInput.string));
            this.edtChatInput.string = "";
            this.closeUIChat();
        }
    }

    showPopupGuide() {
        this.popupGuide.active = true;
    }

    closePopupGuide() {
        this.popupGuide.active = false;
    }

    backToLobby() {
        LiengNetworkClient.getInstance().close();
        App.instance.loadScene("Lobby");
    }

    // Playing
    showUIPlaying() {
        this.UI_Playing.active = true;
        this.panelBack.active = false;
        this.FxDealer.setAnimation(0, "cho", true);
    }

    closeUIPlaying() {
        this.actionLeaveRoom();
    }

    showPopupLatBai() {
        this.popupLatBai.active = true;
        this.arrBaiLat = [];
        for (let index = 0; index < 3; index++) {
            let spriteCardId = CardUtils.getNormalId(this.currentCard[index]);
            this.latBaiSelector.children[index].getComponent(cc.Sprite).spriteFrame = this.spriteCards[spriteCardId];
            this.latBaiSelector.children[index].y = 0;
            this.latBaiSelector.children[index].color = cc.Color.GRAY;
        }
    }

    closePopupLatBai() {
        this.popupLatBai.active = false;
    }

    selectBaiLat(event, id) {
        let isSelected = true;

        let idOpen = parseInt(id) - 1;
        let isExist = this.arrBaiLat.indexOf(idOpen);
        if (isExist > -1) {
            let arrTemp = [...this.arrBaiLat];  // Copy
            this.arrBaiLat = [];
            for (let index = 0; index < arrTemp.length; index++) {
                if (arrTemp[index] != idOpen) {
                    this.arrBaiLat.push(arrTemp[index]);
                }
            }
        } else {
            if (this.arrBaiLat.length > 1) {
                this.latBaiSelector.children[this.arrBaiLat[0]].y = 0;
                this.latBaiSelector.children[this.arrBaiLat[0]].color = cc.Color.GRAY;
                this.arrBaiLat[0] = idOpen; // thay the la bai chon dau tien
            } else {
                this.arrBaiLat.push(idOpen);
            }
            isSelected = false;
        }

        this.latBaiSelector.children[idOpen].y = isSelected ? 0 : 40;
        this.latBaiSelector.children[idOpen].color = isSelected ? cc.Color.GRAY : cc.Color.WHITE;
    }

    setupMatch(data: cmd.ReceivedJoinRoomSucceed) {
        this.showUIPlaying();
        this.closeUIChat();
        cc.log("Lieng setupMatch data : ", data);

        // {
        //     "myChair": 0,
        //     "moneyBet": 128000,
        //     "roomOwner": 0,
        //     "roomId": 23808,
        //     "gameId": 100609,
        //     "moneyType": 0,
        //     "rule": 0,
        //     "playerSize": 0,
        //     "playerStatus": [],
        //     "playerInfos": [],
        //     "handCardSizeSize": 0,
        //     "handCardSizeList": [],
        //     "minBuyInTiLe": 0,
        //     "maxBuyInTiLe": 0
        //   }

        let myChair = data["myChair"];
        let moneyBet = data["moneyBet"];
        let roomOwner = data["roomOwner"];
        let roomId = data["roomId"];
        let gameId = data["gameId"];
        let moneyType = data["moneyType"];
        let rule = data["rule"];
        let playerSize = data["playerSize"];
        let playerStatus = data["playerStatus"];
        let playerInfos = data["playerInfos"];
        let handCardSizeSize = data["handCardSizeSize"];
        let handCardSizeList = data["handCardSizeList"];
        let minBuyInTiLe = data["minBuyInTiLe"];
        let maxBuyInTiLe = data["maxBuyInTiLe"]

        cc.log("Lieng setupMatch myChair  : ", myChair);
        cc.log("Lieng setupMatch moneyBet  : ", moneyBet);
        cc.log("Lieng setupMatch roomOwner  : ", roomOwner);
        cc.log("Lieng setupMatch roomId  : ", roomId);
        cc.log("Lieng setupMatch gameId  : ", gameId);
        cc.log("Lieng setupMatch moneyType  : ", moneyType);
        cc.log("Lieng setupMatch rule  : ", rule);
        cc.log("Lieng setupMatch playerSize  : ", playerSize);
        cc.log("Lieng setupMatch playerStatus  : ", playerStatus);
        cc.log("Lieng setupMatch playerInfos  : ", playerInfos);
        cc.log("Lieng setupMatch handCardSizeSize  : ", handCardSizeSize);
        cc.log("Lieng setupMatch handCardSizeList  : ", handCardSizeList);
        cc.log("Lieng setupMatch minBuyInTiLe  : ", minBuyInTiLe);
        cc.log("Lieng setupMatch maxBuyInTiLe  : ", maxBuyInTiLe);

        // Kiem tra, chon 1 thoi
        this.gameState = cmd.Code.STATE_JOIN_ROOM;

        this.roomMinBuyIn = minBuyInTiLe;
        this.roomMaxBuyIn = maxBuyInTiLe;

        this.labelRoomId.string = "PHÒNG: " + roomId;
        this.labelRoomBet.string = Utils.formatNumber(moneyBet) + "/" + Utils.formatNumber(2 * moneyBet) + "$";
        this.currentRoomBet = moneyBet;

        configPlayer[0].playerId = Configs.Login.Nickname;
        configPlayer[0].playerPos = myChair;
        cc.log("Lieng setupMatch configPlayer Me : ", configPlayer[0]);
        cc.log("Lieng setupMatch configPlayer  : ", configPlayer);

        var numPlayers = 0;
        var arrPlayerPosExist = [];
        var arrPlayerInfo = [];
        var arrPlayerStatus = [];

        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            if (playerInfos[index].nickName !== "") {
                numPlayers += 1;
                arrPlayerPosExist.push(index);
                arrPlayerInfo.push(playerInfos[index]);
                arrPlayerStatus.push(playerStatus[index]);
            }
        }
        cc.log("Lieng setupMatch numPlayers : ", numPlayers);
        cc.log("Lieng setupMatch arrPlayerStatus : ", arrPlayerStatus);
        cc.log("Lieng setupMatch arrPlayerInfo : ", arrPlayerInfo);
        cc.log("Lieng setupMatch arrPlayerPosExist : ", arrPlayerPosExist);

        this.resetHubChips();
        this.FxMeCardName.active = false;
        this.FxDealer.setAnimation(0, "cho", true);

        // setup configPlayer
        for (let a = 0; a < configPlayer.length; a++) {
            configPlayer[a].playerPos = defaultPlayerPos[myChair][a];
        }

        // set State of Seat : Yes | No exist Player
        for (let index = 0; index < configPlayer.length; index++) {
            let findPos = arrPlayerPosExist.indexOf(configPlayer[index].playerPos);

            var seatId = configPlayer[index].seatId;
            this.getPlayerHouse(seatId).resetPlayerInfo();
            if (findPos > -1) {
                // Exist player -> Set Player Info
                if (seatId == 0 && arrPlayerStatus[findPos] == cmd.Code.PLAYER_STATUS_SITTING) {
                    this.showPopupBuyIn(minBuyInTiLe, maxBuyInTiLe, moneyBet);
                }

                if (arrPlayerStatus[findPos] == cmd.Code.PLAYER_STATUS_SITTING || arrPlayerStatus[findPos] == cmd.Code.PLAYER_STATUS_PLAYING) {
                    configPlayer[index].isViewer = false;
                    this.getPlayerHouse(seatId).setIsViewer(false);
                } else {
                    configPlayer[index].isViewer = true;
                    this.getPlayerHouse(seatId).setIsViewer(true);
                    if (configPlayer[seatId].playerId != -1) {
                        this.getPlayerHouse(seatId).playFxViewer();
                    }
                }
                this.setupSeatPlayer(seatId, arrPlayerInfo[findPos]);
            } else {
                // Not Exist player  -> Active Btn Add player
                this.getPlayerHouse(seatId).showBtnInvite(true);
                configPlayer[index].isViewer = true;
            }
        }

        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            this.getPlayerHouse(index).setOwner(false);
        }
        let seatOwner = this.findPlayerSeatByPos(roomOwner);
        if (seatOwner !== -1) {
            this.getPlayerHouse(seatOwner).setOwner(true);
            this.seatOwner = seatOwner;
        }

        cc.log("Lieng setupMatch configPlayer : ", configPlayer);
    }


    // Time Start
    startThinkingCountDown(seatId, turnTime) {
        this.timeThinking = turnTime;
        this.unschedule(this.intervalThinking);
        this.schedule(this.intervalThinking = () => {
            this.timeThinking--;
            var rate = (this.timeThinking / turnTime).toFixed(2);
            this.getPlayerHouse(seatId).processThinking(rate);
            if (this.timeThinking < 1) {
                this.unschedule(this.intervalThinking);
                this.getPlayerHouse(seatId).hidePlayCountdown();
            }
        }, 1)
    }

    startWaittingCountDown(timeWait) {
        this.timeAutoStart = timeWait;
        this.setTimeWaittingCountDown();
        this.notifyTimeStart.active = true;
        this.unschedule(this.intervalWaitting);
        this.schedule(this.intervalWaitting = () => {
            this.timeAutoStart--;
            this.setTimeWaittingCountDown();
            if (this.timeAutoStart < 1) {
                this.unschedule(this.intervalWaitting);
                this.notifyTimeStart.active = false;
            }
        }, 1)
    }

    setTimeWaittingCountDown() {
        this.seconds = Math.floor(this.timeAutoStart % 60);
        this.notifyTimeStart.children[0].getComponent(cc.Label).string = " Bắt đầu sau : " + this.seconds + "s ";
    }

    // Time End
    startEndCountDown(timeWait) {
        this.timeEnd = timeWait;
        this.setTimeEndCountDown();
        this.notifyTimeEnd.active = true;
        this.unschedule(this.intervalEnd);
        this.schedule(this.intervalEnd = () => {
            this.timeEnd--;
            this.setTimeEndCountDown();
            if (this.timeEnd < 1) {
                this.unschedule(this.intervalEnd);
                this.notifyTimeEnd.active = false;
            }
        }, 1)
    }

    setTimeEndCountDown() {
        this.seconds = Math.floor(this.timeEnd % 60);
        this.notifyTimeEnd.children[0].getComponent(cc.Label).string = " Kết thúc sau : " + this.seconds + "s ";
    }

    // Time Bet
    startBettingCountDown(turnTime) {
        cc.log("Lieng startBettingCountDown turnTime : ", turnTime);
        this.timeBet = turnTime;
        this.actionBetting.active = true;
        this.processBetting(1);
        this.unschedule(this.intervalBetting);
        this.schedule(this.intervalBetting = () => {
            this.timeBet--;
            var rate = (this.timeBet / turnTime).toFixed(1);
            this.processBetting(rate);
            if (this.timeBet < 1) {
                this.unschedule(this.intervalBetting);
                this.actionBetting.active = false;
            }
        }, 1);
    }

    processBetting(rate) {
        cc.log("Lieng processBetting rate : ", rate);
        cc.log("Lieng processBetting fillRange : ", this.actionBetting.children[1].getComponent(cc.Sprite).fillRange);
        this.actionBetting.children[1].getComponent(cc.Sprite).fillRange = rate;
    }

    // Open Me Card
    openMeCard(event, itemId) {
        // Open Me cards
        let cardPos = parseInt(itemId);
        cc.log("Lieng openMeCard cardPos : ", cardPos);
        cc.log("Lieng openMeCard currentCard : ", this.currentCard);

        this.getPlayerHouse(0).prepareCardReal(cardPos);
        let spriteCardId = CardUtils.getNormalId(this.currentCard[cardPos]);
        this.getPlayerHouse(0).transformToCardReal(cardPos, this.spriteCards[spriteCardId]);

        this.numCardOpened += 1;
        if (this.numCardOpened == 3) {
            this.btnOpenCard.active = true;
            this.btnBet.active = false;
            this.FxDealer.setAnimation(0, "cho", true);

            let score = 0;
            for (let a = 0; a < 3; a++) {
                score += CardUtils.getDiemById(this.currentCard[a]);
            }
            if (score > 10) {
                this.getPlayerHouse(0).showCardName((score % 10) + " Điểm");
            } else {
                this.getPlayerHouse(0).showCardName(score + " Điểm");
            }

            setTimeout(() => {
                this.getPlayerHouse(0).resetCardReady();
            }, 200);
        }
    }

    moveChipsToHubNow(index) {
        this.hubChips.children[2 * index].position = cc.v2(25, 80);
        this.hubChips.children[2 * index].scale = 0;
        this.hubChips.children[(2 * index) + 1].position = cc.v2(25, 80);
        this.hubChips.children[(2 * index) + 1].scale = 0;
    }

    fxMoveChips(chips, delay, toX, toY) {
        chips.runAction(
            cc.sequence(
                cc.delayTime(delay),
                cc.scaleTo(0, 1, 1),
                cc.spawn(
                    cc.moveTo(0.8, toX, toY),
                    cc.scaleTo(0.8, 0, 0)
                )
            )
        );
    }

    resetHubChips() {
        // Pos cua child hubChips khi keo den vi tri de len cai hubPot cua tung player
        var arrFromX = [85, 270, 380, 380, 300, -140, -470, -470, -360];
        var arrFromY = [-235, -160, 15, 95, 305, 305, 195, 15, -155];

        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            this.hubChips.children[2 * index].position = cc.v2(arrFromX[index], arrFromY[index]);
            this.hubChips.children[(2 * index) + 1].position = cc.v2(arrFromX[index], arrFromY[index]);
        }

        for (let index = 0; index < (2 * cmd.Code.MAX_PLAYER); index++) {
            this.hubChips.children[index].active = false;
        }
    }

    setupBet() {
        // arrBetValue
        this.currentBetSelectedIndex = 0;
        this.betChooseValueTarget.y = this.arrBetPos[this.currentBetSelectedIndex];
    }

    showBtnRaise(state) {
        this.btnActions.children[0].active = state;
    }

    showBtnCheck(state) {
        this.btnActions.children[1].active = state;
    }

    showBtnCall(state) {
        this.btnActions.children[2].active = state;
    }

    resetBtnActions() {
        for (let index = 0; index < 4; index++) {
            this.btnActions.children[index].active = true;
        }
    }

    showPopupBuyIn(min, max, bet) {
        this.minCashIn = min;
        this.maxCashIn = max;
        this.popupBuyIn.active = true;
        this.labelBuyInMin.string = Utils.formatNumber(bet * min);
        if (Configs.Login.Coin > bet * max) {
            this.labelBuyInMax.string = Utils.formatNumber(bet * max);
        } else {
            this.labelBuyInMax.string = Utils.formatNumber(Configs.Login.Coin);
        }
        this.edtBuyIn.string = "";
        this.toggleAutoBuyIn.isChecked = true;
    }

    closePopupBuyIn() {
        this.popupBuyIn.active = false;
    }

    textChange(event) {
        if (event.length > 0) {
            var rawNumber = "";
            for (let index = 0; index < event.length; index++) {
                if (event[index] == "0"
                    || event[index] == "1"
                    || event[index] == "2"
                    || event[index] == "3"
                    || event[index] == "4"
                    || event[index] == "5"
                    || event[index] == "6"
                    || event[index] == "7"
                    || event[index] == "8"
                    || event[index] == "9") {
                    rawNumber += event[index];
                }
            }
            cc.log("Lieng onTextChange rawNumber : ", rawNumber);
            if (rawNumber !== "") {
                this.edtBuyIn.string = Utils.formatNumber(parseInt(rawNumber));
            } else {
                this.edtBuyIn.string = "";
            }
        }
    }

    // addListener
    setupListener() {
        LiengNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.JOIN_ROOM_SUCCESS:
                    {
                        cc.log("Lieng JOIN_ROOM_SUCCESS");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedJoinRoomSucceed(data);
                        cc.log("Lieng JOIN_ROOM_SUCCESS res : ", JSON.stringify(res));
                        this.closeUIRoom();
                        this.setupMatch(res);
                    }
                    break;
                case cmd.Code.THONG_TIN_BAN_CHOI:  // Reconnect
                    {
                        cc.log("Lieng THONG_TIN_BAN_CHOI");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedGameInfo(data);
                        cc.log("Lieng THONG_TIN_BAN_CHOI res : ", JSON.stringify(res));

                        // {
                        //     "maxPlayer": 9,
                        //     "chair": 0,
                        //     "myCardSize": 2,
                        //     "myCards": [13, 22],
                        //     "dealerChair": 0,
                        //     "smallBlindChair": 1,
                        //     "bigBlindChair": 2,
                        //     "potAmount": 31000,
                        //     "maxBet": 4000,
                        //     "raiseStep": 4000,
                        //     "roundId": 1,
                        //     "gameServerState": 1,
                        //     "gameAction": 4,
                        //     "countDownTime": 9,
                        //     "currentActiveChair": 1,
                        //     "moneyType": 1,
                        //     "bet": 500,
                        //     "gameId": 1351,
                        //     "roomId": 93,
                        //     "hasInfoSize": 9,
                        //     "hasInfoList": [1, 1, 1, 0, 0, 0, 0, 0, 0],
                        //     "playerInfoList": [[], [], [], [], [], [], [], [], []]
                        // }

                        let chair = res["chair"];
                        let myCardSize = res["myCardSize"];
                        let myCards = res["myCards"];
                        let dealerChair = res["dealerChair"];
                        let smallBlindChair = res["smallBlindChair"];
                        let bigBlindChair = res["bigBlindChair"];
                        let potAmount = res["potAmount"];
                        let maxBet = res["maxBet"];
                        let raiseStep = res["raiseStep"];
                        let roundId = res["roundId"];
                        let gameServerState = res["gameServerState"];
                        let gameAction = res["gameAction"];
                        let countDownTime = res["countDownTime"];
                        let currentActiveChair = res["currentActiveChair"];
                        let bet = res["bet"];
                        let gameId = res["gameId"];
                        let roomId = res["roomId"];
                        let hasInfoSize = res["hasInfoSize"];
                        let hasInfoList = res["hasInfoList"];
                        let playerInfoList = res["playerInfoList"];

                        this.closeUIRoom();
                        this.showUIPlaying();
                        this.closeUIChat();

                        this.labelRoomId.string = "PHÒNG: " + roomId;
                        this.labelRoomBet.string = Utils.formatNumber(bet) + "/" + Utils.formatNumber(2 * bet) + "$";

                        this.currentRoomBet = bet;
                        this.currentCard = myCards;

                        if (potAmount != null) {
                            this.matchPot.active = true;
                            this.currentMatchPotValue = potAmount;
                            this.labelMatchPot.string = Utils.formatNumber(potAmount);
                        }

                        if (maxBet != null) {
                            this.currentMaxBet = maxBet;
                        }

                        if (raiseStep != null) {
                            this.currentRaiseStep = raiseStep;
                        }

                        this.currentRaiseValue = this.currentMaxBet + this.currentRaiseStep;
                        this.currentRaiseMin = this.currentMaxBet + this.currentRaiseStep;

                        configPlayer[0].playerId = Configs.Login.Nickname;
                        configPlayer[0].playerPos = chair;
                        cc.log("Lieng setupMatch configPlayer Me : ", configPlayer[0]);
                        cc.log("Lieng setupMatch configPlayer  : ", configPlayer);

                        var numPlayers = 0;
                        var arrPlayerPosExist = [];

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (hasInfoList[index] > 0) {
                                numPlayers += 1;
                                arrPlayerPosExist.push(index);
                            }
                        }
                        cc.log("Lieng numPlayers : ", numPlayers);

                        // setup configPlayer
                        for (let a = 0; a < configPlayer.length; a++) {
                            configPlayer[a].playerPos = defaultPlayerPos[chair][a];
                        }

                        // set State of Seat : Yes | No exist Player
                        for (let index = 0; index < configPlayer.length; index++) {
                            let findPos = arrPlayerPosExist.indexOf(configPlayer[index].playerPos);

                            var seatId = configPlayer[index].seatId;
                            this.getPlayerHouse(seatId).resetPlayerInfo();

                            if (findPos > -1) {
                                // Exist player -> Set Player Info
                                this.getPlayerHouse(seatId).setIsViewer(false);
                                this.setupSeatPlayer(seatId, {
                                    nickName: playerInfoList[index].nickName,
                                    avatar: playerInfoList[index].avatar,
                                    currentMoney: playerInfoList[index].currentMoney,
                                });

                                if (seatId != 0) {
                                    this.getPlayerHouse(seatId).showCardReady(true);
                                    this.getPlayerHouse(seatId).showCardReal(false);
                                }

                                if (playerInfoList[index].currentBet > 0) {
                                    this.getPlayerHouse(seatId).setBet(playerInfoList[index].currentBet);
                                    this.getPlayerHouse(seatId).addChips();
                                }

                                if (playerInfoList[index].fold) {
                                    this.getPlayerHouse(seatId).showActionState("ÚP");
                                    if (seatId == 0) {
                                        this.isFolded = true;
                                    }
                                }

                                if (playerInfoList[index].hasAllIn) {
                                    this.getPlayerHouse(seatId).showActionState("Tất Tay");
                                }
                            } else {
                                // Not Exist player  -> Active Btn Add player
                                this.getPlayerHouse(seatId).showBtnInvite(true);
                                configPlayer[index].isViewer = true;
                            }
                        }

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).setDealer(false);
                            this.getPlayerHouse(index).setSmallBind(false);
                            this.getPlayerHouse(index).setBigBind(false);
                        }

                        let activeSeatId = this.findPlayerSeatByPos(currentActiveChair);
                        if (activeSeatId != -1) {
                            this.getPlayerHouse(activeSeatId).showPlayCountdown();
                            this.startThinkingCountDown(activeSeatId, countDownTime);
                        }

                        // Open Me cards
                        if (myCardSize > 0) {
                            this.getPlayerHouse(0).showCardReady(false);
                            for (let a = 0; a < 3; a++) {
                                cc.log("Lieng cardId : ", myCards[a]);
                                let spriteCardId = CardUtils.getNormalId(myCards[a]);
                                this.getPlayerHouse(0).prepareCardReal(a);
                                this.getPlayerHouse(0).transformToCardReal(a, this.spriteCards[spriteCardId]);
                            }
                        }

                        if (myCardSize > 0 && activeSeatId == 0 && countDownTime > 0) {
                            this.btnBet.active = true;
                            this.FxDealer.setAnimation(0, "noti", true);
                            this.btnOpenCard.active = false;
                            let currentMeGold = playerInfoList[chair].currentMoney;
                            this.currentMeBet = playerInfoList[chair].currentBet;
                            this.setupBet();
                            this.currentRaiseValue = this.currentMaxBet + this.currentRaiseStep;
                            this.currentRaiseMin = this.currentMaxBet + this.currentRaiseStep;
                            // Neu ma minBet > currentMeGold thi an nut Raise di, chi cho Fold | All-In

                            let btn_01 = this.currentRaiseValue;
                            let btn_02 = -1;
                            let btn_03 = -1;
                            if (roundId == 0) {
                                btn_02 = Math.max(4 * this.currentRoomBet, this.currentRaiseStep) + this.currentMaxBet;
                                btn_03 = Math.max(6 * this.currentRoomBet, this.currentRaiseStep) + this.currentMaxBet;
                            } else {
                                btn_02 = Math.max(this.currentMatchPotValue / 2, this.currentRaiseStep) + this.currentMaxBet;
                                btn_03 = Math.max(this.currentMatchPotValue, this.currentRaiseStep) + this.currentMaxBet;
                            }
                            this.arrBetValue = [];
                            this.arrBetValue.push(btn_01 - this.currentMeBet);
                            this.arrBetValue.push(btn_02 - this.currentMeBet);
                            this.arrBetValue.push(btn_03 - this.currentMeBet);
                            this.arrBetValue.push(btn_03 + (2 * this.currentRoomBet) - this.currentMeBet);
                            this.arrBetValue.push(btn_03 + (4 * this.currentRoomBet) - this.currentMeBet);
                            for (let index = 0; index < 5; index++) {
                                this.betChooseValue.children[index].children[0].getComponent(cc.Label).string = Utils.formatNumberMin(this.arrBetValue[4 - index]);
                            }
                            if (roundId == 0) {
                                this.betChooseValue.children[0].children[1].getComponent(cc.Label).string = "";
                                this.betChooseValue.children[1].children[1].getComponent(cc.Label).string = "";
                                this.betChooseValue.children[2].children[1].getComponent(cc.Label).string = "";  // 3BB
                                this.betChooseValue.children[3].children[1].getComponent(cc.Label).string = "";  // 2BB
                                this.betChooseValue.children[4].children[1].getComponent(cc.Label).string = "";  // MIN
                            } else {
                                this.betChooseValue.children[0].children[1].getComponent(cc.Label).string = "";
                                this.betChooseValue.children[1].children[1].getComponent(cc.Label).string = "";
                                this.betChooseValue.children[2].children[1].getComponent(cc.Label).string = "";  // POT
                                this.betChooseValue.children[3].children[1].getComponent(cc.Label).string = "";  // POT/2
                                this.betChooseValue.children[4].children[1].getComponent(cc.Label).string = "";  // MIN
                            }
                            this.resetBtnActions();
                            if (this.currentMaxBet == this.currentMeBet) {
                                this.showBtnCall(false);
                                this.showBtnCheck(true);
                            } else {
                                if ((this.currentMaxBet - this.currentMeBet) >= currentMeGold) {
                                    this.showBtnRaise(false);
                                    this.showBtnCall(false);
                                    this.showBtnCheck(false);
                                } else {
                                    this.showBtnCall(true);
                                    this.showBtnCheck(false);
                                }
                            }
                            if ((this.currentRaiseValue - this.currentMeBet) >= currentMeGold) {
                                this.showBtnRaise(false);
                            }
                        }
                        this.resetHubChips();
                    }
                    break;
                case cmd.Code.DANG_KY_THOAT_PHONG:
                    {
                        cc.log("Lieng DANG_KY_THOAT_PHONG");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedNotifyRegOutRoom(data);
                        cc.log("Lieng DANG_KY_THOAT_PHONG res : ", JSON.stringify(res));
                        let outChair = res["outChair"];
                        let isOutRoom = res["isOutRoom"];

                        let seatId = this.findPlayerSeatByPos(outChair);
                        if (seatId !== -1) {
                            if (isOutRoom) {
                                this.getPlayerHouse(seatId).showNotify("Sắp rời bàn !");
                            } else {
                                this.getPlayerHouse(seatId).showNotify("Khô Máu !");
                            }
                        }
                    }
                    break;
                case cmd.Code.NEW_USER_JOIN:
                    {
                        cc.log("Lieng NEW_USER_JOIN");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUserJoinRoom(data);
                        cc.log("Lieng NEW_USER_JOIN res : ", JSON.stringify(res));

                        let nickName = res["info"]["nickName"];
                        let avatar = res["info"]["avatar"];
                        let currentMoney = res["info"]["money"];
                        let chair = res["uChair"];
                        let status = res["uStatus"];

                        // set State of Seat : Yes | No exist Player
                        for (let index = 0; index < configPlayer.length; index++) {
                            if (configPlayer[index].playerPos == chair) {
                                // Exist player -> Set Player Info
                                var seatId = configPlayer[index].seatId;
                                this.getPlayerHouse(seatId).resetPlayerInfo();
                                var customPlayerInfo = {
                                    "avatar": avatar,
                                    "nickName": nickName,
                                    "currentMoney": currentMoney,
                                }

                                this.setupSeatPlayer(seatId, customPlayerInfo);

                                if (status == cmd.Code.PLAYER_STATUS_VIEWER) {
                                    this.getPlayerHouse(seatId).setIsViewer(true);
                                    configPlayer[seatId].isViewer = true;
                                    if (configPlayer[seatId].playerId != -1) {
                                        this.getPlayerHouse(seatId).playFxViewer();
                                    }
                                } else {
                                    this.getPlayerHouse(seatId).setIsViewer(false);
                                    configPlayer[seatId].isViewer = false;
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.LEAVE_GAME:
                    {
                        cc.log("Lieng LEAVE_GAME");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUserLeaveRoom(data);
                        cc.log("Lieng LEAVE_GAME res : ", JSON.stringify(res));
                        let chair = res["chair"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId !== -1) {
                            // Need clear configPlayer
                            for (let index = 0; index < configPlayer.length; index++) {
                                if (configPlayer[index].seatId == seatId) {
                                    configPlayer[index].playerId = -1;
                                    configPlayer[index].isViewer = true;
                                }
                            }

                            // Change UI
                            this.getPlayerHouse(seatId).resetPlayerInfo();
                            this.getPlayerHouse(seatId).showBtnInvite(true);

                            let arrSeatExistLast = this.getNumPlayers();
                            if (arrSeatExistLast.length == 1) {
                                this.resetPlayersPlaying();
                                this.matchPot.active = false;
                            }

                            if (seatId == 0) {
                                // Me leave
                                // Change UI
                                this.UI_Playing.active = false;
                                this.UI_ChooseRoom.active = true;
                            }
                        }
                    }
                    break;
                case cmd.Code.TAKE_TURN:
                    {
                        cc.log("Lieng TAKE_TURN");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedTakeTurn(data);
                        cc.log("Lieng TAKE_TURN res : ", JSON.stringify(res));

                        // {
                        //     "actionChair": 1,
                        //     "action": 2,
                        //     "lastRaise": 500,
                        //     "currentBet": 1000,
                        //     "maxBet": 1000,
                        //     "currentMoney": 29000,
                        //     "raiseStep": 1000,
                        //     "raiseBlock": 0
                        // }

                        let actionChair = res["actionChair"];
                        let action = res["action"];
                        let lastRaise = res["lastRaise"];
                        let currentBet = res["currentBet"];
                        let maxBet = res["maxBet"];
                        let currentMoney = res["currentMoney"];
                        let raiseStep = res["raiseStep"];
                        let raiseBlock = res["raiseBlock"];
                        let potMoney = res["potMoney"];

                        cc.log("Lieng TAKE_TURN actionChair : ", actionChair);
                        cc.log("Lieng TAKE_TURN action : ", action);
                        cc.log("Lieng TAKE_TURN lastRaise : ", lastRaise);
                        cc.log("Lieng TAKE_TURN currentBet : ", currentBet);
                        cc.log("Lieng TAKE_TURN maxBet : ", maxBet);
                        cc.log("Lieng TAKE_TURN currentMoney : ", currentMoney);
                        cc.log("Lieng TAKE_TURN raiseStep : ", raiseStep);
                        cc.log("Lieng TAKE_TURN raiseBlock : ", raiseBlock);

                        this.currentMaxBet = maxBet;
                        this.currentRaiseStep = raiseStep;
                        this.currentMatchPotValue = potMoney;
                        this.labelMatchPot.string = Utils.formatNumber(potMoney);

                        let seatId = this.findPlayerSeatByPos(actionChair);
                        if (seatId != -1) {
                            if (seatId == 0) {
                                this.lastMeBet = this.currentMeBet;
                                this.currentMeBet = currentBet;
                            }

                            let actionName = "";
                            switch (action) {
                                case cmd.Code.GAME_ACTION_FOLD:
                                    actionName = "ÚP";
                                    this.getPlayerHouse(seatId).fxMeFold();
                                    if (seatId == 0) {
                                        this.isFolded = true;
                                    }
                                    break;
                                case cmd.Code.GAME_ACTION_CHECK:
                                    actionName = "XEM";
                                    break;
                                case cmd.Code.GAME_ACTION_CALL:
                                    actionName = "THEO";
                                    // Other Player call
                                    // if (seatId != 0) {
                                    //     this.currentMeBet = 0;
                                    // }
                                    this.getPlayerHouse(seatId).addChips();
                                    break;
                                case cmd.Code.GAME_ACTION_RAISE:
                                    actionName = "TỐ";
                                    this.getPlayerHouse(seatId).setBet(currentBet);
                                    this.getPlayerHouse(seatId).addChips();
                                    // sang turn moi, khi player truoc Raise va minh chua Bet gi
                                    // if (seatId != 0 && this.currentMeBet == 0) {
                                    //     this.currentMeBet = lastRaise;
                                    // }
                                    break;
                                case cmd.Code.GAME_ACTION_ALL_IN:
                                    actionName = "Tất Tay";
                                    this.getPlayerHouse(seatId).setBet(currentBet);
                                    this.getPlayerHouse(seatId).addChips();
                                    this.getPlayerHouse(seatId).addChips();
                                    break;
                                default:
                                    break;
                            }
                            this.getPlayerHouse(seatId).setGold(currentMoney);
                            this.getPlayerHouse(seatId).showActionState(actionName);
                        }
                    }
                    break;
                case cmd.Code.SELECT_DEALER:
                    {
                        cc.log("Lieng SELECT_DEALER");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedSelectDealer(data);
                        cc.log("Lieng SELECT_DEALER res : ", JSON.stringify(res));

                        let dealerChair = res["dealerChair"];         // not use
                        let smallBlindChair = res["smallBlindChair"]; // not use
                        let bigBlindChair = res["bigBlindChair"];     // not use
                        let hasInfoSize = res["hasInfoSize"];
                        let hasInfoList = res["hasInfoList"];
                        let playerStatusList = res["playerStatusList"];
                        let gameId = res["gameId"];
                        let isCheat = res["isCheat"];
                        let currentMoneySize = res["currentMoneySize"];
                        let currentMoneyList = res["currentMoneyList"];

                        cc.log("Lieng SELECT_DEALER dealerChair : ", dealerChair);
                        cc.log("Lieng SELECT_DEALER smallBlindChair : ", smallBlindChair);
                        cc.log("Lieng SELECT_DEALER bigBlindChair : ", bigBlindChair);
                        cc.log("Lieng SELECT_DEALER hasInfoSize : ", hasInfoSize);
                        cc.log("Lieng SELECT_DEALER hasInfoList : ", hasInfoList);
                        cc.log("Lieng SELECT_DEALER playerStatusList : ", playerStatusList);
                        cc.log("Lieng SELECT_DEALER gameId : ", gameId);
                        cc.log("Lieng SELECT_DEALER isCheat : ", isCheat);
                        cc.log("Lieng SELECT_DEALER currentMoneySize : ", currentMoneySize);
                        cc.log("Lieng SELECT_DEALER currentMoneyList : ", currentMoneyList);

                        // set Dealer, SB, BB state
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).setDealer(false);
                            this.getPlayerHouse(index).setSmallBind(false);
                            this.getPlayerHouse(index).setBigBind(false);
                        }

                        this.currentMatchPotValue = 0;
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (playerStatusList[index] == 3) {
                                let seatId = this.findPlayerSeatByPos(index);
                                if (seatId != -1) {
                                    this.getPlayerHouse(seatId).setBet(this.currentRoomBet);
                                    this.getPlayerHouse(seatId).addChips();
                                    this.currentMatchPotValue += this.currentRoomBet;
                                }
                            }
                        }

                        this.currentMeBet = this.currentRoomBet;
                        this.labelMatchPot.string = Utils.formatNumber(this.currentMatchPotValue);
                        // this.currentMaxBet = 2 * this.currentRoomBet;
                        this.currentMaxBet = this.currentRoomBet;
                        this.currentRaiseStep = 2 * this.currentRoomBet;
                        this.currentRaiseValue = this.currentMaxBet + this.currentRaiseStep;
                        cc.log("Lieng SELECT_DEALER currentMeBet : ", this.currentMeBet);
                        cc.log("Lieng SELECT_DEALER currentRaiseStep : ", this.currentRaiseStep);
                        cc.log("Lieng SELECT_DEALER currentRaiseValue : ", this.currentRaiseValue);

                        // update Gold
                        for (let index = 0; index < currentMoneyList.length; index++) {
                            let seatId = this.findPlayerSeatByPos(index);
                            this.getPlayerHouse(seatId).setGold(currentMoneyList[index]);
                            if (currentMoneyList[index] == 0) {
                                configPlayer[seatId].isViewer = true;
                                configPlayer[seatId]["isViewer"] = true;
                                this.getPlayerHouse(seatId).setIsViewer(true);
                                if (configPlayer[seatId].playerId != -1) {
                                    this.getPlayerHouse(seatId).playFxViewer();
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.BUY_IN:
                    {
                        cc.log("Lieng BUY_IN");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedBuyIn(data);
                        cc.log("Lieng BUY_IN res : ", JSON.stringify(res));

                        let chair = res["chair"];
                        let buyInMoney = res["buyInMoney"];

                        cc.log("Lieng BUY_IN chair : ", chair);
                        cc.log("Lieng BUY_IN buyInMoney : ", buyInMoney);

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            if (seatId == 0) {
                                // Me buy in
                                App.instance.showLoading(false);
                            }

                            this.getPlayerHouse(seatId).setGold(buyInMoney);
                        }
                    }
                    break;
                case cmd.Code.DEAL_PRIVATE_CARD:
                    {
                        cc.log("Lieng DEAL_PRIVATE_CARD");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedDealCards(data);
                        cc.log("Lieng DEAL_PRIVATE_CARD res : ", JSON.stringify(res));

                        let chair = res["chair"];
                        let sizeCard = res["sizeCard"];
                        let myCards = res["myCards"];
                        let boBaiId = res["boBaiId"];

                        // Fix cung -> can tim cach set first raise step

                        cc.log("Lieng DEAL_PRIVATE_CARD chair  : ", chair);
                        cc.log("Lieng DEAL_PRIVATE_CARD sizeCard : ", sizeCard);
                        cc.log("Lieng DEAL_PRIVATE_CARD myCards : ", myCards);
                        cc.log("Lieng DEAL_PRIVATE_CARD boBaiId : ", boBaiId);

                        this.btnBet.active = false;
                        this.btnOpenCard.active = false;
                        this.matchPot.active = true;
                        this.btnLatBai.active = false;

                        this.FxDealer.setAnimation(0, "cho", true);

                        this.currentCard = myCards;
                        cc.log("Lieng ReceivedChiaBai currentCard : ", this.currentCard);

                        var arrSeatExist = this.getNumPlayers();
                        let numPlayer = arrSeatExist.length;
                        cc.log("Lieng ReceivedChiaBai arrSeatExist : ", arrSeatExist);
                        cc.log("Lieng ReceivedChiaBai numPlayer : ", numPlayer);

                        // Open | Hide cards not use
                        for (let index = 0; index < cmd.Code.MAX_PLAYER * 3; index++) { // 9 players * 3 cards
                            this.cardsDeal.children[index].active = index >= numPlayer * 3 ? false : true;
                            this.cardsDeal.children[index].position = cc.v2(0, 0);
                        }

                        // Move Cards used to each player joined
                        for (let a = 0; a < 3; a++) { // players x 3 cards
                            for (let b = 0; b < numPlayer; b++) {
                                let seatId = arrSeatExist[b];
                                if (seatId !== -1) {
                                    let card4Me = this.cardsDeal.children[(a * numPlayer) + b];
                                    let rawPlayerPos = this.groupPlayers.children[seatId].position;
                                    cc.log("Lieng CHIA_BAI delayTime : ", ((a * numPlayer) + b) * 0.15);
                                    card4Me.runAction(
                                        cc.sequence(
                                            cc.delayTime(((a * numPlayer) + b) * 0.15),
                                            cc.moveTo(0.2, rawPlayerPos)
                                        )
                                    );
                                }
                            }
                        }

                        let delayOver2Under = 0.2;
                        var maxDelay = ((2 * numPlayer) + (numPlayer - 1)) * 0.15; // ((a * numPlayer) + b) * 0.15
                        let timeUnderLayer = (maxDelay + 0.2 + delayOver2Under) * 1000;
                        cc.log("CHIA_BAI timeUnderLayer : ", timeUnderLayer);
                        clearTimeout(this.timeoutChiaBaiDone);
                        this.timeoutChiaBaiDone = setTimeout(() => {
                            for (let index = 0; index < cmd.Code.MAX_PLAYER * 3; index++) { // 9 players * 3 cards
                                cc.log("CHIA_BAI cardsDeal index : ", index);
                                this.cardsDeal.children[index].active = false;
                            }

                            for (let index = 0; index < numPlayer; index++) {
                                let seatId = arrSeatExist[index];
                                if (seatId !== -1) {
                                    // Drop layer
                                    this.getPlayerHouse(seatId).showCardReady(true);
                                    this.getPlayerHouse(seatId).showCardReal(false);
                                }
                            }

                            // Open Me cards
                            for (let a = 0; a < 3; a++) {
                                cc.log("Lieng cardId : ", myCards[a]);
                                let spriteCardId = CardUtils.getNormalId(myCards[a]);
                                this.getPlayerHouse(0).prepareCardReal(a);
                                this.getPlayerHouse(0).transformToCardReal(a, this.spriteCards[spriteCardId]);
                            }
                            let cardName = this.getCardsName(myCards);
                            this.getPlayerHouse(0).showCardName(cardName);
                            this.btnLatBai.active = true;
                        }, timeUnderLayer);

                    }
                    break;
                case cmd.Code.NEW_ROUND:
                    {
                        cc.log("Lieng NEW_ROUND");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedNewBetRound(data);
                        cc.log("Lieng NEW_ROUND res : ", JSON.stringify(res));

                        // {
                        //     "roundId": 1,
                        //     "sizeCard": 3,
                        //     "plusCards": [
                        //       0,
                        //       36,
                        //       27
                        //     ],
                        //     "cardName": 9,
                        //     "potAmount": 4000
                        //   }

                        let roundId = res["roundId"];
                        let sizeCard = res["sizeCard"];
                        let plusCards = res["plusCards"];
                        let cardName = res["cardName"];
                        let potAmount = res["potAmount"];

                        cc.log("Lieng NEW_ROUND roundId : ", roundId);
                        cc.log("Lieng NEW_ROUND sizeCard : ", sizeCard);
                        cc.log("Lieng NEW_ROUND plusCards : ", plusCards);
                        cc.log("Lieng NEW_ROUND cardName : ", cardName);
                        cc.log("Lieng NEW_ROUND potAmount : ", potAmount);

                        this.matchPot.active = true;
                        this.currentMatchPotValue = potAmount;
                        this.labelMatchPot.string = Utils.formatNumber(potAmount);

                        this.currentMeBet = 0;

                        this.currentMaxBet = 0;
                        this.currentRaiseStep = 2 * this.currentRoomBet;
                        this.currentRaiseValue = this.currentMaxBet + this.currentRaiseStep;
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).showPlayerBet(false);
                        }

                        // this.getPlayerHouse(0).showCardName(this.getCardsName(cardName));
                    }
                    break;
                case cmd.Code.CHANGE_TURN:
                    {
                        cc.log("Lieng CHANGE_TURN");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChangeTurn(data);
                        cc.log("Lieng CHANGE_TURN res : ", JSON.stringify(res));

                        let roundId = res["roundId"];
                        let chair = res["chair"];
                        let betTime = res["betTime"];

                        cc.log("Lieng CHANGE_TURN roundId : ", roundId);
                        cc.log("Lieng CHANGE_TURN chair : ", chair);
                        cc.log("Lieng CHANGE_TURN betTime : ", betTime);

                        this.resetAllPlayerCountdown();

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            this.getPlayerHouse(seatId).showPlayCountdown();
                            this.startThinkingCountDown(seatId, betTime);
                            if (seatId == 0) {
                                this.btnBet.active = true;
                                this.FxDealer.setAnimation(0, "noti", true);
                                this.btnOpenCard.active = false;

                                this.setupBet();

                                this.currentRaiseValue = this.currentMaxBet + this.currentRaiseStep;
                                this.currentRaiseMin = this.currentMaxBet + this.currentRaiseStep;

                                // Neu ma minBet > currentMeGold thi an nut Raise di, chi cho Fold | All-In
                                let currentMeGold = this.getPlayerHouse(0).getGold();

                                // dang gap loi minBet sai, dat minBet k dc, phải dc ++1 mới dc
                                cc.log("Lieng_BET =======================================", roundId);
                                cc.log("Lieng_BET currentMaxBet : ", this.currentMaxBet);
                                cc.log("Lieng_BET currentRaiseStep : ", this.currentRaiseStep);
                                cc.log("Lieng_BET currentRaiseMin : ", this.currentRaiseMin);
                                cc.log("Lieng_BET currentRaiseValue : ", this.currentRaiseValue);
                                cc.log("Lieng_BET currentMeBet : ", this.currentMeBet);
                                cc.log("Lieng_BET lastMeBet : ", this.lastMeBet);
                                cc.log("Lieng_BET currentMeGold : ", currentMeGold);
                                cc.log("Lieng_BET currentRoomBet : ", this.currentRoomBet);
                                cc.log("Lieng_BET currentMatchPotValue : ", this.currentMatchPotValue);

                                let btn_01 = this.currentRaiseValue;
                                let btn_02 = -1;
                                let btn_03 = -1;
                                if (roundId == 0) {
                                    btn_02 = Math.max(4 * this.currentRoomBet, this.currentRaiseStep) + this.currentMaxBet;
                                    btn_03 = Math.max(6 * this.currentRoomBet, this.currentRaiseStep) + this.currentMaxBet;
                                } else {
                                    btn_02 = Math.max(this.currentMatchPotValue / 2, this.currentRaiseStep) + this.currentMaxBet;
                                    btn_03 = Math.max(this.currentMatchPotValue, this.currentRaiseStep) + this.currentMaxBet;
                                }


                                this.arrBetValue = [];
                                this.arrBetValue.push(btn_01 - this.currentMeBet);
                                this.arrBetValue.push(btn_02 - this.currentMeBet);
                                this.arrBetValue.push(btn_03 - this.currentMeBet);
                                this.arrBetValue.push(btn_03 + (2 * this.currentRoomBet) - this.currentMeBet);
                                this.arrBetValue.push(btn_03 + (4 * this.currentRoomBet) - this.currentMeBet);

                                for (let index = 0; index < 5; index++) {
                                    this.betChooseValue.children[index].children[0].getComponent(cc.Label).string = Utils.formatNumberMin(this.arrBetValue[4 - index]);
                                }

                                if (roundId == 0) {
                                    this.betChooseValue.children[0].children[1].getComponent(cc.Label).string = "";
                                    this.betChooseValue.children[1].children[1].getComponent(cc.Label).string = "";
                                    this.betChooseValue.children[2].children[1].getComponent(cc.Label).string = "";  // 3BB
                                    this.betChooseValue.children[3].children[1].getComponent(cc.Label).string = "";  // 2BB
                                    this.betChooseValue.children[4].children[1].getComponent(cc.Label).string = "";  // MIN
                                } else {
                                    this.betChooseValue.children[0].children[1].getComponent(cc.Label).string = "";
                                    this.betChooseValue.children[1].children[1].getComponent(cc.Label).string = "";
                                    this.betChooseValue.children[2].children[1].getComponent(cc.Label).string = "";  // POT
                                    this.betChooseValue.children[3].children[1].getComponent(cc.Label).string = "";  // POT/2
                                    this.betChooseValue.children[4].children[1].getComponent(cc.Label).string = "";  // MIN
                                }

                                this.resetBtnActions();

                                if (this.currentMaxBet == this.currentMeBet) {
                                    this.showBtnCall(false);
                                    this.showBtnCheck(true);
                                } else {
                                    if ((this.currentMaxBet - this.currentMeBet) >= currentMeGold) {
                                        this.showBtnRaise(false);
                                        this.showBtnCall(false);
                                        this.showBtnCheck(false);
                                    } else {
                                        this.showBtnCall(true);
                                        this.showBtnCheck(false);
                                    }
                                }

                                if ((this.currentRaiseValue - this.currentMeBet) >= currentMeGold) {
                                    this.showBtnRaise(false);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.KET_THUC:
                    {
                        cc.log("Lieng KET_THUC");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedEndGame(data);
                        cc.log("Lieng KET_THUC res : ", JSON.stringify(res));

                        // {
                        //     "potAmount": 20,
                        //     "rankSize": 9,
                        //     "rankList": [10, 1, 0, 0, 0, 0, 0, 0, 0],
                        //     "kqttSize": 9,
                        //     "kqttList": [0, 20, 0, 0, 0, 0, 0, 0, 0],
                        //     "booleanWinerSize": 9,
                        //     "booleanWinerList": [0, 1, 0, 0, 0, 0, 0, 0, 0],
                        //     "moneyArraySize": 9,
                        //     "currentMoney": [990, 410, 0, 0, 0, 0, 0, 0, 0],
                        //     "gameMoney": [],
                        //     "gameMoneySize": 9,
                        //     "hasInfoSize": 0,
                        //     "hasInfoList": [],
                        //     "privateCardList": [
                        //         [], [], [], [], [], [], [], [], []
                        //     ],
                        //     "cardNameList": [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        // }


                        let potAmount = res["potAmount"];
                        let rankSize = res["rankSize"];
                        let rankList = res["rankList"];
                        let kqttSize = res["kqttSize"];
                        let kqttList = res["kqttList"];
                        let booleanWinerSize = res["booleanWinerSize"];
                        let booleanWinerList = res["booleanWinerList"];
                        let moneyArraySize = res["moneyArraySize"];
                        let currentMoney = res["currentMoney"];
                        let gameMoney = res["gameMoney"];
                        let gameMoneySize = res["gameMoneySize"];
                        let hasInfoSize = res["hasInfoSize"];
                        let hasInfoList = res["hasInfoList"];
                        let privateCardList = res["privateCardList"];
                        let cardNameList = res["cardNameList"];

                        cc.log("UKUKUK cardNameList : ", cardNameList);

                        this.matchPot.active = true;
                        this.currentMatchPotValue = potAmount;
                        this.labelMatchPot.string = Utils.formatNumber(potAmount);

                        this.FxDealer.setAnimation(0, "cho", true);

                        this.currentPrivateCardList = privateCardList;
                        this.btnLatBai.active = false;

                        // show Fx win

                        // find Players is Playing
                        let arrPlayerPosExist = [];
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (privateCardList[index].length > 0) {
                                arrPlayerPosExist.push(index);
                            }
                        }

                        // find Winner
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (booleanWinerList[index] == 1) {
                                // Winner
                                let seatId = this.findPlayerSeatByPos(index);
                                if (seatId != -1) {
                                    this.getPlayerHouse(seatId).fxWin({
                                        moneyChange: kqttList[index],
                                        currentMoney: currentMoney[index]
                                    });

                                    if (seatId == 0) {
                                        // Me win
                                        // numPlayers > 2 thi dc openCard
                                        let numPlayer = this.getNumPlayers();
                                        if (numPlayer.length > 2) {
                                            this.btnOpenCard.active = true;
                                        } else {
                                            this.btnOpenCard.active = false;
                                        }
                                        this.btnBet.active = false;
                                    }
                                }
                            } else {
                                // Lose : can kiem tra xem co phai isPlaying k
                                let findId = arrPlayerPosExist.indexOf(index);
                                if (findId > -1) {
                                    let seatId = this.findPlayerSeatByPos(index);
                                    if (seatId != -1) {
                                        this.getPlayerHouse(seatId).fxLose({
                                            moneyChange: kqttList[index],
                                            currentMoney: currentMoney[index]
                                        });
                                    }
                                }
                            }
                        }
                        // reshow Me cards for reconnect

                        // find Me max cards
                        // show Cards Name
                        for (let index = 0; index < arrPlayerPosExist.length; index++) {
                            let cards = privateCardList[arrPlayerPosExist[index]];
                            let seatId = this.findPlayerSeatByPos(arrPlayerPosExist[index]);
                            if (cards.length > 0 && seatId != -1) {
                                for (let a = 0; a < cards.length; a++) {
                                    let spriteCardId = CardUtils.getNormalId(cards[a]);
                                    this.getPlayerHouse(seatId).prepareCardReal(a);
                                    this.getPlayerHouse(seatId).transformToCardReal(a, this.spriteCards[spriteCardId]);
                                }

                                let cardName = this.getCardsName(cards);
                                if (seatId == 0) {
                                    // this.getPlayerHouse(seatId).hideCardName();
                                    // this.FxMeCardName.active = true;
                                    // this.FxMeCardName.children[0].getComponent(cc.Sprite).spriteFrame = this.spriteCardNames[cardNameList[arrPlayerPosExist[index]]];

                                    this.getPlayerHouse(seatId).showCardName(cardName);
                                } else {
                                    this.getPlayerHouse(seatId).showCardName(cardName);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.UPDATE_MATCH:
                    {
                        cc.log("Lieng UPDATE_MATCH");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUpdateMatch(data);
                        cc.log("Lieng UPDATE_MATCH res : ", JSON.stringify(res));

                        // {
                        //     "chair": 1,
                        //     "hasInfoSize": 9,
                        //     "hasInfoList": [1, 1, 0, 0, 0, 0, 0, 0, 0],
                        //     "currentMoneyList": [19990, 19990, 0, 0, 0, 0, 0, 0, 0],
                        //     "statusList": [2, 2, 0, 0, 0, 0, 0, 0, 0]
                        // }

                        let chair = res["chair"];
                        let hasInfoSize = res["hasInfoSize"];
                        let hasInfoList = res["hasInfoList"];
                        let currentMoneyList = res["currentMoneyList"];
                        let statusList = res["statusList"];

                        cc.log("Lieng setupMatch configPlayer : ", configPlayer);
                        // theo Pos khong phai SeatId
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            let pos = configPlayer[index]["playerPos"];
                            if (hasInfoList[pos] == 1) {
                                // setGold se inactive isViewer nen dat no len dau de ben duoi config lai
                                this.getPlayerHouse(index).setGold(currentMoneyList[pos]);
                                if (statusList[pos] == cmd.Code.PLAYER_STATUS_SITTING || statusList[pos] == cmd.Code.PLAYER_STATUS_PLAYING) {
                                    if (currentMoneyList[pos] == 0) {
                                        configPlayer[index].isViewer = true;
                                        configPlayer[index]["isViewer"] = true;
                                        this.getPlayerHouse(index).setIsViewer(true);
                                        if (configPlayer[index].playerId != -1) {
                                            this.getPlayerHouse(index).playFxViewer();
                                        }
                                    } else {
                                        configPlayer[index].isViewer = false;
                                        configPlayer[index]["isViewer"] = false;
                                        this.getPlayerHouse(index).setIsViewer(false);
                                    }
                                } else {
                                    configPlayer[index].isViewer = true;
                                    configPlayer[index]["isViewer"] = true;
                                    this.getPlayerHouse(index).setIsViewer(true);
                                    if (configPlayer[index].playerId != -1) {
                                        this.getPlayerHouse(index).playFxViewer();
                                    }

                                }
                            } else {
                                configPlayer[index]["playerId"] = -1;
                                configPlayer[index]["isViewer"] = true;
                            }
                        }
                        cc.log("Lieng setupMatch configPlayer : ", configPlayer);
                    }
                    break;
                case cmd.Code.SHOW_CARD:
                    {
                        cc.log("Lieng SHOW_CARD");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedShowCard(data);
                        cc.log("Lieng SHOW_CARD res : ", JSON.stringify(res));

                        let chair = res["chair"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            let cardShow = this.currentPrivateCardList[chair];
                            if (cardShow.length > 0) {
                                for (let a = 0; a < 3; a++) {
                                    cc.log("Lieng cardId : ", cardShow[a]);
                                    let spriteCardId = CardUtils.getNormalId(cardShow[a]);
                                    this.getPlayerHouse(seatId).prepareCardReal(a);
                                    this.getPlayerHouse(seatId).transformToCardReal(a, this.spriteCards[spriteCardId]);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.REQUEST_LAT_BAI:
                    {
                        cc.log("Lieng REQUEST_LAT_BAI");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedLatBai(data);
                        cc.log("Lieng REQUEST_LAT_BAI res : ", JSON.stringify(res));

                        let chair = res["chair"];
                        let cardSize = res["cardSize"];
                        let cards = res["cards"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1 && seatId != 0) {
                            for (let a = 0; a < cards.length; a++) {
                                cc.log("Lieng cardId : ", cards[a]);
                                if (cards[a] != 255) {
                                    let spriteCardId = CardUtils.getNormalId(cards[a]);
                                    this.getPlayerHouse(seatId).prepareCardReal(a);
                                    this.getPlayerHouse(seatId).transformToCardReal(a, this.spriteCards[spriteCardId]);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.REQUEST_BUY_IN:
                    {
                        cc.log("Lieng REQUEST_STAND_UP");
                        if (Configs.Login.Coin >= (this.currentRoomBet * this.roomMinBuyIn)) {
                            this.showPopupBuyIn(this.roomMinBuyIn, this.roomMaxBuyIn, this.currentRoomBet);
                        } else {
                            this.actionLeaveRoom();
                        }
                    }
                    break;
                case cmd.Code.REQUEST_STAND_UP:
                    {
                        cc.log("Lieng REQUEST_STAND_UP");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedStandUp(data);
                        cc.log("Lieng REQUEST_STAND_UP res : ", JSON.stringify(res));
                        let isUp = res["isUp"];

                        cc.log("Lieng REQUEST_STAND_UP isUp : ", isUp);
                    }
                    break;
                case cmd.Code.LOGIN:
                    App.instance.showLoading(false);
                    this.refeshListRoom();
                    LiengNetworkClient.getInstance().send(new cmd.CmdReconnectRoom());
                    break;
                case cmd.Code.TOPSERVER:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng TOPSERVER");
                    }
                    break;
                case cmd.Code.CMD_PINGPONG:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng CMD_PINGPONG");
                    }
                    break;
                case cmd.Code.CMD_JOIN_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng CMD_JOIN_ROOM");
                    }
                    break;
                case cmd.Code.CMD_RECONNECT_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng CMD_RECONNECT_ROOM");
                    }
                    break;
                case cmd.Code.CMD_RECONNECT_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng CMD_RECONNECT_ROOM");
                    }
                    break;
                case cmd.Code.MONEY_BET_CONFIG:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng MONEY_BET_CONFIG");
                    }
                    break;
                case cmd.Code.JOIN_ROOM_FAIL:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedJoinRoomFail(data);
                        cc.log("Lieng JOIN_ROOM_FAIL res : ", JSON.stringify(res));
                        let msg = "Lỗi " + res.getError() + ", không xác định.";
                        switch (res.getError()) {
                            case 1:
                                msg = "Lỗi kiểm tra thông tin!";
                                break;
                            case 2:
                                msg = "Không tìm được phòng thích hợp. Vui lòng thử lại sau!";
                                break;
                            case 3:
                                msg = "Bạn không đủ tiền vào phòng chơi này!";
                                break;
                            case 4:
                                msg = "Không tìm được phòng thích hợp. Vui lòng thử lại sau!";
                                break;
                            case 5:
                                msg = "Mỗi lần vào phòng phải cách nhau 10 giây!";
                                break;
                            case 6:
                                msg = "Hệ thống bảo trì!";
                                break;
                            case 7:
                                msg = "Không tìm thấy phòng chơi!";
                                break;
                            case 8:
                                msg = "Mật khẩu phòng chơi không đúng!";
                                break;
                            case 9:
                                msg = "Phòng chơi đã đủ người!";
                                break;
                            case 10:
                                msg = "Bạn bị chủ phòng không cho vào bàn!"
                        }
                        App.instance.alertDialog.showMsg(msg);
                    }
                    break;
                case cmd.Code.GET_LIST_ROOM:
                    {
                        this.btnRefresh.unscheduleAllCallbacks(); 
                        this.contentListRooms.removeAllChildren(true);
                        
                        let res = new cmd.ReceivedGetListRoom(data);
                        res.list.sort((a, b) => a.moneyBet - b.moneyBet);
                        cc.log(res);
                        for (let i = 0; i < res.list.length; i++) {
                            this.btnRefresh.scheduleOnce(() => {
                                let itemData = res.list[i];
                                let item = cc.instantiate(this.prefabItemRoom);
                                item.getComponent("Lieng.ItemRoom").initItem(itemData);
                                this.contentListRooms.addChild(item);

                                item.opacity = 0;
                                item.runAction(cc.fadeIn(0.5));

                                if(i == res.list.length - 1) {
                                    this.btnRefresh.interactable = true;
                                }
                            }, i*0.05);
                        }
                        this.scrollListRoom.scrollToTop(0.2);
                    }
                    break;
                case cmd.Code.JOIN_GAME_ROOM_BY_ID:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng JOIN_GAME_ROOM_BY_ID");
                    }
                    break;


                case cmd.Code.TU_DONG_BAT_DAU:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedAutoStart(data);
                        cc.log("Lieng ReceiveAutoStart res : ", JSON.stringify(res));
                        // {
                        //     "isAutoStart": true,
                        //     "timeAutoStart": 5
                        // }
                        this.FxMeCardName.active = false;
                        this.isFolded = false;
                        this.btnLatBai.active = false;
                        if (res.isAutoStart) {
                            this.resetHubChips();
                            this.startWaittingCountDown(res.timeAutoStart);
                            this.btnBet.active = false;
                            this.btnOpenCard.active = false;
                            this.FxDealer.setAnimation(0, "cho", true);

                            this.matchPot.active = false;
                            this.labelMatchPot.string = "0";
                            this.currentMatchPotValue = 0;

                            this.currentCard = [];
                            this.currentPrivateCardList = [];

                            this.currentMeBet = 0;
                            this.lastMeBet = 0;

                            this.currentMaxBet = 0;
                            this.currentRaiseMin = 0;
                            this.currentRaiseStep = 0;
                            this.currentRaiseValue = 0;

                            this.resetPlayersPlaying();
                            this.FxDealer.setAnimation(0, "cho", true);
                        }

                        FacebookTracking.logCountLieng();
                    }
                    break;
                case cmd.Code.MOI_DAT_CUOC:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedMoiDatCuoc(data);
                        cc.log("Lieng ReceivedMoiDatCuoc res : ", JSON.stringify(res));
                        // {
                        //     "timeDatCuoc": 20
                        //   }
                        this.startBettingCountDown(res.timeDatCuoc);
                        this.arrBetValue = [];
                        this.matchPot.active = true;
                        this.currentMatchPotValue = 0;
                        this.labelMatchPot.string = "0";

                        for (let index = 0; index < 4; index++) {
                            this.arrBetValue.push(this.currentRoomBet * (index + 1));
                            this.betChooseValue.children[index].children[0].getComponent(cc.Label).string = Utils.formatNumberMin(this.currentRoomBet * (4 - index));
                        }

                        // set bet default
                        for (let index = 0; index < configPlayer.length; index++) {
                            if (index !== this.seatOwner
                                && !configPlayer[index].isViewer
                                && configPlayer[index].playerId !== -1) {
                                cc.log("Lieng ReceivedMoiDatCuoc index : ", index);
                                this.getPlayerHouse(index).setBet(this.currentRoomBet);
                                this.getPlayerHouse(index).addChips();
                                if (index != 0) { // k ke cua, danh bien duoc len chinh minh
                                    this.getPlayerHouse(index).setupBetValue(this.currentRoomBet);
                                }
                            }
                        }

                        // {
                        //     seatId: 0,
                        //     playerId: -1,
                        //     playerPos: -1,
                        //     isViewer: true
                        // }

                        if (this.seatOwner == 0) { // Me la Chuong -> K dc bet va k dc vao ga
                            this.btnOpenCard.active = false;
                            this.btnBet.active = false;
                            this.FxDealer.setAnimation(0, "cho", true);
                        } else {
                            this.btnBet.active = true;
                            this.btnOpenCard.active = false;
                            this.FxDealer.setAnimation(0, "noti", true);
                            this.setupBet();
                            cc.log("Lieng MOI_DAT_CUOC this.arrBetValue : ", this.arrBetValue);
                        }

                        this.numCardOpened = 0;
                    }
                    break;
                case cmd.Code.CHEAT_CARDS:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng CHEAT_CARDS");
                    }
                    break;
                case cmd.Code.DANG_KY_CHOI_TIEP:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng DANG_KY_CHOI_TIEP");
                    }
                    break;
                case cmd.Code.UPDATE_OWNER_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng UPDATE_OWNER_ROOM");
                    }
                    break;
                case cmd.Code.NOTIFY_KICK_FROM_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedKickOff(data);
                        cc.log("Lieng ReceivedKickOff res : ", JSON.stringify(res));
                    }
                    break;
                case cmd.Code.NOTIFY_USER_GET_JACKPOT:
                    {
                        App.instance.showLoading(false);
                        cc.log("Lieng NOTIFY_USER_GET_JACKPOT");
                    }
                    break;
                case cmd.Code.CHAT_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChatRoom(data);
                        cc.log("Lieng CHAT_ROOM res : ", JSON.stringify(res));

                        // {
                        //     "chair": 0,
                        //     "isIcon": true,
                        //     "content": "6",
                        //     "nickname": "chaoae99"
                        //   }

                        // {
                        //     "chair": 0,
                        //     "isIcon": false,
                        //     "content": "lalal",
                        //     "nickname": "chaoae99"
                        //   }

                        let chair = res["chair"];
                        let isIcon = res["isIcon"];
                        let content = res["content"];
                        if (isIcon) {
                            // Chat Icon
                            let seatId = this.findPlayerSeatByPos(chair);
                            if (seatId != -1) {
                                this.getPlayerHouse(seatId).showChatEmotion(content);
                            }
                        } else {
                            // Chat Msg
                            let seatId = this.findPlayerSeatByPos(chair);
                            if (seatId != -1) {
                                this.getPlayerHouse(seatId).showChatMsg(content);
                            }
                        }
                    }
                    break;
                case CardGameCmd.Code.GET_INFO_INVITE: {
                    let res = new CardGameCmd.ReceivedGetInfoInvite(data);
                    cc.log(res);
                    this.showPopupInvite(res);
                    break;
                }
                case CardGameCmd.Code.INVITE: {
                    let res = new CardGameCmd.ReceivedInvite(data);
                    cc.log(res);
                    this.showPopupAcceptInvite(res);
                    break;
                }
                default:
                    cc.log("Lieng Unknown --inpacket.getCmdId(): " + inpacket.getCmdId());
                    break;
            }
        }, this);
    }

    // request
    actionLeaveRoom() {
        cc.log("Lieng actionLeaveRoom");
        LiengNetworkClient.getInstance().send(new cmd.CmdSendRequestLeaveGame());
    }

    actionOpenCard() {
        cc.log("Lieng actionOpenCard");
        LiengNetworkClient.getInstance().send(new cmd.SendShowCard());
        this.btnOpenCard.active = false;
    }

    actionLatBai() {
        // Lat 2/3 la bai
        cc.log("Lieng actionLatBai arrBaiLat : ", this.arrBaiLat);
        if (this.arrBaiLat.length > 0 && this.arrBaiLat.length < 3) {
            let arrCardsOpen = [];
            for (let index = 0; index < this.arrBaiLat.length; index++) {
                arrCardsOpen.push(this.currentCard[this.arrBaiLat[index]]);
            }
            cc.log("Lieng actionLatBai currentCard : ", this.currentCard);
            cc.log("Lieng actionLatBai arrCardsOpen : ", arrCardsOpen);
            LiengNetworkClient.getInstance().send(new cmd.CmdSendLatBai(arrCardsOpen));
            this.popupLatBai.active = false;
            this.btnLatBai.active = false;
        }
    }

    actionSendVaoGa() {
        cc.log("Lieng actionSendVaoGa");

    }

    increaseBetValue() {
        if (this.currentBetSelectedIndex == (this.arrBetValue.length - 1)) {

        } else {
            this.currentBetSelectedIndex += 1;
        }

        this.betChooseValueTarget.y = this.arrBetPos[this.currentBetSelectedIndex];
    }

    decreaseBetValue() {
        if (this.currentBetSelectedIndex == 0) {

        } else {
            this.currentBetSelectedIndex -= 1;
        }

        this.betChooseValueTarget.y = this.arrBetPos[this.currentBetSelectedIndex];
    }

    actionAll_In() {
        cc.log("Lieng actionAll_In");
        this.btnBet.active = false;
        LiengNetworkClient.getInstance().send(new cmd.SendTakeTurn(0, 0, 0, 1, 0));
    }

    actionRaise() {
        cc.log("Lieng actionRaise");
        this.btnBet.active = false;
        this.FxDealer.setAnimation(0, "cho", true);
        let rawMeGold = this.getPlayerHouse(0).userGold.string.replace(/\./g, "");
        let currentMeMoney = parseInt(rawMeGold);
        cc.log("Lieng actionRaise currentMeMoney : ", currentMeMoney);
        cc.log("Lieng actionRaise arrBetValue : ", this.arrBetValue);
        cc.log("Lieng actionRaise currentBetSelectedIndex : ", this.currentBetSelectedIndex);
        let betValue = Math.min(this.arrBetValue[this.currentBetSelectedIndex], currentMeMoney);
        // let betValue = Math.min(this.currentRaiseValue - this.currentMeBet, currentMeMoney);
        cc.log("Lieng actionRaise betValue : ", betValue);
        LiengNetworkClient.getInstance().send(new cmd.SendTakeTurn(0, 0, 0, 0, betValue));
    }

    actionCheck() {
        cc.log("Lieng actionCheck");
        this.btnBet.active = false;
        this.FxDealer.setAnimation(0, "cho", true);
        LiengNetworkClient.getInstance().send(new cmd.SendTakeTurn(0, 1, 0, 0, 0));

    }

    actionCall() {
        cc.log("Lieng actionCall");
        this.btnBet.active = false;
        this.FxDealer.setAnimation(0, "cho", true);
        LiengNetworkClient.getInstance().send(new cmd.SendTakeTurn(0, 0, 1, 0, 0));

    }

    actionFold() {
        cc.log("Lieng actionFold");
        this.btnBet.active = false;
        this.btnLatBai.active = false;
        this.FxDealer.setAnimation(0, "cho", true);
        LiengNetworkClient.getInstance().send(new cmd.SendTakeTurn(1, 0, 0, 0, 0));
    }

    actionBuyIn() {
        cc.log("Lieng actionBuyIn");
        cc.log("Lieng input : ", this.edtBuyIn.string);
        let event = this.edtBuyIn.string;
        if (event.length > 0) {
            var rawNumber = "";
            for (let index = 0; index < event.length; index++) {
                if (event[index] == "0"
                    || event[index] == "1"
                    || event[index] == "2"
                    || event[index] == "3"
                    || event[index] == "4"
                    || event[index] == "5"
                    || event[index] == "6"
                    || event[index] == "7"
                    || event[index] == "8"
                    || event[index] == "9") {
                    rawNumber += event[index];
                }
            }
            cc.log("Lieng actionBuyIn rawNumber : ", rawNumber);
            if (rawNumber !== "") {
                if (Configs.Login.Coin < this.maxCashIn) {
                    this.maxCashIn = Configs.Login.Coin;
                }

                if (parseInt(rawNumber) < this.minCashIn * this.currentRoomBet) {
                    App.instance.alertDialog.showMsg("Số tiền Buy In phải lớn hơn " + Utils.formatNumber(this.minCashIn * this.currentRoomBet));
                    return;
                }

                if (parseInt(rawNumber) > this.maxCashIn * this.currentRoomBet) {
                    App.instance.alertDialog.showMsg("Số tiền Buy In phải nhỏ hơn " + Utils.formatNumber(this.maxCashIn * this.currentRoomBet));
                    return;
                }
                cc.log("Lieng actionBuyIn Cash In : ", parseInt(rawNumber));
                if (this.toggleAutoBuyIn.isChecked) {
                    LiengNetworkClient.getInstance().send(new cmd.SendBuyIn(parseInt(rawNumber), 1));
                } else {
                    LiengNetworkClient.getInstance().send(new cmd.SendBuyIn(parseInt(rawNumber), 0));
                }
                App.instance.showLoading(true);
                this.closePopupBuyIn();
            } else {
                App.instance.alertDialog.showMsg("Số tiền không hợp lệ.");
            }
        }
    }

    // State
    initConfigPlayer() {
        configPlayer = [];
        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            configPlayer.push({
                seatId: index,
                playerId: -1,
                playerPos: -1,
                isViewer: true
            });
        }
        cc.log("Lieng configPlayer : ", configPlayer);
    }

    resetPlayersPlaying() {
        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            this.getPlayerHouse(index).resetMatchHistory();
        }
    }

    resetAllPlayerCountdown() {
        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            this.getPlayerHouse(index).hidePlayCountdown();
        }
    }

    checkIsAnh(arrCards) {
        // J, Q, K - Q, Q, K
        for (let index = 0; index < arrCards.length; index++) {
            let score = CardUtils.getDiemById(arrCards[index]);
            if (score < 11) {
                return false;
            }
        }
        return true;
    }

    checkIsLieng(arrCards) {
        let arrScore = [];
        for (let index = 0; index < arrCards.length; index++) {
            let score = CardUtils.getDiemById(arrCards[index]);
            arrScore.push(score);
        }
        cc.log("Lieng checkIsLieng arrScore 1 : ", arrScore);
        arrScore.sort((a, b) => a - b);
        cc.log("Lieng checkIsLieng arrScore 2 : ", arrScore);
        if (arrScore[0] == 1 && arrScore[1] == 12 && arrScore[2] == 13) { // Ace
            return true;
        } else {
            if (arrScore[1] == (arrScore[0] + 1) && arrScore[2] == (arrScore[0] + 2)) {
                return true;
            } else {
                return false;
            }
        }
    }

    checkIsSap(arrCards) {
        let score = CardUtils.getDiemById(arrCards[0]);
        for (let index = 1; index < arrCards.length; index++) {
            if (score !== CardUtils.getDiemById(arrCards[index])) {
                return false;
            }
        }
        return true;
    }

    // handle Game Players
    getCardsName(arrCards) {
        if (this.checkIsSap(arrCards)) {
            let score = CardUtils.getDiemById(arrCards[0]);
            if (score == 1) {
                return "Sáp Át";
            } else if (score == 11) {
                return "Sáp J";
            } else if (score == 12) {
                return "Sáp Q";
            } else if (score == 13) {
                return "Sáp K";
            } else {
                return ("Sáp " + score);
            }
        } else if (this.checkIsLieng(arrCards)) {
            return "Liêng";
        } else if (this.checkIsAnh(arrCards)) {
            return "Ảnh";
        } else {
            let totalScore = 0;
            for (let index = 0; index < arrCards.length; index++) {
                let score = CardUtils.getDiemById(arrCards[index]);
                if (score < 10) {
                    totalScore += score;
                }
            }
            let finalScore = totalScore % 10;
            if (finalScore == 0) {
                return "0 Nước";
            } else if (finalScore == 1) {
                return "1 Tịt";
            } else {
                return finalScore + " Nước";
            }
        }
    }

    setupSeatPlayer(seatId, playerInfo) {
        cc.log("Lieng setupSeatPlayer playerInfo : ", playerInfo);
        configPlayer[seatId].playerId = playerInfo.nickName;
        this.getPlayerHouse(seatId).setAvatar(playerInfo.avatar);
        this.getPlayerHouse(seatId).setName(playerInfo.nickName);
        this.getPlayerHouse(seatId).setGold(playerInfo.currentMoney);
    }

    findPlayerSeatByUid(uid) {
        let seat = -1;
        for (let index = 0; index < configPlayer.length; index++) {
            if (configPlayer[index].playerId === uid) {
                seat = configPlayer[index].seatId;
            }
        }
        return seat;
    }

    findPlayerPosBySeat(seat) {
        return configPlayer[seat].playerPos;
    }

    findPlayerSeatByPos(pos) {
        if (pos == -1) {
            return -1;
        }

        let seat = -1;
        for (let index = 0; index < configPlayer.length; index++) {
            if (configPlayer[index].playerPos === pos) {
                seat = configPlayer[index].seatId;
            }
        }
        return seat;
    }

    getPlayerHouse(seatId) {
        return this.groupPlayers.children[seatId].getComponent("Lieng.Player");
    }

    getNumPlayers() {
        cc.log("playerPosEntry configPlayer : ", configPlayer);
        var playerPosEntry = [];
        for (let index = 0; index < configPlayer.length; index++) {
            cc.log("playerPosEntry playerId : ", configPlayer[index].playerId);
            cc.log("playerPosEntry isViewer : ", configPlayer[index].isViewer);
            cc.log("-------------------------------------");
            if (configPlayer[index].playerId !== -1 && !configPlayer[index].isViewer) {
                playerPosEntry.push(configPlayer[index].seatId);
                cc.log("playerPosEntry seatId : ", configPlayer[index].seatId);
            }
        }
        cc.log("playerPosEntry : ", playerPosEntry);
        return playerPosEntry;
    }

    update(dt) {

    }

    actComming() {
        App.instance.alertDialog.showMsg(Configs.LANG.COOMING_SOON);
    }

    actShowBackPanel() {
        if (this.panelBack.active)
            if (this.panelBack.getNumberOfRunningActions() == 0) {
                this.actHideBackPanel();
                return;
            } else {
                return;
            }

        this.panelBack.stopAllActions();
        this.panelBack.active = true;
        this.panelBack.x = -this.panelBack.width;
        // this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(0, this.panelBack.y)), cc.callFunc(() => {

        // })));
        this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-Configs.App.DEVICE_RESOLUTION.width/2 + this.panelBack.width, this.panelBack.y)), cc.callFunc(() => {

        })));
    }

    actHideBackPanel() {
        if (this.panelBack.getNumberOfRunningActions() > 0)
            return;

        this.panelBack.stopAllActions();
        this.panelBack.x = 0;
        // this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-this.panelBack.width, this.panelBack.y)), cc.callFunc(() => {
        //     this.panelBack.active = false;
        // })));
        this.panelBack.active = false;
    }

    actSetting() {
        this.showToast(Configs.LANG.COOMING_SOON);
    }

    showToast(message: string, delay: number = 2) {
        this.labelToast.string = message;
        this.toast.stopAllActions();
        this.toast.active = true;
        this.toast.opacity = 255;
        // this.toast.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(delay), cc.fadeOut(0.2), cc.callFunc(() => {
        //     this.toast.active = false;
        // })));

        this.toast.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.toast.height/2)
        );

        this.scheduleOnce(() => {
            if(this.toast) {
                // hna add
                this.toast.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - this.toast
                    .height/2 + 120)
                );
                // end
                // this.notifier.active = false; // hna comment
            }
        }, 3);
    }

    onInviteClick() {
        LiengNetworkClient.getInstance().send(new CardGameCmd.SendGetInfoInvite());
    }

    showPopupInvite(inviteData: CardGameCmd.ReceivedGetInfoInvite) {
        if(!inviteData.listUserName) {
            this.showToast("Không tìm thấy người chơi phù hợp");
            return;
        }
        if(inviteData.listUserName.length == 0) {
            this.showToast("Không tìm thấy người chơi phù hợp");
            return;
        }

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
                LiengNetworkClient.getInstance().send(new CardGameCmd.SendInvite(listNickNames));
            });
        });
    }

    showPopupAcceptInvite(acceptData: CardGameCmd.ReceivedInvite) {
        PopupAcceptInvite.createAndShow(this.popups, () => {
            PopupAcceptInvite.instance.reloadData(acceptData.inviter, acceptData.bet);

            PopupAcceptInvite.instance.setListener(() => {
                LiengNetworkClient.getInstance().send(new CardGameCmd.SendAcceptInvite(acceptData.inviter));
            });
        }, "Liêng");
    }
}
