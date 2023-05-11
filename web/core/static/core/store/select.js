import {produce, produceWithPatches} from 'immer';
import {model_tags, float_tags, design_tags} from './basic.js';

export const create_select_slice = (set,get)=>({

    multiselect: false,

    selected: {
        nodes: [],
        edit_val: (t,v)=>{ 
            get().edit(d=>{
                d.inspect.content[t] = v;
                if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
                if(Object.values(model_tags).includes(t)){
                    d.selected.nodes.forEach(n => {
                        if(model_tags[d.n[n].m] == t) {
                            d.n[n].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }else{
                    d.selected.nodes.forEach(n => {
                        if(d.n[n].m=='p' && d.n[n].n[t]) {
                            d.n[d.n[n].n[t][0]].v = v;
                            d.n[n].c[t] = v;
                        }
                    });
                }
            });
        },
    }, 

    hover: (n, hover)=>set(produce(d=>{
        d.n[n].hover = hover;
    })),

    set_select: n=>set(produce(d=>{
        Object.values(d.n).forEach(n=> n.selected=false);
        d.n[n].selected = true;
        d.post_select(d);
    })),

    select: (n, selected)=>set(produce(d=>{  // get rid of produce here 
        d.n[n].selected = selected;
        d.post_select(d);
    })),

    // clear_select: d=>{
    //     Object.values(d.n).forEach(n => n.selected=false); 
    //     d.post_select(d);
    // },


    post_select: d=>{ // rename as update
        Object.values(d.n).forEach(n =>{ if(!n.open) n.selected=false;}); 
        d.selected.nodes = Object.keys(d.n).filter(n=> d.n[n].selected); 
        if(d.selected.nodes.length == 1 && design_tags.includes(d.n[d.selected.nodes[0]].t)){  d.design.candidate = d.selected.nodes[0];  }
        else{  d.design.candidate = null;}
        d.inspect.update(d);
    },

});