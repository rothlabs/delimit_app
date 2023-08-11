import {current} from 'immer';
import {Vector3, Matrix4, MathUtils, LineCurve3, CurvePath} from 'three';

////////////////////////////////  Machine Data //////////////////////
// Home is -1000 for X and Z 
// Home is 0 for Y
// For tool +Z at center top of rod: X:-835, Y:-5, Z:-674, A:-58, B:0
// A-Axis:
    //0 is limit switch 
    //-58 aims tool to +Z 
    //-148 tool aims +Y 
    //-238 aims tool to -Z  
/////////////////////////////////////////////////////////////////////

const v1 = new Vector3();
const m1 = new Matrix4();//.makeRotationY(Math.PI*2/rot_res);
const back = new Vector3(0,0,-1);
const nml_smooth_range = 12;
const feed = 30; // mm per second
const start_offset = -10;
const hx = -835;
const hy = -5;
const hz = -674;

export const post = {
    node(d, n){
        try{
            delete d.n[n].c.code;
            delete d.n[n].ax.curve;
            var paths = [];
            function get_paths(nn){
                const path_nodes = [];
                d.node.for_n(d, nn, (r,nnn)=>{
                    if(d.n[nnn].c.paths != undefined){
                        paths = paths.concat(d.n[nnn].c.paths);
                        path_nodes.push(nnn);
                    }
                });
                path_nodes.forEach(nnn=> get_paths(nnn));
            }
            get_paths(n);
            var curve = new CurvePath();
            curve.arcLengthDivisions = 2000;
            const pts = [];
            const nml = [];
            const n_ref = [];
            const dis = [0];
            paths.forEach(path=>{
                path.forEach(pn=>{
                    pts.push(pn.p.clone());
                    nml.push(pn.n.clone());
                    n_ref.push(pn.n.clone());
                    if(pts.length > 1){
                        curve.add(new LineCurve3(pts.at(-2), pts.at(-1)));
                        dis.push(pts.at(-2).distanceTo(pts.at(-1)));
                    }
                });
            });
            //for(let i=nml_smooth_range; i<nml.length-nml_smooth_range; i++){ // not smoothing front and end !!!!!!
            for(let i=0; i<nml.length; i++){ 
                var vc = 1;
                for(let k=-nml_smooth_range; k<=nml_smooth_range; k++){ 
                    if(k != 0 && n_ref[i+k]){
                        nml[i].add(n_ref[i+k]);
                        vc++;
                    }
                }
                nml[i].divideScalar(vc);
                //nml[i].divideScalar(nml_smooth_range*2 + 1);
            }

            var angle_a = -58; 
            //v1.set(nml[0].x, 0, nml[0].z);
            //let shift_angle_b = back.angleTo(v1) * Math.sign(nml[0].x);
            var angle_b = 0; // need to set to start of path 
            var code = 'G21 G90 G93 \r\n'; // g21=mm g90=absolute g93=inverse-time-feed
            code += 'G92 B0 \r\n'; // reset B-axis (shoe spinner)
            code += 'G0 X'+hx+' Y-300 A'+angle_a+' \r\n';
            code += 'G0 Z'+(hz-pts[0].z-start_offset)+' \r\n';
            code += 'G0 Y'+hy+' \r\n';
            code += 'G1 Z'+(hz-pts[0].z)+' F30 \r\n \r\n';
            for(let i=0; i<pts.length; i++){ 
                v1.set(nml[i].x, 0, nml[i].z); //v1.set(normal.x, 0, normal.z);//
                let shift_angle_b = back.angleTo(v1) * Math.sign(nml[i].x); // Math.sign(normal.x); //// add something factor here ?!?!?!?!?!
                m1.makeRotationY(shift_angle_b); 
                pts[i].applyMatrix4(m1); //Vector3.applyAxisAngle 
                angle_b += shift_angle_b;
                if(i < pts.length-1){
                    m1.makeRotationY(angle_b);
                    pts[i+1].applyMatrix4(m1);
                    nml[i+1].applyMatrix4(m1);
                }
                code += 'G1 X'+d.rnd(hx+pts[i].x, 1000) + ' Y'+d.rnd(hy-pts[0].y+pts[i].y, 1000)+ ' Z'+d.rnd(hz-pts[i].z, 1000);
                code += ' A'+d.rnd(angle_a, 1000); 
                code += ' B'+d.rnd(MathUtils.radToDeg(-angle_b), 1000);
                code += ' F'+d.rnd(feed/dis[i]*60, 1000); 
                code += '\r\n';
            }
            d.n[n].c.code = code;
            d.n[n].ax.curve = curve;
        }catch(e){
            console.log(e);
        } 
    }, 
};

//if(dis[i] == 0) continue;


            // var curve = new CatmullRomCurve3(pts);
            // curve.arcLengthDivisions = 2000;
            // var nml_curve = new CatmullRomCurve3(nml);
            // nml_curve.arcLengthDivisions = 2000;
            // //pts = pts.map(p=> p.clone());

            // const pt_count = Math.round(curve.getLength()*code_res);
            // pts = curve.getSpacedPoints(pt_count);
            // // nml = nml_curve.getSpacedPoints(pt_count);
            // var nml = [];
            // var nml2 = [];
            // //var normal = new Vector3(0,0,-1);
            // var t = 0;
            // var step_t = 1/pts.length/100;
            // for(let i=0; i<pts.length; i++){ 
            //     var prev_dist = 10000;
            //     for(let k=0; k<100000; k++){ 
            //         t += step_t;
            //         var normal = nml_curve.getPoint(t);
            //         let dist = normal.distanceTo(pts[i]);
            //         if(dist > prev_dist){
            //             t -= step_t;
            //             nml_curve.getPoint(t, normal);
            //             break;
            //         }
            //         prev_dist = dist;
            //     }
            //     normal.sub(pts[i]);
            //     nml.push(normal);
            //     nml2.push(normal.clone());
            // }


                    // let step = Math.round(v1.distanceTo(pts[i]) / 1); // fill point every 1 mm
                    // if(step < 1) step = 1;
                    // for(let k=1; k<=step; k++){ 
                    //     let step_angle_b = shift_angle_b*(k/step);
                    //     m1.makeRotationY(step_angle_b); 
                    //     v2.copy(v1).applyMatrix4(m1);
                    //     //rpts.push(v2.clone());
                    //     gpts.push(v2.clone());
                    //     code += 'G1 X'+d.rnd(v2.x) + ' Y'+d.rnd(v2.y)+ ' Z'+d.rnd(v2.z);
                    //     code += ' A'+0+ ' B'+d.rnd(MathUtils.radToDeg(base_angle_b + step_angle_b));
                    //     code += ' F1000'; // mm per minute
                    //     code += '\r\n';
                    // }