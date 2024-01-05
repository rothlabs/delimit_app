import * as React from "react"
import { useThree } from "@react-three/fiber"
import { CanvasTexture } from "three"
//import { useGizmoContext } from "@react-three/drei/GizmoHelper"
import {get_store, set_store} from 'delimit';

function Axis({ scale = [0.8, 0.05, 0.05], color, rotation }) {
  return (
    React.createElement(
        "group",
        { rotation: rotation },
        React.createElement(
          "mesh",
          { position: [0.4, 0, 0] },
          React.createElement("boxGeometry", { args: scale }),
          React.createElement("meshBasicMaterial", { color: color, toneMapped: false })
        )
    )
  )
}

function AxisHead({
  onClick,
  font,
  disabled,
  arcStyle,
  label,
  labelColor,
  axisHeadScale = 1,
  ...props
}) {
  const gl = useThree(state => state.gl)
  const texture = React.useMemo(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 64
    canvas.height = 64

    const context = canvas.getContext("2d")
    context.beginPath()
    context.arc(32, 32, 16, 0, 2 * Math.PI)
    context.closePath()
    context.fillStyle = arcStyle
    context.fill()

    if (label) {
      context.font = font
      context.textAlign = "center"
      context.fillStyle = labelColor
      context.fillText(label, 32, 41)
    }
    return new CanvasTexture(canvas)
  }, [arcStyle, label, labelColor, font])

  const [active, setActive] = React.useState(false)
  const scale = (label ? 1 : 0.75) * (active ? 1.2 : 1) * axisHeadScale
  const handlePointerOver = e => {
    e.stopPropagation()
    setActive(true)
  }
  const handlePointerOut = e => {
    e.stopPropagation()
    setActive(false)
  }
  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
  return (
    React.createElement(
        "sprite",
        _extends({
            scale: scale,
            onPointerOver: !disabled ? handlePointerOver : undefined,
            onPointerOut: !disabled ? onClick || handlePointerOut : undefined
        }, props),
        React.createElement("spriteMaterial", {
            map: texture,
            "map-anisotropy": gl.capabilities.getMaxAnisotropy() || 1,
            alphaTest: 0.3,
            opacity: label ? 1 : 0.75,
            toneMapped: false
        })
    )
  )
}

export const GizmoViewport = ({
  hideNegativeAxes,
  hideAxisHeads,
  disabled,
  font = "24px Inter var, Arial, sans-serif",
  axisColors = ["#ff2060", "#20df80", "#2080ff"],
  axisHeadScale = 1,
  axisScale,
  labels = ["X", "Y", "Z"],
  labelColor = "#000",
  onClick,
  ...props
}) => {
  const [colorX, colorY, colorZ] = axisColors
  //const { tweenCamera } = useGizmoContext()
  const axisHeadProps = {
    font,
    disabled,
    labelColor,
    onClick,
    axisHeadScale,
    onPointerDown: !disabled 
      ? e => {
            e.stopPropagation();
            set_store(d=>{
                if(e.object.position.x==1)  d.camera_controls.rotateTo(Math.PI/2, Math.PI/2);
                if(e.object.position.x==-1) d.camera_controls.rotateTo(-Math.PI/2, Math.PI/2);
                if(e.object.position.y==1)  d.camera_controls.rotateTo(0, 0);
                if(e.object.position.y==-1) d.camera_controls.rotateTo(0, Math.PI);
                if(e.object.position.z==1)  d.camera_controls.rotateTo(0, Math.PI/2);
                if(e.object.position.z==-1) d.camera_controls.rotateTo(Math.PI, Math.PI/2);
                d.n[d.design.part].c_c = {
                    ...d.n[d.design.part].c_c,
                    azimuth: d.camera_controls.azimuthAngle,
                    polar: d.camera_controls.polarAngle,
                    //pos: d.camera_controls.getTarget(),
                    //zoom: camera.zoom,
                };
                d.studio.gizmo_active = true;
            });
            //tweenCamera(e.object.position)
        }
      : undefined
  }
  var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
  return (
    React.createElement(
        "group",
        _extends({ scale: 40 }, props),
        React.createElement(Axis, { color: colorX, rotation: [0, 0, 0], scale: axisScale }),
        React.createElement(Axis, { color: colorY, rotation: [0, 0, Math.PI / 2], scale: axisScale }),
        React.createElement(Axis, { color: colorZ, rotation: [0, -Math.PI / 2, 0], scale: axisScale }),
        React.createElement(AxisHead, _extends({
          arcStyle: colorX,
          position: [1, 0, 0],
          label: labels[0]
        }, axisHeadProps)),
        React.createElement(AxisHead, _extends({
          arcStyle: colorY,
          position: [0, 1, 0],
          label: labels[1]
        }, axisHeadProps)),
        React.createElement(AxisHead, _extends({
          arcStyle: colorZ,
          position: [0, 0, 1],
          label: labels[2]
        }, axisHeadProps)),
        React.createElement(AxisHead, _extends({
          arcStyle: colorX,
          position: [-1, 0, 0]
        }, axisHeadProps)),
        React.createElement(AxisHead, _extends({
          arcStyle: colorY,
          position: [0, -1, 0]
        }, axisHeadProps)),
        React.createElement(AxisHead, _extends({
          arcStyle: colorZ,
          position: [0, 0, -1]
        }, axisHeadProps))
      )
  )
}
