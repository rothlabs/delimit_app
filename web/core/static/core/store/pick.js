import {current} from 'immer';
//import {model_tags, float_tags} from './base.js';
import { theme } from '../app.js';

//const tv = new Vector3();

export const create_pick_slice = (set,get)=>({pick:{
    //reckon_tags: ['point'], // swap name with reckon_tags ?
    //color_tags: ['line'],
    n: [], // rename to n ? // make null if empty?
    group: null,
    target: null,
    //mode: '', 
    deep: false,
    multi: false,
    box: false,
    limited: false, // rename to remakeable
    addable: false,
    removable: false,
    mergeable: false,
    splittable: false,
    deletable: false,
    transformable: false,
    reckonable: false,
    visible: false,
    set(d, n, v, a={}){
        //if(a.deep) d.node.for_n(d, n, (r,n)= d.pick.set(d,n,true,a));
        var nodes = n; // this and the next two lines are common so make d.node.for_n with inclusive flag?!?!?!?!?
        if(!Array.isArray(nodes)) nodes = [nodes];
        if(a.deep) nodes = nodes.concat(d.node.n(d, n, a).filter(n=> d.n[n].m=='p'));
        nodes.forEach(n=>{
            d.n[n].pick.pick = v;
            if(v){ d.add(d.pick.n, n)}
            else{  d.pop(d.pick.n, n)}
            d.pick.color(d,n);
        });
        d.pick.update(d); // d.next('pick.update');
    },
    one(d, n, a={}){
        d.pick.none(d, a.t ? d.n[n].t : null);
        d.pick.set(d, n, true, a);
        if(d.n[n].pick.pick) console.log(n, current(d).n[n]);
    },
    update(d){
        //d.pick.n = d.pick.n.filter(n=> d.node.be(d,n));
        d.pick.target = null;
        d.pick.limited = (!d.pick.n.length || d.node.admin(d, d.pick.n));
        d.pick.addable = false;
        d.pick.removable = false;
        d.pick.mergeable = false;
        d.pick.splittable = false;
        d.pick.deletable = d.pick.n.some(n=> d.n[n].asset);
        d.pick.transformable = d.pick.n.some(n=> d.n[n].c.base_matrix);
        d.pick.reckonable = d.pick.n.some(n=> d.n[n].c.manual_compute);
        d.pick.visible = !d.pick.n.some(n=> !d.n[n].design.vis);
        if(d.pick.n.length > 1){
            d.pick.group = d.pick.n.slice(0,-1);
            d.pick.target = d.pick.n.at(-1); // only set target if length > 1?
            const target_nodes = d.node.n(d,d.pick.target);
            const group_in_target = d.pick.group.some(n=> target_nodes.includes(n));
            d.pick.addable = d.n[d.pick.target].asset 
                && !d.node.n(d,d.pick.group,{deep:true}).includes(d.pick.target) 
                && d.pick.group.some(n=> !target_nodes.includes(n));
            d.pick.removable = d.n[d.pick.target].asset && group_in_target;//d.node.n(d,d.pick.target).some(n=> d.pick.group.includes(n));
            d.pick.mergeable = d.n[d.pick.target].asset && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);
            d.pick.splittable = d.n[d.pick.target].asset && group_in_target;  //d.pick.group.every(n=> (d.n[n].asset && d.node.n(d,n).includes(d.pick.target))); 
        }else{
            d.pick.group = d.pick.n; // copy with spread ?
        }
        d.pick.n.forEach(n=> d.pick.color(d,n));
        d.next('design.update');
        d.next('inspect.update');
    },
    get_if_one(d, t){ // add option to also check absolute length==1 before filtering?
        var nodes = d.pick.n;
        if(t!=undefined) nodes = d.pick.n.filter(n=> t.includes(d.n[n].t));
        if(nodes.length == 1) return nodes[0];
        return null;
    },
    sv(d, t, v){ // change to set_v
        d.inspect.content[t] = v;
        if(d.float_tags.includes(t)){ v=parseFloat(v); if(isNaN(v)) v=0; } // check model of each atom instead?
        if(d.int_tags.includes(t)){   v=parseInt(v);   if(isNaN(v)) v=0; } // check model of each atom instead?
        if(t!='part' && Object.values(d.model_tags).includes(t)){ // is atom?
            d.pick.n.forEach(n => {
                if(d.model_tags[d.n[n].m] == t) d.node.sv(d, n, v);//d.n[n].v = v;
            });
        }else{
            d.pick.n.forEach(n => {
                if(d.n[n].m=='p') d.node.set(d, n, {[t]:v}); // if(d.n[n].m=='p' && d.n[n].n[t]) d.node.sv(d, d.n[n].n[t][0], v); // d.node.set(d, n, {t:v})             //d.n[d.n[n].n[t][0]].v = v; 
            });
        }
    },
    pin_children(d, t){
        if(d.pick.n.length > 1) return;
        let n = d.pick.n[0];
        if(!d.n[n].pin.n) d.n[n].pin.n = {};
        d.n[n].pin.n[t] = [...d.n[n].n[t]];
    },
    flip_children_pin(d, t){
        if(d.pick.n.length > 1) return;
        let n = d.pick.n[0];
        let current_children = d.n[n].n[t];
        d.n[n].n[t] = d.n[n].pin.n[t];
        d.n[n].pin.n[t] = current_children;
    },
    set_children_from_pin(d, t){
        if(d.pick.n.length > 1) return;
        let n = d.pick.n[0];
        d.n[n].n[t] = [...d.n[n].pin.n[t]]; // new array to be reflected in patches
        d.inspect.update(d);
        d.reckon.up(d, n);
    },
    set_child_order(d, t, src_idx, new_idx){ // set_children_order
        if(d.pick.n.length > 1) return;
        let n = d.pick.n[0];
        let moved_node = d.n[n].n[t][src_idx];
        d.n[n].n[t].splice(src_idx, 1);
        d.n[n].n[t].splice(new_idx, 0, moved_node);
        d.n[n].n[t] = [...d.n[n].n[t]]; // new array to be reflected in patches
        d.inspect.update(d);//d.next('inspect.update');
    },
    hover(d, n, hover){
        if(d.n[n].pick.hover != hover){
            d.n[n].pick.hover = hover;
            d.pick.color(d,n);
        }
    },
    none(d, t){
        var nodes = [...d.pick.n];
        if(t) nodes = nodes.filter(n=> d.n[n].t==t);
        d.pick.set(d, nodes, false); //nodes.forEach(n=> d.pick.set(d, n, false)); //d.n[n].pick.pick=false   Object.values(d.n).forEach(n=> n.pick.pick=false);
    },
    colors: [[theme.primary, theme.primary_l, 'primary'], [theme.info, theme.info_l, 'info']],
    color(d,n){
        const selector = d.n[n].pick.pick || d.n[n].pick.hover;
        const target = (n == d.pick.target ? 1 : 0); // d.pick.n.length > 1 && 
        d.n[n].pick.color = [
            selector ? d.pick.colors[target][0] : theme.secondary,
            selector ? d.pick.colors[target][0] : 'white',
            selector ? 'white' : theme.primary,
            selector ? d.pick.colors[target][1] : theme.secondary_l,
            selector ? d.pick.colors[target][2] : 'secondary',
        ];
        //if(d.studio.mode=='design' && d.pick.reckon_tags.includes(d.n[n].t)) d.next('reckon.up', n, 'color'); // only call if color changes !?!?!?!?
    },
}});

