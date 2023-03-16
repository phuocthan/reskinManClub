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
export default class SamHelper {

    public static kiemTraTuQuy(cards: number[]): boolean {
        if(cards.length != 4)
            return false;

        let cardSorted = cards.sort((a, b) => a - b);
        
        if(Math.floor(cardSorted[0]/4) != Math.floor(cardSorted[1]/4))
            return false;

        if(Math.floor(cardSorted[1]/4) != Math.floor(cardSorted[2]/4))
            return false;

        if(Math.floor(cardSorted[2]/4) != Math.floor(cardSorted[3]/4))
            return false;

        if((cardSorted[3] - cardSorted[2]) != 1)
            return false;

        if((cardSorted[2] - cardSorted[1]) != 1)
            return false;

        if((cardSorted[1] - cardSorted[0]) != 1)
            return false;

        return true;
    }
}
