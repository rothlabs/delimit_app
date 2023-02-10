import * as vtx from 'easel/vertex.js'; 

// constrain endpoint of line2 to line1 of endpoints are overlaping
export function Coincident(line1, line2){
    const constraint = {};
    const mount_dist = 2;
    const max_dist = 0.5;
    var v1 = () => {return vtx.vect(line1.verts,0);}
    var v2 = () => {return vtx.vect(line2.verts,0);}
    var v1b = () => {return vtx.vect(line1.verts,-1);}
    var v2b = () => {return vtx.vect(line2.verts,-1);}

    constraint.enforce = function(depth_count){
        if(correct != null){
            if(v1().distanceTo(v2()) > max_dist){
                correct();
                depth_count--;
                line2.update({rules: true, constrain:depth_count});
            }
        }
    };

    var correct = null;
    if(line1 != line2){
        if(v1().distanceTo(v2()) < mount_dist){
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), v1(), vtx.vect(line2.last_record(),-1)); };
        }else if(v1().distanceTo(v2b()) < mount_dist){
            v2 = v2b;
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), vtx.vect(line2.last_record(),0), v1()); };
        }else if(v1b().distanceTo(v2()) < mount_dist){
            v1 = v1b;
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), v1(), vtx.vect(line2.last_record(),-1)) };
        }else if(v1b().distanceTo(v2b()) < mount_dist){
            v1 = v1b;
            v2 = v2b;
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), vtx.vect(line2.last_record(),0), v1()); };
        }else if(vtx.closest(line1.verts, v2()).dist < mount_dist){
            v1=()=>{ return vtx.closest(line1.verts, v2()).vert; }
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), v1(), vtx.vect(line2.last_record(),-1)); };
            line2.add_constraint(constraint);
        }else if(vtx.closest(line1.verts, v2b()).dist < mount_dist){
            v1=()=>{ return vtx.closest(line1.verts, v2b()).vert; }
            v2 = v2b;
            correct=()=>{ line2.verts = vtx.map(line2.last_record(), vtx.vect(line2.last_record(),0), v1()); };
            line2.add_constraint(constraint);
        }
        if(correct != null){
            line1.add_constraint(constraint);
        }
    }

    return constraint;
}

// export function Vert_to_Line(line1, line2){
//     constraint = {};
//     constraint.enforce = function(){
        
//     }
//     return constraint;
// }