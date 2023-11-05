import {Vector3, Matrix4} from 'three';
import {static_url, readable} from '../app.js';

const tv = new Vector3();
const tm = new Matrix4();

export const create_graph_slice = (set,get)=>({graph:{
    scale: 1,
    n: [],
    e: [], 
    init(d){
        // for(const [t, node] of Object.entries(d.node)){
        //     node.icon = static_url+'icon/node/'+t+'.svg';
        //     node.tag = readable(t);
        //     node.css = d.node_css[t];
        // }

        d.graph.n_vis={ // n_vis
            ...Object.fromEntries(d.node_classes.map(t=>[t,true])),
            //switch:false, integer:false, decimal:false, text:false, point:false,
            //public:false, 
        };
        d.graph.e_vis={ // e_vis
            //...Object.fromEntries(Object.keys(d.root_tags).map(t=>[t,true])),
            ...Object.fromEntries(d.terminal_tags.map(t=>[t,true])), 
            ...Object.fromEntries(d.stem_tags.map(t=>[t,true])),
            //viewable:false, asset:false,
        };
        //delete d.graph.e_vis.decimal;
        //delete d.graph.e_vis.text;
    },
    set_node_vis:(d, t, vis)=>{
        d.graph.n_vis = {...d.graph.n_vis}; // make new object so visual panel rerenders
        d.graph.n_vis[t] = vis;
        // Object.values(d.n).forEach(n=>{
        //     if(d.graph.n_vis[n.t]!=undefined) n.graph.vis = d.graph.n_vis[n.t];
        // });
        d.graph.update(d);
    },
    set_edge_vis:(d, t, vis)=>{
        d.graph.e_vis = {...d.graph.e_vis}; // make new object so visual panel rerenders
        d.graph.e_vis[t] = vis;
        d.graph.update(d);
    },
    update:d=>{
        //console.log('update graph!!!');
        d.graph.n = Object.fromEntries(Object.keys(d.n).filter(n=> d.graph.ex(d,n) && d.graph.n_vis[d.n[n].t]).map(n=>[n,true]));//d.n[n].open && d.n[n].graph.vis);

        d.graph.e = [];
        d.graph.for_stem(d, Object.keys(d.graph.n), (r,n,t)=>{
            if(d.graph.n[r] && d.graph.e_vis[t] && d.graph.n[n]){ //if(d.graph.ex(d,n) && d.n[n].graph.vis && d.graph.e_vis[t]){ //  && r!=n,  r==n should probably never be allowd in the first place
                d.graph.e.push({r:r, t:t, n:n}); 
            }
        });
        //console.log('display edges', d.graph.e);

        for(const n of Object.keys(d.graph.n)){//for(const n of Object.keys(d.graph.n)){//d.graph.n.forEach(n=>{  
            d.n[n].graph.lvl = 0; 
            d.n[n].graph.grp = null;  
        }//}); //Object.values(d.n).forEach(n=> n.graph.lvl=0);
        
        var highest_lvl = 0;
        var setting_lvl = true; 
        while(setting_lvl){
            setting_lvl = false;
            for(const n of Object.keys(d.graph.n)){//d.graph.n.forEach(n=>{
                //d.n[n].graph.order = {x:0, count:0}; 
                var lvl = 0;
                d.graph.for_root(d, n, r=>{
                    if(d.graph.n[r]){//if(d.graph.n.includes(r)){
                        if(d.n[r].graph.lvl > lvl) lvl = d.n[r].graph.lvl;
                    }
                });
                if(d.n[n].graph.lvl != lvl+1){
                    d.n[n].graph.lvl = lvl+1;
                    highest_lvl = lvl+1;
                    setting_lvl = true;
                }
            }//);
        }

        const level = [];
        for(var i=0; i<=highest_lvl+10; i++){  level.push({max_x:0, group:{}, count:0});  }
        for(const n of Object.keys(d.graph.n)){//d.graph.n.forEach(n=>{
            const lvl = d.n[n].graph.lvl;
            var rt = [];
            d.graph.for_root(d, n, (r,n,t)=>{
                if(t != 'unknown' && d.graph.n[r]) rt.push(r);       
            });
            const grp = d.n[n].t+'__'+rt.sort().join('_'); //JSON.stringify(d.n[n].r)
            if(level[lvl].group[grp] == undefined) level[lvl].group[grp] = {n:[], x:0, count:0};
            level[lvl].group[grp].n.push(n);
            level[lvl].count++;
            d.n[n].graph.grp = grp; 
        }//);

        var ly=0;
        var max_x = 0;
        var max_y = 0;
        for(var i=0; i<level.length-1; i++){//level.forEach((l,i)=>{if(i+1 < level.length){
            var l = level[i],  ll = level[i+1],  prev_l = level[i-1];
            var gx = 0;
            var x_step = ((ll.count + (prev_l ? prev_l.count : 0)) / 2 / l.count);
            if(x_step < 1) x_step = 1;
            const groups = Object.values(l.group);
            if(i > 0) groups.forEach(g=> g.x /= g.count+0.00001);
            groups.sort((a,b)=>{
                if(a.x < b.x) return -1;    
                if(a.x > b.x) return  1;    
                return 0;
            }).forEach(g=>{
                const size = Math.round(Math.sqrt(g.n.length / 2));
                var x = gx;//(gx > g.x ? gx : g.x);
                var y = ly;
                g.n.forEach(n=>{
                    if(x > l.max_x) l.max_x = x;
                    if(y > max_y) max_y = y;
                    d.n[n].graph.pos.set(x, -y, 0);
                    d.graph.for_stem(d, n, (r,n)=>{if(ll.group[d.n[n].graph.grp]){
                        ll.group[d.n[n].graph.grp].x+=x;
                        ll.group[d.n[n].graph.grp].count++;
                    }});
                    y++;
                    if(y >= ly+size){
                        y=ly;  
                        x += x_step;
                    }
                });
                gx = l.max_x + x_step*1.5;
            });
            if(l.max_x > max_x) max_x = l.max_x;
            ly = max_y + 2;
        };

        if(d.graph.scale == 1){
            const window_size = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight
            const graph_size = max_x > max_y ? max_x : max_y;
            d.graph.scale = window_size / graph_size / 2;
        }
        for(const n of Object.keys(d.graph.n)){//d.graph.n.forEach(n=>{ 
            var lvl = d.n[n].graph.lvl;
            d.n[n].graph = {...d.n[n].graph, pos: d.n[n].graph.pos.multiplyScalar(d.graph.scale).add(tv.set(
                -level[lvl].max_x*d.graph.scale/2,   // -max_x*d.graph.scale/2
                (max_y+2)*d.graph.scale/2,
                0
            ))};
        }//);
    },
    ////////////////////////////////////////////  Utils //////////////////////////////
    ex:(d,n)=>{ //use try catch to perform func ?!?!?!?! // have to calculate this every time a user wants to know because the node could not be present at all
        //if(n){
            //if(Array.isArray(n)) n = n[0];
            if(d.n[n] && !d.n[n].drop){
                if(d.n[n].open) return 'open';
                return 'here';
            }
        //}
        return null;
    },
    // cats(d,n){
    //     const result = [];
    //     Object.keys(d.cats).forEach(t=>{  
    //         d.for(n, n=>{
    //             if(d.n[n].r[t]) d.add(result, t);
    //         });
    //     });
    //     return result;
    // },
    admin(d, n){
        return d.as_array(n).some(n=> d.admin_classes.includes(d.n[n].t));
    },
    pin_pos(d, n, matrix){  // should go in transform slice?    
        if(d.graph.ex(d,n) && d.n[n]?.p?.isVector3){
            if(!d.n[n].pin.pos) d.n[n].pin.pos = new Vector3();    //const pos = d.graph.get(d, n, 'x y z');
            d.n[n].pin.pos.copy(d.n[n].p).applyMatrix4(tm.copy(matrix).invert());
        }
    },
    set_pos(d, n, pos){ // should go in transform slice? // should be in cast clice ?!?!?!
        //if(d.n[n].c.invert) pos.applyMatrix4(d.n[n].c.invert);
        //if(d.n[n].ax.invert) pos.applyMatrix4(d.n[n].ax.invert);
        d.graph.set(d, n, {x:pos.x, y:pos.y, z:pos.z});
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
        if(d.n[n].n){
            Object.entries(a).forEach(([t,v],i)=>{
                if(d.n[n].n[t]){
                    d.for(v, (v,o)=> d.graph.sv(d, d.n[n].n[t][o], v));
                    //if(d.cast_tags.includes(t)) d.cast.v(d,n,t,v);//d.graph.for_stem_of_tag(d,n,'point', p=>d.next('reckon.up',p));
                }//else if(d.n[n].c[t]!=undefined){ d.cast.v(d,n,t,v) }
            });
        }
    },
    // gv (get value) ? #1
    sv(d, n, v){ // rename to set_atom?
        if(d.graph.ex(d,n) && d.n[n].t == 'decimal') v = d.rnd(v);//Math.round((v + Number.EPSILON) * 100) / 100; Math.round((v + Number.EPSILON) * 100) / 100;//parseFloat(v.toFixed(2));// Math.round(v*100)*0.01; // need to set flag that says 'is_atom' or 'is_float'
        d.n[n].v = v; // check if has v?
        d.next('reckon.up', n); // d.reckon.up(d, n);
    },
    stem(d, roots, a={}){ 
        if(!Array.isArray(roots)) roots = [roots]; //if(!filter) filter = ['open']; 
        var result = []; // should be key value pair for faster checking?  
        var add_n = (r,n,t,o)=> d.add(result, n);//result.push(n); 
        if(a.edge) add_n = (r,n,t,o)=>result.push({r:r,n:n,t:t,o:o}); // use d.add to avoid duplicates ?!?!?!
        //if(a.unique && !a.collected) a.collected = {...Object.fromEntries(roots.map(r=>[r,true]))};
        if(!a.collected) a.collected = {...Object.fromEntries(roots.map(r=>[r,true]))};
        roots.forEach(r=>{
            if(d.graph.ex(d,r) && d.n[r].n) Object.entries(d.n[r].n).forEach(([t,nodes],i)=> nodes.forEach((n,o)=>{
                if(d.graph.ex(d,n)=='open' && (a.edge || !a.collected[n])){
                    if(!(a.unique && d.graph.asset_root(d,n).some(r=> !a.collected[r])) && !(a.filter && !a.filter(n))){ //a.n.includes(r)
                        add_n(r,n,t,o); //if(allow_null || d.graph.ex(d, n)) func(n,t,o);  //if(filter.includes(d.graph.ex(d,n)))
                        a.collected[n] = true; //if(a.unique) a.collected[n] = true;
                        if(a.deep) result = result.concat(d.graph.stem(d,n,a));
                    }
                }
            }));
        });
        return result;
    },
    unique_stem:(d, roots, a)=> d.graph.stem(d, roots, {unique:true, ...a}),
    stem_edge:(d, roots, a)=> d.graph.stem(d, roots, {edge:true, ...a}),
    stem_of_tag:(d, roots, t)=> d.graph.stem(d, roots, {deep:true}).filter(n=> d.n[n].t==t),
    for_stem_of_tag:(d,roots,t,func)=> d.graph.stem(d, roots, {deep:true}).forEach(n=>{
        if(d.n[n].t==t) func(n);
    }),
    root(d, nodes, a={}){ 
        //if(!Array.isArray(nodes)) nodes = [nodes];
        var result = [];//const result = (a.rt ? [...nodes] : []); // might not need this ?!?!?!
        var add_r = (r,n,t,o)=> result.push(r); //d.add(d, result, r);// 
        if(a.edge) add_r = (r,n,t,o)=> result.push({r:r,n:n,t:t,o:o}); // use d.add to avoid duplicates (upgrad for deep compare) ?!?!?!
        if(!a.collected) a.collected = {};//...Object.fromEntries(nodes.map(r=>[r,true]))};
        d.for(nodes, n=>{//nodes.forEach(n=>{
            if(d.graph.ex(d,n)) Object.entries(d.n[n].r).forEach(([t,roots],i)=>{ 
                if(!(a.asset && ['owner','viewer'].includes(t))) roots.forEach((r,o)=> { // 'group' causing things like shared name to be delete when trying to remove name from none group
                    if(d.graph.ex(d,r) == 'open' && (a.edge || !a.collected[r])){
                        if(!(a.filter && !a.filter(r))){ // && !(a.t && !d.n[r].t==a.t)
                            add_r(r,n,t,o); //if(allow_null || d.graph.ex(d, r)) func(r,t,o);
                            a.collected[r] = true;
                            if(a.deep) result = result.concat(d.graph.root(d,r,a));
                        }
                    }
                });
            });
        });
        return result;
    },
    asset_root:(d, n)=> d.graph.root(d, n, {asset:true}),//.filter(e=> !['owner', 'viewer'].includes(e.t)),
    root_edge:(d, n, a)=> d.graph.root(d, n, {edge:true, ...a}),
    //rt0:(d,n,t)=> d.graph.root(d, n, {deep:true}).filter(r=>d.n[r].t==t)[0], // a.exit condition to exit search on correct condition
    root_stem(d, nodes, a={}){
        const result = [];
        d.graph.for_root(d, nodes, r=>{
            const ne = d.graph.stem_edge(d,r).find(e=> nodes.includes(e.n));
            if(ne) result.push(ne);//d.graph.for_stem(d, r, (r,n,t,o)=>{  if(nodes.includes(n)) result.push({r:r,n:n,t:t,o:o});   })
        }, a);
        return result;
    },
    for_stem:(d, roots, func, a)=> d.graph.stem_edge(d,roots,a).forEach(e=> func(...Object.values(e))), // rename to for_ne
    for_root:(d, nodes, func, a)=> d.graph.root_edge(d,nodes,a).forEach(e=> func(...Object.values(e))), // make for loop and exit when function returns true
    for_root_stem:(d, nodes, func)=> d.graph.root_stem(d,nodes).forEach(e=> func(...Object.values(e))), // use .some instead of .forEach so can exit loop early from inside func?!?!?!?!
    close:(d, n)=>{ // need to remove edges to this node after close ?!?!?!?!
        d.n[n].open = false; // rename to closed?
        d.pick.set(d, n, false);
        d.pick.hover(d, n, false); // not needed?
        d.next('graph.update');
    },
}});



