import { useState, useEffect } from 'react';
import { TokenService } from '../services/secureTokenService';

export const useSessionManagement = () => {
  const [sessionState, setSessionState] = useState<'active' | 'expiring' | 'expired'>('active');

  const secureOperation = async (operation: () => Promise<any>) => {
    console.log('🔐 Verificando token para operación segura...');
    
    const isExpired = await TokenService.isAccessTokenExpired();
    if (isExpired) {
      console.log('❌ Token expirado, operación bloqueada');
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }
    
    console.log('✅ Token válido, ejecutando operación segura');
    return await operation();
  };

  return {
    sessionState,
    secureOperation,
  };
};