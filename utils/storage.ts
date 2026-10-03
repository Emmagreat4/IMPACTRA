import AsyncStorage from "@react-native-async-storage/async-storage";

export type User = {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
};

export type Show = {
  id: string;
  title: string;
  season: string;
  episode: string;
  watched: number;
  total: number;
  poster: string;
};

const USER_KEY = "impactra_user";
const SHOWS_KEY = "impactra_shows";

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

export async function getUser(): Promise<User | null> {
  const savedUser = await AsyncStorage.getItem(USER_KEY);

  if (!savedUser) {
    return null;
  }

  try {
    return JSON.parse(savedUser) as User;
  } catch {
    return null;
  }
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function saveShows(
  shows: Show[]
): Promise<void> {
  await AsyncStorage.setItem(
    SHOWS_KEY,
    JSON.stringify(shows)
  );
}

export async function getShows(): Promise<Show[]> {
  const savedShows = await AsyncStorage.getItem(
    SHOWS_KEY
  );

  if (!savedShows) {
    return [];
  }

  try {
    const parsedShows = JSON.parse(savedShows);

    if (!Array.isArray(parsedShows)) {
      return [];
    }

    return parsedShows as Show[];
  } catch {
    return [];
  }
}

export async function clearShows(): Promise<void> {
  await AsyncStorage.removeItem(SHOWS_KEY);
}