// level.reverse().forEach((l,i)=>{
        //     var ll = level[i+1];
        //     console.log(l,ll,i);
        //     if(ll && l.max_x > ll.max_x){
        //         var old_max_x = ll.max_x;
        //         //ll.max_x += 3;
        //         //if(ll.max_x > max_x) max_x = l.max_x;
        //         var scale_x = ll.max_x / old_max_x;
        //         //ll.max_x += l.max_x - ll.max_x;
        //         //var scale_x = l.max_x / ll.max_x;
        //         //ll.max_x = l.max_x;
        //         Object.values(ll.group).forEach(g=>{
        //             g.n.forEach(n=>{ 
        //                 d.n[n].graph.pos.multiply(tv.set(scale_x,1,1));
        //             });
        //         });
        //     }
        // });
        // level.reverse();

// *((level[lvl+1] && level[lvl+1].max_x > level[lvl].max_x) ? (level[lvl+1].max_x/level[lvl].max_x) : 1)


//d.graph.n.sort((a,b)=>{
        //    if(d.n[a].graph.lvl > d.n[b].graph.lvl) return -1;
        //    return 1;
        //}).forEach(n=>{ 


// const level = [];
//         for(var i=0; i<=highest_lvl+2; i++){  level.push({});  }
//         d.graph.n.forEach(n=>{
//             const lvl = d.n[n].graph.lvl;
//             var rt = [];
//             d.graph.for_root(d, n, r=>{     if(d.graph.n.includes(r)) rt.push(r);       });
//             const grp = d.n[n].t+'__'+rt.sort().join('_'); //JSON.stringify(d.n[n].r)
//             if(level[lvl][grp] == undefined) level[lvl][grp] = [];
//             level[lvl][grp].push(n);
//         });

