import {Vector3, CatmullRomCurve3} from 'three';
import {current} from 'immer';
export const curve = {
    curve(d,n){
        d.n[n].c.pts = [];
        try{d.n[n].c.pts = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].c.pos)).getPoints(d.curve_res);
        }catch{}
    }, 
    mixed_curve(d,n,cause=''){ // needs to figure if pos or pos_l results in better match !!!!!!
        try{if(cause.includes('curve') || cause.includes('matrix') || ['make.edge', 'delete.edge'].includes(cause)){ 
            delete d.n[n].c.point;
            const res_i = 200;
            const l1 = d.n[n].n.curve[0];
            const l2 = d.n[n].n.curve[1];
            if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
                var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
                        new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'s'})));
            }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
                var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
                        new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'s'})));
            }
            if(pti){
                const pto = [];
                pti.sort((a,b)=> a.p.x-b.p.x);//(a.p.x<b.p.x ? -1 : 1));
                var xi = -1;
                var yi = -1;
                for(var i=0; i<pti.length; i++){
                    if(pti[i].v == 't'){ var x = pti[i].p.y; xi=i; 
                    }else{ var y = pti[i].p.y; yi=i; }
                    if(xi>-1 && yi>-1) break;
                }
                for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
                    if(pti[i].v == 't'){
                        x = pti[i].p.y;
                        for(let k=xi+1; k<i; k++){
                            let amt = (k-xi)/(i-xi);
                            pto[k].setX((1-amt)*pto[xi].x+amt*x);
                        }
                        pto.push(new Vector3(x, y, pti[i].p.x));
                        xi=i;
                    }else{
                        y = pti[i].p.y;
                        for(let k=yi+1; k<i; k++){
                            let amt = (k-yi)/(i-yi);
                            pto[k].setY((1-amt)*pto[yi].y+amt*y);
                        }
                        pto.push(new Vector3(x, y, pti[i].p.x));
                        yi=i;
                    }
                }
                const pto2 = [pto[0]];
                const cmp = pto.slice(1,10);
                for(var i=0; i<pto.length-1; i++){
                    cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                    if(cmp[0].distanceTo(pto2.at(-1))+0.01 < pto[i+1].distanceTo(pto2.at(-1))){
                        pto2.push(cmp.shift());
                        cmp.push(pto[i+1]);
                    }else{ pto2.push(pto[i+1]) }
                    if(i<pto.length-10) cmp.push(pto[i+10]);
                }
                while(cmp.length > 1){
                    cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                    if(pto.at(-1).distanceTo(pto2.at(-1)) < cmp[0].distanceTo(pto2.at(-1))) break;
                    pto2.push(cmp.shift());
                }
                pto2[pto2.length-1] = pto.at(-1);
                d.n[n].c.pts = new CatmullRomCurve3(pto2).getPoints(d.curve_res);
                if(d.n[n].c.matrix) d.n[n].c.pts = d.n[n].c.pts.map(p=>p.applyMatrix4(d.n[n].c.matrix)); 
            }
        }}catch(e){console.log(e)}
    },
};