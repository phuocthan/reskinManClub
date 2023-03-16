import Utils from "../../../scripts/common/Utils";
import Player from "./TienLen.Player"
import Card from "./TienLen.Card";
import TienLenNetworkClient from "../../../scripts/networks/TienLenNetworkClient";
import TienLenCmd from "./TienLen.Cmd";
import TienLenConstant from "./TienLen.Constant";
import Room from "./TienLen.Room";
import CardGroup from "./TienLen.CardGoup";
import Res from "./TienLen.Res";
import PopupInvite from "../../../CardGames/src/invite/CardGame.PopupInvite";
import CardGameCmd from "../../../scripts/networks/CardGame.Cmd";
import PopupAcceptInvite from "../../../CardGames/src/invite/CardGame.PopupAcceptInvite";
import Configs from "../../../scripts/common/Configs";
import TienLenHelper from "./TienLen.Helper";
import CardGame_BickerController from "../../../CardGames/src/popupBicker/CardGame.BickerController";

const { ccclass, property } = cc._decorator;

@ccclass
export default class InGame extends cc.Component {
    public static instance: InGame = null;

    public static readonly TYPE_TOI_TRANG = 1;
    public static readonly TYPE_VICTORY = 2;

    @property(cc.Label)
    lbRoomId: cc.Label = null;
    @property(cc.Label)
    lbRoomBet: cc.Label = null;
    @property(Player)
    players: Player[] = [];
    @property(cc.Label)
    lbTimeCountDown: cc.Label = null;
    @property(cc.SpriteFrame)
    cards: cc.SpriteFrame[] = [];
    @property(cc.Node)
    cardLine: cc.Node = null;
    @property(cc.Prefab)
    cardItem: cc.Prefab = null;
    @property(cc.Node)
    board: cc.Node = null;
    @property(cc.Node)
    btnsInGame: cc.Node = null;
    @property(cc.Label)
    lblToast: cc.Label = null;

    @property(cc.Node)
    popups: cc.Node = null;
    @property(cc.Node)
    UI_Chat: cc.Node = null;
    @property(cc.EditBox)
    edtChatInput: cc.EditBox = null;

    @property(cc.Node)
    effect: cc.Node = null;
    @property(cc.Node)
    effectBg: cc.Node = null;
    @property(cc.Sprite)
    effectSprite: cc.Sprite = null;
    @property(sp.Skeleton)
    effectVictory: sp.Skeleton = null;

    @property(cc.Node)
    popupGuide: cc.Node = null;

    @property(cc.Node)
    panelBack: cc.Node = null;

    @property(cc.SpriteFrame)
    effectSpriteFrames: cc.SpriteFrame[] = [];

    @property(cc.Node)
    bickerPopup: cc.Node = null;

    @property(cc.Node)
    bickerCanon: cc.Node = null;

    cardsOnHand = {};
    buttons = {};
    myChair = 0;
    sortBySuit = true;
    currTurnCards = [];
    checkTurn = false;

    countDown = null;

    isPlaying = false;

    cardsOnBoard: Card[] = [];

    onLoad() {
        InGame.instance = this;
        this.initRes();
    }

    initRes() {
        this.btnsInGame.children.forEach(btn => {
            this.buttons[btn.name] = btn;
        });
    }

    public show(isShow: boolean, roomInfo = null) {
        if (isShow) {
            this.node.active = true;
            this.panelBack.active = false;
            this.cleanCardLine();
            this.cleanCardsOnBoard();
            this.cleanCardsOnHand();
            for (let index = 0; index < TienLenConstant.Config.MAX_PLAYER; index++) {
                this.players[index].setLeaveRoom();
                this.players[index].unsetWatching();
                this.players[index].setTimeRemain();
            }
            this.setRoomInfo(roomInfo);

            if (PopupAcceptInvite.instance && PopupAcceptInvite.instance.node && PopupAcceptInvite.instance.node.active) {
                PopupAcceptInvite.instance.dismiss();
            }
        } else {
            this.node.active = false;

            this.lblToast.node.parent.active = false;
            this.lbTimeCountDown.node.parent.active = false;

            this.lblToast.node.parent.stopAllActions();
            this.lbTimeCountDown.node.parent.stopAllActions();
        }
    }

