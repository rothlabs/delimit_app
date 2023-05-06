import {produce, enablePatches} from 'immer';

//const node_tag_vis = {};



// instead of using these functions as selectors (expensive frequent op), keep them as derivitives
// in the merge function of base, update the derivitives when there is a change
export const create_graph_slice = (set,get)=>({
    graph:{
        node_tag_vis: {},//get().node_tag.map(t=> true),
        nodes: ()=>{const d = get();
            return Object.keys(d.n);//.filter(id=> d.graph.node_tag_vis[d.tag(id)]);
        },
        edges: ()=>{const d = get();
            var edges = [];
            Object.entries(d.n).forEach(([nid,n],i)=> {
                Object.values(n.r).forEach(roots=>{
                    roots.forEach(rid=>{
                        d.n[rid] && rid!=nid && edges.push({r:rid,n:nid}); // might not need rid!=nid
                    });
                });
            });
            //console.log(edges);
            return edges;
        },
        node_edges: id=>{const d = get();
            var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1); // use entries?
            return edges;//.filter(e=> id!=e.n && d.n[e.n] && d.graph.node_tag_vis[d.tag(e.n)]);
        },
    }
});