import {current} from 'immer';
import {model_tags, float_tags, design_tags} from './base.js';

export const create_pick_slice = (set,get)=>({pick:{
    nodes: [],
    multiselect: false, // rename to multi

    delete: d=>{
        d.pick.nodes.forEach(n => d.node.delete(d,n));
    },

    set_v: (d, t, v)=>{ 
        d.inspect.content[t] = v;
        if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
        if(t!='part' && Object.values(model_tags).includes(t)){ 
            d.pick.nodes.forEach(n => {
                if(model_tags[d.n[n].m] == t) {
                    d.n[n].v = v;
                    d.n[n].update(d);
                    //d.n[n].c[t] = v;
                }
            });
        }else{
            d.pick.nodes.forEach(n => {
                if(d.n[n].m=='p' && d.n[n].n[t]) {
                    d.n[d.n[n].n[t][0]].v = v;
                    //d.n[n].c[t] = v;
                    d.n[n].update(d);
                }
            });
        }
        d.consume = d.send;
    },

    hover: (d, n, hover)=>{
        d.n[n].hover = hover;
    },

    one: (d, n)=>{
        Object.values(d.n).forEach(n=> n.picked=false);
        d.n[n].picked = true;
        d.pick.update(d);
    },

    mod: (d, n, picked)=>{
        d.n[n].picked = picked;
        d.pick.update(d);
        if(d.n[n].picked) console.log(current(d).n[n]);
    },

    update: d=>{ // rename as update
        Object.values(d.n).forEach(n =>{ if(!n.open) n.picked=false;}); 
        d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].picked); 
        d.design.update(d);
        d.inspect.update(d);
    },

}});