    actLeaveRoom() {
        TienLenNetworkClient.getInstance().send(new TienLenCmd.SendRequestLeaveGame());

        if (this.isPlaying) {
            this.showToast("Vui lòng chờ hết ván để thoát game!");
        } else {
            this.showToast("Đã đăng ký rời bàn");
        }
    }

    setRoomInfo(room) {
        this.lbRoomId.string = room.roomId;
        this.lbRoomBet.string = Utils.formatNumber(room.moneyBet);
        this.myChair = room.myChair;
        this.setPlayersInfo(room);


        let playersPos = [];
        for (let i = 0; i < this.players.length; i++) {
            playersPos.push(this.players[i].node.position);
        }
        CardGame_BickerController.getInstance().initBickerController(this.getGameId(), this.getNetWorkClient(), playersPos, this.myChair, this.getMaxPlayer());
        CardGame_BickerController.getInstance().linkBickerComponents(this.bickerPopup, this.bickerCanon);
    }

    setPlayersInfo(room) {
        for (let i = 0; i < room.playerInfos.length; i++) {
            let info = room.playerInfos[i];
            if (room.playerStatus[i] != 0) {
                let chair = this.convertChair(i);
                console.log("UPDATE_GAME_INFO: " + chair);
                let pl = this.players[chair];
                if (pl) {
                    pl.setPlayerInfo(info);
                    if (room.playerStatus[i] == 1) {
                        pl.setWatching();
                    }
                    if (chair > 0 && room.playerStatus[i] == 3) {
                        Res.getInstance().setOnLaBaiLoaded(() => {
                            pl.setFirstCard(Card.CARD_UP);
                        });
                    } else {
                        Res.getInstance().setOnLaBaiLoaded(() => {
                            pl.offFirstCard();
                        });
                    }
                }
            }
        }

        for (let i = 0; i < this.players.length; i++) {
            this.players[i].setOwner(false);
        }

        if (this.players[this.convertChair(room.roomOwner)]) {
            this.players[this.convertChair(room.roomOwner)].setOwner(true);
        }
    }

    updateGameInfo(data) {
        this.show(true, data);

        Res.getInstance().setOnLaBaiLoaded(() => {
            this.updateGameInfoCards(data);
        });
    }

    updateGameInfoCards(data) {
        this.setCardsOnHand(this.sortCards(data.cards));

        for (let i = 0; i < data.playerInfos.length; i++) {
            var info = data.playerInfos[i];
            if (data.playerStatus[i] != 0) {
                var chair = this.convertChair(i);
                var pl = this.players[chair];
                if (pl) {
                    if (chair === 0) {
                    } else {
                        pl.setCardRemain(info.cards);
                    }
                }
            }
        }
    }

    onUserJoinRoom(user) {
        if (user.uStatus != 0) {
            this.players[this.convertChair(user.uChair)].setPlayerInfo(user.info);
            if (user.uStatus == 1) {
                this.players[this.convertChair(user.uChair)].setWatching();
            }
        }
    }

    autoStart(autoInfo) {
        for (let index = 0; index < TienLenConstant.Config.MAX_PLAYER; index++) {
            this.players[index].unsetWatching();
            this.players[index].offFirstCard();
        }

        if (autoInfo.isAutoStart) {
            this.setTimeCountDown("Sẵn Sàng: ", autoInfo.autoStartTime);
            this.scheduleOnce(() => {
                this.isPlaying = true;
            }, autoInfo.autoStartTime);
        }
    }

