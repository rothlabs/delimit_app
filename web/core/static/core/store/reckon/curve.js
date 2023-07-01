import {Vector3, CatmullRomCurve3} from 'three';
import {current} from 'immer';
export const curve = {
    //res: 100,
    curve(d,n){
        //d.n[n].c.pts = [];
        try{
            if(d.n[n].n.point?.length > 1){
                d.n[n].c.curve = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].c.pos));
                d.n[n].c.curve_l = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].c.pos_l));
            }else{
                delete d.n[n].c.curve;
                delete d.n[n].c.curve_l;
            }
            //d.n[n].c.pts = d.n[n].c.curve.getPoints(this.res);
        }catch{}
    }, 
    mixed_curve(d,n,cause=''){ // needs to figure if pos or pos_l results in better match !!!!!!
        try{if(cause.includes('curve') || cause.includes('matrix') || ['make.edge', 'delete.edge'].includes(cause)){ 
            delete d.n[n].c.curve;
            const mid_res = 200;
            const l1 = d.n[n].n.curve[0];
            const l2 = d.n[n].n.curve[1];
            if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
                var pti=d.n[l1].c.curve_l.getPoints(mid_res).map(p=>({p:p,v:'t'})).concat(
                        d.n[l2].c.curve_l.getPoints(mid_res).map(p=>({p:p,v:'s'})));
            }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
                var pti=d.n[l2].c.curve_l.getPoints(mid_res).map(p=>({p:p,v:'t'})).concat(
                        d.n[l1].c.curve_l.getPoints(mid_res).map(p=>({p:p,v:'s'})));
            }
            if(pti){
                var pto = [];
                pti.sort((a,b)=> a.p.x-b.p.x);//(a.p.x<b.p.x ? -1 : 1));
                var zi = -1;
                var yi = -1;
                for(var i=0; i<pti.length; i++){
                    if(pti[i].v == 't'){ var z = pti[i].p.y; zi=i; 
                    }else{ var y = pti[i].p.y; yi=i; }
                    if(zi>-1 && yi>-1) break;
                }
                for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
                    if(pti[i].v == 't'){
                        z = pti[i].p.y;
                        for(let k=zi+1; k<i; k++){
                            let amt = (k-zi)/(i-zi);
                            pto[k].setZ((1-amt)*pto[zi].z+amt*z);
                        }
                        pto.push(new Vector3(pti[i].p.x, y, z));
                        zi=i;
                    }else{
                        y = pti[i].p.y;
                        for(let k=yi+1; k<i; k++){
                            let amt = (k-yi)/(i-yi);
                            pto[k].setY((1-amt)*pto[yi].y+amt*y);
                        }
                        pto.push(new Vector3(pti[i].p.x, y, z));
                        yi=i;
                    }
                }
                if(d.n[n].c.matrix) pto = pto.map(p=>p.applyMatrix4(d.n[n].c.matrix));
                var pto2 = [pto[0]];
                const cmp = pto.slice(1,10);
                for(var i=0; i<pto.length-1; i++){
                    cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                    if(cmp[0].distanceTo(pto2.at(-1)) < pto[i+1].distanceTo(pto2.at(-1))){
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
                d.n[n].c.curve = new CatmullRomCurve3(pto2);
            }
        }}catch(e){console.log(e);}
    },
};

//if(d.n[n].c.matrix) pto2 = pto2.map(p=>p.clone().applyMatrix4(d.n[n].c.matrix));

// d.n[n].c.pts = new CatmullRomCurve3(pto2).getPoints(this.res);
// if(d.n[n].c.matrix) d.n[n].c.pts = d.n[n].c.pts.map(p=>p.applyMatrix4(d.n[n].c.matrix)); 

// if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].c.pos_l)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }