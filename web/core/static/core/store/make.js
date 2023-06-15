import {make_id, random_vector, theme} from '../app.js';
import {Vector3} from 'three';
import {current} from 'immer';

export const create_make_slice = (set,get)=>({make:{
    // init(d){
    //     d.make.buttons = d.subject
    // },
    edge(d, r, n, a={}){ // check existance of r and n here ?!?!?!?!?!
        if(d.node.be(d,r) && d.node.be(d,n)){
            if(d.n[r].asset || (r==d.profile && a.t=='asset') || (r==d.public && a.t=='view')){
                var t = d.n[n].t;
                if(d.n[r].t == 'group') t = d.n[r].t; 
                if(a.t != undefined) t = a.t;
                if(!d.n[r].n[t]) d.n[r].n[t] = [];
                /////////////////////d.n[r].n[t] = [...d.n[r].n[t]]; // not good, always rebuilding edges to force d.send to send all edges of root (flag edge rebuild/send?)
                //if(d.order_tags.includes(t)) d.n[r].n[t] = [...d.n[r].n[t]]; // if order matters for this tag, rebuild list 
                if(!d.n[r].n[t].includes(n)){
                    if(a.o!=undefined){d.n[r].n[t].splice(a.o, 0, n)}
                    else              {d.n[r].n[t].push(n)          }
                    var rt = d.n[r].t;
                    if(d.root_tags[t]) rt=d.root_tags[t];
                    if(!d.n[n].r[rt]) d.n[n].r[rt] = [];
                    d.n[n].r[rt].push(r); // reverse relationship 
                    if(d.studio.grouping && d.n[n].n){ // need to make is_part function?!?!?! (or is_atom)   
                        d.node.re(d,r).filter(e=> d.n[e.r].t=='group').forEach(e=> { // deep?
                            d.make.edge(d, e.r, n, {src:a.src}); //, {no_auto_group:true}
                        });
                    }
                    d.action.node(d, r, {act:'make.edge', src:a.src, r:r, n:n, t:t});
                    d.next('reckon.node', r); //, {cause:'edge_created', r:r, n:n, t:t}
                    d.next('graph.update');
                    d.next('pick.update');
                }
            }
        }
    },
    node(d, m, t, a={}){ // might want to use this on reception of nodes so can't set consume here? or can I since it will be overwritten?
        //const window_size = (window.innerWidth+window.innerHeight)/4;
        const n = make_id();
        d.n[n] = {m: m, t:t, r:{}, c:{}, open:true, asset:true, deleted:false,
            pick: {pick:false, hover:false},
            graph: { 
                pos: new Vector3(), //random_vector({min:window_size, max:window_size*1.5, z:0}),//new Vector3(-window_size, window_size, 0),  
                //dir: new Vector3(),
                vis: d.graph.n_vis[t]!=undefined ? d.graph.n_vis[t] : true,
                //lvl: 0,
            },
            pin: {},
        };
        d.pick.color(d,n);
        if(m=='p'){ d.n[n].n={}; }
        d.make.edge(d, d.profile, n, {t:'asset'}); // need to make temp profile for anonymous users!!!!
        
        //if(a.r) d.make.edge(d, a.r, n, a); // a.r should be list?
        d.for(a.r, r=> d.make.edge(d, r, n, a));

        if(a.n) Object.entries(a.n).forEach(([t,nn],i)=>{
            d.make.edge(d, n, nn, {t:t});
        });
        //{
        //    if(Array.isArray(a.r)){   a.r.forEach(r=> d.make.edge(d, r, n, a))   }
        //    else{   d.make.edge(d, a.r, n, a);  }
        //}
        //d.consume = d.send; // make add to a consume list? so async ops work? idk
        d.next('reckon.node', n);
        d.next('graph.update'); // check if in graph_tags 
        return n;
    },
    atom(d, m, v, a){ // just check v to figure if b, i, f, or s
        const n = d.make.node(d, m, d.model_tags[m], a); //{r:r, t:t}
        d.n[n].v = v; //d.n[n].pin = v;
        return n;
    },
    part(d, t, a){ // a.r should be array 
        if(d.make[t]){return d.make[t](d,a)}
        else         {return d.make.node(d, 'p', t, a)}
    },
    point(d, a={}){ //pos, r, o
        if(a.pos == undefined) a.pos = new Vector3();
        const n = d.make.node(d,'p','point', {r:a.r, o:a.o, n:{
            x: d.make.atom(d, 'f', a.pos.x),
            y: d.make.atom(d, 'f', a.pos.y),
            z: d.make.atom(d, 'f', a.pos.z),
        }}); // d, part_tag, root_id, edge_tag 
        //d.reckon.node(d,n); // should this be d.next() and located in d.make.node ?!?!?!
        return n;
    },
}});

//const x = d.make.atom(d, 'f', pos.x); //, n, 'x' // d, v, root_id, edge_tag
        //const y = d.make.atom(d, 'f', pos.y); //, n, 'y' 
        //const z = d.make.atom(d, 'f', pos.z); //, n, 'z'

// if(d.profile){
        //     if(!d.n[d.profile].n.asset) d.n[d.profile].n.asset = [];
        //     d.n[d.profile].n.asset.push(n);
        // }

