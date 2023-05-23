import {make_id, random_vector, theme} from '../app.js';
import {model_tags, root_tags} from './base.js';
import {Vector3} from 'three';
import {current} from 'immer';

const ordered_tags = ['point'];

export const create_make_slice = (set,get)=>({make:{
    edge: (d, r, n, a)=>{ // need o index
        var t = d.n[n].t;
        if(a && a.t!=undefined) t = a.t;
        if(!d.n[r].n[t]) d.n[r].n[t] = [];
        if(ordered_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 
        d.n[r].n[t].push(n); // forward relationship   /// use splice with a.o
        if(root_tags[t]){  t=root_tags[t];  }
        else{  t=d.n[r].t;  }
        if(!d.n[n].r[t]) d.n[n].r[t] = [];
        d.n[n].r[t].push(r); // reverse relationship 
    },
    node:(d, m, t, a)=>{ // might want to use this on reception of nodes so can't set consume here? or can I since it will be overwritten?
        const window_size = (window.innerWidth+window.innerHeight)/4;
        const n = make_id();
        d.n[n] = {m: m, t:t, r:{}, c:{}, open:true, asset:true,
            pick: {},
            graph: { 
                pos: new Vector3(), //random_vector({min:window_size, max:window_size*1.5, z:0}),//new Vector3(-window_size, window_size, 0),  
                //dir: new Vector3(),
                vis: d.graph.tag_vis[t]!=undefined ? d.graph.tag_vis[t] : true,
                lvl: 0,
            },
        };
        d.pick.color(d,n);
        if(m=='p'){ d.n[n].n={}; }
        d.make.edge(d, d.profile, n, {t:'asset'});
        if(a) d.make.edge(d, a.r, n, a);
        d.consume = d.send; // make add to a consume list? so async ops work? idk
        return n;
    },
    part: (d, t, a)=>{
        return d.make.node(d, 'p', t, a);
    },
    atom: (d, m, v, r, t)=>{
        const n = d.make.node(d, m, model_tags[m], {r:r, t:t});
        d.n[n].v = v;
        return n;
    },
    point: (d, point, o)=>{
        const n = d.make.part(d, 'point', {o:o, r:d.design.part}); // d, part_tag, root_id, edge_tag
        d.make.atom(d, 'f', point.x, n, 'x'); // d, v, root_id, edge_tag
        d.make.atom(d, 'f', point.y, n, 'y'); 
        d.make.atom(d, 'f', point.z, n, 'z'); 
        d.node.reckon(d,n);
    },
}});

// if(d.profile){
        //     if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
        //     d.n[d.profile].n.asset.push(n);
        // }

