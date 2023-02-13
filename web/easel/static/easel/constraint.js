import * as vtx from 'easel/vertex.js'; 

// constrain endpoint of p.line2 to p.line1 of endpoints are overlaping
export function Coincident(p){
    const constraint = {};
    const mount_dist = 2;
    const max_dist = 0.5;
    var v1 = () => {return vtx.vect(p.line1.verts,0);}
    var v2 = () => {return vtx.vect(p.line2.verts,0);}
    var v1b = () => {return vtx.vect(p.line1.verts,-1);}
    var v2b = () => {return vtx.vect(p.line2.verts,-1);}

    constraint.enforce = function(depth){
        if(correct != null){
            if(v1().distanceTo(v2()) > max_dist){
                correct();
                depth--;
                p.line2.update({density:true, depth:depth}); 
            }
        }
    };

    var correct = null;
    if(p.line1 != p.line2){
        if(v1().distanceTo(v2()) < mount_dist){
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), v1(), vtx.vect(p.line2.last_record(),-1)); };
        }else if(v1().distanceTo(v2b()) < mount_dist){
            v2 = v2b;
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), vtx.vect(p.line2.last_record(),0), v1()); };
        }else if(v1b().distanceTo(v2()) < mount_dist){
            v1 = v1b;
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), v1(), vtx.vect(p.line2.last_record(),-1)) };
        }else if(v1b().distanceTo(v2b()) < mount_dist){
            v1 = v1b;
            v2 = v2b;
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), vtx.vect(p.line2.last_record(),0), v1()); };
        }else if(vtx.closest(p.line1.verts, v2()).dist < mount_dist){
            v1=()=>{ return vtx.closest(p.line1.verts, v2()).vert; }
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), v1(), vtx.vect(p.line2.last_record(),-1)); };
            p.line2.set_constraints(constraint);
        }else if(vtx.closest(p.line1.verts, v2b()).dist < mount_dist){
            v1=()=>{ return vtx.closest(p.line1.verts, v2b()).vert; }
            v2 = v2b;
            correct=()=>{ p.line2.verts = vtx.map(p.line2.last_record(), vtx.vect(p.line2.last_record(),0), v1()); };
            p.line2.set_constraints(constraint);
        }
        if(correct != null){
            p.line1.set_constraints(constraint);
        }
    }

    return null;
}

// export function Vert_to_Line(p.line1, p.line2){
//     constraint = {};
//     constraint.enforce = function(){
        
//     }
//     return constraint;
// }