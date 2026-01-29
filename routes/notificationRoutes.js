import express from 'express';
import notificationModel from '../models/Notification.js';
import { verifyToken } from '../middleware/authorization.js';

const router = express.Router();

// Get user notifications
router.get('/', verifyToken, async (req, res) => {
    try {
        const query = { userId: req.user.id };
        if (req.query.role) {
            query.role = req.query.role;
        }

        // --- Lazy Check for Subscription Expiry (Trigger 4) ---
        try {
            const Transaction = (await import('../models/Transaction.js')).default;
            const activeSubs = await Transaction.find({ buyerId: req.user.id, status: 'Success' }).populate('agentId', 'agentName');

            const now = new Date();
            const twoDaysFromNow = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000));

            for (const sub of activeSubs) {
                if (!sub.agentId) continue;

                const purchaseDate = new Date(sub.createdAt);
                const expiryDate = new Date(purchaseDate.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days default

                // Check if expiring in next 48 hours AND not already expired (approximate)
                if (expiryDate > now && expiryDate <= twoDaysFromNow) {
                    // Check if already notified recently (in last 48h to avoid spam)
                    const alreadyNotified = await notificationModel.exists({
                        userId: req.user.id,
                        targetId: sub.agentId._id,
                        title: 'Subscription Expiring Soon',
                        createdAt: { $gt: new Date(now.getTime() - (48 * 60 * 60 * 1000)) }
                    });

                    if (!alreadyNotified) {
                        await notificationModel.create({
                            userId: req.user.id,
                            title: 'Subscription Expiring Soon',
                            message: `Reminder: Your subscription for '${sub.agentId.agentName}' expires in less than 2 days.`,
                            type: 'warning',
                            role: 'user',
                            targetId: sub.agentId._id
                        });
                    }
                }
            }
        } catch (checkErr) {
            console.error("Error in subscription check:", checkErr);
            // Non-blocking error
        }
        // -------------------------------------------------------

        const notifications = await notificationModel.find(query)
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
    try {
        await notificationModel.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete notification
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await notificationModel.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
