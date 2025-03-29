import { Character } from '@/models/character.model';
import { PlayerHouse } from '@/models/player-house.model';
import { SelectOption } from '@/models/select.model';
import { db } from '@/utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

export async function getAllPlayers() {
  console.log('Loading Players');

  try {
    const querySnapshot = await getDocs(collection(db, 'players'));
    const playerOptions: SelectOption[] = [];

    querySnapshot.forEach((doc) => {
      const player = doc.data();
      const playerOption = {
        label: player.username,
        value: doc.id,
      };

      playerOptions.push(playerOption);
    });

    return playerOptions;
  } catch (error) {
    console.error('Error loading players:', error);
    return [];
  }
}

export async function getHouseByPlayerId(
  playerId: string
): Promise<PlayerHouse | null> {
  console.log(`Fetching House for Player ID: ${playerId}`);

  try {
    // Create a document reference for the player
    const playerDocRef = doc(db, 'players', playerId);

    // Query the houses collection where the playerId field matches the document reference
    const q = query(
      collection(db, 'houses'),
      where('playerId', '==', playerDocRef)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null; // No house found for the player
    }

    // Assuming each player has only one house, return the first one
    return {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as PlayerHouse;
  } catch (error) {
    console.error('Error fetching house:', error);
    return null;
  }
}

export async function getCharactersByHouseId(
  houseId: string
): Promise<Character[] | null> {
  console.log(`Fetching Characters for house ID: ${houseId}`);

  try {
    // Query the houses collection where the houseId field matches the document reference
    const q = query(
      collection(db, 'characters'),
      where('houseId', '==', houseId)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log('no characters found for the house');
      return null; // No characters found for the house
    }

    const characterArr: Character[] = [];
    console.log('characters found query snapshot data', querySnapshot.docs);
    querySnapshot.forEach((doc) => {
      const docData = doc.data();
      const character = {
        ...docData,
      } as Character;
      character.id = doc.id;

      characterArr.push(character);
    });
    console.log('character arr', characterArr);
    return characterArr;
  } catch (error) {
    console.error('Error fetching characters:', error);
    return null;
  }
}

export const fetchInitiativeChart = async () => {
  try {
    const docRef = doc(db, 'game_config', 'initiative_chart');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().initiativeDice; // ✅ Returns initiativeDice array
    } else {
      console.error('Initiative chart not found!');
      return [];
    }
  } catch (error) {
    console.error('Error fetching initiative chart:', error);
    return [];
  }
};

export const fetchCharacterById = async (
  characterId: string
): Promise<Character | null> => {
  try {
    const characterDoc = await getDoc(doc(db, 'characters', characterId));
    if (characterDoc.exists()) {
      const character = { ...characterDoc.data() } as Character;
      character.id = characterDoc.id;
      console.log('character', character);
      return character;
    } else {
      console.error('Character not found!');
      return null;
    }
  } catch (error) {
    console.error('Error fetching Character:', error);
    return null;
  }
};

export const updateCharacterField = async (
  characterId: string,
  field: string,
  value: any
): Promise<void> => {
  try {
    const characterRef = doc(db, 'characters', characterId);
    await updateDoc(characterRef, {
      [field]: value,
    });
    console.log(`Character ${characterId} updated: ${field} =`, value);
  } catch (error) {
    console.error('Error updating character field:', error);
    throw error;
  }
};

/**
 * Updates multiple fields on a character document.
 *
 * @param characterId - The Firestore document ID of the character.
 * @param updates - An object containing fields and their new values.
 */
export const batchUpdateCharacter = async (
  characterId: string,
  updates: Partial<Record<keyof Character, any>>
): Promise<void> => {
  try {
    const characterRef = doc(db, 'characters', characterId);
    await updateDoc(characterRef, updates);
    console.log(`Character ${characterId} updated with`, updates);
  } catch (error) {
    console.error('Batch update failed:', error);
    throw error;
  }
};
