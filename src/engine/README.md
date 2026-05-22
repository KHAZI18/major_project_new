# Adaptive Learning Engine (`src/engine/`)

UI-free module. Import **only** from `engineAPI.js`.

## Lifecycle
```js
import { initEngine } from './engine/engineAPI';
await initEngine(); // once, at app start (hydrates from IndexedDB)
```

## In a game (per answer)
```js
import { recordAttempt, getNextDifficulty } from './engine/engineAPI';

const difficulty = getNextDifficulty('addition');     // 'easy' | 'medium' | 'hard'
const mastery = await recordAttempt({ skillId: 'addition', correct: true, responseTime: 1200 });
```

## On the student dashboard
```js
import { suggestNext, getDueReviews } from './engine/engineAPI';
const rec = suggestNext();            // { skillId, games } | null
const due = getDueReviews();          // string[] of skillIds to refresh
```

## On the teacher dashboard
```js
import { classMastery } from './engine/engineAPI';
// students: [{ id, name, attempts: <scalar total>, mastery: { [skillId]: P } }]
// Pass only the skills a student has actually attempted (not a dense BKT map).
const { perSkill, ranking } = classMastery(students); // from /api/teacher/class-mastery
```

## Layers
- `knowledgeGraph.js` — 13-skill DAG, prereqs, game↔skill map, graph helpers.
- `masteryModel.js` — mastery estimation. Ships the **BKT** backend.
- `decisionLayer.js` — `nextDifficulty`, `suggestNextSkill`, SM-2 (`createReview`/`updateReview`/`isDue`/`dueForReview`), `fairRanking`.
- `engineAPI.js` — the singleton public API above.

## Thresholds
- `0.75` = "mastered" (unlock downstream skills, count toward breadth). A skill at exactly
  0.75 is still served at **Medium** difficulty; only **> 0.75** is served at **Hard**.
- `0.85` = mastery level at which spaced-repetition review scheduling begins.

## Swapping the mastery backend (future DKT)
`masteryModel.js` ships a BKT backend. The DKT backend (separate plan) must export the
same three functions: `createInitialBelief`, `updateBelief`, `getMastery`. Because the
graph has 13 skills, the DKT input dimension is `2 × SKILL_IDS.length = 26`.

## Tests
`npm test` — pure-logic + IndexedDB (fake-indexeddb) unit tests, Node environment.
