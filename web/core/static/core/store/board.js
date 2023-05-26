import { Vector3 } from "three";
import {current} from 'immer';

const delta = new Vector3();

export const create_board_slice = (set,get)=>({board:{ 
    mode: '',
    //pointers: 0,
    //pin_pos: new Vector3(),
    //dragging: false,
    make_point: (d, pos)=>{
        d.make.point(d, pos, -1); // must have insertion index. For now, using -1 for last
    },
    // stop_dragging:(d)=>{
    //     if(d.board.dragging){
    //         d.board.dragging = false;
    //         //d.pick.nodes.forEach(n=>{
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
    //             d.pick.nodes.forEach(n => {
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
    //         d.pick.nodes.forEach(n=>{
    //             //console.log(current(d.node.get(d,n,'x')));
    //             d.node.delta(d, d.node.get(d,n,'x'), delta.x);
    //             d.node.delta(d, d.node.get(d,n,'y'), delta.y);
    //             d.node.delta(d, d.node.get(d,n,'z'), delta.z);
    //         });
    //     }
    // },
}});

