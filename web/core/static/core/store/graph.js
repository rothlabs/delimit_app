import { Vector3 } from 'three';

export const create_graph_slice = (set,get)=>({graph:{
    scale: 1,
    nodes: [],
    edges: [],
    edge_vis:{
        view:false, asset:false,
        name:true, x:true, y:true, z:true, point:true, line:true,
    },
    init(d){
        d.graph.tag_vis = {
            ...Object.fromEntries(d.node_tags.map(t=> [t,true])),
            decimal:false, text:false
        };
    },
    set_tag_vis:(d, t, vis)=>{
        d.graph.tag_vis = {...d.graph.tag_vis}; // make new object so visual panel rerenders
        d.graph.tag_vis[t] = vis;
        Object.values(d.n).forEach(n=>{
            if(d.graph.tag_vis[n.t]!=undefined) n.graph.vis = d.graph.tag_vis[n.t];
        });
        d.graph.update(d);
    },
    set_edge_vis:(d, t, vis)=>{
        d.graph.edge_vis = {...d.graph.edge_vis}; // make new object so visual panel rerenders
        d.graph.edge_vis[t] = vis;
        d.graph.update(d);
    },
    update:d=>{
        //console.log('update graph');
        d.graph.nodes = Object.keys(d.n).filter(n=> d.n[n].open && d.n[n].graph.vis);
        d.graph.edges = [];
        //d.graph.nodes.forEach(r=>{
            d.node.for_n(d, d.graph.nodes, (r,n,t)=>{
                if(d.node.be(d,n) && d.n[n].graph.vis && d.graph.edge_vis[t]){ //  && r!=n,  r==n should probably never be allowd in the first place
                    d.graph.edges.push({r:r, t:t, n:n}); 
                }
            });
       // });

        d.graph.nodes.forEach(n=>{   
            d.n[n].graph.lvl = 0; 
            d.n[n].graph.grp = null;  
        }); //Object.values(d.n).forEach(n=> n.graph.lvl=0);
        
        var highest_lvl = 0;
        var setting_lvl = true; 
        while(setting_lvl){
            setting_lvl = false;
            d.graph.nodes.forEach(n=>{ 
                //d.n[n].graph.order = {x:0, count:0}; 
                var lvl = 0;
                d.node.for_r(d, n, r=>{
                    if(d.graph.nodes.includes(r)){
                        if(d.n[r].graph.lvl > lvl) lvl = d.n[r].graph.lvl;
                    }
                });
                if(d.n[n].graph.lvl != lvl+1){
                    d.n[n].graph.lvl = lvl+1;
                    highest_lvl = lvl+1;
                    setting_lvl = true;
                }
            });
        }

        const level = [];
        for(var i=0; i<=highest_lvl+2; i++){  level.push({max_x:0, group:{}});  }
        d.graph.nodes.forEach(n=>{
            const lvl = d.n[n].graph.lvl;
            var rt = [];
            d.node.for_r(d, n, (r,n,t)=>{
                if(t != 'unknown' && d.graph.nodes.includes(r)) rt.push(r);       
            });
            const grp = d.n[n].t+'__'+rt.sort().join('_'); //JSON.stringify(d.n[n].r)
            console.log('graph lvl', lvl);
            if(level[lvl].group[grp] == undefined) level[lvl].group[grp] = {n:[], x:0, c:0};
            level[lvl].group[grp].n.push(n);
            d.n[n].graph.grp = grp; 
        });

        var lx=0;
        var ly=0;
        var max_x = 0;
        var max_y = 0;
        level.forEach((l,i)=>{
            var gx = lx;
            if(i > 0) Object.values(l.group).forEach(g=> g.x /= g.c);
            Object.values(l.group).sort((a,b)=>{
                if(a.x < b.x) return -1;    if(a.x > b.x) return  1;    return 0;
            }).forEach(g=>{
                const size = Math.round(Math.sqrt(g.n.length));
                var x = gx;
                var y = ly;
                g.n.forEach(n=>{
                    if(x > l.max_x) l.max_x = x;
                    if(y > max_y) max_y = y;
                    d.n[n].graph.pos.set(x, -y, 0);
                    if(i+1 < level.length){
                        d.node.for_n(d, n, (r,n)=>{if(level[i+1].group[d.n[n].graph.grp]){
                            level[i+1].group[d.n[n].graph.grp].x += x;
                            level[i+1].group[d.n[n].graph.grp].c++;
                        }});
                    }
                    y++;
                    if(y >= ly+size){
                        y=ly;  
                        x++;
                    }
                });
                gx = l.max_x + 2;
            });
            if(l.max_x > max_x) max_x = l.max_x;
            ly = max_y + 2;
        });

        if(d.graph.scale == 1){
            const window_size = window.innerWidth > window.innerHeight ? window.innerWidth : window.innerHeight
            const graph_size = max_x > max_y ? max_x : max_y;
            d.graph.scale = window_size / graph_size / 2;
        }
        d.graph.nodes.forEach(n=>{   
            d.n[n].graph = {...d.n[n].graph, pos: d.n[n].graph.pos.multiplyScalar(d.graph.scale).add(new Vector3(
                -level[d.n[n].graph.lvl].max_x*d.graph.scale/2, // -max_x*d.graph.scale/2
                (max_y+2)*d.graph.scale/2,
                0
            ))};
        });
    },
}});








// const level = [];
//         for(var i=0; i<=highest_lvl+2; i++){  level.push({});  }
//         d.graph.nodes.forEach(n=>{
//             const lvl = d.n[n].graph.lvl;
//             var rt = [];
//             d.node.for_r(d, n, r=>{     if(d.graph.nodes.includes(r)) rt.push(r);       });
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
//         d.graph.nodes.forEach(n=>{   
//             d.n[n].graph = {...d.n[n].graph, 
//                 pos: d.n[n].graph.pos.multiplyScalar(d.graph.scale).add(new Vector3(-max_x*d.graph.scale/2,-(max_y+2)*d.graph.scale/2,0))
//             };
//         });






// update: d=>{
//     d.graph.nodes = Object.keys(d.n);
//     d.graph.edges = [];
//     Object.entries(d.n).forEach(([rid,r],i)=> {
//         r.n && Object.entries(r.n).forEach(([tag,nodes],i)=>{
//             nodes.forEach(nid=>{
//                 d.n[nid] && rid!=nid && d.graph.edges.push({r:rid, tag:tag, n:nid}); // might not need rid!=nid
//             });
//         });
//     });
//     //d.graph.edges = edges;
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