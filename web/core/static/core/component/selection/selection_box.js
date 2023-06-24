// https://gist.github.com/NickAkhmetov/816c345fc9eaebac1e5dc7d076fda56b

import { useThree } from "@react-three/fiber"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useEvent } from "react-use"
import { Vector2 } from "three"
import { SelectionBox } from "./base.js"
import { useS } from '../../app.js';

const end_vector = new Vector2();
const min_delta = 10;

const getCoords = (clientX, clientY) => [
  (clientX / window.innerWidth) * 2 - 1,
  -(clientY / window.innerHeight) * 2 + 1
]

//const setSelectedStyle = (collection, selected) => {
  // for (const item of collection) {
  //   if (item.material) {
  //     // @ts-ignore
  //     item.material.linewidth = selected ? 3 : 1
  //   }
  // }
//}

export const Selection_Box = ({ style, onSelectionChanged }) => {
  const moving = useS(d=> d.design.moving);
  //const multi = useS(d=> d.pick.multi);

  const { camera, scene, gl } = useThree()
  const [start, setStart] = useState()
  const [mouse, setMouse] = useState()
  //const [delta, set_delta] = useState(0);
  const [isSelecting, setIsSelecting] = useState(false)
  const [isSelecting2, setIsSelecting2] = useState(false);
  const [selection, setSelection] = useState([])
  const selectRectangle = useRef(document.createElement("div"))

  useEffect(() => {
    onSelectionChanged?.call(null, selection)
  }, [selection, onSelectionChanged])

  useEffect(() => {
    selectRectangle.current.classList.add("selectBox")
    selectRectangle.current.classList.add("bg-primary");
    selectRectangle.current.classList.add("bg-opacity-10");
    selectRectangle.current.style.pointerEvents = "none"
    for (const key in style) {
      const val = style[key]
      selectRectangle.current.style.setProperty(
        key
          .replace(/([a-z])([A-Z])/g, "$1-$2")
          .replace(/[\s_]+/g, "-")
          .toLowerCase(),
        val
      )
    }
  }, [selectRectangle, style])

  useEffect(() => {
    //mouse_vector.set(mouse[0],mouse[1]);
    if (isSelecting && start && mouse && !moving && isSelecting2) { 
      gl.domElement.parentElement?.append(selectRectangle.current)

      const topLeft = {
        x: Math.min(start.x, mouse[0]),
        y: Math.min(start.y, mouse[1])
      }
      const bottomRight = {
        x: Math.max(start.x, mouse[0]),
        y: Math.max(start.y, mouse[1])
      }

      selectRectangle.current.style.left = `${topLeft.x}px`
      selectRectangle.current.style.top = `${topLeft.y}px`
      selectRectangle.current.style.width = `${bottomRight.x - topLeft.x}px`
      selectRectangle.current.style.height = `${bottomRight.y - topLeft.y}px`
    } else {
      selectRectangle.current.parentElement?.removeChild(
        selectRectangle.current
      )
    }
  }, [isSelecting, gl, start, mouse, selectRectangle, moving, isSelecting2])

  const selectionBox = useMemo(() => new SelectionBox(camera, scene), [
    scene,
    camera
  ])

  // const appendSelection = useCallback(
  //   toAppend => {
  //     setSelection([...selection, ...toAppend])
  //   },
  //   [selection]
  // )

  const onPointerDown = useCallback(
    e => {
      const event = e
      const { clientX, clientY, altKey, ctrlKey, button } = event
      if (!isSelecting && !button) { //if (!altKey && !isSelecting && !button) {
        const [startX, startY] = getCoords(clientX, clientY)
        setStart(new Vector2(clientX, clientY))
        setIsSelecting(true)
        //if (!ctrlKey) {
        //  setSelectedStyle(selection, false)
        //}
        selectionBox.startPoint.set(startX, startY, 0.5)
        selectionBox.endPoint.set(startX, startY, 0.5)
      }
    },
    [selection]
  )

  const onPointerMove = useCallback(
    e => {
      if (!isSelecting) return
      const { clientX, clientY } = e
      const [endX, endY] = getCoords(clientX, clientY)
      setMouse([clientX, clientY])
      //selectionBox.select()
      //setSelectedStyle(selectionBox.collection, false)

      selectionBox.endPoint.set(endX, endY, 0.5)
      //selectionBox.select()

      //setSelectedStyle(selectionBox.collection, true)
      end_vector.set(clientX, clientY);
      //set_delta(start.distanceTo(end_vector));
      setIsSelecting2((start.distanceTo(end_vector) > min_delta));
      //console.log(start, end_vector);
    },
    [isSelecting]
  )

  const onPointerUp = useCallback(
    e => {
      const {clientX, clientY, button} = e; // const { ctrlKey, clientX, clientY, button } = e

      if (isSelecting2 && !button) { // || !button
        //setIsSelecting(false)

        const [endX, endY] = getCoords(clientX, clientY)
        selectionBox.endPoint.set(endX, endY, 0.5)
        const curSelected = selectionBox.select()

        //if(!(start && start.distanceTo(mouse_vector.set(clientX,clientY))>10)){
        //if(!moving && delta > min_delta){
          //if(multi){//if (ctrlKey) {
          //  appendSelection(curSelected)
          //} else {
        if(!moving) setSelection(curSelected);
          //}
        //}

        setMouse(undefined)
        setStart(undefined)

        //setSelectedStyle(selectionBox.collection, true)
      }
      setIsSelecting(false);
      setIsSelecting2(false);
    },
    [isSelecting, isSelecting2, moving]
  )

  useEvent("pointerdown", onPointerDown, gl.domElement)
  useEvent("pointermove", onPointerMove, gl.domElement)
  useEvent("pointerup", onPointerUp, gl.domElement)

  return null
}
