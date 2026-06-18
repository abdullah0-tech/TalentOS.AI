const prisma = require('../config/db');

exports.getNotifications = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const notifications = await prisma.notification.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to latest 50 notifications
    });

    res.status(200).json(notifications);
  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({ error: 'An error occurred while fetching notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (id === 'all') {
      // Mark all as read for the company
      await prisma.notification.updateMany({
        where: { companyId, isRead: false },
        data: { isRead: true }
      });
      return res.status(200).json({ message: 'All notifications marked as read.' });
    }

    // Verify notification belongs to company
    const notification = await prisma.notification.findFirst({
      where: { id, companyId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found.' });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({ message: 'Notification marked as read.' });
  } catch (error) {
    console.error('Mark Notification Read Error:', error);
    res.status(500).json({ error: 'An error occurred while updating the notification status.' });
  }
};
