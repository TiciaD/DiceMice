import { PlayerHouse } from '@/models/player-house.model';
import React from 'react'

interface Option {
  label: string;
  value: string;
}

interface HouseInfoProps {
  house: PlayerHouse | null
}

const HouseInfo = () => {
  return (
    <div>
      <h4>House Info</h4>
    </div>
  )
}

export default HouseInfo