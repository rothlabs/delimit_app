import {Vector3, Vector4, MathUtils, Box3, EllipseCurve, CatmullRomCurve3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';

const v1 = new Vector3();
const v2 = new Vector3();
const bb1 = new Box3();
const bb2 = new Box3();

export const ellipse = {
    //res: 100,
    node(d,n){
        //d.n[n].c.pts = [];
        try{
            delete d.n[n].c.curve;
            delete d.n[n].c.mixed_curve;
            delete d.n[n].ax.curve;

            const c = d.reckon.v(d, n, 'radius_x radius_y angle_a angle_b');

            const curve = new EllipseCurve(
                0,  0,            // ax, aY
                c.radius_x, c.radius_y,           // xRadius, yRadius
                MathUtils.degToRad(c.angle_a-90),  MathUtils.degToRad(c.angle_b-90),  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );

            var pts = curve.getPoints(100).map(p=> new Vector3(p.x, p.y, 0));
            if(d.n[n].c.matrix) pts = pts.map(p=> p.applyMatrix4(d.n[n].c.matrix)); // need to clone here ?!?!?!?!
            d.n[n].c.curve = new CatmullRomCurve3(pts);
            d.n[n].c.mixed_curve = d.n[n].c.curve;
            // if(d.n[n].c.matrix){
            //     pto2 = pto2.map(p=> p.clone().applyMatrix4(d.n[n].c.matrix));
            //     d.n[n].c.curve = new CatmullRomCurve3(pto2);
            // }else{
            //     d.n[n].c.curve = d.n[n].c.mixed_curve;
            // }
            if(d.n[n].ax.matrix) d.n[n].ax.curve = new CatmullRomCurve3(pts.map(p=>p.clone().applyMatrix4(d.n[n].ax.matrix)));
            else d.n[n].ax.curve = d.n[n].c.curve;

            // d.n[n].c.curve = curve;
            // d.n[n].c.mixed_curve = curve;
            // d.n[n].ax.curve = curve;
        }catch(e){
            console.log('ELLIPSE ERROR', e);
        } // make switch so easy to view reckon errors for different types of nodes ?!?!?!?!
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