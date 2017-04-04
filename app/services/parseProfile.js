import $ from 'jquery';
import reverse from 'lodash/reverse';

export const NAME = 'parseProfile';

const CLASS_NAME = {
  1: '戰士',
  2: '聖騎士',
  3: '獵人',
  4: '盜賊',
  5: '牧師',
  6: '死騎',
  7: '薩滿',
  8: '法師',
  9: '術士',
  10: '武僧',
  11: '德魯伊',
  12: '惡魔獵人',
};

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
  const relicsCount = artifact.relics ? artifact.relics.length : 0;
  return Math.max(0, ranks.reduce((a, b) => a + b, 0) - relicsCount);
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

function getExpStrList(progression) {
  const raids = reverse(progression.raids.slice(-3));
  return raids.map(raid => ({
    name: raid.name,
    str: getExpStr(raid)
  }));
}

function toHumanTalentStr(talentStr) {
  return talentStr.split('').map(v => Number(v) + 1).join('');
}

function findActiveTalent(talents) {
  const talent = talents.filter(v => v.selected)[0];
  return talent;
}

function getTalentCalculatorLink(d, talent) {
  return `http://tw.battle.net/wow/zh/tool/talent-calculator#${d.calcClass}${talent.calcSpec}a!${talent.calcTalent}`;
}

function getPictureSrcs(d) {
  const renderUrlBase = 'http://render-tw.worldofwarcraft.com/character/';
  return {
    thumbnail: `${renderUrlBase}${d.thumbnail}`,
    profile: `${renderUrlBase}${d.thumbnail.replace(/avatar/, 'profilemain')}`
  };
}

/* @ngInject */
function factory() {
  return function parseProfile(profileData) {
    const d = profileData;

    const artifact = findArtifact(d);
    const talent = findActiveTalent(d.talents);

    const base = {
      talentName: talent.spec.name,
      talentStr: toHumanTalentStr(talent.calcTalent),
      talentCalcLink: getTalentCalculatorLink(d, talent),
      className: CLASS_NAME[profileData.class],

      avgIlv: d.items.averageItemLevel,
      avgIlvEquipped: d.items.averageItemLevelEquipped,

      expStr: getExpStrList(d.progression),

      picture: getPictureSrcs(d)
    };

    if (artifact) {
      return {
        ...base,

        artifactIlv: artifact.itemLevel,
        newTraitsUnlocked: !!artifact.artifactTraits[17],
        totalTraits: calcTotalTraits(artifact),
      };
    }

    return base;
  };
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
