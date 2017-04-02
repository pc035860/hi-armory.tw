import $ from 'jquery';

export const NAME = 'parseProfile';

function findArtifact(d) {
  let artifact;
  $.each(d.items, function (k, v) {
    if (artifact) {
      return;
    }
    if (typeof v === 'object') {
      if (Number(v.artifactId) !== 0) {
        artifact = v;
      }
    }
  });
  return artifact;
}

function calcTotalTraits(artifact) {
  const ranks = $.map(artifact.artifactTraits, v => v.rank);
  // 需要減掉 3 點聖物給的點數
  return ranks.reduce((a, b) => a + b, 0) - 3;
}

function getExpStr(progressionRaid, includes_) {
  const includes = {
    normal: true,
    heroic: true,
    mythic: true,
    ...(includes_ || {})
  };
  const count = {
    normal: 0,
    heroic: 0,
    mythic: 0
  };
  const abbrev = {
    normal: 'N',
    heroic: 'H',
    mythic: 'M'
  };

  let bossCount = 0;
  $.each(progressionRaid.bosses, (i, v) => {
    bossCount += 1;
    Object.keys(count).forEach((dName) => {
      if (v[`${dName}Kills`] > 0) {
        count[dName] += 1;
      }
    });
  });

  let str = '';
  $.each(['normal', 'heroic', 'mythic'], (i, dName) => {
    if (includes[dName]) {
      str += `${count[dName]}/${bossCount}(${abbrev[dName]}) `;
    }
  });
  return str.slice(0, -1);
}

function getNHExpStr(progression) {
  return getExpStr(progression.raids[37]);
}

/* @ngInject */
function factory() {
  return function parseProfile(profileData) {
    const d = profileData;

    const artifact = findArtifact(d);

    return {
      avgIlv: d.items.averageItemLevel,
      avgIlvEquipped: d.items.averageItemLevelEquipped,

      newTraitsUnlocked: !!artifact.artifactTraits[17],

      totalTraits: calcTotalTraits(artifact),

      nhExpStr: getNHExpStr(d.progression)
    };
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
