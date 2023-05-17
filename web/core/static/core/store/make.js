import {make_id, random_vector} from '../app.js';
import {model_tags} from './base.js';
import {Vector3} from 'three';
import {current} from 'immer';

export const create_make_slice = (set,get)=>({make:{
    edge: (d, r, n, t)=>{
        if(!t) t = d.n[n].t;
        if(r){
            if(!d.n[r].n[t]) d.n[r].n[t] = [];
            d.n[r].n[t].push(n); // need to add reverse relationship
        }
    },
    node: (d, m, t, r, et)=>{
        const window_size = (window.innerWidth+window.innerHeight)/4;
        const n = make_id();
        d.n[n] = {
            m: m,
            t: t,
            r: {},
            c: {},
            open: true,
            asset: true,
            graph: { 
                pos: random_vector({min:window_size, max:window_size*1.5, z:0}),//new Vector3(-window_size, window_size, 0),  
                dir: new Vector3(),
            },
        };
        if(m=='p'){ d.n[n].n={}; }
        d.make.edge(d, d.profile, n, 'asset');
        if(r) d.make.edge(d, r, n, et);
        d.consume = d.send; // make add to a consume list? so async ops work? idk
        return n;
    },
    part: (d, t, r, et)=>{
        return d.make.node(d, 'p', t, r, et);
    },
    atom: (d, m, v, r, et)=>{
        const n = d.make.node(d, m, model_tags[m], r, et);
        d.n[n].v = v;
        return n;
    },
    point: (d, point, index)=>{
        console.log(point, index);
        //d.make.atom(d,'f', point.z); 
        const n = d.make.part(d, 'point', d.design.part); // part_tag, root_id, edge_tag
        d.make.atom(d,'f', point.x, n, 'x'); // v, root_id, edge_tag
        d.make.atom(d,'f', point.y, n, 'y'); 
        d.make.atom(d,'f', point.z, n, 'z'); 
        console.log(current(d).n[n]);
    },
}});

// if(d.profile){
        //     if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
        //     d.n[d.profile].n.asset.push(n);
        // }

