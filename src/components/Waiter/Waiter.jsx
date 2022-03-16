import React from 'react'
import { CircularProgress } from '@material-ui/core';
import './Waiter.css'
const Waiter = (props) => {
  return (
    <div className={`${!props.show ? 'hide-loader' : ''} ${props.isTotalOpacity && 'totalOpacity'}`}>
        <CircularProgress/>
        Cargando
    </div>
  )
}

export default Waiter