//         var lx=0;
//         var ly=0;
//         var max_x = 0;
//         var max_y = 0;
//         level.forEach(l=>{
//             var gx = lx;
//             var l.max_x = 0;
//             Object.values(l).forEach(g=>{
//                 const size = Math.round(Math.sqrt(g.length));
//                 var x = gx;
//                 var y = ly;
//                 g.forEach(n=>{
//                     if(x > l.max_x) l.max_x = x;
//                     if(y > max_y) max_y = y;
//                     d.n[n].graph.pos.set(x, y, 0);
//                     y++;
//                     if(y >= ly+size){
//                         y=ly;  
//                         x++;
//                     }
//                 });
//                 gx = l.max_x + 2;
//             });
//             if(l.max_x > max_x) max_x = l.max_x;
//             ly = max_y + 2;
//         });

//         if(d.graph.scale == 1){
//             const window_size = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight
//             const graph_size = max_x > max_y ? max_x : max_y;
//             d.graph.scale = window_size / graph_size / 2;
//         }
//         for(const n of Object.keys(d.graph.n)){//d.graph.n.forEach(n=>{  
//             d.n[n].graph = {...d.n[n].graph, 
//                 pos: d.n[n].graph.pos.multiplyScalar(d.graph.scale).add(new Vector3(-max_x*d.graph.scale/2,-(max_y+2)*d.graph.scale/2,0))
//             };
//         });






