import {current} from 'immer';
//import {model_tags, float_tags} from './base.js';
import { theme } from '../app.js';

//const tv = new Vector3();

export const create_pick_slice = (set,get)=>({pick:{
    reckon_tags: ['point'],
    nodes: [], // rename to n ? // make null if empty?
    group: null,
    target: null,
    mode: '', 
    limited: false, // rename to remakeable
    addable: false,
    removable: false,
    mergable: false,
    splittable: false,
    deletable: false,
    set(d, n, v){
        d.n[n].pick.pick = v;
        if(v){ d.add(d.pick.nodes, n)}
        else{  d.pop(d.pick.nodes, n)}
        d.pick.color(d,n);
        d.pick.update(d);
    },
    update(d){
        d.pick.group = d.pick.nodes.slice(0,-1);
        d.pick.target = d.pick.nodes.at(-1);
        d.pick.limited = d.node.limited(d, d.pick.nodes);
        d.pick.addable = false;
        d.pick.removable = false;
        d.pick.mergable = false;
        d.pick.splittable = false;
        d.pick.deletable = d.pick.nodes.some(n=> d.n[n].asset);
        if(d.pick.nodes.length > 1){
            const target_nodes = d.node.n(d,d.pick.target);
            d.pick.addable = d.n[d.pick.target].asset 
                && !d.node.n(d,d.pick.group,{deep:true}).includes(d.pick.target) 
                && d.pick.group.some(n=> !target_nodes.includes(n));
            d.pick.removable = d.n[d.pick.target].asset && d.pick.group.some(n=> target_nodes.includes(n));//d.node.n(d,d.pick.target).some(n=> d.pick.group.includes(n));
            d.pick.mergable = d.n[d.pick.target].asset && d.pick.nodes.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);
            d.pick.splittable = d.pick.group.every(n=> (d.n[n].asset && d.node.n(d,n).includes(d.pick.target))); 
        }
        d.pick.nodes.forEach(n=> d.pick.color(d,n));
        d.next('design.update');
        d.next('inspect.update');
    },
    get_if_one(d, t){ // add option to also check absolute length==1 before filtering?
        var nodes = d.pick.nodes;
        if(t!=undefined) nodes = d.pick.nodes.filter(n=> t.includes(d.n[n].t));
        if(nodes.length == 1) return nodes[0];
        return null;
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
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.next('reckon.node', n); //d.reckon.node(d, n);//
    },
    none(d, t){
        var nodes = [...d.pick.nodes];
        if(t) nodes = nodes.filter(n=> d.n[n].t==t);
        nodes.forEach(n=> d.pick.set(d, n, false)); //d.n[n].pick.pick=false   Object.values(d.n).forEach(n=> n.pick.pick=false);
    },
    one(d, n, of_tag){
        d.pick.none(d, of_tag ? d.n[n].t : null);
        d.pick.set(d, n, true);
        if(d.n[n].pick.pick) console.log(n, current(d).n[n]);
    },
    colors: [[theme.primary, theme.primary_l, 'primary'], [theme.info, theme.info_l, 'info']],
    color(d,n){
        const selector = d.n[n].pick.pick || d.n[n].pick.hover;
        const target = (n == d.pick.target ? 1 : 0);
        d.n[n].pick.color = [
            selector ? d.pick.colors[target][0] : theme.secondary,
            selector ? d.pick.colors[target][0] : 'white',
            selector ? 'white' : theme.primary,
            selector ? d.pick.colors[target][1] : theme.secondary_l,
            selector ? d.pick.colors[target][2] : 'secondary',
        ];
        if(d.pick.reckon_tags.includes(d.n[n].t)) d.next('reckon.node', n); // only call if color changes !?!?!?!?
    },
}});

// get_if_same(d){
    //     if(d.pick.nodes.length>1 && d.pick.nodes.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) return d.pick.nodes;
    //     return null;
    // },

//d.pick.same = d.pick.nodes.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);

// d.node.for_n(d, d.pick.nodes, (r,n)=>{
        //     if(d.n[n].asset && n == d.pick.nodes.at(-1)) d.pick.splittable = true;
        // });

//if(d.pick.nodes.length>1 && d.pick.nodes.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) d.pick.same = d.pick.nodes;
        //d.pick.all_asset = d.pick.nodes.every(n=> d.n[n].asset);

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