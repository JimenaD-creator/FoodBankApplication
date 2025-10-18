import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_CONFIG = {
  accessTokenExpiry: 15 * 60 * 1000, // 15 minutos
  refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 días
};

// Detectar si Keychain está disponible
const isKeychainAvailable = async (): Promise<boolean> => {
  try {
    await Keychain.getGenericPassword();
    return true;
  } catch (error) {
    console.log('Keychain no disponible, usando AsyncStorage como fallback');
    return false;
  }
};

export const TokenService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      const timestamp = Date.now();
      const tokenData = {
        accessToken,
        refreshToken,
        accessTokenExpiry: timestamp + TOKEN_CONFIG.accessTokenExpiry,
        refreshTokenExpiry: timestamp + TOKEN_CONFIG.refreshTokenExpiry,
      };

      if (await isKeychainAvailable()) {
        await Keychain.setGenericPassword('auth_tokens', JSON.stringify(tokenData));
        console.log('✅ Tokens guardados en Keychain');
      } else {
        // Fallback a AsyncStorage
        await AsyncStorage.setItem('secure_auth_tokens', JSON.stringify(tokenData));
        console.log('✅ Tokens guardados en AsyncStorage (fallback)');
      }
    } catch (error) {
      console.error('Error guardando tokens:', error);
      throw error;
    }
  },

  async getTokens(): Promise<any> {
    try {
      if (await isKeychainAvailable()) {
        const credentials = await Keychain.getGenericPassword();
        return credentials ? JSON.parse(credentials.password) : null;
      } else {
        // Fallback a AsyncStorage
        const tokens = await AsyncStorage.getItem('secure_auth_tokens');
        return tokens ? JSON.parse(tokens) : null;
      }
    } catch (error) {
      console.error('Error obteniendo tokens:', error);
      return null;
    }
  },

  async isAccessTokenExpired(): Promise<boolean> {
    try {
      const tokens = await this.getTokens();
      if (!tokens || !tokens.accessTokenExpiry) return true;
      
      const isExpired = Date.now() >= tokens.accessTokenExpiry;
      console.log(`🔐 Token expirado: ${isExpired}`);
      return isExpired;
    } catch (error) {
      console.error('Error verificando expiración:', error);
      return true;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      if (await isKeychainAvailable()) {
        await Keychain.resetGenericPassword();
      }
      await AsyncStorage.removeItem('secure_auth_tokens');
      console.log('✅ Tokens eliminados correctamente');
    } catch (error) {
      console.error('Error limpiando tokens:', error);
    }
  },
};
