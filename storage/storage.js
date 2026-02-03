/**
 * TRS-80 CoCo BASIC Program Storage
 *
 * Handles saving and loading BASIC programs with:
 * - Local storage (browser localStorage)
 * - Google Drive (with OAuth)
 */

class ProgramStorage {
  constructor() {
    this.localStorageKey = 'coco-basic-programs';
    this.googleUser = null;
    this.googleAccessToken = null;
    this.onAuthChange = null;
  }

  // ============================================================================
  // LOCAL STORAGE
  // ============================================================================

  /**
   * Get all locally saved programs
   */
  getLocalPrograms() {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Error reading local programs:', e);
      return {};
    }
  }

  /**
   * Save a program to local storage
   */
  saveLocal(name, code) {
    if (!name || typeof name !== 'string') {
      throw new Error('Invalid program name');
    }
    if (name.length > 64) {
      throw new Error('Program name too long (max 64 characters)');
    }

    const programs = this.getLocalPrograms();
    programs[name] = {
      code,
      savedAt: new Date().toISOString(),
      size: code.length
    };

    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(programs));
      return true;
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        throw new Error('Local storage full');
      }
      throw e;
    }
  }

  /**
   * Load a program from local storage
   */
  loadLocal(name) {
    const programs = this.getLocalPrograms();
    const program = programs[name];
    if (!program) {
      throw new Error('Program not found');
    }
    return program.code;
  }

  /**
   * Delete a program from local storage
   */
  deleteLocal(name) {
    const programs = this.getLocalPrograms();
    if (!programs[name]) {
      throw new Error('Program not found');
    }
    delete programs[name];
    localStorage.setItem(this.localStorageKey, JSON.stringify(programs));
    return true;
  }

  /**
   * List all local programs
   */
  listLocal() {
    const programs = this.getLocalPrograms();
    return Object.entries(programs).map(([name, data]) => ({
      name,
      savedAt: data.savedAt,
      size: data.size,
      source: 'local'
    }));
  }

  // ============================================================================
  // GOOGLE DRIVE INTEGRATION
  // ============================================================================

  /**
   * Initialize Google Sign-In
   * @param {string} clientId - Google OAuth Client ID
   */
  async initGoogle(clientId) {
    if (!clientId) {
      console.warn('No Google Client ID provided');
      return false;
    }

    return new Promise((resolve) => {
      // Load Google Identity Services
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        this.googleClientId = clientId;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle() {
    if (!this.googleClientId) {
      throw new Error('Google Sign-In not initialized');
    }

    return new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.googleClientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response) => {
          if (response.error) {
            reject(new Error(response.error));
            return;
          }
          this.googleAccessToken = response.access_token;
          this.fetchGoogleUserInfo().then(user => {
            this.googleUser = user;
            if (this.onAuthChange) this.onAuthChange(user);
            resolve(user);
          }).catch(reject);
        }
      });
      tokenClient.requestAccessToken();
    });
  }

  /**
   * Sign out from Google
   */
  signOutFromGoogle() {
    if (this.googleAccessToken) {
      google.accounts.oauth2.revoke(this.googleAccessToken);
    }
    this.googleAccessToken = null;
    this.googleUser = null;
    if (this.onAuthChange) this.onAuthChange(null);
  }

  /**
   * Check if signed in to Google
   */
  isSignedIn() {
    return !!this.googleAccessToken;
  }

  /**
   * Get current Google user
   */
  getGoogleUser() {
    return this.googleUser;
  }

  /**
   * Fetch Google user info
   */
  async fetchGoogleUserInfo() {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${this.googleAccessToken}` }
    });
    if (!response.ok) throw new Error('Failed to get user info');
    return response.json();
  }

  /**
   * Save a program to Google Drive
   */
  async saveToGoogleDrive(name, code) {
    if (!this.googleAccessToken) {
      throw new Error('Not signed in to Google');
    }

    const fileName = `${name}.bas`;
    const metadata = {
      name: fileName,
      mimeType: 'text/plain',
      parents: ['appDataFolder'] // Save to app-specific folder
    };

    // Check if file already exists
    const existingFile = await this.findGoogleDriveFile(fileName);

    if (existingFile) {
      // Update existing file
      const response = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${this.googleAccessToken}`,
            'Content-Type': 'text/plain'
          },
          body: code
        }
      );
      if (!response.ok) throw new Error('Failed to update file on Google Drive');
      return response.json();
    } else {
      // Create new file
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([code], { type: 'text/plain' }));

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.googleAccessToken}` },
          body: form
        }
      );
      if (!response.ok) throw new Error('Failed to save to Google Drive');
      return response.json();
    }
  }

  /**
   * Find a file on Google Drive by name
   */
  async findGoogleDriveFile(fileName) {
    const query = encodeURIComponent(`name='${fileName}' and trashed=false`);
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}`,
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  }

  /**
   * Load a program from Google Drive
   */
  async loadFromGoogleDrive(fileId) {
    if (!this.googleAccessToken) {
      throw new Error('Not signed in to Google');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) throw new Error('Failed to load from Google Drive');
    return response.text();
  }

  /**
   * Delete a program from Google Drive
   */
  async deleteFromGoogleDrive(fileId) {
    if (!this.googleAccessToken) {
      throw new Error('Not signed in to Google');
    }

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${this.googleAccessToken}` }
      }
    );
    if (!response.ok) throw new Error('Failed to delete from Google Drive');
    return true;
  }

  /**
   * List all programs on Google Drive
   */
  async listGoogleDrivePrograms() {
    if (!this.googleAccessToken) {
      return [];
    }

    const response = await fetch(
      'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime,size)',
      { headers: { Authorization: `Bearer ${this.googleAccessToken}` } }
    );
    if (!response.ok) return [];

    const data = await response.json();
    return (data.files || [])
      .filter(f => f.name.endsWith('.bas'))
      .map(f => ({
        id: f.id,
        name: f.name.replace('.bas', ''),
        savedAt: f.modifiedTime,
        size: parseInt(f.size) || 0,
        source: 'google'
      }));
  }

  // ============================================================================
  // COMBINED OPERATIONS
  // ============================================================================

  /**
   * List all programs from all sources
   */
  async listAllPrograms() {
    const local = this.listLocal();
    const google = await this.listGoogleDrivePrograms();
    return [...local, ...google].sort((a, b) =>
      new Date(b.savedAt) - new Date(a.savedAt)
    );
  }

  /**
   * Export program as downloadable file
   */
  exportAsFile(name, code) {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.bas`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Import program from file
   */
  importFromFile(file) {
    return new Promise((resolve, reject) => {
      if (!file.name.endsWith('.bas') && !file.type.includes('text')) {
        reject(new Error('Invalid file type'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const name = file.name.replace('.bas', '').replace(/[^a-zA-Z0-9_-]/g, '_');
        resolve({ name, code: e.target.result });
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProgramStorage };
} else if (typeof window !== 'undefined') {
  window.ProgramStorage = ProgramStorage;
}
