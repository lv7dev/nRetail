import { describe, it, expect, beforeEach } from 'vitest';
import { storage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAccessToken', () => {
    it('returns null when absent', () => {
      expect(storage.getAccessToken()).toBeNull();
    });

    it('returns the stored access token', () => {
      localStorage.setItem('accessToken', 'test-access');
      expect(storage.getAccessToken()).toBe('test-access');
    });
  });

  describe('getRefreshToken', () => {
    it('returns null when absent', () => {
      expect(storage.getRefreshToken()).toBeNull();
    });

    it('returns the stored refresh token', () => {
      localStorage.setItem('refreshToken', 'test-refresh');
      expect(storage.getRefreshToken()).toBe('test-refresh');
    });
  });

  describe('setTokens', () => {
    it('writes both keys to localStorage', () => {
      storage.setTokens('acc-token', 'ref-token');
      expect(localStorage.getItem('accessToken')).toBe('acc-token');
      expect(localStorage.getItem('refreshToken')).toBe('ref-token');
    });
  });

  describe('clearTokens', () => {
    it('removes both tokens', () => {
      storage.setTokens('acc', 'ref');
      storage.clearTokens();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
    });
  });
});
