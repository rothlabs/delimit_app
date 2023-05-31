import { Vector3 } from "three";
import {current} from 'immer';

export const create_reckon_slice =(set,get)=>({reckon:{
    count: 0,
    node(d, n){ // might need to check for node existence or track original reckon call
        if(d.reckon[d.n[n].t]){                  d.reckon[d.n[n].t](d, n);   }
        else if(d.atom_tags.includes(d.n[n].t)){ d.reckon.atom(d, n);    }
        else{                                    d.reckon.default(d, n);     } // could delete this?
    },
    base(d, n){
        d.reckon.count++;
        //console.log('reckon base', n);
        //d.reckon.v(d, n, 'name'); 
        //console.log('try to reckon.node', n);
        //console.log(current(d).n[n].r);
        d.node.for_r(d, n, r=> {
            //console.log('reckon.node', n, r);
            d.next('reckon.node', r);
            //d.reckon.node(d,r);
        });
        d.next('design.update'); 
        d.next('inspect.update'); 
        //d.node.for_r(d, n, r=> d.reckon.node(d,r)); // got to watch out for cycle!!! (could pass update id and stop if updated already made with that id)
    },
    v(d, n, t, o){
        //d.reckon.count++;
        if(!o) o=0;
        if(d.n[n].n[t] && o < d.n[n].n[t].length && d.node.be(d,d.n[n].n[t][o])){ // d.n[n].n && 
            d.n[n].c[t] = d.n[d.n[n].n[t][o]].v;
        }else{
            d.n[n].c[t] = null;
        }
        //return null;
    },
    atom(d, n){
        //d.reckon.count++;
        //console.log('reckon atom');
        d.reckon.base(d, n);
        //d.next('reckon.node', n);
    },
    point(d,n){
        //d.reckon.count++;
        //console.log('reckon point');
        d.reckon.v(d, n, 'x');  // or don't even use these?!?!?!?!        make so you can provide list of tags in one call
        d.reckon.v(d, n, 'y'); 
        d.reckon.v(d, n, 'z'); 
        const pos = d.node.get(d, n, 'x y z'); // make get and reckon v same function so it reckons and returns values?!?!?!
        d.n[n].c.pos = new Vector3(pos.x, pos.y, pos.z);
        d.reckon.base(d, n); // d.next('reckon.base', n); //
    },
    line(d,n){
        //d.reckon.count++;
        //console.log('reckon line');
        //console.log('update line!!! '+n);
        d.n[n].c.points = [];
        d.n[n].n.point && d.n[n].n.point.forEach(p=>{
            if(d.node.be(d,p)){
                d.n[n].c.points.push({n:p, x:d.n[p].c.x, y:d.n[p].c.y, z:d.n[p].c.z, color:d.n[p].pick.color[0]});
            }
        }); 
        d.reckon.base(d, n);
    },
    default(d,n){
        //d.reckon.count++;
        d.reckon.v(d, n, 'name');
    },
}});



//if(!d.n[n].c.point) d.n[n].c.point = {pos:new Vector3()};
//d.n[n].c.point = {pos: d.n[n].c.point.pos.set(pos.x, pos.y, pos.z)};
        //d.n[n].c.point = {pos: new Vector3(pos.x, pos.y, pos.z)};
        //if(!d.n[n].c.vector3)d.n[n].c.vector3 = new Vector3();
        //d.n[n].c.vector3.set(d.n[n].c.x, d.n[n].c.y, d.n[n].c.z); // make sure each val is not undefined?