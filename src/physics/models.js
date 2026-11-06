import { initialState, advance } from './laserFourLevel.js';
import { initialState3, advance3 } from './laserThreeLevel.js';
// unpack(y) -> common shape {n3,n2,n1,n0,S}; n1 is the lower laser level in both models.
export const MODELS = {
  four: { init: initialState, advance, sIndex: 4, unpack: (y) => ({ n3: y[0], n2: y[1], n1: y[2], n0: y[3], S: y[4] }) },
  three: { init: initialState3, advance: advance3, sIndex: 3, unpack: (y) => ({ n3: y[0], n2: y[1], n1: y[2], n0: 0, S: y[3] }) },
};
