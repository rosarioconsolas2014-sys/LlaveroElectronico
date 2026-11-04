import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  ScanLine, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ShieldAlert, 
  PlusCircle, 
  RefreshCw, 
  ArrowRight, 
  Info,
  Sparkles,
  Sliders,
  ExternalLink,
  Save,
  Check
} from 'lucide-react';
import { 
  TEST_BENCH_TAGS, 
  analyzeRawNfcTag, 
  startFobIdentification, 
  cancelFobIdentification 
} from '../services/nfcScanner.js';
import FobIcon from './FobIcon.jsx';

export default function IdentifyFobScreen({ onSaveToWallet, onGoToExternalReaders }) {
  const [scanState, setScanState] = useState('IDLE'); // IDLE, SCANNING, ANALYZING, RESULT, ERROR
  const [currentResult, setCurrentResult] = useState(null);
  const [selectedTestTagId, setSelectedTestTagId] = useState('');
  const [manualUid, setManualUid] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // Formulario de guardado en la billetera
  const [saveFormData, setSaveFormData] = useState({
    name: '',
    description: '',
    iconType: 'fob_pill',
    colorTheme: 'blue'
  });

  // Iniciar escaneo
  const handleStartScan = () => {
    setScanState('SCANNING');
    setCurrentResult(null);
    setIsSavedFeedback(false);

    // Intentar Web NFC o simular detección tras 2 segundos si el usuario no apoya una tarjeta
    startFobIdentification(
      (progress) => {
        if (progress.stage === 'ANALYZING_PROTOCOL') {
          setScanState('ANALYZING');
        }
      },
      (result) => {
        setCurrentResult(result);
        setScanState('RESULT');
      },
      (error) => {
        setScanState('ERROR');
      }
    );
  };

  const handleCancelScan = () => {
    cancelFobIdentification();
    setScanState('IDLE');
  };

  // Probar una pastilla / tag específico del banco de pruebas
  const handleSelectTestTag = (tag) => {
    setSelectedTestTagId(tag.id);
    setScanState('ANALYZING');
    setIsSavedFeedback(false);

    if (navigator.vibrate) navigator.vibrate([30, 50, 30]);

    setTimeout(() => {
      const analyzed = analyzeRawNfcTag(tag);
      setCurrentResult(analyzed);
      setScanState('RESULT');
      setSaveFormData({
        name: tag.name,
        description: tag.description,
        iconType: tag.rawFrequency === '125_KHZ' ? 'fob_pill' : (tag.protocol === 'ISO_DEP_DIGITAL' ? 'card' : 'fob_round'),
        colorTheme: tag.rawFrequency === '125_KHZ' ? 'amber' : (tag.protocol === 'ISO_DEP_DIGITAL' ? 'cyan' : 'blue')
      });
    }, 700);
  };

  // Abrir modal de guardado
  const handleOpenSaveModal = () => {
    if (!currentResult) return;
    setSaveFormData({
      name: saveFormData.name || currentResult.rawTag?.name || 'Mi Llavero Identificado',
      description: saveFormData.description || `Llavero ${currentResult.protocol?.name}`,
      iconType: currentResult.is125kHz ? 'fob_pill' : (currentResult.canEmulateHCE ? 'card' : 'fob_round'),
      colorTheme: currentResult.is125kHz ? 'amber' : (currentResult.canEmulateHCE ? 'cyan' : 'blue')
    });
    setShowSaveModal(true);
  };

  // Confirmar guardado en la billetera
  const handleConfirmSave = async () => {
    if (!currentResult) return;

    await onSaveToWallet({
      name: saveFormData.name || 'Llavero Identificado',
      description: saveFormData.description || 'Llavero escaneado con KeyManager NFC',
      technologyType: currentResult.classification.category,
      protocolId: currentResult.protocol?.id || 'DESCONOCIDO',
      protocolName: currentResult.protocol?.name || 'Protocolo Estándar',
      frequency: currentResult.is125kHz ? '125_KHZ' : '13.56_MHZ',
      identifier: currentResult.uid,
      wiegandId: currentResult.rawTag?.wiegandId || null,
      tokenData: currentResult.canEmulateHCE ? `KM-AUTH-${currentResult.uid.replace(/[^A-F0-9]/g, '')}` : null,
      compatibilityStatus: currentResult.canEmulateHCE 
        ? 'HCE_COMPATIBLE' 
        : (currentResult.is125kHz ? 'REQUIRES_EXTERNAL_READER' : 'NFC_READ_ONLY'),
      compatibilityLabel: currentResult.classification.title,
      canEmulateHCE: currentResult.canEmulateHCE,
      iconType: saveFormData.iconType,
      colorTheme: saveFormData.colorTheme,
      securityNotes: currentResult.emulationVerdict.explanation
    });

    setShowSaveModal(false);
    setIsSavedFeedback(true);
  };

  return (
    <div className="space-y-6 pb-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ScanLine className="w-6 h-6 text-cyan-400" />
          Identificar Llavero
        </h2>
        <p className="text-xs text-gray-400 mt-0.5">
          Diagnóstico de frecuencia, protocolo y compatibilidad de emulación
        </p>
      </div>

      {/* ÁREA DE ESCANEO / RADAR INTERACTIVO */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 border border-gray-800 p-6 flex flex-col items-center justify-center text-center">
        {/* Radar Rings Effect */}
        <div className="relative my-4 flex items-center justify-center w-52 h-52">
          {/* Circunferencias concéntricas */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/10"></div>
          <div className="absolute inset-4 rounded-full border border-cyan-500/20"></div>
          <div className="absolute inset-10 rounded-full border border-cyan-500/30"></div>
          
          {/* Animación activa durante el escaneo */}
          {scanState === 'SCANNING' && (
            <>
              <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-75"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-cyan-500/10 to-cyan-400/20 radar-sweep"></div>
            </>
          )}

          {scanState === 'ANALYZING' && (
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-400 animate-spin"></div>
          )}

          {/* Icono central de pastilla / antena */}
          <div
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl ${
              scanState === 'SCANNING'
                ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400 shadow-cyan-500/40 scale-105'
                : scanState === 'ANALYZING'
                ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-400 animate-pulse'
                : scanState === 'RESULT'
                ? currentResult?.is125kHz
                  ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-400'
                  : currentResult?.canEmulateHCE
                  ? 'bg-cyan-500/20 text-cyan-300 border-2 border-cyan-400'
                  : 'bg-purple-500/20 text-purple-300 border-2 border-purple-400'
                : 'bg-gray-900 text-gray-400 border border-gray-800'
            }`}
          >
            {scanState === 'RESULT' ? (
              <FobIcon
                type={currentResult?.is125kHz ? 'fob_pill' : (currentResult?.canEmulateHCE ? 'card' : 'fob_round')}
                className="w-10 h-10"
              />
            ) : (
              <Radio className={`w-10 h-10 stroke-[2] ${scanState === 'SCANNING' ? 'animate-pulse' : ''}`} />
            )}
            <span className="text-[10px] font-mono font-bold mt-1 uppercase">
              {scanState === 'SCANNING'
                ? 'Buscando'
                : scanState === 'ANALYZING'
                ? 'Analizando'
                : scanState === 'RESULT'
                ? currentResult?.frequency?.shortName
                : 'NFC 13.56'}
            </span>
          </div>
        </div>

        {/* Indicaciones paso a paso */}
        <div className="space-y-1.5 max-w-sm mb-4">
          <h3 className="text-base font-bold text-white">
            {scanState === 'IDLE' && '1. Acerca el llavero al teléfono'}
            {scanState === 'SCANNING' && 'Detectando campo magnético...'}
            {scanState === 'ANALYZING' && 'Identificando tecnología y protocolo...'}
            {scanState === 'RESULT' && 'Diagnóstico Completado'}
            {scanState === 'ERROR' && 'No se pudo leer la credencial'}
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            {scanState === 'IDLE' &&
              'Apoya el llavero o pastilla contra la parte trasera del teléfono (zona superior o central cerca de la cámara).'}
            {scanState === 'SCANNING' &&
              'Mantén el llavero firme sin moverlo. Esperando modulación electromagnética...'}
            {scanState === 'ANALYZING' &&
              'Extrayendo UID, ATQA, SAK y evaluando cifrado de seguridad...'}
            {scanState === 'RESULT' &&
              'Revisa la frecuencia detectada y la compatibilidad con el sistema de emulación.'}
            {scanState === 'ERROR' &&
              'Asegúrate de que el NFC esté encendido y que el llavero no esté blindado con aluminio.'}
          </p>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {scanState === 'IDLE' && (
            <button
              onClick={handleStartScan}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 hover:opacity-95 transition active:scale-95 flex items-center gap-2"
            >
              <Radio className="w-4 h-4 text-black stroke-[2.5]" />
              Iniciar Identificación
            </button>
          )}

          {scanState === 'SCANNING' && (
            <button
              onClick={handleCancelScan}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 text-xs font-semibold hover:text-white transition"
            >
              Cancelar
            </button>
          )}

          {scanState === 'RESULT' && (
            <>
              <button
                onClick={handleStartScan}
                className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-300 text-xs font-semibold hover:text-cyan-400 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Escanear Otro
              </button>

              <button
                onClick={handleOpenSaveModal}
                disabled={isSavedFeedback}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 ${
                  isSavedFeedback
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
                }`}
              >
                {isSavedFeedback ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    Guardado en Billetera
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar en Billetera
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* RESULTADO DETALLADO DEL DIAGNÓSTICO (Requerimiento 3) */}
      {currentResult && scanState === 'RESULT' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Clasificación Principal de la Credencial */}
          <div
            className={`p-4 rounded-2xl border ${
              currentResult.classification.badgeColor === 'cyan'
                ? 'bg-cyan-950/30 border-cyan-500/40'
                : currentResult.classification.badgeColor === 'amber'
                ? 'bg-amber-950/30 border-amber-500/40'
                : currentResult.classification.badgeColor === 'purple'
                ? 'bg-purple-950/30 border-purple-500/40'
                : 'bg-blue-950/30 border-blue-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-black/40 border border-white/10 text-gray-300">
                    Clasificación Técnica
                  </span>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full font-mono ${
                      currentResult.is125kHz
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    }`}
                  >
                    {currentResult.frequency?.shortName}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">
                  {currentResult.classification.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {currentResult.classification.advice}
                </p>
              </div>
            </div>
          </div>

          {/* Ficha Técnica Detallada */}
          <div className="p-5 rounded-2xl bg-gray-950/90 border border-gray-800 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Ficha Técnica del Llavero
            </h4>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[11px] text-gray-400 block">Identificador (UID)</span>
                <span className="font-mono font-bold text-cyan-400 mt-0.5 block break-all">
                  {currentResult.uid}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[11px] text-gray-400 block">Protocolo IC</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {currentResult.protocol?.name || 'Estándar'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[11px] text-gray-400 block">Norma Internacional</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {currentResult.protocol?.standard || 'ISO/IEC'}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-gray-900/60 border border-gray-800">
                <span className="text-[11px] text-gray-400 block">Cifrado / Protección</span>
                <span className="font-semibold text-white mt-0.5 block truncate">
                  {currentResult.protocol?.encryption || 'Ninguno'}
                </span>
              </div>
            </div>

            {/* Veredicto de Emulación HCE (Honesto, sin falsas promesas) */}
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs ${
                currentResult.canEmulateHCE
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
              }`}
            >
              {currentResult.canEmulateHCE ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-0.5">
                <span className="font-bold block text-white">
                  {currentResult.emulationVerdict.title}
                </span>
                <p className="text-gray-300 leading-relaxed text-[11px]">
                  {currentResult.emulationVerdict.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BANCO DE PRUEBAS DE LABORATORIO (Llaveros Reales para Probar en Cualquier Dispositivo) */}
      <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-gray-200">
              Banco de Pruebas: Llaveros Reales Frecuentes
            </h4>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">Simulador RF</span>
        </div>
        <p className="text-xs text-gray-400">
          Selecciona un tipo de llavero común para diagnosticar inmediatamente cómo lo clasifica el sistema:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {TEST_BENCH_TAGS.map((tag) => {
            const isSelected = selectedTestTagId === tag.id;
            const is125 = tag.rawFrequency === '125_KHZ';
            return (
              <button
                key={tag.id}
                onClick={() => handleSelectTestTag(tag)}
                className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-400 text-white'
                    : 'bg-gray-900/60 border-gray-800 text-gray-300 hover:border-gray-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      is125 ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    <FobIcon type={is125 ? 'fob_pill' : 'fob_round'} className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold block line-clamp-1">{tag.name}</span>
                    <span className="text-[10px] font-mono text-gray-400">{tag.protocol}</span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    is125
                      ? 'bg-amber-950 text-amber-400 border border-amber-800/40'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800/40'
                  }`}
                >
                  {is125 ? '125 kHz' : '13.56 MHz'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MODAL PARA GUARDAR EN LA BILLETERA */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-gray-950 border border-gray-800 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Save className="w-4 h-4 text-cyan-400" />
                Guardar en Billetera
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="text-gray-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold block mb-1">Nombre Personalizado</label>
                <input
                  type="text"
                  value={saveFormData.name}
                  onChange={(e) => setSaveFormData({ ...saveFormData, name: e.target.value })}
                  placeholder="Ej: Portón de mi Casa, Oficina, Gimnasio"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Descripción / Ubicación</label>
                <input
                  type="text"
                  value={saveFormData.description}
                  onChange={(e) => setSaveFormData({ ...saveFormData, description: e.target.value })}
                  placeholder="Detalles sobre el acceso o puerta"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Tipo de Icono</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'fob_pill', label: 'Pastilla' },
                    { id: 'fob_round', label: 'Llavero' },
                    { id: 'card', label: 'Tarjeta' },
                    { id: 'key', label: 'Llave' }
                  ].map((ic) => (
                    <button
                      key={ic.id}
                      type="button"
                      onClick={() => setSaveFormData({ ...saveFormData, iconType: ic.id })}
                      className={`p-2 rounded-xl border text-center transition flex flex-col items-center gap-1 ${
                        saveFormData.iconType === ic.id
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                          : 'bg-gray-900/60 border-gray-800 text-gray-400'
                      }`}
                    >
                      <FobIcon type={ic.id} className="w-4 h-4" />
                      <span className="text-[10px]">{ic.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-gray-300 font-semibold block mb-1">Color de Tarjeta</label>
                <div className="flex gap-2">
                  {[
                    { id: 'blue', bg: 'bg-blue-600' },
                    { id: 'cyan', bg: 'bg-cyan-500' },
                    { id: 'purple', bg: 'bg-purple-600' },
                    { id: 'amber', bg: 'bg-amber-500' },
                    { id: 'emerald', bg: 'bg-emerald-600' }
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSaveFormData({ ...saveFormData, colorTheme: c.id })}
                      className={`w-7 h-7 rounded-full ${c.bg} transition ${
                        saveFormData.colorTheme === c.id ? 'ring-2 ring-white scale-110' : 'opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSaveModal(false)}
                className="flex-1 py-2 rounded-xl bg-gray-900 text-gray-300 font-semibold text-xs hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
