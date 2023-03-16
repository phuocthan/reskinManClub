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
export default class ActUtils {
    public static bubble(node: cc.Node) {
        if(node) {
            node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(0.4, 1.15), cc.scaleTo(0.3, 1))));
        }
    }

    public static bubbleStoreBounus(node: cc.Node, value: number) {
        if(!node) {
            console.log("Error:  makeBuble node null");
            return;
        }
        if(isNaN(value)) {
            console.log("Error:  makeBuble value NaN " + value);
            return;
        }

        let scaleRate = 1;

        if(value > 0 && value < 15)
            scaleRate = 1.05;
        if(value >= 15 && value < 20)
            scaleRate = 1.15;
        if(value >= 20 && value < 25)
            scaleRate = 1.25;
        if(value >= 25 && value < 30)
            scaleRate = 1.35;
        if(value >= 30)
            scaleRate = 1.5;

        node.runAction(cc.repeatForever(cc.sequence(
            cc.scaleTo(0.25*scaleRate, scaleRate),
            cc.scaleTo(0.15*scaleRate, 1)
        )));
    }

    public static showWinEffect(node: cc.Node, callback: cc.ActionInstant) {
        if(!node)
            return;

        let originY = node.y;
        node.stopAllActions();
        node.scaleX = 0;
        node.y -= 110;
        node.runAction(cc.sequence(cc.scaleTo(0.5, 1, 1), cc.moveTo(0.5, cc.v2(node.x, originY)), callback));
    }
}
