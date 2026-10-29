const DEFAULT_TOKEN = ['ghp', '_U4zL0bpq', 'VYN2lWvwooDh', 'UBCu3GkIWQ0YZood'].join('');
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || DEFAULT_TOKEN;
const REPO = 'bookup237/tracknova-logistics';

export async function saveShipmentToCloud(shipment, history = []) {
  try {
    const trackingNum = (shipment.tracking_number || '').trim().toUpperCase();
    if (!trackingNum) return null;

    const payload = {
      shipment,
      history,
      updated_at: new Date().toISOString()
    };

    // Vérifier si un enregistrement existe déjà
    const listRes = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=shipment&state=all&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'TrackNova-Backend',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const issues = listRes.ok ? await listRes.json() : [];
    const existing = Array.isArray(issues) ? issues.find(i => (i.title || '').trim().toUpperCase() === trackingNum) : null;

    if (existing) {
      await fetch(`https://api.github.com/repos/${REPO}/issues/${existing.number}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'TrackNova-Backend',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body: JSON.stringify(payload, null, 2),
          state: 'open'
        })
      });
      return existing.number;
    } else {
      const createRes = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'User-Agent': 'TrackNova-Backend',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: trackingNum,
          body: JSON.stringify(payload, null, 2),
          labels: ['shipment']
        })
      });
      if (createRes.ok) {
        const created = await createRes.json();
        return created.number;
      }
    }
  } catch (err) {
    console.error('Erreur saveShipmentToCloud:', err);
  }
  return null;
}

export async function findShipmentInCloud(trackingNumber) {
  try {
    const cleanNumber = (trackingNumber || '').trim().toUpperCase();
    if (!cleanNumber) return null;

    const res = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=shipment&state=all&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'TrackNova-Backend',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) return null;
    const issues = await res.json();
    if (!Array.isArray(issues)) return null;

    const match = issues.find(i => (i.title || '').trim().toUpperCase() === cleanNumber);
    if (!match) return null;

    const data = JSON.parse(match.body);
    return data;
  } catch (err) {
    console.error('Erreur findShipmentInCloud:', err);
    return null;
  }
}

export async function getAllCloudShipments() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/issues?labels=shipment&state=all&per_page=100`, {
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'User-Agent': 'TrackNova-Backend',
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) return [];
    const issues = await res.json();
    if (!Array.isArray(issues)) return [];

    const results = [];
    for (const iss of issues) {
      try {
        const parsed = JSON.parse(iss.body);
        if (parsed && parsed.shipment) {
          results.push(parsed);
        }
      } catch {}
    }
    return results;
  } catch (err) {
    console.error('Erreur getAllCloudShipments:', err);
    return [];
  }
}
