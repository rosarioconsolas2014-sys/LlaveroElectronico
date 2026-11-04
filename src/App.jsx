import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import HomeScreen from './components/HomeScreen.jsx';
import WalletScreen from './components/WalletScreen.jsx';
import IdentifyFobScreen from './components/IdentifyFobScreen.jsx';
import ActivationScreen from './components/ActivationScreen.jsx';
import DiagnosticScreen from './components/DiagnosticScreen.jsx';
import SettingsScreen from './components/SettingsScreen.jsx';
import ExternalReadersScreen from './components/ExternalReadersScreen.jsx';
import NativeCodeModal from './components/NativeCodeModal.jsx';
import SecurityLockOverlay from './components/SecurityLockOverlay.jsx';
import Footer from './components/Footer.jsx';

import { 
  getDeviceDiagnostic, 
  setActiveProfile, 
  getActiveProfileId 
} from './services/deviceDiagnostic.js';
import { 
  getStoredKeys, 
  getActiveKeyId, 
  setActiveKeyId, 
  getDefaultKeyId, 
  setDefaultKeyId, 
  addKey, 
  updateKey, 
  deleteKey,
  subscribeToWallet
} from './services/storageService.js';
import { hasPinConfigured, getSecurityConfig } from './services/cryptoService.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // home, wallet, scan, emulate, diagnostic, settings, external
  const [diagnostic, setDiagnostic] = useState(null);
  const [activeProfileId, setActiveProfileState] = useState(getActiveProfileId());
  const [keys, setKeys] = useState([]);
  const [activeKeyId, setActiveKeyIdState] = useState(getActiveKeyId());
  const [defaultKeyId, setDefaultKeyIdState] = useState(getDefaultKeyId());
  const [isLocked, setIsLocked] = useState(false);
  const [isNativeCodeModalOpen, setIsNativeCodeModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Carga inicial de datos y diagnóstico
  useEffect(() => {
    async function initApp() {
      try {
        const diag = await getDeviceDiagnostic();
        setDiagnostic(diag);

        const loadedKeys = await getStoredKeys();
        setKeys(loadedKeys);
        setActiveKeyIdState(getActiveKeyId());
        setDefaultKeyIdState(getDefaultKeyId());

        const secConfig = getSecurityConfig();
        if (secConfig.pinEnabled && hasPinConfigured()) {
          setIsLocked(true);
        }
      } catch (err) {
        console.error('Error inicializando KeyManager NFC:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initApp();

    // Suscripción reactiva a cambios en la billetera
    const unsubscribe = subscribeToWallet(async () => {
      const updatedKeys = await getStoredKeys();
      setKeys(updatedKeys);
      setActiveKeyIdState(getActiveKeyId());
      setDefaultKeyIdState(getDefaultKeyId());
    });

    return () => unsubscribe();
  }, []);

  // Actualización de diagnóstico
  const handleRefreshDiagnostic = async () => {
    const diag = await getDeviceDiagnostic();
    setDiagnostic(diag);
  };

  const handleChangeProfile = async (profileId) => {
    setActiveProfile(profileId);
    setActiveProfileState(profileId);
    const diag = await getDeviceDiagnostic();
    setDiagnostic(diag);
  };

  // Operaciones de Billetera
  const handleSaveToWallet = async (newKeyData) => {
    const saved = await addKey(newKeyData);
    const updated = await getStoredKeys();
    setKeys(updated);
    setActiveKeyIdState(saved.id);
    return saved;
  };

  const handleUpdateKey = async (id, updates) => {
    await updateKey(id, updates);
    const updated = await getStoredKeys();
    setKeys(updated);
  };

  const handleDeleteKey = async (id) => {
    await deleteKey(id);
    const updated = await getStoredKeys();
    setKeys(updated);
    setActiveKeyIdState(getActiveKeyId());
  };

  const handleSetActiveKey = (id) => {
    setActiveKeyId(id);
    setActiveKeyIdState(id);
  };

  const handleSetDefaultKey = (id) => {
    setDefaultKeyId(id);
    setDefaultKeyIdState(id);
  };

  const activeKey = keys.find((k) => k.id === activeKeyId) || keys[0];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <Header
        diagnostic={diagnostic}
        isLocked={isLocked}
        onToggleLock={() => setIsLocked(!isLocked)}
        onOpenExternalReaders={() => setActiveTab('external')}
        onGoToDiagnostic={() => setActiveTab('diagnostic')}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-20">
        {isLoading ? (
          <div className="h-64 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-cyan-400">Iniciando subsistema NFC & Keystore...</p>
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                keys={keys}
                activeKey={activeKey}
                diagnostic={diagnostic}
                onNavigate={(tab) => setActiveTab(tab)}
                onGoToScan={() => setActiveTab('scan')}
                onGoToEmulate={() => setActiveTab('emulate')}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletScreen
                keys={keys}
                activeKeyId={activeKeyId}
                defaultKeyId={defaultKeyId}
                onSetActiveKey={handleSetActiveKey}
                onSetDefaultKey={handleSetDefaultKey}
                onAddKey={handleSaveToWallet}
                onUpdateKey={handleUpdateKey}
                onDeleteKey={handleDeleteKey}
                onGoToScan={() => setActiveTab('scan')}
                onGoToEmulate={() => setActiveTab('emulate')}
              />
            )}

            {activeTab === 'scan' && (
              <IdentifyFobScreen
                onSaveToWallet={handleSaveToWallet}
                onGoToExternalReaders={() => setActiveTab('external')}
              />
            )}

            {activeTab === 'emulate' && (
              <ActivationScreen
                keys={keys}
                activeKeyId={activeKeyId}
                diagnostic={diagnostic}
                onSetActiveKey={handleSetActiveKey}
                onGoToScan={() => setActiveTab('scan')}
                onGoToExternalReaders={() => setActiveTab('external')}
              />
            )}

            {activeTab === 'diagnostic' && (
              <DiagnosticScreen
                diagnostic={diagnostic}
                activeProfileId={activeProfileId}
                onChangeProfile={handleChangeProfile}
                onRefreshDiagnostic={handleRefreshDiagnostic}
                onGoToExternalReaders={() => setActiveTab('external')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsScreen
                keys={keys}
                onRefreshWallet={async () => {
                  const updated = await getStoredKeys();
                  setKeys(updated);
                }}
                onOpenNativeCodeModal={() => setIsNativeCodeModalOpen(true)}
              />
            )}

            {activeTab === 'external' && (
              <ExternalReadersScreen onSaveToWallet={handleSaveToWallet} />
            )}

            {/* Pie de página moderno CARVI SOFTWARE */}
            <Footer />
          </>
        )}
      </main>

      {/* Persistent Bottom Mobile Navigation Bar */}
      <BottomNav
        activeTab={activeTab === 'external' ? 'home' : activeTab}
        onSelectTab={(tabId) => setActiveTab(tabId)}
      />

      {/* Modal Visor de Código Fuente Nativo Kotlin & Android Studio */}
      {isNativeCodeModalOpen && (
        <NativeCodeModal onClose={() => setIsNativeCodeModalOpen(false)} />
      )}

      {/* Pantalla de Bloqueo por PIN de Seguridad */}
      {isLocked && (
        <SecurityLockOverlay
          onUnlock={() => setIsLocked(false)}
          biometricEnabled={getSecurityConfig().biometricEnabled}
        />
      )}
    </div>
  );
}
