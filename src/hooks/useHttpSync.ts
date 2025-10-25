import { useState, useEffect, useRef, useCallback } from 'react';
import HttpBasicSyncService from '@/services/httpBasicSyncService';
import { HttpSyncConfig, SyncStatus, SyncLog } from '@/types/httpSync';
import { encryptPassword } from '@/lib/httpSyncHelpers';

export const useHttpSync = () => {
  const [config, setConfig] = useState<HttpSyncConfig | null>(null);
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const syncServiceRef = useRef<HttpBasicSyncService | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Carregar configuração do storage
  useEffect(() => {
    loadConfig();
    loadLogs();
  }, []);
  
  // Atualizar status periodicamente
  useEffect(() => {
    if (syncServiceRef.current) {
      statusIntervalRef.current = setInterval(() => {
        updateStatus();
      }, 1000);
      
      return () => {
        if (statusIntervalRef.current) {
          clearInterval(statusIntervalRef.current);
        }
      };
    }
  }, [syncServiceRef.current]);
  
  const loadConfig = () => {
    try {
      const savedConfig = localStorage.getItem('http_sync_config');
      
      if (savedConfig) {
        const configData = JSON.parse(savedConfig);
        setConfig(configData);
        
        // Inicializar serviço
        syncServiceRef.current = new HttpBasicSyncService(configData);
        syncServiceRef.current.setCallbacks(updateStatus, loadLogs);
        
        // Auto-start se configurado
        if (configData.options?.auto_start) {
          setTimeout(() => startSync(), 500);
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar configuração:', err);
      setError(err.message);
    }
  };
  
  const loadLogs = useCallback(() => {
    try {
      const logs = localStorage.getItem('http_sync_logs');
      if (logs) {
        setSyncLogs(JSON.parse(logs));
      }
    } catch (err) {
      console.error('Erro ao carregar logs:', err);
    }
  }, []);
  
  const updateStatus = useCallback(() => {
    if (syncServiceRef.current) {
      const currentStatus = syncServiceRef.current.getStatus();
      setStatus(currentStatus);
      setIsRunning(currentStatus.isRunning);
      setLastSync(currentStatus.lastSync);
    }
  }, []);
  
  const saveConfig = async (newConfig: HttpSyncConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      // Criptografar senha antes de salvar
      const configToSave = {
        ...newConfig,
        auth: {
          ...newConfig.auth,
          password: encryptPassword(newConfig.auth.password),
        },
      };
      
      localStorage.setItem('http_sync_config', JSON.stringify(configToSave));
      setConfig(configToSave);
      
      // Reinicializar serviço
      if (syncServiceRef.current) {
        syncServiceRef.current.stop();
      }
      
      syncServiceRef.current = new HttpBasicSyncService(configToSave);
      syncServiceRef.current.setCallbacks(updateStatus, loadLogs);
      
      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Erro ao salvar configuração:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };
  
  const testConnection = async (testConfig?: HttpSyncConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      const configToTest = testConfig || config;
      
      if (!configToTest) {
        throw new Error('Configuração não carregada');
      }
      
      const testService = new HttpBasicSyncService(configToTest);
      const response = await testService.makeHttpRequest();
      
      setLoading(false);
      return {
        success: true,
        message: 'Conexão bem-sucedida!',
        data: response,
      };
    } catch (err: any) {
      setLoading(false);
      setError(err.message);
      return {
        success: false,
        message: err.message,
        data: null,
      };
    }
  };
  
  const startSync = async () => {
    try {
      if (!syncServiceRef.current) {
        throw new Error('Serviço de sincronização não inicializado');
      }
      
      syncServiceRef.current.start();
      setIsRunning(true);
      updateStatus();
      
      return true;
    } catch (err: any) {
      console.error('Erro ao iniciar sincronização:', err);
      setError(err.message);
      return false;
    }
  };
  
  const stopSync = () => {
    try {
      if (syncServiceRef.current) {
        syncServiceRef.current.stop();
        setIsRunning(false);
        updateStatus();
      }
      return true;
    } catch (err: any) {
      console.error('Erro ao parar sincronização:', err);
      setError(err.message);
      return false;
    }
  };
  
  const syncNow = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!syncServiceRef.current) {
        throw new Error('Serviço de sincronização não inicializado');
      }
      
      const result = await syncServiceRef.current.syncNow();
      
      // Recarregar logs
      loadLogs();
      
      setLoading(false);
      updateStatus();
      
      return result;
    } catch (err: any) {
      console.error('Erro na sincronização manual:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };
  
  const changeInterval = (newIntervalMs: number) => {
    try {
      if (syncServiceRef.current) {
        syncServiceRef.current.changeInterval(newIntervalMs);
        
        // Atualizar config
        if (config) {
          const updatedConfig = {
            ...config,
            sync_interval: newIntervalMs,
          };
          saveConfig(updatedConfig);
        }
        
        updateStatus();
      }
    } catch (err: any) {
      console.error('Erro ao alterar intervalo:', err);
      setError(err.message);
    }
  };
  
  const getLogDetails = (syncId: string): SyncLog | null => {
    return syncLogs.find(log => log.sync_id === syncId) || null;
  };
  
  const deleteConfig = () => {
    try {
      if (syncServiceRef.current) {
        syncServiceRef.current.stop();
        syncServiceRef.current = null;
      }
      
      localStorage.removeItem('http_sync_config');
      
      setConfig(null);
      setStatus(null);
      setIsRunning(false);
      
      return true;
    } catch (err: any) {
      console.error('Erro ao deletar configuração:', err);
      setError(err.message);
      return false;
    }
  };
  
  return {
    config,
    status,
    isRunning,
    lastSync,
    syncLogs,
    loading,
    error,
    saveConfig,
    testConnection,
    startSync,
    stopSync,
    syncNow,
    changeInterval,
    getLogDetails,
    deleteConfig,
    loadLogs,
  };
};
