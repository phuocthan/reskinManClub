import ItemGame, { ItemGameType } from "./Lobby.ItemGame";
import Tween from "../../scripts/common/Tween";
import ItemSlotGame from "./Lobby.ItemSlotGame";

const { ccclass, property } = cc._decorator;

@ccclass("Lobby.TabsListGameTab")
export class Tab {
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.SpriteFrame)
    sfNormal: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    sfActive: cc.SpriteFrame = null;
}

@ccclass
export default class TabsListGame extends cc.Component {

    @property([Tab])
    tabs: Tab[] = [];

    @property([ItemGame])
    itemGames: ItemGame[] = [];

    @property(sp.Skeleton)
    arrSpines: sp.Skeleton[] = [];

    private seletectIdx = 0;

    start() {
        for (let i = 0; i < this.tabs.length; i++) {
            let tab = this.tabs[i];
            tab.button.node.on("click", () => {
                this.seletectIdx = i;
                for (let j = 0; j < this.tabs.length; j++) {
                    let tab = this.tabs[j];
                    tab.button.getComponent(cc.Sprite).spriteFrame = this.seletectIdx == j ? tab.sfActive : tab.sfNormal;
                }
                this.onTabChanged();
            });
            tab.button.getComponent(cc.Sprite).spriteFrame = this.seletectIdx == i ? tab.sfActive : tab.sfNormal;
        }
        this.onTabChanged();
    }

    private onTabChanged() {
        switch (this.seletectIdx) {
            case 0:
                for (let i = 0; i < this.itemGames.length; i++) {
                    if (this.itemGames[i] == null) continue;
                    this.itemGames[i].node.active = true;
                }
                break;
            case 1:
                for (let i = 0; i < this.itemGames.length; i++) {
                    if (this.itemGames[i] == null) continue;
                    this.itemGames[i].node.active = this.itemGames[i].type == ItemGameType.SLOT;
                }
                break;
            case 2:
                for (let i = 0; i < this.itemGames.length; i++) {
                    if (this.itemGames[i] == null) continue;
                    this.itemGames[i].node.active = this.itemGames[i].type == ItemGameType.CARD;
                }
                break;
            case 3:
                for (let i = 0; i < this.itemGames.length; i++) {
                    if (this.itemGames[i] == null) continue;
                    this.itemGames[i].node.active = this.itemGames[i].type == ItemGameType.MINI;
                }
                break;
            case 4:
                for (let i = 0; i < this.itemGames.length; i++) {
                    if (this.itemGames[i] == null) continue;
                    this.itemGames[i].node.active = this.itemGames[i].type == ItemGameType.LOTO;
                }
                break;
        }
    }

    public getItemGameWithId(id: string): ItemSlotGame {
        for (let i = 0; i < this.itemGames.length; i++) {
            if (this.itemGames[i] != null && this.itemGames[i].id == id) {
                return this.itemGames[i] as ItemSlotGame;
            }
        }
        return null;
    }

    public getItemGame(id: string): ItemGame {
        for (let i = 0; i < this.itemGames.length; i++) {
            if (this.itemGames[i] != null && this.itemGames[i].id == id) {
                return this.itemGames[i];
            }
        }
        return new ItemGame();
    }

    public updateItemJackpots(id: string, j100: number, x2J100: boolean, j1000: number, x2J1000: boolean, j10000: number, x2J10000: boolean, j5000: number, x2J5000: boolean) {
        let itemGame = this.getItemGameWithId(id);
        if (itemGame != null && id != null) {
            Tween.numberTo(itemGame.lblJackpots[0], j100, 2);
            Tween.numberTo(itemGame.lblJackpots[1], j1000, 2);
            Tween.numberTo(itemGame.lblJackpots[2], j10000, 2);
            if (j5000 != null) {
                // 4 Rooms
                Tween.numberTo(itemGame.lblJackpots[3], j5000, 2);
            }

            if (x2J100) {
                // itemGame.showX2(); // hna comment
            } else {
                itemGame.hideX2();
            }
        }
    }

    // update (dt) {}
}
