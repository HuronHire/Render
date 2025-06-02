const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
class MemStorage {
  constructor() {
    this.inquiries = new Map();
    this.currentId = 1;
  }

  async createInquiry(insertInquiry) {
    const inquiry = {
      ...insertInquiry,
      id: this.currentId++,
      createdAt: new Date().toISOString(),
    };
    
    this.inquiries.set(inquiry.id, inquiry);
    return inquiry;
  }

  async getInquiries() {
    return Array.from(this.inquiries.values());
  }

  async getEquipmentCatalog() {
    return [
      {
        id: "esl-001",
        name: "JLG ES1932 Electric Scissor Lift",
        category: "electric-scissor-lifts",
        description: "Compact electric scissor lift perfect for indoor applications",
        specifications: "Working Height: 7.79m, Platform Height: 5.79m, Weight: 1,565kg",
        imageUrl: "/attached_assets/JLG ES1932.png"
      },
      {
        id: "rtsl-001", 
        name: "Genie GS-3369RT Rough Terrain Scissor Lift",
        category: "rough-terrain-scissor-lifts",
        description: "All-terrain scissor lift designed for outdoor construction sites",
        specifications: "Working Height: 11.75m, Platform Height: 9.75m, Weight: 4,990kg",
        imageUrl: "/attached_assets/genie-gs3369rt.jpeg"
      },
      {
        id: "bl-001",
        name: "JLG 450AJ Articulated Boom Lift", 
        category: "boom-lifts",
        description: "Articulated boom lift for precise positioning and reach",
        specifications: "Working Height: 15.72m, Horizontal Reach: 7.47m, Weight: 7,711kg",
        imageUrl: "/attached_assets/450aj-gallery-silo.webp"
      },
      {
        id: "pt-001",
        name: "Heavy Duty Plant Trailer",
        category: "plant-trailers", 
        description: "Robust plant trailer for transporting heavy equipment",
        specifications: "Capacity: 14 tonnes, Deck Length: 5.5m, Ramps included",
        imageUrl: "/attached_assets/531-70-Telehandler-14.jpg"
      }
    ];
  }
}

const storage = new MemStorage();

// Email function
async function sendEquipmentInquiryEmail(inquiry) {
  try {
    const emailContent = `
New Equipment Rental Inquiry from Huron Hire Website

Customer Details:
- Name: ${inquiry.firstName} ${inquiry.lastName}
- Email: ${inquiry.email}
- Phone: ${inquiry.phone}
- Company: ${inquiry.company || 'Not provided'}

Equipment Request:
- Equipment Type: ${inquiry.equipment}
- Start Date: ${inquiry.startDate}
- Finish Date: ${inquiry.finishDate}

Project Details:
${inquiry.projectDetails || 'No additional details provided'}

Please follow up with the customer at your earliest convenience.
    `;

    const emailData = {
      personalizations: [
        {
          to: [{ email: 'hire@huronhire.com.au' }]
        }
      ],
      from: { email: 'hire@huronhire.com.au' },
      subject: `New Equipment Rental Inquiry - ${inquiry.equipment}`,
      content: [
        {
          type: 'text/plain',
          value: emailContent
        },
        {
          type: 'text/html',
          value: emailContent.replace(/\n/g, '<br>')
        }
      ]
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(emailData)
    });

    if (response.ok) {
      console.log('Equipment inquiry email sent successfully');
      return true;
    } else {
      const errorText = await response.text();
      console.error('SendGrid API error:', response.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Routes
app.get('/api/equipment', async (req, res) => {
  try {
    const equipment = await storage.getEquipmentCatalog();
    res.json(equipment);
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

app.post('/api/inquiries', async (req, res) => {
  try {
    const inquiry = await storage.createInquiry(req.body);
    
    // Send email notification
    const emailSent = await sendEquipmentInquiryEmail(req.body);
    if (!emailSent) {
      console.error('Failed to send email notification for inquiry', inquiry.id);
    }
    
    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

app.get('/api/inquiries', async (req, res) => {
  try {
    const inquiries = await storage.getInquiries();
    res.json(inquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});