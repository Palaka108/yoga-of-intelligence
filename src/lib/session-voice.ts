/**
 * Dynamic variables for the ElevenLabs widget.
 *
 * client_id is the profile slug (for example paul-ewing-a1b2c3).
 * client_name is the display name (for example Paul Ewing).
 * session_number is the current day as a string (for example "2").
 * The slug and the display name must stay in their own fields.
 */
export function sessionDynamicVariables(
  clientId: string,
  clientName: string,
  sessionNumber: string
): { client_id: string; client_name: string; session_number: string } {
  return {
    client_id: clientId.trim(),
    client_name: clientName.trim(),
    session_number: sessionNumber.trim(),
  };
}
