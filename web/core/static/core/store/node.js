import { Vector3 } from 'three';
import { static_url } from '../app.js';

const tv = new Vector3();

export const create_node_slice =(set,get)=>({node:{
    icons:Object.fromEntries([
        'decimal','point','line','sketch',
    ].map(i=> [i, static_url+'svg/node/'+i+'.svg'])),//{},
    be:(d,n)=>{ // have to calculate this every time a user wants to know because the node could not be present at all
        if(d.n[n] && !d.n[n].deleted){
            if(d.n[n].open) return 'open';
            return 'here';
        }
        return null;
    },
    limited(d, n){
        return n.some(n=>{
            if(d.limited_tags.includes(d.n[n].t)) return true;
        });
    },
    pin_pos(d, n){  // should go in transform slice?    
        if(d.node.be(d,n) && d.n[n].c.pos){
            if(!d.n[n].pin.pos) d.n[n].pin.pos = new Vector3();    //const pos = d.node.get(d, n, 'x y z');
            d.n[n].pin.pos.copy(d.n[n].c.pos);//.set(pos.x, pos.y, pos.z);//d.n[n].pin.pos.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z);
        }
    },
    set_pos(d, n, pos){ // should go in transform slice?
        d.node.set(d, n, {x:pos.x, y:pos.y, z:pos.z});
    },
    set(d, n, a){
        Object.entries(a).forEach(([t,v],i)=>{
            if(d.n[n].n && d.n[n].n[t]) d.node.sv(d, d.n[n].n[t][0], v);//d.n[n].n[t][0].v = v;
        });
    },
    sv(d, n, v){
        if(d.n[n].t=='decimal') v = Math.round((v + Number.EPSILON) * 100) / 100;//parseFloat(v.toFixed(2));// Math.round(v*100)*0.01; // need to set flag that says 'is_atom' or 'is_float'
        d.n[n].v = v; // check if has v?
        d.next('reckon.node', n); // d.reckon.node(d, n);
    },
    n(d, roots, a){ 
        if(!Array.isArray(roots)) roots = [roots]; //if(!filter) filter = ['open']; 
        const nodes = [];
        var add_node = (r,n,t,o)=>nodes.push(n);
        if(a&&a.edge) add_node = (r,n,t,o)=>nodes.push([r,n,t,o]);
        roots.forEach(r=>{
            if(d.n[r].n) Object.entries(d.n[r].n).forEach(([t,nodes],i)=> nodes.forEach((n,o)=>{
                if(d.node.be(d,n) == 'open'){
                    add_node(r,n,t,o); //if(allow_null || d.node.be(d, n)) func(n,t,o);  //if(filter.includes(d.node.be(d,n)))
                    if(a&&a.deep) nodes = nodes.concat(d.node.n(d,n,a));
                }
            }));
        });
        return nodes;
    },
    ne:(d, roots, a)=> d.node.n(d, roots, {edge:true, ...a}),
    r(d, nodes, a){
        if(!Array.isArray(nodes)) nodes = [nodes];
        const roots = [];
        var add_root = (r,n,t,o)=>roots.push(n);
        if(a&&a.edge) add_root = (r,n,t,o)=>roots.push([r,n,t,o]);
        nodes.forEach(n=>{
            Object.entries(d.n[n].r).forEach(([t,roots],i)=> roots.forEach((r,o)=> {
                if(d.node.be(d,r) == 'open'){
                    add_root(r,n,t,o); //if(allow_null || d.node.be(d, r)) func(r,t,o);
                    if(a&&a.deep) roots = roots.concat(d.node.r(d,r,a));
                }
            }));
        });
        return roots;
    },
    re:(d, nodes, a)=> d.node.r(d, nodes, {edge:true, ...a}),
    for_n:(d, roots, func, a)=> d.node.ne(d,roots,a).forEach(edge=> func(...edge)), // rename to for_ne
    for_r:(d, nodes, func, a)=> d.node.re(d,nodes,a).forEach(edge=> func(...edge)), 
    for_rn(d, nodes, func){ // use .some instead of .forEach so can exit loop early from inside func?!?!?!?!
        d.node.for_r(d, nodes, r=> 
            d.node.for_n(d, r, (r,n,t,o)=>{  if(nodes.includes(n)) func(r,n,t,o);   })
        );
    },
    close:(d, n)=>{
        d.n[n].open = false; // rename to closed?
        d.next('graph.update');
    },
    delete:(d, n, a)=>{ // allow delete if not asset when it is another user deleting 
        var nodes = [n];
        if(a&&a.deep) nodes = nodes.concat(d.node.n(d, n, a));
        nodes.filter(n=> d.n[n].asset).forEach(n=>{
            const root_edges = [];
            d.node.for_rn(d, n, (r,n,t,o)=>{ 
                root_edges.push({r:r, n:n, t:t, o:o});
            });
            d.node.delete_edges(d, root_edges);
            const node_edges = [];
            d.node.for_n(d, n, (r,n,t,o)=>{
                node_edges.push({r:r, n:n, t:t, o:o});
            });
            d.node.delete_edges(d, node_edges);
            d.pick.set(d, n, false);
            d.pick.hover(d, n, false);
            d.node.close(d, n);
            d.n[n].deleted = true;
            //console.log('delete', n);
        });
    },
    delete_edges(d, edges){
        edges.reverse().forEach(e=>{ 
            var re = null;
            d.node.for_r(d, e.n, (r,n,t,o)=>{
                if(r == e.r) re = {t:t, o:o};
            });
            if(re){
                d.n[e.n].r[re.t].splice(re.o, 1);
                if(d.n[e.n].r[re.t].length==0) delete d.n[e.n].r[re.t];
            }
            d.n[e.r].n[e.t].splice(e.o, 1);
            if(d.n[e.r].n[e.t].length==0) delete d.n[e.r].n[e.t];
            d.next('reckon.node',e.r);
        });
    },
}});


