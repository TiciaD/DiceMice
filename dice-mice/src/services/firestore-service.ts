import { PlayerHouse } from '@/models/player-house.model';
import { SelectOption } from '@/models/select.model';
import { db } from '@/utils/firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';

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
