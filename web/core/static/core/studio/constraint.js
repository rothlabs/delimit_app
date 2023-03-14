import * as vtx from './vertex.js'; 
import {Vector3} from 'three'; 

//const clip = 12;

// if any line changes, update line3 so its endpoints fall on line1 and line2
export function Endpoints_To_Lines(line1, line2, line3){
    const constraint = {};
    const max_dist = 0.5;
    var v3a=()=> line3.vect(0);
    var v3b=()=> line3.vect(-1);
    var v1=()=> vtx.closest(line1.verts(), v3a()).vert; 
    var v2=()=> vtx.closest(line2.verts(), v3b()).vert; 
    var correction=()=> vtx.map(line3.prev_verts(), v1(), v2()); 
    constraint.enforce = function(){
        if(v1().distanceTo(v3a()) > max_dist || v2().distanceTo(v3b()) > max_dist){
            line3.update({verts:correction()}); 
        }
    };
    line1.add_constraint(constraint);
    line2.add_constraint(constraint);
    line3.add_constraint(constraint);
    //ids.push('Endpoints_To_Lines___'+line1.name()+'___'+line2.name()+'___'+line3.name());
}

// if line1 changes, update line2 so its sepcified endpoint is coincident
export function Coincident(line1, i1, line2, i2){
    //const id = 'Coincident___'+line1.name()+'___'+i1+'___'+line2.name()+'___'+i2;
    //ids.push(id);
    const constraint = {};
    const max_dist = 0.5;
    var correction = null; 
    var v1=()=> line1.vect(i1);
    var v2=()=> line2.vect(i2);
    if(i2== 0) correction=()=> vtx.map(line2.prev_verts(), v1(), line2.prev_vect(-1)); 
    if(i2==-1) correction=()=> vtx.map(line2.prev_verts(), line2.prev_vect(0),  v1()); 
    constraint.enforce = function(){
        if(v1().distanceTo(v2()) > max_dist){
            line2.update({verts:correction()}); 
        }
    };
    line1.add_constraint(constraint);
}

// make both endpoints coincident (0 to 0, -1 to -1 indecies)
export function Coincident_Endpoints(line1, line2){
    const constraint = {};
    const max_dist = 0.5;
    var correction = null; 
    var v1a=()=> line1.vect(0);
    var v1b=()=> line1.vect(-1);
    var v2a=()=> line2.vect(0);
    var v2b=()=> line2.vect(-1);
    correction=()=> vtx.map(line2.prev_verts(), v1a(), v1b()); 
    constraint.enforce = function(){
        if(v1a().distanceTo(v2a()) > max_dist || v1b().distanceTo(v2b()) > max_dist){
            line2.update({verts:correction()}); 
        }
    };
    line1.add_constraint(constraint);
    //ids.push('Coincident_Endpoints___'+line1.name()+'___'+line2.name());
}

// if any line changes, update line3 so its endpoints are vertical with line1 and line2
export function Vertical_Alignment(line1, i1, line2, i2, line3, triggers){
    //const id = 'Vertical_Alignment___'+line1.name()+'___'+i1+'___'+line2.name()+'___'+i2+'___'+line3.name();
    //ids.push(id);
    const constraint = {};
    const max_dist = 0.5;
    var correction = null; 
    var v3a=()=> line3.vect(0);
    var v3b=()=> line3.vect(-1);
    var v1=()=> new Vector3(line1.vect(i1).x, v3a().y, v3a().z);
    var v2=()=> new Vector3(line2.vect(i2).x, v3b().y, v3b().z);
    var correction=()=> vtx.map(line3.prev_verts(), v1(), v2()); 
    constraint.enforce = function(){
        if(correction != null){
            if(Math.abs(v1().x-v3a().x) > max_dist || Math.abs(v2().x-v3b().x) > max_dist){
                line3.update({verts:correction()}); 
                
            }
        }
    };
    line1.add_constraint(constraint);
    line2.add_constraint(constraint);
    line3.add_constraint(constraint);
    triggers.forEach(n => n.add_constraint(constraint));
}




// constrain endpoint of line2 to line1 of endpoints are overlaping
// export function Coincident(line1,line2, ids){
//     if(line1 != line2){
//         const constraint = {};
//         const mount_dist = 0.5;
//         const max_dist = 0.5;
//         var correction = null; 
//         var v1a=()=>  vtx.vect(line1.verts(),0);
//         var v1b=()=> vtx.vect(line1.verts(),-1);
//         var v2a=()=>  vtx.vect(line2.verts(),0);
//         var v2b=()=> vtx.vect(line2.verts(),-1);

//         constraint.enforce = function(args){
//             if(correction != null){
//                 if(v1a().distanceTo(v2a()) > max_dist){
//                     args.depth--;
//                     line2.update({verts:correction(), depth:args.depth}); 
//                 }
//             }
//         };
    
//         const l1vts = line1.verts();
//         var id = 'coincident__'+line1.name()+'__'+line2.name()+'__';
//         if(v1a().distanceTo(v2a()) < mount_dist && !ids.includes(id+'a_a')){
//             correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1));
//             id += 'a_a';
//         }else if(v1a().distanceTo(v2b()) < mount_dist && !ids.includes(id+'a_b')){
//             v2a = v2b;
//             correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a());
//             id += 'a_b';
//         }else if(v1b().distanceTo(v2a()) < mount_dist && !ids.includes(id+'b_a')){
//             v1a = v1b;
//             correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1));
//             id += 'b_a';
//         }else if(v1b().distanceTo(v2b()) < mount_dist && !ids.includes(id+'b_b')){
//             v1a = v1b;
//             v2a = v2b;
//             correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a());
//             id += 'b_b';
//         }else if(vtx.closest(l1vts.slice(clip,l1vts.length-clip), v2a()).dist < mount_dist){    // should make seperate constraint that takes 3 lines as input
//             v1a=()=> vtx.closest(line1.verts().slice(clip,line1.verts().length-clip), v2a()).vert; 
//             correction=()=> vtx.map(line2.prev_verts(), v1a(), vtx.vect(line2.prev_verts(),-1)); 
//             line2.add_constraint(constraint);
//         }else if(vtx.closest(l1vts.slice(clip,l1vts.length-clip), v2b()).dist < mount_dist){ // so it is mapped from front to back in one call
//             v1a=()=> vtx.closest(line1.verts().slice(clip,line1.verts().length-clip), v2b()).vert; 
//             v2a = v2b;
//             correction=()=> vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1a()); 
//             line2.add_constraint(constraint);
//         }
//         if(correction != null){
//             line1.add_constraint(constraint);
//             ids.push(id);
//         }

//     }
// }