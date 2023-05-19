import {current} from 'immer';
import {model_tags, float_tags, design_tags} from './base.js';
import { theme } from '../app.js';

export const create_pick_slice = (set,get)=>({pick:{
    nodes: [],
    multi: false, // rename to multi

    delete: d=>{
        d.pick.nodes.forEach(n => d.node.delete(d,n));
    },

    sv: (d, t, v)=>{ 
        d.inspect.content[t] = v;
        if(float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
        if(t!='part' && Object.values(model_tags).includes(t)){ 
            d.pick.nodes.forEach(n => {
                if(model_tags[d.n[n].m] == t) {
                    d.n[n].v = v;
                    d.node.reckon(d,n); // make patch consumer decide what node to reckon    //d.n[n].c[t] = v;
                }
            });
        }else{
            d.pick.nodes.forEach(n => {
                if(d.n[n].m=='p' && d.n[n].n[t]) {
                    d.n[d.n[n].n[t][0]].v = v; //d.n[n].c[t] = v;
                    d.node.reckon(d,n);
                }
            });
        }
        d.consume = d.send;
    },

    hover: (d, n, hover)=>{
        d.n[n].pick.hover = hover;
        d.pick.color(d,n);
    },

    one: (d, n)=>{
        Object.values(d.n).forEach(n=> n.pick.picked=false);
        d.n[n].pick.picked = true;
        d.pick.update(d);
    },

    mod: (d, n, active)=>{
        d.n[n].pick.picked = active;
        d.pick.update(d);
        if(d.n[n].pick.picked) console.log(current(d).n[n]);
    },

    update: d=>{ // rename as update
        Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
            if(!d.n[n].open) d.n[n].pick.picked=false;
            d.pick.color(d,n);
        }); 
        d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].pick.picked); // make this a common function (iterate all nodes with filter and func 
        d.design.update(d);
        d.inspect.update(d);
    },

    color:(d,n)=>{
        const selector = d.n[n].pick.picked || d.n[n].pick.hover;
        d.n[n].pick.color = [
            selector ? theme.primary : theme.secondary,
            selector ? theme.primary : 'white',
            selector ? 'white' : theme.primary,
        ];
    },
}});