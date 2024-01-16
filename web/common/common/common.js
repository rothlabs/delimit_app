export const is_formal_node_id = id => (/^[a-zA-Z0-9]+$/.test(id) && id.length === 32);

export * from './store/store.js';

export const static_url = document.body.getAttribute('data-static-url');

