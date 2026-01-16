import express from 'express';
import User from '../models/User.js';
import VendorMessage from '../models/VendorMessage.js';
import Agent from '../models/Agents.js';
import Report from '../models/Report.js';
import ReportMessage from '../models/ReportMessage.js';
import { sendVendorContactEmail } from '../services/emailService.js';
import { verifyToken } from '../middleware/authorization.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiter: 5 messages per 15 minutes per IP
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many contact requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// POST /api/messages/contact-vendor - Submit new message from user
router.post('/contact-vendor', contactLimiter, async (req, res) => {
    try {
        const { agentId, vendorId, userName, userEmail, subject, message, userId, senderType } = req.body;

        // Validate required fields (agentId OR vendorId must be present)
        if ((!agentId && !vendorId) || !userName || !userEmail || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'Recipient (Agent or Vendor) and all fields are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email address'
            });
        }

        let recipientVendor;
        let finalAgentId = agentId;
        let finalAgentName = "General Inquiry";

        if (agentId) {
            // Fetch agent details
            const agent = await Agent.findById(agentId).populate('owner', 'name email');
            if (!agent) {
                return res.status(404).json({
                    success: false,
                    message: 'Agent not found'
                });
            }
            recipientVendor = agent.owner;
            finalAgentName = agent.agentName;
        } else if (vendorId) {
            // Fetch vendor details directly (likely Admin contacting Vendor)
            const User = (await import('../models/User.js')).default;
            recipientVendor = await User.findById(vendorId).select('name email');
        }

        if (!recipientVendor) {
            return res.status(404).json({
                success: false,
                message: 'Recipient vendor not found'
            });
        }

        // Create message record
        const vendorMessage = new VendorMessage({
            userId: userId || null,
            vendorId: recipientVendor._id,
            agentId: finalAgentId || null,
            userName: userName.trim(),
            userEmail: userEmail.trim().toLowerCase(),
            subject: subject.trim(),
            message: message.trim(),
            agentName: finalAgentName,
            vendorEmail: recipientVendor.email,
            status: 'New',
            senderType: senderType || 'User'
        });

        await vendorMessage.save();

        // --- NEW: Link to Vendor Admin Support (Signals) ---
        if (senderType === 'Admin') {
            try {
                // Check if there's already an open AdminSupport report for this vendor
                let report = await Report.findOne({
                    userId: recipientVendor._id,
                    type: 'AdminSupport',
                    status: 'open'
                }).sort({ createdAt: -1 }); // Get most recent

                if (!report) {
                    // No existing open report, create a new one
                    report = await Report.create({
                        userId: recipientVendor._id, // Recipient Vendor
                        type: 'AdminSupport',
                        priority: 'medium',
                        description: subject || 'Direct message from Admin',
                        status: 'open'
                    });
                    console.log(`[Support Link] Created NEW Report ${report._id} for Admin message to Vendor ${recipientVendor._id}`);
                } else {
                    console.log(`[Support Link] Using EXISTING Report ${report._id} for Admin message to Vendor ${recipientVendor._id}`);
                }

                // Add message to the report (new or existing)
                console.log(`[Support Link] Adding message to Report ${report._id}. SenderId: ${userId}, SenderRole: admin`);

                await ReportMessage.create({
                    reportId: report._id,
                    senderId: userId,
                    senderRole: 'admin',
                    message: message
                });

            } catch (supportErr) {
                console.error('[Support Link Error] Failed to create Admin Support message:', supportErr);
                // Don't fail the primary message save even if support link fails
            }
        }
        // --------------------------------------------------

        // Send email notification to vendor
        try {
            await sendVendorContactEmail({
                vendorEmail: recipientVendor.email,
                vendorName: recipientVendor.name,
                userName: userName,
                userEmail: userEmail,
                subject: subject,
                message: message,
                agentName: finalAgentName
            });
        } catch (emailErr) {
            console.error('Email notification failed:', emailErr);
            // Don't fail the request if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Your message has been sent to the vendor successfully',
            data: {
                messageId: vendorMessage._id
            }
        });

    } catch (error) {
        console.error('Contact vendor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.'
        });
    }
});

