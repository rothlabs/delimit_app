import {Vector3} from 'three';
import {static_url, readable} from '../app.js';

const tv = new Vector3();

export const create_node_slice =(set,get)=>({node:{
    init(d){
        d.node.meta = Object.fromEntries(d.node_tags.map(t=>[t,{
            icon: static_url+'icon/node/'+t+'.svg',
            name: readable(t),
            css: d.node_css[t],
        }])); // put in config file
    },
    be:(d,n)=>{ // have to calculate this every time a user wants to know because the node could not be present at all
        if(d.n[n] && !d.n[n].deleted){
            if(d.n[n].open) return 'open';
            return 'here';
        }
        return null;
    },
    admin(d, n){
        return n.some(n=>{
            if(d.admin_tags.includes(d.n[n].t)) return true;
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
    get(d, roots, t){ // like n but different. need better name to differentiate
        if(!Array.isArray(roots)) roots = [roots];
        const result = [];
        roots.forEach(r=>{
            if(d.n[r].n && d.n[r].n[t]) d.add(result, d.n[r].n[t][0]);//return d.n[r].n[t][o];  && o < d.n[r].n[t].length
        });
        return result;
    },
    set(d, n, a){
        Object.entries(a).forEach(([t,v],i)=>{
            if(d.n[n].n && d.n[n].n[t]) d.node.sv(d, d.n[n].n[t][0], v);//d.n[n].n[t][0].v = v;
        });
    },
    sv(d, n, v){
        if(d.node.be(d,n) && d.n[n].t=='decimal') v = Math.round((v + Number.EPSILON) * 100) / 100;//parseFloat(v.toFixed(2));// Math.round(v*100)*0.01; // need to set flag that says 'is_atom' or 'is_float'
        d.n[n].v = v; // check if has v?
        d.next('reckon.node', n); // d.reckon.node(d, n);
    },
    n(d, roots, a={}){ 
        if(!Array.isArray(roots)) roots = [roots]; //if(!filter) filter = ['open']; 
        var result = []; // should be key value pair for faster checking?  
        var add_n = (r,n,t,o)=> d.add(result, n);//result.push(n); 
        if(a.edge) add_n = (r,n,t,o)=>result.push({r:r,n:n,t:t,o:o}); // use d.add to avoid duplicates ?!?!?!
        if(a && a.unique && !a.collected) a.collected = {...Object.fromEntries(roots.map(r=>[r,true]))};
        roots.forEach(r=>{
            if(d.node.be(d,r) && d.n[r].n) Object.entries(d.n[r].n).forEach(([t,nodes],i)=> nodes.forEach((n,o)=>{
                if(d.node.be(d,n) == 'open' && !(a.unique && d.node.cr(d,n).some(r=> !a.collected[r])) && !(a.filter && !a.filter(n))){ //a.n.includes(r)
                    add_n(r,n,t,o); //if(allow_null || d.node.be(d, n)) func(n,t,o);  //if(filter.includes(d.node.be(d,n)))
                    if(a.unique) a.collected[n] = true;
                    if(a.deep) result = result.concat(d.node.n(d,n,a));
                }
            }));
        });
        return result;
    },
    un:(d, roots, a)=> d.node.n(d, roots, {unique:true, ...a}),
    ne:(d, roots, a)=> d.node.n(d, roots, {edge:true, ...a}),
    r(d, nodes, a={}){
        //if(!Array.isArray(nodes)) nodes = [nodes];
        var result = [];//const result = (a.rt ? [...nodes] : []); // might not need this ?!?!?!
        var add_r = (r,n,t,o)=> result.push(r); //d.add(d, result, r);// 
        if(a.edge) add_r = (r,n,t,o)=> result.push({r:r,n:n,t:t,o:o}); // use d.add to avoid duplicates (upgrad for deep compare) ?!?!?!
        d.for(nodes, n=>{//nodes.forEach(n=>{
            if(d.node.be(d,n)) Object.entries(d.n[n].r).forEach(([t,roots],i)=>{ 
                if(!(a.content && ['owner','viewer','group'].includes(t))) roots.forEach((r,o)=> {
                    if(d.node.be(d,r) == 'open' && !(a.filter && !a.filter(r))){
                        add_r(r,n,t,o); //if(allow_null || d.node.be(d, r)) func(r,t,o);
                        if(a.deep) result = result.concat(d.node.r(d,r,a));
                    }
                });
            });
        });
        return result;
    },
    cr:(d, n)=> d.node.r(d, n, {content:true}),//.filter(e=> !['owner', 'viewer'].includes(e.t)),
    re:(d, nodes, a)=> d.node.r(d, nodes, {edge:true, ...a}),
    rne(d, nodes){
        const result = [];
        d.node.for_r(d, nodes, r=>{
            const ne = d.node.ne(d,r).find(e=> nodes.includes(e.n));
            if(ne) result.push(ne);//d.node.for_n(d, r, (r,n,t,o)=>{  if(nodes.includes(n)) result.push({r:r,n:n,t:t,o:o});   })
        });
        return result;
    },
    for_n:(d, roots, func, a)=> d.node.ne(d,roots,a).forEach(e=> func(...Object.values(e))), // rename to for_ne
    for_r:(d, nodes, func, a)=> d.node.re(d,nodes,a).forEach(e=> func(...Object.values(e))), // make for loop and exit when function returns true
    for_rn:(d, nodes, func)=> d.node.rne(d,nodes).forEach(e=> func(...Object.values(e))), // use .some instead of .forEach so can exit loop early from inside func?!?!?!?!
    close:(d, n)=>{
        d.n[n].open = false; // rename to closed?
        d.pick.set(d, n, false);
        d.pick.hover(d, n, false);
        d.next('graph.update');
    },
}});


// delete:(d, n, a)=>{ // allow delete if not asset when it is another user deleting 
    //     var nodes = [n];
    //     if(a.deep) nodes = nodes.concat(d.node.n(d, n, a));
    //     nodes.filter(n=> d.n[n].asset).forEach(n=>{
    //         d.node.for_rn(d, n, e=> d.edge.delete(d,e));//d.edge.delete(d, d.node.rne(d,n));
    //         d.node.for_n(d, n, e=>  d.edge.delete(d,e));//d.edge.delete(d, d.node.ne(d,n));
    //         d.node.close(d, n);
    //         d.n[n].deleted = true;
    //     });
    // },

// for_rn(d, nodes, func){ // use .some instead of .forEach so can exit loop early from inside func?!?!?!?!
    //     d.node.for_r(d, nodes, r=> 
    //         d.node.for_n(d, r, (r,n,t,o)=>{  if(nodes.includes(n)) func(r,n,t,o);   })
    //     );
    // },

// const root_edges = [];
            // d.node.for_rn(d, n, (r,n,t,o)=>{ 
            //     root_edges.push({r:r, n:n, t:t, o:o});
            // });
            // d.node.delete_edges(d, root_edges);

// var re = null;
            // d.node.for_r(d, e.n, (r,n,t,o)=>{
            //     if(r == e.r) re = {t:t, o:o};
            // });

// const node_edges = [];
            // d.node.for_n(d, n, (r,n,t,o)=>{
            //     node_edges.push({r:r, n:n, t:t, o:o});
            // });
            // d.node.delete_edges(d, node_edges);

//if(a.deep) d.node.for_n(d, n, (r,n)=> nodes.push(n), {deep:true}); // must check if no roots except profile, public, etc


// const dead_nodes = [];
//         function push_node(d, n, a){
//             if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
//                 dead_nodes.push(n);
//                 if(a.deep){
//                     //d.delete.node(d, d.n[n].get_n, deep); // make get_n that does what for_n does but just provides list
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

