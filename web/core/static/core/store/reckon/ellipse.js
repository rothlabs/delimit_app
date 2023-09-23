import {Vector3, Matrix4, Vector4, MathUtils, Box3, EllipseCurve, CatmullRomCurve3} from 'three';
import {current} from 'immer';

const v1 = new Vector3(0,0,0);
const up = new Vector3(0,1,0);

export const ellipse = {
    props: ['x', 'y', 'z', 'axis_x', 'axis_y', 'axis_z', 'radius_a', 'radius_b', 'angle_a', 'angle_b'],
    node(d, n, c, ax, a={}){
        //c.pts = [];
        try{
            delete c.curve;
            delete c.mixed_curve; // rename to fixed_curve ?!?!?!?!?! because it is not rotated
            delete ax.curve;

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
            c.mixed_curve = new CatmullRomCurve3(pts);
            if(c.matrix){
                pts = pts.map(p=> p.clone().applyMatrix4(c.matrix));
                c.curve = new CatmullRomCurve3(pts);
            }else{
                c.curve = c.mixed_curve;
            }
            if(ax.matrix) ax.curve = new CatmullRomCurve3(pts.map(p=>p.clone().applyMatrix4(ax.matrix)));
            else ax.curve = c.curve;
        }catch(e){
            //console.log('ELLIPSE ERROR', e);
        } // make switch so easy to view reckon errors for different types of nodes ?!?!?!?!
    }, 
};

//if(c.matrix) pts = pts.map(p=> p.applyMatrix4(c.matrix)); // need to clone here ?!?!?!?!
            //c.curve = new CatmullRomCurve3(pts);
            //c.mixed_curve = c.curve;

//if(c.matrix) pto2 = pto2.map(p=>p.clone().applyMatrix4(c.matrix));

// c.pts = new CatmullRomCurve3(pto2).getPoints(this.res);
// if(c.matrix) c.pts = c.pts.map(p=>p.applyMatrix4(c.matrix)); 

// if(d.n[l1].c.top_view && (d.n[l2].c.inner_view || d.n[l2].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }else if(d.n[l2].c.top_view && (d.n[l1].c.inner_view || d.n[l1].c.outer_view)){
//     var pti=new CatmullRomCurve3(d.n[l2].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'t'})).concat(
//             new CatmullRomCurve3(d.n[l1].n.point.map(n=>d.n[n].l.pos)).getPoints(res_i).map(p=>({p:p,v:'s'})));
// }