// update: d=>{
//     d.graph.n = Object.keys(d.n);
//     d.graph.e = [];
//     Object.entries(d.n).forEach(([rid,r],i)=> {
//         r.n && Object.entries(r.n).forEach(([tag,nodes],i)=>{
//             nodes.forEach(nid=>{
//                 d.n[nid] && rid!=nid && d.graph.e.push({r:rid, tag:tag, n:nid}); // might not need rid!=nid
//             });
//         });
//     });
//     //d.graph.e = edges;
//     d.graph.arrange = true;
// },



//node_tag_vis: {},//get().node_tag.map(t=> true),

// node_edges: id=>{const d = get();
//     var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1); // use entries?
//     return edges.filter(e=> id!=e.n && d.n[e.n]);// && d.graph.node_tag_vis[d.tag(e.n)]);
// },

// add: id=>{
//     const i = d.selection.indexOf(id);
//     if(i<0) 
// },
// remove: id=>{
//     const i = d.selection.indexOf(id);
// },


// nodes: ()=>{const d = get();
//     return Object.keys(d.n);//.filter(id=> d.graph.node_tag_vis[d.tag(id)]);
// },
// edges: ()=>{const d = get();
//     var edges = [];
//     Object.entries(d.n).forEach(([nid,n],i)=> {
//         Object.values(n.r).forEach(roots=>{
//             roots.forEach(rid=>{
//                 d.n[rid] && rid!=nid && edges.push({r:rid,n:nid}); // might not need rid!=nid
//             });
//         });
//     });
//     //console.log(edges);
//     return edges;
// },
// node_edges: id=>{const d = get();
//     var edges = Object.keys(d.n[id].n).map(t=>d.n[id].n[t].map(n=> ({t:t,n:n}) )).flat(1); // use entries?
//     return edges.filter(e=> id!=e.n && d.n[e.n]);// && d.graph.node_tag_vis[d.tag(e.n)]);
// },