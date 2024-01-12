export const store = {
    nodes: new Map(),
    static_url: document.body.getAttribute('data-static-url') + 'graph/',
}

store.scene = {
    sources: new Map(),
};

store.make_scene = (d, {node}) => {
    const scene = d.nodes.get(node).terms.get('scenes')[0];
    console.log('make_scene!!!', scene);
};