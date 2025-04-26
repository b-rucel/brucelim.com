'use client'
import { useState, useEffect } from "react"
import Image from "next/image"
import controller from './gamepad.svg'
import './styles.css'
import { getButtonLabel } from './buttonLabels'

import ls from './xbox.buttons/ls.webp'
import rs from './xbox.buttons/rs.webp'


export default function Gamepad() {
  const [gamepad, setGamepad] = useState(null)
  const [controllerType, setControllerType] = useState(null)
  const [buttonStates, setButtonStates] = useState([])
  const [analogSticks, setAnalogSticks] = useState({
    leftStick: { x: 0, y: 0 },
    rightStick: { x: 0, y: 0 }
  })

  function handleGamepadConnected(e) {
    setGamepad(e.gamepad)
    setButtonStates(new Array(e.gamepad.buttons.length).fill(false))

    const id = e.gamepad.id.toLowerCase()
    if (id.includes('playstation') || id.includes('ps')) {
      setControllerType('playstation')
    } else if (id.includes('xbox') || id.includes('microsoft')) {
      setControllerType('xbox')
    }
  }

  function handleGamepadDisconnected(e) {
    setGamepad(null)
    setControllerType(null)
    setButtonStates([])
  }

  // deadzone to prevent drift
  const DEADZONE = 0.1; // 0 and 1 to change deadzone size
  const applyDeadzone = (value) => {
    if (Math.abs(value) < DEADZONE) {
      return 0;
    }

    // normalize the values outside of the deadzone
    return value >= 0
      ? (value - DEADZONE) / (1 - DEADZONE)
      : (value + DEADZONE) / (1 - DEADZONE);
  }


  useEffect(() => {
    window.addEventListener('gamepadconnected', handleGamepadConnected)
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected)

    const pollGamepad = () => {
      if (gamepad) {
        const gamepads = navigator.getGamepads()
        const currentGamepad = gamepads[gamepad.index]

        if (currentGamepad) {
          // Update button states
          setButtonStates(currentGamepad.buttons.map(button => button.pressed))

          // Update analog sticks with deadzone
          setAnalogSticks({
            leftStick: {
              x: Math.round(applyDeadzone(currentGamepad.axes[0]) * 100) / 100,
              y: Math.round(applyDeadzone(currentGamepad.axes[1]) * 100) / 100
            },
            rightStick: {
              x: Math.round(applyDeadzone(currentGamepad.axes[2]) * 100) / 100,
              y: Math.round(applyDeadzone(currentGamepad.axes[3]) * 100) / 100
            }
          })
        }
      }
    }

    const pollInterval = setInterval(pollGamepad, 50) // every 50ms

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected)
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected)
      clearInterval(pollInterval)
    }
  }, [gamepad])

  const renderButton = (pressed, index) => (
    <div
      key={index}
      className={`p-4 rounded-lg border transition-colors duration-100 ${
        pressed ? 'bg-[#caf0f8] text-primary-foreground shadow-lg scale-95'
               : 'bg-background hover:bg-muted/5'
      }`}
    >
      <div className="text-center">
        <div className="text-xl font-bold">
          {getButtonLabel(controllerType, index)}
        </div>
        <div className="text-xs mt-1 text-muted-foreground hidden">
          {pressed ? 'Pressed' : 'Released'}
        </div>
      </div>
    </div>
  )

  const renderAnalogStick = (name, values) => {
    // convert from -1,1 range to 0,100 range and center at 50%
    const stickPosition = {
      left: `${50 + (values.x * 50)}%`,
      top: `${50 + (values.y * 50)}%`
    }

    return (
      <div className="w-full max-w-[14rem] aspect-square relative rounded-full border-2 border-[#caf0f8] mb-4">
      {/* Add center point marker */}
      <div
        className="w-1 h-1 absolute bg-gray-400 rounded-full"
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
      />
      {/* Stick indicator */}
      <div
        className="w-20 h-20 absolute rounded-full shadow-lg transition-all duration-75"
        style={{
          left: stickPosition.left,
          top: stickPosition.top,
          transform: 'translate(-50%, -50%)'
        }}
      >
      <Image
        src={name === 'Left Stick' ? ls : rs}
        alt={name}
        className="object-cover"
      />
      </div>
      <div className="absolute -bottom-8 w-full text-center text-sm text-gray-200">
        (x: {values.x}, y: {values.y})
      </div>
      </div>
    )
  }

  return (
    <div className="lg:block space-y-4">
      {!gamepad ? (
        /* unconnected */
        <div className="p-4 text-center border rounded-lg bg-muted/5">
          <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-[#caf0f8] rounded-lg dark:bg-gray-700">
            <Image
              src={controller}
              alt="Game Controller"
              width={144}
              height={144}
              className="mx-auto animate-pulse relative transform translate-y-0 drop-shadow-[0_20px_20px_rgba(0,0,0,0.45)]"
            />
            <h2 className="text-2xl font-semibold text-foreground">No Controller Connected</h2>
            <p className="text-muted-foreground max-w-sm">
              Connect your gamepad and press any button to start testing. Supports PlayStation and Xbox controllers.
            </p>
            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Turn on controller</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
                <span>Press any button</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* connected */
        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-gradient-to-br from-muted/5 to-muted/10 border border-primary/10 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-primary/5">
            <div className="flex items-center justify-between flex-col md:flex-row">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-foreground !m-0">Connected Controller</h2>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{gamepad.id}</p>
              </div>
              <div className="my-8 relative px-4 py-2 rounded bg-primary/10 text-primary border border-primary/20 font-medium shadow-sm transition-transform duration-200 hover:scale-105 animate-slow-pulse">
                <span className="absolute top-[-7px] right-[-13px] flex h-3 w-3 mr-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-sky-500"></span>
                </span>
                {controllerType === 'playstation' ? (
                  <span className="flex items-center gap-2">
                    <span className="text-sky-400">PlayStation</span>
                    <span className="text-xs opacity-50">●</span>
                    <span className="text-xs uppercase tracking-wider opacity-75">Connected</span>
                  </span>
                ) : controllerType === 'xbox' ? (
                  <span className="flex items-center gap-2">
                    <span className="text-sky-400">Xbox</span>
                    <span className="text-xs opacity-50">●</span>
                    <span className="text-xs uppercase tracking-wider opacity-75">Connected</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Generic</span>
                    <span className="text-xs opacity-50">●</span>
                    <span className="text-xs uppercase tracking-wider opacity-75">Connected</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {buttonStates.length > 0 && (
            <div className="p-6 rounded-lg bg-muted/5 border">
              <h3 className="text-lg font-medium mb-4">Button States</h3>
              <div className="grid grid-cols-4 gap-4">
                {buttonStates.map((pressed, index) => renderButton(pressed, index))}
              </div>
            </div>
          )}

          <div className="p-6 rounded-lg bg-muted/5 border">
            <h3 className="text-lg font-medium mb-4">Analog Sticks</h3>

            <div className="flex justify-between gap-4 md:gap-8">
              {renderAnalogStick('Left Stick', analogSticks.leftStick)}
              {renderAnalogStick('Right Stick', analogSticks.rightStick)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
