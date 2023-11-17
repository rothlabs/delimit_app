

triple('v:toDelete', 'drop', 'v:dropFlag')
triple('v:dropFlag', '.', 'forReal')
triple('v:toDelete', 'v:term', 'v:stem')
delete_triple('v:toDelete', 'v:term', 'v:stem')


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
