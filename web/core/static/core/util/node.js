function update(d, n){
    //console.log('update node!!! '+n);
    d.node.for_r(d, n, r=> d.n[r].update(d)); // got to watch out for cycle!!! (could pass update id and stop if updated already made with that id)
}

export const update_funcs = {
    'point':n=>(d=>{
        //console.log('update point!!! '+n);
        d.n[n].c.x = d.node.gv(d, n, 'x'); // make func that returns undefined or deletes attribute it's trying to set
        d.n[n].c.y = d.node.gv(d, n, 'y');
        d.n[n].c.z = d.node.gv(d, n, 'z');
        //d.node.sc(d, n, d.node.gv(d, n, 'x'));
        update(d, n);
    }),
    'line':n=>(d=>{
        //console.log('update line!!! '+n);
        update(d, n);
    }),
    'default':n=>(d=>{
        //console.log('update default!!! '+n);
        update(d, n);
    }),
};

// export function config(d,n){
//     if(update_funcs[d.n[n].t]){
//         d.n[n].update = update_funcs[d.n[n].t];
//     }else{
//         d.n[n].update = update_funcs['default'];
//     }
// }