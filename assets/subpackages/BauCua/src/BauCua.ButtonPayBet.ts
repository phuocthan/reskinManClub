const { ccclass, property } = cc._decorator;

@ccclass
export default class ButtonPayBet extends cc.Component {
    @property(cc.Button)
    button: cc.Button = null;
    @property(cc.Label)
    lblTotal: cc.Label = null;
    @property(cc.Label)
    lblBeted: cc.Label = null;
    @property(cc.Node)
    overlay: cc.Node = null;
    @property(cc.Label)
    lblFactor: cc.Label = null;
    @property(sp.Skeleton)
    spine: sp.Skeleton = null;
    // hna add
    @property(cc.Node)
    active: cc.Node = null;
    // end

    setSpineIdle() {
        this.spine.setAnimation(0, "action1", true);
    }

    // hna add
    reset() {
        this.lblTotal.node.parent.active = false;
        this.lblBeted.node.parent.active = false;
    }
    setSpriteIdle() {
        this.active.active = false;
    }
    setSpriteResult() {
        this.active.active = true;
    }
    setTotal(string: string) {
        if(string == '0') return;
        this.lblTotal.node.parent.active = true;
        this.lblTotal.string = string;
    }
    setBeted(string: string) {
        if(string == '0') return;
        this.lblBeted.string = string;
        this.lblBeted.node.parent.active = true;
    }
    // end

    setSpineResult() {
        this.spine.setAnimation(0, "action2", true);
    }

    

}