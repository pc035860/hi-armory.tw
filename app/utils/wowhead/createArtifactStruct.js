/* eslint-disable */

import isValidRelic from './isValidRelic';
import {
    ARTIFACT_SPEC_LOOKUP, CHR_SPECS_BY_CLASS, ARTIFACT_POWERS, ARTIFACT_RELICS
} from './constants';

const POWER_FLAGS = {"dragon":1,"root":2,"paragon":4,"metapower":8,"free":16,"tierbonus":32,"ignoreForTier":8};

function getArtifactForCurrent(artifactId) {
    var ax = {
        artifact: artifactId,
        spec: 0,
        classs: 0
    };
    for (var aw in ARTIFACT_SPEC_LOOKUP) {
        if (!ARTIFACT_SPEC_LOOKUP.hasOwnProperty(aw)) {
            continue
        }
        if (ARTIFACT_SPEC_LOOKUP[aw] == artifactId) {
            ax.spec = aw;
            for (var av in CHR_SPECS_BY_CLASS) {
                if (!CHR_SPECS_BY_CLASS.hasOwnProperty(av)) {
                    continue
                }
                if (CHR_SPECS_BY_CLASS[av].indexOf(aw) >= 0) {
                    ax.classs = av
                }
            }
        }
    }
    return ax
}

function ab(av) {
    return {
        item: av,
        usedBy: {}
    }
}

export default function createArtifactStruct(artifactData) {
    const aD = artifactData;
    const B = {
        classs: 0,
        spec: 0,
        artifact: 0,
        powers: {},
        relics: {},
        tier: 0
    };

    Object.assign(B, getArtifactForCurrent(aD.artifactId));
    B.powers = {};
    B.relics = {};
    if (aD.hasOwnProperty("relics")) {
        for (let aC = 0; aC < aD.relics.length; aC++) {
            if (isValidRelic(aD.relics[aC].itemId, aD.artifactId, aD.relics[aC].socket)) {
                B.relics[aD.relics[aC].socket] = ab(aD.relics[aC].itemId);
                if (aD.relics[aC].bonusLists && aD.relics[aC].bonusLists.length) {
                    aD.relics[aC].bonusLists.sort();
                    B.relics[aD.relics[aC].socket].bonuses = aD.relics[aC].bonusLists
                }
            }
        }
    }
    if (aD.hasOwnProperty("artifactTraits")) {
        for (var ay in ARTIFACT_POWERS[B.artifact]) {
            if (!ARTIFACT_POWERS[B.artifact].hasOwnProperty(ay)) {
                continue
            }
            if (ARTIFACT_POWERS[B.artifact][ay].flags & POWER_FLAGS.free) {
                B.powers[ay] = ARTIFACT_POWERS[B.artifact][ay].maxlevel
            }
        }
        for (var aB = 0, aA; aA = aD.artifactTraits[aB]; aB++) {
            ay = aA.id;
            B.powers[ay] = aA.rank
        }
        var ax = {};
        for (let aC in B.relics) {
            if (!B.relics.hasOwnProperty(aC) || !B.relics[aC]) {
                continue
            }
            for (ay in ARTIFACT_POWERS[B.artifact]) {
                if (!ARTIFACT_POWERS[B.artifact].hasOwnProperty(ay)) {
                    continue
                }
                if (ARTIFACT_RELICS[B.relics[aC].item].bonusranks.hasOwnProperty(ARTIFACT_POWERS[B.artifact][ay].type)) {
                    if (!B.powers.hasOwnProperty(ay)) {
                        B.powers[ay] = 0;
                        ax[ay] = true
                    }
                    if (ax[ay]) {
                        B.powers[ay] += ARTIFACT_RELICS[B.relics[aC].item].bonusranks[ARTIFACT_POWERS[B.artifact][ay].type]
                    }
                    B.relics[aC].usedBy[ay] = true
                }
            }
        }
    }
    return B;
}
