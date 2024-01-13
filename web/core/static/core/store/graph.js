import {Vector3} from 'three';
//import {graph_app_url} from 'delimit';

const vector = new Vector3();


export const graph_app = {
    // mutate: args => graph_app_element.postMessage({mutate:args}, graph_app_url),
    // query:  args => graph_app_element.postMessage({query:args}, graph_app_url),
    error: null,
};

// graph_app.query_scenes = d => {
//     // const scenes = d.scene.get_sources(d);
//     // d.graph_app.query({scenes});
//     // d.loading.scenes = true;
// };

// // graph_app.query_scene_status = d => ({
// //     loading: (d.loading.scenes.size > 0), 
// //     error: d.graph_app.error,
// // });

export const graph = {    
    nodes: new Map(),
    edges: [],
    scale: 1,
    tick: 0,   
    increment: d=> d.graph.tick++,
};

graph.layout = d => {        
    //console.log('update graph!!');

    d.graph.nodes.clear();
    d.graph.edges = []; 

    for(const [root] of d.nodes) add_node_and_edges(d, root);
    
    var highest_lvl = 0;
    var setting_lvl = true; 
    while(setting_lvl){ 
        setting_lvl = false;
        for(const [node, node_obj] of d.graph.nodes){
            let lvl = 0;
            for(const root of d.nodes.get(node).roots){
                if(d.graph.nodes.has(root)){
                    const root_lvl = d.graph.nodes.get(root).lvl;
                    if(lvl < root_lvl) lvl = root_lvl;
                }
            }
            if(node_obj.lvl != lvl+1){
                node_obj.lvl = lvl+1;
                highest_lvl = lvl+1;
                setting_lvl = true;
            }
        }
    };

    const level = [];
    for(var i=0; i <= highest_lvl+10; i++){ // WHY 10 ?!?!?! #1
        level.push({max_y:0, group:{}, count:0});  
    } 
    for(const [node, node_obj] of d.graph.nodes){
        const lvl = node_obj.lvl;
        const grp = d.get.node.type_name(d, node)+'__'+[...d.nodes.get(node).roots].sort().join('_'); 
        if(!level[lvl].group[grp]) level[lvl].group[grp] = {n:[], y:0, count:0};
        level[lvl].group[grp].n.push(node);
        level[lvl].count++;
        node_obj.grp = grp; 
    }

    let lx=0;
    let max_x = 0;
    let max_y = 0;
    for(var i=0; i<level.length-1; i++){ 
        var l = level[i],  ll = level[i+1],  prev_l = level[i-1];
        var gy = 0;
        var y_step = ((ll.count + (prev_l ? prev_l.count : 0)) / 2 / l.count);
        if(y_step < 1) y_step = 1; // was 1
        const groups = Object.values(l.group);
        if(i > 0) groups.forEach(g=> g.y /= g.count+0.00001);
        groups.sort((a,b)=>{
            if(a.y < b.y) return -1;    
            if(a.y > b.y) return  1;    
            return 0;
        }).forEach(g=>{
            ///////////////const size = Math.round(Math.sqrt(g.n.length / 2)); // used for grouping in blocks
            var x = lx;//(gx > g.x ? gx : g.x);
            var y = gy;
            g.n.forEach(node=>{
                if(x > max_x) max_x = x;
                if(y > l.max_y) l.max_y = y;
                d.graph.nodes.get(node).pos.set(x, y, 0); // did not change yet !!!!!!!!
                for(const [term, stem] of d.get_edges({root:node, exclude_leaves:true})){ 
                    if(!d.graph.nodes.has(stem)) continue;
                    const graph_node = d.graph.nodes.get(stem);
                    if(ll.group[graph_node.grp]){
                        ll.group[graph_node.grp].y += y;
                        ll.group[graph_node.grp].count ++;
                    }
                }
                ///////////x++; // used for grouping in blocks
                //////////if(x >= lx + size){
                    x = lx;  
                    y += y_step;
                ///////////}
            });
            gy = l.max_y + y_step * 1.5;
        });
        if(l.max_y > max_y) max_y = l.max_y;
        lx = max_x + 4;
    };

    if([0, 1, Infinity].includes(d.graph.scale)){
        const window_size = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight
        const graph_size = (max_x > max_y) ? max_x : max_y;
        d.graph.scale = window_size / graph_size / 2;
    }

    for(const node of d.graph.nodes.values()){
        node.pos.multiplyScalar(d.graph.scale).add(vector.set(
            -(max_x+2) * d.graph.scale / 2,
            -level[node.lvl].max_y * d.graph.scale / 2,   // -max_x*d.graph.scale/2
            0
        ));
    }
};

function add_node_and_edges(d, root){
    if(!d.get_leaf({root, term:'show', alt:true})) return;
    d.graph.nodes.set(root, {
        lvl: 0,
        pos: new Vector3(),
    });
    for(const [term, stem] of d.get_edges({root, exclude_leaves:true})){
        if(!d.nodes.has(stem)) continue;
        d.graph.edges.push({root, term, stem});
    }
}

