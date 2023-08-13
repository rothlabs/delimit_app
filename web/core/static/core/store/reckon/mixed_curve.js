import {Vector3, Vector4, MathUtils, CatmullRomCurve3, Box3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';

const v1 = new Vector3();
const v2 = new Vector3();
const bb1 = new Box3();
const bb2 = new Box3();

const mid_res = 200;

export const mixed_curve = { // being recomputed just for ax changes of source curves !!!!!!!!! ?!?!?!?!?!
    node(d,n,cause=[]){ // needs to figure if pos or pos_l results in better match !!!!!!
        try{//if(cause.includes('curve') || cause.includes('matrix') || ['make.edge', 'delete.edge'].includes(cause[0])){ 
            //delete d.n[n].w.curve;
            
            const l1 = d.n[n].n.curve[0];
            const l2 = d.n[n].n.curve[1];
            const ptc1 = d.n[l1].c.curve.getPoints(mid_res);
            const ptc2 = d.n[l2].c.curve.getPoints(mid_res);
            bb1.setFromArray(ptc1.map(p=>[p.x, p.y, p.z]).flat());
            bb2.setFromArray(ptc2.map(p=>[p.x, p.y, p.z]).flat());
            if(bb1.getSize(v1).x > bb2.getSize(v2).x){
                var pti=ptc1.map(p=>({p:p,v:'xz'})).concat(
                        ptc2.map(p=>({p:p,v:'yz'})));
            }else{
                var pti=ptc2.map(p=>({p:p,v:'xz'})).concat(
                        ptc1.map(p=>({p:p,v:'yz'})));
            }
            if(pti){
                var pto = [];
                pti.sort((a,b)=> a.p.z-b.p.z);//(a.p.x<b.p.x ? -1 : 1));
                var xi = -1; // zi
                var yi = -1;
                for(var i=0; i<pti.length; i++){
                    if(pti[i].v == 'xz'){ var x = pti[i].p.x; xi=i; 
                    }else{ var y = pti[i].p.y; yi=i; }
                    if(xi>-1 && yi>-1) break;
                }
                for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
                    if(pti[i].v == 'xz'){
                        x = pti[i].p.x;
                        for(let k=xi+1; k<i; k++){
                            let amt = (k-xi)/(i-xi);
                            pto[k].setX((1-amt)*pto[xi].x+amt*x);
                        }
                        pto.push(new Vector3(x, y, pti[i].p.z));
                        xi=i;
                    }else{
                        y = pti[i].p.y;
                        for(let k=yi+1; k<i; k++){
                            let amt = (k-yi)/(i-yi);
                            pto[k].setY((1-amt)*pto[yi].y+amt*y);
                        }
                        pto.push(new Vector3(x, y, pti[i].p.z));
                        yi=i;
                    }
                }
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
                while(cmp.length > 1){ // simplify continuity check to just this loop ?!?!?!?!
                    cmp.sort((a,b)=> a.distanceTo(pto2.at(-1))-b.distanceTo(pto2.at(-1)));
                    if(pto.at(-1).distanceTo(pto2.at(-1)) < cmp[0].distanceTo(pto2.at(-1))) break;
                    pto2.push(cmp.shift());
                }
                pto2[pto2.length-1] = pto.at(-1);
                //pto2 = pto2.map(p=> p.clone());
                d.n[n].c.mixed_curve = new CatmullRomCurve3(pto2);
                if(d.n[n].c.matrix){
                    pto2 = pto2.map(p=> p.clone().applyMatrix4(d.n[n].c.matrix));
                    d.n[n].c.curve = new CatmullRomCurve3(pto2);
                }else{
                    d.n[n].c.curve = d.n[n].c.mixed_curve;
                }
                if(d.n[n].ax.matrix) d.n[n].ax.curve = new CatmullRomCurve3(pto2.map(p=>p.clone().applyMatrix4(d.n[n].ax.matrix)));
                else d.n[n].ax.curve = d.n[n].c.curve;
            }
            //console.log('Reckon mixed curve!!!');
        }catch(e){
            delete d.n[n].c.curve;
            delete d.n[n].ax.curve;
            //console.log(e);
        }
    },
};

//if(d.n[n].c.matrix) pto2 = pto2.map(p=>p.clone().applyMatrix4(d.n[n].c.matrix));

// d.n[n].c.pts = new CatmullRomCurve3(pto2).getPoints(this.res);
// if(d.n[n].c.matrix) d.n[n].c.pts = d.n[n].c.pts.map(p=>p.applyMatrix4(d.n[n].c.matrix)); 

// if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }