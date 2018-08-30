import $ from 'jquery';
import reverse from 'lodash/reverse';
import invert from 'lodash/invert';

import memoize from 'memoizee';

import createArtifactStruct from '../utils/wowhead/createArtifactStruct';
import artifactCalculatorHash from '../utils/wowhead/artifactCalculatorHash';
import { CHR_SPECS } from '../utils/wowhead/constants';

import {
  classNames as CLASS_NAMES,
  specNames as SPEC_NAMES
} from '../config';

const SPEC_NAMES_EN = invert(SPEC_NAMES);

export const NAME = 'parseProfile';

function findHeartOfAzeroth(d) {
  let heart;
  if (d.items.neck.id === 158075) {
    heart = d.items.neck;
  }
  return heart;
}

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
  return talentStr.split('').map((v) => {
    if (v === '.') {
      return v;
    }
    return Number(v) + 1;
  }).join('');
}

function findActiveTalent(talents) {
  const talent = talents.filter(v => v.selected)[0];
  return talent;
}

function getTalentCalculatorLink(d, talent) {
  const humanTalents = toHumanTalentStr(talent.calcTalent);

  const enClassName = CLASS_NAMES[d.class][1];
  const enSpecName = SPEC_NAMES_EN[talent.spec.name];

  const hashParams = `${enClassName}/${enSpecName}/talents=${humanTalents}`;
  return `https://worldofwarcraft.com/zh-tw/game/talent-calculator#${hashParams}`;
}

function getPictureSrcs(d) {
  const renderUrlBase = 'https://render-tw.worldofwarcraft.com/character/';
  return {
    thumbnail: `${renderUrlBase}${d.thumbnail}`,
    profile: `${renderUrlBase}${d.thumbnail.replace(/avatar/, 'main')}`
  };
}

function getArtifactCalculatorLink(artifact) {
  const base = 'http://www.wowhead.com/artifact-calc';
  const s = createArtifactStruct(artifact);
  const hash = artifactCalculatorHash(artifact);

  if (s.spec === 0 && s.classs === 0) {
    return `${base}/${hash}`;
  }

  const enClassName = CLASS_NAMES[s.classs][1];  // wowhead class name actually
  const enSpecName = CHR_SPECS[s.spec].toLowerCase();
  return `${base}/${enClassName}/${enSpecName}/${hash}`;
}

/* @ngInject */
function factory() {
  const parseProfile = (profileData) => {
    const d = profileData;

    const artifact = findArtifact(d);
    const heart = findHeartOfAzeroth(d);
    const talent = findActiveTalent(d.talents);

    let base = {
      talentName: talent.spec.name,
      talentStr: toHumanTalentStr(talent.calcTalent),
      talentCalcLink: getTalentCalculatorLink(d, talent),
      className: CLASS_NAMES[profileData.class][0],

      avgIlv: d.items.averageItemLevel,
      avgIlvEquipped: d.items.averageItemLevelEquipped,

      expStr: getExpStrList(d.progression),

      picture: getPictureSrcs(d)
    };

    if (artifact) {
      base = {
        ...base,

        artifactIlv: artifact.itemLevel,
        newTraitsUnlocked: !!artifact.artifactTraits[17],
        totalTraits: calcTotalTraits(artifact),
        artifactCalcLink: getArtifactCalculatorLink(artifact)
      };
    }

    if (heart) {
      base = {
        ...base,

        azeriteLevel: heart.azeriteItem.azeriteLevel
      };
    }

    return base;
  };

  return memoize(parseProfile);
}

export default function configure(ngModule) {
  ngModule.factory(NAME, factory);
}
