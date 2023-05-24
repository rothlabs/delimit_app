

function base_reckon(d, n){
    d.node.reckon_v(d, n, 'name'); 
    d.node.for_r(d, n, r=> d.node.reckon(d,r)); // got to watch out for cycle!!! (could pass update id and stop if updated already made with that id)
}

export const reckoners = {
    point:(d,n)=>{
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