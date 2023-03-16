const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemNumSelected extends cc.Component {

    @property(cc.Label)
    labelNumber: cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {

    }

    initItem(data) {
        this.labelNumber.string = data;
    }

    // update (dt) {}
}
