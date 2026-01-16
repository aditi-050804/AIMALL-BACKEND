import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import { verifyToken } from '../middleware/authorization.js';
import { sendVendorApprovalEmail, sendVendorRejectionEmail } from '../services/emailService.js';

const router = express.Router();

// Email configuration
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }
    return null;
};

// POST /api/vendor/register - Vendor Registration
router.post('/register', async (req, res) => {
    try {
        const { vendorName, companyName, companyType, email, password } = req.body;

        // Validation
        if (!vendorName || !companyName || !companyType || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create vendor user
        const vendor = new User({
            name: vendorName,
            email: email.toLowerCase(),
            password: hashedPassword,
            isVendor: true,
            vendorStatus: 'pending',
            companyName,
            companyType,
            vendorRegisteredAt: new Date(),
            role: 'vendor'
        });

        await vendor.save();

        // Send email to admin
        const transporter = createTransporter();
        if (transporter) {
            try {
                const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: adminEmail,
                    subject: `New Vendor Registration - ${vendorName}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #8b5cf6;">New Vendor Registration</h2>
                            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <p><strong>Vendor Name:</strong> ${vendorName}</p>
                                <p><strong>Company:</strong> ${companyName}</p>
                                <p><strong>Type:</strong> ${companyType}</p>
                                <p><strong>Email:</strong> ${email}</p>
                                <p><strong>Registered:</strong> ${new Date().toLocaleString()}</p>
                            </div>
                            <p>Please review and approve this vendor from your Admin Panel.</p>
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/vendor-approvals" 
                               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 10px;">
                                Review Vendor
                            </a>
                        </div>
                    `
                });
                console.log(`✅ Vendor registration email sent to admin for ${vendorName}`);
            } catch (emailError) {
                console.error('Failed to send registration email (non-fatal):', emailError);
            }
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Your application is pending admin approval.',
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                vendorStatus: vendor.vendorStatus
            }
        });

    } catch (error) {
        console.error('Vendor registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// POST /api/vendor/login - Vendor Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find vendor
        const vendor = await User.findOne({
            email: email.toLowerCase(),
            isVendor: true
        });

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor account not found. Please register first.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, vendor.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check vendor status
        if (vendor.vendorStatus === 'pending') {
            return res.status(403).json({
                success: false,
                message: 'Your vendor registration is under admin review. Please wait for approval.',
                vendorStatus: 'pending'
            });
        }

        if (vendor.vendorStatus === 'rejected') {
            return res.status(403).json({
                success: false,
                message: 'Your vendor application was rejected.',
                vendorStatus: 'rejected',
                rejectionReason: vendor.rejectionReason
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: vendor._id,
                email: vendor.email,
                isVendor: true,
                vendorStatus: vendor.vendorStatus
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                isVendor: true,
                vendorStatus: vendor.vendorStatus,
                companyName: vendor.companyName,
                companyType: vendor.companyType
            }
        });

    } catch (error) {
        console.error('Vendor login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed. Please try again.'
        });
    }
});

// GET /api/vendor/status/:email - Check Vendor Status
router.get('/status/:email', async (req, res) => {
    try {
        const vendor = await User.findOne({
            email: req.params.email.toLowerCase(),
            isVendor: true
        }).select('vendorStatus rejectionReason');

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        res.json({
            success: true,
            vendorStatus: vendor.vendorStatus,
            rejectionReason: vendor.rejectionReason
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status'
        });
    }
});

// GET /api/vendor/admin/pending - Get Pending Vendors (Admin Only)
router.get('/admin/pending', verifyToken, async (req, res) => {
    try {
        // Check if user is admin (Role based OR specific email override)
        const isAdminUser = req.user.role === 'admin' || req.user.email === 'aditilakhera0@gmail.com';

        if (!isAdminUser) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const pendingVendors = await User.find({
            isVendor: true,
            vendorStatus: 'pending'
        })
            .select('name email companyName companyType vendorRegisteredAt')
            .sort({ vendorRegisteredAt: -1 });

        res.json({
            success: true,
            vendors: pendingVendors,
            count: pendingVendors.length
        });

    } catch (error) {
        console.error('Fetch pending vendors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        });
    }
});

// GET /api/vendor/admin/all - Get All Vendors (Admin Only)
router.get('/admin/all', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin' && req.user.email !== 'aditilakhera0@gmail.com') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { status } = req.query;
        let query = { isVendor: true };
        console.log(`[VENDOR DEBUG] Fetching vendors for ${req.user.email}. Query status: ${status}`);

        if (status && status !== 'all') {
            query.vendorStatus = status;
        }

        const vendors = await User.find(query)
            .select('name email companyName companyType vendorStatus vendorRegisteredAt vendorApprovedAt vendorRejectedAt rejectionReason bio description avatar')
            .sort({ vendorRegisteredAt: -1 });

        console.log(`[VENDOR DEBUG] Found ${vendors.length} vendors with isVendor: true`);
        res.json({
            success: true,
            vendors,
            count: vendors.length
        });

    } catch (error) {
        console.error('Fetch vendors error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vendors'
        });
    }
});

// PATCH /api/vendor/admin/approve/:id - Approve Vendor (Admin Only)
router.patch('/admin/approve/:id', verifyToken, async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'aditilakhera0@gmail.com';
        if (req.user.role?.toLowerCase() !== 'admin' && req.user.email !== adminEmail) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const vendor = await User.findById(req.params.id);

        if (!vendor || !vendor.isVendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Update vendor status
        vendor.vendorStatus = 'approved';
        vendor.vendorApprovedAt = new Date();
        await vendor.save();

        // Send approval email
        try {
            await sendVendorApprovalEmail(vendor);
        } catch (emailError) {
            console.error('Failed to send approval email (non-fatal):', emailError);
        }

        res.json({
            success: true,
            message: 'Vendor approved successfully',
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                vendorStatus: vendor.vendorStatus
            }
        });

    } catch (error) {
        console.error('Approve vendor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve vendor'
        });
    }
});

// PATCH /api/vendor/admin/reject/:id - Reject Vendor (Admin Only)
router.patch('/admin/reject/:id', verifyToken, async (req, res) => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'aditilakhera0@gmail.com';
        if (req.user.role?.toLowerCase() !== 'admin' && req.user.email !== adminEmail) {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

        const { reason } = req.body;

        if (!reason || reason.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason is required'
            });
        }

        const vendor = await User.findById(req.params.id);

        if (!vendor || !vendor.isVendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found'
            });
        }

        // Update vendor status
        vendor.vendorStatus = 'rejected';
        vendor.vendorRejectedAt = new Date();
        vendor.rejectionReason = reason;
        await vendor.save();

        // Send rejection email
        try {
            await sendVendorRejectionEmail(vendor, reason);
        } catch (emailError) {
            console.error('Failed to send rejection email (non-fatal):', emailError);
        }

        res.json({
            success: true,
            message: 'Vendor rejected',
            vendor: {
                id: vendor._id,
                name: vendor.name,
                email: vendor.email,
                vendorStatus: vendor.vendorStatus,
                rejectionReason: vendor.rejectionReason
            }
        });

    } catch (error) {
        console.error('Reject vendor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject vendor'
        });
    }
});

export default router;
