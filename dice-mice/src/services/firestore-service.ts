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
    // Create a document reference for the house
    const houseDocRef = doc(db, 'houses', houseId);

    // Query the houses collection where the houseId field matches the document reference
    const q = query(
      collection(db, 'characters'),
      where('houseId', '==', houseDocRef)
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
        id: doc.id,
        ...docData,
      } as Character;

      characterArr.push(character);
    });

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
