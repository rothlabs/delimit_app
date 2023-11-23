export const face = {
    name:(d, node)=> d.leaf(d, node, ['name', 'leaf'], 'untitled'),
    icon:(d, node)=> d.leaf(d, node, ['spec icon code', 'icon code'], d.face.alt.icon),
    tag: (d, node)=> d.leaf(d, node, ['spec tag', 'tag'], 'node'),
};

const pick = (d, node, picked, alt) => d.picked.node.has(node) ? picked : alt;

face.color = {
    primary:(d, node)     => pick(d, node, d.color.body_fg, d.color.primary),
    secondary:(d, node)   => pick(d, node, d.color.primary, d.color.secondary),
    body:(d, node)        => pick(d, node, d.color.primary, d.color.body_bg),
    tertiary_fg:(d, node) => pick(d, node, d.color.primary, d.color.tertiary_fg),
};

face.material = {
    primary:(d, node)     => pick(d, node, d.material.body_fg, d.material.primary),
    secondary:(d, node)   => pick(d, node, d.material.primary, d.material.secondary),
    tertiary_fg:(d, node) => pick(d, node, d.material.primary, d.material.tertiary_fg),
},

face.alt = {
    icon:`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box" viewBox="0 0 16 16">
            <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
          </svg>`,
};

// face.color = {
//     primary(d, node){
//         return d.picked.node.has(node) ? d.color.body_fg : d.color.primary;
//     },
//     secondary(d, node){
//         return d.picked.node.has(node) ? d.color.primary : d.color.secondary;
//     },
//     body(d, node){
//         return d.picked.node.has(node) ? d.color.primary : d.color.body_bg;
//     },
//     tertiary_fg(d, node){
//         return d.picked.node.has(node) ? d.color.primary : d.color.tertiary_fg;
//     },
// };

// face.material = {
//     primary(d, node){
//         return d.picked.node.has(node) ? d.material.body_fg : d.material.primary;
//     },
//     secondary(d, node){
//         return d.picked.node.has(node) ? d.material.primary : d.material.secondary;
//     },
//     tertiary_fg(d, node){
//         return d.picked.node.has(node) ? d.material.primary : d.material.tertiary_fg;
//     },
// },




// try{
//     return d.n[d.n[d.n[n].n.spec[0]].n.tag[0]].v;
// }catch{
//     return 'Node';
// }

// try{
        //     return d.n[d.n[d.n[d.n[n].n.spec[0]].n.icon[0]].n.code[0]].v;
        // }catch{
        //     return default_icon;
        // }

// import {Vector3, Matrix4} from 'three';
// //import {static_url, readable} from '../app.js';
// import {brush} from './node/brush.js';
// import {curve} from './node/curve.js';
// import {ellipse} from './node/ellipse.js';
// import {image} from './node/image.js';
// import {layer} from './node/layer.js';
// import {machine} from './node/machine.js';
// import {point} from './node/point.js';
// import {post} from './node/post.js';
// import {shape} from './node/shape.js';
// import {sketch} from './node/sketch.js';
// import {slice} from './node/slice.js';
// import {surface} from './node/surface.js';
// import {transform} from './node/transform.js';


    // brush,
    // curve,
    // ellipse,
    // image,
    // layer,
    // machine,
    // point,
    // post,
    // shape,
    // sketch,
    // slice,
    // surface,
    // transform,


//init(d){
        // for(const [t, node] of Object.entries(d.node)){
        //     node.icon = static_url+'icon/node/'+t+'.svg';
        //     node.tag = readable(t);
        //     node.css = d.node_css[t];
        // }
        // d.node.meta = Object.fromEntries(d.node_classes.map(t=>[t,{
        //     icon: static_url+'icon/node/'+t+'.svg',
        //     tag: readable(t),
        //     css: d.node_css[t],
        // }])); // put in config file
    //},


// be:(d,n)=>{ // have to calculate this every time a user wants to know because the node could not be present at all
//     if(d.n[n] && !d.n[n].deleted){
//         if(d.n[n].open) return 'open';
//         return 'here';
//     }
//     return null;
// },

// delete:(d, n, a)=>{ // allow delete if not asset when it is another user deleting 
    //     var nodes = [n];
    //     if(a.deep) nodes = nodes.concat(d.graph.stem(d, n, a));
    //     nodes.filter(n=> d.n[n].asset).forEach(n=>{
    //         d.graph.for_root_stem(d, n, e=> d.edge.delete(d,e));//d.edge.delete(d, d.graph.root_stem(d,n));
    //         d.graph.for_stem(d, n, e=>  d.edge.delete(d,e));//d.edge.delete(d, d.graph.stem_edge(d,n));
    //         d.graph.close(d, n);
    //         d.n[n].deleted = true;
    //     });
    // },

// for_rn(d, nodes, func){ // use .some instead of .forEach so can exit loop early from inside func?!?!?!?!
    //     d.graph.for_root(d, nodes, r=> 
    //         d.graph.for_stem(d, r, (r,n,t,o)=>{  if(nodes.includes(n)) func(r,n,t,o);   })
    //     );
    // },

// const root_edges = [];
            // d.graph.for_root_stem(d, n, (r,n,t,o)=>{ 
            //     root_edges.push({r:r, n:n, t:t, o:o});
            // });
            // d.node.delete_edges(d, root_edges);

// var re = null;
            // d.graph.for_root(d, e.n, (r,n,t,o)=>{
            //     if(r == e.r) re = {t:t, o:o};
            // });

// const node_edges = [];
            // d.graph.for_stem(d, n, (r,n,t,o)=>{
            //     node_edges.push({r:r, n:n, t:t, o:o});
            // });
            // d.node.delete_edges(d, node_edges);

//if(a.deep) d.graph.for_stem(d, n, (r,n)=> nodes.push(n), {deep:true}); // must check if no roots except profile, public, etc


// const dead_nodes = [];
//         function push_node(d, n, a){
//             if(d.n[n].asset) { // must check if every root is an asset too!!! (except public, profile, etc)
//                 dead_nodes.push(n);
//                 if(a.deep){
//                     //d.delete.node(d, d.n[n].get_n, deep); // make get_n that does what for_n does but just provides list
//                     d.graph.for_stem(d, n, (r,n)=> push_node(d, n, a)); // must check if no roots except profile, public, etc
//                 }
//             }
//         }
//         push_node(d, n, a);


//d.graph.for_root(d, n, rr=>{
                //    if(r==rr) node_edges.push({r:r, n:n, t:t, o:o});
                //}); // don't have to set to null if set deleted after?

// //var reset_root_edges = false;
//             //if(d.order_tags.includes(d.n[n].t)) reset_root_edges=true;  
//             const root_edges = [];
//             d.graph.for_root(d, n, r=>{ // rewrite to use one loop: d.graph.for_stem(d, d.n[n].r, (r,n,t,o)=>{
//                 d.graph.for_stem(d, r, (rr,nn,t,o)=>{
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
//         if(d.n[n].n && d.n[n].n[t] && d.graph.ex(d,d.n[n].n[t][0])) result[t] = d.n[d.n[n].n[t][0]].v;
//     });
//     return result;
// },

// get:(d, n, t, o)=>{
    //     if(!o) o=0;
    //     if(d.n[n].n[t] && o < d.n[n].n[t].length) return d.n[n].n[t][o];
    //     return null;
    // },

