import {produce, enablePatches} from 'immer';

export const create_graph_slice = (set,get)=>({
    graph:{
        exclude_node_tag: [],
        nodes: ()=>{const d = get();
            return Object.keys(d.n).filter(id=> !d.graph.exclude_node_tag.includes(d.tag(id)));
        },
        edges: id=>{const d = get();
            var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1);
            return edges.filter(e=> id!=e.n && d.n[e.n] && !d.graph.exclude_node_tag.includes(d.tag(e.n)));
        },
    }
});