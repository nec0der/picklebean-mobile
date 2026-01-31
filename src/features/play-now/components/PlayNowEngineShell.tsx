/**
 * PlayNowEngineShell
 * Pure routing component - switches on engine output type
 * No logic, no calculations, no fallbacks
 */

import { memo } from 'react';
import type { PlayNowEngineOutput } from '../types';
import { BlockedView } from './BlockedView';
import { PlayNowOutcomeView } from './PlayNowOutcomeView';

interface PlayNowEngineShellProps {
  output: PlayNowEngineOutput;
}

export const PlayNowEngineShell = memo(({ output }: PlayNowEngineShellProps) => {
  switch (output.type) {
    case "BLOCKED":
      return <BlockedView readiness={output.readiness} />;
    
    case "DECISION":
      return <PlayNowOutcomeView result={output.result} />;
  }
});

PlayNowEngineShell.displayName = 'PlayNowEngineShell';
