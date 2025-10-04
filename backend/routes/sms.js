const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// POST /api/sms/send - Send SMS to a single recipient
router.post('/send', async (req, res) => {
  try {
    const { text, msisdn } = req.body;

    // Validate input
    if (!text || !msisdn) {
      return res.status(400).json({ 
        error: 'Missing required fields: text and msisdn' 
      });
    }

    console.log(`📱 Sending SMS to ${msisdn}`);
    console.log(`📝 Message text:`, text);
    console.log(`📝 Message length:`, text.length);

    // Convert phone number to international format (2519XXXXXXXX)
    let formattedPhone = msisdn.replace(/[+\s]/g, ''); // Remove + and spaces
    
    // If starts with 0, replace with 251
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '251' + formattedPhone.substring(1);
    }
    // If doesn't start with 251, add it
    else if (!formattedPhone.startsWith('251')) {
      formattedPhone = '251' + formattedPhone;
    }
    
    console.log(`📞 Formatted phone: ${msisdn} → ${formattedPhone}`);

    // Forward request to SMS Ethiopia API
    const requestBody = {
      text,
      msisdn: formattedPhone
    };
    
    console.log(`📤 Sending to SMS API:`, requestBody);

    const response = await fetch('https://smsethiopia.et/api/sms/send', {
      method: 'POST',
      headers: {
        'KEY': 'LUK7VMHPHN24S4W8BZ0IDWLTCA22F4AD',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    console.log(`📡 SMS API Response status: ${response.status} ${response.statusText}`);
    
    const responseText = await response.text();
    console.log(`📡 SMS API Response body:`, responseText);
    
    if (response.ok) {
      console.log(`✅ SMS sent successfully to ${msisdn}`);
      res.json({ 
        success: true, 
        message: 'SMS sent successfully',
        response: responseText 
      });
    } else {
      console.error(`❌ SMS API error for ${msisdn}:`, responseText);
      res.status(response.status).json({ 
        success: false,
        error: 'SMS API error',
        details: responseText,
        apiStatus: response.status
      });
    }

  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// POST /api/sms/send-bulk - Send SMS to multiple recipients
router.post('/send-bulk', async (req, res) => {
  try {
    const { recipients, text } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        error: 'recipients must be a non-empty array' 
      });
    }

    if (!text) {
      return res.status(400).json({ 
        error: 'text is required' 
      });
    }

    console.log(`📱 Sending bulk SMS to ${recipients.length} recipients`);

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    for (const recipient of recipients) {
      try {
        const response = await fetch('https://smsethiopia.et/api/sms/send', {
          method: 'POST',
          headers: {
            'KEY': 'LUK7VMHPHN24S4W8BZ0IDWLTCA22F4AD',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            msisdn: recipient.phone
          })
        });

        if (response.ok) {
          successCount++;
          results.push({ 
            phone: recipient.phone, 
            name: recipient.name,
            success: true 
          });
          console.log(`✅ SMS sent to ${recipient.name}`);
        } else {
          errorCount++;
          const errorText = await response.text();
          results.push({ 
            phone: recipient.phone, 
            name: recipient.name,
            success: false, 
            error: errorText 
          });
          console.error(`❌ Failed to send to ${recipient.name}:`, errorText);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        errorCount++;
        results.push({ 
          phone: recipient.phone, 
          name: recipient.name,
          success: false, 
          error: error.message 
        });
        console.error(`❌ Error sending to ${recipient.name}:`, error.message);
      }
    }

    res.json({
      success: true,
      totalSent: successCount,
      totalFailed: errorCount,
      results
    });

  } catch (error) {
    console.error('❌ Error in bulk SMS:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: error.message 
    });
  }
});

module.exports = router;
