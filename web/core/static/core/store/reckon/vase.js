import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, CatmullRomCurve3, Box3, Raycaster, Mesh, MeshBasicMaterial} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
const z_dir = new Vector3(0,0,1);
const axis = new Vector3();
const v_sum = new Vector3();
//const v_count = 0;

const res_v = .005;
const res_u = .001;
const tests = [];
//const u_idx = [];
for(let v=0; v<1/res_v; v++){
    tests[v] = [];
    //u_idx.push(0);
    for(let u=0; u<1/res_u; u++){
        tests[v][u] = new Vector3();
    }
}

const origin = new Vector3();
const direction = new Vector3();
const raycaster = new Raycaster();
const material = new MeshBasicMaterial();

const geo_res = 50;
const rot_res = 45;
const rot_step = (Math.PI*2/rot_res);
// const rot_step = Math.PI*2/rot_res;
// const target_angles = [];
// for(let i=0; i<rot_res; i++){
//     target_angles.push(rot_step*i);
// }
// for(let i=rot_res; i>0; i--){
//     target_angles.push(rot_step*i);
// }
// console.log('target_angles');
// console.log(target_angles);
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);

// const local_res = 0.005;
// const local_size = 40;
// const local_offset = local_size*local_res/2;
// const local_points = [];
// for(let u=0; u<local_size; u++){
//     local_points[u] = [];
//     for(let v=0; v<local_size; v++){
//         local_points[u][v] = {p: new Vector3(10000,10000,10000), u:0, v:0};
//     }
// }

const layer_height = 6;

