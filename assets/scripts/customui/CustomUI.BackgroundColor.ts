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
export default class UIBackgroundColor extends cc.Component {

    @property(cc.Color)
    color: cc.Color = cc.Color.BLACK;

    @property(cc.Vec2)
    parentAnchor: cc.Vec2 = cc.v2(0.5, 0.5);

    private graphics: cc.Graphics = null;

     onLoad () {
        this.graphics = this.node.addComponent(cc.Graphics);
        this.graphics.lineWidth = 0;
     }

    start () {
        this.graphics.clear();
        this.graphics.fillColor = this.color;
        this.graphics.fillRect(-this.node.width*this.parentAnchor.x, -this.node.height*this.parentAnchor.y, this.node.width, this.node.height);
    }
}
