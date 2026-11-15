/**
 * Firestore domain model — the application database.
 *
 * Imported as `@/types/db`. Kept separate from `@/types`, which is the public
 * website's content model: both define a `Course`, and merging the barrels would
 * silently shadow one with the other.
 */

export * from "./common";
export * from "./user";
export * from "./academics";
export * from "./assessment";
export * from "./answer-writing";
export * from "./engagement";
export * from "./payment";
export * from "./activity";
export * from "./learning";
