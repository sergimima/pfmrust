import React, { useState, useEffect } from 'react';
import { Plus, X, Clock, Users, Hash, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { useVoting } from '../../hooks/useProgram';

// Simulación de datos de usuario - en producción vendría del wallet
const mockUserData = {
  reputation: 1250,
  level: 5,
  wallet: "GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw"
};

// Definición del tipo Community para evitar errores de tipado
interface Community {
  id: number;
  name: string;
  category: string;
  members: number;
  isActive: boolean;
  address?: string; // Dirección de la comunidad en la blockchain (opcional)
}

// Hook para obtener comunidades reales
const useCommunities = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/communities?isActive=true');
        
        if (!response.ok) {
          throw new Error('Error fetching communities');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          // Transformar datos de API al formato esperado
          const transformedCommunities = data.data.map((community: any) => ({
            id: community.id,
            name: community.name,
            category: community.metadata?.category || 'General',
            members: community.memberCount || 0,
            isActive: community.isActive
          }));
          setCommunities(transformedCommunities);
        } else {
          // Fallback a datos mock si la API falla
          console.log('⚠️ API failed, using mock data');
          setCommunities([
            { id: 1, name: "Tecnología", category: "Technology", members: 1250, isActive: true, address: "11111111111111111111111111111112" },
            { id: 2, name: "DeFi Discussion", category: "Finance", members: 890, isActive: true, address: "11111111111111111111111111111113" },
            { id: 3, name: "Gaming Hub", category: "Gaming", members: 2100, isActive: true, address: "11111111111111111111111111111114" },
            { id: 4, name: "Arte Digital", category: "Art", members: 567, isActive: true, address: "11111111111111111111111111111115" }
          ]);
        }
      } catch (err: any) {
        console.error('Error fetching communities:', err);
        setError(err?.message || 'Error desconocido al obtener comunidades');
        // Fallback a datos mock en caso de error
        setCommunities([
          { id: 1, name: "Tecnología", category: "Technology", members: 1250, isActive: true, address: "11111111111111111111111111111112" },
          { id: 2, name: "DeFi Discussion", category: "Finance", members: 890, isActive: true, address: "11111111111111111111111111111113" },
          { id: 3, name: "Gaming Hub", category: "Gaming", members: 2100, isActive: true, address: "11111111111111111111111111111114" },
          { id: 4, name: "Arte Digital", category: "Art", members: 567, isActive: true, address: "11111111111111111111111111111115" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  return { communities, loading, error };
};

const voteTypes = [
  { value: 'Opinion', label: 'Opinión', description: 'Votación subjetiva basada en preferencias' },
  { value: 'Knowledge', label: 'Conocimiento', description: 'Pregunta con respuesta correcta verificable' }
];

const deadlineOptions = [
  { value: 1, label: '1 hora' },
  { value: 6, label: '6 horas' },
  { value: 24, label: '1 día' },
  { value: 72, label: '3 días' },
  { value: 168, label: '1 semana' }
];

// Función para calcular fee basado en reputación
const calculateFee = (reputation: number) => {
  if (reputation >= 5000) return { amount: 0.002, tier: 'VIP' };
  if (reputation >= 1000) return { amount: 0.005, tier: 'Premium' };
  return { amount: 0.01, tier: 'Basic' };
};

interface FormData {
  community: string;
  title: string;
  description: string;
  voteType: 'Opinion' | 'Knowledge';
  options: string[];
  deadline: number;
  quorum: number;
  usePercentageQuorum: boolean;
  correctAnswer: string;
  correctAnswerHash: string;
}

export default function CreateVoting() {
  const { communities, loading: communitiesLoading, error: communitiesError } = useCommunities();
  // Asegurar que selectedCommunity sea del tipo Community o undefined
  const [selectedCommunity, setSelectedCommunity] = useState<Community | undefined>(undefined);
  
  const [formData, setFormData] = useState<FormData>({
    community: '',
    title: '',
    description: '',
    voteType: 'Opinion',
    options: ['', ''],
    deadline: 24,
    quorum: 10,
    usePercentageQuorum: false,
    correctAnswer: '',
    correctAnswerHash: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [feeInfo, setFeeInfo] = useState<{amount: number, tier: string} | null>(null);

  useEffect(() => {
    const fee = calculateFee(mockUserData.reputation);
    setFeeInfo(fee);
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 4) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.community) newErrors.community = 'Selecciona una comunidad';
    if (!formData.title.trim()) newErrors.title = 'El título es requerido';
    if (formData.title.length > 100) newErrors.title = 'El título no puede exceder 100 caracteres';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.description.length > 500) newErrors.description = 'La descripción no puede exceder 500 caracteres';
    
    const validOptions = formData.options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) newErrors.options = 'Mínimo 2 opciones válidas requeridas';
    
    if (formData.voteType === 'Knowledge' && !formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'La respuesta correcta es requerida para preguntas de conocimiento';
    }

    if (formData.quorum < 1) newErrors.quorum = 'El quorum debe ser mayor a 0';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Importar el hook useVoting
  const { createVoting } = useVoting();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      console.log('Creando votación con datos:', formData);
      
      if (!selectedCommunity) {
        throw new Error('Debes seleccionar una comunidad');
      }
      
      // Convertir el ID de comunidad a PublicKey
      if (!selectedCommunity.address) {
        throw new Error('La comunidad seleccionada no tiene una dirección válida');
      }
      const communityPda = new PublicKey(selectedCommunity.address);
      
      // Llamar a la función real de createVoting
      const result = await createVoting({
        question: formData.title,
        options: formData.options.filter(opt => opt.trim() !== ''),
        voteType: formData.voteType as 'Opinion' | 'Knowledge',
        correctAnswer: formData.voteType === 'Knowledge' ? parseInt(formData.correctAnswer) : undefined,
        deadlineHours: formData.deadline,
        quorumRequired: formData.quorum,
        communityPda: communityPda
      });
      
      console.log('Votación creada exitosamente:', result);
      alert('¡Votación creada exitosamente!');
      
      // Reset form
      setFormData({
        community: '',
        title: '',
        description: '',
        voteType: 'Opinion',
        options: ['', ''],
        deadline: 24,
        quorum: 10,
        usePercentageQuorum: false,
        correctAnswer: '',
        correctAnswerHash: ''
      });
      
    } catch (error) {
      console.error('Error creating voting:', error);
      alert('Error al crear la votación. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar selectedCommunity cuando cambie formData.community o communities
  useEffect(() => {
    if (formData.community && communities.length > 0) {
      const found = communities.find(c => c.id === parseInt(formData.community));
      setSelectedCommunity(found);
    } else {
      setSelectedCommunity(undefined);
    }
  }, [formData.community, communities]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Votación</h1>
        <p className="text-gray-600">Crea una votación para que la comunidad tome decisiones importantes</p>
      </div>

      {/* Fee Info */}
      {feeInfo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Información de Fee</span>
          </div>
          <p className="text-blue-700 mt-1">
            Como usuario {feeInfo.tier}, pagarás {feeInfo.amount} SOL por crear esta votación.
            {mockUserData.reputation >= 1000 && (
              <span className="text-green-600 ml-1">¡Tienes descuento por tu alta reputación!</span>
            )}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Comunidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comunidad *
          </label>
          {communitiesLoading ? (
            <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-500">Cargando comunidades...</span>
            </div>
          ) : (
            <select
              value={formData.community}
              onChange={(e) => handleInputChange('community', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecciona una comunidad</option>
              {communities.map(community => (
                <option key={community.id} value={community.id}>
                  {community.name} ({community.members} miembros)
                </option>
              ))}
            </select>
          )}
          
          {communitiesError && (
            <div className="mt-1 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
              ⚠️ Error cargando comunidades: {communitiesError}. Usando datos de respaldo.
            </div>
          )}
          
          {errors.community && <p className="text-red-500 text-sm mt-1">{errors.community}</p>}
          
          {communities.length === 0 && !communitiesLoading && (
            <p className="text-gray-500 text-sm mt-1">No hay comunidades disponibles</p>
          )}
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Votación *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="¿Cuál es tu pregunta o propuesta?"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            <p className="text-gray-500 text-sm">{formData.title.length}/100</p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Proporciona más detalles sobre esta votación..."
            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            <p className="text-gray-500 text-sm">{formData.description.length}/500</p>
          </div>
        </div>

        {/* Tipo de Votación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Votación *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {voteTypes.map(type => (
              <div
                key={type.value}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  formData.voteType === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => handleInputChange('voteType', type.value)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    checked={formData.voteType === type.value}
                    onChange={() => handleInputChange('voteType', type.value)}
                    className="text-blue-600"
                  />
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Opciones de Respuesta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opciones de Respuesta *
          </label>
          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Opción ${index + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {formData.options.length < 4 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-3 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir opción
            </button>
          )}
          
          {errors.options && <p className="text-red-500 text-sm mt-1">{errors.options}</p>}
        </div>

        {/* Respuesta Correcta (solo para Knowledge) */}
        {formData.voteType === 'Knowledge' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta Correcta *
            </label>
            <input
              type="text"
              value={formData.correctAnswer}
              onChange={(e) => handleInputChange('correctAnswer', e.target.value)}
              placeholder="Especifica cuál es la respuesta correcta"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            {errors.correctAnswer && <p className="text-red-500 text-sm mt-1">{errors.correctAnswer}</p>}
            <p className="text-sm text-gray-500 mt-1">
              Esta respuesta se mantendrá oculta hasta que termine la votación
            </p>
          </div>
        )}

        {/* Configuración de Tiempo y Quorum */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Duración
            </label>
            <select
              value={formData.deadline}
              onChange={(e) => handleInputChange('deadline', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {deadlineOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quorum */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Quorum Mínimo
            </label>
            <div className="space-y-2">
              <input
                type="number"
                value={formData.quorum}
                onChange={(e) => handleInputChange('quorum', parseInt(e.target.value) || 0)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.usePercentageQuorum}
                  onChange={(e) => handleInputChange('usePercentageQuorum', e.target.checked)}
                  className="text-blue-600"
                />
                <span className="text-sm text-gray-600">Usar porcentaje de miembros</span>
              </label>
            </div>
            {errors.quorum && <p className="text-red-500 text-sm mt-1">{errors.quorum}</p>}
            {selectedCommunity && (
              <p className="text-sm text-gray-500 mt-1">
                {formData.usePercentageQuorum 
                  ? `${formData.quorum}% de ${selectedCommunity.members} miembros = ${Math.ceil(selectedCommunity.members * formData.quorum / 100)} votos`
                  : `${formData.quorum} votos mínimos requeridos`
                }
              </p>
            )}
          </div>
        </div>

        {/* Preview Button */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
          >
            {showPreview ? 'Ocultar Preview' : 'Vista Previa'}
          </button>
        </div>

        {/* Preview */}
        {showPreview && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Vista Previa de la Votación</h3>
            
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {selectedCommunity?.name || 'Comunidad no seleccionada'}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {formData.voteType}
                </span>
              </div>
              
              <h4 className="font-semibold text-lg mb-2">
                {formData.title || 'Título de la votación'}
              </h4>
              
              <p className="text-gray-600 mb-4">
                {formData.description || 'Descripción de la votación'}
              </p>
              
              <div className="space-y-2 mb-4">
                {formData.options.filter(opt => opt.trim()).map((option, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border border-gray-200 rounded">
                    <input type="radio" disabled />
                    <span>{option}</span>
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 text-sm text-gray-500">
                <span>⏰ {deadlineOptions.find(d => d.value === formData.deadline)?.label}</span>
                <span>👥 Quorum: {formData.quorum}{formData.usePercentageQuorum ? '%' : ''}</span>
                <span>💰 Fee: {feeInfo?.amount} SOL</span>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Crear Votación
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}