//if(a&&a.deep) d.node.for_n(d, n, (r,n)=> nodes.push(n), {deep:true}); // must check if no roots except profile, public, etc


// const dead_nodes = [];
//         function push_node(d, n, a){
//             if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
//                 dead_nodes.push(n);
//                 if(a&&a.deep){
//                     //d.node.delete(d, d.n[n].get_n, deep); // make get_n that does what for_n does but just provides list
//                     d.node.for_n(d, n, (r,n)=> push_node(d, n, a)); // must check if no roots except profile, public, etc
//                 }
//             }
//         }
//         push_node(d, n, a);


//d.node.for_r(d, n, rr=>{
                //    if(r==rr) node_edges.push({r:r, n:n, t:t, o:o});
                //}); // don't have to set to null if set deleted after?

// //var reset_root_edges = false;
//             //if(d.order_tags.includes(d.n[n].t)) reset_root_edges=true;  
//             const root_edges = [];
//             d.node.for_r(d, n, r=>{ // rewrite to use one loop: d.node.for_n(d, d.n[n].r, (r,n,t,o)=>{
//                 d.node.for_n(d, r, (rr,nn,t,o)=>{
//                     //console.log(nn, t, o);
//                     if(n==nn) root_edges.push({r:r, n:n, t:t, o:o});
//                 }); // don't have to set to null if set deleted after?
//                 //console.log(dead_edges);
//                 //dead_edges.reverse().forEach(edge=>{ 
//                     //d.n[r].n[edge.t].splice(edge.o, 1);
//                     //if(d.n[r].n[edge.t].length==0) delete d.n[r].n[edge.t];
//             // });
//                 //if(reset_root_edges && d.n[r].n[d.n[n].t]) d.n[r].n[d.n[n].t] = [...d.n[r].n[d.n[n].t]]; // should this go in delete_edges?! this way the patches function will send entire list 
//             });


// const edges2 = edges.sort((a,b)=>{
        //     if(a.o < b.o) return -1;
        //     if(a.o > b.o) return 1;
        //     return 0;
        // });
        // console.log(edges2);

//init(d){
    //    d.node.icons = Object.fromEntries([
    //        'line','sketch'
    //    ].map(i=> [i, static_url+'/node/'+i+'.svg']));
    //},

// get(d, n, t){
//     const result = {};
//     t.split(' ').forEach(t=>{
//         if(d.n[n].n && d.n[n].n[t] && d.node.be(d,d.n[n].n[t][0])) result[t] = d.n[d.n[n].n[t][0]].v;
//     });
//     return result;
// },

// get:(d, n, t, o)=>{
    //     if(!o) o=0;
    //     if(d.n[n].n[t] && o < d.n[n].n[t].length) return d.n[n].n[t][o];
    //     return null;
    // },