// POST /api/messages/send-to-user - Send message from Vendor to User (Chat Mode)
router.post('/send-to-user', verifyToken, async (req, res) => {
    console.log('[SEND-TO-USER] Request received');
    try {
        const { userId, message, agentId } = req.body;
        const vendorId = req.user.id; // Authenticated Vendor

        console.log('[SEND-TO-USER] Payload:', { userId, message, agentId, vendorId });

        if (!userId || !message) {
            console.log('[SEND-TO-USER] Missing required fields');
            return res.status(400).json({ success: false, message: 'User ID and Message are required' });
        }

        // Fetch User and Vendor details
        console.log('[SEND-TO-USER] Fetching User:', userId);
        const user = await User.findById(userId);
        if (!user) {
            console.log('[SEND-TO-USER] User not found for ID:', userId);
        }

        console.log('[SEND-TO-USER] Fetching Vendor:', vendorId);
        const vendor = await User.findById(vendorId); // Fetch vendor to get email
        if (!vendor) {
            console.log('[SEND-TO-USER] Vendor not found for ID:', vendorId);
        }

        const vendorMessage = new VendorMessage({
            userId,
            vendorId,
            agentId: agentId || null,
            message: message,
            senderType: 'Vendor',
            status: 'Replied', // Considered replied/active
            userEmail: user ? user.email : 'unknown@user.com', // Fallback for stability
            userName: user ? user.name : 'Unknown User',
            vendorEmail: vendor ? vendor.email : 'vendor@support.com', // Fallback
            subject: 'Support Message' // Required field
        });

        console.log('[SEND-TO-USER] Saving message...');
        await vendorMessage.save();
        console.log('[SEND-TO-USER] Message saved successfully');

        // --- NEW: Sync to ReportMessage if recipient is an Admin ---
        const adminEmail = process.env.ADMIN_EMAIL || 'aditilakhera0@gmail.com';
        const isRecipientAdmin = user && (user.role?.toLowerCase() === 'admin' || user.email === adminEmail);

        if (isRecipientAdmin) {
            try {
                // Find or Create an AdminSupport report for this vendor
                let report = await Report.findOne({
                    userId: vendorId,
                    type: 'AdminSupport',
                    status: 'open'
                }).sort({ createdAt: -1 });

                if (!report) {
                    report = await Report.create({
                        userId: vendorId,
                        type: 'AdminSupport',
                        priority: 'medium',
                        description: 'Direct Message from Vendor',
                        status: 'open'
                    });
                }

                await ReportMessage.create({
                    reportId: report._id,
                    senderId: vendorId,
                    senderRole: 'vendor',
                    message: message
                });
                console.log(`[Sync] Synced VendorMessage ${vendorMessage._id} to Report ${report._id} for Admin visibility`);
            } catch (syncErr) {
                console.error('[Sync Error] Failed to sync to ReportMessage:', syncErr);
            }
        }
        // -----------------------------------------------------------

        res.json({
            success: true,
            data: vendorMessage
        });

    } catch (error) {
        console.error('[SEND-TO-USER] Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
    }
});

// GET /api/messages/history - Fetch conversation history between user and vendor
router.get('/history', async (req, res) => {
    try {
        const { userId, vendorId, agentId } = req.query;

        if (!userId || !vendorId) {
            return res.status(400).json({
                success: false,
                message: 'UserId and VendorId are required'
            });
        }

        const query = { userId, vendorId };
        if (agentId) query.agentId = agentId;

        const messages = await VendorMessage.find(query)
            .sort({ createdAt: 1 }) // Chronological order for chat interface
            .lean();

        res.json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Fetch history error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch history'
        });
    }
});

// GET /api/messages/user/:userId - Fetch all messages for a specific user (User Inbox)
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const messages = await VendorMessage.find({ userId })
            .sort({ updatedAt: -1 })
            .lean();

        res.json({
            success: true,
            data: messages
        });

    } catch (error) {
        console.error('Fetch user messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// GET /api/messages/vendor/:vendorId - Fetch all messages for vendor
router.get('/vendor/:vendorId', async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { status, agentId, page = 1, limit = 50 } = req.query;

        // Build query
        const query = { vendorId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (agentId && agentId !== 'all') {
            query.agentId = agentId;
        }

        // Fetch messages with pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const messages = await VendorMessage.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await VendorMessage.countDocuments(query);

        res.json({
            success: true,
            data: {
                messages,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Fetch vendor messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch messages'
        });
    }
});

// PATCH /api/messages/:messageId/status - Update message status
router.patch('/:messageId/status', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { status } = req.body;

        if (!['New', 'Replied', 'Closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const message = await VendorMessage.findByIdAndUpdate(
            messageId,
            { status },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: message
        });

    } catch (error) {
        console.error('Update message status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update status'
        });
    }
});

