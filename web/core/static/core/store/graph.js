import { Vector3 } from 'three';

const tv = new Vector3();

export const create_graph_slice = (set,get)=>({graph:{
    scale: 1,
    n: [],
    e: [], // rename to e?
    init(d){
        d.graph.n_vis={ // n_vis
            ...Object.fromEntries(d.node_tags.map(t=>[t,true])),
            switch:false, integer:false, decimal:false, text:false, point:false,//matrix:false, 
            public:false, auxiliary:false, top_view:false, side_view:false, front_view:false, face_camera:false,
            manual_compute:false,
        };
        d.graph.e_vis={ // e_vis
            ...Object.fromEntries(Object.keys(d.root_tags).map(t=>[t,true])),
            ...Object.fromEntries([...d.subject_tags, ...d.value_tags].map(t=>[t,true])), 
            viewable:false, asset:false,
        };
        delete d.graph.e_vis.decimal;
        delete d.graph.e_vis.text;
    },
    set_node_vis:(d, t, vis)=>{
        d.graph.n_vis = {...d.graph.n_vis}; // make new object so visual panel rerenders
        d.graph.n_vis[t] = vis;
        Object.values(d.n).forEach(n=>{
            if(d.graph.n_vis[n.t]!=undefined) n.graph.vis = d.graph.n_vis[n.t];
        });
        d.graph.update(d);
    },
    set_edge_vis:(d, t, vis)=>{
        d.graph.e_vis = {...d.graph.e_vis}; // make new object so visual panel rerenders
        d.graph.e_vis[t] = vis;
        d.graph.update(d);
    },
    update:d=>{
        //console.log('update graph!!!');
        d.graph.n = Object.keys(d.n).filter(n=> d.n[n].open && d.n[n].graph.vis);
        d.graph.e = [];
        d.node.for_n(d, d.graph.n, (r,n,t)=>{
            if(d.node.be(d,n) && d.n[n].graph.vis && d.graph.e_vis[t]){ //  && r!=n,  r==n should probably never be allowd in the first place
                d.graph.e.push({r:r, t:t, n:n}); 
            }
        });


        d.graph.n.forEach(n=>{   
            d.n[n].graph.lvl = 0; 
            d.n[n].graph.grp = null;  
        }); //Object.values(d.n).forEach(n=> n.graph.lvl=0);
        
        var highest_lvl = 0;
        var setting_lvl = true; 
        while(setting_lvl){
            setting_lvl = false;
            d.graph.n.forEach(n=>{ 
                //d.n[n].graph.order = {x:0, count:0}; 
                var lvl = 0;
                d.node.for_r(d, n, r=>{
                    if(d.graph.n.includes(r)){
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
        for(var i=0; i<=highest_lvl+10; i++){  level.push({max_x:0, group:{}, count:0});  }
        d.graph.n.forEach(n=>{
            const lvl = d.n[n].graph.lvl;
            var rt = [];
            d.node.for_r(d, n, (r,n,t)=>{
                if(t != 'unknown' && d.graph.n.includes(r)) rt.push(r);       
            });
            const grp = d.n[n].t+'__'+rt.sort().join('_'); //JSON.stringify(d.n[n].r)
            if(level[lvl].group[grp] == undefined) level[lvl].group[grp] = {n:[], x:0, count:0};
            level[lvl].group[grp].n.push(n);
            level[lvl].count++;
            d.n[n].graph.grp = grp; 
        });

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
                    d.node.for_n(d, n, (r,n)=>{if(ll.group[d.n[n].graph.grp]){
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
        d.graph.n.forEach(n=>{  
            var lvl = d.n[n].graph.lvl;
            d.n[n].graph = {...d.n[n].graph, pos: d.n[n].graph.pos.multiplyScalar(d.graph.scale).add(tv.set(
                -level[lvl].max_x*d.graph.scale/2,   // -max_x*d.graph.scale/2
                (max_y+2)*d.graph.scale/2,
                0
            ))};
        });
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
//             d.node.for_r(d, n, r=>{     if(d.graph.n.includes(r)) rt.push(r);       });
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
//         d.graph.n.forEach(n=>{   
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