import {current} from 'immer';
import {model_tags, float_tags, design_tags} from './base.js';
import { theme } from '../app.js';
import { Vector3, Matrix4 } from 'three';

const tv = new Vector3();
const pos = new Vector3();

const tm = new Matrix4();

export const create_pick_slice = (set,get)=>({pick:{
    reckon_tags: ['point'],
    nodes: [],
    mode: 'one', 
    matrix: new Matrix4(),
    start_matrix: new Matrix4(),
    //pin: {matrix: new Matrix4()},
    //drag_info: {},
    //pin: new Vector3(),
    //drag_mode: '',


    start_drag(d,e){ // make drag slice?
        d.pick.start_matrix.copy(d.pick.matrix).invert();
        //d.pick.drag_info = e;
        //drag_mode = 
        //d.pick.pin = e.origin;
        //console.log(d.pick.drag_info.directions);
        d.pick.nodes.forEach(n => {
            d.node.pin(d, n);
            //d.node.reckon(d,n);
            //d.node.pin(d, d.node.get(d,n,'x'));
            //d.node.pin(d, d.node.get(d,n,'y'));
            //d.node.pin(d, d.node.get(d,n,'z'));
        });
    },

    //end_drag(d){
    //    d.pick.old_matrix.copy(d.pick.matrix);
    //},

    drag(d, matrix){
        d.pick.matrix = matrix;
        //console.log(current(d.node.get(d,n,'x')));
        //tv.set(0,0,0).applyMatrix4(matrix);
        //if(d.pick.drag_info.component == 'Slider' || d.pick.drag_info.component == 'Arrow'){
            
            d.pick.nodes.forEach(n=>{ // must check if point or position contents!!!!
                //applyMatrix4(tm.makeBasis(...d.pick.drag_info.directions).invert())
                pos.copy(d.n[n].pin.pos).applyMatrix4(d.pick.start_matrix).applyMatrix4(matrix);//.sub(d.pick.drag_info.origin);
                d.node.set_pos(d, n, pos);
                //d.node.delta(d, d.node.get(d,n,'x'), delta.x);
                //d.node.delta(d, d.node.get(d,n,'y'), delta.y);
                //d.node.delta(d, d.node.get(d,n,'z'), delta.z);
            });
        //d.pick.pin = {matrix: d.pick.pin.matrix.copy(matrix)};
        // }else if(d.pick.drag_info.component == 'Rotator'){
        //     d.pick.nodes.forEach(n=>{
        //         if(d.n[n].pin.pos){
        //             pos.copy(d.n[n].pin.pos).applyMatrix4(matrix).sub(d.pick.drag_info.origin);

        //             d.node.set_pos(d, n, pos);
        //             //d.node.delta(d, d.node.get(d,n,'x'), delta.x);
        //             //d.node.delta(d, d.node.get(d,n,'y'), delta.y);
        //             //d.node.delta(d, d.node.get(d,n,'z'), delta.z);
        //         }
        //     });
        // }
    },

    set(d, n, v){
        d.n[n].pick.picked = v;
        if(v){ d.add(d.pick.nodes, n)}
        else{  d.pop(d.pick.nodes, n)}
        d.pick.color(d,n);
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.reckon.node(d, n);//d.next('reckon.node', n); 
        d.next('design.update');
        d.next('inspect.update');
    },
    delete(d, shallow){
        d.pick.nodes.forEach(n=> d.node.delete(d,n,shallow));
    },
    sv(d, t, v){ // change to set_v
        d.inspect.content[t] = v;
        if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
        if(t!='part' && Object.values(model_tags).includes(t)){ // is atom?
            d.pick.nodes.forEach(n => {
                if(model_tags[d.n[n].m] == t) d.node.sv(d, n, v);//d.n[n].v = v;
            });
        }else{
            d.pick.nodes.forEach(n => {
                if(d.n[n].m=='p') d.node.set(d, n, {[t]:v}); // if(d.n[n].m=='p' && d.n[n].n[t]) d.node.sv(d, d.n[n].n[t][0], v); // d.node.set(d, n, {t:v})             //d.n[d.n[n].n[t][0]].v = v; 
            });
        }
    },
    hover(d, n, hover){
        d.n[n].pick.hover = hover;
        d.pick.color(d,n);
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.reckon.node(d, n);//d.next('reckon.node', n); 
    },
    none(d){
        const nodes = [...d.pick.nodes];
        nodes.forEach(n=> d.pick.set(d, n, false)); //d.n[n].pick.picked=false   Object.values(d.n).forEach(n=> n.pick.picked=false);
    },
    one(d, n){
        d.pick.none(d);
        d.pick.set(d, n, true)
        if(d.n[n].pick.picked) console.log(n, current(d).n[n]);
    },
    color(d,n){
        const selector = d.n[n].pick.picked || d.n[n].pick.hover;
        d.n[n].pick.color = [
            selector ? theme.primary : theme.secondary,
            selector ? theme.primary : 'white',
            selector ? 'white' : theme.primary,
        ];
    },
}});

//mod: (d, n, picked)=>{
    //    d.n[n].pick.picked = picked;
        //d.pick.update(d);
    //},

    // update: d=>{ // rename as update
    //     Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
    //         if(!d.n[n].open) d.n[n].pick.picked=false;
    //         d.pick.color(d,n);
    //     }); 
    //     d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].pick.picked); // make this a common function (iterate all nodes with filter and func 
    //     d.pick.nodes.forEach(n=>{
    //         if(pick_reckon_tags.includes(d.n[n].t)) d.reckon.node(d,n);
    //     });
    //     d.design.update(d);
    //     d.inspect.update(d);
    // },