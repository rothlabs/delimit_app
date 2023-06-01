import {current} from 'immer';
//import {model_tags, float_tags} from './base.js';
import { theme } from '../app.js';

//const tv = new Vector3();

export const create_pick_slice = (set,get)=>({pick:{
    reckon_tags: ['point'],
    nodes: [], // rename to n ?
    mode: 'one', 
    set(d, n, v){
        d.n[n].pick.pick = v;
        if(v){ d.add(d.pick.nodes, n)}
        else{  d.pop(d.pick.nodes, n)}
        d.pick.color(d,n);
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.reckon.node(d, n);//d.next('reckon.node', n); 
        d.next('design.update');
        d.next('inspect.update');
    },
    get(d,t){
        if(d.pick.nodes.length == 1 && d.n[d.pick.nodes[0]].t == t) return d.pick.nodes[0];
        return false;
    },
    delete(d, shallow){
        const nodes = [...d.pick.nodes];
        nodes.forEach(n=> d.node.delete(d,n,shallow));
    },
    sv(d, t, v){ // change to set_v
        d.inspect.content[t] = v;
        if(d.float_tags.includes(t)){   v=+v;  if(isNaN(v)) v=0;   } // check model of each atom instead?
        if(t!='part' && Object.values(d.model_tags).includes(t)){ // is atom?
            d.pick.nodes.forEach(n => {
                if(d.model_tags[d.n[n].m] == t) d.node.sv(d, n, v);//d.n[n].v = v;
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
        nodes.forEach(n=> d.pick.set(d, n, false)); //d.n[n].pick.pick=false   Object.values(d.n).forEach(n=> n.pick.pick=false);
    },
    one(d, n){
        d.pick.none(d);
        d.pick.set(d, n, true)
        if(d.n[n].pick.pick) console.log(n, current(d).n[n]);
    },
    color(d,n){
        const selector = d.n[n].pick.pick || d.n[n].pick.hover;
        d.n[n].pick.color = [
            selector ? theme.primary : theme.secondary,
            selector ? theme.primary : 'white',
            selector ? 'white' : theme.primary,
        ];
    },
}});

//mod: (d, n, pick)=>{
    //    d.n[n].pick.pick = pick;
        //d.pick.update(d);
    //},

    // update: d=>{ // rename as update
    //     Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
    //         if(!d.n[n].open) d.n[n].pick.pick=false;
    //         d.pick.color(d,n);
    //     }); 
    //     d.pick.nodes = Object.keys(d.n).filter(n=> d.n[n].pick.pick); // make this a common function (iterate all nodes with filter and func 
    //     d.pick.nodes.forEach(n=>{
    //         if(pick_reckon_tags.includes(d.n[n].t)) d.reckon.node(d,n);
    //     });
    //     d.design.update(d);
    //     d.inspect.update(d);
    // },