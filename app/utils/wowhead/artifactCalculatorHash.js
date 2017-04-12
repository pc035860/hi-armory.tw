/* eslint-disable */

import createArtifactStruct from './createArtifactStruct';

import { ARTIFACT_ITEMS, B64ARRAY } from './constants';

function r(z, u) {
    var y = [];
    for (var t = (u - 1); t >= 0; t--) {
        y[t] = z & 15;
        z = z >> 4
    }
    return y
}

function m(w) {
    var v = [];
    var u;
    for (var t = 0; t < w.length; t += 2) {
        u = w[t] << 4;
        if (t + 1 < w.length) {
            u |= w[t + 1]
        }
        v.push(u)
    }
    return v
}

function l(u) {
    var w = 0
      , v = 0;
    for (var t = 0; t < u.length; t++) {
        w = (w + u[t]) % 255;
        v = (v + w) % 255
    }
    return [u.length, v, w]
}

function h(B) {
    try {
        if (window.btoa) {
            return window.btoa(String.fromCharCode.apply(null, B)).replace(new RegExp("\\+","g"), B64ARRAY[62]).replace(new RegExp("/","g"), B64ARRAY[63]).replace(/=+$/, "")
        }
    } catch (v) {
        void (0)
    }
    var t = "";
    var C, z, y = 0;
    var D, A, x, w = "";
    var u = 0;
    while (u < B.length) {
        C = (u >= B.length) ? NaN : B[u++];
        z = (u >= B.length) ? NaN : B[u++];
        y = (u >= B.length) ? NaN : B[u++];
        D = C >> 2;
        A = ((C & 3) << 4) | (z >> 4);
        x = ((z & 15) << 2) | (y >> 6);
        w = y & 63;
        if (isNaN(z)) {
            x = w = 64
        } else {
            if (isNaN(y)) {
                w = 64
            }
        }
        t = t + B64ARRAY.charAt(D) + B64ARRAY.charAt(A) + B64ARRAY.charAt(x) + B64ARRAY.charAt(w);
        C = z = y = 0;
        D = A = x = w = ""
    }
    if (t.indexOf(B64ARRAY.charAt(64)) > 0) {
        t = t.substr(0, t.indexOf(B64ARRAY.charAt(64)))
    }
    return t
}

export default function artifactCalculatorHash(artifactData) {
    const artStruct = createArtifactStruct(artifactData);
    var t, y = [];
    y.push(2);
    y = y.concat(r(artStruct.artifact, 2));
    var w = 0
      , z = [];
    if (ARTIFACT_ITEMS.hasOwnProperty(artStruct.artifact)) {
        for (t = 0; t < ARTIFACT_ITEMS[artStruct.artifact].relics.length && t < 4; t++) {
            if (!artStruct.relics.hasOwnProperty(t)) {
                continue
            }
            w |= Math.pow(2, t);
            z = z.concat(r(artStruct.relics[t].item, 5))
        }
    }
    y.push(w);
    y = y.concat(z);
    for (t in artStruct.powers) {
        if (!artStruct.powers.hasOwnProperty(t)) {
            continue
        }
        y = y.concat(r(parseInt(t, 10), 3));
        y = y.concat(r(artStruct.powers[t], 2))
    }
    var u = m(y);
    var v = l(u);
    for (t = v.length - 1; t >= 0; t--) {
        u.unshift(v[t])
    }
    return h(u)
}
