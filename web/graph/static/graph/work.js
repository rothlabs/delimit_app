import {Vector3} from 'three';

// Inserted into the schema graph:
export const schema = {
    node: 'vector', // compute-node class
    icon: 'circle_dot', // name of icon defined in metadata of schema 
    stem:{
        x: {node:'decimal', default:0}, // omit default to prevent auto-creation of stem node 
        y: {node:'decimal', default:0}, // add type:'list' or type:'set' for ordered or non-ordered multiplicity  
        z: {node:'decimal', default:0},
    }
}

// Called by compute sandbox
// available args: {app, id, stem, patch}
// 'app' is the current global state object within the compute sandbox
// 'id' is the id of this node instance (useful in combination with app)
// 'stem' convenience stem values (can also find values with: app.node[id].stem.my_schema_name )
// 'patch' is a JSON Patch for the stems. Useful for performaing only the necessary computations 
export function compute({stem}){ 

    // part that will be available as stem.my_schema_name within other compute-nodes
    const inner = new Vector3( 
        stem.x ?? 0, 
        stem.y ?? 0, 
        stem.z ?? 0,
    );

    // serializable list sent to the host application (host app knows to display a point at x y z in this example)
    const outer = [
        {node: 'point', // host-node class, NOT RELATED to compute-nodes defined by user
            x: inner.x, 
            y: inner.y, 
            z: inner.z,
        },
    ];

    return {inner, outer}; 
}