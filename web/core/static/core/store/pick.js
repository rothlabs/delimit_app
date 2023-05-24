import {current} from 'immer';
import {model_tags, float_tags, design_tags} from './base.js';
import { theme } from '../app.js';

const pick_reckon_tags = ['point'];

export const create_pick_slice = (set,get)=>({pick:{
    nodes: [],
    multi: false, // rename to multi

    delete: (d, shallow)=>{
        d.pick.nodes.forEach(n => d.node.delete(d,n,shallow));
        d.consume = d.send; // instead of setting consume here, make ssp_send and ssp_recieve?
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
        if(pick_reckon_tags.includes(d.n[n].t)) d.node.reckon(d,n);
    },

    none:d=>{
        Object.values(d.n).forEach(n=> n.pick.picked=false);
        d.pick.update(d);
    },

    one: (d, n)=>{
        d.pick.none(d);
        d.n[n].pick.picked = true;
        d.pick.update(d);
        if(d.n[n].pick.picked) console.log(n, current(d).n[n]);
    },

    mod: (d, n, picked)=>{
        d.n[n].pick.picked = picked;
        d.pick.update(d);
    },

    update: d=>{ // rename as update
        Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
            if(!d.n[n].open) d.n[n].pick.picked=false;
            d.pick.color(d,n);
        }); 
        d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].pick.picked); // make this a common function (iterate all nodes with filter and func 
        d.pick.nodes.forEach(n=>{
            if(pick_reckon_tags.includes(d.n[n].t)) d.node.reckon(d,n);
        });
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