/**
 * Which explainer belongs to which question.
 *
 * This used to be keyword matching over the question text, and it was wrong
 * often enough to waste the reader's time: "Was ist die Bundeswehr?" pointed at
 * civic participation, a driving-licence question pointed at elections, and a
 * question about Jewish sports clubs being open to everyone pointed at the Nazi
 * era, which is both inaccurate and tactless.
 *
 * So the mapping is curated instead. A question appears here only when the
 * explainer genuinely covers it; roughly a quarter of the catalogue is left
 * deliberately unlinked, because no link is better than a misleading one.
 */

/** dive key -> question ids it genuinely explains. */
export const DIVE_QUESTIONS = {
  anmeldung: [19, 126, 253],

  grundgesetz: [
    1, 4, 6, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 26, 30, 38, 52, 61,
    262, 274, 277, 278, 281, 289,
  ],

  bundestag: [
    13, 22, 31, 34, 42, 48, 55, 57, 58, 60, 65, 70, 71, 72, 73, 74, 75, 81, 82,
    83, 84, 86, 87, 88, 89, 98, 103, 128, 216,
  ],

  elections: [
    5, 28, 41, 44, 76, 78, 79, 92, 93, 94, 105, 106, 107, 108, 109, 110, 112,
    113, 114, 115, 116, 117, 119, 120, 121, 122, 123, 124, 125, 127, 129, 130,
    133, 282,
  ],

  federalism: [24, 25, 27, 37, 39, 49, 56, 62, 64, 67, 69, 85, 90, 91, 131],

  courts: [3, 32, 51, 53, 54, 63, 80, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 150, 263, 275],

  work: [23, 101, 104, 135, 136, 137, 138, 247, 256, 285, 286, 287],

  social: [35, 36, 45, 47, 50, 97, 99, 100, 171, 241],

  school: [68, 95, 242, 244, 250, 257, 259, 260, 261, 269, 270, 284],

  'ns-zeit': [
    20, 43, 96, 111, 149, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162,
    163, 164, 167, 168, 170, 179, 181, 184, 206, 220, 288,
  ],

  ddr: [
    151, 166, 169, 172, 174, 175, 176, 177, 178, 185, 186, 187, 188, 189, 190,
    191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 207,
    208, 209, 210, 211, 215, 217, 218, 219, 228, 298,
  ],

  eu: [
    173, 205, 221, 222, 223, 224, 226, 227, 229, 230, 231, 232, 233, 234, 235,
    236, 237, 238, 239, 240,
  ],

  participation: [118, 132, 134, 243],

  religion: [2, 7, 33, 182, 271, 291, 292, 293, 294, 295, 296],

  alltag: [264, 266, 279],
};

/**
 * Every Bundesland question maps to the federalism explainer: it answers the
 * question those ten always raise, which is why the test has state questions
 * at all and what a Bundesland actually decides.
 */
const STATE_QUESTION_DIVE = 'federalism';

const byId = new Map();
for (const [dive, ids] of Object.entries(DIVE_QUESTIONS)) {
  for (const id of ids) {
    if (byId.has(id)) {
      throw new Error(
        `Question ${id} is assigned to both "${byId.get(id)}" and "${dive}". ` +
          'Each question gets exactly one explainer - pick the more useful one.',
      );
    }
    byId.set(id, dive);
  }
}

export function deepDiveFor(q) {
  if (q.type === 'state') return STATE_QUESTION_DIVE;
  return byId.get(q.id) ?? null;
}

export const CURATED_COUNT = byId.size;
