import React, { useState, useRef, useEffect } from 'react';
import { CharacterRenderer, RigidBodyObject } from 'vibe-starter-3d';
import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../stores/gameStore';
import { useLocalPlayerStore } from '../../stores/localPlayerStore';
import { useInventoryStore } from '../../stores/inventoryStore';
import Assets from '../../assets.json';
import { BlobShadow } from '../effects/BlobShadow';

interface NPCProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  name: string;
  dialogue: string;
  modelUrl?: string;
  scale?: number;
  onInteract?: () => void;
}

const NPC = ({ position, rotation = [0, 0, 0], name, dialogue, modelUrl, scale = 1, onInteract }: NPCProps) => {
  const { openDialogue, closeDialogue, dialogue: dialogueState } = useGameStore();
  const [isPlayerNearby, setIsPlayerNearby] = useState(false);
  
  // Use a ref for animation state to prevent re-creation on every render
  const animationState = useRef<string | undefined>('idle');
  const npcPosition = new THREE.Vector3(...position);

  // Check distance to player every frame
  useFrame(() => {
    const playerPos = useLocalPlayerStore.getState().state.position;
    const distance = npcPosition.distanceTo(playerPos);
    
    // Threshold for interaction (2.5 meters)
    const isNear = distance < 2.5;
    if (isNear !== isPlayerNearby) {
      setIsPlayerNearby(isNear);
    }
  });

  // Handle interaction input
  useEffect(() => {
    if (!isPlayerNearby) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Spacebar
      if (e.code === 'Space') {
        // Prevent opening if already open
        if (useGameStore.getState().dialogue.isOpen) return;

        if (onInteract) {
          onInteract();
          return;
        }

        // Use the Crocy portrait if available, otherwise fallback
        const portraitUrl = Assets.characters['crocy_eth_character_concept_sheet_for_a_generic_rpg_novice_ad_9e579b2b-d131-4d71-a933-8f8e6eeb3c8b_0-removebg-preview_1766365510787_1']?.url || modelUrl;
        const quest = useGameStore.getState().quest;

        // 1. Check Quest Completion
        if (quest.isActive && quest.progress >= quest.target) {
           openDialogue(
             name,
             "Incredible! You saved us. Here is the Legendary Gold Sword as promised!",
             portraitUrl,
             [
               {
                 label: 'Claim Reward',
                 onClick: () => {
                   closeDialogue();
                   
                   // 1. Add Item to Inventory
                   useInventoryStore.getState().addItem({
                     id: 'gold_sword',
                     name: 'Gold Sword',
                     type: 'weapon',
                     iconUrl: Assets.ui.icon_sword.url,
                     stats: { damage: 50 },
                     description: 'A legendary blade given by the Village Elder.'
                   });

                   // 2. Visual & Game State Updates
                   useGameStore.getState().setVictory(true);
                   useGameStore.getState().setGoldenWeapon(true);
                   
                   // 3. Notification
                   useGameStore.getState().showNotification('Quest Complete! You received [Gold Sword].');
                 }
               }
             ]
           );
           return;
        }

        // 2. Check Quest In Progress
        if (quest.isActive && quest.progress < quest.target) {
            openDialogue(
                name,
                `Please hurry! We still need you to defeat ${quest.target - quest.progress} more Slimes!`,
                portraitUrl,
                [{ label: 'I will!', onClick: closeDialogue }]
            );
            return;
        }

        // 3. Offer Quest (Default)
        openDialogue(
          name,
          "Traveler! Slimes are destroying our village. If you defeat 5 Slimes, I will reward you with a rare [NFT Weapon]! Will you help?",
          portraitUrl,
          [
            { 
              label: 'Accept Quest', 
              onClick: () => { 
                closeDialogue();
                useGameStore.getState().startQuest();
                useGameStore.getState().showNotification("Quest Accepted: Hunt Slimes!");
              } 
            },
            { 
              label: 'Decline', 
              onClick: () => { 
                closeDialogue();
                setTimeout(() => {
                  openDialogue(name, "The offer stands if you change your mind.", portraitUrl);
                }, 100);
              } 
            }
          ]
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerNearby, name, dialogue, modelUrl, openDialogue, closeDialogue]);

  return (
    <group>
      {/* Name Tag */}
      <Billboard position={[position[0], position[1] + 2.2, position[2]]}>
        <Text
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="black"
        >
          {name}
        </Text>
        
        {/* Interaction Hint */}
        {isPlayerNearby && !dialogueState.isOpen && (
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.2}
            color="#ffff00"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="black"
          >
            Press SPACE to Talk
          </Text>
        )}
      </Billboard>

      <RigidBodyObject
        position={position}
        rotation={rotation}
        colliders={false}
        type="fixed"
        userData={{ type: 'npc', name }}
      >
        <CapsuleCollider args={[0.5 * scale, 0.3 * scale]} position={[0, 0.8 * scale, 0]} />

        <CharacterRenderer
            url={modelUrl || Assets.characters['base-model'].url}
            targetHeight={1.6 * scale}
            // Use idle animation
            animationConfigMap={{
                'idle': { url: Assets.animations['idle-00'].url, loop: true }
            }}
            animationState={animationState}
            onClick={(e) => {
              e.stopPropagation();
              if (useGameStore.getState().dialogue.isOpen) return;
              
              if (onInteract) {
                onInteract();
                return;
              }
              
              const portraitUrl = Assets.characters['crocy_eth_character_concept_sheet_for_a_generic_rpg_novice_ad_9e579b2b-d131-4d71-a933-8f8e6eeb3c8b_0-removebg-preview_1766365510787_1']?.url || modelUrl;
              const quest = useGameStore.getState().quest;

              // 1. Check Quest Completion
              if (quest.isActive && quest.progress >= quest.target) {
                openDialogue(
                  name,
                  "Incredible! You saved us. Here is the Legendary Gold Sword as promised!",
                  portraitUrl,
                  [
                    {
                      label: 'Claim Reward',
                      onClick: () => {
                        closeDialogue();
                        
                        // 1. Add Item to Inventory
                        useInventoryStore.getState().addItem({
                          id: 'gold_sword',
                          name: 'Gold Sword',
                          type: 'weapon',
                          iconUrl: Assets.ui.icon_sword.url,
                          stats: { damage: 50 },
                          description: 'A legendary blade given by the Village Elder.'
                        });

                        // 2. Visual & Game State Updates
                        useGameStore.getState().setVictory(true);
                        useGameStore.getState().setGoldenWeapon(true);
                        
                        // 3. Notification
                        useGameStore.getState().showNotification('Quest Complete! You received [Gold Sword].');
                      }
                    }
                  ]
                );
                return;
              }

              // 2. Check Quest In Progress
              if (quest.isActive && quest.progress < quest.target) {
                  openDialogue(
                      name,
                      `Please hurry! We still need you to defeat ${quest.target - quest.progress} more Slimes!`,
                      portraitUrl,
                      [{ label: 'I will!', onClick: closeDialogue }]
                  );
                  return;
              }
              
              openDialogue(
                name, 
                "Traveler! Slimes are destroying our village. If you defeat 5 Slimes, I will reward you with a rare [NFT Weapon]! Will you help?", 
                portraitUrl,
                [
                  { 
                    label: 'Accept Quest', 
                    onClick: () => { 
                      closeDialogue();
                      useGameStore.getState().startQuest();
                      useGameStore.getState().showNotification("Quest Accepted: Hunt Slimes!");
                    } 
                  },
                  { 
                    label: 'Decline', 
                    onClick: () => { 
                      closeDialogue();
                      setTimeout(() => {
                        openDialogue(name, "The offer stands if you change your mind.", portraitUrl);
                      }, 100);
                    } 
                  }
                ]
              );
            }}
        />
        
        {/* Highlight Ring when nearby */}
        {isPlayerNearby && (
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.5, 0.7, 32]} />
                <meshBasicMaterial color="yellow" opacity={0.5} transparent />
            </mesh>
        )}
        
        {/* Shadow Sprite */}
        <BlobShadow scale={1.2} opacity={0.5} />
      </RigidBodyObject>
    </group>
  );
};

export default NPC;
