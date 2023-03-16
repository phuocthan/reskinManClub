import InPacket from "../../../../scripts/networks/Network.InPacket";
import SamNetworkClient from "../../../../scripts/networks/SamNetworkClient";
import CardGameCmd from "../../../../scripts/networks/CardGame.Cmd";
import SamCmd from "./Sam.Cmd";
import Tween from "../../../../scripts/common/Tween";
import Configs from "../../../../scripts/common/Configs";
import Utils from "../../../../scripts/common/Utils";
import App from "../../../../scripts/common/App";
import BroadcastReceiver from "../../../../scripts/common/BroadcastReceiver";
import InGame from "./Sam.InGame";
import SamInGame from "./Sam.InGame";
import FacebookTracking from "../../../../scripts/common/FacebookTracking";
import SamConstant from "./Sam.Constant";
import CardGame_BickerController from "../../../../CardGames/src/popupBicker/CardGame.BickerController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Room extends cc.Component {

    public static instance: Room = null;

    @property(cc.Node)
    roomContent: cc.Node = null;
    @property(cc.Prefab)
    roomItem: cc.Node = null;
    @property(cc.Node)
    ingameNode: cc.Node = null;
    @property(cc.Label)
    lbCoin: cc.Label = null;
    @property(cc.Label)
    lblNickname: cc.Label = null;
    @property(cc.Sprite)
    sprAvatar: cc.Sprite = null;
    @property(cc.Button)
    btnRefresh: cc.Button = null;

    private ingame: InGame = null;
    private listRoom = [];

    onLoad() {
        Room.instance = this;

        console.log("Scene Sam");

        this.ingame = this.ingameNode.getComponent(InGame);
        this.ingameNode.active = false;

        this.lbCoin.string = Utils.formatNumber(Configs.Login.Coin);
        BroadcastReceiver.register(BroadcastReceiver.USER_UPDATE_COIN, () => {
            this.lbCoin.string = Utils.formatNumber(Configs.Login.Coin);
        }, this);

        SamNetworkClient.getInstance().addOnClose(() => {
            this.actBack();
        }, this);

        this.lblNickname.string = Configs.Login.Nickname;
        this.sprAvatar.spriteFrame = App.instance.getAvatarSpriteFrame(Configs.Login.Avatar);
        this.sprAvatar.node.setContentSize(Configs.App.AVATAR_SIZE_SMALL);
    }

    start() {
        SamNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            let cmdId = inpacket.getCmdId();
            console.log("Sam cmd: ", cmdId);
            switch (cmdId) {
                case CardGameCmd.Code.MONEY_BET_CONFIG: {
                    let res = new CardGameCmd.ResMoneyBetConfig(data);
                    console.log("MONEY_BET_CONFIG SAM");
                    console.log(res);
                    this.listRoom = res.list;
                    this.initRooms(res.list);
                    break;
                }
                case CardGameCmd.Code.JOIN_ROOM_FAIL: {
                    let res = new CardGameCmd.ReceivedJoinRoomFail(data);
                    var e = "";
                    switch (res.error) {
                        case 1:
                            e = "L\u1ed7i ki\u1ec3m tra th\u00f4ng tin!";
                            break;
                        case 2:
                            e = "Kh\u00f4ng t\u00ecm \u0111\u01b0\u1ee3c ph\u00f2ng th\u00edch h\u1ee3p. Vui l\u00f2ng th\u1eed l\u1ea1i sau!";
                            break;
                        case 3:
                            e = "B\u1ea1n kh\u00f4ng \u0111\u1ee7 ti\u1ec1n v\u00e0o ph\u00f2ng ch\u01a1i n\u00e0y!";
                            break;
                        case 4:
                            e = "Kh\u00f4ng t\u00ecm \u0111\u01b0\u1ee3c ph\u00f2ng th\u00edch h\u1ee3p. Vui l\u00f2ng th\u1eed l\u1ea1i sau!";
                            break;
                        case 5:
                            e = "M\u1ed7i l\u1ea7n v\u00e0o ph\u00f2ng ph\u1ea3i c\u00e1ch nhau 10 gi\u00e2y!";
                            break;
                        case 6:
                            e = "H\u1ec7 th\u1ed1ng b\u1ea3o tr\u00ec!";
                            break;
                        case 7:
                            e = "Kh\u00f4ng t\u00ecm th\u1ea5y ph\u00f2ng ch\u01a1i!";
                            break;
                        case 8:
                            e = "M\u1eadt kh\u1ea9u ph\u00f2ng ch\u01a1i kh\u00f4ng \u0111\u00fang!";
                            break;
                        case 9:
                            e = "Ph\u00f2ng ch\u01a1i \u0111\u00e3 \u0111\u1ee7 ng\u01b0\u1eddi!";
                            break;
                        case 10:
                            e = "B\u1ea1n b\u1ecb ch\u1ee7 ph\u00f2ng kh\u00f4ng cho v\u00e0o b\u00e0n!"
                    }
                    App.instance.alertDialog.showMsg(e);
                    break;
                }
                case SamCmd.Code.JOIN_ROOM_SUCCESS: {
                    let res = new SamCmd.ReceivedJoinRoomSuccess(data);
                    cc.log(res);
                    this.show(false);
                    this.ingame.show(true, res);
                    break;
                }
                case SamCmd.Code.UPDATE_GAME_INFO: {
                    let res = new SamCmd.ReceivedUpdateGameInfo(data);
                    cc.log(res);
                    this.show(false);
                    this.ingame.updateGameInfo(res);
                    break;
                }
                case SamCmd.Code.AUTO_START: {
                    let res = new SamCmd.ReceivedAutoStart(data);
                    cc.log(res);
                    this.ingame.autoStart(res);

                    FacebookTracking.logCountSam();
                    break;
                }
                case SamCmd.Code.USER_JOIN_ROOM: {
                    let res = new SamCmd.ReceiveUserJoinRoom(data);
                    cc.log(res);
                    this.ingame.onUserJoinRoom(res);
                    break;
                }
                case SamCmd.Code.FIRST_TURN: {
                    let res = new SamCmd.ReceivedFirstTurnDecision(data);
                    cc.log(res);
                    this.ingame.firstTurn(res);
                    break;
                }
                case SamCmd.Code.CHIA_BAI: {
                    let res = new SamCmd.ReceivedChiaBai(data);
                    cc.log(res);
                    this.ingame.chiaBai(res)
                    break;
                }
                case SamCmd.Code.CHANGE_TURN: {
                    let res = new SamCmd.ReceivedChangeTurn(data);
                    cc.log("CHANGE_TURN: " + JSON.stringify(res));
                    this.ingame.changeTurn(res);
                    break;
                }
                case SamCmd.Code.DANH_BAI: {
                    let res = new SamCmd.ReceivedDanhBai(data);
                    cc.log(res);
                    this.ingame.submitTurn(res);
                    this.ingame.showEffect(res.cards);
                    break;
                }
                case SamCmd.Code.BO_LUOT: {
                    let res = new SamCmd.ReceivedBoluot(data);
                    cc.log(res);
                    this.ingame.passTurn(res);
                    break;
                }
                case SamCmd.Code.END_GAME: {
                    let res = new SamCmd.ReceivedEndGame(data);
                    cc.log(res);
                    this.ingame.endGame(res);
                    let wins = res.winTypes;
                    for(let i=0; i<wins.length; i++) {
                        if(wins[i] == 4) {
                            this.ingame.showEffect([], SamInGame.TYPE_CHAN_SAM);
                            break;
                        }
                        if(wins[i] == 6 || wins[i] == 7 || wins[i] == 8 || wins[i] == 9) {
                            this.ingame.showEffect([], SamInGame.TYPE_TOI_TRANG);
                            break;
                        }
                    }

                    var coinChanges = res.ketQuaTinhTienList;	
                    for (let i = 0; i < coinChanges.length; i++) {	
                        var chair = this.ingame.convertChair(i);	
                        if (i < SamConstant.Config.MAX_PLAYER) {
                            if (chair == 0) {	
                                let change = coinChanges[i];
                                if(change < 0) {
                                    FacebookTracking.betSamSuccess(Math.abs(change));
                                }	
                            }	
                        }
                    }
                    break;
                }
                case SamCmd.Code.UPDATE_MATCH: {
                    let res = new SamCmd.ReceivedUpdateMatch(data);
                    cc.log(res);
                    this.ingame.updateMatch(res);
                    break;
                }
                case SamCmd.Code.USER_LEAVE_ROOM: {
                    let res = new SamCmd.UserLeaveRoom(data);
                    cc.log(res);
                    this.ingame.userLeaveRoom(res);
                    break;
                }
                // case SamCmd.Code.RECONNECT_GAME_ROOM: {
                //     let res = new SamCmd.UserLeaveRoom(data);
                //     cc.log(res);
                //     this.ingame.userLeaveRoom(res);
                //     break;
                // }
                case SamCmd.Code.BAO_SAM: {
                    let res = new SamCmd.ReceiveBaoSam(data);
                    cc.log(res);
                    this.ingame.onBaoSam(res);
                    break;
                }
                case SamCmd.Code.HUY_BAO_SAM: {
                    let res = new SamCmd.ReceiveHuyBaoSam(data);
                    cc.log(res);
                    this.ingame.onHuyBaoSam(res);
                    break;
                }
                case SamCmd.Code.QUYET_DINH_SAM: {
                    let res = new SamCmd.ReceivedQuyetDinhSam(data);
                    cc.log(res);
                    this.ingame.onQuyetDinhSam(res);
                    if(res.isSam) {
                        this.ingame.showEffect([], SamInGame.TYPE_BAO_SAM);
                    }
                    break;
                }
                case CardGameCmd.Code.GET_INFO_INVITE: {
                    let res = new CardGameCmd.ReceivedGetInfoInvite(data);
                    cc.log(res);
                    this.ingame.showPopupInvite(res);
                    break;
                }
                case CardGameCmd.Code.INVITE: {
                    let res = new CardGameCmd.ReceivedInvite(data);
                    cc.log(res);
                    this.ingame.showPopupAcceptInvite(res);
                    break;
                }
                case CardGameCmd.Code.CHAT_ROOM:
                    {
                        App.instance.showLoading(false);
                        let res = new CardGameCmd.ReceivedChatRoom(data);
                        cc.log("BaCay CHAT_ROOM res : ", JSON.stringify(res));

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
                            let seatId = this.ingame.convertChair(chair);
                            if (seatId != -1) {
                                if(parseInt(content) < 20) {
                                    this.ingame.players[seatId].showChatEmotion(content);
                                } else {
                                    this.ingame.players[seatId].showChatSticker(content);
                                }
                            }
                        } else {
                            // Chat Msg
                            let seatId = this.ingame.convertChair(chair);
                            if (seatId != -1) {
                                if (content.substring(0, 11) == "chatBicker_") {
                                    let data = content.split("_")[1];
                                    let chat = JSON.parse(data);
                                    CardGame_BickerController.getInstance().handleChatBicker(chat);
                                } else {
                                    this.ingame.players[seatId].showChatMsg(content);
                                }
                            }
                        }
                    }
                    break;
            }
        }, this);

        console.log("Start Sam");

        //get list room
        this.refreshRoom();
    }

    initRooms(rooms: any[]) {
        this.btnRefresh.unscheduleAllCallbacks();

        this.roomContent.removeAllChildren();
        let names = ["San bằng tất cả", "Nhiều tiền thì vào", "Dân chơi", "Bàn cho đại gia", "Tứ quý", "Bốn đôi thông", "Tới trắng", "Chặt heo"];

        rooms.sort((a, b) => a.moneyBet - b.moneyBet);

        for (let i = 0; i < rooms.length; i++) {
            this.btnRefresh.scheduleOnce(() => {
                let room = rooms[i];
                var item = cc.instantiate(this.roomItem);
                item.getChildByName("lblId").getComponent(cc.Label).string = (i + 1).toString();
                item.getChildByName("lblName").getComponent(cc.Label).string = names[Utils.randomRangeInt(0, names.length)];
                var txts = item.getComponentsInChildren(cc.Label);
                Tween.numberTo(txts[2], room.moneyRequire, 0.3);
                Tween.numberTo(txts[3], room.moneyBet, 0.3);
                txts[4].string = room.nPersion + "/" + room.maxUserPerRoom;
                var progress = item.getChildByName("playersProgress").getComponent(cc.Sprite);
                progress.fillRange = room.nPersion / room.maxUserPerRoom;
                var btnJoin = item.getComponentInChildren(cc.Button);
                btnJoin.node.on(cc.Node.EventType.TOUCH_END, (event) => {
                    SamNetworkClient.getInstance().send(new CardGameCmd.SendJoinRoom(Configs.App.MONEY_TYPE, room.maxUserPerRoom, room.moneyBet, 0));
                });
                item.parent = this.roomContent;
                item.opacity = 0;
                item.runAction(cc.fadeIn(0.5));

                if(i == rooms.length - 1) {
                    this.btnRefresh.interactable = true;
                }
            }, i*0.05);
        }

        console.log("END INIT_ROOM");
    }

    actBack() {
        SamNetworkClient.getInstance().close();
        App.instance.loadScene("Lobby");
    }

    public show(isShow: boolean) {
        this.node.active = isShow;
        BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
    }

    refreshRoom() {
        SamNetworkClient.getInstance().send(new CardGameCmd.SendMoneyBetConfig());
        this.btnRefresh.interactable = false;
    }

    public actQuickPlay() {
        if (this.listRoom == null) {
            App.instance.alertDialog.showMsg("Không tìm thấy bàn nào phù hợp với bạn.");
            return;
        }
        //find all room bet < coin
        let listRoom = [];
        for (let i = 0; i < this.listRoom.length; i++) {
            if (this.listRoom[i].moneyRequire <= Configs.Login.Coin) {
                listRoom.push(this.listRoom[i]);
            }
        }
        if (listRoom.length <= 0) {
            App.instance.alertDialog.showMsg("Không tìm thấy bàn nào phù hợp với bạn.");
            return;
        }
        let randomIdx = Utils.randomRangeInt(0, listRoom.length);
        let room = listRoom[randomIdx];
        SamNetworkClient.getInstance().send(new CardGameCmd.SendJoinRoom(Configs.App.MONEY_TYPE, room.maxUserPerRoom, room.moneyBet, 0));
    }

    actComming() {
        App.instance.alertDialog.showMsg(Configs.LANG.COOMING_SOON);
    }
}