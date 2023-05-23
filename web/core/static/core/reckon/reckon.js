

function base_reckon(d, n){
    //console.log('update node!!! '+n);
    //d.n[d.profile].
    //if(d.n[n].n && d.n[n].n.name && d.node.be(d, d.n[n].n.name[0])) d.n[n].c.name = d.n[d.n[n].n.name[0]];
    d.node.reckon_v(d, n, 'name'); 
    d.node.for_r(d, n, r=> d.node.reckon(d,r)); // got to watch out for cycle!!! (could pass update id and stop if updated already made with that id)
}

export const reckoners = {
    point:(d,n)=>{
        //console.log('update point!!! '+n);
        //d.n[n].c.x = d.node.gv(d, n, 'x'); 
        //d.n[n].c.y = d.node.gv(d, n, 'y');
        //d.n[n].c.z = d.node.gv(d, n, 'z');
        d.node.reckon_v(d, n, 'x');  
        d.node.reckon_v(d, n, 'y'); 
        d.node.reckon_v(d, n, 'z'); 
        base_reckon(d, n);
    },
    line:(d,n)=>{
        //console.log('update line!!! '+n);
        d.n[n].c.points = [];
        d.n[n].n.point && d.n[n].n.point.forEach(p=>{
            if(d.node.be(d,p)) d.n[n].c.points.push([d.n[p].c.x, d.n[p].c.y, d.n[p].c.z]);
        }); 
        base_reckon(d, n);
    },
    default:(d,n)=>{
        //console.log('update default!!! '+n);
        base_reckon(d, n);
    },
};

// export function config(d,n){
//     if(update_funcs[d.n[n].t]){
//         d.n[n].update = update_funcs[d.n[n].t];
//     }else{
//         d.n[n].update = update_funcs['default'];
//     }
// }
