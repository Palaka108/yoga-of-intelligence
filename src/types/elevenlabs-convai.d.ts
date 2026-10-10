import type { DetailedHTMLProps, HTMLAttributes } from 'react';

type ConvaiWidgetProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  'agent-id'?: string;
  'dynamic-variables'?: string;
  variant?: string;
  placement?: string;
  'avatar-orb-color-1'?: string;
  'avatar-orb-color-2'?: string;
  'text-contents'?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': ConvaiWidgetProps;
    }
  }
}

export {};
