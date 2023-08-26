import {current} from 'immer';
import { Vector3, Euler, Matrix4, CatmullRomCurve3 } from 'three';
import { rs } from '../app.js';

const v1 = new Vector3();
const v2 = new Vector3();
const v3 = new Vector3();
//const off_screen = new Vector3(10000,10000,0);
const tm = new Matrix4();
//const tm1 = new Matrix4();
//const tm2 = new Matrix4();

// const canvas = document.createElement("canvas");
// const cctx = canvas.getContext("2d");
// const img = new Image();

const brush_radius = 50;

export const create_design_slice = (set,get)=>({design:{ 
    //tags: ['curve', 'mixed_curve', 'sketch'],
    n: [],
    mode: '', // make this draw mode and make seperate delete mode (erase)
    part: null, 
    candidate: null, 
    matrix: new Matrix4(), // not following wrapper rule!!!
    //pin_matrix: new Matrix4(),
    moving: false,
    painting: false,
    move_mode: '', 
    mover: {pos: new Vector3(), rot: new Euler(), active_axes:[true, true, false], show:false}, //, rot: new Vector3()
    ray_data(d,e){
        d.camera.getWorldDirection(v1);
        e.intersections[0].object.getWorldDirection(v2);
        if(v1.dot(v2) > 0) v2.negate(); 
        const p = e.intersections[0].point.add(v2.multiplyScalar(d.point_size / d.camera.zoom));
        return {
            n1: e.intersections[0].object.parent?.__r3f.memoizedProps.pickable,
            n3: e.intersections[0].object.parent?.parent?.parent?.__r3f.memoizedProps.pickable,
            pos: v3.set(d.rnd(p.x), d.rnd(p.y), d.rnd(p.z)),
        }; 
    },
    paint(d, e){ // on image
        const ray = d.design.ray_data(d,e);
        const n = ray.n1;
        if(!n) return;
        
        var canvas = d.n[n].c.canvas;
        var cctx = canvas.getContext("2d");
        var width = d.n[d.n[n].n.width[0]].v;//canvas.width = d.n[d.n[n].n.width[0]].v; //d.node.get(d, n, 'width')[0];
        var height = d.n[d.n[n].n.height[0]].v;//canvas.height = d.n[d.n[n].n.height[0]].v;

        if(d.n[n].ax.invert) ray.pos.applyMatrix4(d.n[n].ax.invert);
        if(d.n[n].c.invert) ray.pos.applyMatrix4(d.n[n].c.invert);
        var x = Math.round(( ray.pos.x + 200) / 400 * width);
        var y = Math.round((-ray.pos.y + 200) / 400 * height);


        //img.onload = function() {
            //cctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const grd = cctx.createRadialGradient(x, y, 5, x, y, brush_radius);
            grd.addColorStop(0, "red");
            grd.addColorStop(1, "rgba(255, 0, 0, 0)");
            cctx.fillStyle = grd;
            cctx.fillRect(x-brush_radius, y-brush_radius, brush_radius*2, brush_radius*2);
            d.node.set(d, n, {data:'live'}); //canvas.toDataURL()
            //console.log('new image load!');
            //rs(d=>{
                
                //console.log('saved to data!');
            //});
        //};
        //img.src = d.n[n].c.data;
        //console.log('paint!!!', d.n[n].t);
    },
    // end_paint(d, n){
    //     d.design.painting = false;
    //     d.node.set(d, n, {data:canvas.toDataURL()}); //canvas.toDataURL()
    // },
    pin_move(d){ // make drag slice?
        //d.design.pin_matrix.copy(d.design.matrix).invert();
        d.pick.n.forEach(n => d.node.pin_pos(d, n, d.design.matrix)); //d.design.matrix
    },
    move(d, matrix){ //offset
        d.design.matrix = matrix;
        d.pick.n.forEach(n=>{ // must check if point or position contents!!!!
            if(d.n[n].pin.pos){ //if(d.n[n].pin.pos){
                v1.copy(d.n[n].pin.pos).applyMatrix4(matrix); // v1.copy(d.n[n].pin.pos).applyMatrix4(d.design.pin_matrix).applyMatrix4(matrix);
                d.node.set_pos(d, n, v1);
            }
        });
    },
    make_point: (d, e)=>{
        const ray = d.design.ray_data(d,e);
        if(!ray.n3) return;
        var r = d.pick.get_if_one(d, ['curve']); //, {one_tag:true}
        if(!r){
            r = d.make.part(d, 'curve', {r:ray.n3}); // d.design.part
            d.pick.one(d, r);
            d.next('design.insert_point', r, ray.pos); // wait until next so matrix can cast to curve
        }else{
            d.design.insert_point(d, r, ray.pos);
        }        
    },
    insert_point(d, r, pos){ // in between points for a curve
        var o = undefined;
        if(d.n[r].n.point && d.n[r].n.point.length > 2){ // check for d.n[r].ax.curve ?!?!?!?!
            const test_pos = d.n[r].ax.curve.getPoints(200);//new CatmullRomCurve3(d.n[r].n.point.map(n=>d.n[n].ax.pos)).getPoints(200); //spaced points ?!?!?!?!   //d.n[r].c.pts.map(p=> p.pos)
            const tests = [];
            var o = 0;
            var prev_dist = 0;
            for (var i = 0; i < test_pos.length; i++) {
                //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
                const dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos
                if(dist > prev_dist){
                    //v1.copy(d.n[d.n[r].n.point[o]].ax.pos);
                    for (var k = o+1; k < d.n[r].n.point.length; k++) {
                        //let prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[k]].ax.pos);
                        if(d.n[d.n[r].n.point[o]].ax.pos.distanceTo(d.n[d.n[r].n.point[k]].ax.pos) > 1){
                        //if(dist < prev_dist){
                            o = k;
                            prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos);
                            //prev_dist = base_dist;
                            break;
                        }
                        //v1.copy(d.n[d.n[r].n.point[k]].ax.pos);
                    }
                    // o++;
                    // prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos
                    // for (var k = i+1; i=k < test_pos.length; k++) {
                    //     if(prev_dist  test_pos[k].distanceTo(d.n[d.n[r].n.point[o]].ax.pos)){
                    //         i = k;
                    //         break;
                    //     }
                    //     tests.push({o:o, dist:test_pos[k].distanceTo(pos)});
                    // }
                }else{ prev_dist = dist }
                tests.push({o:o, dist:test_pos[i].distanceTo(pos)});
            }
            prev_dist = Infinity;
            for (var i = 0; i < tests.length; i++) { // use .sort here ?!?!?!?!
                if(tests[i].dist < prev_dist){
                    o = tests[i].o;
                    prev_dist = tests[i].dist;
                    if(i == test_pos.length-1) o++;
                }
            }
        }
        const n = d.make.point(d, {pos:pos, r:r, o:o}); // must have insertion index. For now, using -1 for last
        d.pick.one(d, n, {t:true});
    },
    update(d){
        d.design.candidate = d.pick.get_if_one(d);//d.design.candidate = d.pick.get_if_one(d, d.component_tags);
        if(!d.n[d.design.candidate]?.n) d.design.candidate = null;
        if(!d.node.be(d, d.design.part)){ // use exists/available function here?  d.design.part && !d.n[d.design.part].open
            d.design.part = null;
            d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
        }
        d.design.mover.pos.set(0,0,0);
        d.design.mover.active_axes = [true, true, false];
        var count = 0;
        d.pick.n.forEach(n=>{
            if(d.n[n].ax.pos){
                d.design.mover.pos.add(d.n[n].ax.pos);
                count++;
            }
            if(d.n[n].ax.matrix){
                d.design.mover.rot.setFromRotationMatrix(d.n[n].ax.matrix);
            }
            if(d.n[n].c.top_view) d.design.mover.active_axes = [true, false, true];
            if(d.n[n].c.side_view) d.design.mover.active_axes = [false, true, true];
        });
        // if(count > 0){ 
        //     d.design.mover = {
        //         pos: d.design.mover.pos.divideScalar(count).applyMatrix4(tm.copy(d.design.matrix).invert()),
        //     };
        // }
        //}else{  d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};  }
        //if(d.pick.n.length===0) d.design.matrix.identity();
        if(d.studio.mode=='design' && d.design.move_mode=='move' && count > 0){ 
            //d.design.show_mover = true;
            d.design.mover = {...d.design.mover,
                show:true,
                pos: d.design.mover.pos.divideScalar(count).applyMatrix4(tm.copy(d.design.matrix).invert()),
            };
        }else{
            d.design.mover = {...d.design.mover, show:false};
            //d.design.show_mover = false;
            //d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};
            d.design.matrix.identity();
        }
    },
    show(d){
        //console.log('show');
        //console.trace();
        if(d.design.part){
            d.design.n = [d.design.part, ...d.node.n(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t] && d.n[n].design.vis);
            // d.design.n = Array.from( // use unique flag instead of set for performance ?!?!?!
            //     new Set([d.design.part, ...d.node.n(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t]))
            // );
        }else{
            d.design.n = [];
        }
    }
}});




