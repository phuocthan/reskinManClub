import BroadcastReceiver from "../../../scripts/common/BroadcastReceiver";
import Utils from "../../../scripts/common/Utils";

import App from "../../../scripts/common/App";
import InPacket from "../../../scripts/networks/Network.InPacket";
import cmdNetwork from "../../../scripts/networks/Network.Cmd";
import Configs from "../../../scripts/common/Configs";
import cmd from "./XiDzach.Cmd";

import XiDzachNetworkClient from "./XiDzach.NetworkClient";
import CardUtils from "./XiDzach.CardUtil";
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";
import PopupInvite from "../../../CardGames/src/invite/CardGame.PopupInvite";
import PopupAcceptInvite from "../../../CardGames/src/invite/CardGame.PopupAcceptInvite";
import FacebookTracking from "../../../scripts/common/FacebookTracking";

var configPlayer = [
    // {
    //     seatId: 0,
    //     playerId: -1,
    //     playerPos: -1,
    //     isViewer: true
    // }
];

// defaultPlayerPos[0 -> 7][0] = player_pos of me
let defaultPlayerPos = [
    [0, 1, 2, 3, 4, 5],
    [1, 2, 3, 4, 5, 0],
    [2, 3, 4, 5, 0, 1],
    [3, 4, 5, 0, 1, 2],
    [4, 5, 0, 1, 2, 3],
    [5, 0, 1, 2, 3, 4],
]

const { ccclass, property } = cc._decorator;

@ccclass
export default class XiDzachController extends cc.Component {

    public static instance: XiDzachController = null;

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
    cardsDeal: cc.Node = null;
    @property(cc.Node)
    btnNhaCai: cc.Node = null;
    @property(cc.Node)
    btnNhaCon: cc.Node = null;
    @property(cc.Button)
    btnLeaveRoom: cc.Button = null;
    @property(cc.Label)
    labelRoomId: cc.Label = null;
    @property(cc.Label)
    labelRoomBet: cc.Label = null;
    @property(cc.Node)
    actionBetting: cc.Node = null;
    @property(cc.Node)
    cardsRut: cc.Node = null;


    // Notify
    @property(cc.Node)
    notifyTimeStart: cc.Node = null;
    @property(cc.Node)
    notifyTimeEnd: cc.Node = null;
    @property(cc.Node)
    notifyHand: cc.Node = null;
    @property(cc.Node)
    notifyHand2: cc.Node = null;
    @property(cc.Label)
    labelBettingCountDown: cc.Label = null;

    // UI Chat
    @property(cc.Node)
    UI_Chat: cc.Node = null;
    @property(cc.EditBox)
    edtChatInput: cc.EditBox = null;

    @property(cc.Node)
    popupGuide: cc.Node = null;

    @property(cc.Node)
    popups: cc.Node = null;

    // Popup
    @property(cc.Node)
    toast: cc.Node = null;
    @property(cc.Label)
    labelToast: cc.Label = null;

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
    private intervalWaitting = null;
    private intervalEnd = null;
    private intervalBetting = null;

    private currentCard = null;
    private numCardOpened = 0;

    private timeoutEndGame = null;
    private timeoutBetting = null;
    private timeoutChiaBaiDone = null;

    gameHasXiDzach = null;
    seatXiDzachOrXiBang = null;
    isExistMeInfo = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        XiDzachController.instance = this;

        this.seatOwner = -1;
        this.seatXiDzachOrXiBang = -1;
        this.isExistMeInfo = true;
        this.currentCard = [];

