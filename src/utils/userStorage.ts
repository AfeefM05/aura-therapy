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

const getUserData = (username: string): UserData | null => {
  const userData = localStorage.getItem(`user_${username}`);
  return userData ? JSON.parse(userData) : null;
};

const setUserData = (username: string, data: UserData) => {
  localStorage.setItem(`user_${username}`, JSON.stringify(data));
};

const updateUserData = (username: string, updates: Partial<UserData>) => {
  const currentData = getUserData(username);
  if (currentData) {
    const updatedData = { ...currentData, ...updates };
    setUserData(username, updatedData);
  }
};

export { getUserData, setUserData, updateUserData };