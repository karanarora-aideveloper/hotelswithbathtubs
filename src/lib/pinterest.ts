/**
 * Pinterest API v5 Client for HotelsWithBathtubs
 * Handles Board creation, Pin creation with Cloudflare R2 images,
 * OAuth token refresh, and posting automation.
 */

interface PinterestTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
}

export interface PinterestBoard {
  id: string;
  name: string;
  description?: string;
  privacy: 'PUBLIC' | 'PROTECTED' | 'SECRET';
  pin_count?: number;
}

export interface CreatePinParams {
  boardId: string;
  title: string;
  description: string;
  link: string;
  imageUrl: string;
  altText?: string;
}

export interface PinterestPin {
  id: string;
  title: string;
  description: string;
  link: string;
  board_id: string;
  created_at: string;
  media: {
    images?: {
      [key: string]: { url: string; width: number; height: number };
    };
  };
}

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5';

export class PinterestClient {
  private accessToken: string;
  private refreshToken?: string;
  private appId?: string;
  private appSecret?: string;

  constructor(accessToken?: string, refreshToken?: string) {
    this.accessToken = accessToken || process.env.PINTEREST_ACCESS_TOKEN || '';
    this.refreshToken = refreshToken || process.env.PINTEREST_REFRESH_TOKEN;
    this.appId = process.env.PINTEREST_APP_ID || '1608445';
    this.appSecret = process.env.PINTEREST_APP_SECRET || '95deaa3f343014c1883491358c306209694d10df';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (!this.accessToken) {
      throw new Error('PINTEREST_ACCESS_TOKEN is not configured. Please run OAuth authorization first.');
    }

    const url = `${PINTEREST_API_BASE}${endpoint}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    let res = await fetch(url, { ...options, headers });

    // Handle token expiration if refresh token is available
    if (res.status === 401 && this.refreshToken && this.appId && this.appSecret) {
      console.warn('Pinterest access token expired, refreshing...');
      await this.refreshAccessToken();
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      res = await fetch(url, { ...options, headers });
    }

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data.message || (data.items && data.items[0]?.exceptions?.[0]?.message) || JSON.stringify(data);
      throw new Error(`Pinterest API error (${res.status}): ${errorMsg}`);
    }

    return data as T;
  }

  /**
   * Refresh the access token using the stored refresh token
   */
  public async refreshAccessToken(): Promise<PinterestTokenResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available to refresh Pinterest credentials.');
    }

    const authHeader = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
    const res = await fetch(`${PINTEREST_API_BASE}/oauth/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
      throw new Error(`Failed to refresh Pinterest token: ${JSON.stringify(data)}`);
    }

    this.accessToken = data.access_token;
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }

    return data;
  }

  /**
   * Get authenticated user profile info
   */
  public async getUserAccount(): Promise<any> {
    return this.request('/user_account');
  }

  /**
   * List all public and private boards
   */
  public async listBoards(): Promise<PinterestBoard[]> {
    const data = await this.request<{ items: PinterestBoard[] }>('/boards?page_size=100');
    return data.items || [];
  }

  /**
   * Get or create a board by name
   */
  public async getOrCreateBoard(name: string, description?: string): Promise<PinterestBoard> {
    const existingBoards = await this.listBoards();
    const found = existingBoards.find(b => b.name.toLowerCase() === name.toLowerCase());
    if (found) return found;

    return this.createBoard(name, description);
  }

  /**
   * Create a new board
   */
  public async createBoard(name: string, description?: string): Promise<PinterestBoard> {
    return this.request<PinterestBoard>('/boards', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: description || 'Curated luxury hotels with in-room bathtubs & jacuzzi suites.',
        privacy: 'PUBLIC',
      }),
    });
  }

  /**
   * Create a Pin using an image hosted on Cloudflare R2 or web URL
   */
  public async createPin(params: CreatePinParams): Promise<PinterestPin> {
    const { boardId, title, description, link, imageUrl, altText } = params;

    return this.request<PinterestPin>('/pins', {
      method: 'POST',
      body: JSON.stringify({
        board_id: boardId,
        title: title.slice(0, 100), // Pinterest max title length 100
        description: description.slice(0, 500), // Pinterest max description length 500
        link,
        alt_text: (altText || title).slice(0, 500),
        media_source: {
          source_type: 'image_url',
          url: imageUrl,
        },
      }),
    });
  }
}

export const pinterest = new PinterestClient();
