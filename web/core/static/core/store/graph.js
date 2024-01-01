//import {current} from 'immer';
import {Vector3} from 'three';

const tv = new Vector3();

export const graph = {    
    node: new Map(),
    edge: [],
    scale: 1,
    tick: 0,   
    increment: d=> d.graph.tick++,
};

graph.layout = d => {        
    //console.log('update graph!!');

    d.graph.node.clear();
    d.graph.edge = []; 

    //console.log([...d.node.keys()]);

    for(const [root] of d.node){
        d.graph.node.set(root, {
            lvl: 0,
            pos: new Vector3(),
        });
        for(const [term, stem] of d.terms(d, root)){
            if(!d.node.has(stem)) continue;
            d.graph.edge.push({root, term, stem});
        }
    }
    
    var highest_lvl = 0;
    var setting_lvl = true; 
    while(setting_lvl){ // while(d.graph.node.size && setting_lvl){
        setting_lvl = false;
        for(const [node, node_obj] of d.graph.node){
            let lvl = 0;
            for(const root of d.node.get(node).back){//for(const [root] of d.node.get(node).back.values()){
                if(d.graph.node.has(root)){
                    const root_lvl = d.graph.node.get(root).lvl;
                    if(lvl < root_lvl) lvl = root_lvl;
                }
            }
            if(node_obj.lvl != lvl+1){
                node_obj.lvl = lvl+1;
                highest_lvl = lvl+1;
                setting_lvl = true;
            }
        }
    }

    //console.log('scream!!!!!!!!!!');

    const level = [];
    for(var i=0; i <= highest_lvl+10; i++){ // WHY 10 ?!?!?! #1
        level.push({max_y:0, group:{}, count:0});  
    } 
    for(const [node, node_obj] of d.graph.node){
        const lvl = node_obj.lvl;
        ///const grp = d.face.tag(d, node)+'__'+Array.from(d.node.get(node).back.map(([_,v])=>v.root).sort().join('_');
        const grp = d.type_name(d, node)+'__'+[...d.node.get(node).back].sort().join('_'); // const grp = d.spec.type(d,n)+'__'+rt.sort().join('_');     //JSON.stringify(d.node.get(n).r)
        if(!level[lvl].group[grp]) level[lvl].group[grp] = {n:[], y:0, count:0};
        level[lvl].group[grp].n.push(node);
        level[lvl].count++;
        node_obj.grp = grp; 
    }

    let lx=0;
    let max_x = 0;
    let max_y = 0;
    for(var i=0; i<level.length-1; i++){ // level.forEach((l,i)=>{if(i+1 < level.length){
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
                d.graph.node.get(node).pos.set(x, y, 0); // did not change yet !!!!!!!!
                for(const [term, stem] of d.terms(d, node)){ 
                    if(!d.graph.node.has(stem)) continue;
                    const graph_node = d.graph.node.get(stem);
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

    for(const node of d.graph.node.values()){
        node.pos.multiplyScalar(d.graph.scale).add(tv.set(
            -(max_x+2) * d.graph.scale / 2,
            -level[node.lvl].max_y * d.graph.scale / 2,   // -max_x*d.graph.scale/2
            0
        ));
    }

};

