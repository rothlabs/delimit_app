import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, CatmullRomCurve3, Box3, Raycaster, Mesh, MeshBasicMaterial} from 'three';
//import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {ParametricGeometry} from 'three/examples/jsm/geometries/ParametricGeometry';

const v1 = new Vector3();
const v2 = new Vector3();

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

const geo_res = 60;
const rot_res = 60;
const rotation = new Matrix4().makeRotationY(Math.PI*2/rot_res);

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
            var pts = [];
            surface.get_point(1, 0, v1);
            const start_y = v1.y;
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
            var y = start_y;
            origin.set(0,y,1000);
            direction.set(0,y,0).sub(origin);
            for(let i=0; i<10000; i++){
                raycaster.set(origin, direction);
                const intersects = raycaster.intersectObject(geo_obj);
                if(intersects.length > 0){
                    pts.push(intersects[0].point);
                    if(intersects.length > 1) console.log('two hits!!!');
                }
                y -= layer_height / rot_res;
                if(y < bb1.min.y) break;
                origin.applyMatrix4(rotation);
                direction.set(0,y,0).sub(origin);
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

