import {Vector3, Matrix4, Vector4, MathUtils, Box3, EllipseCurve, CatmullRomCurve3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';

const v1 = new Vector3(0,0,0);
const up = new Vector3(0,1,0);

export const ellipse = {
    //res: 100,
    node(d,n){
        //d.n[n].c.pts = [];
        try{
            delete d.n[n].c.curve;
            delete d.n[n].c.mixed_curve; // rename to fixed_curve ?!?!?!?!?! because it is not rotated
            delete d.n[n].ax.curve;
            const c = d.reckon.props(d, n, 'x y z axis_x axis_y axis_z radius_a radius_b angle_a angle_b'); // rename to radius_a and radius_b ?!?!?!?!?!
            const curve = new EllipseCurve(
                0,  0,            // ax, aY
                c.radius_a, c.radius_b,           // xRadius, yRadius
                MathUtils.degToRad(c.angle_a-90),  MathUtils.degToRad(c.angle_b-90),  // aStartAngle, aEndAngle
                false,            // aClockwise
                0                 // aRotation
            );
            var m1 = new Matrix4().lookAt(v1, new Vector3(c.axis_x, c.axis_y, c.axis_z), up);
            m1.setPosition(c.x, c.y, c.z);
            var pts = curve.getPoints(100).map(p=> new Vector3(p.x, p.y, 0).applyMatrix4(m1));
            d.n[n].c.mixed_curve = new CatmullRomCurve3(pts);
            if(d.n[n].c.matrix){
                pts = pts.map(p=> p.clone().applyMatrix4(d.n[n].c.matrix));
                d.n[n].c.curve = new CatmullRomCurve3(pts);
            }else{
                d.n[n].c.curve = d.n[n].c.mixed_curve;
            }
            if(d.n[n].ax.matrix) d.n[n].ax.curve = new CatmullRomCurve3(pts.map(p=>p.clone().applyMatrix4(d.n[n].ax.matrix)));
            else d.n[n].ax.curve = d.n[n].c.curve;
        }catch(e){
            console.log('ELLIPSE ERROR', e);
        } // make switch so easy to view reckon errors for different types of nodes ?!?!?!?!
    }, 
};

//if(d.n[n].c.matrix) pts = pts.map(p=> p.applyMatrix4(d.n[n].c.matrix)); // need to clone here ?!?!?!?!
            //d.n[n].c.curve = new CatmullRomCurve3(pts);
            //d.n[n].c.mixed_curve = d.n[n].c.curve;

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