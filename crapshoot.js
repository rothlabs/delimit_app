
import {set_queries, geometry} from 'delimit'

const get_vectors_from_node = node => {
    const type_name = node.get_type_name()
    if(type_name == 'vector') 
        return geometry.get_vector(node.get_stem_values('x', 'y', 'z'))
    if(type_name == 'curve') 
        return node.get_spaced_vectors()
}

const get_curve = node => {
    const parts = node.get_stems('parts')
    const vectors = parts.map(part => get_vectors_from_node(part)).flat()
    return geometry.get_curve({vectors})
}

const get_vector = node => {
    const t = node.get_input('t')
    return node.get_curve().get_vector(t)
}

const get_spaced_vectors = node => 
    node.get_curve().get_spaced_vectors(100)

const get_view = node => ({
    type: 'curve', 
    vectors: node.get_spaced_vectors(100),
})

set_queries({get_curve, get_vector, get_spaced_vectors, get_view})













import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'https://cdn.jsdelivr.net/npm/immer@10.0.3/+esm';

enablePatches();
enableMapSet();

const state = {
		node: new Map([['wow',37], ['nice',88]]),
};

const [nextState, patches, inversePatches] = produceWithPatches(
    state,
    d => {
        d.nodes.delete('wow');
    }
);

console.log(Array.from(nextState.node.values()));
const nextState2 = applyPatches(nextState, inversePatches);
console.log(Array.from(nextState2.node.values()));

console.log('done');





const node = new Map();

node.set('unique_node_id', {
    bank:{
        position: new Vector3(),
    },
    root: new Map(), 
    stem: new Map(),
    leaf: 'terminal value if exists',
})

const graph = {
    //positions: new Map(),
    // helpful functions like:
    pos(node_id){
        return node.get(node_id).bank.position;
    } 
}

const spec = {
    // other cool stuff like icon()
}

const node_position = graph.pos('unique_node_id');

const node_icon = spec.icon('unique_node_id');
