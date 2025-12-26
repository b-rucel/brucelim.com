import Image from 'next/image'
import a_btn from './xbox.buttons/a.svg'
import b_btn from './xbox.buttons/b.svg'
import y_btn from './xbox.buttons/y.svg'
import x_btn from './xbox.buttons/x.svg'
import rt_btn from './xbox.buttons/rt.svg'
import lt_btn from './xbox.buttons/lt.svg'
import rb_btn from './xbox.buttons/rb.svg'
import lb_btn from './xbox.buttons/lb.svg'
import view_btn from './xbox.buttons/view.svg'
import menu_btn from './xbox.buttons/menu.svg'
import xbox_btn from './xbox.buttons/xbox.svg'

import ls from './xbox.buttons/ls.webp'
import rs from './xbox.buttons/rs.webp'


const XboxButtonLabels = {
  0: () => (
    <div className="flex items-center justify-center">
      <Image src={a_btn} alt="A" className="w-8 h-8" />
    </div>
  ),
  1: () => (
    <div className="flex items-center justify-center">
      <Image src={b_btn} alt="B" className="w-8 h-8" />
    </div>
  ),
  2: () => (
    <div className="flex items-center justify-center">
      <Image src={x_btn} alt="X" className="w-8 h-8" />
    </div>
  ),
  3: () => (
    <div className="flex items-center justify-center">
      <Image src={y_btn} alt="Y" className="w-8 h-8" />
    </div>
  ),
  4: () => (
    <div className="flex items-center justify-center">
      <Image src={lb_btn} alt="LB" className="w-12 h-12" />
    </div>
  ),
  5: () => (
    <div className="flex items-center justify-center">
      <Image src={rb_btn} alt="RB" className="w-12 h-12" />
    </div>
  ),
  6: () => (
    <div className="flex items-center justify-center">
      <Image src={lt_btn} alt="LT" className="w-8 h-8" />
    </div>
  ),
  7: () => (
    <div className="flex items-center justify-center">
      <Image src={rt_btn} alt="RT" className="w-8 h-8" />
    </div>
  ),
  8: () => (
    <div className="flex items-center justify-center">
      <Image src={view_btn} alt="View" className="w-8 h-8" />
    </div>
  ),
  9: () => (
    <div className="flex items-center justify-center">
      <Image src={menu_btn} alt="Menu" className="w-8 h-8" />
    </div>
  ),
  10: () => (
    <div className="flex items-center justify-center">
      <Image src={ls} alt="LS" className="w-12 h-12" />
    </div>
  ),
  11: () => (
    <div className="flex items-center justify-center">
      <Image src={rs} alt="RS" className="w-12 h-12" />
    </div>
  ),
  12: () => '⬆️',
  13: () => '⬇️',
  14: () => '⬅️',
  15: () => '➡️',
  16: () => (
    <div className="flex items-center justify-center">
      <Image src={xbox_btn} alt="A" className="w-8 h-8" />
    </div>
  )
}

const PlayStationButtonLabels = {
  0: () => 'x',
  1: () => '○',
  2: () => '□',
  3: () => '△',
  4: () => 'L1',
  5: () => 'R1',
  6: () => 'L2',
  7: () => 'R2',
  8: () => 'Share',
  9: () => 'Options',
  10: () => 'L3',
  11: () => 'R3',
  12: () => 'DPad Up',
  13: () => 'DPad Down',
  14: () => 'DPad Left',
  15: () => 'DPad Right',
  16: () => 'PS Button',
  17: () => 'Touch Pad'
}

export const getButtonLabel = (controllerType, index) => {
  if (controllerType === 'playstation') {
    return PlayStationButtonLabels[index]?.() || `Button ${index}`
  } else if (controllerType === 'xbox') {
    return XboxButtonLabels[index]?.() || `Button ${index}`
  }
  return `Button ${index}`
}
