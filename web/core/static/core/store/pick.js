//import {produce, produceWithPatches} from 'immer';
import {model_tags, float_tags, design_tags} from './basic.js';

//export const create_select_slice = (set,get)=>({

export const pick = {
    nodes: [],
    multiselect: false, // rename to multi

    delete: d=>{
        d.pick.nodes.forEach(n => {
            if(d.n[n].asset) {
                d.n[n].open = false;
                d.n[n].delete = true;
            }
        });
        d.consume = d.send;
    },

    set_v: (d, t, v)=>{ 
        d.inspect.content[t] = v;
        if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
        if(Object.values(model_tags).includes(t)){
            d.pick.nodes.forEach(n => {
                if(model_tags[d.n[n].m] == t) {
                    d.n[n].v = v;
                    d.n[n].c[t] = v;
                }
            });
        }else{
            d.pick.nodes.forEach(n => {
                if(d.n[n].m=='p' && d.n[n].n[t]) {
                    d.n[d.n[n].n[t][0]].v = v;
                    d.n[n].c[t] = v;
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
    },

    update: d=>{ // rename as update
        Object.values(d.n).forEach(n =>{ if(!n.open) n.picked=false;}); 
        d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].picked); 
        if(d.pick.nodes.length == 1 && design_tags.includes(d.n[d.pick.nodes[0]].t)){  d.design.candidate = d.pick.nodes[0];  }
        else{  d.design.candidate = null;  }
        d.inspect.update(d);
    },

}
//});