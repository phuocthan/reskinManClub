const {ccclass, property} = cc._decorator;

@ccclass
export default class SpinControl extends cc.Component {

    public spinCol(col: cc.Node, listIcon: cc.Node[], lineSpace: number, delay: number, spinTime: number, callback: Function) {
        for(let i=0; i<listIcon.length; i++) {
            listIcon[i].runAction(cc.moveBy(delay, cc.v2(0, 50)));
        }

        // return
        this.scheduleOnce(() => {
            let v0 = -1000;
            let a = -400;

            let timeLapsed = 0;

            // let outOfColThreshold = (col.height + listIcon[0].height);
            let outOfColThreshold = (col.height/2 + listIcon[0].height);
            // let outOfColThreshold = (col.height/2 + listIcon[0].height/2);

            let func = (delta: number) => {
                let v = v0 + a*delta;
                let dy =  v*delta;

                for(let i=0; i<listIcon.length; i++) {
                    let y0 = listIcon[i].y;

                    let y = y0 + dy;
                    listIcon[i].y = y;
                }

                v0 = v;
                timeLapsed += delta;

                if(timeLapsed > spinTime) {
                    this.unschedule(func);

                    let p = cc.v2(0, -col.height/2 + listIcon[0].height/2 + lineSpace/2);
                    let dp = p.y - listIcon[this.getLowestIconIndex(listIcon)].y;

                    for(let i=0; i<listIcon.length; i++) {
                        listIcon[i].runAction(cc.moveBy(delay, cc.v2(0, dp)));
                    }

                    callback(this.getSortedVisible(listIcon, col, dp));
                } else {
                    for(let i=0; i<listIcon.length; i++) {
                        if(listIcon[i].y < -outOfColThreshold) {
                            listIcon[i].y = listIcon[this.getHighestIconIndex(listIcon)].y + (listIcon[this.getHighestIconIndex(listIcon)].height + lineSpace);
                        }
                    }
                }
            };

            this.schedule(func, 0, cc.macro.REPEAT_FOREVER);
        }, delay);
    }

    private getHighestIconIndex(listIcon: cc.Node[]) {
        return listIcon.indexOf(this.getSortedListIcon(listIcon)[listIcon.length-1]);
    }

    private getLowestIconIndex(listIcon: cc.Node[]) {
        return listIcon.indexOf(this.getSortedListIcon(listIcon)[0]);
    }

    private getSortedListIcon(listIcon: cc.Node[]): cc.Node[] {
       return listIcon.sort((a, b) => a.y - b.y);
    }

    private getSortedVisible(listIcon: cc.Node[], col: cc.Node, dp: number): cc.Node[] {
        let sorted = this.getSortedListIcon(listIcon);
        let sortedVisible = [];

        for(let i=0; i<sorted.length; i++) {
            if((sorted[i].y + dp) < col.height / 2 && (sorted[i].y + dp) > -col.height / 2) {
                sortedVisible.push(sorted[i]);
            }
        }

        return sortedVisible;
     }
 
}
