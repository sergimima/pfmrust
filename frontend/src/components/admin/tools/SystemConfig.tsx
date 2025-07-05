'use client';

import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

interface SystemConfig {
  globalQuorum: number;
  defaultQuorumPercentage: number;
  maxVotingDuration: number; // hours
  minVotingDuration: number; // hours
  reputationLevelThreshold: number;
  maxCommunityNameLength: number;
  maxVoteOptionsCount: number;
  autoModerationThreshold: number;
}

export default function SystemConfig() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [config, setConfig] = useState<SystemConfig>({
    globalQuorum: 10,
    defaultQuorumPercentage: 20,
    maxVotingDuration: 168, // 1 week
    minVotingDuration: 1,   // 1 hour
    reputationLevelThreshold: 10,
    maxCommunityNameLength: 50,
    maxVoteOptionsCount: 4,
    autoModerationThreshold: 5
  });

  const [categories, setCategories] = useState([
    { id: 0, name: 'Technology', description: 'Tech and development topics', isCustom: false },
    { id: 1, name: 'Finance', description: 'DeFi and financial discussions', isCustom: false },
    { id: 2, name: 'Gaming', description: 'Blockchain gaming and NFTs', isCustom: false },
    { id: 3, name: 'Art', description: 'Digital art and creativity', isCustom: false },
    { id: 10, name: 'General', description: 'General discussions', isCustom: false },
    { id: 100, name: 'Custom Category 1', description: 'Admin created category', isCustom: true },
  ]);

  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  const handleConfigChange = (field: keyof SystemConfig, value: number) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveConfig = async () => {
    if (!publicKey) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract para actualizar configuración
      console.log('Saving system configuration:', config);
      alert('Configuración guardada exitosamente!');
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error al guardar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!publicKey || !newCategory.name.trim()) return;
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract create_custom_category()
      console.log('Creating custom category:', newCategory);
      
      const newId = Math.max(...categories.map(c => c.id)) + 1;
      setCategories(prev => [...prev, {
        id: newId,
        name: newCategory.name,
        description: newCategory.description,
        isCustom: true
      }]);
      
      setNewCategory({ name: '', description: '' });
      alert('Categoría creada exitosamente!');
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear categoría');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (!publicKey) return;
    
    const category = categories.find(c => c.id === categoryId);
    if (!category?.isCustom) {
      alert('No se pueden eliminar categorías predefinidas');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Conectar con smart contract para eliminar categoría
      console.log('Deleting category:', categoryId);
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      alert('Categoría eliminada exitosamente!');
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
        {hasChanges && (
          <button
            onClick={handleSaveConfig}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        )}
      </div>

      {/* System Parameters */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Parámetros Globales</h3>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quorum Global Mínimo
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.globalQuorum}
                onChange={(e) => handleConfigChange('globalQuorum', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Número mínimo de votos requeridos</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de Quorum por Defecto
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.defaultQuorumPercentage}
                onChange={(e) => handleConfigChange('defaultQuorumPercentage', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">% de miembros para completar votación</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Máxima Votación (horas)
              </label>
              <input
                type="number"
                min="1"
                max="720"
                value={config.maxVotingDuration}
                onChange={(e) => handleConfigChange('maxVotingDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Mínima Votación (horas)
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={config.minVotingDuration}
                onChange={(e) => handleConfigChange('minVotingDuration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral Nivel de Reputación
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={config.reputationLevelThreshold}
                onChange={(e) => handleConfigChange('reputationLevelThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Puntos por nivel</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud Máxima Nombre Comunidad
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={config.maxCommunityNameLength}
                onChange={(e) => handleConfigChange('maxCommunityNameLength', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo Opciones por Votación
              </label>
              <input
                type="number"
                min="2"
                max="10"
                value={config.maxVoteOptionsCount}
                onChange={(e) => handleConfigChange('maxVoteOptionsCount', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Umbral Automoderación
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={config.autoModerationThreshold}
                onChange={(e) => handleConfigChange('autoModerationThreshold', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1">Reportes para acción automática</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Management */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Gestión de Categorías</h3>
        
        {/* Create new category */}
        <div className="mb-6 p-4 bg-white rounded border">
          <h4 className="font-medium mb-3">Crear Nueva Categoría</h4>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <input
              type="text"
              placeholder="Descripción"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <button
            onClick={handleCreateCategory}
            disabled={loading || !newCategory.name.trim()}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            Crear Categoría
          </button>
        </div>

        {/* Categories list */}
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between p-3 bg-white rounded border">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{category.name}</span>
                  {category.isCustom && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      Custom
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{category.description}</p>
              </div>
              {category.isCustom && (
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  disabled={loading}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  Eliminar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-100 p-4 rounded">
            <h4 className="font-medium text-green-800">Sistema Operativo</h4>
            <p className="text-green-600 text-sm">Todos los servicios funcionando</p>
          </div>
          <div className="bg-blue-100 p-4 rounded">
            <h4 className="font-medium text-blue-800">Última Actualización</h4>
            <p className="text-blue-600 text-sm">2025-07-05 10:30:00</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <h4 className="font-medium text-purple-800">Versión Smart Contract</h4>
            <p className="text-purple-600 text-sm">v1.4.7</p>
          </div>
        </div>
      </div>
    </div>
  );
}