// POST /api/messages/send-reply - Send reply from vendor to user
router.post('/send-reply', async (req, res) => {
    try {
        const { messageId, userEmail, userName, vendorName, agentName, originalSubject, originalMessage, replyMessage } = req.body;

        if (!userEmail || !replyMessage) {
            return res.status(400).json({
                success: false,
                message: 'User email and reply message are required'
            });
        }

        // Find original message
        const originalMsg = await VendorMessage.findById(messageId);

        let emailSent = false;

        // Try to send email, but don't block on failure
        try {
            if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
                const nodemailer = await import('nodemailer');
                const transporter = nodemailer.default.createTransport({
                    service: process.env.EMAIL_SERVICE || 'gmail',
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASSWORD
                    }
                });

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: userEmail,
                    subject: `RE: ${originalSubject}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
                                <h1 style="color: white; margin: 0;">AI-MALL</h1>
                                <p style="color: #f0f0f0; margin: 5px 0 0 0;">Vendor Response</p>
                            </div>
                            <div style="padding: 30px; background: #f9fafb;">
                                <h2 style="color: #1e293b; margin-top: 0;">Hello ${userName},</h2>
                                <p style="color: #475569; margin-bottom: 20px;">${vendorName} has responded to your inquiry about <strong>${agentName}</strong>.</p>
                                <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                    <h3 style="color: #1e293b; margin-top: 0;">Vendor's Response:</h3>
                                    <p style="color: #1e293b; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
                                </div>
                                <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                                    <p style="margin: 0; color: #3730a3; font-size: 14px;"><strong>Your Original Message:</strong></p>
                                    <p style="margin: 10px 0 0 0; color: #475569;">${originalMessage}</p>
                                </div>
                            </div>
                            <div style="background: #f1f5f9; padding: 15px; border-radius: 0 0 10px 10px; text-align: center; color: #64748b; font-size: 12px;">
                                <p style="margin: 0;">AI-MALL Platform</p>
                            </div>
                        </div>
                    `
                };

                await transporter.sendMail(mailOptions);
                emailSent = true;
            } else {
                console.warn("EMAIL_USER or EMAIL_PASSWORD missing. Skipping email send.");
            }
        } catch (emailError) {
            console.error("Failed to send email reply (non-fatal):", emailError);
            // Continue execution to update DB
        }

        // Update Status to Replied
        if (originalMsg) {
            originalMsg.status = 'Replied';
            originalMsg.replyMessage = replyMessage;
            originalMsg.repliedAt = new Date();
            await originalMsg.save();

            // Create In-App Notification for User
            if (originalMsg.userId) {
                try {
                    const Notification = (await import('../models/Notification.js')).default;
                    await Notification.create({
                        userId: originalMsg.userId,
                        message: `New Message: ${vendorName} replied regarding '${agentName}'.`,
                        type: 'info',
                        role: 'user',
                        targetId: messageId
                    });
                } catch (notifError) {
                    console.error("Failed to create notification:", notifError);
                }
            }
        }

        res.json({
            success: true,
            message: emailSent ? 'Reply sent successfully via email' : 'Reply saved successfully (Email skipped)',
            warning: !emailSent ? 'Email configuration missing or failed' : undefined
        });

    } catch (error) {
        console.error('Send reply fatal error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process reply'
        });
    }
});

// GET /api/messages/:id - Fetch single message details
router.get('/:id', async (req, res) => {
    try {
        const message = await VendorMessage.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ success: false, message: 'Message not found' });
        }
        res.json({ success: true, data: message });
    } catch (error) {
        console.error('Fetch message error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// DELETE /api/messages/:messageId - Delete message
router.delete('/:messageId', verifyToken, async (req, res) => {
    try {
        const { messageId } = req.params;
        const vendorId = req.user._id || req.user.id; // Use both possibilities

        if (!vendorId) {
            return res.status(401).json({ success: false, message: 'Vendor identity not found in token' });
        }

        // Ensure the message exists and belongs to this vendor
        const message = await VendorMessage.findOne({ _id: messageId, vendorId });

        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found or unauthorized'
            });
        }

        await VendorMessage.findByIdAndDelete(messageId);

        res.json({
            success: true,
            message: 'Message deleted successfully'
        });

    } catch (error) {
        console.error('Delete message error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete message'
        });
    }
});

export default router;
