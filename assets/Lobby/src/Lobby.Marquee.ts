// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import BroadcastReceiver from "../../scripts/common/BroadcastReceiver";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Marquee extends cc.Component {
    @property(cc.Node)
    marqueeContainer: cc.Node = null;
    
    @property(cc.Node)
    marquees: cc.Node[] = [];

    private listMarquees = [];

    start() {
        BroadcastReceiver.register(BroadcastReceiver.ON_UPDATE_MARQUEE, (data) => {
            this.listMarquees = data;
        }, this);

        this.init();

        BroadcastReceiver.send(BroadcastReceiver.ON_REQUEST_UPDATE_MARQUEE);
    }

    init() {
        let moveAndCheck = () => {
            this.marqueeContainer.runAction(cc.sequence(
                cc.moveBy(0.5, cc.v2(-60, 0)),
                cc.callFunc(() => {
                    if (this.marqueeContainer.position.x < -this.marqueeContainer.width - 50) {
                        this.updateMarquee();
                        // this.notifyMarquee = "";
                        let pos = this.marqueeContainer.position;
                        pos.x = this.marqueeContainer.parent.width + 50;
                        this.marqueeContainer.position = pos;
                    }
                    moveAndCheck();
                })
            ));
        };

        this.scheduleOnce(() => {
            let pos = this.marqueeContainer.position;
            pos.x = this.marqueeContainer.parent.width + 50;
            this.marqueeContainer.position = pos;
            this.updateMarquee();
            moveAndCheck();
        }, 5);
    }

    
    updateMarquee() {
        for(let i=0; i<this.marquees.length; i++) {
            if(this.listMarquees[i]) {
                this.marquees[i].children[0].getComponent(cc.Label).string = this.listMarquees[i].game;
                this.marquees[i].children[1].getComponent(cc.Label).string = this.listMarquees[i].win;
                this.marquees[i].children[2].getComponent(cc.Label).string = this.listMarquees[i].money;

                this.marquees[i].active = true;
            } else {
                this.marquees[i].active = false;
            }
        }
    }
}
