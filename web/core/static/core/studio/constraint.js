import * as vtx from './vertex.js'; 

// constrain endpoint of line2 to line1 of endpoints are overlaping
export function Coincident(line1,line2){
    const constraint = {};
    const mount_dist = 0.5;
    const max_dist = 0.5;
    var correction = null; 
    var v1 = () => {return vtx.vect(line1.verts(),0);}
    var v2 = () => {return vtx.vect(line2.verts(),0);}
    var v1b = () => {return vtx.vect(line1.verts(),-1);}
    var v2b = () => {return vtx.vect(line2.verts(),-1);}

    constraint.enforce = function(args){
        if(correction != null){
            if(v1().distanceTo(v2()) > max_dist){
                args.depth--;
                line2.update({verts:correction(), depth:args.depth}); 
            }
        }
    };

    if(line1 != line2){
        if(v1().distanceTo(v2()) < mount_dist){
            correction=()=>{return vtx.map(line2.prev_verts(), v1(), vtx.vect(line2.prev_verts(),-1)); };
        }else if(v1().distanceTo(v2b()) < mount_dist){
            v2 = v2b;
            correction=()=>{return vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1()); };
        }else if(v1b().distanceTo(v2()) < mount_dist){
            v1 = v1b;
            correction=()=>{return vtx.map(line2.prev_verts(), v1(), vtx.vect(line2.prev_verts(),-1)) };
        }else if(v1b().distanceTo(v2b()) < mount_dist){
            v1 = v1b;
            v2 = v2b;
            correction=()=>{return vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1()); };
        }else if(vtx.closest(line1.verts(), v2()).dist < mount_dist){
            v1=()=>{return vtx.closest(line1.verts(), v2()).vert; }
            correction=()=>{return vtx.map(line2.prev_verts(), v1(), vtx.vect(line2.prev_verts(),-1)); };
            line2.add_constraint(constraint);
        }else if(vtx.closest(line1.verts(), v2b()).dist < mount_dist){
            v1=()=>{return vtx.closest(line1.verts(), v2b()).vert; }
            v2 = v2b;
            correction=()=>{return vtx.map(line2.prev_verts(), vtx.vect(line2.prev_verts(),0), v1()); };
            line2.add_constraint(constraint);
        }
        if(correction != null){
            line1.add_constraint(constraint);
        }
    }

    return null;
}
