export const create_reckon_slice =(set,get)=>({reckon:{
    node:(d, n)=>{ // might need to check for node existence or track original reckon call
        if(d.reckon[d.n[n].t]){   d.reckon[d.n[n].t](d, n);   }
        else{                     d.reckon.base(d, n);     } // could delete this?
    },
    base(d, n){
        d.reckon.v(d, n, 'name'); 
        d.node.for_r(d, n, r=> d.next('reckon.node', r));
        //d.node.for_r(d, n, r=> d.reckon.node(d,r)); // d.next('reckon.node', r) instead?,  got to watch out for cycle!!! (could pass update id and stop if updated already made with that id)
    },
    v:(d, n, t, o)=>{
        if(!o) o=0;
        if(d.n[n].n && d.n[n].n[t] && o < d.n[n].n[t].length && d.node.be(d,d.n[n].n[t][o])){
            d.n[n].c[t] = d.n[d.n[n].n[t][o]].v;
        }else{
            d.n[n].c[t] = null;
        }
        //return null;
    },
    point:(d,n)=>{
        d.reckon.v(d, n, 'x');  
        d.reckon.v(d, n, 'y'); 
        d.reckon.v(d, n, 'z'); 
        d.reckon.base(d, n); // d.next('reckon.base', n); //
    },
    line:(d,n)=>{
        //console.log('update line!!! '+n);
        d.n[n].c.points = [];
        d.n[n].n.point && d.n[n].n.point.forEach(p=>{
            if(d.node.be(d,p)){
                d.n[n].c.points.push({n:p, x:d.n[p].c.x, y:d.n[p].c.y, z:d.n[p].c.z, color:d.n[p].pick.color[0]});
            }
        }); 
        d.reckon.base(d, n);
    },
    // default:(d,n)=>{
    //     //console.log('update default!!! '+n);
    //     d.reckon.base(d, n);
    // },
}});