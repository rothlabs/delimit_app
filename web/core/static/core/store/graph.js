//import {produce, current, enablePatches} from 'immer';

//const node_tag_vis = {};



// instead of using these functions as selectors (expensive frequent op), keep them as derivitives
// in the merge function of base, update the derivitives when there is a change
export const create_graph_slice = (set,get)=>({graph:{
    nodes: [],
    edges: [],
    update: d=>{
        //console.log(current(d).n);
        d.graph.nodes = Object.keys(d.n).filter(n=> d.n[n].open);
        d.graph.edges = [];
        d.graph.nodes.forEach(r=>{
            d.node.for_n(d, r, (n,t)=>{
                if(d.node.be(d,n)){ //  && r!=n,  r==n should probably never be allowd in the first place
                    d.graph.edges.push({r:r, t:t, n:n}); 
                }
            });
        });
        d.graph.arrange = true;
        //console.log('display edges!');
        //console.log(d.graph.edges);
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