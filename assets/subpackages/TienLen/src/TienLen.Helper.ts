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
export default class TienLenHelper {

    public static kiemTraBaDoiThong(cards: number[]): boolean {
        if(cards.length != 6)
            return false;

        for(let i=0; i<cards.length; i++) {
            if(cards[i] >= 48)
                return false;
        }

        let cardSorted = cards.sort((a, b) => a - b);
        
        if((Math.floor(cardSorted[1]/4) - Math.floor(cardSorted[0]/4)) != 0) {
            return false;
        }

        if((Math.floor(cardSorted[3]/4) - Math.floor(cardSorted[2]/4)) != 0) {
            return false;
        }

        if((Math.floor(cardSorted[5]/4) - Math.floor(cardSorted[4]/4)) != 0) {
            return false;
        }

        let divider1 = Math.floor(cardSorted[0]/4);
        let divider2 = Math.floor(cardSorted[2]/4);
        let divider3 = Math.floor(cardSorted[4]/4);

        if(divider2 - divider1 != 1)
            return false;
        
        if(divider3 - divider2 != 1)
            return false;

        return true;
    }

    public static kiemTraBonDoiThong(cards: number[]): boolean {
        if(cards.length != 8)
            return false;

        for(let i=0; i<cards.length; i++) {
            if(cards[i] >= 48)
                return false;
        }

        let cardSorted = cards.sort((a, b) => a - b);
        
        if((Math.floor(cardSorted[1]/4) - Math.floor(cardSorted[0]/4)) != 0) {
            return false;
        }

        if((Math.floor(cardSorted[3]/4) - Math.floor(cardSorted[2]/4)) != 0) {
            return false;
        }

        if((Math.floor(cardSorted[5]/4) - Math.floor(cardSorted[4]/4)) != 0) {
            return false;
        }

        if((Math.floor(cardSorted[7]/4) - Math.floor(cardSorted[6]/4)) != 0) {
            return false;
        }

        let divider1 = Math.floor(cardSorted[0]/4);
        let divider2 = Math.floor(cardSorted[2]/4);
        let divider3 = Math.floor(cardSorted[4]/4);
        let divider4 = Math.floor(cardSorted[6]/4);

        if(divider2 - divider1 != 1)
            return false;
        
        if(divider3 - divider2 != 1)
            return false;
        
        if(divider4 - divider3 != 1)
            return false;

        return true;
    }

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
