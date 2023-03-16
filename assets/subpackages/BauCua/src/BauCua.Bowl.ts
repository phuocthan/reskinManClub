const { ccclass, property } = cc._decorator;

@ccclass
export default class BowlController extends cc.Component {
    @property(cc.Node)
    result: cc.Node = null;
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;
    @property(cc.Node)
    dice1: cc.Node = null;
    @property(cc.Node)
    dice2: cc.Node = null;
    @property(cc.Node)
    dice3: cc.Node = null;

    setBowlNewGame() {
        this.spine.node.active = true;
        this.result.active = false;
        this.spine.addAnimation(0, 'close', false);
        this.spine.addAnimation(0, 'shake', false);
        this.spine.addAnimation(0, 'idle', true);
    }

    setBowlIdle() {
        this.spine.node.active = true;
        this.result.active = false;
        this.spine.addAnimation(0, 'idle', true);
    }

    hideSpine() {
        this.spine.node.active = false;
    }

    setResult(dice1Idx, dice2Idx, dice3Idx) {
        for(let i = 0; i < this.dice1.childrenCount; i++) {
            this.dice1.children[i].active = false;
        }
        for(let j = 0; j < this.dice1.childrenCount; j++) {
            this.dice2.children[j].active = false;
        }
        for(let k = 0; k < this.dice1.childrenCount; k++) {
            this.dice3.children[k].active = false;
        }

        this.dice1.children[dice1Idx].active = true;
        this.dice2.children[dice2Idx].active = true;
        this.dice3.children[dice3Idx].active = true;

        this.spine.addAnimation(0, 'open', false);
        // this.spine.node.active = false;

        this.scheduleOnce(() => {
            this.result.active = true;
        }, 1.5);
    }
}