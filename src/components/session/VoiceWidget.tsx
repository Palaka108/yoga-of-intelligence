'use client';

import Script from 'next/script';
import { useLayoutEffect, useRef } from 'react';

const WIDGET_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';

/**
 * Copy the widget would otherwise show. The live embed script only treats
 * variant as tiny | compact | full (anything else, including the docs'
 * "expanded", is normalized to tiny), so full is the prominent layout.
 */
const TEXT_CONTENTS = JSON.stringify({
  main_label: 'Tap to begin',
  start_call: 'Tap to begin',
  end_call: 'End',
  new_call: 'Begin again',
  listening_status: 'Listening',
  speaking_status: 'Speaking',
  connecting_status: 'Connecting',
  chatting_status: 'In conversation',
  end_call_confirmation_title: 'End this conversation?',
  end_call_confirmation_description: 'You can begin again whenever you are ready.',
  end_call_confirm: 'End',
  user_ended_conversation: 'You ended the conversation',
  agent_ended_conversation: 'The conversation has ended',
  queue_waiting_status: 'One moment. We will connect you as soon as there is room.',
  queue_waiting_status_short: 'One moment',
  queue_timed_out: 'Please try again in a little while.',
});

type VoiceWidgetProps = {
  agentId: string;
  clientId: string;
  clientName: string;
};

export default function VoiceWidget({ agentId, clientId, clientName }: VoiceWidgetProps) {
  const ref = useRef<HTMLElement>(null);
  const dynamicVariables = JSON.stringify({
    client_id: clientId,
    client_name: clientName,
  });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Set attributes in the DOM so a new profile always replaces the previous
    // agent, even when React leaves a custom element in place.
    el.setAttribute('agent-id', agentId);
    el.setAttribute('dynamic-variables', dynamicVariables);
    el.setAttribute('variant', 'full');
    el.setAttribute('placement', 'bottom');
    el.setAttribute('avatar-orb-color-1', '#c9a84c');
    el.setAttribute('avatar-orb-color-2', '#7c3aed');
    el.setAttribute('text-contents', TEXT_CONTENTS);
  }, [agentId, dynamicVariables]);

  return (
    <>
      <Script src={WIDGET_SRC} strategy="afterInteractive" />
      <elevenlabs-convai
        key={`${clientId}:${agentId}`}
        ref={ref}
        agent-id={agentId}
        dynamic-variables={dynamicVariables}
        variant="full"
        placement="bottom"
        avatar-orb-color-1="#c9a84c"
        avatar-orb-color-2="#7c3aed"
        text-contents={TEXT_CONTENTS}
      />
    </>
  );
}
