// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CircleProgress extends cc.Component {
    @property(cc.Node)
    circle: cc.Node = null;
    @property(cc.Label)
    percent: cc.Label = null;

    private currentProgress: number = 0;
    
    startProgress() {
        this.node.active = true;
        this.circle.stopAllActions();
        this.circle.runAction(cc.repeatForever(cc.rotateBy(1, 360)));
        this.currentProgress = 0;
        this.percent.string = "";
    }

    setPercent(percent: number) {
        if(isNaN(percent))
            return;

        if(percent < 0)
        
            return;
        if(percent > 1)
            return;

        if(percent < this.currentProgress)
            return;
        
        this.percent.string = Math.floor(percent*100) + "%";
        this.currentProgress = percent;
    }

    endProgress() {
        this.circle.stopAllActions();
        this.node.active = false;
    }
}
