/* eslint-disable */

import {
    ARTIFACT_RELICS, ARTIFACT_TEXTURES, ARTIFACT_ITEMS, CHR_SPECS_BY_CLASS
} from './constants';

const RELIC_MASK = {"8":64,"9":128,"10":256,"11":512,"12":1024,"13":2048,"14":4096,"15":8192,"16":16384,"17":32768,"18":65536};

function y(az, av, ay) {
    if (!ARTIFACT_RELICS.hasOwnProperty(az)) {
        return false
    }
    var ax = ARTIFACT_RELICS[az];
    if ((ax.relicmask & RELIC_MASK[av]) == 0) {
        return false
    }
    var aw = Math.pow(2, ay - 1);
    if (ay && (ax.classes != 0) && ((ax.classes & aw) == 0)) {
        return false
    }
    return true
}

export default function isValidRelic(aA, aB, ax) {
    if (!ARTIFACT_ITEMS.hasOwnProperty(aB)) {
        return false
    }
    var ay = ARTIFACT_ITEMS[aB].relics;
    if (ax >= ay.length) {
        return false
    }
    var aw, az = 0;
    if (ARTIFACT_TEXTURES.hasOwnProperty(aB)) {
        aw = ARTIFACT_TEXTURES[aB].spec;
        for (var av in CHR_SPECS_BY_CLASS) {
            if (!CHR_SPECS_BY_CLASS.hasOwnProperty(av)) {
                continue
            }
            if (CHR_SPECS_BY_CLASS[av].indexOf(aw) >= 0) {
                az = parseInt(av, 10);
                break
            }
        }
    }
    return y(aA, ay[ax], az)
}
