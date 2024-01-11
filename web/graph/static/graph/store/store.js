export const core_store = {
    nodes: new Map(),
    static_url: document.body.getAttribute('data-static-url') + 'graph/',
}

core_store.get_scenes = (d, roots) => {
    return {scenes:[{type:'point'}]};
};