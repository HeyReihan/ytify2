// @ts-ignore
import { readFileSync, writeFileSync } from 'node:fs'; // @ts-ignore
import { exec } from 'node:child_process';

const data = readFileSync('unified_instances.txt', 'utf8').split('\n\n');

// generate an average of data.length datasets

Promise
  .all(Array(data.length)
    .fill(null)
    .map(() => Promise.all(data.map(fetchAudioUrl)))
  )
  .then((grid) => {
    const list: [string, number][] = [];
    for (let i = 0; i < grid[0].length; i++) {
      let sum = 0;

      for (let j = 0; j < grid.length; j++)
        sum += grid[j][i][1];

      list[i] = [grid[0][i][0], sum];
    }
    return list;
  })
  .then((list) => list.sort((a, b) => b[1] - a[1]).map(v => v[0]))
  .then((sortedList) => {
    writeFileSync('unified_instances.txt', sortedList.join('\n\n'));
    exec(`
    git add unified_instances.txt;
    git config user.email 'action@github.com';
    git config user.name 'github-actions';
    git commit -m '${diff(data, sortedList)}' || true && git push || true
    `);
  });


async function fetchAudioUrl(instance: string) {

  const [name, _, piped, invidious, hyperpipe] = instance.split(', ');
  const musicStream = 'k2Fjn90aB0M';
  const nonMusicStream = 'MvsAesQ-4zA';
  const pipedInstance = `https://${piped}.${name}`;
  const invidiousInstance = `https://${invidious}.${name}`;
  const hyperpipeInstance = `https://${hyperpipe}.${name}`;
  const f = performance.now();
  let score = 0;


  await fetch(`${pipedInstance}/streams/${musicStream}`)
    .then(res => res.json())
    .then(async data => {
      if ('audioStreams' in data) {
        score += (1 / (performance.now() - f));
        const audioUrl = data.audioStreams[0].url;
        const proxiedUrl = audioUrl.replace(new URL(audioUrl).origin, invidiousInstance);
        const t = performance.now();

        await fetch(hyperpipeInstance + data.uploaderUrl)
          .then(res => res.json())
          .then(data => {
            console.log('\n✅ loaded music artist on ' + name);
            if ('playlistId' in data) score++;
          })
          .catch(() => {
            console.log('\n❌ failed to load music artist on ' + name);
          });

        await fetch(proxiedUrl)
          .then(_ => _.blob())
          .then(blob => {
            if (blob.type.startsWith('audio')) {
              console.log('\n✅ loaded music stream on ' + name);
              score += (1 / (performance.now() - t));
            }
            else throw new Error();
          })
          .catch(() => {
            console.log('\n❌ failed to load music stream on ' + name);
          });
      }
      else throw new Error();
    })
    .catch(() => {
      console.log(`\n❌ failed to fetch music stream data on ${name}`);
    });

  await fetch(`${pipedInstance}/streams/${nonMusicStream}`)
    .then(res => res.json())
    .then(async data => {
      if ('audioStreams' in data) {
        score++;
        const audioUrl = data.audioStreams[0].url;
        const construct = new URL(audioUrl);
        const deproxiedUrl = audioUrl.replace(
          construct.host,
          construct.searchParams.get('host'));
        const t = performance.now();

        await fetch(deproxiedUrl)
          .then(data => data.blob())
          .then(blob => {
            if (blob.type.startsWith('audio')) {
              console.log('\n✅ loaded deproxified non-music stream on ' + name);
              score += (1 / (performance.now() - t));
            }
            else throw new Error();
          })
          .catch(() => {
            console.log('\n❌ failed to load deproxified non-music stream on ' + name);
          });
      }
      else throw new Error();
    })
    .catch(() => {
      console.log(`\n❌ failed to fetch non-music stream data on ${name}`);
    });

  return [instance, score];

}

function diff(textArr1: string[], textArr2: string[]) {
  const data: string[] = [];
  for (let i = 0; i < textArr1.length; i++)
    if (textArr1[i] !== textArr2[i])
      data.push(textArr1[i].split(', ')[0] + ((i - textArr2.indexOf(textArr1[i])) > 0 ? ' 🔺' : ' 🔻'));
  return data.join(', ');
}