// img.onload = function() {
//     cctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     const grd = cctx.createRadialGradient(x, y, 5, x, y, brush_radius);
//     grd.addColorStop(0, "red");
//     grd.addColorStop(1, "rgba(255, 0, 0, 0)");
//     cctx.fillStyle = grd;
//     cctx.fillRect(x-brush_radius, y-brush_radius, brush_radius*2, brush_radius*2);
//     console.log('new image load!');
//     rs(d=>{
//         d.node.set(d, n, {data:canvas.toDataURL()});
//         console.log('saved to data!');
//     });
// };
// img.src = d.n[n].c.data;





// o++;
// prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].ax.pos); //d.n[r].c.pts[o].pos


// const pts = curve.getPoints(100).sort((a,b)=> (a.distanceTo(pos) < b.distanceTo(pos))?-1:1);
            // d.n[r].c.pts.forEach(p=>{});

// if(d.n[r].c.pts && d.n[r].c.pts.length > 1){ // upgrade to sample curve to find true closest creation and pick control points on either side of it
//     const sorted = d.n[r].c.pts.map((p,i)=>({i:i, d:tv.copy(p.pos).distanceTo(pos)})).sort((a,b)=>(a.d>=b.d?1:-1));
//     var ad1 = sorted[0], ad2 = sorted[0];
//     if(sorted[0].i-1 >= 0)            ad1 = {i:sorted[0].i-1, d:tv.copy(d.n[r].c.pts[sorted[0].i-1].pos).distanceTo(pos)};
//     if(sorted[0].i+1 < sorted.length) ad2 = {i:sorted[0].i+1, d:tv.copy(d.n[r].c.pts[sorted[0].i+1].pos).distanceTo(pos)};
//     o = Math.ceil((sorted[0].i + (ad1.d<ad2.d?ad1.i:ad2.i)) / 2); // ceil
//     if(sorted[0].i == sorted.length-1) o+=2;
// }

