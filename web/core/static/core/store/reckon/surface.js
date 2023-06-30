import {Vector3, CatmullRomCurve3} from 'three';
import {current} from 'immer';
export const surface = {
    //res_w: 100,//d.reckon.curve.res,
    res_h: 10,
    surface(d,n,cause=''){ // need indicator on how to order ribs ?!?!?!?! (ordering by y right now)
        try{//if(cause.includes('curve') || ['make.edge', 'delete.edge'].includes(cause)){ 
            //const ribs = d.n[n].n.mixed_curve;//.filter(n=> !d.n[n].c.guide);
            const rail  = d.n[n].n.curve;//.filter(n=>  d.n[n].c.guide);
            var pts = [];
            var res_h = 0;
            // sort ribs by Y
            const ribs = d.n[n].n.mixed_curve.map(n=>{
                let pts = d.n[n].c.curve.getPoints();
                return {
                    n: n,
                    pts: d.n[n].c.pts,
                    h: d.n[n].c.pts.reduce((a,b)=>a.y+b.y,0),
                }
            }).sort((a,b)=>a.h-b.h);
            // build pts list for surface
            for(let i=0; i<ribs.length-1; i++){
                pts = pts.concat(ribs[i].pts);
                res_h++;
            };
            d.n[n].c.pts = pts;
            d.n[n].c.res_w = d.n[ribs[0].n].c.pts.length-1;
            d.n[n].c.res_h = res_h-1;
            //console.log('reckon surf');
            //console.log('ribs gds', ribs, rails);
        }catch(e){console.log(e)}
    },
};