import React from 'react';
import { useLootStore } from '../../stores/lootStore';
import LootItem from './LootItem';

const LootManager = () => {
  const droppedItems = useLootStore((state) => state.droppedItems);

  return (
    <>
      {droppedItems.map((loot) => (
        <LootItem 
          key={loot.id}
          id={loot.id}
          position={loot.position}
          type={loot.gold ? 'gold' : 'item'}
          item={loot.item}
          goldValue={loot.gold}
        />
      ))}
    </>
  );
};

export default LootManager;
