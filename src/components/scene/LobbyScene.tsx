import React, { useState } from 'react';
import { useLobbyStore } from '../../stores/lobbyStore';
import { CharacterData, JobType } from '../../models/CharacterData';

interface LobbySceneProps {
  onGameStart: (characterData: CharacterData) => void;
}

const LobbyScene: React.FC<LobbySceneProps> = ({ onGameStart }) => {
  const { characterList, createCharacter, deleteCharacter } = useLobbyStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newJob, setNewJob] = useState<JobType>(JobType.Warrior);

  const handleCreate = () => {
    if (!newName.trim()) {
      alert('Please enter a name');
      return;
    }
    createCharacter(newName, newJob);
    setShowCreateForm(false);
    setNewName('');
    setNewJob(JobType.Warrior);
  };

  const handleStart = (char: CharacterData) => {
    console.log("UI Initialization Start");
    console.log("Map Loading Start");
    onGameStart(char);
  };

  return (
    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://agent8-games.verse8.io/mcp-agent8-generated/static-assets/skybox-14776714-1766363280611.jpg')] bg-cover bg-center" />
      
      <div className="z-10 bg-slate-800/90 p-8 rounded-xl shadow-2xl border border-slate-600 max-w-4xl w-full mx-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-amber-400 drop-shadow-md">Character Select</h1>

        <div className="flex flex-wrap gap-6 justify-center">
          {/* Slot 1 */}
          <CharacterSlot
            character={characterList[0]}
            index={0}
            onDelete={() => deleteCharacter(0)}
            onStart={() => handleStart(characterList[0])}
            onCreateOpen={() => setShowCreateForm(true)}
            isFull={characterList.length >= 2}
          />

          {/* Slot 2 */}
          <CharacterSlot
            character={characterList[1]}
            index={1}
            onDelete={() => deleteCharacter(1)}
            onStart={() => handleStart(characterList[1])}
            onCreateOpen={() => setShowCreateForm(true)}
            isFull={characterList.length >= 2}
          />
        </div>
      </div>

      {/* Create Character Modal */}
      {showCreateForm && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-8 rounded-lg border border-slate-500 w-96 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Create New Hero</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-slate-300">Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-amber-400"
                placeholder="Enter hero name..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1 text-slate-300">Class</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setNewJob(JobType.Warrior)}
                  className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                    newJob === JobType.Warrior
                      ? 'bg-amber-900/50 border-amber-400 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-bold">Warrior</div>
                  <div className="text-xs opacity-80">HP++ Atk++</div>
                </button>
                <button
                  onClick={() => setNewJob(JobType.Mage)}
                  className={`p-3 rounded border flex flex-col items-center gap-2 transition-all ${
                    newJob === JobType.Mage
                      ? 'bg-blue-900/50 border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.3)]'
                      : 'bg-slate-700 border-slate-600 text-slate-400 hover:bg-slate-600'
                  }`}
                >
                  <div className="font-bold">Mage</div>
                  <div className="text-xs opacity-80">MP++ Magic++</div>
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateForm(false)}
                className="flex-1 py-2 rounded border border-slate-600 hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold transition-colors shadow-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface CharacterSlotProps {
  character?: CharacterData;
  index: number;
  onDelete: () => void;
  onStart: () => void;
  onCreateOpen: () => void;
  isFull: boolean;
}

const CharacterSlot: React.FC<CharacterSlotProps> = ({
  character,
  index,
  onDelete,
  onStart,
  onCreateOpen,
  isFull,
}) => {
  if (!character) {
    return (
      <div className="w-64 h-80 border-2 border-dashed border-slate-600 rounded-xl flex flex-col items-center justify-center p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors group">
        <button
          onClick={onCreateOpen}
          disabled={isFull}
          className={`w-full h-full flex flex-col items-center justify-center ${isFull ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="w-16 h-16 rounded-full bg-slate-700 group-hover:bg-slate-600 flex items-center justify-center mb-4 transition-colors">
            <span className="text-4xl text-slate-400 group-hover:text-white">+</span>
          </div>
          <span className="text-lg font-medium text-slate-400 group-hover:text-white">
            {isFull ? 'Slots Full' : 'Create New'}
          </span>
        </button>
      </div>
    );
  }

  const isWarrior = character.job === JobType.Warrior;

  return (
    <div className="w-64 h-80 border border-slate-600 rounded-xl flex flex-col bg-slate-800 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-colors">
      {/* Card Header / Image Placeholder */}
      <div className={`h-32 w-full ${isWarrior ? 'bg-amber-900/30' : 'bg-blue-900/30'} flex items-center justify-center relative`}>
        <div className="text-6xl select-none opacity-80">
          {isWarrior ? '⚔️' : '🔮'}
        </div>
        <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-xs font-mono text-white">
          LV.{character.level}
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-1 truncate">{character.characterName}</h3>
        <p className={`text-sm font-medium mb-4 ${isWarrior ? 'text-amber-400' : 'text-blue-400'}`}>
          {character.job}
        </p>

        <div className="space-y-1 text-xs text-slate-400 mb-auto">
          <div className="flex justify-between">
            <span>HP</span>
            <span className="text-white">{character.maxHP}</span>
          </div>
          <div className="flex justify-between">
            <span>MP</span>
            <span className="text-white">{character.maxMP}</span>
          </div>
          <div className="flex justify-between">
            <span>ATK</span>
            <span className="text-white">{character.attackPower}</span>
          </div>
           <div className="flex justify-between">
            <span>MAG</span>
            <span className="text-white">{character.magicPower}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
           <button
            onClick={onDelete}
            className="px-3 py-2 rounded bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 text-sm font-medium transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onStart}
            className="flex-1 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-bold shadow-md transition-all active:scale-95"
          >
            Start
          </button>
        </div>
      </div>
    </div>
  );
};

export default LobbyScene;
