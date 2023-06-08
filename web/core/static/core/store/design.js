import {current} from 'immer';
import { Vector3, Matrix4 } from 'three';

const tv = new Vector3();
const off_screen = new Vector3(10000,10000,0);
const tm = new Matrix4();

export const create_design_slice = (set,get)=>({design:{ 
    tags: ['line', 'sketch'],
    mode: '', // make this draw mode and make seperate delete mode (erase)
    part: null, 
    candidate: null, 
    matrix: new Matrix4(), // not following wrapper rule!!!
    pin_matrix: new Matrix4(),
    move_mode: '',
    mover: {pos: new Vector3()}, //, rot: new Vector3()
    pin_move(d){ // make drag slice?
        d.design.pin_matrix.copy(d.design.matrix).invert();
        d.pick.n.forEach(n => d.node.pin_pos(d, n));
    },
    move(d, matrix){ //offset
        d.design.matrix = matrix;
        d.pick.n.forEach(n=>{ // must check if point or position contents!!!!
            if(d.n[n].pin.pos){ //if(d.n[n].pin.pos){
                tv.copy(d.n[n].pin.pos).applyMatrix4(d.design.pin_matrix).applyMatrix4(matrix); // tv.copy(d.n[n].pin.pos).applyMatrix4(d.design.pin_matrix).applyMatrix4(matrix); 
                d.node.set_pos(d, n, tv);
            }
        });
    },
    make_point: (d, pos)=>{
        var r = d.design.part;
        if(d.n[r].t != 'line'){
            r = d.pick.get_if_one(d, ['line']); //, {one_tag:true}
            if(!r){
                r = d.make.part(d, 'line', {r:d.design.part});
                d.pick.one(d, r);
            }
        }
        var o = undefined;
        if(d.n[r].c.point && d.n[r].c.point.length > 1){ // upgrade to sample curve to find true closest creation and pick control points on either side of it
            const sorted = d.n[r].c.point.map((p,i)=>({i:i, d:tv.copy(p.pos).distanceTo(pos)})).sort((a,b)=>(a.d>=b.d?1:-1));
            var ad1 = sorted[0], ad2 = sorted[0];
            if(sorted[0].i-1 >= 0)            ad1 = {i:sorted[0].i-1, d:tv.copy(d.n[r].c.point[sorted[0].i-1].pos).distanceTo(pos)};
            if(sorted[0].i+1 < sorted.length) ad2 = {i:sorted[0].i+1, d:tv.copy(d.n[r].c.point[sorted[0].i+1].pos).distanceTo(pos)};
            o = Math.ceil((sorted[0].i + (ad1.d<ad2.d?ad1.i:ad2.i)) / 2); // ceil
            if(sorted[0].i == sorted.length-1) o+=2;
        }
        const n = d.make.point(d, pos, r, o); // must have insertion index. For now, using -1 for last
        d.pick.one(d, n, true);
    },
    update: d=>{
        d.design.candidate = d.pick.get_if_one(d, d.design.tags);
        if(!d.node.be(d, d.design.part)){ // use exists/available function here?  d.design.part && !d.n[d.design.part].open
            d.design.part = null;
            d.studio.mode = 'graph'; // move to studio update? only modify this section in update!!!
        }
        d.design.mover.pos.set(0,0,0);
        var count = 0;
        d.pick.n.forEach(n=>{
            if(d.n[n].c.pos){
                d.design.mover.pos.add(d.n[n].c.pos);
                count++;
            }
        });
        if(count > 0){
            d.design.mover = {
                pos: d.design.mover.pos.divideScalar(count).applyMatrix4(tm.copy(d.design.matrix).invert()),
            };
        }else{  d.design.mover = {pos:d.design.mover.pos.copy(off_screen)};  }
        if(d.pick.n.length===0) d.design.matrix.identity();
    },
}});


//if(d.pick.n.length == 1 && d.design.tags.includes(d.n[d.pick.n[0]].t)){  d.design.candidate = d.pick.n[0];  } 
        //else{  d.design.candidate = null;  }




//const mdi = sorted[0].i;
            //sorted.sort((a,b)=>(Math.abs(a.i-mdi)>Math.abs(a.i-mdi)));

// var md1={i:-1, d:Infinity}, md2={i:-1, d:Infinity};
            // d.n[r].n.point.forEach((n,i)=>{
            //     const dist = tv.copy(d.n[n].c.pos).distanceTo(pos);
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

