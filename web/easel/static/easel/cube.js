import ReactDOM from 'https://esm.sh/react-dom'
import React, { useRef, useState } from 'https://esm.sh/react'
import { Canvas, useFrame, extend } from 'https://esm.sh/@react-three/fiber'
import htm from 'https://esm.sh/htm'

import { OrbitControls } from 'https://esm.sh/@react-three/drei';
extend({ OrbitControls }) 

export function make_cubes(){

    const html = htm.bind(React.createElement)

    function Box(props) {
    const mesh = useRef()
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    useFrame(() => (mesh.current.rotation.x = mesh.current.rotation.y += 0.01))
    return html` 
        <mesh
            ...${props}
            ref=${mesh}
            scale=${active ? 1.5 : 1}
            onClick=${() => setActive(!active)}
            onPointerOver=${() => setHover(true)}
            onPointerOut=${() => setHover(false)}>
            <boxGeometry args=${[1, 1, 1]} />
            <meshStandardMaterial color=${hovered ? 'hotpink' : 'orange'} />
        </mesh>`
    }

    ReactDOM.createRoot(document.getElementById('viewport_ui')).render(
    html`<${Canvas}>
            <orbitControls />
            <ambientLight />
            <pointLight position=${[10, 10, 10]} />
            <${Box} position=${[-1.2, 0, 0]} />
            <${Box} position=${[1.2, 0, 0]} />
        <//>`
    )

}
