import * as THREE from 'three';

const args = {stem:{x:44, y:11, z:99}};

import('/static/graph/work.js').then(work=>{
    console.log(work.compute(args));
});


class WorkerClass
{
    constructor()
    {
        console.log(new THREE.Vector3(0,1,2));
    }

    onMessage(event)
    {
        console.log('worker got message');
        console.log(event.data);
    }
}



let workerclass = new WorkerClass();
self.addEventListener("message", evt => workerclass.onMessage(evt));
self.postMessage("Module worker Loaded");

// onmessage = (e) => {
//     console.log("Message received from main script");
//     const workerResult = `Result: ${e.data[0] * e.data[1]}`;
//     console.log("Posting message back to main script");
//     postMessage(workerResult);
// };