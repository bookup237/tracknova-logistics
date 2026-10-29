const express = require('express');
const db = require('../database');

const router = express.Router();

// GET /api/tracking/:trackingNumber
router.get('/:trackingNumber', (req, res) => {
  try {
    const { trackingNumber } = req.params;
    const cleanNumber = trackingNumber.trim().toUpperCase();

    const shipment = db.findOne('shipments', s => s.tracking_number.toUpperCase() === cleanNumber);

    if (!shipment) {
      return res.status(404).json({ error: 'Aucun colis trouvé avec ce numéro de suivi' });
    }

    const senderCity = db.findById('cities', shipment.sender_city_id);
    const receiverCity = db.findById('cities', shipment.receiver_city_id);

    const history = db
      .find('tracking_history', th => Number(th.shipment_id) === Number(shipment.id))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const publicShipment = {
      tracking_number: shipment.tracking_number,
      status: shipment.status,
      package_type: shipment.package_type,
      sender_city: senderCity ? senderCity.name : 'France',
      receiver_city: receiverCity ? receiverCity.name : 'France',
      sender_name: shipment.sender_name,
      receiver_name: shipment.receiver_name,
      weight: shipment.weight,
      estimated_delivery: shipment.estimated_delivery,
      actual_delivery: shipment.actual_delivery,
      created_at: shipment.created_at
    };

    res.json({
      shipment: publicShipment,
      history
    });
  } catch (err) {
    console.error('Erreur suivi:', err);
    res.status(500).json({ error: 'Erreur serveur lors du suivi' });
  }
});

module.exports = router;
