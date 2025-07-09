'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Settings, Globe, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useCommunity } from '@/hooks/useProgram';
import { useWallet } from '@solana/wallet-adapter-react';

// Categorías disponibles para comunidades
const categories = [
  { id: 'technology', name: 'Technology', icon: '💻', description: 'Software, hardware, programming, and tech innovations' },
  { id: 'finance', name: 'Finance', icon: '💰', description: 'DeFi, trading, economics, and financial discussions' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', description: 'GameFi, esports, game development, and gaming culture' },
  { id: 'art', name: 'Art & Creative', icon: '🎨', description: 'NFTs, digital art, design, and creative projects' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Learning resources, tutorials, and knowledge sharing' },
  { id: 'sports', name: 'Sports', icon: '⚽', description: 'Sports betting, fantasy leagues, and athletic discussions' },
  { id: 'music', name: 'Music', icon: '🎵', description: 'Music NFTs, streaming, and audio entertainment' },
  { id: 'science', name: 'Science', icon: '🔬', description: 'Research, innovations, and scientific discussions' },
  { id: 'politics', name: 'Politics', icon: '🏛️', description: 'Governance, policy discussions, and civic engagement' },
  { id: 'general', name: 'General', icon: '💬', description: 'Open discussions and miscellaneous topics' }
];

// Función para calcular fee de creación
const calculateCreationFee = (reputation: number) => {
  if (reputation >= 5000) return { amount: 0.05, tier: 'VIP' };
  if (reputation >= 1000) return { amount: 0.075, tier: 'Premium' };
  return { amount: 0.1, tier: 'Basic' };
};

// Mock user data
const mockUserData = {
  reputation: 1250,
  level: 5,
  wallet: "GJENwjwdh7rAcZyrYh76SDjwgYrhncfhQKaMNGfSHirw"
};

interface FormData {
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPrivate: boolean;
  requiresApproval: boolean;
  minReputationToJoin: number;
  rules: string;
  website: string;
  discord: string;
  twitter: string;
}

export default function CreateCommunityPage() {
  const router = useRouter();
  const { publicKey } = useWallet();
  const { createCommunity } = useCommunity();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    tags: [],
    isPrivate: false,
    requiresApproval: false,
    minReputationToJoin: 0,
    rules: '',
    website: '',
    discord: '',
    twitter: ''
  });

  const [currentTag, setCurrentTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [feeInfo, setFeeInfo] = useState<{amount: number, tier: string} | null>(null);

  useEffect(() => {
    const fee = calculateCreationFee(mockUserData.reputation);
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

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim()) && formData.tags.length < 5) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'El nombre de la comunidad es requerido';
    if (formData.name.length > 50) newErrors.name = 'El nombre no puede exceder 50 caracteres';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.description.length > 500) newErrors.description = 'La descripción no puede exceder 500 caracteres';
    if (!formData.category) newErrors.category = 'Selecciona una categoría';
    if (formData.tags.length === 0) newErrors.tags = 'Añade al menos 1 tag';
    if (formData.rules.length > 1000) newErrors.rules = 'Las reglas no pueden exceder 1000 caracteres';
    if (formData.minReputationToJoin < 0) newErrors.minReputationToJoin = 'La reputación mínima no puede ser negativa';

    // Validar URLs si se proporcionan
    if (formData.website && !isValidUrl(formData.website)) newErrors.website = 'URL del sitio web inválida';
    if (formData.discord && !isValidUrl(formData.discord)) newErrors.discord = 'URL de Discord inválida';
    if (formData.twitter && !isValidUrl(formData.twitter)) newErrors.twitter = 'URL de Twitter inválida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Verificar wallet conectado
    if (!publicKey) {
      alert('❌ Por favor conecta tu wallet primero');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🏘️ Iniciando creación de comunidad...');
      console.log('📍 Wallet:', publicKey.toString());
      console.log('📋 Data:', formData);

      // PASO 1: Crear comunidad en blockchain PRIMERO
      console.log('🔐 Paso 1: Creando comunidad en blockchain...');
      
      // Preparar datos para smart contract
      const categoryMapping: Record<string, number> = {
        'technology': 0,
        'finance': 1,
        'gaming': 2,
        'art': 3,
        'education': 4,
        'sports': 5,
        'music': 6,
        'science': 7,
        'politics': 8,
        'general': 9
      };
      
      const blockchainParams = {
        name: formData.name,
        category: categoryMapping[formData.category] || 9, // Default to general
        quorumPercentage: 50, // Valor u8 entre 1-100
        requiresApproval: formData.requiresApproval
      };
      
      console.log('📨 Enviando a smart contract:', blockchainParams);
      console.log('⚠️  Quorum value:', blockchainParams.quorumPercentage, 'type:', typeof blockchainParams.quorumPercentage);
      console.log('⚠️  Esto requerirá FIRMA de tu wallet');
      
      // Ejecutar create_community en blockchain
      const blockchainResult = await createCommunity(blockchainParams);
      
      console.log('✅ Comunidad creada en blockchain:', blockchainResult);
      
      // PASO 2: Confirmar en backend DESPUÉS del blockchain
      console.log('🔄 Paso 2: Confirmando en backend...');
      
      // Preparar datos para backend
      const communityData = {
        name: formData.name,
        description: formData.description,
        adminPubkey: publicKey.toString(),
        category: formData.category.toUpperCase(),
        requiresApproval: formData.requiresApproval,
        votingFee: 0,
        rules: formData.rules,
        tags: formData.tags,
        website: formData.website,
        socialLinks: {
          discord: formData.discord,
          twitter: formData.twitter
        },
        // Añadir info blockchain
        blockchainInfo: {
          communityPda: blockchainResult.communityPda.toString(),
          transactionSignature: blockchainResult.transaction,
          programId: '98eSBn9oRdJcPzFUuRMgktewygF6HfkwiCQUJuJBw1z'
        }
      };
      
      console.log('📨 Enviando a backend:', communityData);
      
      // Llamar al backend
      const response = await apiClient.createCommunity(communityData);
      
      console.log('✅ Comunidad confirmada en backend:', response);
      
      // PASO 3: Éxito completo
      alert(`🎉 ¡Comunidad "${formData.name}" creada exitosamente!\n\n` +
            `🔗 Transacción: ${blockchainResult.transaction}\n` +
            `📍 Community PDA: ${blockchainResult.communityPda.toString()}`);
      
      router.push('/user/communities');
      
    } catch (error: any) {
      console.error('❌ Error completo creando comunidad:', error);
      
      // Manejo de errores específicos
      if (error.message.includes('User rejected')) {
        alert('❌ Transacción cancelada por el usuario');
      } else if (error.message.includes('insufficient funds')) {
        alert('❌ Fondos insuficientes para crear la comunidad');
      } else if (error.message.includes('wallet')) {
        alert('❌ Error de wallet. Verifica que esté conectado correctamente');
      } else if (error.message.includes('blockchain')) {
        alert('❌ Error en blockchain. La comunidad no se creó');
      } else if (error.message.includes('backend')) {
        alert('❌ Comunidad creada en blockchain pero error en backend. Contacta soporte');
      } else {
        alert(`❌ Error creando comunidad: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/user/communities" className="text-gray-400 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Create New Community</h1>
                <p className="text-gray-600">Build a space for like-minded people to govern together</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <span className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Step 1: Community Setup
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto py-8 px-6">
        {/* Fee Info */}
        {feeInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-900">Creation Cost</span>
            </div>
            <div className="text-blue-700 mt-1">
              <p>🔗 <strong>Blockchain:</strong> {feeInfo.amount} SOL (tier: {feeInfo.tier})</p>
              <p>⛽ <strong>Gas:</strong> ~0.000005 SOL</p>
              <p>💰 <strong>Total:</strong> ~{feeInfo.amount + 0.000005} SOL</p>
              {publicKey ? (
                <p className="text-green-600 mt-1">✅ Wallet conectado: {publicKey.toString().slice(0, 8)}...</p>
              ) : (
                <p className="text-red-600 mt-1">❌ Conecta tu wallet para crear la comunidad</p>
              )}
              {mockUserData.reputation >= 1000 && (
                <p className="text-green-600 mt-1">✨ You get a discount for your reputation!</p>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
            
            {/* Community Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Community Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., DeFi Governance Hub"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                maxLength={50}
              />
              <div className="flex justify-between mt-1">
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                <p className="text-gray-500 text-sm">{formData.name.length}/50</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what your community is about, its goals, and what members can expect..."
                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                maxLength={500}
              />
              <div className="flex justify-between mt-1">
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                <p className="text-gray-500 text-sm">{formData.description.length}/500</p>
              </div>
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map(category => (
                  <div
                    key={category.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      formData.category === category.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleInputChange('category', category.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                ))}
              </div>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags * (máximo 5)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Añadir tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  maxLength={20}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 5}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              
              {errors.tags && <p className="text-red-500 text-sm">{errors.tags}</p>}
              <p className="text-gray-500 text-sm">
                Ejemplo: DeFi, Governance, Yield, Finance, DAO
              </p>
            </div>
          </div>

          {/* Community Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Settings</h2>
            
            <div className="space-y-6">
              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy & Access</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Private Community</span>
                  </label>
                  <p className="text-sm text-gray-600 ml-6">
                    Private communities are not visible in public listings and require invitation or approval to join.
                  </p>
                  
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.requiresApproval}
                      onChange={(e) => handleInputChange('requiresApproval', e.target.checked)}
                      className="text-blue-600"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">Require Approval to Join</span>
                  </label>
                  <p className="text-sm text-gray-600 ml-6">
                    New members must be approved by admins before they can participate.
                  </p>
                </div>
              </div>

              {/* Minimum Reputation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Reputation to Join
                </label>
                <input
                  type="number"
                  value={formData.minReputationToJoin}
                  onChange={(e) => handleInputChange('minReputationToJoin', parseInt(e.target.value) || 0)}
                  min="0"
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Set to 0 for no minimum requirement. Higher values ensure more experienced members.
                </p>
              </div>
            </div>
          </div>

          {/* Community Rules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Community Rules (Optional)</h2>
            
            <textarea
              value={formData.rules}
              onChange={(e) => handleInputChange('rules', e.target.value)}
              placeholder="Define community guidelines, rules, and expectations for members..."
              className="w-full px-3 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows={6}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.rules && <p className="text-red-500 text-sm">{errors.rules}</p>}
              <p className="text-gray-500 text-sm">{formData.rules.length}/1000</p>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Social Links (Optional)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  💬 Discord
                </label>
                <input
                  type="url"
                  value={formData.discord}
                  onChange={(e) => handleInputChange('discord', e.target.value)}
                  placeholder="https://discord.gg/invite"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.discord && <p className="text-red-500 text-sm mt-1">{errors.discord}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🐦 Twitter
                </label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  placeholder="https://twitter.com/handle"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                {errors.twitter && <p className="text-red-500 text-sm mt-1">{errors.twitter}</p>}
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Community Preview</h3>
              
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{selectedCategory?.icon || '🏘️'}</div>
                  <div>
                    <h4 className="font-semibold text-lg">{formData.name || 'Community Name'}</h4>
                    <p className="text-sm text-gray-600">{selectedCategory?.name || 'Category'}</p>
                  </div>
                  <div className="ml-auto flex gap-2">
                    {formData.isPrivate && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Private</span>
                    )}
                    {formData.requiresApproval && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Approval Required</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{formData.description || 'Community description'}</p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>👥 0 members</span>
                  <span>🗳️ 0 active votings</span>
                  {formData.minReputationToJoin > 0 && (
                    <span>⭐ {formData.minReputationToJoin}+ reputation required</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
            >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            
            <div className="flex gap-4">
            <Link
            href="/user/communities"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
            Cancel
            </Link>
            
            {!publicKey ? (
            <button
              type="button"
              disabled
                className="px-6 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed flex items-center gap-2"
            >
            <AlertTriangle className="w-4 h-4" />
            Conecta tu wallet
            </button>
            ) : (
            <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isSubmitting ? (
                  <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Create Community
                      </>
                    )}
                  </button>
                )}
              </div>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Tips for Successful Communities</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h4 className="font-medium mb-2">📝 Content Guidelines:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Choose a clear, descriptive name</li>
                <li>Write a compelling description</li>
                <li>Select relevant tags for discoverability</li>
                <li>Define clear community rules</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">⚙️ Settings Tips:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Start with open membership to grow quickly</li>
                <li>Consider approval requirements for quality control</li>
                <li>Set reasonable reputation minimums</li>
                <li>Add social links to build trust</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}