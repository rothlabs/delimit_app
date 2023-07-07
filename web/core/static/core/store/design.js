import {current} from 'immer';
import { Vector3, Matrix4, CatmullRomCurve3 } from 'three';

const tv = new Vector3();
const off_screen = new Vector3(10000,10000,0);
const tm = new Matrix4();
const tm1 = new Matrix4();
const tm2 = new Matrix4();

export const create_design_slice = (set,get)=>({design:{ 
    //tags: ['curve', 'mixed_curve', 'sketch'],
    n: [],
    mode: '', // make this draw mode and make seperate delete mode (erase)
    part: null, 
    candidate: null, 
    matrix: new Matrix4(), // not following wrapper rule!!!
    //pin_matrix: new Matrix4(),
    moving: false,
    move_mode: '', 
    mover: {pos: new Vector3()}, //, rot: new Vector3()
    pin_move(d){ // make drag slice?
        //d.design.pin_matrix.copy(d.design.matrix).invert();
        d.pick.n.forEach(n => d.node.pin_pos(d, n, d.design.matrix)); //d.design.matrix
    },
    move(d, matrix){ //offset
        d.design.matrix = matrix;
        d.pick.n.forEach(n=>{ // must check if point or position contents!!!!
            if(d.n[n].pin.pos){ //if(d.n[n].pin.pos){
                tv.copy(d.n[n].pin.pos).applyMatrix4(matrix); // tv.copy(d.n[n].pin.pos).applyMatrix4(d.design.pin_matrix).applyMatrix4(matrix);
                d.node.set_pos(d, n, tv);
            }
        });
    },
    make_point: (d, pos)=>{
        var r = d.design.part;
        if(d.n[r].t != 'curve'){
            r = d.pick.get_if_one(d, ['curve']); //, {one_tag:true}
            if(!r){
                r = d.make.part(d, 'curve', {r:d.design.part});
                d.pick.one(d, r);
            }
        }
        var o = undefined;
        if(d.n[r].n.point && d.n[r].n.point.length > 1){
            const test_pos = new CatmullRomCurve3(d.n[r].n.point.map(n=>d.n[n].w.pos)).getPoints(100); //d.n[r].c.pts.map(p=> p.pos)
            const tests = [];
            var o = 0;
            var prev_dist = 0;
            for (var i = 0; i < test_pos.length; i++) {
                const dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].w.pos); //d.n[r].c.pts[o].pos
                if(dist > prev_dist){
                    o++;
                    prev_dist = test_pos[i].distanceTo(d.n[d.n[r].n.point[o]].w.pos); //d.n[r].c.pts[o].pos
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
        var count = 0;
        d.pick.n.forEach(n=>{
            if(d.n[n].w.pos){
                d.design.mover.pos.add(d.n[n].w.pos);
                count++;
            }
        });
        if(count > 0){ 
            d.design.mover = {
                pos: d.design.mover.pos.divideScalar(count).applyMatrix4(tm.copy(d.design.matrix).invert()),
            };
        }//}else{  d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};  }
        //if(d.pick.n.length===0) d.design.matrix.identity();
        if(!(d.studio.mode=='design' && d.design.move_mode=='move' && count > 0)){ 
            d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};
            d.design.matrix.identity();
        }
    },
    show(d){
        console.log('show');
        //console.trace();
        if(d.design.part){
            d.design.n = [d.design.part, ...d.node.n(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t]);
            // d.design.n = Array.from( // use unique flag instead of set for performance ?!?!?!
            //     new Set([d.design.part, ...d.node.n(d, d.design.part, {deep:true})].filter(n=> d.component[d.n[n].t]))
            // );
        }else{
            d.design.n = [];
        }
    }
}});



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

