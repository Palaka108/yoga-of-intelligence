/**
 * Dynamic variables for the ElevenLabs widget.
 *
 * client_id is the profile slug (for example paul-ewing-a1b2c3).
 * client_name is the display name (for example Paul Ewing).
 * These must stay distinct: the conversation log reads client_id as the slug.
 */
export function sessionDynamicVariables(
  clientId: string,
  clientName: string
): { client_id: string; client_name: string } {
  return {
    client_id: clientId.trim(),
    client_name: clientName.trim(),
  };
}
