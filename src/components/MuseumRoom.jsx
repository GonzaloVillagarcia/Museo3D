import React from 'react';
import RoomOne from './RoomOne';
import RoomTwo from './RoomTwo';
import RoomThree from './RoomThree';

export { VolumetricLightBeam, BidirectionalSconce, SingleCorridorLight, SymmetricalEndLighting } from './LightingHelpers';

export default function MuseumRoom({ title, subtitle, desc }) {
  return (
    <group>
      {/* Sala 1: Naciones (Z entre 4.0 y -14.0) */}
      <RoomOne />

      {/* Sala 2: Leyendas (Z entre -14.0 y -24.0) */}
      <RoomTwo />

      {/* Sala 3: Dioses (Z entre -24.0 y -34.0) */}
      <RoomThree title={title} subtitle={subtitle} desc={desc} />
    </group>
  );
}
