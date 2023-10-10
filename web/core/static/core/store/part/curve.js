import {Vector3, Matrix4} from 'three';

const points = (curve, pnt, m1) => (cnt) => pnt.z == null ? 
    curve.getPoints(cnt).map(pnt=> new Vector3(pnt.x, pnt.y, 0).applyMatrix4(m1)) :
    curve.getPoints(cnt).map(pnt=> pnt.applyMatrix4(m1));

const spaced_points = (curve, pnt, m1) => (cnt) => pnt.z == null ? 
    curve.getSpacedPoints(cnt).map(pnt=> new Vector3(pnt.x, pnt.y, 0).applyMatrix4(m1)) :
    curve.getSpacedPoints(cnt).map(pnt=> pnt.applyMatrix4(m1));

export const curve = (d, curve, matrix)=>{
    const m1 = matrix ?? new Matrix4();
    const pnt = curve.getPoints(3)[0]; 
    return{
        design:       'curve',
        points:        points(curve, pnt, m1),
        spaced_points: spaced_points(curve, pnt, m1),
        length:        ()=> curve.getLength(), // need to adjust based on transform!?!?!? #1
        transform:     (d, m2) => d.part.curve(d, curve, m1.clone().multiply(m2)),    
    }
}

        //transform:     (d, curve, m2) => d.part.curve(d, curve.curve, curve.matrix.multiply(m2)),    
        //curve:  curve,
        //matrix: m1,

// points: pnt.z == null ? 
//             (cnt)=> curve.getPoints(cnt).map(pnt=> new Vector3(pnt.x, pnt.y, 0).applyMatrix4(m1)) :
//             (cnt)=> curve.getPoints(cnt).map(pnt=> pnt.applyMatrix4(m1)),