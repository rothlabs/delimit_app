import {Vector3, Vector4, MathUtils, CatmullRomCurve3, Box3} from 'three';
import {NURBSCurve} from 'three/examples/jsm/curves/NURBSCurve';
import {current} from 'immer';

const v1 = new Vector3();
const v2 = new Vector3();

const res_v = .02;
const res_u = .002;
const tests = [];
for(let v=0; v<1/res_v; v++){
    tests[v] = [];
    for(let u=0; u<1/res_u; u++){
        tests[v][u] = new Vector3();
    }
}

export const vase = {
    res_v: res_v,
    res_u: res_u,
    layer_height: 0.5,
    node(d, n){
        try{
            if(d.studio.mode == 'graph') return;
            delete d.n[n].c.curve;
            delete d.n[n].ax.curve;
            const surface  = d.n[d.n[n].n.surface[0]].c.surface;
            var pts = [];
            //const step = 1/this.res;
            surface.get_point(1, 0, v1);
            const start_y = v1.y;
            var ly = start_y;
            
            const bb1 = new Box3();
            for(let v=0; v<1/this.res_v; v++){
                for(let u=0; u<1/this.res_u; u++){
                    surface.get_point(1-u*this.res_u, v*this.res_v, tests[v][u]);
                    bb1.expandByPoint(tests[v][u]);
                }
            }
            
            var layer_count = 0;
            var ty = start_y;
            for(let i=0; i<10000; i++){
                for(let v=0; v<1/this.res_v; v++){
                    ty = start_y - (layer_count * this.layer_height + this.layer_height * v*this.res_v);
                    
                    // for(let u=0; u<1/this.res_u; u++){
                    //     surface.get_point(1-u*this.res_u, v*this.res_v, tests[v][u]);
                    // }
                    tests[v].sort((a,b)=> Math.abs(a.y-ty)-Math.abs(b.y-ty));
                    pts.push(tests[v][0].clone());
                }
                if(ty < bb1.min.y) break;
                layer_count++;
                //v++;
                //if(v > tests.length-1) v = 0;
            }
            
            d.n[n].c.curve = new CatmullRomCurve3(pts);
            d.n[n].ax.curve = d.n[n].c.curve;
            console.log('Reckoned vase!!!');
        }catch(e){
            console.log(e);
        } 
    }, 
};

// for(let u=0; u<1; u+=this.res){
//     for(let v=0; v<1; v+=this.res){
//         surface.get_point(u, v, v1);
//         pts.push(v1.clone());
//     }
// }