// get_if_same(d){
    //     if(d.pick.n.length>1 && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) return d.pick.n;
    //     return null;
    // },

//d.pick.same = d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t);

// d.node.for_n(d, d.pick.n, (r,n)=>{
        //     if(d.n[n].asset && n == d.pick.n.at(-1)) d.pick.splittable = true;
        // });

//if(d.pick.n.length>1 && d.pick.n.every((n,i,nodes)=> d.n[n].t==d.n[nodes[0]].t)) d.pick.same = d.pick.n;
        //d.pick.all_asset = d.pick.n.every(n=> d.n[n].asset);

//mod: (d, n, pick)=>{
    //    d.n[n].pick.pick = pick;
        //d.pick.update(d);
    //},

    // update: d=>{ // rename as update
    //     Object.keys(d.n).forEach(n =>{ // make this a common function (iterate all nodes with filter and func 
    //         if(!d.n[n].open) d.n[n].pick.pick=false;
    //         d.pick.color(d,n);
    //     }); 
    //     d.pick.n = Object.keys(d.n).filter(n=> d.n[n].pick.pick); // make this a common function (iterate all nodes with filter and func 
    //     d.pick.n.forEach(n=>{
    //         if(pick_reckon_tags.includes(d.n[n].t)) d.reckon.up(d,n);
    //     });
    //     d.design.update(d);
    //     d.inspect.update(d);
    // },