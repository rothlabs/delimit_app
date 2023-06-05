import {make_id, random_vector, theme} from '../app.js';
import {Vector3} from 'three';
import {current} from 'immer';

export const create_make_slice = (set,get)=>({make:{
    edge(d, r, n, a){ // need o index
        var t = d.n[n].t;
        if(a && a.t!=undefined) t = a.t;
        if(!d.n[r].n[t]) d.n[r].n[t] = [];
        d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
        //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 
        if(a && a.o!=undefined){ // forward relationship 
            d.n[r].n[t].splice(a.o, 0, n);
        }else{  d.n[r].n[t].push(n); }
        if(d.root_tags[t]){  t=d.root_tags[t];  }
        else{  t=d.n[r].t;  }
        if(!d.n[n].r[t]) d.n[n].r[t] = [];
        d.n[n].r[t].push(r); // reverse relationship 
        d.next('graph.update');
    },
    node(d, m, t, a){ // might want to use this on reception of nodes so can't set consume here? or can I since it will be overwritten?
        const window_size = (window.innerWidth+window.innerHeight)/4;
        const n = make_id();
        d.n[n] = {m: m, t:t, r:{}, c:{}, open:true, asset:true, deleted:false,
            pick: {pick:false, hover:false},
            graph: { 
                pos: new Vector3(), //random_vector({min:window_size, max:window_size*1.5, z:0}),//new Vector3(-window_size, window_size, 0),  
                //dir: new Vector3(),
                vis: d.graph.tag_vis[t]!=undefined ? d.graph.tag_vis[t] : true,
                lvl: 0,
            },
            pin: {},
        };
        d.pick.color(d,n);
        if(m=='p'){ d.n[n].n={}; }
        d.make.edge(d, d.profile, n, {t:'asset'}); // need to make temp profile for anonymous users!!!!
        if(a && a.r) d.make.edge(d, a.r, n, a);//{
        //    if(Array.isArray(a.r)){   a.r.forEach(r=> d.make.edge(d, r, n, a))   }
        //    else{   d.make.edge(d, a.r, n, a);  }
        //}
        //d.consume = d.send; // make add to a consume list? so async ops work? idk
        d.next('graph.update'); // check if in graph_tags 
        return n;
    },
    part(d, t, a){
        return d.make.node(d, 'p', t, a);
    },
    atom(d, m, v, r, t){
        const n = d.make.node(d, m, d.model_tags[m], {r:r, t:t});
        d.n[n].v = v; //d.n[n].pin = v;
        return n;
    },
    point(d, pos, r, o){
        const n = d.make.part(d, 'point', {r:r, o:o}); // d, part_tag, root_id, edge_tag
        d.make.atom(d, 'f', pos.x, n, 'x'); // d, v, root_id, edge_tag
        d.make.atom(d, 'f', pos.y, n, 'y'); 
        d.make.atom(d, 'f', pos.z, n, 'z'); 
        d.reckon.node(d,n); // should this be d.next() ?!?!?!
        return n;
    },
}});

// if(d.profile){
        //     if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
        //     d.n[d.profile].n.asset.push(n);
        // }