        this.initConfigPlayer();
    }

    start() {
        this.showUIRooms();

        App.instance.showErrLoading("Đang kết nối tới server...");
        XiDzachNetworkClient.getInstance().addOnOpen(() => {
            App.instance.showErrLoading("Đang đăng nhập...");
            XiDzachNetworkClient.getInstance().send(new cmdNetwork.SendLogin(Configs.Login.Nickname, Configs.Login.AccessToken));
        }, this);
        XiDzachNetworkClient.getInstance().addOnClose(() => {
            App.instance.loadScene("Lobby");
        }, this);
        XiDzachNetworkClient.getInstance().connect();
    }

    // Request UI Room
    joinRoom(info) {
        cc.log("XiDzach joinRoom roomInfo : ", info);
        App.instance.showLoading(true);
        XiDzachNetworkClient.getInstance().send(new cmd.SendJoinRoomById(info["id"]));
    }

    refeshListRoom() {
        this.contentListRooms.removeAllChildren(true);
        XiDzachNetworkClient.getInstance().send(new cmd.SendGetListRoom());
    }

    findRoomId() {
        cc.log("XiDzach findRoomId id : ", this.edtFindRoom.string);
        let text = this.edtFindRoom.string.trim();
        if (text.length > 0) {
            let idFind = parseInt(text);
            for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
                let roomItem = this.contentListRooms.children[index].getComponent("XiDzach.ItemRoom");
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
                let roomItem = this.contentListRooms.children[index].getComponent("XiDzach.ItemRoom");
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
        this.UI_Playing.active = false;

        if (this.isInitedUIRoom) {
            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
        } else {
            this.isInitedUIRoom = true;
            this.sprAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
            this.sprAvatar.node.setContentSize(Configs.App.AVATAR_SIZE_SMALL);
            this.labelNickName.string = Configs.Login.Nickname;
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
        cc.log("XiDzach createRoom");
        // XiDzachNetworkClient.getInstance().send(new cmd.SendGetTopServer(1));
    }

    playingNow() {
        cc.log("XiDzach playingNow");
        let arrRoomOkMoney = [];
        for (let index = 0; index < this.contentListRooms.childrenCount; index++) {
            let roomItem = this.contentListRooms.children[index].getComponent("XiDzach.ItemRoom");
            if (roomItem.roomInfo["requiredMoney"] < Configs.Login.Coin) {
                arrRoomOkMoney.push(index);
            }
        }

        cc.log("XiDzach playingNow arrRoomOkMoney : ", arrRoomOkMoney);

        if (arrRoomOkMoney.length > 0) {
            let roomCrowed = arrRoomOkMoney[0];
            cc.log("XiDzach playingNow roomCrowed start : ", roomCrowed);
            for (let index = 0; index < arrRoomOkMoney.length; index++) {
                let roomItem = this.contentListRooms.children[arrRoomOkMoney[index]].getComponent("XiDzach.ItemRoom");
                let roomItemCrowed = this.contentListRooms.children[roomCrowed].getComponent("XiDzach.ItemRoom");
                cc.log("XiDzach playingNow ------------------------------------------");
                cc.log("XiDzach playingNow roomItem : ", roomItem.roomInfo["userCount"]);
                cc.log("XiDzach playingNow roomItemCrowed : ", roomItemCrowed.roomInfo["userCount"]);
                if (roomItem.roomInfo["userCount"] > roomItemCrowed.roomInfo["userCount"]) {
                    roomCrowed = arrRoomOkMoney[index];
                    cc.log("XiDzach playingNow roomCrowed update : ", roomCrowed);
                }
            }
            cc.log("XiDzach playingNow roomCrowed end : ", roomCrowed);
            let roomChoosed = this.contentListRooms.children[roomCrowed].getComponent("XiDzach.ItemRoom");
            cc.log("XiDzach playingNow roomCrowed end roomInfo : ", roomChoosed.roomInfo);
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
        cc.log("XiDzach chatEmotion id : ", id);
        XiDzachNetworkClient.getInstance().send(new cmd.SendChatRoom(1, id));
        this.closeUIChat();
    }

    chatMsg() {
        if (this.edtChatInput.string.trim().length > 0) {
            XiDzachNetworkClient.getInstance().send(new cmd.SendChatRoom(0, this.edtChatInput.string));
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
        XiDzachNetworkClient.getInstance().close();
        App.instance.loadScene("Lobby");
    }

    // Playing
    showUIPlaying() {
        this.UI_Playing.active = true;
        this.panelBack.active = false;
    }

    closeUIPlaying() {
        this.actionLeaveRoom();
    }

    setupMatch(data: cmd.ReceivedJoinRoomSucceed) {
        this.showUIPlaying();
        this.closeUIChat();

        cc.log("XiDzach setupMatch data : ", data);

        let chuongChair = data["chuongChair"];
        let hasChuong = data["hasChuong"];
        let countDownTime = data["countDownTime"];
        let gameAction = data["gameAction"];
        let gameId = data["gameId"];
        let moneyBet = data["moneyBet"];
        let moneyType = data["moneyType"];
        let myChair = data["myChair"];
        let playerInfos = data["playerInfos"];
        let playerSize = data["playerSize"];
        let playerStatus = data["playerStatus"];
        let roomId = data["roomId"];
        let rule = data["rule"];

        this.labelRoomId.string = "PHÒNG: " + roomId;
        this.labelRoomBet.string = "CƯỢC: " + Utils.formatNumber(moneyBet);

        this.currentRoomBet = moneyBet;
        this.gameHasXiDzach = false;
        this.gameState = gameAction;

        configPlayer[0].playerId = Configs.Login.Nickname;
        configPlayer[0].playerPos = myChair;
        cc.log("XiDzach setupMatch configPlayer Me : ", configPlayer[0]);


        var numPlayers = 0;
        var arrPlayerPosExist = [];
        var arrPlayerInfo = [];
        var arrPlayerStatus = [];

        for (let index = 0; index < playerInfos.length; index++) {
            if (playerInfos[index].nickName !== "") {
                numPlayers += 1;
                arrPlayerPosExist.push(index);
                arrPlayerInfo.push(playerInfos[index]);
                arrPlayerStatus.push(playerStatus[index]);
            }
        }
        cc.log("XiDzach numPlayers : ", numPlayers);

        // setup configPlayer
        for (let a = 0; a < configPlayer.length; a++) {
            configPlayer[a].playerPos = defaultPlayerPos[myChair][a];
        }

        cc.log("XiDzach setupMatch configPlayer  : ", JSON.stringify(configPlayer));
        cc.log("XiDzach setupMatch arrPlayerPosExist  : ", JSON.stringify(arrPlayerPosExist));
        cc.log("XiDzach setupMatch arrPlayerInfo  : ", JSON.stringify(arrPlayerInfo));
        cc.log("XiDzach setupMatch arrPlayerStatus  : ", JSON.stringify(arrPlayerStatus));

        // set State of Seat : Yes | No exist Player
        for (let index = 0; index < configPlayer.length; index++) {
            let findPos = arrPlayerPosExist.indexOf(configPlayer[index].playerPos);

            cc.log("XiDzach setupMatch find -------------- ");
            cc.log("XiDzach setupMatch find " + index + " : " + configPlayer[index].playerPos);
            var seatId = configPlayer[index].seatId;
            cc.log("XiDzach setupMatch find seatId ", seatId);
            this.getPlayerHouse(seatId).resetPlayerInfo();

            cc.log("XiDzach setupMatch find findPos ", findPos);
            if (findPos > -1) {
                // Exist player -> Set Player Info
                cc.log("XiDzach setupMatch find arrPlayerStatus[findPos] : ", arrPlayerStatus[findPos]);
                if (arrPlayerStatus[findPos] == cmd.Code.PLAYER_STATUS_SITTING || arrPlayerStatus[findPos] == cmd.Code.PLAYER_STATUS_PLAYING) {
                    configPlayer[index].isViewer = false;
                    this.getPlayerHouse(seatId).setIsViewer(false);
                } else {
                    configPlayer[index].isViewer = true;
                    this.getPlayerHouse(seatId).setIsViewer(true);
                    this.getPlayerHouse(seatId).playFxViewer();
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
        let seatOwner = this.findPlayerSeatByPos(chuongChair);
        if (seatOwner !== -1) {
            this.getPlayerHouse(seatOwner).setOwner(true);
            this.seatOwner = seatOwner;
        }

        cc.log("XiDzach setupMatch configPlayer : ", configPlayer);
    }


    // Time Start
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
    startBettingCountDown(turnTime, content) {
        cc.log("XiDzach startBettingCountDown turnTime : ", turnTime);
        this.timeBet = turnTime;
        this.actionBetting.active = true;
        this.labelBettingCountDown.string = content;
        // this.processBetting(1);
        this.processBetting(this.timeBet);
        this.unschedule(this.intervalBetting);
        this.schedule(this.intervalBetting = (delta: number) => {
            this.timeBet -= delta;
            // var rate = this.timeBet / turnTime;
            this.processBetting(this.timeBet);
            if (this.timeBet < 1) {
                this.unschedule(this.intervalBetting);
                this.actionBetting.active = false;
            }
        }, 0);
    }

    processBetting(rate) {
        cc.log("XiDzach processBetting rate : ", rate);
        // cc.log("XiDzach processBetting fillRange : ", this.actionBetting.children[1].getComponent(cc.Sprite).fillRange);
        this.actionBetting.children[1].getComponent(cc.Label).string = Math.floor(rate).toString();
    }

    // Open Me Card
    openMeCard(event, itemId) {
        // Open Me cards
        let cardPos = parseInt(itemId);
        cc.log("XiDzach openMeCard cardPos : ", cardPos);
        cc.log("XiDzach openMeCard currentCard : ", this.currentCard);

        this.getPlayerHouse(0).prepareCardReal(cardPos);
        let spriteCardId = CardUtils.getNormalId(this.currentCard[cardPos]);
        this.getPlayerHouse(0).transformToCardReal(cardPos, this.spriteCards[spriteCardId]);

        this.numCardOpened += 1;
        if (this.numCardOpened == 3) {
            this.btnNhaCai.active = true;
            this.btnNhaCon.active = false;

            this.getPlayerHouse(0).showCardName(this.getCardsScore(this.currentCard) + " Điểm");

            setTimeout(() => {
                this.getPlayerHouse(0).resetCardReady();
            }, 200);
        }
    }

    getCardsScore(arrCards) {
        /*
          Các lá bài: 2, 3, 4, 5, 6, 7, 8, 9, 10 thì số điểm tương ứng con số
          Các là bài: J, Q, K thì mỗi lá được 10 điểm

          Lá bài A: có thể tính theo: 1 lá A kẻ 11, 2 lá kẻ 10 ,có thể tính là 1 đối với 3 lá bài trên tay người chơi

          – Là bài Át (A) sẽ được tính như sau:
            + 1 Lá Át sẽ được tính là 10 hoặc 11.
            + 2 Lá Át trở lên sẽ được tính là Xì bàn.
            + 1 Lá Át với tổng số lượng bằng hoặc hơn 3 lá trong tay thì sẽ được tính là 1.
        */
        let score = 0;
        if (arrCards.length == 0) {
            return score;
        }

        let numAce = 0;
        for (let a = 0; a < arrCards.length; a++) {
            if (arrCards[a] < 4) {
                numAce += 1;
            }
        }

        if (arrCards.length < 3) {
            // + 1 Lá Át sẽ được tính là 10 hoặc 11.
            // + 2 Lá Át trở lên sẽ được tính là Xì bàn.  => case nay k xay ra o day (SoBai, KetThuc) vi 2 la At se notifyXiDzach truoc do r
            let scoreCard1 = CardUtils.getDiemById(arrCards[0]);
            let scoreCard2 = CardUtils.getDiemById(arrCards[1]);

            if (scoreCard1 == 1 || scoreCard1 > 10) {
                scoreCard1 = 10;
            }

            if (scoreCard2 == 1 || scoreCard2 > 10) {
                scoreCard2 = 10;
            }

            score = scoreCard1 + scoreCard2;
        } else {
            //  + 1 Lá Át với tổng số lượng bằng hoặc hơn 3 lá trong tay thì sẽ được tính là 1.
            for (let a = 0; a < arrCards.length; a++) {
                let scoreCard = CardUtils.getDiemById(arrCards[a]);
                if (scoreCard == 1) {  // Ace
                    if (numAce == 1) {
                        scoreCard = 1;
                    } else {
                        scoreCard = 10;  // Can check xem co the = 1 vi thay player van win : case Ngu Linh   6, 4, A, 5, A chang han, de 10 thi Quac, 1 thi dung
                    }
                } else {
                    if (scoreCard > 10) {
                        scoreCard = 10;
                    }
                }
                score += scoreCard;
            }
        }

        if (score < 16) {
            // Non
            score = -2;
        } else if (score <= 21) {
            // OK
            if (arrCards.length == 5) {
                return -3;  // Ngu Linh
            } else {

            }
        } else {
            // Quac
            score = -1;
        }
        return score;
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

    setCanRutBai(state) {
        this.cardsRut.getComponent(cc.Button).interactable = state;
    }

    // addListener
    setupListener() {
        XiDzachNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            switch (inpacket.getCmdId()) {
                case cmd.Code.LOGIN:
                    App.instance.showLoading(false);
                    this.refeshListRoom();
                    XiDzachNetworkClient.getInstance().send(new cmd.CmdReconnectRoom());
                    break;
                case cmd.Code.TOPSERVER:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedTopServer(data);
                        cc.log("XiDzach TOPSERVER res : ", JSON.stringify(res));

                        let rankType = res["rankType"];
                        let topDay_money = res["topDay_money"];
                        let topWeek_money = res["topWeek_money"];
                        let topMonth_money = res["topMonth_money"];


                    }
                    break;
                case cmd.Code.CMD_PINGPONG:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach CMD_PINGPONG");
                    }
                    break;
                case cmd.Code.CMD_JOIN_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach CMD_JOIN_ROOM");
                    }
                    break;
                case cmd.Code.CMD_RECONNECT_ROOM:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach CMD_RECONNECT_ROOM");
                    }
                    break;
                case cmd.Code.MONEY_BET_CONFIG:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach MONEY_BET_CONFIG");
                    }
                    break;
                case cmd.Code.JOIN_ROOM_FAIL:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedJoinRoomFail(data);
                        cc.log("XiDzach JOIN_ROOM_FAIL res : ", JSON.stringify(res));
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
                        let res = new cmd.ReceivedGetListRoom(data);
                        cc.log(res);
                        for (let i = 0; i < res.list.length; i++) {
                            let itemData = res.list[i];
                            let item = cc.instantiate(this.prefabItemRoom);
                            item.getComponent("XiDzach.ItemRoom").initItem(itemData);
                            this.contentListRooms.addChild(item);
                        }
                        this.scrollListRoom.scrollToTop(0.2);
                    }
                    break;
                case cmd.Code.JOIN_GAME_ROOM_BY_ID:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach JOIN_GAME_ROOM_BY_ID");
                    }
                    break;

                // ------------------------ Game ---------------------------     
                case cmd.Code.MO_BAI:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedMoBai(data);
                        cc.log("XiDzach ReceivedMoBai res : ", JSON.stringify(res));
                        // {
                        // "chairMoBai": 0,
                        // "cardSize": 3,
                        // "cards": [
                        //   19,
                        //   17,
                        //   32
                        // ]
                        // }

                        let chairMoBai = res["chairMoBai"];
                        let cards = res["cards"];

                        let seatId = this.findPlayerSeatByPos(chairMoBai);
                        if (seatId != -1 && seatId != 0) {
                            this.getPlayerHouse(seatId).prepareToTransform();
                            for (let a = 0; a < 3; a++) {
                                let spriteCardId = CardUtils.getNormalId(cards[a]);
                                this.getPlayerHouse(seatId).transformToCardReal(a, this.spriteCards[spriteCardId]);
                            }
                            this.getPlayerHouse(seatId).showCardName(this.getCardsScore(cards) + " Điểm");
                        }

                    }
                    break;
                case cmd.Code.BUY_IN:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach BUY_IN");

                    }
                    break;
                case cmd.Code.KET_THUC:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedEndGame(data);
                        cc.log("XiDzach ReceivedEndGame res : ", JSON.stringify(res));

                        // {
                        //     "playerStatusList": [3, 3, 3, 3, 0, 0],
                        //     "listCards": [
                        //         [20, 2, 12],
                        //         [37, 19, 25],
                        //         [24, 45],
                        //         [38, 31],
                        //         [],
                        //         []
                        //     ],
                        //     "tongTienThangThua": 1000,
                        //     "winMoneyList": [1960, -4000, 980, 980, 0, 0],
                        //     "currentMoneyList": [6865926, 7608458, 8352940, 369727, 0, 0],
                        //     "needShowWinLostMoney": [1, 1, 1, 1, 0, 0]
                        // }

                        this.unschedule(this.timeoutBetting);
                        this.unschedule(this.intervalBetting);
                        this.actionBetting.active = false;

                        let playerStatusList = res["playerStatusList"];
                        let listCards = res["listCards"];
                        let tongTienThangThua = res["tongTienThangThua"];
                        let winMoneyList = res["winMoneyList"];
                        let currentMoneyList = res["currentMoneyList"];
                        let needShowWinLostMoney = res["needShowWinLostMoney"];

                        this.btnNhaCon.active = false;
                        this.btnNhaCai.active = false;
                        this.notifyHand.active = false;
                        this.notifyHand2.active = false;
                        this.setCanRutBai(false);
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).hideFxCombineState(false);
                        }

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).showBtnXeBaiOne(false);
                        }

                        let isOwenWinAll = false;
                        let posPlaying = [];
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (needShowWinLostMoney[index] == 1) {
                                posPlaying.push(index);
                            }
                        }
                        cc.log("XiDzach ReceivedEndGame posPlaying : ", posPlaying);

                        if (posPlaying.length == 0) {
                            isOwenWinAll = true;
                            for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                                if (playerStatusList[index] > 0) {
                                    posPlaying.push(index);
                                }
                            }
                        }

                        if (!isOwenWinAll) {
                            for (let index = 0; index < posPlaying.length; index++) {
                                let seatIdHide = this.findPlayerSeatByPos(posPlaying[index]);
                                if (seatIdHide != -1) {
                                    this.getPlayerHouse(seatIdHide).hideFxWinLose();
                                }
                            }
                        }

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            let findId = posPlaying.indexOf(configPlayer[index].playerPos);
                            if (findId !== -1) {
                                cc.log("--------------------------------");
                                //     cc.log("playerId : ", configPlayer[index].playerId);
                                //     cc.log("listCards : ", listCards[posPlaying[findId]]);
                                //     cc.log("winMoneyList : ", winMoneyList[posPlaying[findId]]);
                                //     cc.log("currentMoneyList : ", currentMoneyList[posPlaying[findId]]);
                                //     cc.log("needShowWinLostMoney : ", needShowWinLostMoney[posPlaying[findId]]);

                                let cards = listCards[posPlaying[findId]];
                                let cardReady = this.getPlayerHouse(index).node.children[2].children[0];
                                // Each player has 5 cards but someone maybe not used.

                                if (cards.length > 0) {
                                    for (let a = 0; a < 5; a++) {
                                        if (a < cards.length) {
                                            // Use
                                            let spriteCardId = CardUtils.getNormalId(cards[a]);
                                            this.getPlayerHouse(index).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                        } else {
                                            // Hide
                                            this.getPlayerHouse(index).hideCardRealNow(a);
                                        }
                                    }
                                }

                                if (this.seatXiDzachOrXiBang != -1) {
                                    if (this.seatXiDzachOrXiBang != index) {
                                        let score = this.getCardsScore(cards);
                                        cc.log("XiDzach ReceivedEndGame getCardsScore : ", score);
                                        if (score == -2) {
                                            this.getPlayerHouse(index).hideCardName();
                                            this.getPlayerHouse(index).showFxSpecial(0);
                                        } else if (score == -1) {
                                            this.getPlayerHouse(index).hideCardName();
                                            this.getPlayerHouse(index).showFxSpecial(1);
                                        } else if (score == -3) {
                                            this.getPlayerHouse(index).hideCardName();
                                            this.getPlayerHouse(index).showFxSpecial(4);
                                        } else {
                                            this.getPlayerHouse(index).hideFxSpecial();
                                            this.getPlayerHouse(index).showCardName(score + " Điểm");
                                        }
                                    }
                                } else {
                                    let score = this.getCardsScore(cards);
                                    cc.log("XiDzach ReceivedEndGame getCardsScore : ", score);
                                    if (score == -2) {
                                        this.getPlayerHouse(index).hideCardName();
                                        this.getPlayerHouse(index).showFxSpecial(0);
                                    } else if (score == -1) {
                                        this.getPlayerHouse(index).hideCardName();
                                        this.getPlayerHouse(index).showFxSpecial(1);
                                    } else if (score == -3) {
                                        this.getPlayerHouse(index).hideCardName();
                                        this.getPlayerHouse(index).showFxSpecial(4);
                                    } else {
                                        if (!configPlayer[index].isViewer) {
                                            this.getPlayerHouse(index).hideFxSpecial();
                                            this.getPlayerHouse(index).showCardName(score + " Điểm");
                                        }
                                    }
                                }

                                if (index == 0) {
                                    Configs.Login.Coin = currentMoneyList[posPlaying[findId]];
                                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                                }

                                let info = {
                                    moneyChange: winMoneyList[posPlaying[findId]],
                                    money: currentMoneyList[posPlaying[findId]]
                                }

                                // neu van do ra Xi Dzach thi ket qua show o case Xi Dzach 1 lan r,
                                // tien + -, sang den case Ket_Thuc tat ca tien win = 0 het nen UI se hien 2 fx
                                if (!isOwenWinAll) {
                                    if (info.moneyChange >= 0) {
                                        // Win
                                        this.getPlayerHouse(index).fxWin(info);
                                    } else if (info.moneyChange < 0) {
                                        // Lose
                                        this.getPlayerHouse(index).fxLose(info);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.CHIA_BAI:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChiaBai(data);
                        cc.log("XiDzach ReceivedChiaBai res : ", JSON.stringify(res));

                        // {
                        //     "playerStatusList": [3, 3, 3, 3, 0, 0],
                        //     "sizeCard": 2,
                        //     "myCards": [41, 10],
                        //     "gameId": 1826,
                        //     "chuongChair": 3,
                        //     "timeChiaBai": 20
                        // }

                        let playerStatusList = res["playerStatusList"];
                        let sizeCard = res["sizeCard"];
                        let myCards = res["myCards"];
                        let gameId = res["gameId"];
                        let chuongChair = res["chuongChair"];
                        let timeChiaBai = res["timeChiaBai"];

                        this.btnNhaCon.active = false;
                        this.btnNhaCai.active = false;
                        this.cardsRut.active = false;

                        let seatOwner = this.findPlayerSeatByPos(chuongChair);
                        if (seatOwner !== -1) {
                            this.getPlayerHouse(seatOwner).setOwner(true);
                            this.seatOwner = seatOwner;
                        }

                        clearTimeout(this.timeoutBetting);
                        this.timeoutBetting = setTimeout(() => {
                            this.startBettingCountDown(timeChiaBai, "Nhà Con Rút Bài");
                        }, 2000);

                        this.currentCard = myCards;
                        cc.log("XiDzach ReceivedChiaBai currentCard : ", this.currentCard);

                        var arrSeatExist = this.getNumPlayers();
                        let numPlayer = arrSeatExist.length;

                        // Open | Hide cards not use
                        for (let index = 0; index < cmd.Code.MAX_PLAYER * 2; index++) { // 6 players * 2 cards
                            this.cardsDeal.children[index].active = index >= numPlayer * 2 ? false : true;
                            this.cardsDeal.children[index].position = cc.v2(0, 0);
                        }

                        let timeShip = 0.1; // 0.15
                        // Move Cards used to each player joined
                        for (let a = 0; a < 2; a++) { // players x 2 cards
                            for (let b = 0; b < numPlayer; b++) {
                                let seatId = arrSeatExist[b];
                                if (seatId !== -1) {
                                    let card4Me = this.cardsDeal.children[(a * numPlayer) + b];
                                    let rawPlayerPos = this.groupPlayers.children[seatId].position;
                                    cc.log("XiDzach CHIA_BAI delayTime : ", ((a * numPlayer) + b) * timeShip);
                                    card4Me.runAction(
                                        cc.sequence(
                                            cc.delayTime(((a * numPlayer) + b) * timeShip),
                                            cc.moveTo(0.2, rawPlayerPos)
                                        )
                                    );
                                }
                            }
                        }

                        let delayOver2Under = 0.2;
                        var maxDelay = ((2 * numPlayer) + (numPlayer - 1)) * timeShip; // ((a * numPlayer) + b) * timeShip
                        let timeUnderLayer = (maxDelay + 0.2 + delayOver2Under) * 1000;
                        cc.log("CHIA_BAI timeUnderLayer : ", timeUnderLayer);
                        clearTimeout(this.timeoutChiaBaiDone);
                        this.timeoutChiaBaiDone = setTimeout(() => {
                            for (let index = 0; index < cmd.Code.MAX_PLAYER * 2; index++) { // 6 players * 2 cards
                                cc.log("CHIA_BAI cardsDeal index : ", index);
                                this.cardsDeal.children[index].active = false;
                            }
                            for (let index = 0; index < numPlayer; index++) {
                                let seatId = arrSeatExist[index];
                                if (seatId !== -1) {
                                    // Drop layer
                                    if (seatId == 0) {
                                        this.getPlayerHouse(seatId).resetCardReady();
                                    }
                                    this.getPlayerHouse(seatId).showCardReady(true);
                                    this.getPlayerHouse(seatId).showCardReal(false);

                                    if (seatId != 0) {
                                        if (seatId != seatOwner) {
                                            this.getPlayerHouse(seatId).playFxDangXep();
                                        }
                                        for (let index = 2; index < 5; index++) { // Hide 5 cards
                                            this.getPlayerHouse(seatId).hideCardRealNow(index);
                                        }
                                    }
                                }
                            }
                            // Open Me cards
                            for (let a = 0; a < 2; a++) {
                                cc.log("XiDzach cardId : ", myCards[a]);
                                let spriteCardId = CardUtils.getNormalId(myCards[a]);
                                this.getPlayerHouse(0).prepareToTransform();
                                this.getPlayerHouse(0).transformToCardReal(a, this.spriteCards[spriteCardId]);
                            }
                            for (let index = 2; index < 5; index++) { // Hide 3 cards
                                this.getPlayerHouse(0).hideCardRealNow(index);
                            }
                            // let cardName = this.getCardsName(boBaiId);
                            // this.getPlayerHouse(0).showCardName(cardName);

                            let seatIdChuong = this.findPlayerSeatByPos(chuongChair);
                            if (seatIdChuong != -1) {
                                this.btnNhaCai.active = false;
                                this.btnNhaCon.active = seatIdChuong == 0 ? false : true;
                            } else {
                                this.btnNhaCai.active = false;
                                this.btnNhaCon.active = false;
                            }

                            if (myCards.length > 0) {
                                let score = this.getCardsScore(this.currentCard);
                                if (score == -2) {
                                    this.getPlayerHouse(0).hideCardName();
                                    this.getPlayerHouse(0).showFxSpecial(0);
                                } else if (score == -1) {
                                    this.getPlayerHouse(0).hideCardName();
                                    this.getPlayerHouse(0).showFxSpecial(1);
                                    this.setCanRutBai(false);
                                    this.notifyHand.active = false;
                                    this.notifyHand2.active = false;
                                } else if (score == -3) {
                                    this.getPlayerHouse(0).hideCardName();
                                    this.getPlayerHouse(0).showFxSpecial(4);
                                } else {
                                    this.getPlayerHouse(0).hideFxSpecial();
                                    this.getPlayerHouse(0).showCardName(score + " Điểm");
                                }
                            }
                        }, timeUnderLayer);
                    }
                    break;
                case cmd.Code.TU_DONG_BAT_DAU:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedAutoStart(data);
                        cc.log("XiDzach ReceiveAutoStart res : ", JSON.stringify(res));
                        // {
                        //     "isAutoStart": true,
                        //     "timeAutoStart": 5
                        // }
                        if (res.isAutoStart) {
                            this.startWaittingCountDown(res.timeAutoStart);
                            this.btnNhaCon.active = false;
                            this.btnNhaCai.active = false;

                            this.btnNhaCon.getComponent(cc.Button).interactable = true;

                            this.resetPlayersPlaying();
                            this.seatXiDzachOrXiBang = -1;
                            this.isExistMeInfo = true;
                            this.currentCard = [];
                        }

                        FacebookTracking.logCountXidzach();
                    }
                    break;
                case cmd.Code.THONG_TIN_BAN_CHOI:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedGameInfo(data);
                        cc.log("XiDzach ReceivedGameInfo res : ", JSON.stringify(res));

                        // {
                        //     "myChair": 2,
                        //     "chuongChair": 1,
                        //     "gameServerState": 2,
                        //     "isAutoStart": 1,
                        //     "gameAction": 0,
                        //     "countDownTime": 9,
                        //     "moneyType": 1,
                        //     "moneyBet": 1000,
                        //     "gameId": 84696,
                        //     "roomId": 1,
                        //     "playerStatusSize": 6,
                        //     "playerStatusList": [3, 3, 1, 3, 0, 0],
                        //     "playerInfoList": [[], [], [], [], [], []],
                        //     "cardPlayerList": [
                        //         [44, 8, 39],
                        //         [12, 34, 17],
                        //         [],
                        //         [32, 51],
                        //         [],
                        //         []
                        //     ]
                        // }

                        this.closeUIRoom();
                        this.showUIPlaying();
                        this.closeUIChat();

                        let myChair = res["myChair"];
                        let chuongChair = res["chuongChair"];
                        let gameServerState = res["gameServerState"];
                        let isAutoStart = res["isAutoStart"];
                        let gameAction = res["gameAction"];
                        let countDownTime = res["countDownTime"];
                        let moneyType = res["moneyType"];
                        let moneyBet = res["moneyBet"];
                        let gameId = res["gameId"];
                        let roomId = res["roomId"];
                        let playerStatusSize = res["playerStatusSize"];
                        let playerStatusList = res["playerStatusList"];
                        let playerInfoList = res["playerInfoList"];
                        let cardPlayerList = res["cardPlayerList"];

                        this.labelRoomId.string = "PHÒNG: " + roomId;
                        this.labelRoomBet.string = "CƯỢC: " + Utils.formatNumber(moneyBet);

                        if (playerInfoList[myChair].length == 0) {
                            this.isExistMeInfo = false;
                        } else {
                            this.isExistMeInfo = true;
                        }

                        this.currentRoomBet = moneyBet;
                        this.gameState = gameAction;
                        this.currentCard = cardPlayerList[myChair];

                        configPlayer[0].playerId = Configs.Login.Nickname;
                        configPlayer[0].playerPos = myChair;
                        cc.log("XiDzach setupMatch configPlayer Me : ", configPlayer[0]);
                        cc.log("XiDzach setupMatch configPlayer  : ", configPlayer);

                        var numPlayers = 0;
                        var arrPlayerPosExist = [];

                        for (let index = 0; index < playerStatusList.length; index++) {
                            if (playerStatusList[index] > 0) {
                                numPlayers += 1;
                                arrPlayerPosExist.push(index);
                            }
                        }

                        // for (let index = 0; index < playerInfoList.length; index++) {
                        //     if (playerInfoList[index] > 0) {
                        //         numPlayers += 1;
                        //         arrPlayerPosExist.push(index);
                        //     }
                        // }
                        cc.log("XiDzach numPlayers : ", numPlayers);

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
                                if (playerStatusList[findPos] == cmd.Code.PLAYER_STATUS_PLAYING) {
                                    this.getPlayerHouse(seatId).setIsViewer(false);
                                    this.getPlayerHouse(seatId).showCardReady(true);
                                    configPlayer[index].isViewer = false;
                                } else {
                                    this.getPlayerHouse(seatId).setIsViewer(true);
                                    this.getPlayerHouse(seatId).playFxViewer();
                                    configPlayer[index].isViewer = true;
                                }

                                this.setupSeatPlayer(seatId, {
                                    nickName: playerInfoList[findPos].nickName,
                                    avatar: playerInfoList[findPos].avatarUrl,
                                    money: playerInfoList[findPos].currentMoney
                                });
                            } else {
                                // Not Exist player  -> Active Btn Add player
                                this.getPlayerHouse(seatId).showBtnInvite(true);
                                configPlayer[index].isViewer = true;
                            }
                        }

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).setOwner(false);
                        }
                        let seatOwner = this.findPlayerSeatByPos(chuongChair);
                        if (seatOwner !== -1) {
                            this.getPlayerHouse(seatOwner).setOwner(true);
                            this.seatOwner = seatOwner;
                        }


                        // Open Me cards
                        if (this.currentCard.length > 0) {
                            this.getPlayerHouse(0).showCardReady(false);
                            for (let a = 0; a < 5; a++) {
                                if (a < this.currentCard.length) {
                                    // Use
                                    let spriteCardId = CardUtils.getNormalId(this.currentCard[a]);
                                    this.getPlayerHouse(0).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                } else {
                                    // Hide
                                    this.getPlayerHouse(0).hideCardRealNow(a);
                                }
                            }
                        }

                        if (seatOwner == 0) {
                            this.btnNhaCon.active = false;
                            this.btnNhaCai.active = true;

                            this.cardsRut.active = countDownTime > 0 ? true : false;
                            this.notifyHand.active = countDownTime > 0 ? true : false;
                            this.notifyHand2.active = countDownTime > 0 ? true : false;
                            this.setCanRutBai(countDownTime > 0 ? true : false);

                            if (countDownTime > 0) {
                                var arrSeatExist = this.getNumPlayers();
                                let numPlayer = arrSeatExist.length;
                                for (let index = 0; index < numPlayer; index++) {
                                    if (arrSeatExist[index] != -1 && arrSeatExist[index] != 0) {
                                        this.getPlayerHouse(arrSeatExist[index]).showBtnXeBaiOne(true);
                                    }
                                }
                            }
                        } else {
                            if (this.currentCard.length > 0) {
                                this.btnNhaCon.active = true;
                                this.btnNhaCai.active = false;

                                this.cardsRut.active = countDownTime > 0 ? true : false;
                                this.notifyHand.active = countDownTime > 0 ? true : false;
                                this.notifyHand2.active = countDownTime > 0 ? true : false;
                                this.setCanRutBai(countDownTime > 0 ? true : false);
                            } else {
                                this.btnNhaCon.active = false;
                                this.btnNhaCai.active = false;

                                this.cardsRut.active = false;
                                this.notifyHand.active = false;
                                this.notifyHand2.active = false;
                                this.setCanRutBai(false);
                            }
                        }


                    }
                    break;
                case cmd.Code.DANG_KY_THOAT_PHONG:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedNotifyRegOutRoom(data);
                        cc.log("XiDzach ReceivedNotifyRegOutRoom res : ", JSON.stringify(res));
                        // {
                        //     "outChair": 1,
                        //     "isOutRoom": true
                        //   }

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
                case cmd.Code.DOI_CHUONG:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedDoiChuong(data);
                        cc.log("XiDzach ReceivedDoiChuong res : ", JSON.stringify(res));
                        // {
                        //     "chuongChair": 2
                        //   }


                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            this.getPlayerHouse(index).setOwner(false);
                        }

                        let seatId = this.findPlayerSeatByPos(res["chuongChair"]);
                        if (seatId != -1) {
                            this.getPlayerHouse(seatId).setOwner(true);
                            this.seatOwner = seatId;
                        }
                    }
                    break;
                case cmd.Code.CHEAT_CARDS:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach CHEAT_CARDS");
                    }
                    break;
                case cmd.Code.DANG_KY_CHOI_TIEP:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach DANG_KY_CHOI_TIEP");
                    }
                    break;
                case cmd.Code.JOIN_ROOM_SUCCESS:
                    {
                        cc.log("XiDzach JOIN_ROOM_SUCCESS");
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedJoinRoomSucceed(data);
                        this.closeUIRoom();
                        this.setupMatch(res);
                    }
                    break;
                case cmd.Code.LEAVE_GAME:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUserLeaveRoom(data);
                        cc.log("XiDzach ReceivedUserLeaveRoom res : ", JSON.stringify(res));

                        // {
                        //     "chair": 1,
                        //     "nickName": "chaoae99"
                        //   }

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
                            }

                            if (seatId == 0) {
                                // Me leave
                                // Change UI
                                this.UI_Playing.active = false;
                                this.UI_ChooseRoom.active = true;
                                this.refeshListRoom();
                            }
                        }
                    }
                    break;
                case cmd.Code.NOTIFY_KICK_FROM_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedKickOff(data);
                        cc.log("XiDzach ReceivedKickOff res : ", JSON.stringify(res));
                    }
                    break;
                case cmd.Code.NEW_USER_JOIN:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUserJoinRoom(data);
                        cc.log("XiDzach ReceivedUserJoinRoom res : ", JSON.stringify(res));
                        // {
                        //     "info": {
                        //       "nickName": "Ahoang88",
                        //       "avatar": "7",
                        //       "money": 10230080
                        //     },
                        //     "uChair": 5,
                        //     "uStatus": 1
                        //   }

                        let info = res["info"];
                        let uChair = res["uChair"];
                        let uStatus = res["uStatus"];

                        // set State of Seat : Yes | No exist Player
                        for (let index = 0; index < configPlayer.length; index++) {
                            if (configPlayer[index].playerPos == uChair) {
                                // Exist player -> Set Player Info
                                var seatId = configPlayer[index].seatId;
                                this.getPlayerHouse(seatId).resetPlayerInfo();
                                var customPlayerInfo = {
                                    "avatar": info["avatar"],
                                    "nickName": info["nickName"],
                                    "money": info["money"],
                                }

                                this.setupSeatPlayer(seatId, customPlayerInfo);

                                if (uStatus == cmd.Code.PLAYER_STATUS_VIEWER) {
                                    configPlayer[seatId].isViewer = true;
                                    this.getPlayerHouse(seatId).setIsViewer(true);
                                    this.getPlayerHouse(seatId).playFxViewer();
                                } else {
                                    configPlayer[seatId].isViewer = false;
                                    this.getPlayerHouse(seatId).setIsViewer(false);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.NOTIFY_USER_GET_JACKPOT:
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach NOTIFY_USER_GET_JACKPOT");
                    }
                    break;
                case cmd.Code.UPDATE_MATCH:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedUpdateMatch(data);
                        cc.log("XiDzach ReceivedUpdateMatch res : ", JSON.stringify(res));

                        // {
                        //     "myChair": 2,
                        //     "hasInfo": [true, true, true, true, false, false],
                        //     "infos": [
                        //         {
                        //             "nickName": "Hoangbinh8288",
                        //             "avatar": "1",
                        //             "money": 6864666,
                        //             "status": 2
                        //         },
                        //         {
                        //             "nickName": "Helboy11239",
                        //             "avatar": "3",
                        //             "money": 7612458,
                        //             "status": 2
                        //         },
                        //         {
                        //             "nickName": "khachhang01",
                        //             "avatar": "0",
                        //             "money": 8351960,
                        //             "status": 2
                        //         },
                        //         {
                        //             "nickName": "girl_novolx",
                        //             "avatar": "0",
                        //             "money": 368747,
                        //             "status": 2
                        //         },
                        //         {},
                        //         {}
                        //     ]
                        // }

                        let myChair = res["myChair"];
                        let hasInfo = res["hasInfo"];
                        let infos = res["infos"];

                        cc.log("XiDzach setupMatch configPlayer : ", configPlayer);
                        // theo Pos khong phai SeatId
                        for (let index = 0; index < hasInfo.length; index++) {
                            let pos = configPlayer[index]["playerPos"];
                            if (hasInfo[pos]) {
                                // setGold se inactive isViewer nen dat no len dau de ben duoi config lai
                                this.getPlayerHouse(index).setGold(infos[pos]["money"]);
                                configPlayer[index]["playerId"] = infos[pos]["nickName"];
                                if (infos[pos]["status"] == cmd.Code.PLAYER_STATUS_SITTING || infos[pos]["status"] == cmd.Code.PLAYER_STATUS_PLAYING) {
                                    configPlayer[index]["isViewer"] = false;
                                    this.getPlayerHouse(index).setIsViewer(false);
                                } else {
                                    configPlayer[index]["isViewer"] = true;
                                    this.getPlayerHouse(index).setIsViewer(true);
                                    this.getPlayerHouse(index).playFxViewer();
                                }
                                this.setupSeatPlayer(index, infos[pos]);
                            } else {
                                configPlayer[index]["playerId"] = -1;
                                configPlayer[index]["isViewer"] = true;
                            }
                        }
                        cc.log("XiDzach setupMatch configPlayer : ", configPlayer);
                    }
                    break;
                case cmd.Code.CHAT_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChatRoom(data);
                        cc.log("XiDzach CHAT_ROOM res : ", JSON.stringify(res));

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
                case cmd.Code.NOTIFY_CHUYEN_GIAI_DOAN_2:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChuyenGiaiDoan2(data);
                        cc.log("XiDzach NOTIFY_CHUYEN_GIAI_DOAN_2 res : ", JSON.stringify(res));

                        // {
                        //     "countDownTime": 20
                        // }

                        if (this.seatXiDzachOrXiBang != -1) {   // co player xi dzach
                            if (this.seatXiDzachOrXiBang == 0) {  // Me
                                this.notifyHand.active = false;
                                this.notifyHand2.active = false;
                                this.btnNhaCon.active = false;
                                this.btnNhaCai.active = false;
                                this.setCanRutBai(false);
                                this.cardsRut.active = true;
                            } else {
                                if (this.seatXiDzachOrXiBang == this.seatOwner) {  // Owen
                                    this.notifyHand.active = false;
                                    this.notifyHand2.active = false;
                                    this.btnNhaCon.active = false;
                                    this.btnNhaCai.active = false;
                                    this.setCanRutBai(false);
                                    this.cardsRut.active = true;
                                } else {                                          // Other Players
                                    if(!configPlayer[0].isViewer){
                                        this.btnNhaCon.active = true;
                                        this.cardsRut.active = true;
                                        this.notifyHand.active = true;
                                        this.notifyHand2.active = true;
                                        this.setCanRutBai(true);
                                    }
                                    this.btnNhaCai.active = false;
                                }
                            }
                        } else {
                            // Normal game
                            if (this.isExistMeInfo) {
                                if (this.seatOwner == 0) {
                                    this.notifyHand.active = false;
                                    this.notifyHand2.active = false;
                                    this.btnNhaCon.active = false;
                                    this.btnNhaCai.active = false;
                                    this.setCanRutBai(false);
                                    this.cardsRut.active = true;
                                } else {
                                    if(!configPlayer[0].isViewer){
                                        this.btnNhaCon.active = true;
                                        this.cardsRut.active = true;
                                        this.notifyHand.active = true;
                                        this.notifyHand2.active = true;
                                        this.setCanRutBai(true);
                                    }
                                    this.btnNhaCai.active = false;
                                }
                            } else {           // Reconnect
                                this.notifyHand.active = false;
                                this.notifyHand2.active = false;
                                this.btnNhaCon.active = false;
                                this.btnNhaCai.active = false;
                                this.setCanRutBai(false);
                                this.cardsRut.active = true;
                            }
                        }
                    }
                    break;
                case cmd.Code.NOTIFY_CHUYEN_GIAI_DOAN_3:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedChuyenGiaiDoan3(data);
                        cc.log("XiDzach NOTIFY_CHUYEN_GIAI_DOAN_3 res : ", JSON.stringify(res));

                        // {
                        //     "countDownTime": 30,
                        //     "sizeCard": 2,
                        //     "chuongCards": [37, 19]
                        // }

                        let countDownTime = res["countDownTime"];
                        let sizeCard = res["sizeCard"];
                        let chuongCards = res["chuongCards"];

                        this.unschedule(this.timeoutBetting);
                        this.unschedule(this.intervalBetting);
                        this.startBettingCountDown(countDownTime, "Nhà Cái Rút Bài");

                        if (this.seatOwner != -1) {
                            for (let a = 0; a < 5; a++) {
                                if (a < chuongCards.length) {
                                    // Use
                                    let spriteCardId = CardUtils.getNormalId(chuongCards[a]);
                                    this.getPlayerHouse(this.seatOwner).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                } else {
                                    // Hide
                                    this.getPlayerHouse(this.seatOwner).hideCardRealNow(a);
                                }
                            }
                        }

                        if (this.seatOwner == 0) { // Me
                            this.cardsRut.active = true;
                            this.notifyHand.active = true;
                            this.notifyHand2.active = true;
                            this.setCanRutBai(true);
                            this.btnNhaCon.active = false;
                            this.btnNhaCai.active = true;

                            var arrSeatExist = this.getNumPlayers();
                            let numPlayer = arrSeatExist.length;
                            for (let index = 0; index < numPlayer; index++) {
                                if (arrSeatExist[index] != -1 && arrSeatExist[index] != 0) {
                                    this.getPlayerHouse(arrSeatExist[index]).showBtnXeBaiOne(true);
                                }
                            }
                        } else {
                            this.cardsRut.active = false;
                            this.notifyHand.active = false;
                            this.notifyHand2.active = false;
                            this.setCanRutBai(false);
                            this.btnNhaCon.active = false;
                            this.btnNhaCai.active = false;

                            this.getPlayerHouse(this.seatOwner).playFxDangXep();
                        }
                    }
                    break;
                case cmd.Code.RUT_BAI:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedRutCard(data);
                        cc.log("XiDzach RUT_BAI res : ", JSON.stringify(res));

                        // {
                        //     "chair": 0,
                        //     "card": 52
                        // }
                        let chair = res["chair"];
                        let card = res["card"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            if (seatId == 0) {
                                cc.log("XiDzach RUT_BAI me rut res : ", JSON.stringify(res));
                            }
                            let realCardId = this.getPlayerHouse(seatId).getRealCardCanUse();
                            if (chair == 0 && card == 0) {
                                // Khong The Rut Them Cards
                            } else {
                                // Co Player Rut Card Thanh Cong
                                if (card == 52) { // Thang khac rut, khong phai Me va Owen
                                    this.getPlayerHouse(seatId).openCardRealNow(realCardId, this.spriteCardBack);
                                } else {
                                    let spriteCardId = CardUtils.getNormalId(card);
                                    this.getPlayerHouse(seatId).openCardRealNow(realCardId, this.spriteCards[spriteCardId]);
                                    if (seatId == 0) {
                                        this.currentCard.push(card);
                                        let score = this.getCardsScore(this.currentCard);
                                        if (score == -2) {
                                            this.getPlayerHouse(0).hideCardName();
                                            this.getPlayerHouse(0).showFxSpecial(0);
                                        } else if (score == -1) {
                                            this.getPlayerHouse(0).hideCardName();
                                            this.getPlayerHouse(0).showFxSpecial(1);
                                            this.setCanRutBai(false);
                                            this.notifyHand.active = false;
                                            this.notifyHand2.active = false;
                                        } else if (score == -3) {
                                            this.getPlayerHouse(0).hideCardName();
                                            this.getPlayerHouse(0).showFxSpecial(4);
                                        } else {
                                            this.getPlayerHouse(0).hideFxSpecial();
                                            this.getPlayerHouse(0).showCardName(score + " Điểm");
                                        }
                                    }
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.DAN_BAI:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedDanBai(data);
                        cc.log("XiDzach DAN_BAI res : ", JSON.stringify(res));

                        // {
                        //     "chair": 3
                        // }
                        let chair = res["chair"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            let needShowDanBai = this.getPlayerHouse(seatId).checkNeedShowDanBai();
                            if (needShowDanBai) {
                                this.getPlayerHouse(seatId).playFxXepXong();
                            }
                            if (seatId == 0) {
                                cc.log("XiDzach DAN_BAI Me Dan Bai res : ", JSON.stringify(res));
                                this.btnNhaCon.active = false;
                                this.notifyHand.active = false;
                                this.notifyHand2.active = false;
                                this.setCanRutBai(false);
                            }
                        }
                    }
                    break;
                case cmd.Code.RUT_BAI_TU_DONG:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedRutBaiTuDong(data);
                        cc.log("XiDzach RUT_BAI_TU_DONG res : ", JSON.stringify(res));

                        // {
                        //     "chair": 0,
                        //     "cardSize": 2,
                        //     "cards": [1, 18]
                        // }

                        // Kha nang se bi bug bat dong bo khi mo la bai thu 2 tro di => co the can them delay

                        let chair = res["chair"];
                        let cardSize = res["cardSize"];
                        let cards = res["cards"];

                        let seatId = this.findPlayerSeatByPos(chair);
                        if (seatId != -1) {
                            for (let index = 0; index < cards.length; index++) {
                                let realCardId = this.getPlayerHouse(seatId).getRealCardCanUse();
                                let spriteCardId = CardUtils.getNormalId(cards[index]);
                                this.getPlayerHouse(seatId).openCardRealNow(realCardId, this.spriteCards[spriteCardId]);
                            }
                        }
                    }
                    break;
                case cmd.Code.SO_BAI:  // Nha Cai So Bai voi tung player qua btn Xet o tung player  (xetBaiOne)
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedSoBai(data);
                        cc.log("XiDzach SO_BAI res : ", JSON.stringify(res));
                        // {
                        //     "chair1": 2,
                        //     "chair2": 1,
                        //     "winMoney1": 1960,
                        //     "winMoney2": -2000,
                        //     "currentMoney1": 160166,
                        //     "currentMoney2": 5157202,
                        //     "hasCard1": 1,
                        //     "card1": [50, 26, 12],
                        //     "hasCard2": 1,
                        //     "card2": [4, 36, 20],
                        //     "cardSize1": 3,
                        //     "cardSize2": 3
                        // }


                        let chair1 = res["chair1"];
                        let chair2 = res["chair2"];
                        let winMoney1 = res["winMoney1"];
                        let winMoney2 = res["winMoney2"];
                        let currentMoney1 = res["currentMoney1"];
                        let currentMoney2 = res["currentMoney2"];
                        let hasCard1 = res["hasCard1"];
                        let card1 = res["card1"];
                        let hasCard2 = res["hasCard2"];
                        let card2 = res["card2"];
                        let cardSize1 = res["cardSize1"];
                        let cardSize2 = res["cardSize2"];

                        let seatId_1 = this.findPlayerSeatByPos(chair1);
                        let seatId_2 = this.findPlayerSeatByPos(chair2);

                        if (seatId_1 != -1 && seatId_2 != -1) {
                            this.getPlayerHouse(seatId_1).hideFxWinLose();
                            this.getPlayerHouse(seatId_2).hideFxWinLose();

                            if (seatId_1 == 0) {
                                Configs.Login.Coin = currentMoney1;
                                BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            }

                            if (seatId_2 == 0) {
                                Configs.Login.Coin = currentMoney2;
                                BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            }

                            if (winMoney1 > 0) { // win
                                this.getPlayerHouse(seatId_1).fxWin({ moneyChange: winMoney1, money: currentMoney1 })
                                this.getPlayerHouse(seatId_2).fxLose({ moneyChange: winMoney2, money: currentMoney2 })
                            } else if (winMoney1 < 0) { // lose
                                this.getPlayerHouse(seatId_1).fxLose({ moneyChange: winMoney1, money: currentMoney1 })
                                this.getPlayerHouse(seatId_2).fxWin({ moneyChange: winMoney2, money: currentMoney2 })
                            } else { // hoa
                                this.getPlayerHouse(seatId_1).fxWin({ moneyChange: winMoney1, money: currentMoney1 })
                                this.getPlayerHouse(seatId_2).fxWin({ moneyChange: winMoney2, money: currentMoney2 })
                            }

                            let score_1 = this.getCardsScore(card1);
                            cc.log("XiDzach ReceivedEndGame score_1 : ", card1);
                            if (score_1 == -2) {
                                this.getPlayerHouse(seatId_1).hideCardName();
                                this.getPlayerHouse(seatId_1).showFxSpecial(0);
                            } else if (score_1 == -1) {
                                this.getPlayerHouse(seatId_1).hideCardName();
                                this.getPlayerHouse(seatId_1).showFxSpecial(1);
                            } else if (score_1 == -3) {
                                this.getPlayerHouse(seatId_1).hideCardName();
                                this.getPlayerHouse(seatId_1).showFxSpecial(4);
                            } else {
                                this.getPlayerHouse(seatId_1).hideFxSpecial();
                                this.getPlayerHouse(seatId_1).showCardName(score_1 + " Điểm");
                            }


                            let score_2 = this.getCardsScore(card2);
                            cc.log("XiDzach ReceivedEndGame score_2 : ", card2);
                            if (score_2 == -2) {
                                this.getPlayerHouse(seatId_2).hideCardName();
                                this.getPlayerHouse(seatId_2).showFxSpecial(0);
                            } else if (score_2 == -1) {
                                this.getPlayerHouse(seatId_2).hideCardName();
                                this.getPlayerHouse(seatId_2).showFxSpecial(1);
                            } else if (score_2 == -3) {
                                this.getPlayerHouse(seatId_2).hideCardName();
                                this.getPlayerHouse(seatId_2).showFxSpecial(4);
                            } else {
                                this.getPlayerHouse(seatId_2).hideFxSpecial();
                                this.getPlayerHouse(seatId_2).showCardName(score_2 + " Điểm");
                            }

                            for (let a = 0; a < 5; a++) {
                                if (a < card1.length) {
                                    // Use
                                    let spriteCardId = CardUtils.getNormalId(card1[a]);
                                    this.getPlayerHouse(seatId_1).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                } else {
                                    // Hide
                                    this.getPlayerHouse(seatId_1).hideCardRealNow(a);
                                }
                            }

                            for (let a = 0; a < 5; a++) {
                                if (a < card2.length) {
                                    // Use
                                    let spriteCardId = CardUtils.getNormalId(card2[a]);
                                    this.getPlayerHouse(seatId_2).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                } else {
                                    // Hide
                                    this.getPlayerHouse(seatId_2).hideCardRealNow(a);
                                }
                            }
                        }
                    }
                    break;
                case cmd.Code.NOTIFY_NO_CHUONG:  // Khong co ai cam Chuong
                    {
                        App.instance.showLoading(false);
                        cc.log("XiDzach NOTIFY_NO_CHUONG ");
                    }
                    break;
                case cmd.Code.NOTIFY_XIZACH:
                    {
                        App.instance.showLoading(false);
                        let res = new cmd.ReceivedKetQuaXiZach(data);
                        cc.log("XiDzach NOTIFY_XIZACH res : ", JSON.stringify(res));

                        // Res Xi Dzach

                        // Player Xi Dzach => co card de show

                        // {
                        //     "needShowList": [1, 0, 1, 1, 0, 0],
                        //     "needUpdateMoneyList": [1, 1, 1, 1, 0, 0],
                        //     "currentMoneyList": [149086, 2864449, 2054356, 3739278, 0, 0],
                        //     "winMoneyList": [-3000, 8820, -3000, -3000, 0, 0],
                        //     "listCards": [
                        //         [50, 24],
                        //         [],
                        //         [35, 2],
                        //         [27, 13],
                        //         [],
                        //         []
                        //     ]
                        // }

                        // Nha Cai Xi Dzach  => k co cards de show
                        // {
                        //     "needShowList": [1, 1, 0, 1, 0, 0],
                        //     "needUpdateMoneyList": [1, 1, 1, 1, 0, 0],
                        //     "currentMoneyList": [85386, 1035978, 649817, 1756729, 0, 0],
                        //     "winMoneyList": [-3000, -3000, 8820, -3000, 0, 0],
                        //     "listCards": [
                        //         [4, 6],
                        //         [43, 28],
                        //         [],
                        //         [39, 29],
                        //         [],
                        //         []
                        //     ]
                        // }

                        // Res Xi Bang

                        // {
                        //     "needShowList": [1, 0, 0, 0, 0, 0],
                        //     "needUpdateMoneyList": [1, 1, 0, 0, 0, 0],
                        //     "currentMoneyList": [153906, 1891423, 2081776, 2766349, 0, 0],
                        //     "winMoneyList": [3920, -4000, 0, 0, 0, 0],
                        //     "listCards": [
                        //         [0, 3],
                        //         [],
                        //         [],
                        //         [],
                        //         [],
                        //         []
                        //     ]
                        // }

                        let needShowList = res["needShowList"];
                        let needUpdateMoneyList = res["needUpdateMoneyList"];
                        let listCards = res["listCards"];
                        let winMoneyList = res["winMoneyList"];
                        let currentMoneyList = res["currentMoneyList"];

                        let playerPosWin = -1;
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (winMoneyList[index] > 0) {
                                playerPosWin = index;
                            }
                        }

                        if (playerPosWin != -1) {
                            let seatIdWin = this.findPlayerSeatByPos(playerPosWin);
                            if (seatIdWin != -1) {
                                cc.log("XiDzach NOTIFY_XIZACH seatIdWin : ", seatIdWin);
                                this.seatXiDzachOrXiBang = seatIdWin;
                                if (seatIdWin == 0) {  // Me Win
                                    this.btnNhaCai.active = false;
                                    this.btnNhaCon.active = false;
                                    this.notifyHand.active = false;
                                    this.notifyHand2.active = false;
                                    this.setCanRutBai(false);
                                    cc.log("XiDzach NOTIFY_XIZACH Me XiDzach");
                                }
                                if (seatIdWin == this.seatOwner) { // Nha Cai Win => k co cards de show : ket_thuc moi co
                                    this.unschedule(this.intervalEnd);
                                    this.notifyTimeEnd.active = false;

                                    this.btnNhaCon.active = false;
                                    this.btnNhaCai.active = false;
                                    this.notifyHand.active = false;
                                    this.notifyHand2.active = false;
                                    this.setCanRutBai(false);
                                    cc.log("XiDzach NOTIFY_XIZACH Owen XiDzach");
                                } else {
                                    cc.log("XiDzach NOTIFY_XIZACH Other Player XiDzach");
                                }

                                this.getPlayerHouse(seatIdWin).hideFxCombineState(false);
                            }
                        }

                        let isXiDzach = true;

                        let playerNeedShowFind = needShowList.indexOf(1);
                        if (playerNeedShowFind > -1) {
                            let arrCardShow = listCards[playerNeedShowFind];
                            if (arrCardShow[0] < 4 && arrCardShow[1] < 4) {  // 2 la dau tien deu la A
                                isXiDzach = false;
                            }
                        }

                        let posPlaying = [];
                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            if (needUpdateMoneyList[index] == 1) {
                                posPlaying.push(index);
                            }
                        }
                        cc.log("XiDzach ReceivedEndGame posPlaying : ", posPlaying);

                        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
                            let findId = posPlaying.indexOf(configPlayer[index].playerPos);
                            if (findId !== -1) {
                                cc.log("--------------------------------");
                                let cards = listCards[posPlaying[findId]];
                                let cardReady = this.getPlayerHouse(index).node.children[2].children[0];
                                // Each player has 5 cards but someone maybe not used.

                                for (let a = 0; a < 5; a++) {
                                    if (a < cards.length) {
                                        // Use
                                        let spriteCardId = CardUtils.getNormalId(cards[a]);
                                        this.getPlayerHouse(index).openCardRealNow(a, this.spriteCards[spriteCardId]);
                                    } else {
                                        // Hide
                                        this.getPlayerHouse(index).hideCardRealNow(a);
                                    }
                                }

                                if (index == 0) {
                                    Configs.Login.Coin = currentMoneyList[posPlaying[findId]];
                                    BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                                }

                                let info = {
                                    moneyChange: winMoneyList[posPlaying[findId]],
                                    money: currentMoneyList[posPlaying[findId]]
                                }
                                if (info.moneyChange >= 0) {
                                    // Win
                                    this.getPlayerHouse(index).fxWin(info);
                                    this.getPlayerHouse(index).hideCardName();
                                    this.getPlayerHouse(index).showFxSpecial(isXiDzach ? 3 : 2);
                                } else {
                                    // Lose
                                    this.getPlayerHouse(index).fxLose(info);
                                    this.getPlayerHouse(index).hideCardName();
                                }
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
                    cc.log("--inpacket.getCmdId(): " + inpacket.getCmdId());
                    break;
            }
        }, this);
    }

    // request
    actionLeaveRoom() {
        XiDzachNetworkClient.getInstance().send(new cmd.CmdSendRequestLeaveGame());
    }

    actionOpenCard() {
        XiDzachNetworkClient.getInstance().send(new cmd.CmdSendMoBai());
        this.btnNhaCai.active = false;
    }

    actionBuyIn() {
        cc.log("XiDzach actionBuyIn");
    }

    actionDanBai() {
        XiDzachNetworkClient.getInstance().send(new cmd.sendDanBai());
    }

    actionRutBai() {
        XiDzachNetworkClient.getInstance().send(new cmd.sendRutBai());
    }

    // Xe Bai tung player
    actionXeBaiOne(event, data) {
        let seatId = parseInt(data);
        let playerPos = this.findPlayerPosBySeat(seatId);
        this.getPlayerHouse(seatId).showBtnXeBaiOne(false);
        XiDzachNetworkClient.getInstance().send(new cmd.sendXetBaiOne(playerPos));
    }

    actionXeBaiAll() {
        XiDzachNetworkClient.getInstance().send(new cmd.sendXetBaiAll());
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
        cc.log("XiDzach configPlayer : ", configPlayer);
    }

    resetPlayersPlaying() {
        for (let index = 0; index < cmd.Code.MAX_PLAYER; index++) {
            this.getPlayerHouse(index).resetMatchHistory();
        }
    }

    // handle Game Players
    setupSeatPlayer(seatId, playerInfo) {
        cc.log("XiDzach setupSeatPlayer playerInfo : ", playerInfo);
        configPlayer[seatId].playerId = playerInfo.nickName;
        this.getPlayerHouse(seatId).setAvatar(playerInfo.avatar);
        this.getPlayerHouse(seatId).setName(playerInfo.nickName);
        this.getPlayerHouse(seatId).setGold(playerInfo.money);
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
        return this.groupPlayers.children[seatId].getComponent("XiDzach.Player");
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

    update(dt) { }

    // handle Game Players
    getCardsName(boBaiId) {
        return "" + boBaiId;
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
        XiDzachNetworkClient.getInstance().send(new CardGameCmd.SendGetInfoInvite());
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
                XiDzachNetworkClient.getInstance().send(new CardGameCmd.SendInvite(listNickNames));
            });
        });
    }

    showPopupAcceptInvite(acceptData: CardGameCmd.ReceivedInvite) {
        PopupAcceptInvite.createAndShow(this.popups, () => {
            PopupAcceptInvite.instance.reloadData(acceptData.inviter, acceptData.bet);

            PopupAcceptInvite.instance.setListener(() => {
                XiDzachNetworkClient.getInstance().send(new CardGameCmd.SendAcceptInvite(acceptData.inviter));
            });
        }, "XiDzach");
    }
}
