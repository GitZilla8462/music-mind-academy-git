/**
 * HubSpot Service
 * Shared helper for creating/updating HubSpot contacts
 */

const HUBSPOT_API = 'https://api.hubapi.com/crm/v3/objects/contacts';

/**
 * Update a HubSpot contact by email. Creates if not found.
 */
async function updateHubSpotContact(token, email, properties, displayName) {
  // Try to update existing contact
  const updateRes = await fetch(
    `${HUBSPOT_API}/${encodeURIComponent(email)}?idProperty=email`,
    {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties })
    }
  );

  if (updateRes.ok) {
    return { success: true, action: 'updated', data: await updateRes.json() };
  }

  // If not found, create
  if (updateRes.status === 404) {
    const nameParts = (displayName || '').split(' ');
    const createProps = {
      email,
      firstname: nameParts[0] || '',
      lastname: nameParts.slice(1).join(' ') || '',
      ...properties
    };

    const createRes = await fetch(HUBSPOT_API, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ properties: createProps })
    });

    if (createRes.ok) {
      return { success: true, action: 'created', data: await createRes.json() };
    }
    return { success: false, error: await createRes.text() };
  }

  return { success: false, error: await updateRes.text() };
}

module.exports = { updateHubSpotContact };
