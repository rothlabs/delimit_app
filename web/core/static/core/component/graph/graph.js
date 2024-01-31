import {createElement as c, memo} from 'react';
import {Node} from './node.js';
import {Edge} from './edge.js';
import {use_store, set_store} from 'delimit';

export const Graph = memo(()=>{
    use_store(d=> d.graph.tick); 
    const [d] = set_store(d=> d.graph.layout(d));
    const nodes = [...d.graph.nodes.keys()];
    const edges = d.graph.edges;
    return c(Graph_Group, {nodes, edges})
});

export const Graph_Group = memo(({nodes, edges})=>{
    return c('group', {name:'graph'},
        nodes.map(node=> 
            c(Node, {node, key:node}),
        ),
        edges.map(edge=> 
            c(Edge, {...edge, key: edge.root + edge.term + edge.stem}) 
        ),
	)
});