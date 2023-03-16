
export default class Res {
    static instance: Res;
    cards = [];
    cardItem = null;

    _callbacks: Function[] = [];
    isLaBaiLoaded = false;

    public static getInstance(): Res {
        if (this.instance == null)
            this.instance = new Res();
        return this.instance;
    }

    constructor() {
        cc.loader.loadResDir("sprites/LaBai", cc.SpriteFrame, (err, sprs, urls) => {
            this.cards = sprs;

            this.isLaBaiLoaded = true;
            for(let i=0; i<this._callbacks.length; i++) {
                this._callbacks[i]();
            }
        });
        cc.loader.loadRes("prefabs/card/card", cc.Prefab, (err, prefab) => {
            this.cardItem = prefab;
        });
    }

    getCardFace(index) {
        if (index < 10) index = "0" + index;
        return this.cards.filter(card => card.name == ("labai_" + index))[0];
    }

    getCardItem() {
        return this.cardItem;
    }

    setOnLaBaiLoaded(cb: Function) {
        if(cb) {
            if(this.isLaBaiLoaded) {
                cb();
            } else {
                this._callbacks.push(cb);
            }
        }
    }
}
