import {applyPatches, produceWithPatches, enablePatches, enableMapSet} from 'https://cdn.jsdelivr.net/npm/immer@10.0.3/+esm';

enablePatches();
enableMapSet();

const state = {
		node: new Map([['wow',37], ['nice',88]]),
};

const [nextState, patches, inversePatches] = produceWithPatches(
    state,
    d => {
        d.node.delete('wow');
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