export const vase = {
    
    code_res: .2, // code_res = arc length between G1 if constant curve like an arc
    node(d, n){
        try{
            if(d.studio.mode == 'graph') return;
            delete d.n[n].c.g_code;
            delete d.n[n].c.curve;
            delete d.n[n].ax.curve;
            const surface  = d.n[d.n[n].n.surface[0]].c.surface;
            
            //const start_y = v1.y;
            const bb1 = new Box3();
            for(let v=0; v<1/res_v; v++){ 
                //u_idx[v] = 0;
                for(let u=0; u<1/res_u; u++){
                    surface.get_point(1-u*res_u, v*res_v, tests[v][u]);
                    bb1.expandByPoint(tests[v][u]);
                }
            }


            const geo_obj = new Mesh(
                new ParametricGeometry(surface.get_point, geo_res, geo_res),
                material
            );
            var pts = [];
            //var u = 1;
            //var v = 0;
            surface.get_point(1, 0, v1);
            var y = v1.y;
            origin.set(0,y,1000);
            direction.set(0,y,0).sub(origin);
            axis.set(0,y,0);
            for(let i=0; i<10000; i++){ 
                v_sum.set(0,0,0);
                for(let k=0; k<rot_res; k++){ 
                    raycaster.set(origin, direction);
                    const intersects = raycaster.intersectObject(geo_obj);
                    if(intersects.length > 0){
                        pts.push(intersects[0].point);
                        v_sum.add(intersects[0].point);
                        if(intersects.length > 1) console.log('two hits!!!');
                    }
                    y -= layer_height / rot_res;
                    if(y < bb1.min.y) break;
                    origin.set(axis.x, y, axis.z+1000);
                    origin.applyMatrix4(m1.makeRotationY(rot_step*k));
                    direction.set(axis.x,y,axis.z).sub(origin);
                }
                v_sum.divideScalar(rot_res);
                axis.copy(v_sum);
            }

            const curve = new CatmullRomCurve3(pts);
            curve.arcLengthDivisions = 500;
            
            var code = '';
            // pts = curve.getPoints(Math.round(curve.getLength()*this.code_res));
            // for(let i=0; i<pts.length; i++){
            //     code += 'G0 X'+d.rnd(pts[i].x) + ' Y'+d.rnd(pts[i].y)+ ' Z'+d.rnd(pts[i].z) + '\r\n';
            // }

            d.n[n].c.code = code;
            d.n[n].c.curve = curve;
            d.n[n].ax.curve = d.n[n].c.curve;
            console.log('Reckoned vase!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};


// const geo_obj = new Mesh(
//     new ParametricGeometry(surface.get_point, geo_res, geo_res),
//     material
// );
// var y = start_y;
// origin.set(0,y,1000);
// direction.set(0,y,0).sub(origin);
// for(let i=0; i<10000; i++){
//     raycaster.set(origin, direction);
//     const intersects = raycaster.intersectObject(geo_obj);
//     if(intersects.length > 0){
//         pts.push(intersects[0].point);
//         if(intersects.length > 1) console.log('two hits!!!');
//     }
//     y -= layer_height / rot_res;
//     if(y < bb1.min.y) break;
//     origin.applyMatrix4(rotation);
//     direction.set(0,y,0).sub(origin);
// }



// const geo_obj = new Mesh(
//     new ParametricGeometry(surface.get_point, geo_res, geo_res),
//     material
// );
// var y = start_y;
// origin.set(0,y,1000);
// direction.set(0,y,0).sub(origin);
// for(let i=0; i<10000; i++){
//     raycaster.set(origin, direction);
//     const intersects = raycaster.intersectObject(geo_obj);
//     if(intersects.length > 0){
//         pts.push(intersects[0].point);
//         if(intersects.length > 1) console.log('two hits!!!');
//     }
//     y -= layer_height / rot_res;
//     if(y < bb1.min.y) break;
//     origin.applyMatrix4(rotation);
//     direction.set(0,y,0).sub(origin);
// }


            // var layer_count = 0;
            // var ty = start_y;
            // for(let i=0; i<10000; i++){
            //     for(let v=0; v<1/res_v; v++){
            //         ty = start_y - (layer_count * this.layer_height + this.layer_height * v*res_v);
            //         //var v2 = tests[v].slice(u_idx[v], u_idx[v]+50).sort((a,b)=> Math.abs(a.y-ty)-Math.abs(b.y-ty))[0]; // Don't need to sort this ?!?!?!?!?! instead, just search down u from last time at this v
            //         //var v2 = tests[v][u_idx[v]];
            //         var pt = tests[v].sort((a,b)=> Math.abs(a.y-ty)-Math.abs(b.y-ty))[0];
            //         //if(Math.abs(pt.y-ty) < this.layer_height/2){
            //             pts.push(pt.clone());
            //             //u_idx[v]++;
            //             // flag start or stop extrude
            //         //}
                    
            //     }
            //     if(ty < bb1.min.y) break;
            //     layer_count++;
            // }


// for(let u=0; u<1; u+=this.res){
//     for(let v=0; v<1; v+=this.res){
//         surface.get_point(u, v, v1);
//         pts.push(v1.clone());
//     }
// }




// var pts = [];
//             //var u = 1;
//             //var v = 0;
//             surface.get_point(u, v, v1);
//             var y = v1.y;
//             axis.set(0,y,0);
//             for(let i=0; i<10000; i++){ 
//                 v_sum.set(0,0,0);
//                 target_angles.forEach(target_angle => {
//                     for(let uu=0; uu<local_size; uu++){
//                         for(let vv=0; vv<local_size; vv++){ 
//                             local_points[uu][vv].u = u-local_offset+(uu*local_res);
//                             local_points[uu][vv].v = v-local_offset+(vv*local_res);
//                             if(local_points[uu][vv].u >= 0 && local_points[uu][vv].u <= 1){
//                                 if(local_points[uu][vv].v >= 0 && local_points[uu][vv].v <= 1){
//                                     surface.get_point(local_points[uu][vv].u, local_points[uu][vv].v, local_points[uu][vv].p);
                                    
//                                 }
//                             }
//                         }
//                     }
//                     var best_fit = local_points.flat().sort((a,b)=>{
//                         v1.set(axis.x, a.p.y, axis.z);
//                         v2.set(axis.x, b.p.y, axis.z);
//                         var angle_a = z_dir.angleTo(v3.copy(a.p).sub(v1)); 
//                         var angle_b = z_dir.angleTo(v3.copy(b.p).sub(v2)); 
//                         return (Math.abs(a.p.y-y)+Math.abs(angle_a-target_angle)) - (Math.abs(b.p.y-y)+Math.abs(angle_b-target_angle));
//                     })[0];
//                     pts.push(best_fit.p.clone());
//                     v_sum.add(local_points[uu][vv].p);
//                     u = best_fit.u;
//                     v = best_fit.v; 
//                     y -= layer_height / target_angles.length;
//                 });
//                 if(y < bb1.min.y) break;
//                 v_sum.divideScalar(target_angles.length);
//                 axis.copy(v_sum);
//             }