import { node_tags } from './base.js';
//import {produce, current, enablePatches} from 'immer';

//const node_tag_vis = {};

// instead of using these functions as selectors (expensive frequent op), keep them as derivitives
// in the merge function of base, update the derivitives when there is a change
export const create_graph_slice = (set,get)=>({graph:{
    nodes: [],
    edges: [],
    //levels: [],
    //edge_groups: [],
    tag_vis:{
        ...Object.fromEntries(node_tags.map(t=> [t,true])),
        decimal:false, text:false
    },
    set_tag_vis:(d, t, vis)=>{
        d.graph.tag_vis = {...d.graph.tag_vis}; // make new object so visual panel rerenders
        d.graph.tag_vis[t] = vis;
        Object.values(d.n).forEach(n=>{
            if(d.graph.tag_vis[n.t]!=undefined) n.graph.vis = d.graph.tag_vis[n.t];
        });
        d.graph.update(d);
    },
    update: d=>{
        d.graph.nodes = Object.keys(d.n).filter(n=> d.n[n].open && d.n[n].graph.vis);
        d.graph.edges = [];
        d.graph.nodes.forEach(r=>{
            d.node.for_n(d, r, (n,t)=>{
                if(d.node.be(d,n) && d.n[n].graph.vis){ //  && r!=n,  r==n should probably never be allowd in the first place
                    d.graph.edges.push({r:r, t:t, n:n}); 
                }
            });
        });
        //d.graph.arrange = true;

        d.graph.nodes.forEach(n=>{   d.n[n].graph.lvl = 0;   });
        
        var highest_lvl = 0;
        var setting_lvl = true; 
        while(setting_lvl){
            setting_lvl = false;
            d.graph.nodes.forEach(n=>{
                var lvl = 0;
                d.node.for_r(d, n, r=>{
                    if(d.graph.nodes.includes(r)){
                        if(d.n[r].graph.lvl > lvl) lvl = d.n[r].graph.lvl;
                    }
                });
                if(d.n[n].graph.lvl != lvl+1){
                    d.n[n].graph.lvl = lvl+1;
                    highest_lvl = lvl+1;
                    setting_lvl = true;
                }
            });
        }

        const level = [];
        for(var i=0; i<=highest_lvl+1; i++){  level.push({});  }
        d.graph.nodes.forEach(n=>{
            const lvl = d.n[n].graph.lvl;
            const grp = d.n[n].t+'__'+JSON.stringify(d.n[n].r).split('').sort().join('');
            console.log(lvl, d.n[n].t);
            if(level[lvl][grp] == undefined) level[lvl][grp] = [];
            level[lvl][grp].push(n);
        });
        console.log(level);

        var lx=0;
        var ly=0;
        var max_y = 0;
        level.forEach(l=>{
            var gx = lx;
            var max_x = 0;
            Object.values(l).forEach(g=>{
                const size = Math.round(Math.sqrt(g.length));
                var x = gx;
                var y = ly;
                g.forEach(n=>{
                    if(x > max_x) max_x = x;
                    if(y > max_y) max_y = y;
                    d.n[n].graph.pos.set(x*10, y*10, 0);
                    x++;
                    if(x >= gx+size){
                        x=gx;  
                        y++;
                    }
                });
                gx = max_x + 2;
            });
            ly = max_y + 2;
        });

    },
}});


// update: d=>{
//     d.graph.nodes = Object.keys(d.n);
//     d.graph.edges = [];
//     Object.entries(d.n).forEach(([rid,r],i)=> {
//         r.n && Object.entries(r.n).forEach(([tag,nodes],i)=>{
//             nodes.forEach(nid=>{
//                 d.n[nid] && rid!=nid && d.graph.edges.push({r:rid, tag:tag, n:nid}); // might not need rid!=nid
//             });
//         });
//     });
//     //d.graph.edges = edges;
//     d.graph.arrange = true;
// },



//node_tag_vis: {},//get().node_tag.map(t=> true),

// node_edges: id=>{const d = get();
//     var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1); // use entries?
//     return edges.filter(e=> id!=e.n && d.n[e.n]);// && d.graph.node_tag_vis[d.tag(e.n)]);
// },

// add: id=>{
//     const i = d.selection.indexOf(id);
//     if(i<0) 
// },
// remove: id=>{
//     const i = d.selection.indexOf(id);
// },


// nodes: ()=>{const d = get();
//     return Object.keys(d.n);//.filter(id=> d.graph.node_tag_vis[d.tag(id)]);
// },
// edges: ()=>{const d = get();
//     var edges = [];
//     Object.entries(d.n).forEach(([nid,n],i)=> {
//         Object.values(n.r).forEach(roots=>{
//             roots.forEach(rid=>{
//                 d.n[rid] && rid!=nid && edges.push({r:rid,n:nid}); // might not need rid!=nid
//             });
//         });
//     });
//     //console.log(edges);
//     return edges;
// },
// node_edges: id=>{const d = get();
//     var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1); // use entries?
//     return edges.filter(e=> id!=e.n && d.n[e.n]);// && d.graph.node_tag_vis[d.tag(e.n)]);
// },