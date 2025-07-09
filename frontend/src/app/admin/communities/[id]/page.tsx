'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Users, Calendar, Globe, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatNumber, formatRelativeTime, capitalize } from '@/lib/utils';
import type { Community } from '@/types';

export default function CommunityDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getCommunity(params.id);
        setCommunity(response.data);
      } catch (err) {
        console.error('Error fetching community:', err);
        setError('No se pudo cargar la información de la comunidad');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunity();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error || 'No se encontró la comunidad solicitada'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-6">
          <Link href="/admin/communities" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la lista de comunidades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="/admin/communities" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a la lista de comunidades
        </Link>
      </div>

      {/* Community Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h1>
            <p className="text-gray-600 mb-4">{community.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {capitalize(community.category)}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                community.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {community.isActive ? 'Activa' : 'Inactiva'}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                community.requiresApproval
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {community.requiresApproval ? 'Requiere aprobación' : 'Acceso abierto'}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>ID: {community.id}</p>
              <p>Creada: {formatRelativeTime(community.createdAt)}</p>
              <p>Última actualización: {formatRelativeTime(community.updatedAt)}</p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Link 
              href={`/admin/communities/${community.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ✏️ Editar
            </Link>
            <button 
              onClick={() => {
                if (confirm(`¿Estás seguro de que deseas eliminar la comunidad "${community.name}"?`)) {
                  // Aquí iría la lógica para eliminar la comunidad
                  console.log(`Eliminar comunidad ${community.id}`);
                  // Por ahora solo mostramos un mensaje
                  alert('Funcionalidad de eliminación no implementada aún');
                }
              }}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👥</div>
            <div>
              <p className="text-sm text-gray-600">Miembros</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(community.totalMembers)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🗳️</div>
            <div>
              <p className="text-sm text-gray-600">Votaciones</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(community.totalVotes)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="text-2xl mr-3">💰</div>
            <div>
              <p className="text-sm text-gray-600">Fees Recaudados</p>
              <p className="text-xl font-bold text-gray-900">{formatNumber(community.feesCollected)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Details */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Detalles de la Comunidad</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Información General</h3>
            <div className="space-y-2">
              <p><strong>Administrador:</strong> {community.authority}</p>
              <p><strong>Categoría:</strong> {capitalize(community.category)}</p>
              <p><strong>Estado:</strong> {community.isActive ? 'Activa' : 'Inactiva'}</p>
              <p><strong>Requiere aprobación:</strong> {community.requiresApproval ? 'Sí' : 'No'}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Reglas y Políticas</h3>
            <div className="space-y-2">
              <p><strong>Reglas:</strong> {community.rules || 'No se han definido reglas específicas'}</p>
              <p><strong>Tags:</strong> {community.tags?.length ? community.tags.join(', ') : 'No hay tags definidos'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Links and Resources */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Enlaces y Recursos</h2>
        
        <div className="space-y-2">
          {community.website && (
            <p>
              <strong>Sitio web:</strong>{' '}
              <a href={community.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {community.website}
              </a>
            </p>
          )}
          
          {community.socialLinks?.discord && (
            <p>
              <strong>Discord:</strong>{' '}
              <a href={community.socialLinks.discord} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {community.socialLinks.discord}
              </a>
            </p>
          )}
          
          {community.socialLinks?.twitter && (
            <p>
              <strong>Twitter:</strong>{' '}
              <a href={community.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {community.socialLinks.twitter}
              </a>
            </p>
          )}
          
          {!community.website && !community.socialLinks?.discord && !community.socialLinks?.twitter && (
            <p className="text-gray-500">No hay enlaces disponibles para esta comunidad.</p>
          )}
        </div>
      </div>
    </div>
  );
}
