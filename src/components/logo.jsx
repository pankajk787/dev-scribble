import React from 'react'
import DevScribbleLogoImg from '../assets/dev-scribble-logo.png';
const DevScribbleLogo = () => {
  return (
    <div className='logoWrapper'>
        <img src={DevScribbleLogoImg} alt='dev-scribble-logo' className='logoImage'/>
        <div className='logoTextWrapper'>
            <div className='logoText'>DevScribble</div>
            <div className='logoTagLine'>Realtime collaboration | Dev & Draw</div>
        </div>
    </div>
  )
}

export default DevScribbleLogo;
