import CircleProgress from "./Lobby.CircleProgress";


const { ccclass, property } = cc._decorator;

export enum ItemGameType {
    OTHER,
    SLOT,
    CARD,
    MINI,
    LOTO
}

@ccclass
export default class ItemGame extends cc.Component {
    @property
    id: string = "";
    @property({ type: cc.Enum(ItemGameType) })
    type: ItemGameType = ItemGameType.OTHER;
    @property(CircleProgress)
    circleProgress: CircleProgress = null;
}
