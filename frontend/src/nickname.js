const usedNicknameKey = 'quickroom.used-nicknames';

const adjectives = [
  'Blue',
  'Bright',
  'Calm',
  'Cheerful',
  'Clever',
  'Curious',
  'Gentle',
  'Happy',
  'Kind',
  'Lucky',
  'Quiet',
  'Silver',
  'Silent',
  'Sunny',
  'Swift',
  'Warm'
];

const animals = [
  'Badger',
  'Bear',
  'Falcon',
  'Fox',
  'Koala',
  'Lynx',
  'Otter',
  'Panda',
  'Raven',
  'Tiger',
  'Wolf',
  'Wren'
];

const allNicknames = adjectives.flatMap((adjective) =>
  animals.map((animal) => `${adjective} ${animal}`)
);

export function generateNickname() {
  const used = new Set(readUsedNicknames());
  const available = allNicknames.filter((nickname) => !used.has(nickname));
  const choices = available.length ? available : allNicknames;
  const nickname = choices[Math.floor(Math.random() * choices.length)];

  if (!available.length) used.clear();
  used.add(nickname);
  sessionStorage.setItem(usedNicknameKey, JSON.stringify([...used]));
  return nickname;
}

function readUsedNicknames() {
  try {
    const value = JSON.parse(sessionStorage.getItem(usedNicknameKey) || '[]');
    return Array.isArray(value) ? value.filter((nickname) => typeof nickname === 'string') : [];
  } catch {
    return [];
  }
}
