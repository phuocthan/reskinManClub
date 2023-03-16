import Res from "./TienLen.Res";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Card extends cc.Component {

    spr = null;
    posY = 0;
    offsetY = 20;
    isSelected = false;
    callback = null;
    index = null;

    public static readonly CARD_FLIP_DURATION = 0.3;
    public static readonly CARD_UP = 52;

    onLoad() {
        this.spr = this.node.getComponent(cc.Sprite);
        this.posY = this.node.y;
    }
    
    onSelect() {
        this.node.y += this.isSelected ? -this.offsetY : this.offsetY;
        this.isSelected = !this.isSelected;
        if (this.isSelected && this.callback) {
            this.callback(this.index);
        }

    }
    
    setCardData(index, callback = null) {
        this.index = index;
        this.spr.spriteFrame = Res.getInstance().getCardFace(index);
        this.callback = callback;
    }
    
    getCardIndex() {
        return this.index;
    }
    
    select() {
        this.node.y = this.posY + this.offsetY;
        this.isSelected = true;
    }
    
    deSelect() {
        this.node.y = this.posY;
        this.isSelected = false;
    }

    makeShadow() {
        this.node.color = (new cc.Color()).fromHEX("#9C9C9C");
    }

    removeShadow() {
        this.node.color = cc.Color.WHITE;
    }

    flip(card1, card2, callback) {
        this.setCardData(card1);
        this.node.runAction(cc.sequence(cc.scaleTo(Card.CARD_FLIP_DURATION/2, 0, 1), cc.callFunc(() => { this.setCardData(card2, callback) }), cc.scaleTo(Card.CARD_FLIP_DURATION/2, 1, 1)));
    }

    flipScale(card1, card2, scalex, scaley) {
        this.setCardData(card1);
        this.node.runAction(cc.sequence(cc.scaleTo(Card.CARD_FLIP_DURATION/2, 0, scaley), cc.callFunc(() => { this.setCardData(card2) }), cc.scaleTo(Card.CARD_FLIP_DURATION/2, scalex, scaley)));
    }
}
