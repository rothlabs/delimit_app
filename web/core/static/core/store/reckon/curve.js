import {Vector3, Vector4, MathUtils, CatmullRomCurve3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';
export const curve = {
    //res: 100,
    curve(d,n){
        //d.n[n].c.pts = [];
        try{
            //delete d.n[n].w.curve;
            //delete d.n[n].l.curve;
            if(d.n[n].n.point?.length > 1){ 
                //d.n[n].w.curve = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].w.pos));
                //d.n[n].l.curve = new CatmullRomCurve3(d.n[n].n.point.map(n=>d.n[n].l.pos));
                const pts = d.n[n].n.point.map(n=>d.n[n].w.pos);    // rename so this is pos_a ?!?!?! (absolute or g for global)
                const pts_l = d.n[n].n.point.map(n=>d.n[n].l.pos); // rename so this is pos ?!?!?!?!
                // var knots = [0,0];
                // var last_knot = 0;
                // pts.forEach((p,i) => {
                //     if(i < pts.length-1){
                //         knots.push(i);
                //         last_knot = i;
                //     }else{knots.push(last_knot,last_knot)}
                // });


                const cp = [];
                const cp_l = [];
				const knots = [];
				const degree = 2;
				for (let i=0; i<=degree; i++) knots.push(0);
				for(let i=0; i < pts.length; i++) {
					cp.push(new Vector4(pts[i].x, pts[i].y, pts[i].z, 1));
                    cp_l.push(new Vector4(pts_l[i].x, pts_l[i].y, pts_l[i].z, 1));
					const knot = ( i + 1 ) / (pts.length - degree);
					knots.push( MathUtils.clamp( knot, 0, 1 ) );
				}
                d.n[n].w.curve = new NURBSCurve(degree, knots, cp);
                d.n[n].l.curve = new NURBSCurve(degree, knots, cp_l);
                d.n[n].w.curve.getPoints(3); // checking if valid curve 
                //console.log('CURVE COMPLETE');
            //}else{
            //    delete d.n[n].w.curve;
            //    delete d.n[n].l.curve;
            }
            //d.n[n].c.pts = d.n[n].w.curve.getPoints(this.res);
        }catch(e){
            delete d.n[n].w.curve;
            delete d.n[n].l.curve;
            //console.log('CURVE ERROR',e);
        } // make switch so easy to view reckon errors for different types of nodes ?!?!?!?!
    }, 
    mixed_curve(d,n,cause=[]){ // needs to figure if pos or pos_l results in better match !!!!!!
        try{if(cause.includes('curve') || cause.includes('matrix') || ['make.edge', 'delete.edge'].includes(cause[0])){ 
            delete d.n[n].w.curve;
            const mid_res = 200;
            const l1 = d.n[n].n.curve[0];
            const l2 = d.n[n].n.curve[1];
            if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
                var pti=d.n[l1].l.curve.getPoints(mid_res).map(p=>({p:p,v:'t'})).concat(
                        d.n[l2].l.curve.getPoints(mid_res).map(p=>({p:p,v:'s'})));
            }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
                var pti=d.n[l2].l.curve.getPoints(mid_res).map(p=>({p:p,v:'t'})).concat(
                        d.n[l1].l.curve.getPoints(mid_res).map(p=>({p:p,v:'s'})));
            }
            if(pti){
                var pto = [];
                pti.sort((a,b)=> a.p.x-b.p.x);//(a.p.x<b.p.x ? -1 : 1));
                var zi = -1;
                var yi = -1;
                for(var i=0; i<pti.length; i++){
                    if(pti[i].v == 't'){ var z = -pti[i].p.y; zi=i; 
                    }else{ var y = pti[i].p.y; yi=i; }
                    if(zi>-1 && yi>-1) break;
                }
                for(var i=0; i<pti.length; i++){ // interpolate x and y here ?!?!?!?!
                    if(pti[i].v == 't'){
                        z = -pti[i].p.y;
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
                d.n[n].l.curve = new CatmullRomCurve3(pto2);
                if(d.n[n].c.matrix) d.n[n].w.curve = new CatmullRomCurve3(pto2.map(p=>p.clone().applyMatrix4(d.n[n].c.matrix)));
            }
        }}catch(e){
            delete d.n[n].l.curve;
            delete d.n[n].w.curve;
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