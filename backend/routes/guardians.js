const express = require('express');
const { Guardian, Address, PhoneNumber, BankInformation, sequelize } = require('../models');
const router = express.Router();

// GET all guardians
router.get('/', async (req, res) => {
  try {
    const guardians = await Guardian.findAll({
      include: [
        { model: Address, as: 'address' },
        { model: PhoneNumber, as: 'phoneNumbers' },
        { model: BankInformation, as: 'bankInformation' }
      ]
    });

    res.json({
      guardians,
      total: guardians.length
    });

  } catch (error) {
    console.error('Error fetching guardians:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET guardian by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const guardian = await Guardian.findByPk(id, {
      include: [
        { model: Address, as: 'address' },
        { model: PhoneNumber, as: 'phoneNumbers' },
        { model: BankInformation, as: 'bankInformation' }
      ]
    });

    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found' });
    }

    res.json({ guardian });

  } catch (error) {
    console.error('Error fetching guardian:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// CREATE new guardian
router.post('/', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { 
      full_name, relation_to_beneficiary, address_id,
      phone_numbers, bank_info
    } = req.body;

    // Validate required fields
    if (!full_name || !relation_to_beneficiary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create guardian
    const guardian = await Guardian.create({
      full_name,
      relation_to_beneficiary,
      address_id
    }, { transaction: t });

    // Create phone numbers if provided
    if (phone_numbers && phone_numbers.primary) {
      await PhoneNumber.create({
        entity_type: 'guardian',
        guardian_id: guardian.id,
        primary_phone: phone_numbers.primary,
        secondary_phone: phone_numbers.secondary || null,
        tertiary_phone: phone_numbers.tertiary || null
      }, { transaction: t });
    }

    // Create bank information if provided
    if (bank_info && (bank_info.bank_name || bank_info.account_number)) {
      await BankInformation.create({
        entity_type: 'guardian',
        guardian_id: guardian.id,
        bank_name: bank_info.bank_name,
        bank_account_number: bank_info.account_number,
        bank_book_photo_url: bank_info.document_url || null
      }, { transaction: t });
    }

    await t.commit();

    res.status(201).json({
      message: 'Guardian created successfully',
      guardian: {
        id: guardian.id,
        full_name: guardian.full_name,
        relation_to_beneficiary: guardian.relation_to_beneficiary
      }
    });

  } catch (error) {
    await t.rollback();
    console.error('Error creating guardian:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// UPDATE guardian
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const guardian = await Guardian.findByPk(id);
    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found' });
    }

    await guardian.update(updates);

    res.json({
      message: 'Guardian updated successfully',
      guardian
    });

  } catch (error) {
    console.error('Error updating guardian:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE guardian
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const guardian = await Guardian.findByPk(id);
    if (!guardian) {
      return res.status(404).json({ error: 'Guardian not found' });
    }

    await guardian.destroy();

    res.json({ message: 'Guardian deleted successfully' });

  } catch (error) {
    console.error('Error deleting guardian:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