    firstTurn(data) {
        this.cleanCardLine();

        for (let i = 0; i < data.cards.length; i++) {
            let card = data.cards[i];
            let pl = this.players[this.convertChair(i)]
            if (pl.active) {
                let pos = pl.node.convertToWorldSpaceAR(pl.card.node.position)
                pos = this.board.convertToNodeSpaceAR(pos);
                let cardItem = cc.instantiate(this.cardItem);
                cardItem.parent = this.board;
                cardItem.setScale(0.6, 0.6);
                cardItem.setPosition(cc.v2(0, 0));
                cardItem.getComponent(Card).setCardData(Card.CARD_UP);
                cardItem.runAction(cc.sequence(cc.delayTime(i * 0.15), cc.moveTo(0.25, pos), cc.callFunc(() => {
                    cardItem.getComponent(Card).flipScale(Card.CARD_UP, card, 0.6, 0.6);
                    this.scheduleOnce(() => {
                        pl.setFirstCard(card);
                        cardItem.removeFromParent();
                    }, Card.CARD_FLIP_DURATION);
                })));
            }
        }
    }

    chiaBai(data) {
        this.chiaBaiEffect(data);

        if (data.toiTrang > 0) {
            this.showEffect([], InGame.TYPE_TOI_TRANG);
        }
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].active) {
                this.players[i].offFirstCard();
                if (i > 0)
                    this.players[i].setCardRemain(data.cardSize);
            }
        }
        this.setActiveButtons(["bt_sort"], [true]);
    }

    chiaBaiEffect(data) {
        this.setCardsOnHand(this.sortCards(data.cards), true);

        for (let i = 1; i < this.players.length; i++) {
            let pl = this.players[i];

            if (pl.active) {
                let pos = pl.node.convertToWorldSpaceAR(pl.card.node.position)
                pos = this.board.convertToNodeSpaceAR(pos);

                for (let j = 0; j < 13; j++) {
                    let cardItem = cc.instantiate(this.cardItem);
                    cardItem.parent = this.board;
                    cardItem.setScale(0.6, 0.6);
                    cardItem.setPosition(cc.v2(0, 0));
                    cardItem.getComponent(Card).setCardData(Card.CARD_UP);
                    cardItem.runAction(cc.sequence(cc.delayTime(j * 0.07), cc.moveTo(0.25, pos).easing(cc.easeIn(2)), cc.callFunc(() => {
                        cardItem.removeFromParent();
                    })));
                }
            }
        }
    }

    changeTurn(turn) {
        this.clearPlayersTimeRemain();

        var chair = this.convertChair(turn.chair);
        console.log("changeTurn: " + chair + " time: " + turn.time);
        this.players[chair].setTimeRemain(turn.time);
        console.log("changeTurn: " + turn.chair + " : " + turn.chairLastTurn + " :: " + turn.newRound);
        if (chair == 0) {
            this.setActiveButtons(["bt_submit_turn", "bt_pass_turn"], [true, ((turn.chairLastTurn == turn.chair) || turn.newRound) ? false : true]);
            this.checkTurn = true;
        }
        if (turn.newRound) {
            this.cleanCardsOnBoard();
            this.currTurnCards = [];
            this.checkTurn = false;
        }
    }

    submitTurn(turn) {
        this.setActiveButtons(["bt_submit_turn", "bt_pass_turn"], [false, false]);
        this.players[0].setTimeRemain(0);
        var cards = this.sortCards(turn.cards);
        var cardHalf = (cards.length - 1) / 2;
        var ranX = Math.floor(Math.random() * 100) - 50;
        var ranY = Math.floor(Math.random() * 100) - 50;
        var chair = this.convertChair(turn.chair);
        var pl = this.players[chair];

        for (let i = 0; i < this.cardsOnBoard.length; i++) {
            if (this.cardsOnBoard[i] && this.cardsOnBoard[i].node) {
                this.cardsOnBoard[i].makeShadow();
            }
        }

        if (chair == 0) {
            for (let i = 0; i < cards.length; i++) {
                var cardIndex = cards[i];
                var _card = this.cardsOnHand[cardIndex];
                var pos = _card.parent.convertToWorldSpaceAR(_card.position)
                pos = this.board.convertToNodeSpaceAR(pos);
                _card.parent = this.board;
                _card.setPosition(pos);
                _card.runAction(cc.moveTo(0.2, cc.v2((i - cardHalf) * 30 + ranX, ranY)).easing(cc.easeIn(3)));
                _card.runAction(cc.scaleTo(0.2, 0.6, 0.6));
                delete this.cardsOnHand[cardIndex];

                this.cardsOnBoard.push(_card.getComponent(Card));
            }
        } else {
            var pos = pl.node.parent.convertToWorldSpaceAR(pl.node.position)
            pos = this.board.convertToNodeSpaceAR(pos);
            for (let i = 0; i < cards.length; i++) {
                var cardItem = cc.instantiate(this.cardItem);
                cardItem.parent = this.board;
                cardItem.setScale(0.6, 0.6);
                cardItem.setPosition(pos);
                cardItem.getComponent(Card).setCardData(cards[i]);
                cardItem.runAction(cc.spawn(cc.moveTo(0.3, cc.v2((i - cardHalf) * 30 + ranX, ranY)).easing(cc.easeIn(3)), cc.sequence(
                    cc.scaleTo(0.15, 1.1, 1.1),
                    cc.scaleTo(0.15, 0.6, 0.6)
                )));

                this.cardsOnBoard.push(cardItem.getComponent(Card));
            }
            pl.setCardRemain(turn.numberCard);
            this.currTurnCards = cards;
        }
    }

    passTurn(turn) {
        this.players[this.convertChair(turn.chair)].setStatus("Bỏ lượt");
        this.setActiveButtons(["bt_submit_turn", "bt_pass_turn"], [false, false]);
        this.players[0].setTimeRemain(0);
    }

    actSubmitTurn() {
        var cardSelected = [];
        this.cardLine.children.forEach(card => {
            var _card = card.getComponent(Card);
            if (_card.isSelected)
                cardSelected.push(_card.getCardIndex());
        });
        this.sendSubmitTurn(cardSelected);

        this.checkTurn = false;
    }

    sendSubmitTurn(cardSelected) {
        TienLenNetworkClient.getInstance().send(new TienLenCmd.SendDanhBai(!1, cardSelected));
    }

    actPassTurn() {
        this.sendPassTurn();

        this.checkTurn = false;
    }

    sendPassTurn() {
        TienLenNetworkClient.getInstance().send(new TienLenCmd.SendBoLuot(!0));
    }

    sortCards(cards) {
        cards = CardGroup.indexsToCards(cards);
        var _cards = [];
        if (this.sortBySuit)
            _cards = new CardGroup(cards).getOrderedBySuit();
        else
            _cards = CardGroup.sortCards(cards);
        return CardGroup.cardsToIndexs(_cards);
    }

    actSort() {
        this.sortBySuit = !this.sortBySuit;
        var cards = this.getCardsOnHand();
        cards = this.sortCards(cards);
        this.sortCardsOnHand(cards);
        this.setToggleCardsOnHand();
    }

    setCardsOnHand(cards, isEffect: boolean = false) {
        let spacing = this.cardLine.getComponent(cc.Layout).spacingX;

        if (isEffect) {
            this.cardLine.getComponent(cc.Layout).enabled = false;
            this.scheduleOnce(() => {
                this.cardLine.getComponent(cc.Layout).enabled = true;
            }, cards.length * 0.07 + 0.25 + 0.5);
        }

        cards.forEach((card, index) => {
            let cardItem = cc.instantiate(this.cardItem);
            cardItem.parent = this.cardLine;

            if (isEffect) {
                cardItem.getComponent(Card).setCardData(Card.CARD_UP);
                cardItem.setScale(0.6, 0.6);
                cardItem.setPosition(this.cardLine.convertToNodeSpaceAR(this.board.parent.convertToWorldSpaceAR(this.board.position)));
                cardItem.runAction(cc.sequence(cc.delayTime(index * 0.07), cc.spawn(cc.scaleTo(0.25, 1), cc.moveTo(0.25, cc.v2(spacing * 6 - index * spacing, 0)).easing(cc.easeIn(2)))));

                this.scheduleOnce(() => {
                    cardItem.getComponent(Card).flip(Card.CARD_UP, card, this.onCardSelectCallback.bind(this));
                }, cards.length * 0.07 + 0.25);
            } else {
                cardItem.getComponent(Card).setCardData(card, this.onCardSelectCallback.bind(this));
            }
            this.cardsOnHand[card] = cardItem;
        });
    }

    onCardSelectCallback(card) {
        if (this.currTurnCards
            && this.currTurnCards.length == 1
            && this.currTurnCards[0].card >= 48) //1 la khac 2
        {
            this.setToggleCardsOnHand();
            this.setToggleCardsOnHand([card]);
        } else
            this.checkSuggestion(card);
    }

    checkSuggestion(data) {
        data = CardGroup.indexToCard(data);
        var cardsOnHand = CardGroup.indexsToCards(this.getCardsOnHand());
        var turnCards = CardGroup.indexsToCards(this.currTurnCards);
        var suggestionCards;
        if (this.checkTurn)
            suggestionCards = new CardGroup(cardsOnHand).getSuggestionCards(turnCards, data, () => {
                let tmp = new Array();
                for (var key in this.cardsOnHand) {
                    let tmpCard = this.cardsOnHand[key].getComponent(Card);
                    if (tmpCard.isSelected) {
                        tmp.push(tmpCard);
                    }
                }
                return new CardGroup(cardsOnHand).getSuggestionNoCards(tmp, data, true);
            });
        else {
            let tmp = new Array();
            for (var key in this.cardsOnHand) {
                let tmpCard = this.cardsOnHand[key].getComponent(Card);
                if (tmpCard.isSelected) {
                    tmp.push(tmpCard);
                }
            }
            suggestionCards = new CardGroup(cardsOnHand).getSuggestionNoCards(tmp, data);
        }
        if (suggestionCards) {
            for (let i = 0; i < suggestionCards.length; i++) {
                for (let j = 0; j < suggestionCards[i].length; j++) {
                    if (CardGroup.cardToIndex(data) == CardGroup.cardToIndex(suggestionCards[i][j])) {
                        this.setToggleCardsOnHand(CardGroup.cardsToIndexs(suggestionCards[i]));
                    }
                }
            }
        }
    }

    getCardsOnHand() {
        var cards = [];
        for (var key in this.cardsOnHand) {
            cards.push(this.cardsOnHand[key].getComponent(Card).getCardIndex());
        }
        return cards;
    }

    cleanCardsOnHand() {
        for (var key in this.cardsOnHand)
            delete this.cardsOnHand[key];
    }

    cleanCardsOnBoard() {
        this.board.removeAllChildren();
        this.cardsOnBoard = [];
    }

    setToggleCardsOnHand(cards = null) {
        if (cards === null) {
            for (var key in this.cardsOnHand) {
                this.cardsOnHand[key].getComponent(Card).deSelect();
            }
        } else {
            for (var key in this.cardsOnHand) {
                this.cardsOnHand[key].getComponent(Card).deSelect();
            }
            for (let i = 0; i < cards.length; i++) {
                this.cardsOnHand[cards[i]].getComponent(Card).select();
            }
        }
    }

    sortCardsOnHand(cards) {
        for (let i = 0; i < cards.length; i++) {
            var index = cards[i];
            this.cardsOnHand[index].setSiblingIndex(i);
        }
    }

    cleanCardLine() {
        this.cardLine.removeAllChildren();

        for (let i = 1; i < this.players.length; i++) {
            this.players[i].clearCardLine();
        }
    }

    setActiveButtons(btnNames, actives) {
        for (let i = 0; i < btnNames.length; i++) {
            this.buttons[btnNames[i]].active = actives[i];
        }
    }

    endGame(data) {
        this.clearPlayersTimeRemain();

        var coinChanges = data.ketQuaTinhTienList;
        for (let i = 0; i < coinChanges.length; i++) {
            var chair = this.convertChair(i);
            if (i < TienLenConstant.Config.MAX_PLAYER) {
                this.players[chair].setAnimThangThua(coinChanges[i]);
                this.players[chair].setCoin(data.currentMoney[i]);
                if (chair == 0) {
                    Configs.Login.Coin = data.currentMoney[i];
                    if (coinChanges[i] > 0) {
                        this.showEffect([], InGame.TYPE_VICTORY);
                    }
                }
            }
        }
        for (let i = 0; i < data.cards.length; i++) {
            var chair = this.convertChair(i);
            if (chair != 0) {
                this.players[chair].setCardLine(data.cards[i]);
                this.players[chair].setCardRemain(0);
            }
        }
        this.setActiveButtons(["bt_sort"], [false]);
        cc.log("TTTTTTTTTT Sam 1 : ", data.countDown);
        if (data.countDown == 0) {
            cc.log("TTTTTTTTTT Sam");
            this.setTimeCountDown("Chuẩn bị sang ván mới: ", 10, () => {
                for (let index = 0; index < TienLenConstant.Config.MAX_PLAYER; index++) {
                    this.players[index].unsetWatching();
                    this.isPlaying = false;
                }
            });
            this.scheduleOnce(() => {
                this.clearPlayerCards();
            }, 5);
        } else {
            cc.log("TTTTTTTTTT TLMN");
            this.setTimeCountDown("Chuẩn bị sang ván mới: ", data.countDown - 2, () => {
                for (let index = 0; index < TienLenConstant.Config.MAX_PLAYER; index++) {
                    this.players[index].unsetWatching();
                    this.isPlaying = false;
                }
            });
            this.scheduleOnce(() => {
                this.clearPlayerCards();
            }, 9);
        }
        TienLenNetworkClient.getInstance().send(new TienLenCmd.SendReadyAutoStart());
    }

    updateMatch(data) {

    }

    userLeaveRoom(data) {
        var chair = this.convertChair(data.chair);
        this.players[chair].setLeaveRoom();
        if (chair == 0) {
            this.show(false);
            Room.instance.show(true);
            Room.instance.refreshRoom();

            this.bickerPopup.removeAllChildren(true);
            this.bickerCanon.removeAllChildren(true);
        } else {
            CardGame_BickerController.getInstance().isNeedHide(chair);
        }
    }

    convertChair(a) {
        return (a - this.myChair + 4) % 4;
    }

    showToast(message: string, delay: number = 2) {
        this.lblToast.string = message;
        let parent = this.lblToast.node.parent;
        parent.stopAllActions();
        parent.active = true;
        parent.opacity = 255;

        // hna comment
        // parent.runAction(cc.sequence(cc.fadeIn(0.1), cc.delayTime(delay), cc.fadeOut(0.2), cc.callFunc(() => {
        //     parent.active = false;
        // })));
        // end
        parent.runAction(
            cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent.height/2)
        );

        this.scheduleOnce(() => {
            if(parent) {
                // hna add
                parent.runAction(
                    cc.moveTo(0.5, 0, Configs.App.DEVICE_RESOLUTION.height/2 - parent
                    .height/2 + 120)
                );
                // end
                // this.notifier.active = false; // hna comment
            }
        }, 3);
    }

    onInviteClick() {
        this.getNetWorkClient().send(new CardGameCmd.SendGetInfoInvite());
    }

    showPopupInvite(inviteData: CardGameCmd.ReceivedGetInfoInvite) {
        if (!inviteData.listUserName) {
            this.showToast("Không tìm thấy người chơi phù hợp");
            return;
        }
        if (inviteData.listUserName.length == 0) {
            this.showToast("Không tìm thấy người chơi phù hợp");
            return;
        }


        PopupInvite.createAndShow(this.popups, () => {
            let dataList = [];
            for (var i = 0; i < inviteData.listUserName.length; i++) {
                dataList.push({
                    name: inviteData.listUserName[i],
                    coin: inviteData.listUserMoney[i],
                    isCheck: true,
                    dataSet: dataList
                });
            }
            PopupInvite.instance.reloadData(dataList);

            PopupInvite.instance.setListener((listNickNames) => {
                this.getNetWorkClient().send(new CardGameCmd.SendInvite(listNickNames));
            });
        });
    }

    showPopupAcceptInvite(acceptData: CardGameCmd.ReceivedInvite) {
        PopupAcceptInvite.createAndShow(this.popups, () => {
            PopupAcceptInvite.instance.reloadData(acceptData.inviter, acceptData.bet);

            PopupAcceptInvite.instance.setListener(() => {
                this.getNetWorkClient().send(new CardGameCmd.SendAcceptInvite(acceptData.inviter));
            });
        }, "Tiến Lên Miền Nam");
    }

    showUIChat() {
        this.UI_Chat.active = true;
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width / 2, this.UI_Chat.y)
        );
    }

    closeUIChat() {
        this.UI_Chat.runAction(
            cc.moveTo(0.5, Configs.App.DEVICE_RESOLUTION.width / 2 + this.UI_Chat.width + 150, this.UI_Chat.y)
        );
    }

    chatEmotion(event, id) {
        cc.log("BaCay chatEmotion id : ", id);
        this.getNetWorkClient().send(new CardGameCmd.SendChatRoom(1, id));
        this.closeUIChat();
    }

    chatMsg() {
        if (this.edtChatInput.string.trim().length > 0) {
            this.getNetWorkClient().send(new CardGameCmd.SendChatRoom(0, this.edtChatInput.string));
            this.edtChatInput.string = "";
            this.closeUIChat();
        }
    }

    sendSampleMsg(event, msg) {
        this.getNetWorkClient().send(new CardGameCmd.SendChatRoom(0, msg));
        this.closeUIChat();
    }

    getNetWorkClient() {
        return TienLenNetworkClient.getInstance();
    }

    getGameId() {
        return Configs.GameId.TLMN;
    }

    getMaxPlayer() {
        return 4;
    }

    showEffect(cards: number[], type: number = null) {
        if (this.effect) {
            let isShowEffect = false;
            this.effect.active = true;
            this.effectVictory.node.active = false;
            this.effectBg.active = false;
            this.effectSprite.spriteFrame = null;

            let duration = 3;

            if (type) {
                if (type == InGame.TYPE_TOI_TRANG) {
                    this.effectBg.active = true;
                    this.effectSprite.spriteFrame = this.effectSpriteFrames[3];
                    isShowEffect = true;
                }

                if (type == InGame.TYPE_VICTORY) {
                    this.effectVictory.node.active = true;
                    isShowEffect = true;
                    duration = 5;
                }
            } else {
                if (TienLenHelper.kiemTraBonDoiThong(cards)) {
                    this.effectBg.active = true;
                    this.effectSprite.spriteFrame = this.effectSpriteFrames[1];
                    isShowEffect = true;
                }
                if (TienLenHelper.kiemTraBaDoiThong(cards)) {
                    this.effectBg.active = true;
                    this.effectSprite.spriteFrame = this.effectSpriteFrames[0];
                    isShowEffect = true;
                }
                if (TienLenHelper.kiemTraTuQuy(cards)) {
                    this.effectBg.active = true;
                    this.effectSprite.spriteFrame = this.effectSpriteFrames[2];
                    isShowEffect = true;
                }
            }

            let schedule = () => {
                if (this.effect) {
                    this.effectSprite.spriteFrame = null;
                    this.effectVictory.node.active = false;
                    this.effect.stopAllActions();
                    this.effect.active = false;
                }
            }

            console.log("TienLenHelper " + JSON.stringify(cards) + " : " + isShowEffect);
            this.unschedule(schedule);
            this.effect.stopAllActions();

            if (type != InGame.TYPE_VICTORY) {
                this.effect.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.2), cc.scaleTo(0.3, 1))));
            }

            if (isShowEffect) {
                this.scheduleOnce(schedule, duration);
            } else {
                this.effect.stopAllActions();
                this.effect.active = false;
            }
        }
    }

    showChatChong(chatchong: TienLenCmd.ReceivedChatChong) {
        let winChair = this.convertChair(chatchong.winChair);
        let loseChair = this.convertChair(chatchong.lostChair);

        console.log("setCoinChange: chairs " + chatchong.winChair + " : " + chatchong.lostChair);
        console.log("setCoinChange: chair " + winChair + " : " + loseChair);
        console.log("setCoinChange: money " + chatchong.winMoney + " : " + chatchong.lostMoney);

        if (this.players[winChair]) {
            this.players[winChair].setCoinChange(chatchong.winMoney);
            this.players[winChair].setCoin(chatchong.winCurrentMoney);

            this.scheduleOnce(() => {
                if (this.players[winChair]) {
                    this.players[winChair].cleanLabelCoinChange();
                }
            }, 5);
        }
        if (this.players[loseChair]) {
            this.players[loseChair].setCoinChange(chatchong.lostMoney);
            this.players[loseChair].setCoin(chatchong.lostCurrentMoney);

            this.scheduleOnce(() => {
                if (this.players[winChair]) {
                    this.players[loseChair].cleanLabelCoinChange();
                }
            }, 5);
        }
    }

    showGuide() {
        this.popupGuide.active = true;
    }

    hideGuide() {
        this.popupGuide.active = false;
    }

    clearPlayersTimeRemain() {
        this.players.forEach((p) => {
            if (p.node.active) {
                p.setTimeRemain();
            }
        });
    }

    clearPlayerCards() {
        this.cleanCardsOnHand();
        this.cleanCardLine();
        this.cleanCardsOnBoard();
        for (let index = 0; index < TienLenConstant.Config.MAX_PLAYER; index++) {
            this.players[index].cleanAnimThangThua();
            this.players[index].cleanLabelCoinChange();
        }
    }

    setTimeCountDown(msg, t, callback: Function = null) {
        this.lbTimeCountDown.string = msg + "" + t + "s";
        this.lbTimeCountDown.node.parent.active = true;
        clearInterval(this.countDown);
        this.countDown = setInterval(() => {
            t--;
            if (t < 0) {
                clearInterval(this.countDown);
                if (this.lbTimeCountDown) {
                    this.lbTimeCountDown.node.parent.active = false;
                }
                if (callback) {
                    callback();
                }
            } else {
                if (this.lbTimeCountDown) {
                    this.lbTimeCountDown.string = msg + "" + t + "s";
                }
            }
        }, 1000);
    }

    showBackPanel() {
        if (this.panelBack.active)
            if (this.panelBack.getNumberOfRunningActions() == 0) {
                this.hideBackPanel();
                return;
            } else {
                return;
            }

        this.panelBack.stopAllActions();
        this.panelBack.active = true;
        this.panelBack.x = -this.panelBack.width;
        this.panelBack.runAction(cc.sequence(cc.moveTo(0.5, cc.v2(-Configs.App.DEVICE_RESOLUTION.width/2 + this.panelBack.width, this.panelBack.y)), cc.callFunc(() => {

        })));
    }

    hideBackPanel() {
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

    onDestroy() {
        clearInterval(this.countDown);
    }

    actBicker(event, data) {
        CardGame_BickerController.getInstance().showPopupBicker(parseInt(data));
    }
}
