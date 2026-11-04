import React, { useState } from 'react';
import { 
  WalletCards, 
  Plus, 
  Search, 
  Star, 
  Zap, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers,
  Lock,
  Eye,
  EyeOff,
  Filter,
  Radio,
  Save,
  X
} from 'lucide-react';
import FobIcon from './FobIcon.jsx';

export default function WalletScreen({
  keys = [],
  activeKeyId,
  defaultKeyId,
  onSetActiveKey,
  onSetDefaultKey,
  onAddKey,
  onUpdateKey,
  onDeleteKey,
  onGoToScan,
  onGoToEmulate
}) {
  const [filterType, setFilterType] = useState('ALL'); // ALL, HCE, 13_56, 125
  const [searchQuery, setSearchQuery] = useState('');
  const [showMaskedUID, setShowMaskedUID] = useState(false);

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [deletingKey, setDeletingKey] = useState(null);

  // Formulario de nueva llave
  const [newKeyForm, setNewKeyForm] = useState({
    name: '',
    description: '',
    frequency: '13.56_MHZ',
    protocolId: 'ISO_DEP_DIGITAL',
    identifier: '',
    canEmulateHCE: true,
    colorTheme: 'cyan',
    iconType: 'card'
  });

  // Filtrado reactivo
  const filteredKeys = keys.filter((k) => {
    const matchesSearch =
      k.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.identifier.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'HCE') return k.canEmulateHCE;
    if (filterType === '13_56') return k.frequency === '13.56_MHZ';
    if (filterType === '125') return k.frequency === '125_KHZ';
    return true;
  });

  const handleCreateKey = async () => {
    if (!newKeyForm.name.trim()) return;

    await onAddKey({
      name: newKeyForm.name,
      description: newKeyForm.description || 'Llavero digital registrado',
      frequency: newKeyForm.frequency,
      protocolId: newKeyForm.protocolId,
      protocolName: newKeyForm.protocolId === 'ISO_DEP_DIGITAL' ? 'Credencial Digital ISO-DEP' : 'MIFARE Classic / 125kHz',
      identifier: newKeyForm.identifier || '04:77:88:99',
      canEmulateHCE: newKeyForm.canEmulateHCE,
      colorTheme: newKeyForm.colorTheme,
      iconType: newKeyForm.iconType,
      compatibilityLabel: newKeyForm.canEmulateHCE ? '100% Emulable con Android HCE' : 'Solo Lectura / No Emulable'
    });

    setIsAddModalOpen(false);
    setNewKeyForm({
      name: '',
      description: '',
      frequency: '13.56_MHZ',
      protocolId: 'ISO_DEP_DIGITAL',
      identifier: '',
      canEmulateHCE: true,
      colorTheme: 'cyan',
      iconType: 'card'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingKey) return;
    await onUpdateKey(editingKey.id, {
      name: editingKey.name,
      description: editingKey.description,
      colorTheme: editingKey.colorTheme,
      iconType: editingKey.iconType
    });
    setEditingKey(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingKey) return;
    await onDeleteKey(deletingKey.id);
    setDeletingKey(null);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Encabezado y Botón Agregar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <WalletCards className="w-6 h-6 text-cyan-400" />
            Billetera de Llaves
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {keys.length} credenciales almacenadas con cifrado local AES-256
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 hover:opacity-95 transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros Rápidos */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, portón, edificio o UID..."
            className="w-full bg-gray-950 border border-gray-800 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Pestañas de Filtro */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <div className="flex gap-1.5">
            {[
              { id: 'ALL', label: 'Todas' },
              { id: 'HCE', label: '⚡ Emulables HCE' },
              { id: '13_56', label: '13,56 MHz (NFC)' },
              { id: '125', label: '125 kHz (Pastillas)' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1 rounded-xl font-medium transition whitespace-nowrap ${
                  filterType === tab.id
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/50'
                    : 'bg-gray-900/60 text-gray-400 border border-gray-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowMaskedUID(!showMaskedUID)}
            title="Ocultar o mostrar UIDs para privacidad"
            className="p-1.5 rounded-lg bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
          >
            {showMaskedUID ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* LISTADO DE TARJETAS Y LLAVEROS */}
      {filteredKeys.length === 0 ? (
        <div className="p-8 rounded-3xl bg-gray-950/60 border border-dashed border-gray-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gray-900 flex items-center justify-center mx-auto text-gray-400">
            <WalletCards className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-300">No hay llaves en esta categoría</p>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Puedes escanear un llavero físico con el teléfono o crear un registro manual.
          </p>
          <button
            onClick={onGoToScan}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-semibold hover:bg-cyan-500/30 transition"
          >
            Escanear con IDENTIFICAR LLAVERO
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredKeys.map((key) => {
            const isActive = activeKeyId === key.id;
            const isDefault = defaultKeyId === key.id;
            const is125 = key.frequency === '125_KHZ';

            // Estilos según tema
            const themeBorders = {
              cyan: 'border-cyan-500/30 hover:border-cyan-400/60',
              blue: 'border-blue-500/30 hover:border-blue-400/60',
              purple: 'border-purple-500/30 hover:border-purple-400/60',
              amber: 'border-amber-500/30 hover:border-amber-400/60',
              emerald: 'border-emerald-500/30 hover:border-emerald-400/60'
            };

            return (
              <div
                key={key.id}
                className={`relative rounded-3xl p-5 border transition-all duration-200 bg-gradient-to-br from-gray-950 via-gray-900/90 to-gray-950 ${
                  isActive
                    ? 'ring-2 ring-cyan-400 shadow-xl shadow-cyan-500/10 border-cyan-400'
                    : themeBorders[key.colorTheme] || 'border-gray-800'
                }`}
              >
                {/* Header de la Tarjeta */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                        key.canEmulateHCE
                          ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                          : is125
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      <FobIcon type={key.iconType} frequency={key.frequency} className="w-5 h-5" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-tight">{key.name}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400 text-black shadow-sm shadow-cyan-400/50">
                            ACTIVA
                          </span>
                        )}
                        {isDefault && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            PREDET.
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{key.description}</p>
                    </div>
                  </div>

                  {/* Acciones Rápidas (Editar / Eliminar) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingKey({ ...key })}
                      title="Editar credencial"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingKey(key)}
                      title="Eliminar credencial"
                      className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Datos Técnicos */}
                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-b border-gray-800/80 mb-3">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-mono block">Frecuencia / Chip</span>
                    <span className="font-semibold text-gray-200 block truncate">
                      {key.frequencyLabel} • {key.protocolName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-mono block">Identificador</span>
                    <span className="font-mono font-semibold text-cyan-400 block truncate">
                      {showMaskedUID
                        ? key.identifier.substring(0, 6) + '••:••:••'
                        : key.identifier}
                    </span>
                  </div>
                </div>

                {/* Compatibilidad & Distinción Crítica (Anti-Confusión) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {key.canEmulateHCE ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        100% Emulable con Android HCE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {is125 ? 'Requiere Lector Externo (125 kHz)' : 'Solo Lectura (No Emulable)'}
                      </span>
                    )}
                  </div>

                  {/* Botones de Selección */}
                  <div className="flex items-center gap-2">
                    {!isDefault && (
                      <button
                        onClick={() => onSetDefaultKey(key.id)}
                        className="px-2.5 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-[11px] font-medium text-gray-400 hover:text-yellow-400 hover:border-yellow-500/40 transition flex items-center gap-1"
                      >
                        <Star className="w-3 h-3" />
                        <span>Hacer Predet.</span>
                      </button>
                    )}

                    {key.canEmulateHCE ? (
                      <button
                        onClick={() => {
                          onSetActiveKey(key.id);
                          onGoToEmulate();
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-cyan-400 text-black shadow-lg shadow-cyan-400/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" />
                        <span>{isActive ? 'Transmitir' : 'Elegir'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSetActiveKey(key.id)}
                        className="px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white text-xs font-medium"
                      >
                        Seleccionar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL AGREGAR LLAVE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-gray-950 border border-gray-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Registrar Nueva Credencial
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Nombre</label>
                <input
                  type="text"
                  value={newKeyForm.name}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, name: e.target.value })}
                  placeholder="Ej: Portón Garaje, Trabajo, Gimnasio"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Descripción</label>
                <input
                  type="text"
                  value={newKeyForm.description}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, description: e.target.value })}
                  placeholder="Ubicación o datos de acceso"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Tecnología / Frecuencia</label>
                <select
                  value={newKeyForm.frequency}
                  onChange={(e) => {
                    const freq = e.target.value;
                    const is125 = freq === '125_KHZ';
                    setNewKeyForm({
                      ...newKeyForm,
                      frequency: freq,
                      canEmulateHCE: !is125,
                      iconType: is125 ? 'fob_pill' : 'card',
                      colorTheme: is125 ? 'amber' : 'cyan'
                    });
                  }}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="13.56_MHZ">13,56 MHz (NFC Alta Frecuencia - Digital)</option>
                  <option value="125_KHZ">125 kHz (RFID Baja Frecuencia - Pastilla de Edificio)</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Identificador / UID</label>
                <input
                  type="text"
                  value={newKeyForm.identifier}
                  onChange={(e) => setNewKeyForm({ ...newKeyForm, identifier: e.target.value })}
                  placeholder="Ej: 04:A2:8F:C1 o AID"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Icono Representativo</label>
                <div className="grid grid-cols-4 gap-2">
                  {['fob_pill', 'fob_round', 'card', 'key'].map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setNewKeyForm({ ...newKeyForm, iconType: ic })}
                      className={`p-2 rounded-xl border text-center transition flex justify-center ${
                        newKeyForm.iconType === ic
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                          : 'bg-gray-900 border-gray-800 text-gray-400'
                      }`}
                    >
                      <FobIcon type={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-900 text-gray-300 text-xs font-semibold hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateKey}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider"
              >
                Guardar Llave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR LLAVE */}
      {editingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl bg-gray-950 border border-gray-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                Editar Llavero
              </h3>
              <button onClick={() => setEditingKey(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Nombre</label>
                <input
                  type="text"
                  value={editingKey.name}
                  onChange={(e) => setEditingKey({ ...editingKey, name: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Descripción</label>
                <input
                  type="text"
                  value={editingKey.description}
                  onChange={(e) => setEditingKey({ ...editingKey, description: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Color de Tarjeta</label>
                <div className="flex gap-2">
                  {['cyan', 'blue', 'purple', 'amber', 'emerald'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditingKey({ ...editingKey, colorTheme: c })}
                      className={`w-7 h-7 rounded-full bg-${c === 'cyan' ? 'cyan-500' : c === 'blue' ? 'blue-600' : c === 'purple' ? 'purple-600' : c === 'amber' ? 'amber-500' : 'emerald-600'} ${
                        editingKey.colorTheme === c ? 'ring-2 ring-white scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingKey(null)}
                className="flex-1 py-2 rounded-xl bg-gray-900 text-gray-300 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex-1 py-2 rounded-xl bg-cyan-400 text-black font-bold text-xs uppercase"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMACIÓN DE ELIMINACIÓN (Requerimiento 9: Confirmación de Seguridad) */}
      {deletingKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-gray-950 border border-rose-500/40 p-5 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-white">¿Eliminar Credencial?</h3>
              <p className="text-xs text-gray-300">
                Estás a punto de borrar definitivamente <strong className="text-white">"{deletingKey.name}"</strong> de la bóveda local cifrada.
              </p>
              <p className="text-[11px] text-rose-300/90 font-mono mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingKey(null)}
                className="flex-1 py-2.5 rounded-xl bg-gray-900 text-gray-300 text-xs font-semibold hover:bg-gray-800"
              >
                Conservar Llave
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-500 shadow-lg shadow-rose-600/30"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
