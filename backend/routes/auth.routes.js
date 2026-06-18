const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authInviteController = require('../controllers/auth.invite.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users', authMiddleware, authController.getCompanyUsers);

// Password Management
router.post('/change-password', authMiddleware, authController.changePassword);
router.post('/reset-password', authMiddleware, checkPermission('employees', 'edit'), authController.resetPassword);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password-confirm', authController.resetPasswordConfirm);

// Invitation & Activation
router.get('/validate-invite', authInviteController.validateInvite);
router.post('/activate-account', authInviteController.activateAccount);
router.post('/request-new-invite', authInviteController.requestNewInvite);

module.exports = router;
