import CardGameNetworkClient from "../../../scripts/networks/CardGameNetworkClient";
import CardGame_PopupBicker from "./CardGame.PopupBicker";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CardGame_BickerController {
    public static instance: CardGame_BickerController = null;
    public static getInstance() {
        if (CardGame_BickerController.instance == null) {
            CardGame_BickerController.instance = new CardGame_BickerController();
        }
        return CardGame_BickerController.instance;
    }

    gameId: number = null;
    networkClient: CardGameNetworkClient = null;
    playersPos: cc.Vec2[];
    myChair: number = 0;
    numPlayer: number = 0;
    currentSeadIdTarget: number = 0;

    popupBicker = null;
    canonBicker = null;
    prefabPopupBicker = null;
    prefabItemBicker = null;

    initBickerController(gameId: number, networkClient: CardGameNetworkClient, listPos: cc.Vec2[], myChair: number, num: number) {
        this.gameId = gameId;
        this.networkClient = networkClient;
        this.playersPos = listPos;
        this.myChair = myChair;
        this.numPlayer = num;
    }

    linkBickerComponents(popupBicker, canonBicker) {
        this.popupBicker = popupBicker;
        this.canonBicker = canonBicker;

        cc.loader.loadRes("prefabs/chatBicker/CardGame_PopupBicker", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            this.prefabPopupBicker = prefab;
        });

        cc.loader.loadRes("prefabs/chatBicker/CardGame_ItemBicker", cc.Prefab, (c, t, item) => { }, (err, prefab) => {
            this.prefabItemBicker = prefab;
        });
    }

    convertToServerPos(seatId: number) {
        return (seatId + this.myChair) % this.numPlayer;
    }

    convertToSeatId(serverPos: number) {
        return (serverPos - this.myChair + this.numPlayer) % this.numPlayer;
    }

    // update (dt) {}

    // Chat Bicker
    handleChatBicker(msg) {
        cc.log("TLMN handleChatBicker msg: ", msg);

        let from = this.convertToSeatId(msg.fromPos);
        let to = this.convertToSeatId(msg.toPos);

        if (from == -1 || to == -1)
            return;

        let fromPos = this.playersPos[from];
        let toPos = this.playersPos[to];

        let itemBicker = cc.instantiate(this.prefabItemBicker).getComponent("CardGame.ItemBicker");
        itemBicker.initItem(msg.idBicker);
        this.canonBicker.addChild(itemBicker.node);
        itemBicker.node.runAction(
            cc.sequence(
                cc.moveTo(0, cc.v2(fromPos)),
                cc.moveTo(1, cc.v2(toPos)),
                cc.callFunc(() => {
                    itemBicker.playFx();
                }),
                cc.delayTime(1.5),
                cc.callFunc(() => {
                    itemBicker.node.active = false;
                })
            )
        )
    }

    isNeedHide(seatId) {
        if (seatId == this.currentSeadIdTarget) {
            if (this.popupBicker.childrenCount > 0) {
                // Exist
                let itemPopupBicker: CardGame_PopupBicker = this.popupBicker.children[0].getComponent(CardGame_PopupBicker);
                itemPopupBicker.node.active = false;
            }
        }
    }

    showPopupBicker(seatId) {
        // cc.log("TLMN showPopupBicker seatId : ", seatId);
        if (seatId == 0) {
            return;
        }
        let playerPos = this.playersPos[seatId];
        // cc.log("TLMN showPopupBicker playerPos : ", playerPos)
        // cc.log("TLMN showPopupBicker popupBicker : ", this.popupBicker.childrenCount);

        if (this.popupBicker.childrenCount > 0) {
            // Exist
            let itemPopupBicker: CardGame_PopupBicker = this.popupBicker.children[0].getComponent(CardGame_PopupBicker);
            itemPopupBicker.node.position = playerPos;
            itemPopupBicker.setAdaptiveUI(playerPos);
            itemPopupBicker.setConfig(this.gameId, this.networkClient, this.convertToServerPos(0), this.convertToServerPos(seatId));

            cc.log("TLMN showPopupBicker 1 seatId : ", seatId);
            cc.log("TLMN showPopupBicker 1 currentSeadIdTarget : ", this.currentSeadIdTarget);
            if (seatId == this.currentSeadIdTarget) {
                itemPopupBicker.node.active = false;
                this.currentSeadIdTarget = 0;
            } else {
                itemPopupBicker.node.active = true;
                this.currentSeadIdTarget = seatId;
            }
        } else {
            // new
            let itemPopupBicker: CardGame_PopupBicker = cc.instantiate(this.prefabPopupBicker).getComponent(CardGame_PopupBicker);
            itemPopupBicker.node.position = playerPos;
            itemPopupBicker.setAdaptiveUI(playerPos);
            itemPopupBicker.setConfig(this.gameId, this.networkClient, this.convertToServerPos(0), this.convertToServerPos(seatId));
            this.popupBicker.addChild(itemPopupBicker.node);
            this.currentSeadIdTarget = seatId;
        }
    }
}
