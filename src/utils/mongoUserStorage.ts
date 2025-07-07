import type { UserData, Suggestion, Taglines } from './serverUserStorage';

const isBrowser = typeof window !== 'undefined';

// Client-side user storage utility that uses API calls
export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: 'activities' | 'music' | 'videos' | 'books' | 'meditation' | 'self-care';
  duration?: string;
  completed: boolean;
  videoId?: string;
}

export interface Taglines {
  music: string;
  video: string;
  books: {
    booksnames: string[];
    bookdetails: string[];
  };
  selfcare: {
    selfcarenames: string[];
    selfcaredetails: string[];
  };
  meditationpractices: {
    meditationnames: string[];
    meditationdetails: string[];
  };
  mindfulactivities: {
    mindfulactivitiesnames: string[];
    mindfulactivitiesdetails: string[];
  };
  dailyAffirmation: string;
}

export interface UserData {
  username: string;
  chatHistory: { message: string; timestamp: number }[];
  suggestions: Suggestion[];
  dashboardData: { [key: string]: any };
  taglines: Taglines;
  completedItems: Record<string, boolean>;
}

const getUserData = async (username: string): Promise<UserData | null> => {
  if (isBrowser) {
    try {
      const response = await fetch(`/api/users?username=${encodeURIComponent(username)}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  } else {
    // Server: use direct model
    const { getUserData: getServerUserData } = await import('./serverUserStorage');
    return getServerUserData(username);
  }
};

const setUserData = async (username: string, data: UserData): Promise<boolean> => {
  if (isBrowser) {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, userData: data }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error setting user data:', error);
      return false;
    }
  } else {
    const { setUserData: setServerUserData } = await import('./serverUserStorage');
    return setServerUserData(username, data);
  }
};

const updateUserData = async (username: string, updates: Partial<UserData>): Promise<boolean> => {
  if (isBrowser) {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, updates }),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Error updating user data:', error);
      return false;
    }
  } else {
    const { updateUserData: updateServerUserData } = await import('./serverUserStorage');
    return updateServerUserData(username, updates);
  }
};

const createUser = async (username: string): Promise<boolean> => {
  if (isBrowser) {
    const defaultUserData: UserData = {
      username,
      chatHistory: [],
      suggestions: [],
      dashboardData: {},
      taglines: {
        music: '',
        video: '',
        books: { booksnames: [], bookdetails: [] },
        selfcare: { selfcarenames: [], selfcaredetails: [] },
        meditationpractices: { meditationnames: [], meditationdetails: [] },
        mindfulactivities: { mindfulactivitiesnames: [], mindfulactivitiesdetails: [] },
        dailyAffirmation: '',
      },
      completedItems: {},
    };
    return setUserData(username, defaultUserData);
  } else {
    const { createUser: createServerUser } = await import('./serverUserStorage');
    return createServerUser(username);
  }
};

const userExists = async (username: string): Promise<boolean> => {
  if (isBrowser) {
    const userData = await getUserData(username);
    return userData !== null;
  } else {
    const { userExists: serverUserExists } = await import('./serverUserStorage');
    return serverUserExists(username);
  }
};

export { getUserData, setUserData, updateUserData, createUser, userExists };
export type { UserData, Suggestion, Taglines }; 