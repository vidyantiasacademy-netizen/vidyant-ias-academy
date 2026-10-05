/**
 * Deterministic per-attempt permutation of a paper.
 *
 * Why not store the order on the attempt: a hundred question ids plus their
 * option ids is a few kilobytes of indexed map per sitting, and every read of
 * the paper would carry it. A seed plus a pure function gives the same order on
 * every request for the cost of one short string.
 *
 * Why not `Math.random()`: the order has to survive a page reload, a resumed
 * attempt and the submit path. A shuffle the server cannot reproduce is a paper
 * whose question numbers mean something different each time it is opened.
 *
 * This is not cryptography and does not need to be. An adversary who recovers
 * the permutation learns the order of their own paper, which they are looking
 * at. What the shuffle defeats is the cheap channel: "Q7 is option C" passed
 * between two students sitting the same paper.
 */

/** xmur3 — string to a well-mixed 32-bit seed. */
function seedFromString(input: string): number {
  let h = 1779033703 ^ input.length;

  for (let i = 0; i < input.length; i += 1) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }

  h = Math.imul(h ^ (h >>> 16), 2246822507);
  h = Math.imul(h ^ (h >>> 13), 3266489909);

  return (h ^= h >>> 16) >>> 0;
}

/** mulberry32 — a small, fast PRNG with a 32-bit state. */
function randomFromSeed(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates with a seeded PRNG. Pure: same input and seed, same output.
 *
 * The caller must pass a list that is already in a stable order — Firestore
 * returns documents in an order that is not guaranteed across reads, and
 * shuffling an unstable list deterministically still gives an unstable result.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const random = randomFromSeed(seedFromString(seed));
  const output = [...items];

  for (let i = output.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [output[i], output[j]] = [output[j], output[i]];
  }

  return output;
}

/**
 * The seed for one question's options.
 *
 * Derived from the attempt seed and the question id rather than reusing the
 * attempt seed directly, so every question gets an independent permutation. With
 * one seed for the whole paper, four-option questions would all permute
 * identically and an option letter would travel between students again.
 */
export function optionSeed(attemptSeed: string, questionId: string): string {
  return `${attemptSeed}:${questionId}`;
}
