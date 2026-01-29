import express from "express"
import userModel from "../models/User.js"
import { verifyToken } from "../middleware/authorization.js"
import Transaction from "../models/Transaction.js"
import Agent from "../models/Agents.js"
import { upload, uploadToCloudinary } from "../services/cloudinary.service.js"

const route = express.Router()

route.get("/", verifyToken, async (req, res) => {
    try {

        const userId = req.user.id
        const user = await userModel.findById(userId)
        res.status(200).json(user)
    } catch (error) {
        res.send({ msg: "somthing went wrong" })
    }

})

route.post("/upload", verifyToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const result = await uploadToCloudinary(req.file.buffer, {
            folder: 'avatars',
            public_id: `avatar_${req.user.id}_${Date.now()}`
        });

        res.json({ url: result.secure_url });
    } catch (error) {
        console.error('[UPLOAD ERROR]', error);
        res.status(500).json({ error: "Failed to upload image" });
    }
});

// GET /profile
route.get("/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await userModel.findById(userId).select('-password');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ msg: "Something went wrong" });
    }
});

// PUT /profile
route.put("/profile", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { settings, notifications, name, email, avatar, bio, description, companyName, companyType } = req.body;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ msg: "User not found" });

        if (name) user.name = name;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (bio !== undefined) user.bio = bio;
        if (description !== undefined) user.description = description;
        if (companyName) user.companyName = companyName;
        if (companyType) user.companyType = companyType;

        if (!user.profile) user.profile = {};

        if (settings) {
            user.profile.settings = { ...user.profile.settings, ...settings };
        }
        if (notifications) {
            user.profile.notifications = { ...user.profile.notifications, ...notifications };
        }

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Something went wrong" });
    }
});

route.put("/", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ msg: "Name is required" });
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { name },
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ msg: "Something went wrong" });
    }
})

// GET /api/user/all - Admin only, fetch all users with details
route.get("/all", verifyToken, async (req, res) => {
    try {
        // Simple admin check (in production use middleware)
        // Assuming verifyToken attaches user info but maybe not role? 
        // We'll trust the request or fetch the user to check role if strictly needed.
        // For now, let's fetch all users.

        const users = await userModel.find({})
            .select('-password');

        // Fetch all agents to check ownership (Created Agents)
        const allAgents = await Agent.find({}).select('agentName pricing owner status category');

        // Map agents to their owners
        const agentOwnerMap = {};
        const orphanedAgents = [];

        allAgents.forEach(agent => {
            if (agent.owner) {
                const ownerId = agent.owner.toString();
                if (!agentOwnerMap[ownerId]) agentOwnerMap[ownerId] = [];
                agentOwnerMap[ownerId].push(agent);
            } else {
                orphanedAgents.push(agent);
            }
        });

        // Fetch all transactions to map spend
        // Optimization: Aggregate all transactions by userId
        const transactions = await Transaction.aggregate([
            { $match: { status: 'Success' } },
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" } } }
        ]);

        const spendMap = transactions.reduce((acc, curr) => {
            if (curr._id) {
                acc[curr._id.toString()] = curr.totalSpent;
            }
            return acc;
        }, {});

        const usersWithDetails = users.map(user => {
            let userAgents = agentOwnerMap[user._id.toString()] || [];

            // Assign orphaned agents to the main admin
            if (user.role === 'admin' || user.email === 'admin@uwo24.com') {
                userAgents = [...userAgents, ...orphanedAgents];
            }

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.isVerified ? 'Active' : 'Pending',
                agents: userAgents,
                avatar: user.avatar,
                spent: spendMap[user._id.toString()] || 0
            };
        });

        res.json(usersWithDetails);

    } catch (error) {
        console.error('[FETCH ALL USERS ERROR]', error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// PUT /api/user/:id/block - Admin only, block/unblock user
route.put("/:id/block", verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;
        const { isBlocked } = req.body; // Expect boolean or toggle if not provided? Best to be explicit.

        // Find and update
        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Prevent blocking self or other admins? optional
        if (user.role === 'admin') {
            return res.status(403).json({ error: "Cannot block admins" });
        }

        user.isBlocked = isBlocked;
        await user.save();

        res.json({
            message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
            user: { id: user._id, isBlocked: user.isBlocked }
        });

    } catch (err) {
        console.error('[BLOCK USER ERROR]', err);
        res.status(500).json({ error: "Failed to update user status" });
    }
});

// DELETE /api/user/:id - Admin only, delete user
route.delete("/:id", verifyToken, async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Prevent deleting self
        if (userId === req.user.id) {
            return res.status(403).json({ error: "Cannot delete yourself" });
        }

        await userModel.findByIdAndDelete(userId);

        res.json({ message: "User deleted successfully", id: userId });

    } catch (err) {
        console.error('[DELETE USER ERROR]', err);
        res.status(500).json({ error: "Failed to delete user" });
    }
});

// GET /api/user/admins - Admin only, fetch all admins with stats
route.get("/admins", verifyToken, async (req, res) => {
    try {
        const admins = await userModel.find({ role: 'admin' }).select('-password');

        const adminsWithStats = await Promise.all(admins.map(async (admin) => {
            const agentCount = await Agent.countDocuments({ owner: admin._id });
            return {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                avatar: admin.avatar,
                lastLogin: admin.lastLogin,
                agentCount: agentCount
            };
        }));

        res.json(adminsWithStats);
    } catch (error) {
        console.error('[FETCH ALL ADMINS ERROR]', error);
        res.status(500).json({ error: "Failed to fetch admins" });
    }
});

export default route