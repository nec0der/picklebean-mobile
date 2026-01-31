/**
 * PlayNowOutcomeView
 * Router component - switches on result.kind only
 * No logic, just routing to appropriate view
 */

import { memo } from 'react';
import type { PlayNowResult } from '../types';
import { GoView } from './views/GoView';
import { DeferView } from './views/DeferView';
import { AvoidView } from './views/AvoidView';

interface PlayNowOutcomeViewProps {
  result: PlayNowResult;
}

export const PlayNowOutcomeView = memo(({ result }: PlayNowOutcomeViewProps) => {
  switch (result.kind) {
    case "GO":
      return <GoView outcome={result} />;
    case "DEFER":
      return <DeferView outcome={result} />;
    case "AVOID":
      return <AvoidView outcome={result} />;
  }
});

PlayNowOutcomeView.displayName = 'PlayNowOutcomeView';
