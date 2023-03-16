// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

import ItemNumber from "./Loto.ItemNumber";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ItemNumbers extends cc.Component {

    @property(ItemNumber)
    items: ItemNumber[] = [];

    setData(data: any[], subSetIndex: number) {
        for(let i=0; i<this.items.length; i++) {
            if(i < data.length) {
                this.items[i].node.active = true;
                this.items[i].setData(data[i], subSetIndex, i);
            } else {
                this.items[i].node.active = false;
            }
        }
    }
}