//if(d.pick.n.length == 1 && d.design.tags.includes(d.n[d.pick.n[0]].t)){  d.design.candidate = d.pick.n[0];  } 
        //else{  d.design.candidate = null;  }




//const mdi = sorted[0].i;
            //sorted.sort((a,b)=>(Math.abs(a.i-mdi)>Math.abs(a.i-mdi)));

// var md1={i:-1, d:Infinity}, md2={i:-1, d:Infinity};
            // d.n[r].n.point.forEach((n,i)=>{
            //     const dist = tv.copy(d.n[n].w.pos).distanceTo(pos);
            //     if(dist < md1.d){  md2.i=md1.i; md2.d=md1.d;  md1.i=i; md1.d=dist;   }
            // });


//end_move(d){
    //    console.log('end drag');
    //    d.design.move(d, d.design.matrix, tv2.set(.01, .01, 0));// must set some send-flag instead of doing offset workaround  //d.pick.n.forEach(n => d.node.set(d, n, {x}));
    //},


//pointers: 0,
    //pin_pos: new Vector3(),
    //dragging: false,

// stop_dragging:(d)=>{
    //     if(d.board.dragging){
    //         d.board.dragging = false;
    //         //d.pick.n.forEach(n=>{
    //         //    d.node.delta(d, d.node.get(d,n,'x'), 0.0001); // change to send flag
    //         //    d.node.delta(d, d.node.get(d,n,'y'), 0.0001);
    //         //    d.node.delta(d, d.node.get(d,n,'z'), 0.0001);
    //         //});
    //     }
    // },
    // drag: (d, pos)=>{
    //     delta.copy(pos).sub(d.board.pin_pos);
    //     if(d.board.pointers == 1){ 
    //         if(!d.board.dragging && delta.length() > 4){
    //             d.board.dragging = true;
    //             d.pick.n.forEach(n => {
    //                 d.node.pin(d, d.node.get(d,n,'x'));
    //                 d.node.pin(d, d.node.get(d,n,'y'));
    //                 d.node.pin(d, d.node.get(d,n,'z'));
    //             });
    //         }
    //     }else{
    //         d.board.stop_dragging(d);
    //     }
    //     if(d.board.dragging){
    //         //console.log('drag', d.board.pointers, tv);
    //         d.pick.n.forEach(n=>{
    //             //console.log(current(d.node.get(d,n,'x')));
    //             d.node.delta(d, d.node.get(d,n,'x'), delta.x);
    //             d.node.delta(d, d.node.get(d,n,'y'), delta.y);
    //             d.node.delta(d, d.node.get(d,n,'z'), delta.z);
    //         });
    //     }
    // },

